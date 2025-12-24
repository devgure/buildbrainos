import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:4002';

const loginLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });
const signupLimiter = rateLimit({ windowMs: 60_000, max: 5 });

app.get('/health', (_req, res) => res.json({status: 'ok', service: 'auth-service'}));

async function getUserByEmail(email: string) {
  const res = await axios.get(`${USER_SERVICE_URL}/users/by-email`, { params: { email } })
  return res.data
}

async function getUserById(id: string) {
  const res = await axios.get(`${USER_SERVICE_URL}/users/${id}`)
  return res.data
}

async function replaceUserRefreshTokens(id:string, tokens:any[]) {
  await axios.post(`${USER_SERVICE_URL}/users/${id}/refreshTokens`, { refreshTokens: tokens })
}

async function incrementFailed(id:string) {
  try { const r = await axios.post(`${USER_SERVICE_URL}/users/${id}/failed`); return r.data.failedAttempts } catch(e){return null}
}

async function setLockout(id:string, until:Date|null) {
  await axios.post(`${USER_SERVICE_URL}/users/${id}/lockout`, { until: until ? until.toISOString() : null })
}

app.post('/login', loginLimiter, async (req, res) => {
  const {email, password} = req.body || {};
  if (!email || !password) return res.status(400).json({error: 'email and password required'});
  try {
    const user = await getUserByEmail(email)
    if (!user) return res.status(401).json({error: 'invalid credentials'})
    // check lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) return res.status(423).json({error: 'account locked'})
    const ok = require('bcryptjs').compareSync(password, user.passwordHash || '')
    if (!ok) {
      const failed = await incrementFailed(user.id)
      if (failed && failed >= 5) {
        // lock for 15 minutes
        await setLockout(user.id, new Date(Date.now() + 15 * 60 * 1000))
      }
      return res.status(401).json({error: 'invalid credentials'})
    }
    // successful login: reset failed attempts
    try { await axios.post(`${USER_SERVICE_URL}/users/${user.id}/resetFailed`) } catch(e){}

    const accessToken = jwt.sign({sub: user.id, email: user.email, role: user.role}, JWT_SECRET, {expiresIn: '15m'});
    // create refresh token with encoded user id
    const refreshId = uuidv4()
    const refreshToken = `${user.id}:${refreshId}`
    const existing = user.refreshTokens || []
    const updatedTokens = [...existing, refreshToken]
    await replaceUserRefreshTokens(user.id, updatedTokens)
    // set httpOnly cookie
    res.cookie('bb_refresh', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30*24*60*60*1000 })
    const safeUser = { ...user }
    delete (safeUser as any).passwordHash
    res.json({ accessToken, user: safeUser });
  } catch (e:any) {
    res.status(500).json({error: e?.response?.data || e.message || 'internal error'})
  }
});

export function verifyToken(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({error: 'missing auth'});
  const [, token] = auth.split(' ');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e:any) {
    res.status(401).json({error: 'invalid token'});
  }
}

// rotate refresh token (cookie)
app.post('/refresh', async (req, res) => {
  try {
    const cookie = req.cookies && req.cookies.bb_refresh
    if (!cookie) return res.status(400).json({ error: 'missing refresh token' })
    const parts = cookie.split(':')
    if (parts.length < 2) return res.status(400).json({error: 'invalid token'})
    const userId = parts[0]
    const user = await getUserById(userId)
    if (!user) return res.status(401).json({error: 'invalid token'})
    // verify refresh token server-side (user-service will compare hashes)
    try {
      await axios.post(`${USER_SERVICE_URL}/users/${userId}/verifyRefresh`, { token: cookie })
    } catch (err) { return res.status(401).json({ error: 'invalid token' }) }
    // rotate server-side: replace old with new
    const newId = uuidv4()
    const newRefresh = `${userId}:${newId}`
    try {
      await axios.post(`${USER_SERVICE_URL}/users/${userId}/rotateRefresh`, { oldToken: cookie, newToken: newRefresh })
    } catch (err) { return res.status(500).json({ error: 'rotation failed' }) }
    res.cookie('bb_refresh', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30*24*60*60*1000 })
    const accessToken = jwt.sign({sub: user.id, email: user.email, role: user.role}, JWT_SECRET, {expiresIn: '15m'});
    res.json({ accessToken })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// signup endpoint - creates user in user-service
app.post('/signup', signupLimiter, async (req, res) => {
  const { name, email, password, role } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email & password required' })
  try {
    const r = await axios.post(`${USER_SERVICE_URL}/users`, { name, email, password, role })
    const user = r.data
    const safe = { ...user }
    delete (safe as any).passwordHash
    res.status(201).json(safe)
  } catch (e:any) { res.status(500).json({ error: e?.response?.data || e.message }) }
})

if (require.main === module) {
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => console.log(`Auth service running on ${PORT}`));
}

export default app;
