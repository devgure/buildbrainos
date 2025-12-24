import React from 'react'
import api, { setAuthToken } from '../src/services/adminApi'
import { useRouter } from 'next/router'
import Header from '../src/components/Header'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string|undefined>()

  function validEmail(e:string) {
    return /\S+@\S+\.\S+/.test(e)
  }

  async function submit(e:any) {
    e.preventDefault()
    setError(undefined)
    if (!validEmail(email)) return setError('Please enter a valid email')
    if (!password || password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const token = res.data?.token
      if (token) {
        setAuthToken(token)
        router.push('/')
      } else {
        setError('Login failed')
      }
    } catch (err:any) {
      setError(err?.response?.data?.error || 'login error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <Header />
      <h1>Admin Login</h1>
      <form onSubmit={submit}>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
        <div style={{marginTop:10}}>
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
