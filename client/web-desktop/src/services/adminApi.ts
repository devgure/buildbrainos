import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'

const api = axios.create({ baseURL })

// in-memory access token (do not persist in localStorage)
let accessToken: string | null = null

export async function initAuth() {
	// attempt silent refresh on app start — relies on httpOnly cookie `bb_refresh`
	try {
		const r = await api.post('/auth/refresh')
		accessToken = r.data?.accessToken || null
		if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
		scheduleRefreshFromToken(accessToken)
	} catch (e) {
		accessToken = null
		delete api.defaults.headers.common['Authorization']
	}
}

// attach token from in-memory variable; on 401 try a single refresh and replay
let isRefreshing = false
let failedQueue: Array<{resolve: (v:any)=>void, reject: (e:any)=>void, config:any}> = []

function processQueue(error:any, token: string|null = null) {
	failedQueue.forEach(p => {
		if (error) p.reject(error)
		else {
			p.config.headers = p.config.headers || {}
			if (token) p.config.headers['Authorization'] = `Bearer ${token}`
			p.resolve(p.config)
		}
	})
	failedQueue = []
}

api.interceptors.request.use((config) => {
	if (accessToken) {
		config.headers = config.headers || {}
		config.headers['Authorization'] = `Bearer ${accessToken}`
	}
	return config
}, (err) => Promise.reject(err))

api.interceptors.response.use((r) => r, async (err) => {
	const originalRequest = err.config
	if (err.response && err.response.status === 401 && !originalRequest._retry) {
		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject, config: originalRequest })
			}).then((cfg:any) => api.request(cfg))
		}
		originalRequest._retry = true
		isRefreshing = true
		try {
			const r = await api.post('/auth/refresh')
			accessToken = r.data?.accessToken || null
			if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
				scheduleRefreshFromToken(accessToken)
			processQueue(null, accessToken)
			return api.request(originalRequest)
		} catch (e) {
			processQueue(e, null)
			accessToken = null
			delete api.defaults.headers.common['Authorization']
			throw e
		} finally { isRefreshing = false }
	}
	throw err
})

export function setAuthToken(token?: string) {
	// keep API in-memory; call with no args to clear
	accessToken = token || null
	if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
	else delete api.defaults.headers.common['Authorization']
}

function parseJwt(token?: string | null) {
	if (!token) return null
	try {
		const parts = token.split('.')
		if (parts.length < 2) return null
		const payload = parts[1]
		const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
		return decoded
	} catch (e) {
		return null
	}
}

let refreshTimer: any = null
function scheduleRefreshFromToken(token?: string | null) {
	if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
	const payload = parseJwt(token)
	if (!payload || !payload.exp) return
	const now = Date.now()
	const expiresAt = payload.exp * 1000
	// estimate TTL using iat if present, else fallback to expiresAt - now
	const ttlMs = payload.iat ? (payload.exp - payload.iat) * 1000 : Math.max(expiresAt - now, 60_000)
	// choose refresh window: 15% of TTL, bounded between 30s and 5min
	const refreshBefore = Math.min(Math.max(Math.floor(ttlMs * 0.15), 30_000), 5 * 60 * 1000)
	// add jitter +/-10% of refreshBefore
	const jitter = Math.floor((Math.random() * 2 - 1) * 0.1 * refreshBefore)
	const targetMsBefore = refreshBefore + jitter
	const msUntil = expiresAt - now - targetMsBefore
	if (msUntil <= 0) {
		// immediate refresh
		api.post('/auth/refresh').then(r => {
			accessToken = r.data?.accessToken || null
			if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
			scheduleRefreshFromToken(accessToken)
		}).catch(()=>{})
	} else {
		refreshTimer = setTimeout(() => {
			api.post('/auth/refresh').then(r => {
				accessToken = r.data?.accessToken || null
				if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
				scheduleRefreshFromToken(accessToken)
			}).catch(()=>{})
		}, msUntil)
	}
}

export default api
