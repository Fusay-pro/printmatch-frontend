import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, MapPin, ArrowRight } from 'lucide-react'
import client from '../api/client'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

const FILAMENTS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon', 'ASA']

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
    <div className="font-sans animate-fade-in">
      {/* Filters */}
      <div className="px-6 md:px-8 py-4 border-b border-hairline bg-[var(--color-sidebar-bg)] flex flex-wrap gap-3 items-center sticky top-0 z-20">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, printer, bio…"
            className="w-full pl-8 pr-4 py-2 border border-hairline rounded-md text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
          />
        </div>
        <select value={filamentFilter} onChange={e => setFilamentFilter(e.target.value)}
          className="border border-hairline rounded-md px-3 py-2 text-xs text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-[var(--color-sidebar-bg)]">
          <option value="">All materials</option>
          {FILAMENTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {!loading && (
          <span className="self-center text-[11px] text-muted font-medium">
            {available} available · {filtered.length} total
          </span>
        )}
      </div>

      {/* Results */}
      <div className="p-6 md:p-8 pt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <Skeleton key={i} variant="card" height="200px" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-6 h-6 text-muted" />}
            title="No partners found"
            description="Try adjusting your filters"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/partners/${p.user_id}`)}
                className="bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg p-4 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-sm bg-accent flex items-center justify-center text-white font-semibold text-xs shrink-0">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{p.avg_rating?.toFixed(1) ?? '—'}</span>
                      <span>·</span>
                      <span>{p.total_reviews ?? 0} reviews</span>
                      <span>·</span>
                      <span>{p.jobs_completed ?? 0} jobs</span>
                    </div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${p.is_available ? 'bg-emerald-500' : 'bg-muted'}`} />
                </div>

                <p className="text-sm text-muted line-clamp-2 mb-3">{p.bio || 'No bio provided.'}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(p.filaments || []).slice(0, 6).map(f => (
                    <span key={f} className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm border border-hairline text-muted bg-surface">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.province}{p.district ? `, ${p.district}` : ''}</span>
                  <span className="font-medium text-accent flex items-center gap-0.5 group-hover:gap-1 transition-all">
                    View profile <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
