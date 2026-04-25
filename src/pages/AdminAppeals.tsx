import { useEffect, useState } from 'react'
import client from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import { Inbox, Clock, CheckCircle2, Send } from 'lucide-react'

interface Appeal {
  id: string
  user_name: string
  user_email: string
  type: string
  subject: string
  details: string | null
  status: 'open' | 'resolved'
  reply: string | null
  created_at: string
}

const TYPES: Record<string, string> = {
  job_issue: 'Job Issue',
  partner_issue: 'Partner Issue',
  account_issue: 'Account Issue',
  payment: 'Payment',
  report_dispute: 'Report Dispute',
  other: 'Other',
}

export default function AdminAppeals() {
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'resolved' | 'all'>('open')
  const [selected, setSelected] = useState<Appeal | null>(null)
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const normalizeAppeal = (raw: any): Appeal => ({
    id: String(raw?.id ?? ''),
    user_name: String(raw?.user_name ?? raw?.sender_name ?? 'Unknown'),
    user_email: String(raw?.user_email ?? raw?.sender_email ?? ''),
    type: String(raw?.type ?? 'other'),
    subject: String(raw?.subject ?? '(No subject)'),
    details: (raw?.details ?? raw?.message ?? null) as string | null,
    status: raw?.status === 'resolved' ? 'resolved' : 'open',
    reply: (raw?.reply ?? raw?.admin_reply ?? null) as string | null,
    created_at: String(raw?.created_at ?? ''),
  })

  const fetchAppeals = async () => {
    setLoading(true)
    try {
      const params = tab === 'all' ? undefined : { status: tab }
      const r = await client.get('/api/admin/appeals', { params })
      const data = Array.isArray(r.data) ? r.data : []
      setAppeals(data.map(normalizeAppeal))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAppeals() }, [tab])

  const resolve = async (id: string) => {
    setSubmitting(true)
    try {
      const trimmed = reply.trim()
      await client.patch(`/api/admin/appeals/${id}/resolve`, trimmed ? { reply: trimmed } : {})
      setReply(''); setSelected(null); fetchAppeals()
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const filtered = appeals

  const tabs = [
    { key: 'open' as const, label: 'Open', icon: Inbox },
    { key: 'resolved' as const, label: 'Resolved', icon: CheckCircle2 },
    { key: 'all' as const, label: 'All', icon: Clock },
  ]

  return (
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      <PageHeader
        title="Appeals"
        subtitle={`${appeals.filter(a => a.status === 'open').length} open`}
      />

      <div className="flex items-center gap-4 mb-6 border-b border-hairline">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelected(null) }}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === t.key ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-base'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
            {tab === t.key && <span className="text-xs text-muted">({filtered.length})</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} variant="card" height="80px" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">No {tab} appeals</div>
          ) : (
            filtered.map(a => (
              <div key={a.id} onClick={() => { setSelected(a); setReply('') }}
                className={`bg-[var(--color-sidebar-bg)] border rounded-md p-4 cursor-pointer transition-colors ${
                  selected?.id === a.id ? 'border-accent' : 'border-hairline hover:border-accent/30'
                }`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-base">{a.subject}</p>
                    <p className="text-xs text-muted">{a.user_name} · {TYPES[a.type] || a.type}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-sm ${
                    a.status === 'open' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>{a.status}</span>
                </div>
                <p className="text-xs text-muted line-clamp-2">{a.details || 'No details'}</p>
              </div>
            ))
          )}
        </div>

        {selected ? (
          <Card padding="none" className="flex-1 overflow-hidden lg:max-w-md">
            <div className="px-6 py-5 border-b border-hairline">
              <p className="font-semibold text-base">{selected.subject}</p>
              <p className="text-xs text-muted mt-0.5">{selected.user_name} · {selected.user_email}</p>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Type</p>
                <p className="text-base/80">{TYPES[selected.type] || selected.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Details</p>
                <p className="text-base/80 whitespace-pre-line">{selected.details || '—'}</p>
              </div>
              {selected.reply && (
                <div className="bg-surface border border-hairline rounded-md px-4 py-3">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Reply</p>
                  <p className="text-base/80 whitespace-pre-line">{selected.reply}</p>
                </div>
              )}
              {selected.status === 'open' && (
                <div className="space-y-2 pt-2">
                  <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                    placeholder="Write a reply..."
                    className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-muted transition" />
                  <Button onClick={() => resolve(selected.id)} loading={submitting} size="sm">
                    <Send className="w-4 h-4 mr-1.5 inline" />Resolve & Reply
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted text-sm border border-dashed border-hairline rounded-md min-h-[300px]">
            Select an appeal to view details
          </div>
        )}
      </div>
    </div>
  )
}
