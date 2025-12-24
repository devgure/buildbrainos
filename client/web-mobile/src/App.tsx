import React from 'react'
import api, { initAuth as initMobileAuth } from './services/auth'

export default function App() {
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    // initialize silent auth refresh
    initMobileAuth()
    api.get('/gateway/health').then(() => setMessage('Ready')).catch(() => setMessage('API unreachable'))
  }, [])

  return (
    <div style={{padding:20}}>
      <h1>BuildBrain — Web Mobile</h1>
      <p>{message}</p>
    </div>
  )
}
