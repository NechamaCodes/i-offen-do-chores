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
  const activeMemberId = useStore(s => s.activeMemberId)
  const setActiveMember = useStore(s => s.setActiveMember)
  const getPendingForMember = useStore(s => s.getPendingForMember)
  const myMemberId = useStore(s => s.myMemberId)
  const logout = useStore(s => s.logout)

  return (
    <aside className="w-60 shrink-0 min-h-screen flex flex-col sticky top-0" style={{ backgroundColor: '#18181b' }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
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

      {/* Member switcher */}
      <div className="px-3 pb-4" style={{ borderBottom: '1px solid #27272a' }}>
        <p className="text-xs font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: '#52525b' }}>Family</p>
        <div className="space-y-0.5">
          {members.map(m => {
            const isActive = m.id === activeMemberId
            const pending = getPendingForMember(m.id).length
            return (
              <button
                key={m.id}
                onClick={() => setActiveMember(m.id)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all text-left"
                style={{
                  backgroundColor: isActive ? '#27272a' : 'transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#1f1f21' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div className="relative shrink-0">
                  <MemberAvatar
                    memberId={m.id}
                    size={32}
                    style={{ boxShadow: isActive ? `0 0 0 2px #18181b, 0 0 0 4px ${m.color}` : 'none' }}
                  />
                  {pending > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center font-bold leading-none" style={{ fontSize: '10px' }}>
                      {pending}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium truncate" style={{ color: isActive ? '#ffffff' : '#a1a1aa' }}>
                  {m.name}
                </span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
              </button>
            )
          })}
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

      {/* Add chore button + logout */}
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
        {myMemberId && (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ color: '#52525b' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
            onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
          >
            <LogOut size={13} /> Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}
