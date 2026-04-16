import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ChoreBoard from './pages/ChoreBoard'
import CompletedBank from './pages/CompletedBank'
import Messages from './pages/Messages'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chores" element={<ChoreBoard />} />
            <Route path="/completed" element={<CompletedBank />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
