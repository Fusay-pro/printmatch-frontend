import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'

interface Job {
  id: string
  title: string
  material: string
  complexity: string
  budget_max: number
  status: string
  created_at: string
  is_rush: boolean
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  open:        { label: 'Open',        cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  printing:    { label: 'Printing',    cls: 'bg-orange-50 text-orange-600 border-orange-200' },
  shipped:     { label: 'Shipped',     cls: 'bg-purple-50 text-purple-600 border-purple-200' },
  delivered:   { label: 'Delivered',   cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  closed:      { label: 'Closed',      cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  failed:      { label: 'Failed',      cls: 'bg-red-50 text-red-500 border-red-200' },
  disputed:    { label: 'Disputed',    cls: 'bg-red-50 text-red-500 border-red-200' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const DONE_STATUSES = ['delivered', 'closed', 'cancelled', 'failed']

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const isCompleted = searchParams.get('tab') === 'completed'

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await client.get('/api/jobs?mine=true')
      setJobs(res.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const filtered = isCompleted
    ? jobs.filter(j => DONE_STATUSES.includes(j.status))
    : jobs.filter(j => !DONE_STATUSES.includes(j.status))

  const totalSpend = jobs
    .filter(j => ['delivered', 'closed'].includes(j.status))
    .reduce((s, j) => s + Number(j.budget_max), 0)

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {isCompleted ? 'Completed' : 'My Commissions'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isCompleted ? 'Your delivered and closed jobs' : 'Jobs currently in progress or awaiting a quote'}
          </p>
        </div>
        <Link to="/browse-partners"
          className="text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors bg-[#1DBF73] hover:bg-[#19a463]">
          + Request a Job
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {isCompleted ? 'History' : 'Active Jobs'}
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{filtered.length} jobs</span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="text-5xl mb-4">{isCompleted ? '🏁' : '📋'}</div>
            <p className="font-semibold text-gray-700 mb-1">
              {isCompleted ? 'No completed jobs yet' : 'No active commissions'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {isCompleted ? 'Completed jobs will appear here once delivered' : 'Find a partner to request a job'}
            </p>
            {!isCompleted && (
              <Link to="/browse-partners"
                className="inline-block text-white font-bold text-sm px-6 py-2.5 rounded-xl bg-[#1DBF73] hover:bg-[#19a463] transition-colors">
                Request a Job
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Job</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Material</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Budget</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Posted</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(job => {
                    const s = STATUS_META[job.status] || STATUS_META.open
                    return (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm group-hover:text-[#1DBF73] transition-colors">
                              {job.title}
                            </span>
                            {job.is_rush && (
                              <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">
                                Rush
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{job.complexity} complexity</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{job.material}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          ฿{Number(job.budget_max).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400">
                          {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/jobs/${job.id}`}
                            className="text-xs text-gray-400 hover:text-[#1DBF73] transition-colors font-medium">
                            View →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {isCompleted && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">{filtered.length} completed jobs</span>
                <span className="text-sm font-bold text-gray-700">
                  Total spent: <span className="text-[#1DBF73]">฿{totalSpend.toLocaleString()}</span>
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
