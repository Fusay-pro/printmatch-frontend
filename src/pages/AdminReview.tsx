import { useEffect, useState } from 'react'
import client from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import { CheckCircle2, XCircle } from 'lucide-react'

interface PendingPartner {
  id: string
  user_id: string
  user_name: string
  email: string
  bio: string
  printers_owned: string[]
  filaments: string[]
  printer_wattage: number
  province: string
  district: string
  address: string
  phone: string
  line_id: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  created_at: string
}

export default function AdminReview() {
  const [partners, setPartners] = useState<PendingPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selected, setSelected] = useState<PendingPartner | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const normalizePartner = (raw: any): PendingPartner => ({
    id: String(raw?.id ?? ''),
    user_id: String(raw?.user_id ?? ''),
    user_name: String(raw?.user_name ?? raw?.name ?? 'Unknown'),
    email: String(raw?.email ?? raw?.user_email ?? ''),
    bio: String(raw?.bio ?? ''),
    printers_owned: Array.isArray(raw?.printers_owned) ? raw.printers_owned : [],
    filaments: Array.isArray(raw?.filaments)
      ? raw.filaments
      : Object.keys(raw?.material_prices ?? {}),
    printer_wattage: Number(raw?.printer_wattage ?? 0),
    province: String(raw?.province ?? ''),
    district: String(raw?.district ?? ''),
    address: String(raw?.address ?? ''),
    phone: String(raw?.phone ?? ''),
    line_id: String(raw?.line_id ?? ''),
    status: (raw?.status === 'approved' || raw?.status === 'rejected') ? raw.status : 'pending',
    rejection_reason: raw?.rejection_reason ?? null,
    created_at: String(raw?.created_at ?? ''),
  })

  const fetchPartners = async () => {
    setLoading(true)
    try {
      let data: any[] = []

      if (tab === 'pending') {
        try {
          const r = await client.get('/api/admin/pending-partners')
          data = Array.isArray(r.data) ? r.data : []
        } catch {
          const r = await client.get('/api/admin/partners', { params: { status: tab } })
          data = Array.isArray(r.data) ? r.data : []
        }
      } else {
        try {
          const r = await client.get('/api/admin/partners', { params: { status: tab } })
          data = Array.isArray(r.data) ? r.data : []
        } catch {
          const r = await client.get('/api/admin/pending-partners')
          data = Array.isArray(r.data) ? r.data : []
        }
      }

      const normalized = data.map(normalizePartner)
      setPartners(normalized.filter((p) => p.status === tab))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPartners() }, [tab])

  const approve = async (id: string) => {
    setSubmitting(true)
    try { await client.patch(`/api/admin/partners/${id}/approve`); fetchPartners(); setSelected(null) }
    catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const reject = async (id: string) => {
    if (!rejectReason.trim()) return
    setSubmitting(true)
    try { await client.patch(`/api/admin/partners/${id}/reject`, { reason: rejectReason }); fetchPartners(); setSelected(null); setShowRejectInput(false); setRejectReason('') }
    catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const filtered = partners

  return (
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      <PageHeader
        title="Partner Review"
        subtitle="Review and approve partner requests"
      />

      <div className="flex items-center gap-4 mb-6 border-b border-hairline">
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected(null); setShowRejectInput(false) }}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-base'
            }`}>
            {t}
            {tab === t && <span className="ml-1.5 text-xs text-muted">({filtered.length})</span>}
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
            <div className="text-center py-12 text-muted text-sm">No {tab} applications</div>
          ) : (
            filtered.map(p => (
              <div key={p.id} onClick={() => { setSelected(p); setShowRejectInput(false); setRejectReason('') }}
                className={`bg-[var(--color-sidebar-bg)] border rounded-md p-4 cursor-pointer transition-colors ${
                  selected?.id === p.id ? 'border-accent' : 'border-hairline hover:border-accent/30'
                }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center text-sm font-semibold text-base shrink-0">
                      {p.user_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-base">{p.user_name}</p>
                      <p className="text-xs text-muted">{p.email}</p>
                    </div>
                  </div>
                  <Badge variant={p.status === 'pending' ? 'amber' : p.status === 'approved' ? 'emerald' : 'gray'}>
                    {p.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-2">{p.printers_owned?.join(', ') || '—'}</p>
              </div>
            ))
          )}
        </div>

        {selected ? (
          <Card padding="none" className="flex-1 overflow-hidden lg:max-w-md">
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center text-base font-semibold shrink-0">
                  {selected.user_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-base">{selected.user_name}</p>
                  <p className="text-xs text-muted">{selected.email}</p>
                </div>
              </div>
              <Badge variant={selected.status === 'pending' ? 'amber' : selected.status === 'approved' ? 'emerald' : 'gray'}>
                {selected.status}
              </Badge>
            </div>

            <div className="px-6 py-5 space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Bio</p>
                  <p className="text-base/80">{selected.bio || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-base/80">{selected.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Location</p>
                  <p className="text-base/80">{[selected.district, selected.province].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Wattage</p>
                  <p className="text-base/80">{selected.printer_wattage} W</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-2">Printers</p>
                <div className="flex flex-wrap gap-2">
                  {selected.printers_owned?.map(p => (
                    <span key={p} className="text-xs bg-surface border border-hairline px-3 py-1.5 rounded-sm font-medium">{p}</span>
                  )) || '—'}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-2">Filaments</p>
                <div className="flex flex-wrap gap-2">
                  {selected.filaments?.map(f => (
                    <span key={f} className="text-xs bg-surface border border-hairline px-3 py-1.5 rounded-sm font-medium">{f}</span>
                  )) || '—'}
                </div>
              </div>

              {selected.status === 'rejected' && selected.rejection_reason && (
                <div className="bg-red-50 border border-red-100 rounded-md px-4 py-3 text-sm text-danger">
                  <p className="font-medium">Rejection reason:</p>
                  <p>{selected.rejection_reason}</p>
                </div>
              )}

              {selected.status === 'pending' && (
                <div className="space-y-3 pt-2">
                  {showRejectInput ? (
                    <div className="space-y-2">
                      <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2}
                        placeholder="Reason for rejection..."
                        className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-muted transition" />
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" onClick={() => reject(selected.id)} loading={submitting}>Reject</Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => approve(selected.id)} loading={submitting}>
                        <CheckCircle2 className="w-4 h-4 mr-1.5 inline" />Approve
                      </Button>
                      <Button variant="ghost" onClick={() => setShowRejectInput(true)} className="border border-red-200 text-danger hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-1.5 inline" />Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted text-sm border border-dashed border-hairline rounded-md min-h-[300px]">
            Select a partner to review details
          </div>
        )}
      </div>
    </div>
  )
}
