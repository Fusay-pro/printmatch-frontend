// src/pages/ConversationsInbox.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { MessageSquare, Clock } from 'lucide-react'
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
    <div className="font-sans animate-fade-in">
      <div className="p-6 md:p-8 max-w-2xl">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} variant="card" height="64px" />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-6 h-6 text-accent" />}
            title="No conversations yet"
            description="Browse partners to send your first request."
            actionLabel="Browse Partners"
            onAction={() => navigate('/browse-partners')}
          />
        ) : (
          <div className="space-y-2">
            {sorted.map(c => {
              const status = expiryStatus(c.last_message_at)
              const otherName = c.partner_user_id === user?.id ? c.commissioner_name : c.partner_name
              const isExpired = status === 'expired'
              const isWarning = status === 'warning'
              const dateStr = c.last_message_at || c.created_at

              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3.5 bg-[var(--color-sidebar-bg)] border rounded-md p-3 transition-all ${
                    isExpired ? 'opacity-50 cursor-default' : 'cursor-pointer hover:border-accent/30'
                  }`}
                  onClick={() => !isExpired && navigate(`/conversations/${c.id}`)}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0 ${
                    isExpired ? 'bg-surface border border-hairline text-muted' : 'bg-accent'
                  }`}>
                    {otherName?.[0]?.toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-base truncate">{otherName}</p>
                      {isExpired && <Badge variant="gray" className="text-[10px]">Expired</Badge>}
                      {isWarning && <Badge variant="amber" className="text-[10px]">{daysUntilExpiry(c.last_message_at)}d left</Badge>}
                      {!isExpired && !isWarning && <Badge variant="emerald" className="text-[10px]">Active</Badge>}
                    </div>
                    <p className="text-xs truncate text-muted">
                      {c.last_message || 'No messages yet'}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1 shrink-0 text-[11px] font-medium text-muted/60">
                    <Clock className="w-3 h-3" />
                    {timeAgo(dateStr)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
