import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { Star, Upload, Trash2 } from 'lucide-react'

const MATERIALS = ['PLA', 'ABS', 'PETG', 'resin', 'TPU', 'nylon', 'other']

interface Profile {
  id: string
  bio: string
  rate_per_hour: number
  material_prices: Record<string, number>
  printers_owned: string[]
  avg_rating: number
  total_reviews: number
  jobs_completed: number
  failure_count: number
  is_available: boolean
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
}

interface PortfolioItem {
  id: string
  image_url: string
  caption: string | null
  created_at: string
}

export default function PrinterProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [bio, setBio] = useState('')
  const [ratePerHour, setRatePerHour] = useState('')
  const [printers, setPrinters] = useState('')
  const [materialPrices, setMaterialPrices] = useState<Record<string, string>>(
    Object.fromEntries(MATERIALS.map(m => [m, '']))
  )

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    if (!user?.printer_profile_id) return
    try {
      const [pRes, rRes, portRes] = await Promise.all([
        client.get(`/api/printers/${user.printer_profile_id}`),
        client.get(`/api/printers/${user.printer_profile_id}/reviews`),
        client.get(`/api/portfolio/printer/${user.printer_profile_id}`),
      ])
      const p: Profile = pRes.data
      setProfile(p)
      setReviews(rRes.data || [])
      setPortfolio(portRes.data || [])
      setBio(p.bio || '')
      setRatePerHour(String(p.rate_per_hour))
      setPrinters((p.printers_owned || []).join(', '))
      const prices = Object.fromEntries(MATERIALS.map(m => [m, '']))
      Object.entries(p.material_prices || {}).forEach(([k, v]) => { prices[k] = String(v) })
      setMaterialPrices(prices)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const uploadPortfolioImage = async (file: File) => {
    setUploading(true)
    try {
      const uploadRes = await client.post('/api/upload/photo', {
        filename: file.name,
        content_type: file.type || 'image/jpeg',
      })
      const { upload_url, file_url, key } = uploadRes.data
      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      })
      await client.post('/api/portfolio', { image_url: file_url, image_key: key, caption: caption.trim() || null })
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
      fetchProfile()
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deletePortfolioItem = async (id: string) => {
    await client.delete(`/api/portfolio/${id}`)
    setPortfolio(p => p.filter(x => x.id !== id))
  }

  const toggleAvailability = async () => {
    if (!profile) return
    await client.patch(`/api/printers/${profile.id}`, { is_available: !profile.is_available })
    fetchProfile()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const filteredPrices = Object.fromEntries(
      Object.entries(materialPrices).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)])
    )
    try {
      await client.patch(`/api/printers/${user?.printer_profile_id}`, {
        bio, rate_per_hour: Number(ratePerHour),
        material_prices: filteredPrices,
        printers_owned: printers.split(',').map(p => p.trim()).filter(Boolean),
      })
      setEditing(false); fetchProfile()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto font-sans animate-fade-in">
        <Skeleton lines={2} className="mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="card" height="96px" />)}
        </div>
        <Skeleton variant="card" height="300px" />
      </div>
    )
  }
  if (!profile) return <div className="p-8 text-muted text-sm">Profile not found</div>

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto font-sans animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-base">{user?.name}</h1>
          <p className="text-muted text-sm mt-0.5">Printer Profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAvailability}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              profile.is_available
                ? 'bg-emerald-50 text-success border-emerald-100 hover:bg-emerald-100'
                : 'bg-surface text-muted border-hairline hover:bg-surface'
            }`}
          >
            {profile.is_available ? 'Available' : 'Unavailable'}
          </button>
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Rating', value: `★ ${Number(profile.avg_rating).toFixed(1)}`, color: 'text-amber-500' },
          { label: 'Reviews', value: profile.total_reviews, color: 'text-base' },
          { label: 'Jobs Done', value: profile.jobs_completed, color: 'text-success' },
          { label: 'Failures', value: profile.failure_count, color: profile.failure_count > 0 ? 'text-danger' : 'text-muted' },
        ].map(s => (
          <Card key={s.label} padding="md" className="text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted text-xs mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-100 text-danger text-sm px-4 py-3 rounded-md">{error}</div>}

          <Card>
            <h2 className="text-sm font-medium text-base/80 mb-4">Profile Details</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-base/80 uppercase tracking-wide">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none transition" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Machine rate (฿/hr)"
                  value={ratePerHour}
                  onChange={e => setRatePerHour(e.target.value)}
                  required
                />
                <Input
                  label="Printers owned"
                  value={printers}
                  onChange={e => setPrinters(e.target.value)}
                  placeholder="Bambu X1C, Ender 3"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-medium text-base/80 mb-4">Material Prices (฿/g)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATERIALS.map(m => (
                <div key={m} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-base/70 w-12 shrink-0">{m}</span>
                  <input type="number" min="0" step="0.01"
                    value={materialPrices[m] || ''}
                    onChange={e => setMaterialPrices(p => ({ ...p, [m]: e.target.value }))}
                    className="flex-1 bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition"
                    placeholder="0.00" />
                </div>
              ))}
            </div>
          </Card>

          <Button type="submit" loading={saving} size="lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      ) : (
        <div className="space-y-5">
          <Card>
            {profile.bio ? (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Bio</p>
                <p className="text-base/80 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            ) : (
              <p className="text-sm text-muted italic">No bio provided</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Machine Rate</p>
                <p className="font-semibold text-base">฿{Number(profile.rate_per_hour).toLocaleString()}/hr</p>
              </div>
              {profile.printers_owned?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Printers</p>
                  <p className="font-medium text-base/70">{profile.printers_owned.join(', ')}</p>
                </div>
              )}
            </div>
            {profile.material_prices && Object.keys(profile.material_prices).length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Materials</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.material_prices).map(([mat, price]) => (
                    <span key={mat} className="text-xs bg-surface text-base/70 border border-hairline px-3 py-1.5 rounded-sm font-medium">
                      {mat} · ฿{Number(price).toFixed(2)}/g
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card padding="none">
            <div className="px-6 py-4 border-b border-hairline">
              <h2 className="text-sm font-medium text-base/80">Reviews ({reviews.length})</h2>
            </div>
            {reviews.length === 0 ? (
              <p className="px-6 py-8 text-muted text-sm text-center">No reviews yet</p>
            ) : (
              <div className="divide-y divide-hairline">
                {reviews.map(r => (
                  <div key={r.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-hairline'}`} />
                        ))}
                      </span>
                      <span className="text-muted text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="text-base/70 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Portfolio */}
          <Card padding="none">
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-base/80">Portfolio Showcase</h2>
                <p className="text-xs text-muted mt-0.5">Show commissioners your best prints ({portfolio.length}/12)</p>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-hairline flex flex-wrap items-center gap-3">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'bg-accent/5 text-accent hover:bg-accent/10'
              }`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading…' : 'Upload Photo'}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" disabled={uploading || portfolio.length >= 12}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadPortfolioImage(f) }} />
              </label>
              <input value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="flex-1 min-w-0 border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition" />
            </div>

            {portfolio.length === 0 ? (
              <p className="px-6 py-8 text-muted text-sm text-center">
                No photos yet — upload your best prints to impress commissioners
              </p>
            ) : (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {portfolio.map(item => (
                  <div key={item.id} className="relative aspect-square rounded-md overflow-hidden group bg-surface">
                    <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2">
                      {item.caption && (
                        <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 px-2 text-center line-clamp-2 transition-opacity">
                          {item.caption}
                        </p>
                      )}
                      <button onClick={() => deletePortfolioItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-danger hover:bg-danger/90 text-white text-xs font-medium px-3 py-1 rounded-sm flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
