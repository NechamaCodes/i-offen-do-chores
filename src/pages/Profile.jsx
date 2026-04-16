import { useState, useRef } from 'react'
import { Save, UserPlus, Trash2, Pencil, Camera, Check, X } from 'lucide-react'
import useStore, { CHORE_PREFERENCES } from '../store/useStore'
import LoadMeter from '../components/LoadMeter'
import MemberAvatar from '../components/MemberAvatar'

const PALETTE = [
  '#7c3aed', '#db2777', '#0891b2', '#16a34a',
  '#ea580c', '#9333ea', '#0f766e', '#b45309',
  '#4f46e5', '#be123c', '#0369a1', '#15803d',
]

function resizeImage(file, maxSize = 300) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function Profile() {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const updateMemberPreferences = useStore(s => s.updateMemberPreferences)
  const updateMemberLoadMax = useStore(s => s.updateMemberLoadMax)
  const updateMemberName = useStore(s => s.updateMemberName)
  const updateMemberColor = useStore(s => s.updateMemberColor)
  const updateMemberAvatar = useStore(s => s.updateMemberAvatar)
  const deleteMember = useStore(s => s.deleteMember)
  const addMember = useStore(s => s.addMember)
  const chores = useStore(s => s.chores)

  const activeMember = members.find(m => m.id === activeMemberId)
  const [prefs, setPrefs] = useState(activeMember?.preferences || [])
  const [loadMax, setLoadMax] = useState(activeMember?.loadMax || 150)
  const [newName, setNewName] = useState('')
  const [saved, setSaved] = useState(false)

  // Name editing
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(activeMember?.name || '')

  const fileRef = useRef()

  function togglePref(pref) {
    setPrefs(p => p.includes(pref) ? p.filter(x => x !== pref) : [...p, pref])
  }

  function handleSave() {
    updateMemberPreferences(activeMemberId, prefs)
    updateMemberLoadMax(activeMemberId, loadMax)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function commitName() {
    if (nameInput.trim()) updateMemberName(activeMemberId, nameInput)
    else setNameInput(activeMember?.name || '')
    setEditingName(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImage(file)
    updateMemberAvatar(activeMemberId, dataUrl)
    e.target.value = ''
  }

  function handleRemovePhoto() {
    updateMemberAvatar(activeMemberId, null)
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
    <div className="p-8">
      <h1 className="text-3xl font-extrabold mb-6" style={{ color: '#18181b' }}>My Profile</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: identity + workload + prefs */}
        <div className="col-span-2 space-y-5">

          {/* Identity card */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-6">
              {/* Avatar with upload */}
              <div className="relative shrink-0">
                {/* Clicking the avatar itself opens file picker */}
                <button
                  onClick={() => fileRef.current.click()}
                  className="block rounded-full focus:outline-none"
                  title="Click to change photo"
                  style={{ cursor: 'pointer' }}
                >
                  <MemberAvatar memberId={activeMemberId} size={88} />
                </button>
                {/* Always-visible camera badge */}
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: '#7c3aed', border: '2px solid white' }}
                  title="Change photo"
                >
                  <Camera size={13} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Editable name */}
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameInput(activeMember?.name || ''); setEditingName(false) } }}
                      autoFocus
                      className="text-xl font-bold px-3 py-1 rounded-lg outline-none"
                      style={{ border: '2px solid #7c3aed', color: '#18181b', minWidth: 0, width: '100%' }}
                    />
                    <button onClick={commitName} className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: '#7c3aed' }}>
                      <Check size={15} />
                    </button>
                    <button onClick={() => { setNameInput(activeMember?.name || ''); setEditingName(false) }} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#f4f4f8', color: '#71717a' }}>
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold" style={{ color: '#18181b' }}>{activeMember?.name}</h2>
                    <button onClick={() => { setNameInput(activeMember?.name || ''); setEditingName(true) }} className="p-1.5 rounded-lg transition-all" style={{ color: '#a1a1aa' }} title="Edit name">
                      <Pencil size={14} />
                    </button>
                  </div>
                )}

                <p className="text-sm mb-4" style={{ color: '#a1a1aa' }}>Offen Family Member</p>

                {/* Avatar actions */}
                <div className="flex gap-2 mb-4">
                  {activeMember?.avatar && (
                    <button
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}
                    >
                      <X size={13} /> Remove photo
                    </button>
                  )}
                </div>

                {/* Color picker */}
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: '#a1a1aa' }}>AVATAR COLOR</p>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => updateMemberColor(activeMemberId, c)}
                        className="w-7 h-7 rounded-full transition-all"
                        style={{
                          backgroundColor: c,
                          boxShadow: activeMember?.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                          transform: activeMember?.color === c ? 'scale(1.15)' : 'scale(1)',
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid #f4f4f5' }}>
              <LoadMeter memberId={activeMemberId} />
            </div>
          </div>

          {/* Workload cap */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-1" style={{ color: '#18181b' }}>Max Workload</h3>
            <p className="text-sm mb-4" style={{ color: '#71717a' }}>How much can be assigned before others are blocked from adding more?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Light', sub: '~1 hour', value: 60 },
                { label: 'Medium', sub: '~2–3 hours', value: 150 },
                { label: 'Heavy', sub: '~4+ hours', value: 300 },
              ].map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setLoadMax(preset.value)}
                  className="flex flex-col items-center py-4 px-3 rounded-xl font-bold transition-all"
                  style={loadMax === preset.value
                    ? { border: '2px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#6d28d9' }
                    : { border: '2px solid #e4e4e7', color: '#71717a' }
                  }
                >
                  {preset.label}
                  <span className="text-xs font-normal mt-1" style={{ color: '#a1a1aa' }}>{preset.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-1" style={{ color: '#18181b' }}>Chore Preferences</h3>
            <p className="text-sm mb-4" style={{ color: '#71717a' }}>Pick the chores you actually like doing.</p>
            <div className="flex flex-wrap gap-2">
              {CHORE_PREFERENCES.map(pref => {
                const selected = prefs.includes(pref)
                return (
                  <button
                    key={pref}
                    onClick={() => togglePref(pref)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={selected
                      ? { border: '2px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#6d28d9' }
                      : { border: '2px solid #e4e4e7', color: '#71717a' }
                    }
                  >
                    {pref}
                  </button>
                )
              })}
            </div>
            <p className="text-xs mt-3" style={{ color: '#a1a1aa' }}>{prefs.length} selected</p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ backgroundColor: saved ? '#16a34a' : '#7c3aed' }}
          >
            <Save size={16} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#18181b' }}>My Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Done', value: myCompleted.length, color: '#7c3aed' },
                { label: 'On Time', value: onTime, color: '#16a34a' },
                { label: 'Total Time', value: totalTime >= 60 ? `${Math.floor(totalTime / 60)}h ${totalTime % 60}m` : `${totalTime}m`, color: '#0891b2', span: true },
                avgAccuracy !== null ? { label: 'Avg vs Estimate', value: `${avgAccuracy}%`, color: avgAccuracy <= 110 ? '#16a34a' : '#ea580c', span: true } : null,
              ].filter(Boolean).map((s, i) => (
                <div key={i} className={`rounded-xl p-4 text-center ${s.span ? 'col-span-2' : ''}`} style={{ backgroundColor: '#f4f4f8' }}>
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family members */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#18181b' }}>Family Members</h3>
            <div className="space-y-2 mb-4">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 py-1">
                  <MemberAvatar memberId={m.id} size={32} />
                  <span className="flex-1 text-sm font-semibold" style={{ color: '#3f3f46' }}>{m.name}</span>
                  {members.length > 1 && (
                    <button
                      onClick={() => { if (confirm(`Remove ${m.name}?`)) deleteMember(m.id) }}
                      style={{ color: '#d4d4d8' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#d4d4d8'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #f4f4f5' }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                placeholder="Add member…"
                className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
                style={{ backgroundColor: '#f4f4f8', border: '1.5px solid transparent' }}
                onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
                onBlur={e => e.target.style.border = '1.5px solid transparent'}
              />
              <button onClick={handleAddMember} className="px-3 py-2 rounded-lg text-white transition-all" style={{ backgroundColor: '#7c3aed' }}>
                <UserPlus size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
