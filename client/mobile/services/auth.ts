import axios from 'axios'

const api = axios.create({ baseURL: process.env.API_URL || 'http://localhost:3000/api', withCredentials: true })

let accessToken: string | null = null
let refreshTimer: any = null

function parseJwt(token?: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return decoded
  } catch (e) { return null }
}

export async function initAuth() {
  try {
    const r = await api.post('/auth/refresh')
    accessToken = r.data?.accessToken || null
    if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    scheduleRefreshFromToken(accessToken)
  } catch (e) { accessToken = null }
}

function scheduleRefreshFromToken(token?: string | null) {
  if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return
  const now = Date.now()
  const expiresAt = payload.exp * 1000
  const ttlMs = payload.iat ? (payload.exp - payload.iat) * 1000 : Math.max(expiresAt - now, 60_000)
  const refreshBefore = Math.min(Math.max(Math.floor(ttlMs * 0.15), 30_000), 5 * 60 * 1000)
  const jitter = Math.floor((Math.random() * 2 - 1) * 0.1 * refreshBefore)
  const targetMsBefore = refreshBefore + jitter
  const msUntil = expiresAt - now - targetMsBefore
  if (msUntil <= 0) {
    api.post('/auth/refresh').then(r => { accessToken = r.data?.accessToken || null; if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; scheduleRefreshFromToken(accessToken) }).catch(()=>{})
  } else {
    refreshTimer = setTimeout(() => { api.post('/auth/refresh').then(r => { accessToken = r.data?.accessToken || null; if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; scheduleRefreshFromToken(accessToken) }).catch(()=>{}) }, msUntil)
  }
}

export default api
