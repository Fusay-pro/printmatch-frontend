import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import StatusBadge from '../components/StatusBadge'
import {
  Star, CheckCircle2, AlertTriangle, Truck, Send, Zap
} from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string
  material: string
  complexity: string
  is_rush: boolean
  budget_max: number
  estimated_weight_g: number | null
  estimated_time_hr: number | null
  status: string
  commissioner_id: string
  assigned_printer_id: string | null
  tracking_number: string | null
  courier: string | null
  created_at: string
}

interface Quote {
  id: string
  printer_profile_id: string
  printer_name: string
  final_price: number
  estimated_days: number
  note: string
  status: string
  match_score: number
  avg_rating: number
  jobs_completed: number
}

interface Progress {
  id: string
  printer_name: string
  message: string
  photo_url: string | null
  percent_complete: number
  created_at: string
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
}

const STATUS_STEPS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'printing', label: 'Printing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'closed', label: 'Closed' },
]

function StatusTimeline({ status }: { status: string }) {
  const normalSteps = STATUS_STEPS
  const isFailed = status === 'failed' || status === 'disputed' || status === 'cancelled'
  const currentIdx = normalSteps.findIndex(s => s.key === status)

  if (isFailed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-100 bg-red-50 text-danger text-sm font-medium w-fit">
        <AlertTriangle className="w-4 h-4" />
        <StatusBadge status={status} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {normalSteps.map((step, i) => {
        const isDone = currentIdx > i
        const isCurrent = currentIdx === i
        return (
          <div key={step.key} className="flex items-center gap-1 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isCurrent
                ? 'bg-accent text-white shadow-sm'
                : isDone
                  ? 'bg-surface text-muted'
                  : 'bg-surface text-muted/40 border border-hairline'
            }`}>
              {isDone && (
                <CheckCircle2 className="w-3 h-3 text-success" />
              )}
              {step.label}
            </div>
            {i < normalSteps.length - 1 && (
              <div className={`w-4 h-px ${isDone ? 'bg-hairline' : 'bg-surface'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [job, setJob] = useState<Job | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [tab, setTab] = useState<'quotes' | 'progress' | 'chat'>('quotes')
  const [loading, setLoading] = useState(true)

  // commissioner
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // printer — progress
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPct, setProgressPct] = useState('50')
  const [submittingProgress, setSubmittingProgress] = useState(false)

  // printer — ship
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courier, setCourier] = useState('')
  const [showShipForm, setShowShipForm] = useState(false)
  const [submittingShip, setSubmittingShip] = useState(false)

  // printer — failure
  const [failureReason, setFailureReason] = useState<'printer_fault' | 'material_issue' | 'external'>('printer_fault')
  const [failureNote, setFailureNote] = useState('')
  const [showFailureForm, setShowFailureForm] = useState(false)
  const [submittingFailure, setSubmittingFailure] = useState(false)

  // chat
  const [newMessage, setNewMessage] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchAll() }, [id])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchAll = async () => {
    try {
      const [jobRes, quotesRes, progressRes, messagesRes] = await Promise.all([
        client.get(`/api/jobs/${id}`),
        client.get(`/api/quotes/${id}`),
        client.get(`/api/progress/${id}`),
        client.get(`/api/messages/${id}`),
      ])
      setJob(jobRes.data)
      setQuotes(quotesRes.data)
      setProgress(progressRes.data)
      setMessages(messagesRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const isOwner = user?.id === job?.commissioner_id
  const isAssignedPrinter = !!user?.printer_profile_id && user.printer_profile_id === job?.assigned_printer_id
  const canPostProgress = isAssignedPrinter && (job?.status === 'in_progress' || job?.status === 'printing')
  const canMarkShipped = isAssignedPrinter && job?.status === 'printing'
  const canReportFailure = isAssignedPrinter && (job?.status === 'in_progress' || job?.status === 'printing')

  const acceptRequest = async () => {
    await client.patch(`/api/jobs/${id}/accept`)
    fetchAll()
  }

  const declineRequest = async () => {
    await client.patch(`/api/jobs/${id}/decline`)
    fetchAll()
  }

  const acceptQuote = async (quoteId: string) => {
    await client.patch(`/api/quotes/${quoteId}/accept`)
    fetchAll()
  }

  const confirmDelivery = async () => {
    await client.post('/api/payments/release', { job_id: id })
    fetchAll()
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    await client.post(`/api/reviews/${id}`, { rating: reviewRating, comment: reviewComment })
    setShowReviewForm(false); fetchAll()
  }

  const postProgress = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmittingProgress(true)
    try {
      await client.post(`/api/progress/${id}`, { message: progressMsg, percent_complete: Number(progressPct) })
      setProgressMsg(''); setProgressPct('50')
      setTab('progress'); fetchAll()
    } finally { setSubmittingProgress(false) }
  }

  const markShipped = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmittingShip(true)
    try {
      await client.patch(`/api/jobs/${id}/status`, { status: 'shipped', tracking_number: trackingNumber, courier })
      setShowShipForm(false); fetchAll()
    } finally { setSubmittingShip(false) }
  }

  const reportFailure = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmittingFailure(true)
    try {
      await client.post(`/api/jobs/${id}/fail`, { reason: failureReason, note: failureNote })
      setShowFailureForm(false); fetchAll()
    } finally { setSubmittingFailure(false) }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const content = newMessage; setNewMessage('')
    await client.post(`/api/messages/${id}`, { content })
    const res = await client.get(`/api/messages/${id}`)
    setMessages(res.data)
  }

  if (loading) return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in font-sans space-y-6">
      <Skeleton variant="text" width="60%" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 shrink-0 space-y-4">
          <Skeleton variant="card" height="320px" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton variant="card" height="200px" />
          <Skeleton variant="card" height="120px" />
        </div>
      </div>
    </div>
  )

  if (!job) return (
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      <EmptyState title="Job not found" description="The job you're looking for doesn't exist or has been removed." />
    </div>
  )

  return (
    <div className="p-6 md:p-8 animate-fade-in font-sans">
      {/* Status timeline */}
      <div className="mb-6">
        <StatusTimeline status={job.status} />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">

        {/* Left — job info + actions */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Job card */}
          <Card>
            <div className="flex items-start justify-between gap-2 mb-3">
              <h1 className="text-base font-semibold text-base leading-snug font-display">
                {job.title}
              </h1>
              {job.is_rush && (
                <span className="shrink-0 text-xs bg-red-50 text-danger border border-red-100 px-1.5 py-0.5 rounded-sm font-medium flex items-center gap-1"><Zap className="w-3 h-3" />Rush</span>
              )}
            </div>

            <div className="mb-4">
              <StatusBadge status={job.status} />
            </div>

            {job.description && (
              <p className="text-muted text-sm leading-relaxed mb-4">{job.description}</p>
            )}

            <div className="space-y-2">
              {[
                { label: 'Material', value: job.material },
                { label: 'Complexity', value: job.complexity },
                { label: 'Max budget', value: `฿${Number(job.budget_max).toLocaleString()}` },
                { label: 'Posted', value: new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center">
                  <span className="text-muted text-xs">{f.label}</span>
                  <span className="font-medium text-base/70 text-xs capitalize">{f.value}</span>
                </div>
              ))}
            </div>

            {job.tracking_number && (
              <div className="mt-4 pt-4 border-t border-hairline text-xs">
                <p className="text-muted mb-0.5">Tracking</p>
                <p className="font-medium text-base/70">{job.courier}: {job.tracking_number}</p>
              </div>
            )}
          </Card>

          {/* Partner: accept or decline incoming request */}
          {isAssignedPrinter && job.status === 'pending_acceptance' && (
            <div className="space-y-2">
              <p className="text-xs text-muted text-center">Review this request and accept or decline</p>
              <Button onClick={acceptRequest} fullWidth>Accept Request</Button>
              <Button onClick={declineRequest} variant="ghost" fullWidth className="border border-red-100 text-danger hover:bg-red-50">Decline</Button>
            </div>
          )}

          {/* Commissioner: confirm delivery */}
          {isOwner && job.status === 'shipped' && (
            <Button onClick={confirmDelivery} variant="secondary" fullWidth className="bg-success hover:bg-success/90 text-white border-0 shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-1.5 inline" /> Confirm Delivery & Release Payment
            </Button>
          )}

          {/* Commissioner: leave review */}
          {isOwner && (job.status === 'delivered' || job.status === 'closed') && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)} variant="ghost" fullWidth className="border border-hairline text-base/70 hover:bg-surface">
              <Star className="w-4 h-4 mr-1.5 inline" /> Leave a Review
            </Button>
          )}

          {showReviewForm && (
            <Card>
              <form onSubmit={submitReview} className="space-y-3">
                <p className="text-sm font-medium text-base/80">Leave a Review</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}
                      className={`text-xl transition-colors ${n <= reviewRating ? 'text-amber-400' : 'text-hairline'}`}><Star className={`w-5 h-5 ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-hairline'}`} /></button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2}
                  className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent resize-none placeholder:text-muted transition"
                  placeholder="Comment (optional)" />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Submit</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Printer: ship / fail */}
          {canMarkShipped && !showShipForm && !showFailureForm && (
            <div className="space-y-2">
              <Button onClick={() => setShowShipForm(true)} variant="secondary" fullWidth className="bg-accent-2 hover:bg-accent-2/90 text-white border-0 shadow-sm">
                <Truck className="w-4 h-4 mr-1.5 inline" /> Mark as Shipped
              </Button>
              {canReportFailure && (
                <Button onClick={() => setShowFailureForm(true)} variant="ghost" fullWidth className="border border-red-100 text-danger hover:bg-red-50">
                  <AlertTriangle className="w-4 h-4 mr-1.5 inline" /> Report Failure
                </Button>
              )}
            </div>
          )}

          {canReportFailure && !canMarkShipped && !showShipForm && !showFailureForm && (
            <Button onClick={() => setShowFailureForm(true)} variant="ghost" fullWidth className="border border-red-100 text-danger hover:bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-1.5 inline" /> Report Failure
            </Button>
          )}

          {showShipForm && (
            <Card>
              <form onSubmit={markShipped} className="space-y-3">
                <p className="text-sm font-medium text-base/80">Shipping Details</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Courier</label>
                  <input value={courier} onChange={e => setCourier(e.target.value)} required placeholder="e.g. Kerry Express"
                    className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent placeholder:text-muted transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Tracking number</label>
                  <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} required
                    className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent transition" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={submittingShip}>
                    {submittingShip ? 'Saving...' : 'Confirm'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowShipForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {showFailureForm && (
            <Card className="border-red-100">
              <form onSubmit={reportFailure} className="space-y-3">
                <p className="text-sm font-medium text-danger">Report Failure</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted">Reason</label>
                  <select value={failureReason} onChange={e => setFailureReason(e.target.value as typeof failureReason)}
                    className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent transition">
                    <option value="printer_fault">Printer fault (my error)</option>
                    <option value="material_issue">Material issue</option>
                    <option value="external">External cause</option>
                  </select>
                </div>
                <textarea value={failureNote} onChange={e => setFailureNote(e.target.value)} rows={2}
                  className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent resize-none placeholder:text-muted transition"
                  placeholder="Describe what happened..." />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="danger" loading={submittingFailure}>
                    {submittingFailure ? 'Reporting...' : 'Report'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowFailureForm(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Right — tabs */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="border-b border-hairline mb-6 flex">
            {(['quotes', 'progress', 'chat'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  tab === t ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-base'
                }`}>
                {t}{t === 'quotes' && ` (${quotes.length})`}
              </button>
            ))}
          </div>

          {/* Quotes */}
          {tab === 'quotes' && (
            <div className="space-y-3">
              {quotes.length === 0 && (
                <EmptyState title="No quotes yet" description="Check back later for printer offers." />
              )}

              {quotes.map(q => (
                <Card key={q.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-base">{q.printer_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted mt-1">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {Number(q.avg_rating).toFixed(1)}</span>
                        <span>·</span>
                        <span>{q.jobs_completed} jobs</span>
                        {q.match_score > 0 && <><span>·</span><span className="text-success font-medium">Match {Math.round(q.match_score * 100)}%</span></>}
                      </div>
                      {q.note && <p className="text-muted text-sm mt-2">{q.note}</p>}
                      <p className="text-muted text-xs mt-1">Est. {q.estimated_days} days</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-accent">฿{Number(q.final_price).toLocaleString()}</p>
                      {isOwner && q.status === 'pending' && job.status === 'open' && (
                        <Button onClick={() => acceptQuote(q.id)} size="sm" className="mt-2">Accept</Button>
                      )}
                      {q.status === 'accepted' && (
                        <span className="block mt-1 text-xs text-success font-medium flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Progress */}
          {tab === 'progress' && (
            <div className="space-y-3">
              {canPostProgress && (
                <Card className="border-accent/20">
                  <form onSubmit={postProgress} className="space-y-3">
                    <p className="text-sm font-medium text-accent">Post an Update</p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-muted">Completion</label>
                        <span className="text-xs font-semibold text-accent">{progressPct}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={progressPct} onChange={e => setProgressPct(e.target.value)}
                        className="w-full accent-accent" />
                    </div>
                    <textarea value={progressMsg} onChange={e => setProgressMsg(e.target.value)} rows={2}
                      className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent resize-none placeholder:text-muted transition"
                      placeholder="What's the current status?" />
                    <Button type="submit" size="sm" loading={submittingProgress}>
                      {submittingProgress ? 'Posting...' : 'Post Update'}
                    </Button>
                  </form>
                </Card>
              )}

              {progress.length === 0 ? (
                <EmptyState title="No updates yet" description="Progress updates will appear here once the printer starts working." />
              ) : progress.map(p => (
                <Card key={p.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-base">{p.printer_name}</p>
                    <span className="text-sm font-semibold text-accent">{p.percent_complete}%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5 mb-3">
                    <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${p.percent_complete}%` }} />
                  </div>
                  {p.message && <p className="text-base/70 text-sm">{p.message}</p>}
                  {p.photo_url && <img src={p.photo_url} alt="Progress" className="mt-3 rounded-md max-h-48 object-cover border border-hairline" />}
                  <p className="text-muted/60 text-xs mt-2">{new Date(p.created_at).toLocaleString()}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Chat */}
          {tab === 'chat' && (
            <div className="flex flex-col">
              <Card padding="sm" className="min-h-64 max-h-[500px] overflow-y-auto mb-3 space-y-3">
                {messages.length === 0 ? (
                  <EmptyState title="No messages yet" description="Send a message to start the conversation." />
                ) : messages.map(m => (
                  <div key={m.id} className={`flex flex-col ${m.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                    <p className="text-xs text-muted mb-1">{m.sender_name}</p>
                    <div className={`px-4 py-2 rounded-md text-sm max-w-sm ${
                      m.sender_id === user?.id ? 'bg-accent text-white' : 'bg-surface text-base/80 border border-hairline'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </Card>
              <form onSubmit={sendMessage} className="flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-transparent placeholder:text-muted transition"
                  placeholder="Type a message..." />
                <Button type="submit" size="sm"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
