import { useState, useEffect } from 'react'
import Login from './Login'
import { supabase } from './supabaseClient'

export default function App() {
  const [user, setUser] = useState(null)
  const [decree, setDecree] = useState('Loading royal decrees...')
  const [newDecree, setNewDecree] = useState('')
  const [loading, setLoading] = useState(false)

  // Stream decrees from the database in real-time
  useEffect(() => {
    // 1. Fetch the latest decree immediately on load
    fetchLatestDecree()

    // 2. Set up a live subscription. Whenever the database changes, update the screen instantly!
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'decrees' },
        (payload) => {
          setDecree(payload.new.content)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchLatestDecree() {
    const { data } = await supabase
      .from('decrees')
      .select('content')
      .order('id', { ascending: false })
      .limit(1)
    
    if (data && data.length > 0) {
      setDecree(data[0].content)
    }
  }

  async function postDecree(e) {
    e.preventDefault()
    if (!newDecree.trim()) return
    setLoading(true)

    const { error } = await supabase
      .from('decrees')
      .insert([{ content: newDecree.trim() }])

    if (!error) {
      setNewDecree('')
    } else {
      alert('Failed to transmit decree to the realm.')
    }
    setLoading(false)
  }

  // If not logged in, show the gatehouse screen
  if (!user) {
    return <Login onLogin={setUser} />
  }

  // 👑 GODDESS INTERFACE
  if (user.role === 'goddess') {
    return (
      <div style={{ padding: 30, maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#2a1b3d', color: '#a4b3b6', borderRadius: 12, marginTop: 40, boxShadow: '0px 0px 20px rgba(212,175,55,0.3)' }}>
        <h1 style={{ color: '#d4af37' }}>👑 Goddess Control Center</h1>
        <p>Welcome back, Your Highness. Your realm awaits your commands.</p>
        <hr style={{ borderColor: '#d4af37', margin: '20px 0' }} />
        
        <div style={{ backgroundColor: '#44318d', padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>Active Decree Displayed to Subject:</h3>
          <p style={{ fontSize: '1.2rem', italic: 'true', color: '#e8a87c' }}>"{decree}"</p>
        </div>

        <form onSubmit={postDecree}>
          <h3 style={{ color: '#fff' }}>Issue a New Royal Decree</h3>
          <textarea
            style={{ width: '100%', height: 80, padding: 10, borderRadius: 6, border: '1px solid #d4af37', boxSizing: 'border-box', marginBottom: 10, fontSize: '1rem' }}
            placeholder="Type a chore, a rule, or an order..."
            value={newDecree}
            onChange={(e) => setNewDecree(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#d4af37', color: '#2a1b3d', border: 'none', padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', borderRadius: 6, cursor: 'pointer', width: '100%' }}
          >
            {loading ? 'Transmitting...' : '⚡ Broadcast Decree'}
          </button>
        </form>
      </div>
    )
  }

  // 🛡️ SUBJECT INTERFACE
  return (
    <div style={{ padding: 30, maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#1a1a1a', color: '#e0e0e0', borderRadius: 12, marginTop: 40, border: '2px solid #444' }}>
      <h1>🛡️ Subject Terminal</h1>
      <p>Logged in as: <strong>{user.name}</strong></p>
      <hr style={{ borderColor: '#444', margin: '20px 0' }} />

      <div style={{ backgroundColor: '#2b2b2b', padding: 25, borderRadius: 8, borderLeft: '5px solid #d4af37' }}>
        <h2 style={{ color: '#d4af37', marginTop: 0 }}>⚠️ Current Decree from Goddess Cindy:</h2>
        <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>
          "{decree}"
        </p>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 30 }}>
        This terminal updates automatically the exact second her Highness changes her mind. Keep this screen open.
      </p>
    </div>
  )
}
