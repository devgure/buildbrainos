import { Router } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcryptjs'

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

// create user (admin/signup)
router.post('/', async (req, res) => {
  const { name, email, companyId, role, password } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const data: any = { name: name || '', email, companyId, role };
    if (password) {
      const hash = bcrypt.hashSync(password, 10)
      data.passwordHash = hash
    }
    const user = await prisma.user.create({ data });
    const safe = { ...user }
    delete (safe as any).passwordHash
    res.status(201).json(safe);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/by-email', async (req, res) => {
  const email = req.query.email as string
  if (!email) return res.status(400).json({ error: 'email required' })
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'not found' })
    const safe = { ...user } as any
    // return passwordHash for internal auth usage; do not expose refresh token hashes
    delete safe.refreshTokens
    res.json(safe)
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// set/rotate refresh tokens (replace full array)
router.post('/:id/refreshTokens', async (req, res) => {
  const id = req.params.id
  const { refreshTokens } = req.body || {}
  try {
    // store only hashes of refresh tokens and cap number stored
    const maxStore = 5
    const hashes = Array.isArray(refreshTokens) ? refreshTokens.map((t:any) => bcrypt.hashSync(String(t), 10)) : []
    const capped = hashes.slice(-maxStore)
    await prisma.user.update({ where: { id }, data: { refreshTokens: capped } })
    res.json({ ok: true })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// verify a raw refresh token against stored hashes
router.post('/:id/verifyRefresh', async (req, res) => {
  const id = req.params.id
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token required' })
  try {
    const u = await prisma.user.findUnique({ where: { id } })
    if (!u) return res.status(404).json({ error: 'not found' })
    const hashes = (u as any).refreshTokens || []
    const found = hashes.some((h:string) => bcrypt.compareSync(String(token), h))
    if (!found) return res.status(401).json({ ok: false })
    res.json({ ok: true })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// rotate a refresh token: replace old raw token with new raw token (hash stored)
router.post('/:id/rotateRefresh', async (req, res) => {
  const id = req.params.id
  const { oldToken, newToken } = req.body || {}
  if (!oldToken) return res.status(400).json({ error: 'oldToken required' })
  try {
    const u = await prisma.user.findUnique({ where: { id } })
    if (!u) return res.status(404).json({ error: 'not found' })
    const hashes = (u as any).refreshTokens || []
    const keep = [] as string[]
    let replaced = false
    for (const h of hashes) {
      if (!replaced && bcrypt.compareSync(String(oldToken), h)) { replaced = true; continue }
      keep.push(h)
    }
    if (!replaced) return res.status(401).json({ error: 'invalid token' })
    if (newToken) {
      keep.push(bcrypt.hashSync(String(newToken), 10))
    }
    // cap stored tokens
    const capped = keep.slice(-5)
    await prisma.user.update({ where: { id }, data: { refreshTokens: capped } })
    res.json({ ok: true })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// remove a refresh token
router.post('/:id/removeRefresh', async (req, res) => {
  const id = req.params.id
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token required' })
  try {
    const u = await prisma.user.findUnique({ where: { id } })
    if (!u) return res.status(404).json({ error: 'not found' })
    const hashes = (u as any).refreshTokens || []
    const remaining = hashes.filter((h:string) => !bcrypt.compareSync(String(token), h))
    await prisma.user.update({ where: { id }, data: { refreshTokens: remaining.slice(-5) } })
    res.json({ ok: true })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// increment failed attempts
router.post('/:id/failed', async (req, res) => {
  const id = req.params.id
  try {
    const u = await prisma.user.findUnique({ where: { id } })
    if (!u) return res.status(404).json({ error: 'not found' })
    const failed = (u as any).failedAttempts || 0
    const updated = await prisma.user.update({ where: { id }, data: { failedAttempts: failed + 1 } })
    res.json({ ok: true, failedAttempts: updated.failedAttempts })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// reset failed attempts
router.post('/:id/resetFailed', async (req, res) => {
  const id = req.params.id
  try {
    await prisma.user.update({ where: { id }, data: { failedAttempts: 0, lockoutUntil: null } })
    res.json({ ok: true })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

// set lockoutUntil (timestamp ISO string expected)
router.post('/:id/lockout', async (req, res) => {
  const id = req.params.id
  const { until } = req.body || {}
  try {
    const untilDate = until ? new Date(until) : null
    await prisma.user.update({ where: { id }, data: { lockoutUntil: untilDate } })
    res.json({ ok: true })
  } catch (e:any) { res.status(500).json({ error: e.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    const u = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!u) return res.status(404).json({ error: 'not found' });
    const safe = { ...u } as any
    delete safe.passwordHash
    delete safe.refreshTokens
    res.json(safe);
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
