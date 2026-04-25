import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Clock, Banknote, Tag } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import StatusBadge from '../components/StatusBadge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

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

const DONE_STATUSES = ['delivered', 'closed', 'cancelled', 'failed']

const STATUS_BORDER: Record<string, string> = {
  open: 'border-l-accent-2',
  pending_acceptance: 'border-l-accent-2',
  in_progress: 'border-l-amber-400',
  printing: 'border-l-accent',
  shipped: 'border-l-purple-400',
  delivered: 'border-l-emerald-500',
  closed: 'border-l-muted',
  cancelled: 'border-l-muted',
  failed: 'border-l-danger',
  disputed: 'border-l-danger',
}

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

  return (
    <div className="p-6 md:p-8 max-w-5xl animate-fade-in">
      <PageHeader
        title={isCompleted ? 'Completed' : 'My Commissions'}
        subtitle={isCompleted ? 'Your delivered and closed jobs' : 'Jobs currently in progress or awaiting a quote'}
        action={
          <Link to="/browse-partners">
            <Button><Plus className="w-3.5 h-3.5 mr-1" />Request a Job</Button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-hairline">
        <Link
          to="/dashboard"
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            !isCompleted ? 'border-accent text-base' : 'border-transparent text-muted hover:text-base'
          }`}
        >
          Active
        </Link>
        <Link
          to="/dashboard?tab=completed"
          className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            isCompleted ? 'border-accent text-base' : 'border-transparent text-muted hover:text-base'
          }`}
        >
          History
        </Link>
        <span className="ml-auto text-[11px] text-muted font-medium">
          {filtered.length} jobs
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1,2,3].map(i => (
            <Card key={i} padding="sm">
              <div className="flex items-center gap-4">
                <Skeleton variant="circle" width="40px" height="40px" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6 text-muted" />}
          title={isCompleted ? 'No completed jobs yet' : 'No active commissions'}
          description={isCompleted ? 'Completed jobs will appear here once delivered' : 'Find a partner to request a job'}
          actionLabel={!isCompleted ? 'Request a Job' : undefined}
          actionHref="/browse-partners"
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className={`bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg p-4 hover:border-accent/30 transition-colors border-l-4 ${STATUS_BORDER[job.status] || 'border-l-hairline'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-base text-sm truncate">{job.title}</p>
                    {job.is_rush && (
                      <Badge variant="red" className="shrink-0">Rush</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{job.material}</span>
                    <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />฿{job.budget_max.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={job.status} />
                  <span className="text-[11px] text-muted">
                    {new Date(job.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
