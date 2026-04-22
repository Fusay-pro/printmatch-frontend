import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const FILAMENTS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon', 'ASA']
const FILAMENT_COLORS: Record<string, string> = {
  PLA: '#3b82f6', PETG: '#8b5cf6', ABS: '#f59e0b', TPU: '#ec4899',
  Resin: '#14b8a6', Nylon: '#f97316', ASA: '#6366f1', Other: '#6b7280',
}

interface Partner {
  id: string
  user_id: string
  name: string
  bio: string
  printers_owned: string[]
  filaments: string[]
  province: string
  district: string
  avg_rating: number
  total_reviews: number
  jobs_completed: number
  is_available: boolean
  portfolio_preview: string[]
}

export default function BrowsePartners() {
  const navigate = useNavigate()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filamentFilter, setFilamentFilter] = useState('')

  useEffect(() => { fetchPartners() }, [filamentFilter])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filamentFilter) params.filament = filamentFilter
      const res = await client.get('/api/printers', { params })
      setPartners(res.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const filtered = partners.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.bio || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.printers_owned || []).some(pr => pr.toLowerCase().includes(search.toLowerCase()))
  )

  const available = filtered.filter(p => p.is_available).length

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* Filters */}
      <div className="px-8 py-4 border-b border-gray-100 bg-white flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-56">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 16 16">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, printer, bio…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1DBF73] transition"
          />
        </div>
        <select value={filamentFilter} onChange={e => setFilamentFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 outline-none focus:border-[#1DBF73] bg-white">
          <option value="">All materials</option>
          {FILAMENTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {!loading && (
          <span className="self-center text-xs text-gray-400 font-medium">
            {available} available · {filtered.length} total
          </span>
        )}
      </div>

      {/* Results */}
      <div className="p-8 pt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse" style={{ opacity: 0.5 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <p className="text-4xl mb-3">🖨</p>
            <p className="font-bold text-gray-800">No partners found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <PartnerCard key={p.id} partner={p} onClick={() => navigate(`/partners/${p.user_id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PartnerCard({ partner: p, onClick }: { partner: Partner; onClick: () => void }) {
  const initials = p.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const photos = p.portfolio_preview || []
  const hasPhotos = photos.length > 0

  const [imgIdx, setImgIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useEffect(() => {
    if (hovered && hasPhotos && photos.length > 1) {
      timerRef.current = setInterval(() => setImgIdx(i => (i + 1) % photos.length), 2500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [hovered, hasPhotos, photos.length])

  const cancelHide = () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  const scheduleHide = () => { hideTimerRef.current = setTimeout(() => { setHovered(false); setImgIdx(0) }, 120) }

  const handleCardEnter = () => {
    cancelHide()
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const popupW = 260
    const spaceRight = window.innerWidth - rect.right
    const left = spaceRight >= popupW + 12 ? rect.right + 10 : rect.left - popupW - 10
    setPopupPos({ top: rect.top + window.scrollY, left })
    setHovered(true)
  }

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx(i => (i - 1 + photos.length) % photos.length) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx(i => (i + 1) % photos.length) }

  return (
    <>
      <div ref={cardRef} onClick={onClick} className="cursor-pointer"
        style={{ background: '#fff', borderRadius: '18px', border: '1.5px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s, border-color 0.2s' }}
        onMouseEnter={e => { handleCardEnter(); (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(29,191,115,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(29,191,115,0.4)' }}
        onMouseLeave={e => { scheduleHide(); (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb' }}
      >
        {/* Top accent strip — always */}
        <div className="h-1.5 w-full" style={{ background: hasPhotos ? `linear-gradient(90deg, ${FILAMENT_COLORS[p.filaments?.[0]] || '#1DBF73'}, #1DBF73)` : 'linear-gradient(90deg, #1DBF73, #16a35f)' }} />

        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #1DBF73, #0ea5e9)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={p.is_available ? { background: '#dcfce7', color: '#16a34a' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                  {p.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                📍 {[p.district, p.province].filter(Boolean).join(', ') || 'Thailand'}
              </p>
            </div>
          </div>

          {p.bio && <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: '#6b7280' }}>{p.bio}</p>}

          {(p.filaments || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {p.filaments.slice(0, 5).map(f => (
                <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${FILAMENT_COLORS[f] || '#6b7280'}18`, color: FILAMENT_COLORS[f] || '#6b7280' }}>
                  {f}
                </span>
              ))}
              {p.filaments.length > 5 && <span className="text-[10px] text-gray-400 px-1">+{p.filaments.length - 5}</span>}
            </div>
          )}

          {(p.printers_owned || []).length > 0 && (
            <p className="text-xs mb-3 truncate" style={{ color: '#9ca3af' }}>
              🖨 {p.printers_owned.slice(0, 2).join(', ')}{p.printers_owned.length > 2 ? ` +${p.printers_owned.length - 2}` : ''}
            </p>
          )}

          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#9ca3af' }}>
              <span className="flex items-center gap-1">
                <span style={{ color: '#f59e0b' }}>★</span>
                <span className="font-bold text-gray-800">{Number(p.avg_rating).toFixed(1)}</span>
              </span>
              <span>{p.jobs_completed} orders</span>
              {hasPhotos && (
                <span className="flex items-center gap-0.5" style={{ color: '#1DBF73' }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="1" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3.5" cy="3.5" r="1" fill="currentColor"/><path d="M1 7.5l2.5-2 2 1.5 2-2.5 1.5 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {photos.length}
                </span>
              )}
            </div>
            <span className="text-xs font-bold" style={{ color: '#1DBF73' }}>View Profile →</span>
          </div>
        </div>
      </div>

      {/* Floating popup — always shown on hover */}
      {hovered && (
        <div
          className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ top: popupPos.top, left: popupPos.left, width: 260, background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {hasPhotos ? (
            <>
              {/* Image area */}
              <div className="relative" style={{ height: 200 }}>
                {photos.map((url, i) => (
                  <img key={i} src={url} alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: i === imgIdx ? 1 : 0 }} />
                ))}

                {photos.length > 1 && (
                  <>
                    <button onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                      ‹
                    </button>
                    <button onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                      ›
                    </button>
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <div key={i} className="rounded-full transition-all duration-300"
                          style={{ width: i === imgIdx ? 18 : 6, height: 6, background: i === imgIdx ? '#1DBF73' : 'rgba(255,255,255,0.4)' }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-white text-xs font-bold truncate">{p.name}'s work</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{imgIdx + 1} / {photos.length}</p>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="24" height="24" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                  <circle cx="9" cy="9.5" r="2.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                  <path d="M2 19l6-6 5 4.5 4-5.5 5 7" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-bold">No portfolio yet</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>This partner hasn't uploaded any work photos</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
