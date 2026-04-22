import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

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

  if (loading) return <div className="p-8 text-zinc-400 text-sm">Loading...</div>
  if (!profile) return <div className="p-8 text-zinc-400 text-sm">Profile not found</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{user?.name}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Printer Profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAvailability}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              profile.is_available
                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {profile.is_available ? '● Available' : '○ Unavailable'}
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-4 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Rating', value: `★ ${Number(profile.avg_rating).toFixed(1)}`, color: 'text-amber-500' },
          { label: 'Reviews', value: profile.total_reviews, color: 'text-zinc-900' },
          { label: 'Jobs Done', value: profile.jobs_completed, color: 'text-green-600' },
          { label: 'Failures', value: profile.failure_count, color: profile.failure_count > 0 ? 'text-red-500' : 'text-zinc-400' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-zinc-700">Profile Details</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Machine rate (฿/hr)</label>
                <input type="number" value={ratePerHour} onChange={e => setRatePerHour(e.target.value)} required
                  className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Printers owned</label>
                <input value={printers} onChange={e => setPrinters(e.target.value)} placeholder="Bambu X1C, Ender 3"
                  className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Material Prices (฿/g)</h2>
            <div className="grid grid-cols-2 gap-3">
              {MATERIALS.map(m => (
                <div key={m} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-600 w-12 shrink-0">{m}</span>
                  <input type="number" min="0" step="0.01"
                    value={materialPrices[m] || ''}
                    onChange={e => setMaterialPrices(p => ({ ...p, [m]: e.target.value }))}
                    className="flex-1 bg-white border border-zinc-300 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
                    placeholder="0.00" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors shadow-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            {profile.bio && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Bio</p>
                <p className="text-zinc-700 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Machine Rate</p>
                <p className="font-semibold text-zinc-900">฿{Number(profile.rate_per_hour).toLocaleString()}/hr</p>
              </div>
              {profile.printers_owned?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Printers</p>
                  <p className="font-medium text-zinc-700">{profile.printers_owned.join(', ')}</p>
                </div>
              )}
            </div>
            {profile.material_prices && Object.keys(profile.material_prices).length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Materials</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.material_prices).map(([mat, price]) => (
                    <span key={mat} className="text-xs bg-zinc-100 text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-lg font-medium">
                      {mat} · ฿{Number(price).toFixed(2)}/g
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-700">Reviews ({reviews.length})</h2>
            </div>
            {reviews.length === 0 ? (
              <p className="px-6 py-8 text-zinc-400 text-sm text-center">No reviews yet</p>
            ) : (
              <div className="divide-y divide-zinc-50">
                {reviews.map(r => (
                  <div key={r.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-zinc-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="text-zinc-600 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Portfolio ── */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-700">Portfolio Showcase</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Show commissioners your best prints ({portfolio.length}/12)</p>
              </div>
            </div>

            {/* Upload row */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'bg-[#1DBF73]/10 text-[#1DBF73] hover:bg-[#1DBF73]/20'
              }`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M4 4l3-3 3 3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {uploading ? 'Uploading…' : 'Upload Photo'}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" disabled={uploading || portfolio.length >= 12}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadPortfolioImage(f) }} />
              </label>
              <input value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1DBF73] placeholder:text-zinc-400" />
            </div>

            {/* Grid */}
            {portfolio.length === 0 ? (
              <p className="px-6 py-8 text-zinc-400 text-sm text-center">
                No photos yet — upload your best prints to impress commissioners
              </p>
            ) : (
              <div className="p-4 grid grid-cols-3 gap-2">
                {portfolio.map(item => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group bg-zinc-100">
                    <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2">
                      {item.caption && (
                        <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 px-2 text-center line-clamp-2 transition-opacity">
                          {item.caption}
                        </p>
                      )}
                      <button onClick={() => deletePortfolioItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
