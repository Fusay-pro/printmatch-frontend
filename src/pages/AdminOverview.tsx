import { useEffect, useState } from 'react'
import client from '../api/client'

interface Stats {
  total_jobs: number
  open_jobs: number
  pending_partners: number
  approved_partners: number
  open_appeals: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    client.get('/api/admin/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Commissions', value: stats?.total_jobs ?? '—', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Open Jobs', value: stats?.open_jobs ?? '—', color: 'text-[#1DBF73]', bg: 'bg-[#1DBF73]/10' },
    { label: 'Pending Applications', value: stats?.pending_partners ?? '—', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Partners', value: stats?.approved_partners ?? '—', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Open Appeals', value: stats?.open_appeals ?? '—', color: 'text-red-500', bg: 'bg-red-50' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Overview
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Platform summary</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
