import { useState } from 'react'
import { formatDistanceToNow, isPast, differenceInHours } from 'date-fns'
import { CheckCircle, XCircle, Timer, User, Clock } from 'lucide-react'
import useStore from '../store/useStore'
import MemberAvatar from './MemberAvatar'

function getDeadlineInfo(deadline, status) {
  if (status === 'completed') return { color: '#a1a1aa', label: null, bg: null }
  const hours = differenceInHours(new Date(deadline), new Date())
  if (isPast(new Date(deadline))) return { color: '#ef4444', label: 'Overdue', bg: '#fef2f2' }
  if (hours < 3) return { color: '#f97316', label: 'Due soon', bg: '#fff7ed' }
  if (hours < 24) return { color: '#eab308', label: null, bg: null }
  return { color: '#a1a1aa', label: null, bg: null }
}

const LEFT_COLORS = {
  pending_acceptance: '#f59e0b',
  assigned: '#6366f1',
  completed: '#22c55e',
  declined: '#d4d4d8',
}

export default function ChoreCard({ chore, showActions = true }) {
  const [actualMinutes, setActualMinutes] = useState('')
  const [showComplete, setShowComplete] = useState(false)
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const acceptChore = useStore(s => s.acceptChore)
  const declineChore = useStore(s => s.declineChore)
  const completeChore = useStore(s => s.completeChore)

  const assignee = members.find(m => m.id === chore.assignedTo)
  const creator = members.find(m => m.id === chore.createdBy)
  const isMyChore = chore.assignedTo === activeMemberId
  const isOverdue = isPast(new Date(chore.deadline)) && chore.status !== 'completed'
  const dl = getDeadlineInfo(chore.deadline, chore.status)
  const leftColor = isOverdue ? '#ef4444' : LEFT_COLORS[chore.status] || '#d4d4d8'

  function handleComplete() {
    const mins = parseInt(actualMinutes, 10)
    if (!mins || mins < 1) return
    completeChore(chore.id, mins)
    setShowComplete(false)
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 flex gap-3"
      style={{
        borderLeft: `4px solid ${leftColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {assignee && <MemberAvatar memberId={chore.assignedTo} size={36} className="mt-0.5" />}

      <div className="flex-1 min-w-0">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-zinc-900 leading-snug">{chore.title}</h3>
          <div className="shrink-0 flex items-center gap-1.5">
            {chore.status === 'pending_acceptance' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pending</span>
            )}
            {chore.status === 'completed' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                <CheckCircle size={10} /> Done
              </span>
            )}
            {chore.category && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f4f4f8', color: '#71717a' }}>{chore.category}</span>
            )}
          </div>
        </div>

        {chore.description && (
          <p className="text-sm mb-2" style={{ color: '#71717a' }}>{chore.description}</p>
        )}

        {/* Deadline */}
        <p className="text-sm font-semibold mb-2" style={{ color: dl.color }}>
          {dl.label && <span className="mr-1">{dl.label} ·</span>}
          Due {formatDistanceToNow(new Date(chore.deadline), { addSuffix: true })}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#a1a1aa' }}>
          <span className="flex items-center gap-1">
            <Timer size={11} />
            {chore.estimatedMinutes}m est{chore.actualMinutes ? ` · ${chore.actualMinutes}m actual` : ''}
          </span>
          {creator && creator.id !== chore.assignedTo && (
            <span className="flex items-center gap-1">
              <User size={11} /> by {creator.name}
            </span>
          )}
          {chore.status === 'completed' && (
            <span className="flex items-center gap-1 font-semibold" style={{ color: chore.onTime ? '#16a34a' : '#ea580c' }}>
              <Clock size={11} /> {chore.onTime ? 'On time' : 'Late'}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && isMyChore && chore.status === 'pending_acceptance' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => acceptChore(chore.id)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
              style={{ backgroundColor: '#16a34a' }}
            >
              <CheckCircle size={14} /> Accept
            </button>
            <button
              onClick={() => declineChore(chore.id)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ backgroundColor: '#f4f4f5', color: '#52525b' }}
            >
              <XCircle size={14} /> Decline
            </button>
          </div>
        )}

        {showActions && isMyChore && chore.status === 'assigned' && !showComplete && (
          <button
            onClick={() => setShowComplete(true)}
            className="mt-3 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
            style={{ backgroundColor: '#7c3aed' }}
          >
            Mark as Done
          </button>
        )}

        {showActions && isMyChore && chore.status === 'assigned' && showComplete && (
          <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#f5f3ff' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#6d28d9' }}>How long did it actually take?</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={actualMinutes}
                onChange={e => setActualMinutes(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComplete()}
                autoFocus
                placeholder="minutes"
                className="w-24 text-sm px-3 py-1.5 rounded-lg outline-none"
                style={{ border: '1.5px solid #c4b5fd', backgroundColor: 'white' }}
              />
              <button
                onClick={handleComplete}
                disabled={!actualMinutes || parseInt(actualMinutes) < 1}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white transition-all disabled:opacity-40"
                style={{ backgroundColor: '#7c3aed' }}
              >
                Done!
              </button>
              <button onClick={() => setShowComplete(false)} className="text-xs" style={{ color: '#a1a1aa' }}>
                cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
