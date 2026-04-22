// src/pages/ConversationsInbox.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { expiryStatus, daysUntilExpiry, INBOX_POLL_MS } from '../lib/conversations'

interface Conversation {
  id: string
  commissioner_id: string
  partner_user_id: string
  commissioner_name: string
  partner_name: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ConversationsInbox() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [convs, setConvs] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConvs = () => {
    client.get('/api/conversations')
      .then(r => setConvs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchConvs()
    const id = setInterval(fetchConvs, INBOX_POLL_MS)
    return () => clearInterval(id)
  }, [])

  const active = convs.filter(c => expiryStatus(c.last_message_at) !== 'expired')
  const expired = convs.filter(c => expiryStatus(c.last_message_at) === 'expired')
  const sorted = [...active, ...expired]

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <div className="p-8 pt-6 max-w-2xl">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" style={{ opacity: 0.5 }} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M4 6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-4l-3 3.5L10 17H6a2 2 0 01-2-2V6z" stroke="#16a34a" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-bold text-gray-800 mb-1">No conversations yet</p>
            <p className="text-sm text-gray-400">
              <button onClick={() => navigate('/browse-partners')} className="font-semibold hover:underline" style={{ color: '#1DBF73' }}>
                Browse partners
              </button>
              {' '}to send your first request
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map(c => {
              const status = expiryStatus(c.last_message_at)
              const otherName = c.partner_user_id === user?.id ? c.commissioner_name : c.partner_name
              const isExpired = status === 'expired'
              const isWarning = status === 'warning'
              const dateStr = c.last_message_at || c.created_at

              return (
                <div key={c.id}
                  onClick={() => !isExpired && navigate(`/conversations/${c.id}`)}
                  className="flex items-center gap-3.5 p-4 rounded-2xl transition-all"
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isExpired ? '#f3f4f6' : '#e5e7eb'}`,
                    opacity: isExpired ? 0.5 : 1,
                    cursor: isExpired ? 'default' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!isExpired) { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(29,191,115,0.4)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(29,191,115,0.08)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isExpired ? '#f3f4f6' : '#e5e7eb'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: isExpired ? '#d1d5db' : 'linear-gradient(135deg, #1DBF73, #0ea5e9)' }}>
                    {otherName?.[0]?.toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-gray-900 truncate">{otherName}</p>
                      {isExpired && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Expired</span>
                      )}
                      {isWarning && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0" style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}>
                          {daysUntilExpiry(c.last_message_at)}d left
                        </span>
                      )}
                      {!isExpired && !isWarning && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#dcfce7', color: '#16a34a' }}>Active</span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                      {c.last_message || 'No messages yet'}
                    </p>
                  </div>

                  {/* Time */}
                  <p className="text-[11px] font-medium shrink-0" style={{ color: '#d1d5db' }}>
                    {timeAgo(dateStr)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
