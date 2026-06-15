import { useState } from 'react'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState(null)
  const [code, setCode] = useState('')

  const GODDESS_CODE = 'cindy'

  function enter() {
    if (mode === 'goddess' && code.toLowerCase() === GODDESS_CODE) {
      onLogin({ role: 'goddess', name: 'Goddess Cindy' })
    } else if (mode === 'subject') {
      onLogin({ role: 'subject', name: 'Rob' })
    } else {
      alert('Incorrect entry')
    }
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
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={enter}>Enter</button>
        </>
      )}

      {mode === 'subject' && (
        <>
          <h2>Subject Access</h2>
          <button onClick={enter}>Enter Realm</button>
        </>
      )}
    </div>
  )
}
