import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListTodo, History, MessageSquare, User, Plus, Sparkles, LogOut } from 'lucide-react'
import useStore from '../store/useStore'
import MemberAvatar from './MemberAvatar'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/chores', label: 'Chore Board', icon: ListTodo },
  { to: '/completed', label: 'History', icon: History },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ onAddChore }) {
  const members = useStore(s => s.members)
  const myMemberId = useStore(s => s.myMemberId)
  const logout = useStore(s => s.logout)
  const getPendingForMember = useStore(s => s.getPendingForMember)

  const myMember = members.find(m => m.id === myMemberId)
  const pendingCount = getPendingForMember(myMemberId).length

  return (
    <aside className="w-60 shrink-0 min-h-screen flex flex-col sticky top-0" style={{ backgroundColor: '#18181b' }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">I Offen Do</p>
            <p className="text-violet-400 font-bold text-sm leading-tight">Chores</p>
          </div>
        </div>
      </div>

      {/* Logged-in user */}
      <div className="px-3 pb-4" style={{ borderBottom: '1px solid #27272a' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#27272a' }}>
          <MemberAvatar memberId={myMemberId} size={34} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{myMember?.name}</p>
            <p className="text-xs" style={{ color: '#52525b' }}>Signed in</p>
          </div>
          {pendingCount > 0 && (
            <span className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center font-bold shrink-0" style={{ fontSize: '10px' }}>
              {pendingCount}
            </span>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40' : ''
              }`
            }
            style={({ isActive }) => isActive ? {} : { color: '#71717a' }}
            onMouseEnter={e => { if (!e.currentTarget.classList.contains('bg-violet-600')) e.currentTarget.style.color = '#e4e4e7' }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('bg-violet-600')) e.currentTarget.style.color = '#71717a' }}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Add chore + Sign Out */}
      <div className="px-3 pb-6 space-y-2">
        <button
          onClick={onAddChore}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all text-white"
          style={{ backgroundColor: '#7c3aed' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
        >
          <Plus size={16} /> Add Chore
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ backgroundColor: '#27272a', color: '#71717a' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3f3f46'; e.currentTarget.style.color = '#e4e4e7' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#27272a'; e.currentTarget.style.color = '#71717a' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
