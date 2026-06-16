import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'

const IDEA_BANK = [
  { 
    cat: "I. Royal Posture & Physical Submission", 
    tasks: [
      "Kneel unmoving at the center of the room for 20 minutes straight.", 
      "Maintain a strict upright kneeling profile with hands behind back until dismissed.", 
      "Log 15 minutes of posture endurance tracking while focusing on absolute stillness.",
      "Kneel quietly at the edge of the room for 30 minutes reflecting on your duties.",
      "Execute an extended postural duty block during her evening relaxation hours.",
      "Maintain a full kneeling profile flat on the floor for 45 consecutive minutes.",
      "Assume a submissive kneeling stance immediately upon her entering the space.",
      "Kneel upright with eyes cast downward, maintaining complete stillness until authorized.",
      "Execute a 30-minute posture endurance run with arms extended horizontally.",
      "Maintain rigid postural compliance while executing assigned domestic routines."
    ] 
  },
  { 
    cat: "II. Silence, Gag & Restriction Protocols", 
    tasks: [
      "Secure the gag tightly and log a 20-minute session of silent submission.", 
      "Complete 30 minutes of gag tolerance training while working on household chores.", 
      "Maintain strict verbal lockout until she explicitly authorizes you to speak.",
      "Log a 45-minute restriction run keeping a complete record of your mental state.",
      "Endure an evening under sensory or verbal restriction as dictated by the realm.",
      "Secure the gag for 40 consecutive minutes while processing administrative data."
    ] 
  },
  { 
    cat: "III. Chastity & Long-Term Denial Matrix", 
    tasks: [
      "Lock down immediately and log a fresh 48-hour denial extension.", 
      "Submit a formal verification report documenting your consecutive days denied.", 
      "Acknowledge her absolute, unmitigated control over your physical release timeline.",
      "Surrender all personal boundary controls for the entirety of the weekend.",
      "Log a strict hands-off check-in precisely every 12 hours without exception."
    ] 
  },
  { 
    cat: "IV. Domestic Service & Obedience Training", 
    tasks: [
      "Complete 30 minutes of domestic chores while maintaining a restricted posture.", 
      "Write out 50 lines reinforcing your absolute dedication to her realm.",
      "Prepare a refreshment or task fulfillment exactly to her specifications.",
      "Log a service execution report highlighting tasks completed under her name.",
      "Acknowledge your role as her obedient assistant with a formal validation entry."
    ] 
  }
];

export default function App() {
  const [user, setUser] = useState(null)
  const [instructions, setInstructions] = useState([])
  const [history, setHistory] = useState([])
  const [milestones, setMilestones] = useState([])

  const [activityType, setActivityType] = useState('Kneeling Session')
  const [duration, setDuration] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [milestoneType, setMilestoneType] = useState('Subject Orgasm')
  const [milestoneNotes, setMilestoneNotes] = useState('')
  
  // State for her free-form text entry box
  const [customText, setCustomText] = useState('')

  useEffect(() => {
    if (user) {
      fetchData()
      const channel = supabase.channel('cindy-master-stream')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [user])

  async function fetchData() {
    const { data: inst } = await supabase.from('decrees').select('*').order('id', { ascending: false })
    const { data: hist } = await supabase.from('cindy_training_history').select('*').order('id', { ascending: false })
    const { data: mile } = await supabase.from('cindy_milestones').select('*').order('id', { ascending: false })
    if (inst) setInstructions(inst)
    if (hist) setHistory(hist)
    if (mile) setMilestones(mile)
  }

  async function handleAddInstruction(text) {
    if (!text.trim()) return
    await supabase.from('decrees').insert([{ content: text.trim() }])
  }

  async function handleCustomSubmit(e) {
    e.preventDefault()
    if (!customText.trim()) return
    await handleAddInstruction(customText)
    setCustomText('')
    alert('Custom command broadcasted!')
  }

  async function handleLogTraining(e) {
    e.preventDefault()
    if (!duration) return
    await supabase.from('cindy_training_history').insert([{ activity_type: activityType, duration_minutes: parseInt(duration), notes: logNotes }])
    setDuration(''); setLogNotes('')
  }

  async function handleLogMilestone(e) {
    e.preventDefault()
    if (!milestoneNotes) return
    await supabase.from('cindy_milestones').insert([{ record_type: milestoneType, notes: milestoneNotes }])
    setMilestoneNotes('')
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#0d0614', color: '#ded3f0', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d4af37', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ color: '#d4af37', margin: 0, fontSize: '1.8rem' }}>
          {user.role === 'goddess' ? '👑 QUEENSPACE CONTROL // GODDESS CINDY' : '🛡️ DATA COLLECTION HUB // SUBJECT TERMINAL'}
        </h1>
        <button onClick={() => setUser(null)} style={{ backgroundColor: '#a63a50', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}>Disconnect</button>
      </header>

      {/* SUBJECT PORTAL */}
      {user.role === 'subject' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ color: '#ad82f7', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>⚡ Ingestion Node</h2>
            <form onSubmit={handleLogTraining} style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #2d1a42' }}>
              <h3 style={{ marginTop: 0, color: '#fff' }}>Log Training Metrics</h3>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px' }}>
                <option value="Kneeling Session">Kneeling Duration Log</option>
                <option value="Gag Session">Gag Tolerance Log</option>
                <option value="Postural Duty">Strict Postural Duty</option>
              </select>
              <input type="number" required placeholder="Duration (Minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px', boxSizing: 'border-box' }} />
              <textarea placeholder="Log response metrics, state of focus, or feedback..." value={logNotes} onChange={(e) => setLogNotes(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#7442c2', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Commit Stats to Ledger</button>
            </form>

            <form onSubmit={handleLogMilestone} style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #2d1a42' }}>
              <h3 style={{ marginTop: 0, color: '#fff' }}>Log Status & Milestones</h3>
              <select value={milestoneType} onChange={(e) => setMilestoneType(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px' }}>
                <option value="Subject Orgasm">Orgasm Tracker (Last Reset)</option>
                <option value="Denial Cycle Update">Denial Cycle Tracking Note</option>
              </select>
              <textarea required placeholder="Input dates, restriction lengths, or timeline details..." value={milestoneNotes} onChange={(e) => setMilestoneNotes(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#e2a468', color: '#11091c', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Transmit Metric Update</button>
            </form>
          </div>

          <div>
            <h2 style={{ color: '#d4af37', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>📜 Running Assignment Feed (Newest Top)</h2>
            <div style={{ backgroundColor: '#11091c', border: '1px solid #361954', padding: '20px', borderRadius: '8px', maxHeight: '680px', overflowY: 'auto' }}>
              {instructions.length === 0 ? <p style={{ color: '#666' }}>No directives found in the rolling vault.</p> : 
                instructions.map((i, index) => (
                  <div key={i.id} style={{ borderBottom: '1px solid #28153d', padding: '12px 0', opacity: index === 0 ? 1 : 0.6 }}>
                    {index === 0 && <span style={{ color: '#d4af37', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🔥 ACTIVE MANDATE:</span>}
                    <span style={{ color: index === 0 ? '#fff' : '#b5a6cc', fontSize: index === 0 ? '1.2rem' : '1rem', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                      "{i.content}"
                    </span>
                    <br/><small style={{ color: '#8870a6' }}>Logged at {new Date(i.issued_at).toLocaleDateString()} {new Date(i.issued_at).toLocaleTimeString()}</small>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* GODDESS PORTAL */}
      {user.role === 'goddess' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
          <div>
            {/* RESTORED: Custom Directive Entry Box */}
            <div style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #d4af37', marginBottom: '20px' }}>
              <h2 style={{ color: '#d4af37', marginTop: 0, fontSize: '1.3rem' }}>✍️ Issue Custom Directive</h2>
              <form onSubmit={handleCustomSubmit}>
                <textarea 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type an original order, chore, or dynamic rule here..."
                  style={{ width: '100%', height: '70px', padding: '10px', backgroundColor: '#0d0614', color: '#fff', border: '1px solid #56338c', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'monospace' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#d4af37', color: '#0d0614', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' }}>
                  ⚡ Broadcast Custom Order
                </button>
              </form>
            </div>

            <h2 style={{ color: '#d4af37', borderBottom: '1px solid #361954', paddingBottom: '5px', marginTop: 0 }}>💡 Quick Command Deck</h2>
            <div style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #2d1a42', height: '400px', overflowY: 'auto' }}>
              {IDEA_BANK.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '25px' }}>
                  <h3 style={{ color: '#d4af37', borderBottom: '1px solid #56338c', paddingBottom: '6px', marginTop: 0 }}>{section.cat}</h3>
                  {section.tasks.map((task, tIdx) => (
                    <button key={tIdx} onClick={() => {
                      handleAddInstruction(task)
                      alert('Command broadcasted!')
                    }} style={{ display: 'block', width: '100%', textAlign: 'left', backgroundColor: '#11091c', border: '1px solid #56338c', color: '#e5dcf5', padding: '12px', marginBottom: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      ⚡ {task}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ color: '#ad82f7', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>📜 Live Vault Auditing</h2>
            <div style={{ backgroundColor: '#11091c', border: '1px solid #2d1a42', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxHeight: '320px', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, color: '#ad82f7' }}>Subject Training Reports</h3>
              {history.length === 0 ? <p style={{ color: '#666' }}>No entries logged yet.</p> : 
                history.map(h => (
                  <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #28153d' }}>
                    <span style={{ color: '#fff' }}>⏳ {h.activity_type}</span>: <strong>{h.duration_minutes} mins</strong>
                    <br/><small style={{ color: '#bfa3eb' }}>Metrics: {h.notes || 'None attached.'}</small>
                  </div>
                ))
              }
            </div>

            <div style={{ backgroundColor: '#11091c', border: '1px solid #2d1a42', padding: '15px', borderRadius: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, color: '#e2a468' }}>Milestones Ledger</h3>
              {milestones.length === 0 ? <p style={{ color: '#666' }}>No milestones recorded.</p> : 
                milestones.map(m => (
                  <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid #28153d' }}>
                    <span style={{ color: '#fff' }}>👑 {m.record_type}</span>
                    <br/><small style={{ color: '#e2a468' }}>Details: {m.notes}</small>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
