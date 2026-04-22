import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const FILAMENT_COLORS: Record<string, string> = {
  PLA: '#3b82f6', PETG: '#8b5cf6', ABS: '#f59e0b', TPU: '#ec4899',
  Resin: '#14b8a6', Nylon: '#f97316', ASA: '#6366f1', Other: '#6b7280',
}

// Generate a cover gradient from the partner's primary filament
function coverGradient(filaments: string[]): string {
  const primary = filaments?.[0]
  const color = FILAMENT_COLORS[primary] || '#1DBF73'
  return `linear-gradient(135deg, #0c1a12 0%, #0f2318 40%, ${color}22 100%)`
}

interface Partner {
  id: string
  user_id: string
  name: string
  bio: string
  printers_owned: string[]
  filaments: string[]
  printer_wattage: number
  province: string
  district: string
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
  commissioner_name: string
  created_at: string
}

interface PortfolioItem {
  id: string
  image_url: string
  caption: string | null
  created_at: string
}

export default function PartnerView() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null)

  useEffect(() => {
    client.get(`/api/printers/by-user/${userId}`)
      .then(r => {
        setPartner(r.data)
        return Promise.all([
          client.get(`/api/reviews/printer/${r.data.id}`),
          client.get(`/api/portfolio/printer/${r.data.id}`),
        ])
      })
      .then(([revRes, portRes]) => {
        setReviews(revRes.data)
        setPortfolio(portRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>
  if (!partner) return <div className="p-8 text-gray-400 text-sm">Partner not found</div>

  const isOwnProfile = user?.id === userId
  const initials = partner.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const location = [partner.district, partner.province].filter(Boolean).join(', ') || 'Thailand'
  const primaryColor = FILAMENT_COLORS[partner.filaments?.[0]] || '#1DBF73'
  const successRate = partner.jobs_completed > 0
    ? Math.round(((partner.jobs_completed - (partner.failure_count || 0)) / partner.jobs_completed) * 100)
    : 100

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* ── Banner + Avatar (single relative wrapper, no negative margins) ── */}
      <div className="relative" style={{ background: coverGradient(partner.filaments) }}>
        {/* Dot grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" style={{ pointerEvents: 'none' }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-6 z-10 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}>
          ← Back
        </button>

        {/* Banner space */}
        <div style={{ height: '150px' }} />

        {/* Avatar row — sits at the bottom of the banner, white bg starts here */}
        <div className="relative px-8 pt-4 pb-4 flex items-end justify-between"
          style={{ background: '#fff', borderBottom: '1px solid #f3f4f6' }}>

          {/* Avatar — pulled up to overlap the banner */}
          <div className="absolute z-10"
            style={{ top: '-44px', left: '32px' }}>
            <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #1DBF73)`,
                border: '4px solid #fff',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              }}>
              {initials}
            </div>
          </div>

          {/* Space filler so the row has height for the avatar overlap */}
          <div style={{ width: 88 + 32 }} />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={partner.is_available
                ? { background: 'rgba(29,191,115,0.1)', color: '#1DBF73' }
                : { background: '#f3f4f6', color: '#9ca3af' }}>
              {partner.is_available ? '● Available' : '○ Busy'}
            </span>
            {!isOwnProfile && partner.is_available && (
              <button onClick={() => setShowRequest(true)}
                className="text-sm font-bold px-5 py-2 rounded-full text-white transition-colors"
                style={{ background: '#1DBF73' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#19a463')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1DBF73')}>
                Send Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile info ── */}
      <div className="px-8 py-4" style={{ background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        {/* Name + location */}
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {partner.name}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>📍 {location}</p>

        {partner.bio && (
          <p className="text-sm leading-relaxed mt-3 max-w-xl" style={{ color: '#4b5563' }}>
            {partner.bio}
          </p>
        )}

        {/* Filament tags */}
        {(partner.filaments || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {partner.filaments.map(f => (
              <span key={f} className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${FILAMENT_COLORS[f] || '#6b7280'}18`, color: FILAMENT_COLORS[f] || '#6b7280' }}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <Stat value={Number(partner.avg_rating).toFixed(1)} label="Rating" accent="#f59e0b" icon="★" />
          <StatDivider />
          <Stat value={String(partner.total_reviews)} label="Reviews" />
          <StatDivider />
          <Stat value={String(partner.jobs_completed)} label="Orders done" />
          <StatDivider />
          <Stat value={`${successRate}%`} label="Success rate" accent="#1DBF73" />
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.caption || ''}
              className="w-full rounded-2xl object-contain max-h-[80vh]" />
            {lightbox.caption && (
              <p className="text-white text-sm text-center mt-3 opacity-70">{lightbox.caption}</p>
            )}
            <button onClick={() => setLightbox(null)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors">
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="p-8 max-w-3xl space-y-4">

        {/* Portfolio */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Portfolio</p>
            <span className="text-xs text-gray-400">{portfolio.length} {portfolio.length === 1 ? 'project' : 'projects'}</span>
          </div>
          {portfolio.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-2xl mb-2">🖨</p>
              <p className="text-sm font-semibold text-gray-400">No projects yet</p>
              <p className="text-xs text-gray-300 mt-0.5">This partner hasn't uploaded any example prints</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-3 gap-2">
              {portfolio.map(item => (
                <div key={item.id} onClick={() => setLightbox(item)}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-100">
                  <img src={item.image_url} alt={item.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {item.caption && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-2.5">
                      <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Printers */}
        {(partner.printers_owned || []).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Printers</p>
            <div className="flex flex-wrap gap-2">
              {partner.printers_owned.map(p => (
                <span key={p} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full border border-gray-100">
                  <span style={{ color: '#9ca3af' }}>🖨</span> {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Reviews</p>
            <span className="text-xs text-gray-400">{reviews.length} total</span>
          </div>
          {reviews.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-2xl mb-2">✦</p>
              <p className="text-sm font-semibold text-gray-400">No reviews yet</p>
              <p className="text-xs text-gray-300 mt-0.5">Be the first to work with {partner.name.split(' ')[0]}</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="px-6 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1DBF73, #0ea5e9)' }}>
                      {r.commissioner_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{r.commissioner_name}</span>
                  </div>
                  <span className="text-xs text-gray-300 shrink-0">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5 pl-9">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className="text-sm" style={{ color: n <= r.rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                  ))}
                </div>
                {r.comment && <p className="text-sm text-gray-500 leading-relaxed pl-9">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Request Modal */}
      {showRequest && (
        <SendRequestModal
          partner={partner}
          onClose={() => setShowRequest(false)}
          onSent={(convId) => navigate(`/conversations/${convId}`)}
        />
      )}
    </div>
  )
}

function Stat({ value, label, accent, icon }: { value: string; label: string; accent?: string; icon?: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color: accent || '#111827', fontFamily: "'Outfit', sans-serif" }}>
        {icon && <span className="mr-0.5">{icon}</span>}{value}
      </p>
      <p className="text-[11px] text-gray-400 font-medium">{label}</p>
    </div>
  )
}

function StatDivider() {
  return <div className="w-px h-8 bg-gray-100" />
}

// ── Send Request Modal (unchanged logic) ─────────────────────────────────────

function SendRequestModal({ partner, onClose, onSent }: {
  partner: Partner
  onClose: () => void
  onSent: (convId: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState(partner.filaments?.[0] || 'PLA')
  const [isRush, setIsRush] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSubmitting(true); setError('')

    try {
      let file_url: string | null = null
      let file_key: string | null = null

      if (file) {
        const uploadRes = await client.post('/api/upload/stl', {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
        })
        const { upload_url, file_url: fUrl, key } = uploadRes.data
        await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
        })
        file_url = fUrl
        file_key = key
      }

      const convRes = await client.post('/api/conversations', { partner_user_id: partner.user_id })
      const convId = convRes.data.id

      await client.post(`/api/conversations/${convId}/messages`, {
        msg_type: 'request',
        content: JSON.stringify({ title, material, is_rush: isRush, description, file_url, file_key }),
      })

      onSent(convId)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Send Request to {partner.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Describe what you need — negotiate price in chat</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. Dragon figurine 15cm"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition placeholder:text-gray-400" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Colour, finish, scale, any special requirements…"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 resize-none transition placeholder:text-gray-400" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Material *</label>
            <select value={material} onChange={e => setMaterial(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] bg-white">
              {(partner.filaments || []).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={isRush} onChange={e => setIsRush(e.target.checked)} className="w-4 h-4 accent-[#1DBF73]" />
            <span className="text-sm text-gray-700 font-medium">Rush order</span>
          </label>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">STL File <span className="font-normal text-gray-400">(optional)</span></label>
            <input type="file" accept=".stl,.obj" onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1DBF73]/10 file:text-[#1DBF73] hover:file:bg-[#1DBF73]/20 transition" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-50 transition-colors">
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
