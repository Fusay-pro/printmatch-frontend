import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'
import { Search } from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string
  material: string
  complexity: string
  budget_max: number
  is_rush: boolean
  status: string
  created_at: string
  commissioner_name: string
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [material, setMaterial] = useState('')
  const [complexity, setComplexity] = useState('')
  const [sort, setSort] = useState<'newest' | 'budget_high' | 'budget_low'>('newest')

  const fetchJobs = async () => {
    try {
      const r = await client.get('/api/jobs', { params: { status: 'open' } })
      setJobs(r.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  const filtered = useMemo(() => {
    let list = jobs.filter(j =>
      (!j.status || j.status === 'open') &&
      (query === '' || j.title.toLowerCase().includes(query.toLowerCase()) || (j.description || '').toLowerCase().includes(query.toLowerCase())) &&
      (material === '' || j.material === material) &&
      (complexity === '' || j.complexity === complexity)
    )
    if (sort === 'budget_high') list = [...list].sort((a, b) => b.budget_max - a.budget_max)
    if (sort === 'budget_low') list = [...list].sort((a, b) => a.budget_max - b.budget_max)
    if (sort === 'newest') list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    return list
  }, [jobs, query, material, complexity, sort])

  const materials = [...new Set(jobs.map(j => j.material))]
  const complexities = [...new Set(jobs.map(j => j.complexity))]

  return (
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      <PageHeader
        title="Browse Jobs"
        subtitle="Find open print requests from commissioners"
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs..."
              className="w-full border border-hairline rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition bg-[var(--color-sidebar-bg)]" />
          </div>
          <select value={material} onChange={e => setMaterial(e.target.value)}
            className="border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-[var(--color-sidebar-bg)] text-base cursor-pointer">
            <option value="">All Materials</option>
            {materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={complexity} onChange={e => setComplexity(e.target.value)}
            className="border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-[var(--color-sidebar-bg)] text-base cursor-pointer">
            <option value="">All Complexity</option>
            {complexities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            className="border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-[var(--color-sidebar-bg)] text-base cursor-pointer">
            <option value="newest">Newest</option>
            <option value="budget_high">Budget: High → Low</option>
            <option value="budget_low">Budget: Low → High</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} padding="md">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="70%" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your filters or check back later." />
      ) : (
        <div className="space-y-3">
          {filtered.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-[var(--color-sidebar-bg)] border border-hairline rounded-md p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-base truncate">{job.title}</h3>
                  <p className="text-sm text-muted mt-0.5 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="gray">{job.material}</Badge>
                    <Badge variant="gray">{job.complexity}</Badge>
                    {job.is_rush && <Badge variant="red">Rush</Badge>}
                    <span className="text-xs text-muted">Budget ฿{Number(job.budget_max).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted">{new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
