import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const FILAMENTS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon', 'ASA', 'Other']

interface PartnerProfile {
  id: string
  bio: string
  printers_owned: string[]
  filaments: string[]
  printer_wattage: number
  avg_rating: number
  total_reviews: number
  jobs_completed: number
  failure_count: number
  is_available: boolean
  province: string
  district: string
  phone: string
  line_id: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()

  // ── Account edit state ──────────────────────────────
  const [name, setName] = useState(user?.name ?? '')
  const [address, setAddress] = useState((user as any)?.address ?? '')
  const [savingAccount, setSavingAccount] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)

  // ── Partner profile state ───────────────────────────
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [loadingPartner, setLoadingPartner] = useState(false)
  const [editingPartner, setEditingPartner] = useState(false)
  const [savingPartner, setSavingPartner] = useState(false)

  const [bio, setBio] = useState('')
  const [printers, setPrinters] = useState('')
  const [selectedFilaments, setSelectedFilaments] = useState<string[]>([])
  const [wattage, setWattage] = useState('250')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [phone, setPhone] = useState('')
  const [lineId, setLineId] = useState('')

  useEffect(() => {
    if (user?.printer_profile_id) {
      setLoadingPartner(true)
      client.get(`/api/printers/${user.printer_profile_id}`)
        .then(r => { setPartner(r.data); populateForm(r.data) })
        .catch(() => {})
        .finally(() => setLoadingPartner(false))
    }
  }, [user?.printer_profile_id])

  // sync address from user once loaded
  useEffect(() => {
    setName(user?.name ?? '')
    setAddress((user as any)?.address ?? '')
  }, [user])

  const populateForm = (p: PartnerProfile) => {
    setBio(p.bio || '')
    setPrinters((p.printers_owned || []).join(', '))
    setSelectedFilaments(p.filaments || [])
    setWattage(String(p.printer_wattage || 250))
    setProvince(p.province || '')
    setDistrict(p.district || '')
    setPhone(p.phone || '')
    setLineId(p.line_id || '')
  }

  const saveAccount = async () => {
    setSavingAccount(true)
    try {
      await client.patch('/api/auth/me', { name: name.trim() || undefined, address: address || null })
      await refreshUser()
      setAccountSaved(true)
      setTimeout(() => setAccountSaved(false), 3000)
    } catch { /* ignore */ }
    finally { setSavingAccount(false) }
  }

  const savePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partner) return
    setSavingPartner(true)
    try {
      const res = await client.patch(`/api/printers/${partner.id}`, {
        bio,
        printers_owned: printers.split(',').map(p => p.trim()).filter(Boolean),
        filaments: selectedFilaments,
        printer_wattage: Number(wattage) || 250,
        province, district, phone, line_id: lineId,
      })
      setPartner(p => p ? { ...p, ...res.data } : p)
      setEditingPartner(false)
    } catch { /* ignore */ }
    finally { setSavingPartner(false) }
  }

  const toggleAvailability = async () => {
    if (!partner) return
    const res = await client.patch(`/api/printers/${partner.id}`, { is_available: !partner.is_available })
    setPartner(p => p ? { ...p, is_available: res.data.is_available } : p)
  }

  return (
    <div className="p-8 max-w-5xl" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          My Profile
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account and partner settings</p>
      </div>

      <div className={`flex flex-col ${user?.printer_profile_id ? 'lg:flex-row' : ''} gap-5 items-start`}>

      {/* ── Account card ─────────────────────────────── */}
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full ${user?.printer_profile_id ? 'lg:w-80 shrink-0' : 'max-w-lg'}`}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Account</h2>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#1DBF73]/10 flex items-center justify-center text-2xl font-bold text-[#1DBF73] shrink-0">
            {name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Display Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input readOnly value={user?.email ?? ''}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Delivery Address
            </label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
              placeholder="Full address for receiving deliveries…"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition resize-none placeholder:text-gray-400" />
            <p className="text-xs text-gray-400 mt-1">Used when a partner ships your completed print</p>
          </div>

          <button onClick={saveAccount} disabled={savingAccount}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-60 transition-colors">
            {savingAccount ? 'Saving…' : accountSaved ? '✓ Saved' : 'Save Account'}
          </button>
        </div>
      </div>

      {/* ── Partner profile card ──────────────────────── */}
      {user?.printer_profile_id && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Partner Profile</h2>
            </div>
            <div className="flex items-center gap-2">
              {partner && (
                <button onClick={toggleAvailability}
                  className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-colors ${
                    partner.is_available
                      ? 'bg-[#1DBF73]/10 text-[#1DBF73] border-[#1DBF73]/30'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                  {partner.is_available ? '● Available' : '○ Unavailable'}
                </button>
              )}
              <button onClick={() => { setEditingPartner(e => !e); if (partner) populateForm(partner) }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                {editingPartner ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {loadingPartner ? (
            <p className="text-gray-400 text-sm py-4">Loading...</p>
          ) : partner && !editingPartner ? (
            <div className="space-y-5 text-sm">

              {/* Stats report */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Commissions', value: partner.jobs_completed, color: 'text-[#1DBF73]' },
                  { label: 'Avg Rating', value: `★ ${Number(partner.avg_rating).toFixed(1)}`, color: 'text-amber-500' },
                  { label: 'Reviews', value: partner.total_reviews, color: 'text-gray-800' },
                  { label: 'Failures', value: partner.failure_count, color: partner.failure_count > 0 ? 'text-red-500' : 'text-gray-400' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {partner.bio && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                  <p className="text-gray-700 leading-relaxed">{partner.bio}</p>
                </div>
              )}

              {/* Printers */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Printers Owned</p>
                <div className="flex flex-wrap gap-1.5">
                  {(partner.printers_owned ?? []).length > 0
                    ? partner.printers_owned.map(p => (
                        <span key={p} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold">{p}</span>
                      ))
                    : <span className="text-gray-400">—</span>
                  }
                </div>
              </div>

              {/* Filaments */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Filaments Supported</p>
                <div className="flex flex-wrap gap-1.5">
                  {(partner.filaments ?? []).length > 0
                    ? partner.filaments.map(f => (
                        <span key={f} className="text-xs bg-[#1DBF73]/10 text-[#1DBF73] px-3 py-1.5 rounded-full font-bold">{f}</span>
                      ))
                    : <span className="text-gray-400">—</span>
                  }
                </div>
              </div>

              {/* Wattage */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Printer Wattage</p>
                <p className="text-gray-700 font-medium">{partner.printer_wattage ?? 250} W</p>
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-gray-700 font-medium">
                    {[partner.district, partner.province].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-gray-700 font-medium">{partner.phone || '—'}</p>
                </div>
                {partner.line_id && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Line ID</p>
                    <p className="text-gray-700 font-medium">{partner.line_id}</p>
                  </div>
                )}
              </div>
            </div>

          ) : partner && editingPartner ? (
            <form onSubmit={savePartner} className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 resize-none transition" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Printers Owned</label>
                <input value={printers} onChange={e => setPrinters(e.target.value)}
                  placeholder="Bambu Lab X1C, Ender 3 V3"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition placeholder:text-gray-400" />
                <p className="text-xs text-gray-400 mt-1">Separate multiple printers with commas</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Filaments Supported</label>
                <div className="flex flex-wrap gap-2">
                  {FILAMENTS.map(f => (
                    <button key={f} type="button"
                      onClick={() => setSelectedFilaments(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f])}
                      className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-colors ${
                        selectedFilaments.includes(f)
                          ? 'bg-[#1DBF73] border-[#1DBF73] text-white'
                          : 'border-gray-200 text-gray-500 hover:border-[#1DBF73] hover:text-[#1DBF73]'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Printer Wattage (W)</label>
                <input type="number" min="1" value={wattage} onChange={e => setWattage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition" />
                <p className="text-xs text-gray-400 mt-1">Used to calculate electricity cost in quotes</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Province</label>
                  <input value={province} onChange={e => setProvince(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
                  <input value={district} onChange={e => setDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Line ID</label>
                  <input value={lineId} onChange={e => setLineId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={savingPartner}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-60 transition-colors">
                  {savingPartner ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingPartner(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      )}

      </div>{/* end flex row */}
    </div>
  )
}
