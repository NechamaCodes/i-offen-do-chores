import { useState } from 'react'
import { Plus, Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { isPast } from 'date-fns'
import useStore from '../store/useStore'
import ChoreCard from '../components/ChoreCard'
import LoadMeter from '../components/LoadMeter'
import AddChoreModal from '../components/AddChoreModal'

export default function Dashboard() {
  const [showAdd, setShowAdd] = useState(false)
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const chores = useStore(s => s.chores)
  const getPendingForMember = useStore(s => s.getPendingForMember)

  const pending = getPendingForMember(activeMemberId)
  const myAssigned = chores.filter(c => c.assignedTo === activeMemberId && c.status === 'assigned')
  const overdue = chores.filter(c =>
    c.assignedTo === activeMemberId &&
    c.status === 'assigned' &&
    isPast(new Date(c.deadline))
  )

  const activeMember = members.find(m => m.id === activeMemberId)

  const familyStats = members.map(m => {
    const assigned = chores.filter(c => c.assignedTo === m.id && c.status === 'assigned').length
    const completed = chores.filter(c => c.assignedTo === m.id && c.status === 'completed').length
    return { ...m, assigned, completed }
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Hi, {activeMember?.name}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening in the Offen household.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> Assign Chore
        </button>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <div>
            <p className="text-red-800 font-semibold text-sm">You have {overdue.length} overdue chore{overdue.length > 1 ? 's' : ''}!</p>
            <p className="text-red-600 text-xs">Please complete them as soon as possible.</p>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-yellow-700" />
            <h2 className="font-bold text-yellow-900 text-sm">{pending.length} Chore{pending.length > 1 ? 's' : ''} Awaiting Your Acceptance</h2>
          </div>
          <div className="space-y-2">
            {pending.map(c => <ChoreCard key={c.id} chore={c} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-blue-600" />
              <h2 className="font-bold text-gray-900 text-sm">My Active Chores ({myAssigned.length})</h2>
            </div>
            {myAssigned.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">All clear! No active chores.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAssigned.map(c => <ChoreCard key={c.id} chore={c} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">My Load Meter</h2>
            <LoadMeter memberId={activeMemberId} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Family Overview</h2>
            <div className="space-y-3">
              {familyStats.map(m => (
                <div key={m.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.color }}>
                        {m.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{m.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{m.assigned} active · {m.completed} done</span>
                  </div>
                  <LoadMeter memberId={m.id} showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAdd && <AddChoreModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
