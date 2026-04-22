// src/pages/ConversationThread.tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import client from '../api/client'
import {
  expiryStatus, daysUntilExpiry, CONVERSATION_POLL_MS, MATERIAL_NORM
} from '../lib/conversations'

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

  // Offer form state
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

  // Auto-scroll when new messages arrive
  const prevLen = useRef(0)
  useEffect(() => {
    if (messages.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLen.current = messages.length
  }, [messages.length])

  // Pre-fill offer form from the request message
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

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>
  if (!conv) return <div className="p-8 text-gray-400 text-sm">Conversation not found</div>

  const isPartner = conv.partner_user_id === user?.id
  const otherName = isPartner ? conv.commissioner_name : conv.partner_name
  const otherUserId = isPartner ? conv.commissioner_id : conv.partner_user_id

  const lastMsgAt = messages[messages.length - 1]?.created_at ?? conv.created_at
  const status = expiryStatus(lastMsgAt)
  const anyAccepted = messages.some(m => m.offer_data?.accepted === true)

  // Extract pinned request info
  const reqMsg = messages.find(m => m.msg_type === 'request')
  let reqContent: RequestContent = {}
  try { if (reqMsg?.content) reqContent = JSON.parse(reqMsg.content) } catch { /* ignore */ }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* Top bar */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/conversations')} className="text-sm text-gray-400 hover:text-gray-700 mr-1">←</button>
        <div className="w-9 h-9 rounded-full bg-[#1DBF73]/10 flex items-center justify-center font-bold text-[#1DBF73]">
          {otherName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">{otherName}</p>
        </div>
        <button onClick={() => navigate(`/partners/${otherUserId}`)}
          className="text-xs text-[#1DBF73] hover:underline font-semibold">
          View Profile →
        </button>

        {/* Three-dot menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg font-bold">
            ···
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 min-w-[160px]">
                {anyAccepted && (() => {
                  const acceptedMsg = messages.find(m => m.offer_data?.accepted === true)
                  const jobId = acceptedMsg?.offer_data?.job_id
                  return jobId ? (
                    <button onClick={() => { setShowMenu(false); navigate(`/jobs/${jobId}`) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                      <span>📦</span> View Job
                    </button>
                  ) : null
                })()}
                <button onClick={() => { setShowMenu(false); setShowReportModal(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors text-left">
                  <span>⚑</span> Report User
                </button>
                <div className="border-t border-gray-100" />
                <button onClick={() => { setShowMenu(false); deleteConversation() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                  <span>🗑</span> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pinned request info bar */}
      {reqMsg && (
        <div className="shrink-0 bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center gap-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wide shrink-0">Request</span>
          <div className="w-px h-3 bg-blue-200 shrink-0" />
          <span className="text-xs font-bold text-gray-500 shrink-0">{isPartner ? conv.commissioner_name : conv.partner_name}</span>
          {reqContent.title && (
            <>
              <div className="w-px h-3 bg-blue-200 shrink-0" />
              <span className="text-xs font-semibold text-gray-800 truncate">{reqContent.title}</span>
            </>
          )}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {reqContent.material && (
              <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{reqContent.material}</span>
            )}
            {reqContent.is_rush && (
              <span className="text-xs bg-red-50 border border-red-200 text-red-500 px-2 py-0.5 rounded-full font-semibold">Rush</span>
            )}
            {reqContent.file_key && <FileDownloadLink fileKey={reqContent.file_key} />}
          </div>
        </div>
      )}

      {/* Expiry warning */}
      {status === 'warning' && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-700 font-medium">
          This conversation expires in {daysUntilExpiry(lastMsgAt)} day(s) — send a message to keep it active.
        </div>
      )}

      {/* Message feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">Send a message to start the conversation.</p>
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
        <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Send Offer</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input value={offerTitle} onChange={e => setOfferTitle(e.target.value)} placeholder="Title (required)"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1DBF73]" />
            </div>
            <div className="col-span-2">
              <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="Description (optional)" rows={2}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1DBF73] resize-none" />
            </div>
            <div>
              <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="Price ฿ (required)"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1DBF73]" />
            </div>
            <div>
              <select value={offerMaterial} onChange={e => setOfferMaterial(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1DBF73] bg-white">
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 col-span-2 cursor-pointer">
              <input type="checkbox" checked={offerRush} onChange={e => setOfferRush(e.target.checked)} className="accent-[#1DBF73]" />
              <span className="text-sm text-gray-700">Rush order</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={sendOffer} disabled={sendingOffer || !offerTitle.trim() || !offerPrice}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-50 transition-colors">
              {sendingOffer ? 'Sending…' : 'Send Offer'}
            </button>
            <button onClick={() => setShowOfferForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <p className="font-bold text-gray-900 mb-4">Report {otherName}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Reason</label>
                <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[#1DBF73]">
                  <option value="spam">Spam</option>
                  <option value="scam">Scam / Fraud</option>
                  <option value="harassment">Harassment</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Details (optional)</label>
                <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={3}
                  placeholder="Describe the issue…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-[#1DBF73]" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={submitReport} disabled={submittingReport}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors">
                {submittingReport ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-2">
        {isPartner && !showOfferForm && (
          <button onClick={() => setShowOfferForm(true)}
            className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border border-[#1DBF73] text-[#1DBF73] hover:bg-[#1DBF73]/5 transition-colors">
            Send Offer
          </button>
        )}
        <input
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendText()}
          placeholder="Type a message…"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#1DBF73]/30 transition placeholder:text-gray-400 border border-transparent focus:border-[#1DBF73]/40"
        />
        <button onClick={sendText} disabled={sending || !text.trim()}
          className="shrink-0 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-50 transition-colors">
          Send
        </button>
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
      <div className={`max-w-xs lg:max-w-sm border rounded-2xl p-4 ${isAccepted ? 'bg-[#1DBF73]/5 border-[#1DBF73]/30' : 'bg-white border-[#1DBF73]/40'}`}>
        <p className="text-xs font-bold text-[#1DBF73] uppercase tracking-wide mb-2">
          {isAccepted ? '✓ Accepted Offer' : 'Offer'}
        </p>
        {od?.title && <p className="font-bold text-gray-900 mb-1">{od.title}</p>}
        <p className="text-2xl font-bold text-[#1DBF73] mb-2">฿{Number(od?.price).toLocaleString()}</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {od?.material && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold">{od.material}</span>
          )}
          {od?.is_rush && (
            <span className="text-xs bg-red-50 border border-red-200 text-red-500 px-2 py-0.5 rounded-full font-semibold">Rush</span>
          )}
        </div>
        {od?.description && <p className="text-sm text-gray-600 mb-3">{od.description}</p>}

        {isCommissioner && !isAccepted && !anyAccepted && (
          <button onClick={onAccept}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] transition-colors">
            Accept Offer
          </button>
        )}
        {isCommissioner && !isAccepted && anyAccepted && (
          <p className="text-xs text-gray-400 text-center">Another offer already accepted</p>
        )}
        {!isCommissioner && !isAccepted && (
          <p className="text-xs text-gray-400 text-center">Pending commissioner acceptance…</p>
        )}

        <p className="text-xs text-gray-400 mt-2">{new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      </div>
    )
  }

  // Default: text bubble
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
        isOwn ? 'bg-[#1DBF73] text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
      }`}>
        {!isOwn && <p className="text-[10px] font-bold mb-0.5 opacity-60">{msg.sender_name}</p>}
        <p className="leading-relaxed">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60 text-right' : 'text-gray-400'}`}>
          {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
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

  if (blocked) return <p className="text-xs text-red-500">Blocked unsafe download link</p>
  if (!url) return <p className="text-xs text-gray-400">Loading file link...</p>
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="text-xs text-[#1DBF73] hover:underline font-semibold flex items-center gap-1">
      Download STL file
    </a>
  )
}

