import React from 'react'
import api from '../src/services/adminApi'
import { useRouter } from 'next/router'
import Header from '../src/components/Header'

export default function Signup() {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string|undefined>()

  async function submit(e:any) {
    e.preventDefault()
    setError(undefined)
    if (!/\S+@\S+/.test(email)) return setError('Invalid email')
    if (password.length < 8) return setError('Password must be >= 8 chars')
    setLoading(true)
    try {
      const r = await api.post('/auth/signup', { name, email, password })
      router.push('/login')
    } catch (err:any) {
      setError(err?.response?.data?.error || 'signup error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <Header />
      <h1>Sign Up</h1>
      <form onSubmit={submit}>
        <div><label>Name</label><br/><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label>Email</label><br/><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><label>Password</label><br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {error && <div style={{color:'red'}}>{error}</div>}
        <div style={{marginTop:10}}><button disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</button></div>
      </form>
    </div>
  )
}
