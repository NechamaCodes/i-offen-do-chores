import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListTodo, History, MessageSquare, User } from 'lucide-react'
import useStore from '../store/useStore'

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { to: '/chores', label: 'Chores', icon: ListTodo },
  { to: '/completed', label: 'History', icon: History },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const setActiveMember = useStore(s => s.setActiveMember)
  const getPendingForMember = useStore(s => s.getPendingForMember)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <span className="text-lg font-black text-purple-700 tracking-tight">I Offen Do Chores</span>

          {/* Member switcher — avatar pills */}
          <div className="flex items-center gap-1.5">
            {members.map(m => {
              const isActive = m.id === activeMemberId
              const pending = getPendingForMember(m.id).length
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMember(m.id)}
                  title={m.name}
                  className={`relative flex flex-col items-center transition-all ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-90'}`}
                >
                  <div
                    className={`rounded-full flex items-center justify-center text-white font-bold transition-all ${
                      isActive ? 'w-9 h-9 text-sm ring-2 ring-offset-1 ring-purple-500' : 'w-7 h-7 text-xs'
                    }`}
                    style={{ backgroundColor: m.color }}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold text-purple-700 mt-0.5 leading-none">{m.name}</span>
                  )}
                  {pending > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none">
                      {pending}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex border-t border-gray-100 -mx-4 px-4">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-purple-700 border-t-2 border-purple-600 -mt-px'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
