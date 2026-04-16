import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListTodo, Trophy, MessageSquare, User } from 'lucide-react'
import useStore from '../store/useStore'

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { to: '/chores', label: 'Chores', icon: ListTodo },
  { to: '/completed', label: 'Bank', icon: Trophy },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const setActiveMember = useStore(s => s.setActiveMember)
  const getPendingForMember = useStore(s => s.getPendingForMember)

  const activeMember = members.find(m => m.id === activeMemberId)
  const pendingCount = getPendingForMember(activeMemberId).length

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-purple-700 tracking-tight">I Offen Do Chores</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Viewing as:</span>
            <select
              value={activeMemberId}
              onChange={e => setActiveMember(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {activeMember && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold relative"
                style={{ backgroundColor: activeMember.color }}
              >
                {activeMember.name[0]}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="flex border-t border-gray-100">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-purple-700 border-t-2 border-purple-600 -mt-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
