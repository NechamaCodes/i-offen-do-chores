import { useState } from 'react'
import { formatDistanceToNow, isPast, format } from 'date-fns'
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, Timer } from 'lucide-react'
import useStore from '../store/useStore'

const STATUS_STYLES = {
  pending_acceptance: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800', label: 'Awaiting Acceptance' },
  assigned: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-800', label: 'Assigned' },
  completed: { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-100 text-green-800', label: 'Completed' },
  declined: { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-100 text-gray-600', label: 'Declined' },
}

export default function ChoreCard({ chore, showActions = true }) {
  const [actualMinutes, setActualMinutes] = useState('')
  const [showComplete, setShowComplete] = useState(false)
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const acceptChore = useStore(s => s.acceptChore)
  const declineChore = useStore(s => s.declineChore)
  const completeChore = useStore(s => s.completeChore)
  const deleteChore = useStore(s => s.deleteChore)

  const assignee = members.find(m => m.id === chore.assignedTo)
  const creator = members.find(m => m.id === chore.createdBy)
  const deadline = new Date(chore.deadline)
  const isOverdue = isPast(deadline) && chore.status !== 'completed'
  const style = STATUS_STYLES[chore.status] || STATUS_STYLES.assigned
  const isMyChore = chore.assignedTo === activeMemberId

  function handleComplete() {
    const mins = parseInt(actualMinutes, 10)
    if (!mins || mins < 1) return
    completeChore(chore.id, mins)
    setShowComplete(false)
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${style.bg} ${style.border} ${isOverdue ? 'border-red-400 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{chore.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
              {isOverdue ? 'OVERDUE' : style.label}
            </span>
          </div>
          {chore.description && (
            <p className="text-xs text-gray-600 mt-0.5">{chore.description}</p>
          )}
        </div>
        {assignee && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: assignee.color }}
            title={assignee.name}
          >
            {assignee.name[0]}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Timer size={12} />
          Est. {chore.estimatedMinutes}m
          {chore.actualMinutes && ` · Actual ${chore.actualMinutes}m`}
        </span>
        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
          <Calendar size={12} />
          {isOverdue ? 'Due ' : 'Due '}
          {formatDistanceToNow(deadline, { addSuffix: true })}
        </span>
        {creator && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            by {creator.name}
          </span>
        )}
      </div>

      {chore.status === 'completed' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
          <CheckCircle size={12} />
          {chore.onTime ? 'Completed on time' : 'Completed (late)'}
          {chore.actualMinutes && ` · took ${chore.actualMinutes}m`}
        </div>
      )}

      {showActions && isMyChore && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chore.status === 'pending_acceptance' && (
            <>
              <button
                onClick={() => acceptChore(chore.id)}
                className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <CheckCircle size={12} /> Accept
              </button>
              <button
                onClick={() => declineChore(chore.id)}
                className="flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <XCircle size={12} /> Decline
              </button>
            </>
          )}
          {chore.status === 'assigned' && !showComplete && (
            <button
              onClick={() => setShowComplete(true)}
              className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <CheckCircle size={12} /> Mark Complete
            </button>
          )}
          {chore.status === 'assigned' && showComplete && (
            <div className="flex items-center gap-2 w-full">
              <label className="text-xs text-gray-700 shrink-0">Actual time (min):</label>
              <input
                type="number"
                min="1"
                value={actualMinutes}
                onChange={e => setActualMinutes(e.target.value)}
                className="w-20 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="mins"
              />
              <button
                onClick={handleComplete}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => setShowComplete(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
