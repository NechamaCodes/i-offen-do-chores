import { useState } from 'react'
import { X } from 'lucide-react'
import useStore from '../store/useStore'
import { CHORE_PREFERENCES } from '../store/useStore'

export default function AddChoreModal({ onClose }) {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const addChore = useStore(s => s.addChore)
  const getLoadPercent = useStore(s => s.getLoadPercent)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    assignedTo: '',
    estimatedMinutes: 30,
    deadline: '',
  })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Chore title is required.')
    if (!form.assignedTo) return setError('Please assign this chore to a family member.')
    if (!form.deadline) return setError('Please set a deadline.')

    const loadPercent = getLoadPercent(form.assignedTo)
    if (loadPercent >= 100) {
      return setError(`${members.find(m => m.id === form.assignedTo)?.name} is already at max capacity! Choose someone else or wait for them to finish chores.`)
    }

    addChore({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      assignedTo: form.assignedTo,
      createdBy: activeMemberId,
      estimatedMinutes: parseInt(form.estimatedMinutes, 10) || 30,
      deadline: new Date(form.deadline).toISOString(),
    })
    onClose()
  }

  const selectedMember = members.find(m => m.id === form.assignedTo)
  const loadPercent = form.assignedTo ? getLoadPercent(form.assignedTo) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Assign a Chore</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chore Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="e.g. Take out trash"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              placeholder="Any additional details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Select category...</option>
              {CHORE_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
            <div className="grid grid-cols-2 gap-2">
              {members.filter(m => m.id !== activeMemberId).map(member => {
                const lp = getLoadPercent(member.id)
                const isSelected = form.assignedTo === member.id
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, assignedTo: member.id }))}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    } ${lp >= 100 ? 'opacity-60' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: member.color }}>
                      {member.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                      <p className={`text-xs ${lp >= 80 ? 'text-red-600' : 'text-gray-500'}`}>{lp}% load</p>
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedMember && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${loadPercent < 50 ? 'bg-green-500' : loadPercent < 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedMember.name}'s load: {loadPercent}%
                  {selectedMember.preferences.length > 0 && ` · Prefers: ${selectedMember.preferences.slice(0, 3).join(', ')}`}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Time (min) *</label>
              <input
                name="estimatedMinutes"
                type="number"
                min="1"
                value={form.estimatedMinutes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
              <input
                name="deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Assign Chore
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
