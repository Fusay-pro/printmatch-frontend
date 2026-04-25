import { useEffect, useState } from 'react'
import client from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

interface Report {
  id: string
  reporter_name: string
  reporter_email: string
  reported_name: string
  reported_email: string
  reason: string
  details: string | null
  status: 'pending' | 'resolved' | 'dismissed'
  conversation_id: string | null
  created_at: string
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  scam: 'Scam / Fraud',
  harassment: 'Harassment',
  fake_profile: 'Fake Profile',
  other: 'Other',
}

const BADGE_VARIANT: Record<string, 'amber' | 'emerald' | 'gray'> = {
  pending: 'amber',
  resolved: 'emerald',
  dismissed: 'gray',
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')

  const fetchReports = async () => {
    try {
      const r = await client.get('/api/reports')
      setReports(r.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [])

  const resolve = async (id: string) => {
    await client.patch(`/api/reports/${id}/resolve`)
    fetchReports()
  }

  const dismiss = async (id: string) => {
    await client.patch(`/api/reports/${id}/dismiss`)
    fetchReports()
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)
  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      <PageHeader
        title="Reports"
        subtitle={pendingCount > 0 ? `${pendingCount} pending review` : undefined}
        action={
          <div className="flex gap-1 bg-surface rounded-md p-1 border border-hairline">
            {(['pending', 'all', 'resolved', 'dismissed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors capitalize ${
                  filter === f ? 'bg-[var(--color-sidebar-bg)] text-base shadow-sm border border-hairline' : 'text-muted hover:text-base'
                }`}>
                {f}
              </button>
            ))}
          </div>
        }
      />

      {loading && (
        <div className="space-y-3 mt-6">
          {[1,2,3].map(i => <Skeleton key={i} variant="card" height="180px" />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mt-6">
          <EmptyState title={`No ${filter === 'all' ? '' : filter} reports`} description="Reports will appear here when users submit them." />
        </div>
      )}

      <div className="space-y-3 mt-6">
        {filtered.map(report => (
          <Card key={report.id}>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={BADGE_VARIANT[report.status] || 'gray'}>{report.status}</Badge>
                  <Badge variant="blue">{REASON_LABELS[report.reason] || report.reason}</Badge>
                  <span className="text-xs text-muted">
                    {new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-2">
                  <div>
                    <span className="text-xs text-muted">Reporter</span>
                    <p className="font-semibold text-base">{report.reporter_name}</p>
                    <p className="text-xs text-muted">{report.reporter_email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Reported</span>
                    <p className="font-semibold text-danger">{report.reported_name}</p>
                    <p className="text-xs text-muted">{report.reported_email}</p>
                  </div>
                </div>

                {report.details && (
                  <p className="text-sm text-base/70 bg-surface rounded-md px-3 py-2 mt-2 border border-hairline">
                    {report.details}
                  </p>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                  <Button onClick={() => resolve(report.id)} size="sm">Resolve</Button>
                  <Button onClick={() => dismiss(report.id)} variant="ghost" size="sm" className="border border-hairline">Dismiss</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
