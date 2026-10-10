import { sql } from '@vercel/postgres';

// Auto-initialize Postgres database tables if they do not exist
async function initTables() {
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
  } catch (err) {
    console.warn('Database table initialization note:', err.message);
  }
}

export default async function handler(req, res) {
  // Set CORS headers for security and flexibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure DB tables are ready
  await initTables();

  const { action } = req.query;

  try {
    // 1. REGISTER
    if (req.method === 'POST' && action === 'register') {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'പേര്, ഇമെയിൽ, പാസ്‌വേഡ് എന്നിവ നൽകുക (Missing required fields).' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Check if user already exists
      const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1;`;
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'ഈ ഇമെയിലിൽ ഇതിനകം ഒരു അക്കൗണ്ട് നിലവിലുണ്ട് (Email already registered).' });
      }

      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      
      await sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${userId}, ${cleanName}, ${cleanEmail}, ${password}, 'free');
      `;

      const user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: 'free',
        created_at: new Date().toISOString()
      };

      return res.status(200).json({ success: true, user, message: 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു (Account created successfully)!' });
    }

    // 2. LOGIN
    if (req.method === 'POST' && action === 'login') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'ഇമെയിലും പാസ്‌വേഡും നൽകുക (Email and password required).' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const result = await sql`
        SELECT id, name, email, role, promo_code, created_at 
        FROM users 
        WHERE email = ${cleanEmail} AND password = ${password} 
        LIMIT 1;
      `;

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ് (Invalid email or password).' });
      }

      const user = result.rows[0];
      return res.status(200).json({ success: true, user });
    }

    // 3. REDEEM PROMO CODE
    if (req.method === 'POST' && action === 'redeem-promo') {
      const { userId, promoCode } = req.body || {};
      if (!userId || !promoCode) {
        return res.status(400).json({ success: false, message: 'User ID and Promo Code required.' });
      }

      const validCodes = ['KERALAB2VIP', 'TELC2026', 'NURSEGERMANY', 'FREEB2'];
      const cleanCode = promoCode.trim().toUpperCase();

      if (!validCodes.includes(cleanCode)) {
        return res.status(400).json({ success: false, message: 'അസാധുവായ പ്രൊമോ കോഡ് (Invalid Promo Code). Try code: KERALAB2VIP' });
      }

      await sql`
        UPDATE users 
        SET role = 'premium', promo_code = ${cleanCode} 
        WHERE id = ${userId};
      `;

      const updated = await sql`SELECT id, name, email, role, promo_code FROM users WHERE id = ${userId} LIMIT 1;`;
      const user = updated.rows[0] || { id: userId, role: 'premium' };

      return res.status(200).json({
        success: true,
        user,
        message: '🎉 അഭിനന്ദനങ്ങൾ! പ്രീമിയം ആക്സസ് വിജയകരമായി അൺലോക്ക് ചെയ്തു! (Premium Plan Unlocked Successfully!)'
      });
    }

    // 4. GET CURRENT USER
    if (req.method === 'GET' && action === 'me') {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID required' });
      }

      const result = await sql`SELECT id, name, email, role, promo_code, created_at FROM users WHERE id = ${userId} LIMIT 1;`;
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({ success: true, user: result.rows[0] });
    }

    return res.status(400).json({ success: false, message: 'Invalid action requested' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
}
