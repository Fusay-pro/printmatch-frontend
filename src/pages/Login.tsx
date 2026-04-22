import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

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
            Thailand's 3D<br />printing marketplace
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Connect with verified local printing partners.<br />
            Upload your design, set your budget, get it printed.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { n: '500+', label: 'Verified partners' },
              { n: '72h', label: 'Average turnaround' },
              { n: '4.8★', label: 'Platform rating' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-4">
                <span className="text-lg font-bold" style={{ color: '#1DBF73', fontFamily: "'Outfit', sans-serif" }}>{s.n}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 PrintMatch
        </p>
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
            No account?{' '}
            <Link to="/register" className="font-bold" style={{ color: '#1DBF73' }}>
              Sign up free
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 py-16">
          <div className="w-full max-w-sm">

            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 mb-8">Sign in to your PrintMatch account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-red-600 text-sm px-4 py-3 border border-red-200 bg-red-50">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Email address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-300"
                  style={{ borderRadius: 0 }}
                  onFocus={e => e.currentTarget.style.borderColor = '#1DBF73'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Password
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-300"
                  style={{ borderRadius: 0 }}
                  onFocus={e => e.currentTarget.style.borderColor = '#1DBF73'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 text-white text-sm font-bold transition-colors disabled:opacity-60"
                style={{ background: loading ? '#16a35f' : '#1DBF73', borderRadius: 0 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#19a463' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1DBF73' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              New to PrintMatch?{' '}
              <Link to="/register" className="font-semibold" style={{ color: '#1DBF73' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
