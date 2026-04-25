import { useEffect, useState } from 'react'
import {
  FileText,
  Lock,
  Clock,
  Users,
  Flag,
} from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

interface Stats {
  total_jobs: number
  open_jobs: number
  pending_partners: number
  approved_partners: number
  open_appeals: number
}

const ICONS: Record<string, React.ReactNode> = {
  'Total Commissions': <FileText className="w-4 h-4 text-accent-2" />,
  'Open Jobs': <Lock className="w-4 h-4 text-accent" />,
  'Pending Applications': <Clock className="w-4 h-4 text-amber-500" />,
  'Active Partners': <Users className="w-4 h-4 text-purple-500" />,
  'Open Appeals': <Flag className="w-4 h-4 text-danger" />,
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Commissions', value: stats?.total_jobs ?? '—' },
    { label: 'Open Jobs', value: stats?.open_jobs ?? '—' },
    { label: 'Pending Applications', value: stats?.pending_partners ?? '—' },
    { label: 'Active Partners', value: stats?.approved_partners ?? '—' },
    { label: 'Open Appeals', value: stats?.open_appeals ?? '—' },
  ]

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <PageHeader title="Overview" subtitle="Platform summary" />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => (
            <Card key={i} padding="md" className="h-24">
              <Skeleton variant="circle" width="32px" height="32px" />
              <Skeleton width="60%" className="mt-2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map((c) => (
            <Card key={c.label} padding="md">
              <div className="w-7 h-7 rounded-sm bg-surface border border-hairline flex items-center justify-center mb-2.5">
                {ICONS[c.label]}
              </div>
              <p className="text-lg font-semibold text-base font-display">{c.value}</p>
              <p className="text-[10px] text-muted font-medium uppercase tracking-wider mt-0.5">{c.label}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
