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
      "Kneel quietly at the edge of the room for 30 minutes reflecting on your duties."
    ] 
  },
  { 
    cat: "II. Silence, Gag & Restriction Protocols", 
    tasks: [
      "Secure the gag tightly and log a 20-minute session of silent submission.", 
      "Complete 30 minutes of gag tolerance training while working on household chores.", 
      "Maintain strict verbal lockout until she explicitly authorizes you to speak."
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
  
  const [customText, setCustomText] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
      
      // Real-time synchronization stream: listens for changes and pushes instantly
      const channel = supabase.channel('cindy-master-stream')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'decrees' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cindy_training_history' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cindy_milestones' }, () => fetchData())
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

  async function handleAddInstruction(text, url = null) {
    await supabase.from('decrees').insert([{ content: text.trim(), media_url: url }])
  }

  async function handleCustomSubmit(e) {
    e.preventDefault()
    if (!customText.trim()) return
    await handleAddInstruction(customText)
    setCustomText('')
  }

  // Image upload pipeline to bucket storage
  async function handleImageUpload(e) {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('realm-media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('realm-media')
        .getPublicUrl(filePath)

      await handleAddInstruction(user.role === 'goddess' ? "Sent an image dispatch." : "Submitted a visual verification report.", data.publicUrl)
      alert('Photo synced to ledger stream successfully!')
    } catch (error) {
      alert('Media sync issue: ' + error.message)
    } finally {
      setUploading(false)
    }
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
        <h1 style={{ color: '#d4af37', margin: 0, fontSize: '1.4rem' }}>
          {user.role === 'goddess' ? '👑 QUEENSPACE CONTROL // CINDY' : '🛡️ DATA COLLECTION // TERMINAL'}
        </h1>
        <button onClick={() => setUser(null)} style={{ backgroundColor: '#a63a50', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Disconnect</button>
      </header>

      {/* SUBJECT INTERFACE */}
      {user.role === 'subject' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ color: '#ad82f7', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>⚡ Ingestion Node</h2>
            
            {/* Visual Task Submission Form */}
            <div style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #42256b', marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0, color: '#fff' }}>📸 Sync Verification Photo</h3>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ color: '#fff' }} />
              {uploading && <p style={{ color: '#d4af37', margin: '5px 0 0 0' }}>Streaming attachment to vault...</p>}
            </div>

            <form onSubmit={handleLogTraining} style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #2d1a42' }}>
              <h3 style={{ marginTop: 0, color: '#fff' }}>Log Training Metrics</h3>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px' }}>
                <option value="Kneeling Session">Kneeling Duration Log</option>
                <option value="Gag Session">Gag Tolerance Log</option>
                <option value="Postural Duty">Strict Postural Duty</option>
              </select>
              <input type="number" required placeholder="Duration (Minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px', boxSizing: 'border-box' }} />
              <textarea placeholder="Log response metrics, state of focus..." value={logNotes} onChange={(e) => setLogNotes(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#7442c2', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Commit Stats to Ledger</button>
            </form>

            <form onSubmit={handleLogMilestone} style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #2d1a42' }}>
              <h3 style={{ marginTop: 0, color: '#fff' }}>Log Status & Milestones</h3>
              <select value={milestoneType} onChange={(e) => setMilestoneType(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px' }}>
                <option value="Subject Orgasm">Orgasm Tracker (Last Reset)</option>
                <option value="Denial Cycle Update">Denial Cycle Tracking Note</option>
              </select>
              <textarea required placeholder="Input dates, restriction lengths..." value={milestoneNotes} onChange={(e) => setMilestoneNotes(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#11091c', color: '#fff', border: '1px solid #56338c', marginBottom: '15px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#e2a468', color: '#11091c', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Transmit Metric Update</button>
            </form>
          </div>

          <div>
            <h2 style={{ color: '#d4af37', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>📜 Running Assignment Feed</h2>
            <div style={{ backgroundColor: '#11091c', border: '1px solid #361954', padding: '20px', borderRadius: '8px', maxHeight: '720px', overflowY: 'auto' }}>
              {instructions.map((i, index) => (
                <div key={i.id} style={{ borderBottom: '1px solid #28153d', padding: '12px 0', opacity: index === 0 ? 1 : 0.6 }}>
                  {index === 0 && <span style={{ color: '#d4af37', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🔥 ACTIVE MANDATE:</span>}
                  <span style={{ color: index === 0 ? '#fff' : '#b5a6cc', fontSize: index === 0 ? '1.1rem' : '1rem' }}>
                    "{i.content}"
                  </span>
                  {i.media_url && (
                    <img src={i.media_url} alt="Vault Content" style={{ display: 'block', maxWidth: '100%', maxHeight: '250px', borderRadius: '6px', marginTop: '10px', border: '1px solid #56338c' }} />
                  )}
                  <br/><small style={{ color: '#8870a6' }}>Logged: {new Date(i.issued_at).toLocaleDateString()} {new Date(i.issued_at).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GODDESS CINDY PORTAL */}
      {user.role === 'goddess' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
          <div>
            <div style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #d4af37', marginBottom: '20px' }}>
              <h2 style={{ color: '#d4af37', marginTop: 0, fontSize: '1.2rem' }}>✍️ Issue Custom Directive</h2>
              <form onSubmit={handleCustomSubmit}>
                <textarea 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type an original order, chore, or dynamic rule..."
                  style={{ width: '100%', height: '60px', padding: '10px', backgroundColor: '#0d0614', color: '#fff', border: '1px solid #56338c', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#d4af37', color: '#0d0714', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Broadcast Order</button>
              </form>
              
              <div style={{ marginTop: '15px', borderTop: '1px dashed #56338c', paddingTop: '15px' }}>
                <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>📸 Broadcast Photo Instruction:</h4>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ color: '#fff' }} />
              </div>
            </div>

            <h2 style={{ color: '#d4af37', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>💡 Quick Command Deck</h2>
            <div style={{ backgroundColor: '#190f26', padding: '20px', borderRadius: '8px', border: '1px solid #2d1a42', height: '350px', overflowY: 'auto' }}>
              {IDEA_BANK.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '25px' }}>
                  <h3 style={{ color: '#d4af37', borderBottom: '1px solid #56338c', paddingBottom: '6px', marginTop: 0 }}>{section.cat}</h3>
                  {section.tasks.map((task, tIdx) => (
                    <button key={tIdx} onClick={() => handleAddInstruction(task)} style={{ display: 'block', width: '100%', textAlign: 'left', backgroundColor: '#11091c', border: '1px solid #56338c', color: '#e5dcf5', padding: '12px', marginBottom: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                      ⚡ {task}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ color: '#ad82f7', borderBottom: '1px solid #361954', paddingBottom: '5px' }}>📜 Live Vault Auditing</h2>
            <div style={{ backgroundColor: '#11091c', border: '1px solid #2d1a42', padding: '15px', borderRadius: '8px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, color: '#ad82f7' }}>Subject Training Reports</h3>
              {history.map(h => (
                <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #28153d' }}>
                  <span style={{ color: '#fff' }}>⏳ {h.activity_type}</span>: <strong>{h.duration_minutes} mins</strong>
                  <br/><small style={{ color: '#bfa3eb' }}>Notes: {h.notes}</small>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#11091c', border: '1px solid #2d1a42', padding: '15px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, color: '#e2a468' }}>Milestones Ledger</h3>
              {milestones.map(m => (
                <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid #28153d' }}>
                  <span style={{ color: '#fff' }}>👑 {m.record_type}</span>
                  <br/><small style={{ color: '#e2a468' }}>Details: {m.notes}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
