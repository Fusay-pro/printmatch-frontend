import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { Star, MapPin } from 'lucide-react'

interface Partner {
  id: string
  user_id: string
  user_name: string
  bio: string
  printers_owned: string[]
  filaments: string[]
  avg_rating: number
  total_reviews: number
  jobs_completed: number
  failure_count: number
  province: string
  district: string
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

export default function PartnerView() {
  const { userId, id } = useParams<{ userId?: string; id?: string }>()
  const profileKey = userId ?? id
  const [partner, setPartner] = useState<Partner | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequest, setShowRequest] = useState(false)

  useEffect(() => {
    if (!profileKey) {
      setLoading(false)
      return
    }

    const normalizePartner = (raw: any): Partner => ({
      id: String(raw?.id ?? ''),
      user_id: String(raw?.user_id ?? profileKey),
      user_name: String(raw?.user_name ?? raw?.name ?? 'Partner'),
      bio: String(raw?.bio ?? ''),
      printers_owned: Array.isArray(raw?.printers_owned) ? raw.printers_owned : [],
      filaments: Array.isArray(raw?.filaments) ? raw.filaments : [],
      avg_rating: Number(raw?.avg_rating ?? 0),
      total_reviews: Number(raw?.total_reviews ?? 0),
      jobs_completed: Number(raw?.jobs_completed ?? 0),
      failure_count: Number(raw?.failure_count ?? 0),
      province: String(raw?.province ?? ''),
      district: String(raw?.district ?? ''),
    })

    const load = async () => {
      setLoading(true)
      try {
        const pRes = await client
          .get(`/api/printers/by-user/${profileKey}`)
          .catch(() => client.get(`/api/printers/${profileKey}`))

        const normalized = normalizePartner(pRes.data)
        const partnerId = normalized.id

        const [rRes, portRes] = await Promise.all([
          client
            .get(`/api/printers/${partnerId}/reviews`)
            .catch(() => client.get(`/api/reviews/printer/${partnerId}`)),
          client.get(`/api/portfolio/printer/${partnerId}`),
        ])

        setPartner(normalized)
        setReviews(Array.isArray(rRes.data) ? rRes.data : [])
        setPortfolio(Array.isArray(portRes.data) ? portRes.data : [])
      } catch {
        setPartner(null)
        setReviews([])
        setPortfolio([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [profileKey])

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto font-sans animate-fade-in space-y-6">
        <Skeleton variant="text" width="50%" height="32px" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="card" height="80px" />)}
        </div>
        <Skeleton variant="card" height="200px" />
      </div>
    )
  }

  if (!partner) return <div className="p-8 text-muted text-sm">Partner not found</div>

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-base">{partner.user_name}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {Number(partner.avg_rating).toFixed(1)}
            </span>
            <span>·</span>
            <span>{partner.jobs_completed} jobs</span>
            {(partner.province || partner.district) && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[partner.district, partner.province].filter(Boolean).join(', ')}
                </span>
              </>
            )}
          </div>
        </div>
        <Button onClick={() => setShowRequest(true)}>Send Request</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat value={Number(partner.avg_rating).toFixed(1)} label="Avg Rating" accent="text-amber-500" />
        <Stat value={String(partner.total_reviews)} label="Reviews" />
        <Stat value={String(partner.jobs_completed)} label="Jobs Done" accent="text-emerald-600" />
        <Stat value={String(partner.failure_count)} label="Failures" accent={partner.failure_count > 0 ? 'text-danger' : 'text-muted'} />
      </div>

      <div className="space-y-5">
        {/* Bio */}
        <Card>
          {partner.bio ? (
            <p className="text-sm text-base/80 leading-relaxed">{partner.bio}</p>
          ) : (
            <p className="text-sm text-muted italic">No bio provided</p>
          )}
        </Card>

        {/* Printers */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-hairline">
            <h2 className="text-sm font-semibold text-base">Printers</h2>
          </div>
          <div className="px-6 py-4">
            {partner.printers_owned?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partner.printers_owned.map(p => (
                  <span key={p} className="text-xs bg-surface text-base/70 border border-hairline px-3 py-1.5 rounded-sm font-medium">{p}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No printers listed</p>
            )}
          </div>
        </Card>

        {/* Filaments */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-hairline">
            <h2 className="text-sm font-semibold text-base">Filaments</h2>
          </div>
          <div className="px-6 py-4">
            {partner.filaments?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partner.filaments.map(f => (
                  <span key={f} className="text-xs bg-surface text-base/70 border border-hairline px-3 py-1.5 rounded-sm font-medium">{f}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No filaments listed</p>
            )}
          </div>
        </Card>

        {/* Portfolio */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-hairline">
            <h2 className="text-sm font-semibold text-base">Portfolio</h2>
          </div>
          {portfolio.length === 0 ? (
            <EmptyState title="No portfolio items" description="This partner hasn't uploaded any prints yet." />
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {portfolio.map(item => (
                <div key={item.id} className="relative aspect-square rounded-md overflow-hidden group bg-surface">
                  <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover" />
                  {item.caption && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 px-2 text-center transition-opacity">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Reviews */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-hairline">
            <h2 className="text-sm font-semibold text-base">Reviews ({reviews.length})</h2>
          </div>
          {reviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Be the first to commission a print and leave a review." />
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
                  {r.comment && <p className="text-sm text-base/70">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showRequest && (
        <SendRequestModal partner={partner} onClose={() => setShowRequest(false)} onSent={() => setShowRequest(false)} />
      )}
    </div>
  )
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <Card padding="md" className="text-center">
      <p className={`text-xl font-bold ${accent || 'text-base'}`}>{value}</p>
      <p className="text-muted text-xs mt-0.5">{label}</p>
    </Card>
  )
}

function SendRequestModal({ partner, onClose, onSent }: {
  partner: Partner
  onClose: () => void
  onSent: () => void
}) {
  const [title, setTitle] = useState('')
  const [material, setMaterial] = useState(partner.filaments?.[0] || 'PLA')
  const [isRush, setIsRush] = useState(false)
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || sending) return
    setSending(true)
    try {
      const payload = {
        title: title.trim(),
        material,
        is_rush: isRush,
        description: description.trim() || null,
      }

      try {
        await client.post('/api/conversations', {
          partner_user_id: partner.user_id,
          request: payload,
        })
        onSent()
      } catch {
        const convRes = await client.post('/api/conversations', { partner_user_id: partner.user_id })
        const convId = convRes.data?.id
        if (!convId) throw new Error('Failed to create conversation')
        await client.post(`/api/conversations/${convId}/messages`, {
          msg_type: 'request',
          content: JSON.stringify(payload),
        })
        onSent()
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to send request')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--color-sidebar-bg)] rounded-lg shadow-modal w-full max-w-md font-sans">
        <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
          <h2 className="text-base font-semibold text-base">Send Request</h2>
          <button onClick={onClose} className="text-muted hover:text-base transition-colors"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-base/80 uppercase tracking-wide mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="What do you need printed?"
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-base/80 uppercase tracking-wide mb-1">Material</label>
            <select value={material} onChange={e => setMaterial(e.target.value)}
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-[var(--color-sidebar-bg)] transition">
              {partner.filaments?.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={isRush} onChange={e => setIsRush(e.target.checked)} className="accent-accent" />
              <span className="text-sm text-base/80">Rush order</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-base/80 uppercase tracking-wide mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Any specific details..."
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-muted transition" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={sending} fullWidth>{sending ? 'Sending…' : 'Send Request'}</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
  )
}
