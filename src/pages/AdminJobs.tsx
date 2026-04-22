import { useEffect, useState } from 'react'
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
  commissioner_name: string
  commissioner_email: string
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

const ALL_STATUSES = ['all', 'open', 'in_progress', 'printing', 'shipped', 'delivered', 'closed', 'failed', 'cancelled']

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    const q = filter !== 'all' ? `?status=${filter}` : ''
    client.get(`/api/admin/jobs${q}`)
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          All Commissions
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Every job posted on the platform</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              filter === s
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800'
            }`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>Jobs</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{jobs.length} total</span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">No jobs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Commissioner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Posted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map(job => {
                  const s = STATUS_META[job.status] || STATUS_META.open
                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{job.title}</span>
                          {job.is_rush && (
                            <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">
                              Rush
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{job.complexity} complexity</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-800">{job.commissioner_name}</p>
                        <p className="text-xs text-gray-400">{job.commissioner_email}</p>
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
