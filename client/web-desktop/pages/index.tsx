import React from 'react'
import api from '../src/services/adminApi'
import Link from 'next/link'
import Header from '../src/components/Header'

export default function Home() {
  const [status, setStatus] = React.useState('');
  const [bids, setBids] = React.useState<Array<any>>([])

  React.useEffect(() => {
    api.get('/gateway/health').then(() => setStatus('Ready')).catch(() => setStatus('API unreachable'))
    api.get('/market/bids').then(r => setBids(r.data)).catch(() => setBids([]))
  }, [])

  return (
    <div style={{padding:20}}>
      <Header />
      <p>Status: {status}</p>
      <section style={{marginTop:20}}>
        <h2>Marketplace Bids</h2>
        {bids.length === 0 ? (
          <p>No bids found.</p>
        ) : (
          <ul>
            {bids.map(b => (
              <li key={b.id}>
                <strong>{b.title}</strong> — {b.budget ?? 'N/A'} — <em>{b.source ?? 'manual'}</em>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
