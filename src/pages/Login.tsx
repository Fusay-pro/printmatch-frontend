import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

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
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
        <div>
          <h1 className="text-lg font-semibold text-base font-display tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to your PrintMatch account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-danger text-xs px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <Button type="submit" loading={loading} fullWidth>
          Sign In
        </Button>

        <p className="text-center text-xs text-muted">
          No account?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
