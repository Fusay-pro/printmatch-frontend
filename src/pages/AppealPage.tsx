import { useEffect, useState } from 'react'
import client from '../api/client'

const TYPES = [
  { value: 'job_issue', label: 'Job Issue' },
  { value: 'partner_issue', label: 'Partner Issue' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
]

interface Appeal {
  id: string
  type: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  admin_reply: string | null
  job_title: string | null
  created_at: string
}

export default function AppealPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [type, setType] = useState('job_issue')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchAppeals() }, [])

  const fetchAppeals = async () => {
    try {
      const res = await client.get('/api/appeals/mine')
      setAppeals(res.data)
    } catch { /* ignore */ }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await client.post('/api/appeals', { type, subject, message })
      setSubject('')
      setMessage('')
      setType('job_issue')
      setSuccess(true)
      fetchAppeals()
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Submit an Appeal
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Contact the admin team about a job, partner, or account issue
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Appeal Type
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    type === t.value
                      ? 'bg-[#1DBF73] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Subject
            </label>
            <input
              type="text" value={subject} onChange={e => setSubject(e.target.value)}
              required maxLength={200}
              placeholder="Brief description of the issue"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition placeholder:text-gray-400"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Message
            </label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              required rows={5}
              placeholder="Describe the issue in detail. Include any relevant job IDs, dates, or other information..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition placeholder:text-gray-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
              Appeal submitted. The admin team will review it shortly.
            </div>
          )}

          <button type="submit" disabled={submitting || !subject.trim() || !message.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-60 transition-colors">
            {submitting ? 'Submitting…' : 'Submit Appeal'}
          </button>
        </form>
      </div>

      {/* History */}
      {appeals.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Your Appeals
          </h2>
          <div className="space-y-3">
            {appeals.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {TYPES.find(t => t.value === a.type)?.label}
                      {a.job_title && <> · {a.job_title}</>}
                      {' · '}{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${
                    a.status === 'open'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {a.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{a.message}</p>
                {a.admin_reply && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Admin Reply</p>
                    <p className="text-sm text-gray-700">{a.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
