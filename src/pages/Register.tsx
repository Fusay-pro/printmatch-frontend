import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RoleModal({ onSelect }: { onSelect: (role: 'commissioner' | 'printer') => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <div className="bg-white shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          What brings you here?
        </h2>
        <p className="text-gray-400 text-sm mb-8">You can always switch later from your settings.</p>

        <div className="grid grid-cols-2 gap-3">
          {([
            { role: 'commissioner' as const, icon: '📋', title: 'Commissioner', desc: 'I want to post jobs and get parts printed by local partners' },
            { role: 'printer' as const, icon: '🖨️', title: 'Partner', desc: 'I have a 3D printer and want to earn by accepting print jobs' },
          ]).map(({ role, icon, title, desc }) => (
            <button key={role} onClick={() => onSelect(role)}
              className="border-2 border-gray-200 p-6 text-left transition-all"
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1DBF73'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
              <div className="text-3xl mb-4">{icon}</div>
              <p className="font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, phone, province)
      setShowRoleModal(true)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role: 'commissioner' | 'printer') => {
    navigate(role === 'printer' ? '/become-printer' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {showRoleModal && <RoleModal onSelect={handleRoleSelect} />}

      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg, #0a1209 0%, #0f1a14 50%, #162210 100%)' }}>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1DBF73' }}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="6" width="10" height="6" rx="1" fill="white" fillOpacity="0.9"/>
              <path d="M4 6V4a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Print<span style={{ color: '#1DBF73' }}>Match</span>
          </span>
        </div>

        <div>
          <p className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Join Thailand's<br />printing network
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Free to join. No subscription.<br />
            Start posting or accepting jobs today.
          </p>

          <div className="mt-10 space-y-5">
            {[
              'Verified local printing partners',
              'Secure escrow payment system',
              'Real-time progress tracking',
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <span className="font-bold text-sm" style={{ color: '#1DBF73' }}>✓</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 PrintMatch</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white">

        <div className="flex items-center justify-between px-10 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: '#1DBF73' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="6" rx="1" fill="white" fillOpacity="0.9"/>
                <path d="M4 6V4a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Print<span style={{ color: '#1DBF73' }}>Match</span>
            </span>
          </div>
          <div className="ml-auto text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold" style={{ color: '#1DBF73' }}>Sign in</Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 py-16">
          <div className="w-full max-w-sm">

            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Create your account
            </h1>
            <p className="text-sm text-gray-400 mb-8">Free to join — no subscription required</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-red-600 text-sm px-4 py-3 border border-red-200 bg-red-50">
                  {error}
                </div>
              )}

              {([
                { label: 'Full name', type: 'text', value: name, set: setName, placeholder: 'Your name' },
                { label: 'Email address', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com' },
                { label: 'Phone number', type: 'tel', value: phone, set: setPhone, placeholder: '08X-XXX-XXXX' },
              ] as const).map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{field.label}</label>
                  <input
                    type={field.type} value={field.value} onChange={e => field.set(e.target.value)}
                    required placeholder={field.placeholder}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-300"
                    style={{ borderRadius: 0 }}
                    onFocus={e => e.currentTarget.style.borderColor = '#1DBF73'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Province</label>
                <select value={province} onChange={e => setProvince(e.target.value)} required
                  className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition bg-white"
                  style={{ borderRadius: 0 }}
                  onFocus={e => e.currentTarget.style.borderColor = '#1DBF73'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                  <option value="">Select province…</option>
                  {['Bangkok','Chiang Mai','Chiang Rai','Chon Buri','Khon Kaen','Nakhon Ratchasima','Nonthaburi','Pathum Thani','Phuket','Samut Prakan','Samut Sakhon','Songkhla','Surat Thani','Udon Thani','Other'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {([
                { label: 'Password', type: 'password', value: password, set: setPassword, placeholder: 'Min. 6 characters' },
                { label: 'Confirm password', type: 'password', value: confirmPassword, set: setConfirmPassword, placeholder: 'Re-enter password' },
              ] as const).map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{field.label}</label>
                  <input
                    type={field.type} value={field.value} onChange={e => field.set(e.target.value)}
                    required minLength={6} placeholder={field.placeholder}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-300"
                    style={{ borderRadius: 0 }}
                    onFocus={e => e.currentTarget.style.borderColor = '#1DBF73'}
                    onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 text-white text-sm font-bold disabled:opacity-60 transition-colors"
                style={{ background: '#1DBF73', borderRadius: 0 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#19a463' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1DBF73' }}
              >
                {loading ? 'Creating account…' : 'Join PrintMatch'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#1DBF73' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
