import { useState } from 'react'
import { ShieldCheck, Sun, Moon, Monitor, Palette, KeyRound, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LogoMark from '../components/LogoMark'
import FilamentStrip from '../components/FilamentStrip'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return }
    setPwError('')
    setSavingPw(true)
    try {
      await client.patch('/api/auth/password', { current_password: currentPw, new_password: newPw })
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwSuccess(false), 4000)
    } catch (err: any) {
      setPwError(err?.response?.data?.error || 'Failed to update password')
    } finally {
      setSavingPw(false)
    }
  }

  const themeOptions = [
    { key: 'light' as const, label: 'Light', icon: Sun },
    { key: 'dark' as const, label: 'Dark', icon: Moon },
    { key: 'system' as const, label: 'System', icon: Monitor },
  ]

  return (
    <div className="p-6 md:p-8 max-w-3xl animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account, security and preferences" />

      {/* Appearance */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Appearance</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(opt => {
            const active = theme === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                className={`flex flex-col items-center gap-2.5 rounded-md border px-3 py-4 transition-all ${
                  active
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-hairline hover:border-accent/30 text-muted hover:text-base'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Account */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
            <UserCircle className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Account</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-sm bg-accent/10 flex items-center justify-center text-xl font-semibold text-accent shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base truncate">{user?.name}</p>
            <p className="text-sm text-muted truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {user?.is_admin ? (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  Admin
                </span>
              ) : (
                <span className="text-[9px] font-bold bg-brand-50 text-accent px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  {user?.printer_profile_id ? 'Partner' : 'Commissioner'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-hairline">
          <div className="flex items-center gap-3">
            <LogoMark className="w-5 h-5 text-muted" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-base">PrintMatch Account</p>
              <p className="text-[11px] text-muted">ID: {user?.id?.slice(0, 12)}…</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Password */}
      {!user?.is_admin && (
        <Card padding="md">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Change Password</h2>
          </div>

          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            {pwError && (
              <div className="text-danger text-xs px-3 py-2 border border-red-100 bg-red-50 rounded-md">{pwError}</div>
            )}
            {pwSuccess && (
              <div className="text-success text-xs px-3 py-2 border border-emerald-100 bg-emerald-50 rounded-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />Password updated
              </div>
            )}
            <Input label="Current Password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} />
            <Input label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
            <div className="pt-1">
              <Button type="submit" loading={savingPw}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6">
        <FilamentStrip className="opacity-60" />
        <p className="text-[10px] text-muted text-center mt-3 tracking-wide uppercase">PrintMatch v1.0</p>
      </div>
    </div>
  )
}
