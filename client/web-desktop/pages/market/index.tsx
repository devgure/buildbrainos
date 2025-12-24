import React from 'react'
import api from '../../src/services/adminApi'
import Link from 'next/link'

export default function MarketIndex() {
  const [bids, setBids] = React.useState<Array<any>>([])

  React.useEffect(() => {
    api.get('/market/bids').then(r => setBids(r.data)).catch(() => setBids([]))
  }, [])

  return (
    <div style={{padding:20}}>
      <h1>Marketplace</h1>
      <p><Link href="/market/create">Create Bid</Link></p>
      {bids.length === 0 ? (
        <p>No bids</p>
      ) : (
        <ul>
          {bids.map(b => (
            <li key={b.id}><Link href={`/market/${b.id}`}>{b.title} — {b.budget ?? 'N/A'}</Link></li>
          ))}
        </ul>
      )}
    </div>
  )
}
