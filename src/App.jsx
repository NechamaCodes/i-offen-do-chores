import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import useStore from './store/useStore'
import useFirestoreSync from './hooks/useFirestoreSync'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ChoreBoard from './pages/ChoreBoard'
import CompletedBank from './pages/CompletedBank'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import AddChoreModal from './components/AddChoreModal'

function Inner() {
  const setupComplete = useStore(s => s.setupComplete)
  const familyCode = useStore(s => s.familyCode)
  const loading = useStore(s => s.loading)
  const [showAdd, setShowAdd] = useState(false)

  // Start Firestore listeners as soon as there's a family code (even during onboarding)
  useFirestoreSync()

  if (!familyCode || !setupComplete) {
    return <Onboarding />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f4f8' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#7c3aed' }}>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#71717a' }}>Loading family data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f4f4f8' }}>
      <Sidebar onAddChore={() => setShowAdd(true)} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard onAddChore={() => setShowAdd(true)} />} />
          <Route path="/chores" element={<ChoreBoard onAddChore={() => setShowAdd(true)} />} />
          <Route path="/completed" element={<CompletedBank />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {showAdd && <AddChoreModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Inner />
    </BrowserRouter>
  )
}
