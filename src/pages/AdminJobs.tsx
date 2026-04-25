import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import StatusBadge from '../components/StatusBadge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

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
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      <PageHeader
        title="All Commissions"
        subtitle="Every job posted on the platform"
      />

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
              filter === s
                ? 'bg-accent text-white'
                : 'bg-[var(--color-sidebar-bg)] border border-hairline text-muted hover:text-base'
            }`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-hairline flex items-center justify-between">
          <h2 className="text-xs font-semibold text-base font-display">Jobs</h2>
          <span className="text-[11px] text-muted bg-surface px-2 py-0.5 rounded-sm font-medium">{jobs.length} total</span>
        </div>

        {loading ? (
          <div className="px-5 py-12 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton width="30%" />
                <Skeleton width="20%" />
                <Skeleton width="15%" />
                <Skeleton width="15%" />
                <Skeleton width="100px" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-surface">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Job</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Commissioner</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Material</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Budget</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Posted</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base text-xs">{job.title}</span>
                        {job.is_rush && (
                          <span className="text-[10px] bg-red-50 text-danger border border-red-100 px-1 py-0.5 rounded-sm font-medium flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" />Rush
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted mt-0.5 capitalize">{job.complexity} complexity</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-base">{job.commissioner_name}</p>
                      <p className="text-[10px] text-muted">{job.commissioner_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{job.material}</td>
                    <td className="px-4 py-3 text-xs font-medium text-base">
                      ฿{Number(job.budget_max).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
