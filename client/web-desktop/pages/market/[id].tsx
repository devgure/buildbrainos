import React from 'react'
import { useRouter } from 'next/router'
import api from '../../src/services/adminApi'

export default function BidDetail() {
  const router = useRouter()
  const { id } = router.query
  const [bid, setBid] = React.useState<any>(null)

  React.useEffect(() => {
    if (!id) return
    api.get(`/market/bids/${id}`).then(r => setBid(r.data)).catch(() => setBid(null))
  }, [id])

  if (!bid) return <div style={{padding:20}}>Loading...</div>

  return (
    <div style={{padding:20}}>
      <h1>{bid.title}</h1>
      <p>Budget: {bid.budget ?? 'N/A'}</p>
      <p>Source: {bid.source ?? 'manual'}</p>
    </div>
  )
}
