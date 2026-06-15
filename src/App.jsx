import { useState } from 'react'
import Login from './Login.jsx'
import GoddessDashboard from './GoddessDashboard.jsx'
import SubjectDashboard from './SubjectDashboard.jsx'

export default function App() {
  const [session, setSession] = useState(null)

  if (!session) {
    return <Login onLogin={setSession} />
  }

  return session.role === 'goddess' ? (
    <div className='realm'>
      <GoddessDashboard session={session} />
    </div>
  ) : (
    <div className='realm'>
      <SubjectDashboard session={session} />
    </div>
  )
}
