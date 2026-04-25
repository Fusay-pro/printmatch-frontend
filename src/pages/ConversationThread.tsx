// src/pages/ConversationThread.tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import client from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import {
  expiryStatus, daysUntilExpiry, CONVERSATION_POLL_MS, MATERIAL_NORM
} from '../lib/conversations'
import {
  ArrowLeft, MoreVertical, FileText, Flag, Trash2, Send, Package, Zap
} from 'lucide-react'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon', 'ASA', 'Other']

interface Conversation {
  id: string
  commissioner_id: string
  partner_user_id: string
  commissioner_name: string
  partner_name: string
  created_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  content: string | null
  msg_type: 'text' | 'request' | 'offer'
  offer_data: {
    title?: string
    description?: string
    price?: number
    material?: string
    is_rush?: boolean
    accepted?: boolean
    job_id?: string
  } | null
  created_at: string
}

interface RequestContent {
  title?: string
  material?: string
  is_rush?: boolean
  description?: string
  file_url?: string
  file_key?: string
}

export default function ConversationThread() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [conv, setConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)

  const [offerTitle, setOfferTitle] = useState('')
  const [offerDesc, setOfferDesc] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMaterial, setOfferMaterial] = useState('PLA')
  const [offerRush, setOfferRush] = useState(false)
  const [sendingOffer, setSendingOffer] = useState(false)

  const fetchMessages = async (initial = false) => {
    try {
      const r = await client.get(`/api/conversations/${id}/messages`)
      setConv(r.data.conversation)
      setMessages(r.data.messages)
      if (initial) setTimeout(() => bottomRef.current?.scrollIntoView(), 50)
    } catch {
      // ignore
    } finally {
      if (initial) setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(true)
    const interval = setInterval(() => fetchMessages(false), CONVERSATION_POLL_MS)
    return () => clearInterval(interval)
  }, [id])

  const prevLen = useRef(0)
  useEffect(() => {
    if (messages.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLen.current = messages.length
  }, [messages.length])

  useEffect(() => {
    const reqMsg = messages.find(m => m.msg_type === 'request')
    if (reqMsg && reqMsg.content) {
      try {
        const rc: RequestContent = JSON.parse(reqMsg.content)
        if (rc.material) setOfferMaterial(rc.material)
        if (rc.is_rush !== undefined) setOfferRush(rc.is_rush)
      } catch { /* ignore */ }
    }
  }, [messages])

  const sendText = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await client.post(`/api/conversations/${id}/messages`, {
        msg_type: 'text',
        content: text.trim(),
      })
      setText('')
      fetchMessages(false)
    } catch {
      toast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const sendOffer = async () => {
    if (!offerTitle.trim() || !offerPrice || sendingOffer) return
    setSendingOffer(true)
    try {
      await client.post(`/api/conversations/${id}/messages`, {
        msg_type: 'offer',
        offer_data: {
          title: offerTitle.trim(),
          description: offerDesc.trim() || null,
          price: Number(offerPrice),
          material: MATERIAL_NORM[offerMaterial] || 'other',
          is_rush: offerRush,
        },
      })
      setShowOfferForm(false)
      setOfferTitle(''); setOfferDesc(''); setOfferPrice('')
      fetchMessages(false)
    } catch {
      toast('Failed to send offer', 'error')
    } finally {
      setSendingOffer(false)
    }
  }

  const acceptOffer = async (msgId: string) => {
    try {
      const r = await client.patch(`/api/conversations/${id}/offers/${msgId}/accept`)
      toast('Offer accepted! Your job has been created.', 'success')
      navigate(`/jobs/${r.data.job.id}`)
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Failed to accept offer', 'error')
    }
  }

  const submitReport = async () => {
    if (submittingReport) return
    setSubmittingReport(true)
    try {
      await client.post('/api/reports', {
        reported_user_id: otherUserId,
        conversation_id: id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      })
      setShowReportModal(false)
      setReportDetails('')
      toast('Report submitted. Our team will review it.', 'success')
    } catch {
      toast('Failed to submit report', 'error')
    } finally {
      setSubmittingReport(false)
    }
  }

  const deleteConversation = async () => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    try {
      await client.delete(`/api/conversations/${id}`)
      navigate('/conversations')
    } catch {
      toast('Failed to delete conversation', 'error')
    }
  }

  if (loading) return <div className="p-8 text-muted text-sm font-sans">Loading...</div>
  if (!conv) return <div className="p-8 text-muted text-sm font-sans">Conversation not found</div>

  const isPartner = conv.partner_user_id === user?.id
  const otherName = isPartner ? conv.commissioner_name : conv.partner_name
  const otherUserId = isPartner ? conv.commissioner_id : conv.partner_user_id

  const lastMsgAt = messages[messages.length - 1]?.created_at ?? conv.created_at
  const status = expiryStatus(lastMsgAt)
  const anyAccepted = messages.some(m => m.offer_data?.accepted === true)

  const reqMsg = messages.find(m => m.msg_type === 'request')
  let reqContent: RequestContent = {}
  try { if (reqMsg?.content) reqContent = JSON.parse(reqMsg.content) } catch { /* ignore */ }

  return (
    <div className="flex flex-col h-full font-sans">

      {/* Top bar */}
      <div className="shrink-0 bg-[var(--color-sidebar-bg)] border-b border-hairline px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/conversations')} className="text-muted hover:text-base transition-colors mr-1">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center font-semibold text-accent text-sm">
          {otherName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-sm truncate">{otherName}</p>
        </div>
        <button onClick={() => navigate(`/partners/${otherUserId}`)}
          className="text-xs text-accent hover:underline font-medium shrink-0 flex items-center gap-1">
          View Profile <ArrowLeft className="w-3 h-3 rotate-180" />
        </button>

        {/* Three-dot menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-base hover:bg-surface transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-[var(--color-sidebar-bg)] border border-hairline rounded-md shadow-modal overflow-hidden z-20 min-w-[160px]">
                {anyAccepted && (() => {
                  const acceptedMsg = messages.find(m => m.offer_data?.accepted === true)
                  const jobId = acceptedMsg?.offer_data?.job_id
                  return jobId ? (
                    <button onClick={() => { setShowMenu(false); navigate(`/jobs/${jobId}`) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-base/80 hover:bg-surface transition-colors text-left">
                      <Package className="w-4 h-4" />
                      View Job
                    </button>
                  ) : null
                })()}
                <button onClick={() => { setShowMenu(false); setShowReportModal(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors text-left">
                  <Flag className="w-4 h-4" />
                  Report User
                </button>
                <div className="border-t border-hairline" />
                <button onClick={() => { setShowMenu(false); deleteConversation() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors text-left">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pinned request info bar */}
      {reqMsg && (
        <div className="shrink-0 bg-accent-2/5 border-b border-accent-2/10 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
          <span className="text-[10px] font-semibold text-accent-2 uppercase tracking-wide shrink-0">Request</span>
          <div className="w-px h-3 bg-accent-2/20 shrink-0" />
          <span className="text-[10px] font-semibold text-muted shrink-0">{isPartner ? conv.commissioner_name : conv.partner_name}</span>
          {reqContent.title && (
            <>
              <div className="w-px h-3 bg-accent-2/20 shrink-0" />
              <span className="text-[10px] font-semibold text-base truncate">{reqContent.title}</span>
            </>
          )}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {reqContent.material && (
              <span className="text-[10px] bg-[var(--color-sidebar-bg)] border border-hairline text-base/70 px-2 py-0.5 rounded-sm font-medium">{reqContent.material}</span>
            )}
            {reqContent.is_rush && (
              <span className="text-[10px] bg-red-50 border border-red-100 text-danger px-2 py-0.5 rounded-sm font-medium flex items-center gap-1"><Zap className="w-3 h-3" />Rush</span>
            )}
            {reqContent.file_key && <FileDownloadLink fileKey={reqContent.file_key} />}
          </div>
        </div>
      )}

      {/* Expiry warning */}
      {status === 'warning' && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-100 px-6 py-2 text-xs text-amber-700 font-medium">
          This conversation expires in {daysUntilExpiry(lastMsgAt)} day(s) — send a message to keep it active.
        </div>
      )}

      {/* Message feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-muted text-sm mt-8">Send a message to start the conversation.</p>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.sender_id === user?.id}
            isCommissioner={!isPartner}
            anyAccepted={anyAccepted}
            onAccept={() => acceptOffer(msg.id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Send Offer inline form (partner only) */}
      {isPartner && showOfferForm && (
        <div className="shrink-0 bg-surface border-t border-hairline px-6 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">Send Offer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input value={offerTitle} onChange={e => setOfferTitle(e.target.value)} placeholder="Title (required)"
                className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition bg-[var(--color-sidebar-bg)]" />
            </div>
            <div className="sm:col-span-2">
              <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="Description (optional)" rows={2}
                className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none transition bg-[var(--color-sidebar-bg)]" />
            </div>
            <div>
              <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="Price ฿ (required)"
                className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition bg-[var(--color-sidebar-bg)]" />
            </div>
            <div>
              <select value={offerMaterial} onChange={e => setOfferMaterial(e.target.value)}
                className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-[var(--color-sidebar-bg)] transition">
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer">
              <input type="checkbox" checked={offerRush} onChange={e => setOfferRush(e.target.checked)} className="accent-accent" />
              <span className="text-sm text-base/80">Rush order</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={sendOffer} disabled={sendingOffer || !offerTitle.trim() || !offerPrice} loading={sendingOffer} fullWidth>
              {sendingOffer ? 'Sending…' : 'Send Offer'}
            </Button>
            <Button variant="ghost" onClick={() => setShowOfferForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-sm mx-4">
            <p className="font-semibold text-base mb-4">Report {otherName}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Reason</label>
                <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                  className="w-full border border-hairline rounded-md px-3 py-2 text-sm bg-[var(--color-sidebar-bg)] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition">
                  <option value="spam">Spam</option>
                  <option value="scam">Scam / Fraud</option>
                  <option value="harassment">Harassment</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Details (optional)</label>
                <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={3}
                  placeholder="Describe the issue…"
                  className="w-full border border-hairline rounded-md px-3 py-2 text-sm resize-none outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition bg-[var(--color-sidebar-bg)]" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" fullWidth onClick={() => setShowReportModal(false)}>Cancel</Button>
              <Button variant="danger" fullWidth onClick={submitReport} loading={submittingReport}>
                {submittingReport ? 'Submitting…' : 'Submit Report'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 bg-[var(--color-sidebar-bg)] border-t border-hairline px-6 py-4 flex gap-2">
        {isPartner && !showOfferForm && (
          <Button variant="ghost" onClick={() => setShowOfferForm(true)} className="shrink-0 border border-accent text-accent hover:bg-accent/5">
            Send Offer
          </Button>
        )}
        <input
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendText()}
          placeholder="Type a message…"
          className="flex-1 bg-surface rounded-full px-4 py-2.5 text-sm outline-none focus:bg-[var(--color-sidebar-bg)] focus:ring-2 focus:ring-accent/20 transition placeholder:text-muted border border-transparent focus:border-accent/20"
        />
        <Button onClick={sendText} disabled={sending || !text.trim()} size="sm" className="rounded-full px-5">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Message Bubble component ──────────────────────────────────────────────────

function MessageBubble({ msg, isOwn, isCommissioner, anyAccepted, onAccept }: {
  msg: Message
  isOwn: boolean
  isCommissioner: boolean
  anyAccepted: boolean
  onAccept: () => void
}) {
  if (msg.msg_type === 'request') return null

  if (msg.msg_type === 'offer') {
    const od = msg.offer_data
    const isAccepted = od?.accepted === true
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-sm border rounded-lg p-4 ${isAccepted ? 'bg-accent/5 border-accent/20' : 'bg-[var(--color-sidebar-bg)] border-accent/30'}`}>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2 flex items-center gap-1">
          {isAccepted && <CheckIcon />} {isAccepted ? 'Accepted Offer' : 'Offer'}
        </p>
        {od?.title && <p className="font-semibold text-base mb-1">{od.title}</p>}
        <p className="text-2xl font-bold text-accent mb-2">฿{Number(od?.price).toLocaleString()}</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {od?.material && (
            <span className="text-xs bg-surface border border-hairline text-base/70 px-2 py-0.5 rounded-sm font-medium">{od.material}</span>
          )}
          {od?.is_rush && (
            <span className="text-xs bg-red-50 border border-red-100 text-danger px-2 py-0.5 rounded-sm font-medium flex items-center gap-1"><Zap className="w-3 h-3" />Rush</span>
          )}
        </div>
        {od?.description && <p className="text-sm text-base/70 mb-3">{od.description}</p>}

        {isCommissioner && !isAccepted && !anyAccepted && (
          <Button onClick={onAccept} fullWidth size="sm">Accept Offer</Button>
        )}
        {isCommissioner && !isAccepted && anyAccepted && (
          <p className="text-xs text-muted text-center">Another offer already accepted</p>
        )}
        {!isCommissioner && !isAccepted && (
          <p className="text-xs text-muted text-center">Pending commissioner acceptance…</p>
        )}

        <p className="text-xs text-muted mt-2">{new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      </div>
    )
  }

  // Default: text bubble
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-lg text-sm ${
        isOwn ? 'bg-accent text-white rounded-br-sm' : 'bg-[var(--color-sidebar-bg)] border border-hairline text-base/80 rounded-bl-sm'
      }`}>
        {!isOwn && <p className="text-[10px] font-semibold mb-0.5 opacity-60">{msg.sender_name}</p>}
        <p className="leading-relaxed">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60 text-right' : 'text-muted'}`}>
          {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function CheckIcon() {
  return <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
}

// ── File download link ────────────────────────────────────────────────────────

function FileDownloadLink({ fileKey }: { fileKey: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    client.get(`/api/upload/download/${encodeURIComponent(fileKey)}`)
      .then(r => {
        const candidate = r.data?.download_url
        if (typeof candidate !== 'string') return
        try {
          const parsed = new URL(candidate)
          if (parsed.protocol !== 'https:') {
            setBlocked(true)
            return
          }
          setUrl(parsed.toString())
          setBlocked(false)
        } catch {
          setBlocked(true)
        }
      })
      .catch(() => {
        setBlocked(true)
      })
  }, [fileKey])

  if (blocked) return <p className="text-xs text-danger">Blocked unsafe download link</p>
  if (!url) return <p className="text-xs text-muted">Loading file link...</p>
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="text-xs text-accent hover:underline font-medium flex items-center gap-1">
      <FileText className="w-3 h-3" /> Download STL file
    </a>
  )
}
