import React from 'react'
import { setAuthToken } from '../services/adminApi'

function parseJwt(token?: string) {
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

export default function Header() {
  const [user, setUser] = React.useState<any|null>(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const token = window.localStorage.getItem('bb_token')
    if (!token) return setUser(null)
    const payload = parseJwt(token)
    if (!payload) return setUser(null)
    // expiry check (exp is seconds since epoch)
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      setAuthToken()
      setUser(null)
      return
    }
    setUser({id: payload.sub, email: payload.email, role: payload.role})
  }, [])

  function logout() {
    setAuthToken()
    setUser(null)
    if (typeof window !== 'undefined') window.location.href = '/login'
  }

  return (
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <h1>BuildBrain — Admin</h1>
      <nav>
        {user ? (
          <span>
            <strong style={{marginRight:8}}>{user.email || 'admin'}</strong>
            <button onClick={logout}>Logout</button>
          </span>
        ) : (
          <a href="/login">Login</a>
        )}
      </nav>
    </header>
  )
}
