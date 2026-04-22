import { useEffect, useState } from 'react'
import client from '../api/client'

interface Appeal {
  id: string
  type: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  admin_reply: string | null
  job_title: string | null
  sender_name: string
  sender_email: string
  created_at: string
  resolved_at: string | null
}

const TYPE_LABELS: Record<string, string> = {
  job_issue: 'Job Issue',
  partner_issue: 'Partner Issue',
  account_issue: 'Account Issue',
  other: 'Other',
}

export default function AdminAppeals() {
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')
  const [selected, setSelected] = useState<Appeal | null>(null)
  const [reply, setReply] = useState('')
  const [acting, setActing] = useState(false)

  useEffect(() => { fetchAppeals() }, [filter])

  const fetchAppeals = async () => {
    setLoading(true)
    try {
      const q = filter !== 'all' ? `?status=${filter}` : ''
      const res = await client.get(`/api/admin/appeals${q}`)
      setAppeals(res.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const resolve = async (id: string) => {
    setActing(true)
    try {
      await client.patch(`/api/admin/appeals/${id}/resolve`, { reply })
      setSelected(null)
      setReply('')
      fetchAppeals()
    } finally { setActing(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Appeals
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Review and respond to user appeals</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['open', 'resolved', 'all'] as const).map(t => (
          <button key={t} onClick={() => { setFilter(t); setSelected(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
              filter === t
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800'
            }`}>
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="w-80 shrink-0 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : appeals.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm">No {filter !== 'all' ? filter : ''} appeals</p>
            </div>
          ) : appeals.map(a => (
            <button key={a.id} onClick={() => { setSelected(a); setReply('') }}
              className={`w-full text-left bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                selected?.id === a.id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-gray-900 truncate flex-1">{a.subject}</p>
                {a.status === 'open' && <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400 mt-1.5" />}
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">{a.sender_name} · {TYPE_LABELS[a.type] ?? a.type}</p>
              <p className="text-xs text-gray-400">
                {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {selected.subject}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selected.sender_name} · {selected.sender_email}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                selected.status === 'open'
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}>
                {selected.status}
              </span>
            </div>

            <div className="p-6 space-y-5">

              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                  {TYPE_LABELS[selected.type] ?? selected.type}
                </span>
                {selected.job_title && (
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold border border-blue-100">
                    Job: {selected.job_title}
                  </span>
                )}
                <span className="text-gray-400">
                  {new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {selected.admin_reply && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Your Reply</p>
                  <p className="text-sm text-gray-700">{selected.admin_reply}</p>
                </div>
              )}

              {selected.status === 'open' && (
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                      Reply (optional)
                    </label>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                      placeholder="Write a reply to the user..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none placeholder:text-gray-400 transition"
                    />
                  </div>
                  <button onClick={() => resolve(selected.id)} disabled={acting}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors">
                    {acting ? 'Resolving…' : '✓ Mark as Resolved'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 text-sm">
            Select an appeal to review
          </div>
        )}
      </div>
    </div>
  )
}
