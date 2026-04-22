import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

interface Job {
  id: string
  title: string
  material: string
  complexity: string
  budget_max: number
  is_rush: boolean
  created_at: string
  estimated_weight_g: number | null
  estimated_time_hr: number | null
}

const MATERIALS = ['PLA', 'PETG', 'ABS', 'Resin', 'TPU', 'Nylon', 'ASA']
const COMPLEXITIES = ['simple', 'moderate', 'complex', 'very_complex']
const COMPLEXITY_LABELS: Record<string, string> = {
  simple: 'Simple', moderate: 'Moderate', complex: 'Complex', very_complex: 'Very Complex',
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [search, setSearch] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')
  const [complexityFilter, setComplexityFilter] = useState('')
  const [rushOnly, setRushOnly] = useState(false)
  const [sort, setSort] = useState<'newest' | 'budget_high' | 'budget_low'>('newest')

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/jobs?status=open')
      setJobs(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let out = [...jobs]
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(j => j.title.toLowerCase().includes(q) || j.material.toLowerCase().includes(q))
    }
    if (materialFilter) out = out.filter(j => j.material === materialFilter)
    if (complexityFilter) out = out.filter(j => j.complexity === complexityFilter)
    if (rushOnly) out = out.filter(j => j.is_rush)
    if (sort === 'newest') out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'budget_high') out.sort((a, b) => b.budget_max - a.budget_max)
    if (sort === 'budget_low') out.sort((a, b) => a.budget_max - b.budget_max)
    return out
  }, [jobs, search, materialFilter, complexityFilter, rushOnly, sort])

  const activeFilters = [materialFilter, complexityFilter, rushOnly ? 'Rush' : ''].filter(Boolean).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
          Browse Open Jobs
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {loading ? 'Loading...' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} available — click any to submit a quote`}
        </p>
      </div>

      {/* Search + filters bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Material */}
          <select
            value={materialFilter}
            onChange={e => setMaterialFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All materials</option>
            {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Complexity */}
          <select
            value={complexityFilter}
            onChange={e => setComplexityFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All complexities</option>
            {COMPLEXITIES.map(c => <option key={c} value={c}>{COMPLEXITY_LABELS[c]}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="newest">Newest first</option>
            <option value="budget_high">Budget: high → low</option>
            <option value="budget_low">Budget: low → high</option>
          </select>

          {/* Rush toggle */}
          <button
            onClick={() => setRushOnly(v => !v)}
            className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
              rushOnly
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            🔥 Rush only
          </button>

          {/* Clear */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setMaterialFilter(''); setComplexityFilter(''); setRushOnly(false) }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Clear filters ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold text-gray-700 mb-1">No jobs match your filters</p>
          <p className="text-gray-400 text-sm">Try adjusting or clearing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md rounded-2xl p-5 transition-all group block"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors text-sm">
                      {job.title}
                    </h3>
                    {job.is_rush && (
                      <span className="shrink-0 text-xs bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">
                        Rush
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-orange-500">฿{Number(job.budget_max).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">max budget</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{job.material}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium capitalize">
                  {COMPLEXITY_LABELS[job.complexity] || job.complexity}
                </span>
                {job.estimated_weight_g && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{job.estimated_weight_g}g</span>
                )}
                {job.estimated_time_hr && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{job.estimated_time_hr}hr est.</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
