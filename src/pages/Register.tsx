import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Printer, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function RoleModal({ onSelect }: { onSelect: (role: 'commissioner' | 'printer') => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 font-sans">
      <div className="bg-[var(--color-sidebar-bg)] shadow-modal p-6 w-full max-w-sm rounded-lg border border-hairline animate-fade-in">
        <h2 className="text-lg font-semibold text-base mb-1 font-display tracking-tight">
          What brings you here?
        </h2>
        <p className="text-muted text-sm mb-6">You can always switch later from your settings.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            { role: 'commissioner' as const, icon: <ClipboardList className="w-5 h-5" />, title: 'Commissioner', desc: 'Post jobs and get parts printed' },
            { role: 'printer' as const, icon: <Printer className="w-5 h-5" />, title: 'Partner', desc: 'Earn by accepting print jobs' },
          ]).map(({ role, icon, title, desc }) => (
            <button key={role} onClick={() => onSelect(role)}
              className="border border-hairline p-4 text-left transition-colors rounded-md hover:border-accent hover:bg-brand-50">
              <div className="text-accent mb-2">{icon}</div>
              <p className="font-medium text-base text-sm mb-0.5">{title}</p>
              <p className="text-muted text-[11px] leading-relaxed">{desc}</p>
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
    <AuthLayout>
      {showRoleModal && <RoleModal onSelect={handleRoleSelect} />}

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-lg font-semibold text-base font-display tracking-tight">Create your account</h1>
          <p className="text-sm text-muted mt-1">Get started in under a minute</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-danger text-xs px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required placeholder="Natthapong K." />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        <Input label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+66 8X XXX XXXX" />
        <Input label="Province" value={province} onChange={e => setProvince(e.target.value)} required placeholder="Bangkok" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat password" />

        <Button type="submit" loading={loading} fullWidth>
          Create Account
        </Button>

        <p className="text-center text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
