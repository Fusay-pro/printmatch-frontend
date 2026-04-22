import { useEffect, useState } from 'react'
import client from '../api/client'

interface Report {
  id: string
  reporter_name: string
  reporter_email: string
  reported_name: string
  reported_email: string
  reason: string
  details: string | null
  status: 'pending' | 'resolved' | 'dismissed'
  conversation_id: string | null
  created_at: string
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  scam: 'Scam / Fraud',
  harassment: 'Harassment',
  fake_profile: 'Fake Profile',
  other: 'Other',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  dismissed: 'bg-gray-100 text-gray-400 border-gray-200',
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')

  const fetchReports = async () => {
    try {
      const r = await client.get('/api/reports')
      setReports(r.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [])

  const resolve = async (id: string) => {
    await client.patch(`/api/reports/${id}/resolve`)
    fetchReports()
  }

  const dismiss = async (id: string) => {
    await client.patch(`/api/reports/${id}/dismiss`)
    fetchReports()
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)
  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="p-8" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 font-semibold mt-0.5">{pendingCount} pending review</p>
          )}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['pending', 'all', 'resolved', 'dismissed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-400 text-sm">No {filter === 'all' ? '' : filter} reports</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(report => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[report.status]}`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-2">
                  <div>
                    <span className="text-xs text-gray-400">Reporter</span>
                    <p className="font-semibold text-gray-900">{report.reporter_name}</p>
                    <p className="text-xs text-gray-400">{report.reporter_email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Reported</span>
                    <p className="font-semibold text-red-600">{report.reported_name}</p>
                    <p className="text-xs text-gray-400">{report.reported_email}</p>
                  </div>
                </div>

                {report.details && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 mt-2">
                    {report.details}
                  </p>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => resolve(report.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] transition-colors">
                    Resolve
                  </button>
                  <button onClick={() => dismiss(report.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
