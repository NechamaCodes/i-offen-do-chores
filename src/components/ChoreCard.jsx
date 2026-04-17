import { useState } from 'react'
import { formatDistanceToNow, isPast, differenceInHours } from 'date-fns'
import { CheckCircle, XCircle, Timer, Clock } from 'lucide-react'
import useStore from '../store/useStore'
import MemberAvatar from './MemberAvatar'

function getDeadlineInfo(deadline, status) {
  if (status === 'completed') return { color: '#a1a1aa', label: null }
  const hours = differenceInHours(new Date(deadline), new Date())
  if (isPast(new Date(deadline))) return { color: '#ef4444', label: 'Overdue' }
  if (hours < 3) return { color: '#f97316', label: 'Due soon' }
  if (hours < 24) return { color: '#eab308', label: 'Today' }
  return { color: '#a1a1aa', label: null }
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
  const myMemberId = useStore(s => s.myMemberId)
  const acceptChore = useStore(s => s.acceptChore)
  const declineChore = useStore(s => s.declineChore)
  const completeChore = useStore(s => s.completeChore)
  const reassignChore = useStore(s => s.reassignChore)
  const deleteChore = useStore(s => s.deleteChore)

  const isMyChore = chore.assignedTo === myMemberId
  const isOverdue = isPast(new Date(chore.deadline)) && chore.status !== 'completed'
  const dl = getDeadlineInfo(chore.deadline, chore.status)
  const leftColor = isOverdue ? '#ef4444' : LEFT_COLORS[chore.status] || '#d4d4d8'

  function handleComplete() {
    const mins = parseInt(actualMinutes, 10)
    if (!mins || mins < 1) return
    completeChore(chore.id, mins)
    setShowComplete(false)
  }

  function handleSkip() {
    completeChore(chore.id, null)
    setShowComplete(false)
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 flex gap-3"
      style={{
        borderLeft: `4px solid ${leftColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <MemberAvatar memberId={chore.assignedTo} size={34} className="mt-0.5 shrink-0" />

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm leading-snug" style={{ color: '#18181b' }}>{chore.title}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {chore.status === 'pending_acceptance' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pending</span>
            )}
            {chore.status === 'completed' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Done</span>
            )}
          </div>
        </div>

        {chore.description && (
          <p className="text-xs mb-1.5 line-clamp-1" style={{ color: '#71717a' }}>{chore.description}</p>
        )}

        {/* Deadline + time estimate */}
        <div className="flex items-center gap-3 text-xs mb-2" style={{ color: '#a1a1aa' }}>
          <span style={{ color: dl.color, fontWeight: dl.label ? 600 : 400 }}>
            {dl.label ? `${dl.label} · ` : ''}{formatDistanceToNow(new Date(chore.deadline), { addSuffix: true })}
          </span>
          {chore.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Timer size={11} /> {chore.estimatedMinutes}m
              {chore.actualMinutes ? ` · ${chore.actualMinutes}m actual` : ''}
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
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => acceptChore(chore.id)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              <CheckCircle size={13} /> Accept
            </button>
            <button
              onClick={() => declineChore(chore.id)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: '#f4f4f5', color: '#52525b' }}
            >
              <XCircle size={13} /> Decline
            </button>
          </div>
        )}

        {showActions && isMyChore && chore.status === 'assigned' && !showComplete && (
          <button
            onClick={() => setShowComplete(true)}
            className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: '#7c3aed' }}
          >
            Mark as Done
          </button>
        )}

        {showActions && chore.status === 'declined' && (
          <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#991b1b' }}>Declined — reassign to someone else?</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => reassignChore(chore.id, m.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ backgroundColor: 'white', color: '#3f3f46', border: '1px solid #e4e4e7' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e4e4e7'}
                >
                  <MemberAvatar memberId={m.id} size={16} />
                  {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => deleteChore(chore.id)}
              className="text-xs font-semibold"
              style={{ color: '#ef4444' }}
            >
              Delete chore
            </button>
          </div>
        )}

        {showActions && isMyChore && chore.status === 'assigned' && showComplete && (
          <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: '#f5f3ff' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#6d28d9' }}>How long did it take? <span style={{ fontWeight: 400, color: '#a78bfa' }}>(optional)</span></p>
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
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                style={{ backgroundColor: '#7c3aed' }}
              >
                Done
              </button>
              <button onClick={handleSkip} className="text-xs font-semibold" style={{ color: '#a78bfa' }}>
                Skip
              </button>
              <button onClick={() => setShowComplete(false)} className="text-xs ml-auto" style={{ color: '#a1a1aa' }}>
                cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
