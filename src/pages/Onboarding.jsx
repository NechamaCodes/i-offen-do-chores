import { useState } from 'react'
import { Plus, Trash2, ArrowRight, Sparkles, Users, Hash } from 'lucide-react'
import useStore from '../store/useStore'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Onboarding() {
  const addMember = useStore(s => s.addMember)
  const deleteMember = useStore(s => s.deleteMember)
  const completeSetup = useStore(s => s.completeSetup)
  const setFamilyCode = useStore(s => s.setFamilyCode)
  const setActiveMember = useStore(s => s.setActiveMember)
  const members = useStore(s => s.members)
  const familyCode = useStore(s => s.familyCode)

  const [step, setStep] = useState(familyCode ? 'members' : 'code')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [name, setName] = useState('')

  function handleSetCode(e) {
    e.preventDefault()
    const code = codeInput.trim().toUpperCase()
    if (code.length < 3) return setCodeError('Code must be at least 3 characters.')
    setFamilyCode(code)
    setCodeError('')
    setStep('members')
  }

  function handleGenerate() {
    const code = generateCode()
    setFamilyCode(code)
    setCodeInput(code)
    setStep('members')
  }

  async function handleAdd() {
    if (!name.trim()) return
    const id = await addMember(name.trim())
    setName('')
  }

  function handleStart() {
    if (members.length === 0) return
    if (!members.find(m => m.id === useStore.getState().activeMemberId)) {
      setActiveMember(members[0].id)
    }
    completeSetup()
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f4f4f8' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#7c3aed' }}>
              <Sparkles size={30} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold" style={{ color: '#18181b' }}>I Offen Do Chores</h1>
            <p className="text-base mt-2" style={{ color: '#71717a' }}>A shared chore tracker for the whole family.</p>
          </div>

          <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#18181b' }}>Join or create your family</h2>
            <p className="text-sm mb-6" style={{ color: '#71717a' }}>
              Everyone in your family uses the same code to share chores and messages.
            </p>

            <form onSubmit={handleSetCode} className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#71717a' }}>Family Code</label>
                <input
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. OFFEN or ABC123"
                  autoFocus
                  className="w-full text-lg font-bold px-4 py-3 rounded-xl outline-none tracking-widest"
                  style={{ backgroundColor: '#f4f4f8', border: '2px solid transparent', letterSpacing: '0.1em' }}
                  onFocus={e => e.target.style.border = '2px solid #7c3aed'}
                  onBlur={e => e.target.style.border = '2px solid transparent'}
                />
                {codeError && <p className="text-xs mt-1 text-red-500">{codeError}</p>}
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>
                <Hash size={15} /> Use This Code
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ backgroundColor: '#e4e4e7' }} />
              <span className="text-xs font-semibold" style={{ color: '#a1a1aa' }}>OR</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#e4e4e7' }} />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#f4f4f8', color: '#3f3f46' }}
            >
              <Sparkles size={15} /> Generate a New Code
            </button>

            <p className="text-xs text-center mt-4" style={{ color: '#a1a1aa' }}>
              Share your code with family members so they can join on their own devices.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f4f4f8' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#7c3aed' }}>
            <Users size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#18181b' }}>Add Family Members</h1>
          <p className="text-sm mt-2" style={{ color: '#71717a' }}>
            Family code: <span className="font-bold tracking-widest" style={{ color: '#7c3aed' }}>{familyCode}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <label className="block text-sm font-bold mb-2" style={{ color: '#3f3f46' }}>Add a family member</label>
          <div className="flex gap-2 mb-6">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Enter their name…"
              autoFocus
              className="flex-1 text-sm px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: '#f4f4f8', border: '1.5px solid transparent' }}
              onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
              onBlur={e => e.target.style.border = '1.5px solid transparent'}
            />
            <button onClick={handleAdd} disabled={!name.trim()} className="px-4 py-3 rounded-xl text-white font-bold disabled:opacity-40" style={{ backgroundColor: '#7c3aed' }}>
              <Plus size={18} />
            </button>
          </div>

          {members.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#a1a1aa' }}>Family Members</p>
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#f4f4f8' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: m.color }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span className="flex-1 font-semibold text-sm" style={{ color: '#18181b' }}>{m.name}</span>
                  <button
                    onClick={() => deleteMember(m.id)}
                    style={{ color: '#d4d4d8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d4d4d8'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={members.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#7c3aed' }}
          >
            Let's Get Started <ArrowRight size={16} />
          </button>

          <button onClick={() => { setStep('code'); useStore.getState().setFamilyCode(null) }} className="w-full text-center text-xs mt-3" style={{ color: '#a1a1aa' }}>
            ← Change family code
          </button>
        </div>
      </div>
    </div>
  )
}
