import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { Star, CheckCircle2, Zap, Printer, Tag } from 'lucide-react'
import FilamentStrip from '../components/FilamentStrip'
import LogoMark from '../components/LogoMark'

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

  const [name, setName] = useState(user?.name ?? '')
  const [address, setAddress] = useState((user as any)?.address ?? '')
  const [savingAccount, setSavingAccount] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)

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
    <div className="p-6 md:p-8 max-w-5xl animate-fade-in font-sans">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account and partner settings"
      />

      <div className={`flex flex-col ${user?.printer_profile_id ? 'lg:flex-row' : ''} gap-5 items-start`}>

        {/* Account card */}
        <Card className={`w-full ${user?.printer_profile_id ? 'lg:w-64 shrink-0' : 'max-w-lg'}`}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
              <LogoMark className="w-4 h-4" />
            </div>
            <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Account</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-sm bg-accent/10 flex items-center justify-center text-2xl font-semibold text-accent shrink-0">
              {name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-base truncate">{user?.name}</p>
              <p className="text-sm text-muted truncate">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label="Display Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted uppercase tracking-wide">Email</label>
              <input readOnly value={user?.email ?? ''}
                className="w-full border border-hairline rounded-md px-4 py-2.5 text-sm text-muted bg-[var(--color-sidebar-bg)] cursor-not-allowed" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted uppercase tracking-wide">
                Delivery Address
              </label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                placeholder="Full address for receiving deliveries…"
                className="w-full border border-hairline rounded-md px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-muted transition bg-[var(--color-sidebar-bg)]" />
              <p className="text-xs text-muted mt-1">Used when a partner ships your completed print</p>
            </div>

            <Button onClick={saveAccount} loading={savingAccount} size="sm">
              {savingAccount ? 'Saving…' : accountSaved ? <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span> : 'Save Account'}
            </Button>
          </div>
        </Card>

        {/* Partner profile card */}
        {user?.printer_profile_id && (
          <Card className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Partner Profile</h2>
              </div>
              <div className="flex items-center gap-2">
                {partner && (
                  <button onClick={toggleAvailability}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      partner.is_available
                        ? 'bg-accent/5 text-accent border-accent/20'
                        : 'bg-[var(--color-sidebar-bg)] text-muted border-hairline'
                    }`}>
                    {partner.is_available ? 'Available' : 'Unavailable'}
                  </button>
                )}
                <Button variant="secondary" size="sm" onClick={() => { setEditingPartner(e => !e); if (partner) populateForm(partner) }}>
                  {editingPartner ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </div>

            {loadingPartner ? (
              <div className="space-y-4">
                <Skeleton lines={3} />
                <div className="grid grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} variant="card" height="80px" />)}
                </div>
              </div>
            ) : partner && !editingPartner ? (
              <div className="space-y-5 text-sm">
                {/* Stats report */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Commissions', value: partner.jobs_completed, color: 'text-accent', icon: Zap },
                    { label: 'Avg Rating', value: `★ ${Number(partner.avg_rating).toFixed(1)}`, color: 'text-amber-500', icon: Star },
                    { label: 'Reviews', value: partner.total_reviews, color: 'text-base', icon: Tag },
                    { label: 'Failures', value: partner.failure_count, color: partner.failure_count > 0 ? 'text-danger' : 'text-muted', icon: null as any },
                  ].map(s => (
                    <div key={s.label} className="bg-[var(--color-sidebar-bg)] rounded-md p-3 text-center border border-hairline">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="layer-line" />

                {partner.bio && (
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-base/70 leading-relaxed">{partner.bio}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Printers Owned</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(partner.printers_owned ?? []).length > 0
                      ? partner.printers_owned.map(p => (
                          <span key={p} className="text-xs bg-[var(--color-sidebar-bg)] text-base/70 border border-hairline px-3 py-1.5 rounded-sm font-medium">{p}</span>
                        ))
                      : <span className="text-muted">—</span>
                    }
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Filaments Supported</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(partner.filaments ?? []).length > 0
                      ? partner.filaments.map(f => (
                          <span key={f} className="text-xs bg-accent/5 text-accent border border-accent/10 px-3 py-1.5 rounded-sm font-medium">{f}</span>
                        ))
                      : <span className="text-muted">—</span>
                    }
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Printer Wattage</p>
                    <p className="text-base/70 font-medium">{partner.printer_wattage ?? 250} W</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-base/70 font-medium">{partner.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Location</p>
                    <p className="text-base/70 font-medium">
                      {[partner.district, partner.province].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>
                  {partner.line_id && (
                    <div>
                      <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Line ID</p>
                      <p className="text-base/70 font-medium">{partner.line_id}</p>
                    </div>
                  )}
                </div>
              </div>

            ) : partner && editingPartner ? (
              <form onSubmit={savePartner} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted uppercase tracking-wide">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    className="w-full border border-hairline rounded-md px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none transition bg-[var(--color-sidebar-bg)]" />
                </div>

                <Input
                  label="Printers Owned"
                  value={printers}
                  onChange={e => setPrinters(e.target.value)}
                  placeholder="Bambu Lab X1C, Ender 3 V3"
                  hint="Separate multiple printers with commas"
                />

                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-2">Filaments Supported</label>
                  <div className="flex flex-wrap gap-2">
                    {FILAMENTS.map(f => (
                      <button key={f} type="button"
                        onClick={() => setSelectedFilaments(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f])}
                        className={`text-xs px-3 py-1.5 rounded-sm border font-medium transition-colors ${
                          selectedFilaments.includes(f)
                            ? 'bg-accent border-accent text-white'
                            : 'border-hairline text-muted hover:border-accent hover:text-accent'
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  type="number" min="1"
                  label="Printer Wattage (W)"
                  value={wattage}
                  onChange={e => setWattage(e.target.value)}
                  hint="Used to calculate electricity cost in quotes"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Province" value={province} onChange={e => setProvince(e.target.value)} />
                  <Input label="District" value={district} onChange={e => setDistrict(e.target.value)} />
                  <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                  <Input label="Line ID" value={lineId} onChange={e => setLineId(e.target.value)} />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button type="submit" loading={savingPartner} size="sm">
                    {savingPartner ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditingPartner(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}
          </Card>
        )}
      </div>

      {!user?.printer_profile_id && (
        <div className="mt-6 max-w-lg">
          <FilamentStrip className="opacity-60" />
        </div>
      )}
    </div>
  )
}
