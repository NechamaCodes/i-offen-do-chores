import { useState } from 'react'
import { Save, UserPlus } from 'lucide-react'
import useStore, { CHORE_PREFERENCES } from '../store/useStore'
import LoadMeter from '../components/LoadMeter'

export default function Profile() {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const updateMemberPreferences = useStore(s => s.updateMemberPreferences)
  const updateMemberLoadMax = useStore(s => s.updateMemberLoadMax)
  const addMember = useStore(s => s.addMember)
  const chores = useStore(s => s.chores)

  const activeMember = members.find(m => m.id === activeMemberId)
  const [prefs, setPrefs] = useState(activeMember?.preferences || [])
  const [loadMax, setLoadMax] = useState(activeMember?.loadMax || 240)
  const [newName, setNewName] = useState('')
  const [saved, setSaved] = useState(false)

  function togglePref(pref) {
    setPrefs(p => p.includes(pref) ? p.filter(x => x !== pref) : [...p, pref])
  }

  function handleSave() {
    updateMemberPreferences(activeMemberId, prefs)
    updateMemberLoadMax(activeMemberId, parseInt(loadMax, 10))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAddMember() {
    if (!newName.trim()) return
    addMember(newName.trim())
    setNewName('')
  }

  const myCompleted = chores.filter(c => c.assignedTo === activeMemberId && c.status === 'completed')
  const onTime = myCompleted.filter(c => c.onTime).length
  const totalTime = myCompleted.reduce((sum, c) => sum + (c.actualMinutes || 0), 0)
  const avgAccuracy = myCompleted.length > 0
    ? Math.round(myCompleted.reduce((sum, c) => {
        if (!c.actualMinutes || !c.estimatedMinutes) return sum
        return sum + (c.actualMinutes / c.estimatedMinutes)
      }, 0) / myCompleted.length * 100)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">{activeMember?.name}'s Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black"
                style={{ backgroundColor: activeMember?.color }}
              >
                {activeMember?.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeMember?.name}</h2>
                <p className="text-gray-500 text-sm">Offen Family Member</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Chore Load Cap (minutes)</h3>
              <p className="text-xs text-gray-500 mb-2">
                When your active chores exceed this, others can't assign more to you.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="60" max="600" step="15"
                  value={loadMax}
                  onChange={e => setLoadMax(e.target.value)}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-sm font-bold text-purple-700 w-16 text-right">{loadMax}m</span>
              </div>
            </div>

            <div className="mt-4">
              <LoadMeter memberId={activeMemberId} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Chore Preferences</h3>
            <p className="text-xs text-gray-500 mb-3">
              Select the types of chores you prefer. This helps whoever assigns chores make better matches.
            </p>
            <div className="flex flex-wrap gap-2">
              {CHORE_PREFERENCES.map(pref => {
                const selected = prefs.includes(pref)
                return (
                  <button
                    key={pref}
                    onClick={() => togglePref(pref)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                      selected
                        ? 'border-purple-500 bg-purple-100 text-purple-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {pref}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">{prefs.length} preference{prefs.length !== 1 ? 's' : ''} selected</p>
          </div>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Save size={16} />
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">My Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Chores completed</span>
                <span className="text-sm font-bold text-gray-900">{myCompleted.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Completed on time</span>
                <span className="text-sm font-bold text-green-700">{onTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total time spent</span>
                <span className="text-sm font-bold text-gray-900">
                  {totalTime >= 60 ? `${Math.floor(totalTime / 60)}h ${totalTime % 60}m` : `${totalTime}m`}
                </span>
              </div>
              {avgAccuracy !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Avg vs estimate</span>
                  <span className={`text-sm font-bold ${avgAccuracy <= 110 ? 'text-green-700' : 'text-orange-600'}`}>
                    {avgAccuracy}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Add Family Member</h3>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                placeholder="Name..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleAddMember}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <UserPlus size={16} />
              </button>
            </div>
            <div className="mt-3 space-y-1">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-sm text-gray-700">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
