import { Bell, AlertTriangle, Sparkles } from 'lucide-react'
import { isPast } from 'date-fns'
import useStore from '../store/useStore'
import ChoreCard from '../components/ChoreCard'
import LoadMeter from '../components/LoadMeter'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: '#71717a' }}>{label}</p>
    </div>
  )
}

export default function Dashboard({ onAddChore }) {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const chores = useStore(s => s.chores)
  const getPendingForMember = useStore(s => s.getPendingForMember)

  const pending = getPendingForMember(activeMemberId)
  const myAssigned = chores.filter(c => c.assignedTo === activeMemberId && c.status === 'assigned')
  const myCompleted = chores.filter(c => c.assignedTo === activeMemberId && c.status === 'completed')
  const overdue = myAssigned.filter(c => isPast(new Date(c.deadline)))
  const activeMember = members.find(m => m.id === activeMemberId)

  const familyStats = members.map(m => ({
    ...m,
    active: chores.filter(c => c.assignedTo === m.id && c.status === 'assigned').length,
    done: chores.filter(c => c.assignedTo === m.id && c.status === 'completed').length,
  }))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold" style={{ color: '#18181b' }}>
          Hi, {activeMember?.name}! 👋
        </h1>
        <p className="text-base mt-1" style={{ color: '#71717a' }}>
          {myAssigned.length === 0 ? "You're all caught up — enjoy the break!" : `You have ${myAssigned.length} active chore${myAssigned.length > 1 ? 's' : ''}.`}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Active chores" value={myAssigned.length} color="#7c3aed" />
        <StatCard label="Completed" value={myCompleted.length} color="#16a34a" />
        <StatCard label="Overdue" value={overdue.length} color={overdue.length > 0 ? '#ef4444' : '#22c55e'} />
      </div>

      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#ef4444' }}>
            <AlertTriangle size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#991b1b' }}>
              {overdue.length} overdue chore{overdue.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm" style={{ color: '#b91c1c' }}>Please get to {overdue.length > 1 ? 'them' : 'it'} as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Pending acceptance */}
      {pending.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} style={{ color: '#d97706' }} />
            <h2 className="font-bold text-sm" style={{ color: '#92400e' }}>
              {pending.length} chore{pending.length > 1 ? 's' : ''} waiting for your acceptance
            </h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            {pending.map(c => <ChoreCard key={c.id} chore={c} />)}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chores — 2 cols */}
        <div className="col-span-2">
          <h2 className="font-bold text-lg mb-4" style={{ color: '#18181b' }}>My Active Chores</h2>
          {myAssigned.length === 0 ? (
            <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-16 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f5f3ff' }}>
                <Sparkles size={28} style={{ color: '#7c3aed' }} />
              </div>
              <p className="font-bold text-base" style={{ color: '#3f3f46' }}>All clear!</p>
              <p className="text-sm mt-1 mb-4" style={{ color: '#a1a1aa' }}>No active chores right now.</p>
              <button
                onClick={onAddChore}
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ backgroundColor: '#7c3aed' }}
              >
                Add a chore
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {myAssigned.map(c => <ChoreCard key={c.id} chore={c} />)}
            </div>
          )}
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 className="font-bold text-sm mb-4" style={{ color: '#18181b' }}>My Workload</h2>
            <LoadMeter memberId={activeMemberId} />
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 className="font-bold text-sm mb-4" style={{ color: '#18181b' }}>Family</h2>
            <div className="space-y-4">
              {familyStats.map(m => (
                <div key={m.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.color }}>
                        {m.name[0]}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#3f3f46' }}>{m.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#a1a1aa' }}>{m.active} active</span>
                  </div>
                  <LoadMeter memberId={m.id} showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
