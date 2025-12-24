const request = require('supertest')
const app = require('../src/main')
jest.mock('axios')
const axios = require('axios')

describe('auth-service httpOnly refresh cookie', () => {
  beforeEach(() => jest.resetAllMocks())

  test('login sets httpOnly cookie and returns access token', async () => {
    const user = { id: 'u1', email: 'a@b.com', role: 'admin', passwordHash: '$2a$10$abcdefghijklmnopqrstuv' }
    // getUserByEmail
    axios.get.mockResolvedValueOnce({ data: user })
    // resetFailed (called after successful login)
    axios.post.mockResolvedValueOnce({ data: {} })
    // replaceUserRefreshTokens
    axios.post.mockResolvedValueOnce({ data: {} })
    const res = await request(app).post('/login').send({ email: 'a@b.com', password: 'pass' })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
    const cookies = res.header['set-cookie'] || []
    expect(cookies.some(c => c.startsWith('bb_refresh='))).toBe(true)
  })

  test('refresh rotates token and returns new access token', async () => {
    // mock user with existing refresh token
    const old = 'u1:oldid'
    const user = { id: 'u1', email: 'a@b.com', role: 'admin' }
    // getUserById
    axios.get.mockResolvedValueOnce({ data: user })
    // verifyRefresh
    axios.post.mockResolvedValueOnce({ data: { ok: true } })
    // rotateRefresh
    axios.post.mockResolvedValueOnce({ data: { ok: true } })
    const res = await request(app).post('/refresh').set('Cookie', [`bb_refresh=${old}`]).send()
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
    const cookies = res.header['set-cookie'] || []
    expect(cookies.some(c => c.startsWith('bb_refresh='))).toBe(true)
  })
})
