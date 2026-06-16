import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function enter() {
    setLoading(true)
    if (mode === 'goddess') {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'goddess')
        .eq('username', code.trim())
        .single()

      if (data) {
        onLogin({ role: 'goddess', name: `Goddess ${data.username}` })
      } else {
        alert('Access denied: Verification code incorrect.')
      }
    } else if (mode === 'subject') {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'subject')
        .eq('username', 'Rob')
        .single()

      if (data) {
        onLogin({ role: 'subject', name: data.username })
      } else {
        alert('Subject record not found.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>👑 Enter the Realm</h1>
      {!mode && (
        <>
          <button onClick={() => setMode('goddess')}>I am Goddess Cindy</button>
          <button onClick={() => setMode('subject')}>I am Subject</button>
        </>
      )}
      {mode === 'goddess' && (
        <>
          <h2>Goddess Verification</h2>
          <input
            placeholder="Enter Code"
            value={code}
            disabled={loading}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={enter} disabled={loading}>
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </>
      )}
      {mode === 'subject' && (
        <>
          <h2>Subject Access</h2>
          <button onClick={enter} disabled={loading}>
            {loading ? 'Opening Gates...' : 'Enter Realm'}
          </button>
        </>
      )}
    </div>
  )
}
