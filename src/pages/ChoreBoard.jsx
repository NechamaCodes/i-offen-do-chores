import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { isPast } from 'date-fns'
import useStore from '../store/useStore'
import ChoreCard from '../components/ChoreCard'
import AddChoreModal from '../components/AddChoreModal'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending_acceptance', label: 'Pending' },
  { id: 'assigned', label: 'Active' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
]

export default function ChoreBoard() {
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')
  const [memberFilter, setMemberFilter] = useState('all')

  const chores = useStore(s => s.chores)
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)

  const filtered = chores.filter(c => {
    if (memberFilter !== 'all' && c.assignedTo !== memberFilter) return false
    if (filter === 'overdue') return c.status === 'assigned' && isPast(new Date(c.deadline))
    if (filter !== 'all') return c.status === filter
    return true
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900">Chore Board</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} /> Assign Chore
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={memberFilter}
          onChange={e => setMemberFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
        >
          <option value="all">All Members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Filter size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No chores match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <ChoreCard
              key={c.id}
              chore={c}
              showActions={c.assignedTo === activeMemberId}
            />
          ))}
        </div>
      )}

      {showAdd && <AddChoreModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
