import { useState } from 'react'
import { Sparkles, Hash, Eye, EyeOff, Plus, ArrowLeft } from 'lucide-react'
import useStore from '../store/useStore'
import MemberAvatar from '../components/MemberAvatar'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Onboarding() {
  const setFamilyCode = useStore(s => s.setFamilyCode)
  const addMember = useStore(s => s.addMember)
  const loginAndComplete = useStore(s => s.loginAndComplete)
  const members = useStore(s => s.members)
  const familyCode = useStore(s => s.familyCode)
  const loading = useStore(s => s.loading)

  const [step, setStep] = useState(familyCode ? 'login' : 'code')
  const [codeInput, setCodeInput] = useState(familyCode || '')
  const [codeError, setCodeError] = useState('')

  // 'pick' → 'password' | 'new'
  const [loginStep, setLoginStep] = useState('pick')
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [newName, setNewName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  function handleSetCode(e) {
    e.preventDefault()
    const code = codeInput.trim().toUpperCase()
    if (code.length < 3) return setCodeError('Code must be at least 3 characters.')
    setFamilyCode(code)
    setCodeError('')
    setStep('login')
  }

  function handleGenerate() {
    const code = generateCode()
    setFamilyCode(code)
    setCodeInput(code)
    setStep('login')
  }

  function pickMember(memberId) {
    setSelectedMemberId(memberId)
    setPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setLoginStep('password')
  }

  function goBack() {
    setLoginStep('pick')
    setSelectedMemberId(null)
    setPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setNewName('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (loggingIn) return
    const member = members.find(m => m.id === selectedMemberId)
    if (!member) return setPasswordError('Member not found. Try refreshing.')
    setPasswordError('')
    if (!member.passwordHash) {
      if (password.length < 4) return setPasswordError('Password must be at least 4 characters.')
      if (password !== confirmPassword) return setPasswordError('Passwords do not match.')
    }
    setLoggingIn(true)
    try {
      const ok = await loginAndComplete(selectedMemberId, password, !member.passwordHash)
      if (!ok) setPasswordError('Incorrect password.')
    } catch (err) {
      console.error('Login error:', err)
      setPasswordError('Error: ' + (err?.message || 'Something went wrong. Check your internet connection.'))
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleAddNew(e) {
    e.preventDefault()
    if (!newName.trim() || loggingIn) return
    if (password.length < 4) return setPasswordError('Password must be at least 4 characters.')
    if (password !== confirmPassword) return setPasswordError('Passwords do not match.')
    setLoggingIn(true)
    try {
      const id = await addMember(newName.trim())
      await loginAndComplete(id, password, true)
    } catch (err) {
      console.error('Sign up error:', err)
      setPasswordError('Error: ' + (err?.message || 'Something went wrong. Check your internet connection.'))
    } finally {
      setLoggingIn(false)
    }
  }

  // ── Step: family code ──────────────────────────────────────────────
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

  // ── Step: login ────────────────────────────────────────────────────
  const selectedMember = members.find(m => m.id === selectedMemberId)

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f4f4f8' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#7c3aed' }}>
            <Sparkles size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#18181b' }}>I Offen Do Chores</h1>
          <p className="text-sm mt-1" style={{ color: '#a1a1aa' }}>
            Family code: <span className="font-bold tracking-widest" style={{ color: '#7c3aed' }}>{familyCode}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
              <span className="ml-3 text-sm" style={{ color: '#71717a' }}>Loading family…</span>
            </div>

          ) : loginStep === 'pick' ? (
            // ── Pick a member ──
            <>
              {members.length > 0 ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#a1a1aa' }}>Who are you?</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {members.map(m => (
                      <button
                        key={m.id}
                        onClick={() => pickMember(m.id)}
                        className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all"
                        style={{ backgroundColor: '#f4f4f8' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ede9fe'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f4f4f8'}
                      >
                        <MemberAvatar memberId={m.id} size={52} />
                        <span className="font-semibold text-sm" style={{ color: '#18181b' }}>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-center mb-5" style={{ color: '#71717a' }}>No family members yet. Add yourself to get started.</p>
              )}

              <button
                onClick={() => setLoginStep('new')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ color: '#7c3aed' }}
              >
                <Plus size={15} /> I'm a new family member
              </button>
            </>

          ) : loginStep === 'password' && selectedMember ? (
            // ── Enter / set password ──
            <form onSubmit={handleLogin} className="space-y-4">
              <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#a1a1aa' }}>
                <ArrowLeft size={15} /> Back
              </button>

              <div className="flex flex-col items-center gap-3 py-2">
                <MemberAvatar memberId={selectedMemberId} size={72} />
                <div className="text-center">
                  <h2 className="text-xl font-bold" style={{ color: '#18181b' }}>{selectedMember.name}</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#71717a' }}>
                    {selectedMember.passwordHash ? 'Enter your password to sign in' : 'Create a password to get started'}
                  </p>
                </div>
              </div>

              <PasswordFields
                password={password}
                confirmPassword={confirmPassword}
                showPassword={showPassword}
                onPassword={setPassword}
                onConfirm={setConfirmPassword}
                onToggleShow={() => setShowPassword(s => !s)}
                showConfirm={!selectedMember.passwordHash}
              />

              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: '#7c3aed' }}
              >
                {loggingIn ? 'Please wait…' : selectedMember.passwordHash ? 'Sign In' : 'Create Account & Sign In'}
              </button>
            </form>

          ) : loginStep === 'new' ? (
            // ── Add new member ──
            <form onSubmit={handleAddNew} className="space-y-4">
              <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#a1a1aa' }}>
                <ArrowLeft size={15} /> Back
              </button>

              <div className="text-center py-2">
                <h2 className="text-xl font-bold" style={{ color: '#18181b' }}>Create your account</h2>
                <p className="text-sm mt-0.5" style={{ color: '#71717a' }}>You'll use this to sign in each time.</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#71717a' }}>Your Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium"
                  style={{ backgroundColor: '#f4f4f8', border: '1.5px solid transparent' }}
                  onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
                  onBlur={e => e.target.style.border = '1.5px solid transparent'}
                />
              </div>

              <PasswordFields
                password={password}
                confirmPassword={confirmPassword}
                showPassword={showPassword}
                onPassword={setPassword}
                onConfirm={setConfirmPassword}
                onToggleShow={() => setShowPassword(s => !s)}
                showConfirm
              />

              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}

              <button
                type="submit"
                disabled={loggingIn || !newName.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: '#7c3aed' }}
              >
                {loggingIn ? 'Creating account…' : 'Create Account & Sign In'}
              </button>
            </form>
          ) : null}
        </div>

        <button
          onClick={() => { setStep('code'); useStore.getState().setFamilyCode(null); goBack() }}
          className="w-full text-center text-xs mt-4"
          style={{ color: '#a1a1aa' }}
        >
          ← Change family code
        </button>
      </div>
    </div>
  )
}

function PasswordFields({ password, confirmPassword, showPassword, onPassword, onConfirm, onToggleShow, showConfirm }) {
  return (
    <>
      <div>
        <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#71717a' }}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => onPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium pr-10"
            style={{ backgroundColor: '#f4f4f8', border: '1.5px solid transparent' }}
            onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
            onBlur={e => e.target.style.border = '1.5px solid transparent'}
          />
          <button type="button" onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#a1a1aa' }}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {showConfirm && (
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#71717a' }}>Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => onConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium"
            style={{ backgroundColor: '#f4f4f8', border: '1.5px solid transparent' }}
            onFocus={e => e.target.style.border = '1.5px solid #7c3aed'}
            onBlur={e => e.target.style.border = '1.5px solid transparent'}
          />
        </div>
      )}
    </>
  )
}
