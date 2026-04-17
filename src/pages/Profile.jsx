import { useState, useEffect } from 'react'
import { Save, Trash2, Pencil, Check, X } from 'lucide-react'
import useStore, { CHORE_PREFERENCES } from '../store/useStore'
import LoadMeter from '../components/LoadMeter'
import MemberAvatar from '../components/MemberAvatar'

const PALETTE = [
  '#7c3aed', '#db2777', '#0891b2', '#16a34a',
  '#ea580c', '#9333ea', '#0f766e', '#b45309',
  '#4f46e5', '#be123c', '#0369a1', '#15803d',
]

export default function Profile() {
  const members = useStore(s => s.members)
  const myMemberId = useStore(s => s.myMemberId)
  const updateMemberPreferences = useStore(s => s.updateMemberPreferences)
  const updateMemberLoadMax = useStore(s => s.updateMemberLoadMax)
  const updateMemberName = useStore(s => s.updateMemberName)
  const updateMemberColor = useStore(s => s.updateMemberColor)
  const deleteMember = useStore(s => s.deleteMember)
  const chores = useStore(s => s.chores)

  const [viewingMemberId, setViewingMemberId] = useState(myMemberId)
  const viewingMember = members.find(m => m.id === viewingMemberId)
  const isMyProfile = viewingMemberId === myMemberId

  const [prefs, setPrefs] = useState(viewingMember?.preferences || [])
  const [loadMax, setLoadMax] = useState(viewingMember?.loadMax || 150)
  const [saved, setSaved] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(viewingMember?.name || '')

  // Reset local state when switching which member we're viewing
  useEffect(() => {
    setPrefs(viewingMember?.preferences || [])
    setLoadMax(viewingMember?.loadMax || 150)
    setNameInput(viewingMember?.name || '')
    setEditingName(false)
    setSaved(false)
  }, [viewingMemberId])

  function togglePref(pref) {
    setPrefs(p => p.includes(pref) ? p.filter(x => x !== pref) : [...p, pref])
  }

  function handleSave() {
    updateMemberPreferences(viewingMemberId, prefs)
    updateMemberLoadMax(viewingMemberId, loadMax)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function commitName() {
    if (nameInput.trim()) updateMemberName(viewingMemberId, nameInput)
    else setNameInput(viewingMember?.name || '')
    setEditingName(false)
  }

  const viewingCompleted = chores.filter(c => c.assignedTo === viewingMemberId && c.status === 'completed')
  const onTime = viewingCompleted.filter(c => c.onTime).length
  const totalTime = viewingCompleted.reduce((sum, c) => sum + (c.actualMinutes || 0), 0)
  const avgAccuracy = viewingCompleted.length > 0
    ? Math.round(viewingCompleted.reduce((sum, c) => {
        if (!c.actualMinutes || !c.estimatedMinutes) return sum
        return sum + (c.actualMinutes / c.estimatedMinutes)
      }, 0) / viewingCompleted.length * 100)
    : null

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold mb-6" style={{ color: '#18181b' }}>
        {isMyProfile ? 'My Profile' : `${viewingMember?.name}'s Profile`}
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: identity + workload + prefs */}
        <div className="col-span-2 space-y-5">

          {/* Identity card */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <MemberAvatar memberId={viewingMemberId} size={88} />
              </div>

              <div className="flex-1 min-w-0">
                {isMyProfile && editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameInput(viewingMember?.name || ''); setEditingName(false) } }}
                      autoFocus
                      className="text-xl font-bold px-3 py-1 rounded-lg outline-none"
                      style={{ border: '2px solid #7c3aed', color: '#18181b', minWidth: 0, width: '100%' }}
                    />
                    <button onClick={commitName} className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: '#7c3aed' }}>
                      <Check size={15} />
                    </button>
                    <button onClick={() => { setNameInput(viewingMember?.name || ''); setEditingName(false) }} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#f4f4f8', color: '#71717a' }}>
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold" style={{ color: '#18181b' }}>{viewingMember?.name}</h2>
                    {isMyProfile && (
                      <button onClick={() => { setNameInput(viewingMember?.name || ''); setEditingName(true) }} className="p-1.5 rounded-lg transition-all" style={{ color: '#a1a1aa' }} title="Edit name">
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                )}

                <p className="text-sm mb-4" style={{ color: '#a1a1aa' }}>Offen Family Member</p>

                {isMyProfile ? (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: '#a1a1aa' }}>AVATAR COLOR</p>
                    <div className="flex flex-wrap gap-2">
                      {PALETTE.map(c => (
                        <button
                          key={c}
                          onClick={() => updateMemberColor(viewingMemberId, c)}
                          className="w-7 h-7 rounded-full transition-all"
                          style={{
                            backgroundColor: c,
                            boxShadow: viewingMember?.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                            transform: viewingMember?.color === c ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: viewingMember?.color }} />
                    <span className="text-xs" style={{ color: '#a1a1aa' }}>Avatar color</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid #f4f4f5' }}>
              <LoadMeter memberId={viewingMemberId} />
            </div>
          </div>

          {/* Workload cap */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-1" style={{ color: '#18181b' }}>Max Workload</h3>
            <p className="text-sm mb-4" style={{ color: '#71717a' }}>
              {isMyProfile ? 'How much can be assigned before others are blocked from adding more?' : `${viewingMember?.name}'s workload capacity.`}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Light', sub: '~1 hour', value: 60 },
                { label: 'Medium', sub: '~2–3 hours', value: 150 },
                { label: 'Heavy', sub: '~4+ hours', value: 300 },
              ].map(preset => (
                <button
                  key={preset.value}
                  onClick={() => isMyProfile && setLoadMax(preset.value)}
                  className="flex flex-col items-center py-4 px-3 rounded-xl font-bold transition-all"
                  style={{
                    ...(loadMax === preset.value
                      ? { border: '2px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#6d28d9' }
                      : { border: '2px solid #e4e4e7', color: '#71717a' }),
                    cursor: isMyProfile ? 'pointer' : 'default',
                    opacity: isMyProfile ? 1 : 0.7,
                  }}
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
            <p className="text-sm mb-4" style={{ color: '#71717a' }}>
              {isMyProfile ? 'Pick the chores you actually like doing.' : `${viewingMember?.name}'s preferred chores.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {CHORE_PREFERENCES.map(pref => {
                const selected = prefs.includes(pref)
                return (
                  <button
                    key={pref}
                    onClick={() => isMyProfile && togglePref(pref)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      ...(selected
                        ? { border: '2px solid #7c3aed', backgroundColor: '#f5f3ff', color: '#6d28d9' }
                        : { border: '2px solid #e4e4e7', color: '#71717a' }),
                      cursor: isMyProfile ? 'pointer' : 'default',
                    }}
                  >
                    {pref}
                  </button>
                )
              })}
            </div>
            <p className="text-xs mt-3" style={{ color: '#a1a1aa' }}>{prefs.length} selected</p>
          </div>

          {isMyProfile && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: saved ? '#16a34a' : '#7c3aed' }}
            >
              <Save size={16} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#18181b' }}>
              {isMyProfile ? 'My Stats' : `${viewingMember?.name}'s Stats`}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Done', value: viewingCompleted.length, color: '#7c3aed' },
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

          {/* Family members — click to view their profile */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#18181b' }}>Family Members</h3>
            <div className="space-y-1">
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: viewingMemberId === m.id ? '#f5f3ff' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setViewingMemberId(m.id)}
                >
                  <MemberAvatar memberId={m.id} size={32} />
                  <span className="flex-1 text-sm font-semibold" style={{ color: viewingMemberId === m.id ? '#6d28d9' : '#3f3f46' }}>
                    {m.name}{m.id === myMemberId ? ' (me)' : ''}
                  </span>
                  {members.length > 1 && m.id !== myMemberId && (
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(`Remove ${m.name}?`)) deleteMember(m.id) }}
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
          </div>
        </div>
      </div>
    </div>
  )
}
