import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

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
    <div className="p-6 md:p-8 max-w-3xl animate-fade-in font-sans">
      <PageHeader
        title="Submit an Appeal"
        subtitle="Contact the admin team about a job, partner, or account issue"
      />

      {/* Form */}
      <Card padding="md" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">
              Appeal Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    type === t.value
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-hairline text-muted hover:text-base'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="Brief description of the issue"
          />

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-muted uppercase tracking-widest">
              Message
            </label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              required rows={5}
              placeholder="Describe the issue in detail..."
              className="w-full border border-hairline rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none placeholder:text-muted transition-colors"
            />
          </div>

          {error && <p className="text-danger text-xs">{error}</p>}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-success text-xs px-3 py-2 rounded-md flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />Appeal submitted. The admin team will review it shortly.
            </div>
          )}

          <Button type="submit" loading={submitting} disabled={!subject.trim() || !message.trim()}>
            {submitting ? 'Submitting…' : 'Submit Appeal'}
          </Button>
        </form>
      </Card>

      {/* History */}
      {appeals.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Your Appeals</h2>
          <div className="space-y-3">
            {appeals.map(a => (
              <Card key={a.id} padding="md">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-medium text-base text-sm">{a.subject}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {TYPES.find(t => t.value === a.type)?.label}
                      {a.job_title && <> · {a.job_title}</>}
                      {' · '}{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant={a.status === 'open' ? 'amber' : 'emerald'}>
                    {a.status === 'open' ? 'Open' : 'Resolved'}
                  </Badge>
                </div>
                <p className="text-sm text-base/80 leading-relaxed">{a.message}</p>
                {a.admin_reply && (
                  <div className="mt-3 bg-surface border border-hairline rounded-md px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Admin Reply</p>
                    <p className="text-sm text-base">{a.admin_reply}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
