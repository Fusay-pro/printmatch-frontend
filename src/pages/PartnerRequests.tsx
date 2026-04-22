import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'

const DONE = ['delivered', 'closed', 'cancelled', 'failed']
const ACTIVE = ['in_progress', 'printing', 'shipped']

const STATUS_COLORS: Record<string, string> = {
  pending_acceptance: 'bg-blue-50 text-blue-600 border-blue-200',
  in_progress:  'bg-amber-50 text-amber-600 border-amber-200',
  printing:     'bg-orange-50 text-orange-600 border-orange-200',
  shipped:      'bg-purple-50 text-purple-600 border-purple-200',
  delivered:    'bg-emerald-50 text-emerald-600 border-emerald-200',
  closed:       'bg-gray-100 text-gray-500 border-gray-200',
  cancelled:    'bg-gray-100 text-gray-500 border-gray-200',
  failed:       'bg-red-50 text-red-500 border-red-200',
}

interface Job {
  id: string
  title: string
  material: string
  complexity: string
  budget_max: number
  status: string
  is_rush: boolean
  commissioner_name: string
  created_at: string
}

export default function PartnerRequests() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tab = params.get('tab') || 'pending'

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client.get('/api/jobs', { params: { incoming: 'true' } })
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending = jobs.filter(j => j.status === 'pending_acceptance')
  const active  = jobs.filter(j => ACTIVE.includes(j.status))
  const done    = jobs.filter(j => DONE.includes(j.status))

  const display = tab === 'active' ? active : tab === 'done' ? done : pending

  return (
    <div className="p-8 max-w-3xl" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {tab === 'active' ? 'Active Orders' : tab === 'done' ? 'Completed' : 'Incoming Requests'}
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {tab === 'pending' ? 'Review and accept requests from commissioners' : 'Your current and past orders'}
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'active',  label: `Active (${active.length})` },
          { key: 'done',    label: 'Completed' },
        ].map(t => (
          <button key={t.key} onClick={() => navigate(`/requests${t.key !== 'pending' ? `?tab=${t.key}` : ''}`)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === t.key
                ? 'bg-[#1DBF73] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-[#1DBF73] hover:text-[#1DBF73]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : display.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <p className="text-3xl mb-3">{tab === 'pending' ? '📩' : '🖨'}</p>
          <p className="font-semibold text-gray-700">
            {tab === 'pending' ? 'No pending requests' : 'Nothing here yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {display.map(j => (
            <div key={j.id} onClick={() => navigate(`/jobs/${j.id}`)}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#1DBF73]/40 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 truncate">{j.title}</p>
                    {j.is_rush && <span className="shrink-0 text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full font-semibold">Rush</span>}
                  </div>
                  <p className="text-sm text-gray-400">From: <span className="text-gray-600 font-medium">{j.commissioner_name}</span></p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>{j.material}</span>
                    <span>·</span>
                    <span className="capitalize">{j.complexity}</span>
                    <span>·</span>
                    <span>{new Date(j.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-[#1DBF73]">฿{Number(j.budget_max).toLocaleString()}</p>
                  <span className={`inline-block mt-1 text-xs font-semibold border px-2.5 py-1 rounded-full ${STATUS_COLORS[j.status] || ''}`}>
                    {j.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
