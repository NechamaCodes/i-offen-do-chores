import { useState } from 'react'
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import useStore from '../store/useStore'

function Stat({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: '#71717a' }}>{label}</p>
    </div>
  )
}

export default function CompletedBank() {
  const chores = useStore(s => s.chores)
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const [viewMember, setViewMember] = useState(activeMemberId)

  const completed = chores
    .filter(c => c.assignedTo === viewMember && c.status === 'completed')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

  const totalMinutes = completed.reduce((sum, c) => sum + (c.actualMinutes || 0), 0)
  const onTimeCount = completed.filter(c => c.onTime).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2" style={{ color: '#18181b' }}>
            <Trophy size={26} style={{ color: '#f59e0b' }} /> Chore History
          </h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>Every completed chore, logged.</p>
        </div>
        {/* Member switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setViewMember(m.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={viewMember === m.id
                ? { backgroundColor: '#7c3aed', color: '#ffffff' }
                : { color: '#71717a' }
              }
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: m.color, fontSize: '10px' }}>
                {m.name[0]}
              </div>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Stat label="Total done" value={completed.length} color="#7c3aed" />
        <Stat label="On time" value={onTimeCount} color="#16a34a" />
        <Stat label="Late" value={completed.length - onTimeCount} color={completed.length - onTimeCount > 0 ? '#ea580c' : '#a1a1aa'} />
        <Stat
          label="Time spent"
          value={totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
          color="#0891b2"
        />
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <Trophy size={48} style={{ color: '#e4e4e7' }} className="mb-3" />
          <p className="font-bold" style={{ color: '#3f3f46' }}>No completed chores yet.</p>
          <p className="text-sm mt-1" style={{ color: '#a1a1aa' }}>Get to work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
          {completed.map(c => {
            const timeDiff = c.actualMinutes && c.estimatedMinutes ? c.actualMinutes - c.estimatedMinutes : null
            return (
              <div key={c.id} className="bg-white rounded-2xl p-4" style={{ borderLeft: '4px solid #22c55e', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold" style={{ color: '#18181b' }}>{c.title}</h3>
                  {c.onTime ? (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                      <CheckCircle size={10} /> On time
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>
                      <XCircle size={10} /> Late
                    </span>
                  )}
                </div>
                {c.description && <p className="text-sm mb-2" style={{ color: '#71717a' }}>{c.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#a1a1aa' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    Est {c.estimatedMinutes}m · Actual {c.actualMinutes}m
                    {timeDiff !== null && (
                      <span style={{ color: timeDiff > 0 ? '#ea580c' : '#16a34a' }}>
                        ({timeDiff > 0 ? '+' : ''}{timeDiff}m)
                      </span>
                    )}
                  </span>
                  {c.category && (
                    <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#f4f4f8', color: '#71717a' }}>{c.category}</span>
                  )}
                  {c.completedAt && <span>{format(new Date(c.completedAt), 'MMM d, h:mm a')}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
