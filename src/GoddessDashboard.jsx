export default function GoddessDashboard({ session }) {
  return (
    <>
      <h1>👑 Goddess Cindy’s Realm</h1>

      <div className='card'>
        <h2>Welcome, Your Grace</h2>
        <p>You control the structure of the realm.</p>
      </div>

      <div className='card'>
        <h2>Actions</h2>
        <button>Issue Decree</button>
        <button>Review Subject</button>
        <button>Assign Challenge</button>
      </div>
    </>
  )
}
