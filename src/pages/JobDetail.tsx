import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

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

const STATUS_META: Record<string, { label: string; cls: string }> = {
  open:        { label: 'Open',        cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  printing:    { label: 'Printing',    cls: 'bg-orange-50 text-[#19a463] border-[#1DBF73]/30' },
  shipped:     { label: 'Shipped',     cls: 'bg-purple-50 text-purple-600 border-purple-200' },
  delivered:   { label: 'Delivered',   cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  closed:      { label: 'Closed',      cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  failed:      { label: 'Failed',      cls: 'bg-red-50 text-red-500 border-red-200' },
  disputed:    { label: 'Disputed',    cls: 'bg-red-50 text-red-500 border-red-200' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

function StatusTimeline({ status }: { status: string }) {
  const normalSteps = STATUS_STEPS
  const isFailed = status === 'failed' || status === 'disputed' || status === 'cancelled'
  const currentIdx = normalSteps.findIndex(s => s.key === status)

  if (isFailed) {
    const s = STATUS_META[status] || STATUS_META.failed
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold w-fit ${s.cls}`}>
        ⚠ {s.label}
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
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isCurrent
                ? 'bg-[#1DBF73] text-white shadow-sm'
                : isDone
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-gray-50 text-gray-300 border border-gray-100'
            }`}>
              {isDone && <span className="text-emerald-500">✓</span>}
              {step.label}
            </div>
            {i < normalSteps.length - 1 && (
              <div className={`w-4 h-px ${isDone ? 'bg-gray-300' : 'bg-gray-100'}`} />
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

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>
  if (!job) return <div className="p-8 text-gray-400 text-sm">Job not found</div>

  const statusMeta = STATUS_META[job.status] || STATUS_META.open

  return (
    <div className="p-8">
      {/* Status timeline */}
      <div className="mb-6">
        <StatusTimeline status={job.status} />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 max-w-6xl mx-auto">

        {/* Left — job info + actions */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Job card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h1 className="text-base font-bold text-gray-900 leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>
                {job.title}
              </h1>
              {job.is_rush && (
                <span className="shrink-0 text-xs bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">Rush</span>
              )}
            </div>

            <span className={`inline-flex items-center text-xs font-semibold border px-2.5 py-1 rounded-full mb-4 ${statusMeta.cls}`}>
              {statusMeta.label}
            </span>

            {job.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{job.description}</p>
            )}

            <div className="space-y-2">
              {[
                { label: 'Material', value: job.material },
                { label: 'Complexity', value: job.complexity },
                { label: 'Max budget', value: `฿${Number(job.budget_max).toLocaleString()}` },
                { label: 'Posted', value: new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">{f.label}</span>
                  <span className="font-medium text-gray-700 text-xs capitalize">{f.value}</span>
                </div>
              ))}
            </div>

            {job.tracking_number && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
                <p className="text-gray-400 mb-0.5">Tracking</p>
                <p className="font-medium text-gray-700">{job.courier}: {job.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Partner: accept or decline incoming request */}
          {isAssignedPrinter && job.status === 'pending_acceptance' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center">Review this request and accept or decline</p>
              <button onClick={acceptRequest}
                className="w-full bg-[#1DBF73] hover:bg-[#19a463] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                Accept Request
              </button>
              <button onClick={declineRequest}
                className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                Decline
              </button>
            </div>
          )}

          {/* Commissioner: confirm delivery */}
          {isOwner && job.status === 'shipped' && (
            <button onClick={confirmDelivery}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              Confirm Delivery & Release Payment
            </button>
          )}

          {/* Commissioner: leave review */}
          {isOwner && (job.status === 'delivered' || job.status === 'closed') && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              Leave a Review
            </button>
          )}

          {showReviewForm && (
            <form onSubmit={submitReview} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-gray-700">Leave a Review</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setReviewRating(n)}
                    className={`text-xl transition-colors ${n <= reviewRating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
                ))}
              </div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent resize-none placeholder:text-gray-400"
                placeholder="Comment (optional)" />
              <div className="flex gap-2">
                <button type="submit" className="bg-[#1DBF73] hover:bg-[#19a463] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">Submit</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600 text-xs px-3 py-2 rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          )}

          {/* Printer: ship / fail */}
          {canMarkShipped && !showShipForm && !showFailureForm && (
            <div className="space-y-2">
              <button onClick={() => setShowShipForm(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                Mark as Shipped
              </button>
              {canReportFailure && (
                <button onClick={() => setShowFailureForm(true)}
                  className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                  Report Failure
                </button>
              )}
            </div>
          )}

          {canReportFailure && !canMarkShipped && !showShipForm && !showFailureForm && (
            <button onClick={() => setShowFailureForm(true)}
              className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
              Report Failure
            </button>
          )}

          {showShipForm && (
            <form onSubmit={markShipped} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-gray-700">Shipping Details</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Courier</label>
                <input value={courier} onChange={e => setCourier(e.target.value)} required placeholder="e.g. Kerry Express"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent placeholder:text-gray-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Tracking number</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} required
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submittingShip}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  {submittingShip ? 'Saving...' : 'Confirm'}
                </button>
                <button type="button" onClick={() => setShowShipForm(false)} className="text-gray-400 hover:text-gray-600 text-xs px-3 py-2">Cancel</button>
              </div>
            </form>
          )}

          {showFailureForm && (
            <form onSubmit={reportFailure} className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-red-500">Report Failure</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Reason</label>
                <select value={failureReason} onChange={e => setFailureReason(e.target.value as typeof failureReason)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent">
                  <option value="printer_fault">Printer fault (my error)</option>
                  <option value="material_issue">Material issue</option>
                  <option value="external">External cause</option>
                </select>
              </div>
              <textarea value={failureNote} onChange={e => setFailureNote(e.target.value)} rows={2}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent resize-none placeholder:text-gray-400"
                placeholder="Describe what happened..." />
              <div className="flex gap-2">
                <button type="submit" disabled={submittingFailure}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  {submittingFailure ? 'Reporting...' : 'Report'}
                </button>
                <button type="button" onClick={() => setShowFailureForm(false)} className="text-gray-400 hover:text-gray-600 text-xs px-3 py-2">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Right — tabs */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="border-b border-gray-200 mb-6 flex">
            {(['quotes', 'progress', 'chat'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors capitalize ${
                  tab === t ? 'border-[#1DBF73] text-[#19a463]' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}>
                {t}{t === 'quotes' && ` (${quotes.length})`}
              </button>
            ))}
          </div>

          {/* Quotes */}
          {tab === 'quotes' && (
            <div className="space-y-3">
              {quotes.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                  <p className="text-gray-400 text-sm">No quotes yet</p>
                </div>
              )}

              {quotes.map(q => (
                <div key={q.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{q.printer_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>★ {Number(q.avg_rating).toFixed(1)}</span>
                        <span>·</span>
                        <span>{q.jobs_completed} jobs</span>
                        {q.match_score > 0 && <><span>·</span><span className="text-emerald-600 font-semibold">Match {Math.round(q.match_score * 100)}%</span></>}
                      </div>
                      {q.note && <p className="text-gray-500 text-sm mt-2">{q.note}</p>}
                      <p className="text-gray-400 text-xs mt-1">Est. {q.estimated_days} days</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-[#1DBF73]">฿{Number(q.final_price).toLocaleString()}</p>
                      {isOwner && q.status === 'pending' && job.status === 'open' && (
                        <button onClick={() => acceptQuote(q.id)}
                          className="mt-2 bg-[#1DBF73] hover:bg-[#19a463] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-sm">
                          Accept
                        </button>
                      )}
                      {q.status === 'accepted' && (
                        <span className="block mt-1 text-xs text-emerald-600 font-semibold">Accepted ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Progress */}
          {tab === 'progress' && (
            <div className="space-y-3">
              {canPostProgress && (
                <form onSubmit={postProgress} className="bg-white border-2 border-[#1DBF73]/30 rounded-2xl p-5 shadow-sm space-y-3">
                  <p className="text-sm font-semibold text-[#19a463]">Post an Update</p>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500">Completion</label>
                      <span className="text-xs font-bold text-[#1DBF73]">{progressPct}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={progressPct} onChange={e => setProgressPct(e.target.value)}
                      className="w-full accent-[#1DBF73]" />
                  </div>
                  <textarea value={progressMsg} onChange={e => setProgressMsg(e.target.value)} rows={2}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent resize-none placeholder:text-gray-400"
                    placeholder="What's the current status?" />
                  <button type="submit" disabled={submittingProgress}
                    className="bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">
                    {submittingProgress ? 'Posting...' : 'Post Update'}
                  </button>
                </form>
              )}

              {progress.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                  <p className="text-gray-400 text-sm">No updates yet</p>
                </div>
              ) : progress.map(p => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{p.printer_name}</p>
                    <span className="text-sm font-bold text-[#1DBF73]">{p.percent_complete}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div className="bg-[#1DBF73] h-1.5 rounded-full transition-all" style={{ width: `${p.percent_complete}%` }} />
                  </div>
                  {p.message && <p className="text-gray-600 text-sm">{p.message}</p>}
                  {p.photo_url && <img src={p.photo_url} alt="Progress" className="mt-3 rounded-xl max-h-48 object-cover border border-gray-200" />}
                  <p className="text-gray-300 text-xs mt-2">{new Date(p.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          {tab === 'chat' && (
            <div className="flex flex-col">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 min-h-64 max-h-[500px] overflow-y-auto mb-3 space-y-3 shadow-sm">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center pt-10">No messages yet</p>
                ) : messages.map(m => (
                  <div key={m.id} className={`flex flex-col ${m.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                    <p className="text-xs text-gray-400 mb-1">{m.sender_name}</p>
                    <div className={`px-4 py-2 rounded-xl text-sm max-w-sm ${
                      m.sender_id === user?.id ? 'bg-[#1DBF73] text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DBF73] focus:border-transparent placeholder:text-gray-400"
                  placeholder="Type a message..." />
                <button type="submit"
                  className="bg-[#1DBF73] hover:bg-[#19a463] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
