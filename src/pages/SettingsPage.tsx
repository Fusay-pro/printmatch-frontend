import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function SettingsPage() {
  const { user } = useAuth()

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

  return (
    <div className="p-8 max-w-2xl" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account security</p>
      </div>

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1DBF73]/10 flex items-center justify-center text-xl font-bold text-[#1DBF73] shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {user?.is_admin && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
            )}
          </div>
        </div>
      </div>

      {/* Change password — hidden for admins */}
      {!user?.is_admin && <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Change Password</h2>

        <form onSubmit={changePassword} className="space-y-4 max-w-sm">
          {pwError && (
            <div className="text-red-600 text-sm px-4 py-3 border border-red-200 bg-red-50 rounded-xl">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="text-green-700 text-sm px-4 py-3 border border-green-200 bg-green-50 rounded-xl">Password updated successfully</div>
          )}

          {([
            { label: 'Current Password', value: currentPw, set: setCurrentPw },
            { label: 'New Password', value: newPw, set: setNewPw },
            { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
          ] as const).map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input
                type="password" value={f.value} onChange={e => f.set(e.target.value)} required minLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition"
              />
            </div>
          ))}

          <button type="submit" disabled={savingPw}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-60 transition-colors">
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>}
    </div>
  )
}
