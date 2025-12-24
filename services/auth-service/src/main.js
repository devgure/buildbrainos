const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const SECRET = process.env.AUTH_SECRET || 'dev_secret';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:4002'

const loginLimiter = rateLimit({ windowMs: 60_000, max: 10 })
const signupLimiter = rateLimit({ windowMs: 60_000, max: 5 })

app.get('/health', (req, res) => res.json({status: 'ok', service: 'auth-service'}));

async function getUserByEmail(email) { const r = await axios.get(`${USER_SERVICE_URL}/users/by-email`, { params: { email } }); return r.data }
async function getUserById(id) { const r = await axios.get(`${USER_SERVICE_URL}/users/${id}`); return r.data }
async function replaceUserRefreshTokens(id, tokens) { await axios.post(`${USER_SERVICE_URL}/users/${id}/refreshTokens`, { refreshTokens: tokens }) }
async function incrementFailed(id) { try { const r = await axios.post(`${USER_SERVICE_URL}/users/${id}/failed`); return r.data.failedAttempts } catch(e){return null} }
async function setLockout(id, until) { await axios.post(`${USER_SERVICE_URL}/users/${id}/lockout`, { until: until ? until.toISOString() : null }) }

app.post('/login', loginLimiter, async (req, res) => {
  const {email, password} = req.body || {}
  if (!email || !password) return res.status(400).json({error: 'email and password required'})
  try {
    const user = await getUserByEmail(email)
    if (!user) return res.status(401).json({error: 'invalid credentials'})
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) return res.status(423).json({error: 'account locked'})
    const ok = require('bcryptjs').compareSync(password, user.passwordHash || '')
    if (!ok) {
      const failed = await incrementFailed(user.id)
      if (failed && failed >= 5) { await setLockout(user.id, new Date(Date.now() + 15*60*1000)) }
      return res.status(401).json({error: 'invalid credentials'})
    }
    try { await axios.post(`${USER_SERVICE_URL}/users/${user.id}/resetFailed`) } catch(e){}
    const accessToken = jwt.sign({sub: user.id, email: user.email, role: user.role}, SECRET, {expiresIn: '15m'})
    const refreshId = uuidv4()
    const refreshToken = `${user.id}:${refreshId}`
    const existing = user.refreshTokens || []
    const updatedTokens = [...existing, refreshToken]
    await replaceUserRefreshTokens(user.id, updatedTokens)
    // set httpOnly cookie for refresh token
    res.cookie('bb_refresh', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30*24*60*60*1000 })
    const safeUser = Object.assign({}, user)
    delete safeUser.passwordHash
    return res.json({ accessToken, user: safeUser })
  } catch (e) { return res.status(500).json({error: e?.response?.data || e.message || 'internal error'}) }
})

// rotate refresh token from cookie
app.post('/refresh', async (req, res) => {
  try {
    const cookie = req.cookies && req.cookies.bb_refresh
    if (!cookie) return res.status(400).json({ error: 'missing refresh token' })
    const parts = cookie.split(':')
    if (parts.length < 2) return res.status(400).json({error: 'invalid token'})
    const userId = parts[0]
    const user = await getUserById(userId)
    if (!user) return res.status(401).json({error: 'invalid token'})
    // verify refresh token server-side
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
    const accessToken = jwt.sign({sub: user.id, email: user.email, role: user.role}, SECRET, {expiresIn: '15m'})
    res.json({ accessToken })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// logout - clear cookie and remove refresh token server-side
app.post('/logout', async (req, res) => {
  try {
    const cookie = req.cookies && req.cookies.bb_refresh
    if (cookie) {
      const parts = cookie.split(':')
      if (parts.length >= 2) {
        const userId = parts[0]
        try {
          await axios.post(`${USER_SERVICE_URL}/users/${userId}/removeRefresh`, { token: cookie })
        } catch(e){}
      }
    }
    res.clearCookie('bb_refresh')
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/me', (req, res) => {
  const auth = req.headers['authorization']
  if (!auth) return res.status(401).json({error: 'missing auth'})
  const token = auth.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, SECRET)
    res.json({ok: true, payload})
  } catch (err) {
    res.status(401).json({ok: false})
  }
})

if (require.main === module) {
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => console.log(`Auth service running on ${PORT}`));
}

module.exports = app;
