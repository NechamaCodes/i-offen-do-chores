import { useState } from 'react'
import { isPast } from 'date-fns'
import useStore from '../store/useStore'
import ChoreCard from '../components/ChoreCard'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending_acceptance', label: 'Pending' },
  { id: 'assigned', label: 'Active' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Done' },
]

export default function ChoreBoard({ onAddChore }) {
  const [filter, setFilter] = useState('all')
  const [memberFilter, setMemberFilter] = useState('all')
  const chores = useStore(s => s.chores)
  const members = useStore(s => s.members)
  const myMemberId = useStore(s => s.myMemberId)

  const filtered = chores.filter(c => {
    if (memberFilter !== 'all' && c.assignedTo !== memberFilter) return false
    if (filter === 'overdue') return c.status === 'assigned' && isPast(new Date(c.deadline))
    if (filter !== 'all') return c.status === filter
    return true
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold" style={{ color: '#18181b' }}>Chore Board</h1>
        <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#f4f4f8', color: '#71717a' }}>
          {filtered.length} chore{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status filter */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={filter === f.id
                ? { backgroundColor: '#7c3aed', color: '#ffffff' }
                : { color: '#71717a', backgroundColor: 'transparent' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Member filter — avatars */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setMemberFilter('all')}
            className="text-sm font-semibold px-2 py-1 rounded-lg transition-all"
            style={{ color: memberFilter === 'all' ? '#7c3aed' : '#a1a1aa' }}
          >
            All
          </button>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setMemberFilter(m.id === memberFilter ? 'all' : m.id)}
              title={m.name}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{
                backgroundColor: m.color,
                opacity: memberFilter !== 'all' && memberFilter !== m.id ? 0.4 : 1,
                boxShadow: memberFilter === m.id ? `0 0 0 2px white, 0 0 0 3.5px ${m.color}` : 'none',
              }}
            >
              {m.name[0]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="font-bold text-base" style={{ color: '#3f3f46' }}>No chores match this filter.</p>
          <button onClick={onAddChore} className="mt-3 text-sm font-bold" style={{ color: '#7c3aed' }}>+ Add a chore</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
          {filtered.map(c => (
            <ChoreCard key={c.id} chore={c} showActions={c.assignedTo === myMemberId || c.status === 'declined'} />
          ))}
        </div>
      )}
    </div>
  )
}
