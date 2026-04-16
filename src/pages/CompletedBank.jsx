import { useState } from 'react'
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import useStore from '../store/useStore'

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
  const lateCount = completed.length - onTimeCount

  const member = members.find(m => m.id === viewMember)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" /> Completed Chore Bank
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">A record of all chores done by the Offen family.</p>
        </div>
        <select
          value={viewMember}
          onChange={e => setViewMember(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
        >
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-black text-purple-700">{completed.length}</p>
          <p className="text-xs text-gray-500 mt-1">Chores Done</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-black text-green-700">{onTimeCount}</p>
          <p className="text-xs text-gray-500 mt-1">On Time</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-black text-blue-700">
            {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Time</p>
        </div>
      </div>

      {completed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No completed chores yet. Get to work!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map(c => {
            const wasOnTime = c.onTime
            const timeDiff = c.actualMinutes && c.estimatedMinutes
              ? c.actualMinutes - c.estimatedMinutes
              : null

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
                      {wasOnTime ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={11} /> On time
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                          <XCircle size={11} /> Late
                        </span>
                      )}
                    </div>
                    {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Est: {c.estimatedMinutes}m · Actual: {c.actualMinutes}m
                        {timeDiff !== null && (
                          <span className={timeDiff > 0 ? 'text-orange-600' : 'text-green-600'}>
                            ({timeDiff > 0 ? '+' : ''}{timeDiff}m)
                          </span>
                        )}
                      </span>
                      {c.completedAt && (
                        <span>Completed {format(new Date(c.completedAt), 'MMM d, h:mm a')}</span>
                      )}
                    </div>
                  </div>
                  {c.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">{c.category}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
