import React from 'react'
import api from '../../src/services/adminApi'
import { useRouter } from 'next/router'

export default function CreateBid() {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [budget, setBudget] = React.useState('')

  async function submit(e:any) {
    e.preventDefault()
    try {
      await api.post('/market/bids', { title, budget: budget ? parseInt(budget,10) : null })
      router.push('/market')
    } catch (err) {
      alert('failed to create')
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Create Bid</h1>
      <form onSubmit={submit}>
        <div>
          <label>Title</label><br/>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <label>Budget</label><br/>
          <input value={budget} onChange={e=>setBudget(e.target.value)} />
        </div>
        <div style={{marginTop:10}}>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  )
}
