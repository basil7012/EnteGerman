import { sql } from '@vercel/postgres';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { issueToken, userIdFromRequest, isValidPromo, safeEqual, tooManyAttempts, clientIp } from './_lib/security.js';

// Auto-initialize Postgres database tables if they do not exist
let tablesReady = false;
async function initTables() {
  if (tablesReady) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'free',
        promo_code VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS exam_history (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exam_part VARCHAR(50) NOT NULL,
        task_title VARCHAR(255) NOT NULL,
        score_total INT NOT NULL,
        rubric_aufgabe INT,
        rubric_ausdruck INT,
        rubric_grammatik INT,
        rubric_fluency INT,
        is_themaverfehlung BOOLEAN DEFAULT FALSE,
        student_transcript TEXT,
        examiner_comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    tablesReady = true;
  } catch (err) {
    console.warn('Database table initialization note:', err.message);
  }
}

export default async function handler(req, res) {
  // Same-origin only: no CORS headers are sent, so other websites cannot call this API from a browser.
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Ensure DB tables are ready
  await initTables();

  const { action } = req.query;

  try {
    const ip = clientIp(req);

    // 1. REGISTER
    if (req.method === 'POST' && action === 'register') {
      if (tooManyAttempts('reg:' + ip, 10)) {
        return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
      }
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'പേര്, ഇമെയിൽ, പാസ്‌വേഡ് എന്നിവ നൽകുക (Missing required fields).' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanName = String(name).trim().slice(0, 100);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      }
      if (String(password).length < 8 || String(password).length > 200) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1;`;
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'ഈ ഇമെയിലിൽ ഇതിനകം ഒരു അക്കൗണ്ട് നിലവിലുണ്ട് (Email already registered).' });
      }

      const userId = 'usr_' + crypto.randomUUID();
      const hash = await bcrypt.hash(String(password), 10);

      await sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${userId}, ${cleanName}, ${cleanEmail}, ${hash}, 'free');
      `;

      const user = { id: userId, name: cleanName, email: cleanEmail, role: 'free', created_at: new Date().toISOString() };
      return res.status(200).json({ success: true, user, token: issueToken(userId), message: 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു (Account created successfully)!' });
    }

    // 2. LOGIN
    if (req.method === 'POST' && action === 'login') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'ഇമെയിലും പാസ്‌വേഡും നൽകുക (Email and password required).' });
      }
      const cleanEmail = String(email).trim().toLowerCase();
      if (tooManyAttempts('login:' + ip + ':' + cleanEmail)) {
        return res.status(429).json({ success: false, message: 'Too many login attempts. Please try again in a few minutes.' });
      }

      const result = await sql`
        SELECT id, name, email, role, promo_code, created_at, password
        FROM users WHERE email = ${cleanEmail} LIMIT 1;
      `;
      const row = result.rows[0];
      const invalid = () => res.status(401).json({ success: false, message: 'ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ് (Invalid email or password).' });
      if (!row) return invalid();

      let ok = false;
      if (String(row.password).startsWith('$2')) {
        ok = await bcrypt.compare(String(password), row.password);
      } else if (safeEqual(row.password, password)) {
        // Legacy plain-text password: accept once, then upgrade it to a bcrypt hash.
        ok = true;
        const upgraded = await bcrypt.hash(String(password), 10);
        await sql`UPDATE users SET password = ${upgraded} WHERE id = ${row.id};`;
      }
      if (!ok) return invalid();

      const { password: _omit, ...user } = row;
      return res.status(200).json({ success: true, user, token: issueToken(user.id) });
    }

    // Everything below needs a valid session token.
    const userId = userIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in again.' });
    }

    // 3. REDEEM PROMO CODE (user comes from the token, never from the request body)
    if (req.method === 'POST' && action === 'redeem-promo') {
      if (tooManyAttempts('promo:' + userId, 10)) {
        return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
      }
      const { promoCode } = req.body || {};
      if (!promoCode || !isValidPromo(promoCode)) {
        return res.status(400).json({ success: false, message: 'അസാധുവായ പ്രൊമോ കോഡ് (Invalid Promo Code).' });
      }
      const cleanCode = String(promoCode).trim().toUpperCase();

      await sql`UPDATE users SET role = 'premium', promo_code = ${cleanCode} WHERE id = ${userId};`;
      const updated = await sql`SELECT id, name, email, role, promo_code, created_at FROM users WHERE id = ${userId} LIMIT 1;`;
      return res.status(200).json({
        success: true,
        user: updated.rows[0],
        message: 'അഭിനന്ദനങ്ങൾ! പ്രീമിയം ആക്സസ് വിജയകരമായി അൺലോക്ക് ചെയ്തു! (Premium Plan Unlocked Successfully!)'
      });
    }

    // 4. GET CURRENT USER
    if (req.method === 'GET' && action === 'me') {
      const result = await sql`SELECT id, name, email, role, promo_code, created_at FROM users WHERE id = ${userId} LIMIT 1;`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, user: result.rows[0] });
    }

    return res.status(400).json({ success: false, message: 'Invalid action requested' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
}
