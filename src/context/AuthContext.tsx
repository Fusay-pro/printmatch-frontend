import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import client from '../api/client'

interface User {
  id: string
  name: string
  email: string
  printer_profile_id?: string | null
  is_admin?: boolean
}

interface AuthContextType {
  user: User | null
  isPrinter: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone: string, province: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isPrinter = !!user?.printer_profile_id
  const isAdmin = !!user?.is_admin

  const loadUser = async () => {
    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_USER === 'true') {
      setUser({ id: 'mock-1', name: 'Test User', email: 'test@example.com', printer_profile_id: null, is_admin: false })
      setLoading(false)
      return
    }
    try {
      const res = await client.get('/api/auth/me')
      setUser(res.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUser() }, [])

  const login = async (email: string, password: string) => {
    const res = await client.post('/api/auth/login', { email, password })
    setUser(res.data.user)
  }

  const register = async (name: string, email: string, password: string, phone: string, province: string) => {
    const res = await client.post('/api/auth/register', { name, email, password, phone, province })
    setUser(res.data.user)
  }

  const logout = async () => {
    await client.post('/api/auth/logout').catch(() => {})
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await client.get('/api/auth/me')
      setUser(res.data)
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, isPrinter, isAdmin, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
