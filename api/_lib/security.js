import crypto from 'node:crypto';

const SECRET = process.env.AUTH_SECRET;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function sign(payloadB64) {
  return crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}

export function requireSecret() {
  if (!SECRET || SECRET.length < 32) {
    throw new Error('AUTH_SECRET env var must be set (at least 32 characters).');
  }
}

export function issueToken(userId) {
  requireSecret();
  const payload = b64(JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }));
  return `${payload}.${sign(payload)}`;
}

// Returns the user id from "Authorization: Bearer <token>", or null.
export function userIdFromRequest(req) {
  try {
    requireSecret();
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.uid || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Promo codes live in the PROMO_CODES env var (comma separated), never in source code.
export function isValidPromo(code) {
  const list = (process.env.PROMO_CODES || '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  const clean = String(code || '').trim().toUpperCase();
  return list.some((c) => safeEqual(c, clean));
}

// Best-effort limiter (per warm serverless instance). Use Vercel Firewall rate limits for real protection.
const hits = new Map();
export function tooManyAttempts(key, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export const clientIp = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
