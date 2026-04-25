import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Inbox, Clock, CheckCircle2, Zap } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

const DONE = ['delivered', 'closed', 'cancelled', 'failed']
const ACTIVE = ['in_progress', 'printing', 'shipped']

interface Job {
  id: string
  title: string
  material: string
  complexity: string
  budget_max: number
  status: string
  is_rush: boolean
  commissioner_name: string
  created_at: string
}

const STATUS_BORDER: Record<string, string> = {
  pending_acceptance: 'border-l-accent-2',
  in_progress: 'border-l-amber-400',
  printing: 'border-l-accent',
  shipped: 'border-l-purple-400',
  delivered: 'border-l-emerald-500',
  closed: 'border-l-muted',
  cancelled: 'border-l-muted',
  failed: 'border-l-danger',
}

export default function PartnerRequests() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tab = params.get('tab') || 'pending'

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client.get('/api/jobs', { params: { incoming: 'true' } })
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending = jobs.filter(j => j.status === 'pending_acceptance')
  const active  = jobs.filter(j => ACTIVE.includes(j.status))
  const done    = jobs.filter(j => DONE.includes(j.status))
  const display = tab === 'active' ? active : tab === 'done' ? done : pending

  return (
    <div className="p-6 md:p-8 max-w-3xl animate-fade-in">
      <PageHeader
        title={tab === 'active' ? 'Active Orders' : tab === 'done' ? 'Completed' : 'Incoming Requests'}
        subtitle={tab === 'pending' ? 'Review and accept requests from commissioners' : 'Your current and past orders'}
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-hairline">
        {[
          { key: 'pending', label: 'Pending', count: pending.length, icon: <Inbox className="w-3.5 h-3.5" /> },
          { key: 'active',  label: 'Active',  count: active.length,  icon: <Clock className="w-3.5 h-3.5" /> },
          { key: 'done',    label: 'Completed', count: done.length,  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => navigate(`/requests${t.key !== 'pending' ? `?tab=${t.key}` : ''}`)}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === t.key
                ? 'border-accent text-base'
                : 'border-transparent text-muted hover:text-base'
            }`}
          >
            {t.icon}
            {t.label}
            <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded-sm">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg p-4">
              <Skeleton width="70%" />
              <Skeleton width="40%" className="mt-2" />
            </div>
          ))}
        </div>
      ) : display.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-6 h-6 text-muted" />}
          title={tab === 'pending' ? 'No pending requests' : 'Nothing here yet'}
          description={tab === 'pending' ? 'New requests will appear here' : 'Orders will appear once accepted'}
        />
      ) : (
        <div className="space-y-3">
          {display.map(j => (
            <div
              key={j.id}
              onClick={() => navigate(`/jobs/${j.id}`)}
              className={`bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg p-4 hover:border-accent/30 transition-colors cursor-pointer border-l-4 ${STATUS_BORDER[j.status] || 'border-l-hairline'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-base text-sm truncate">{j.title}</p>
                    {j.is_rush && (
                      <span className="shrink-0 text-[10px] bg-red-50 text-danger border border-red-100 px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wide flex items-center gap-1">
                        <Zap className="w-3 h-3" />Rush
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted">
                    {j.commissioner_name} · {j.material} · ฿{j.budget_max.toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={j.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
