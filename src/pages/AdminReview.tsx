import { useEffect, useState } from 'react'
import client from '../api/client'

interface PendingPartner {
  id: string
  user_name: string
  user_email: string
  printers_owned: string[]
  material_prices: Record<string, number>
  bio: string
  province: string
  district: string
  phone: string
  line_id: string
  printer_photo_url: string | null
  id_photo_url: string | null
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function AdminReview() {
  const [partners, setPartners] = useState<PendingPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selected, setSelected] = useState<PendingPartner | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [acting, setActing] = useState(false)

  useEffect(() => { fetchPartners() }, [filter])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const res = await client.get(`/api/admin/partners?status=${filter}`)
      setPartners(res.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const approve = async (id: string) => {
    setActing(true)
    try {
      await client.patch(`/api/admin/partners/${id}/approve`)
      setSelected(null)
      fetchPartners()
    } finally { setActing(false) }
  }

  const reject = async (id: string) => {
    setActing(true)
    try {
      await client.patch(`/api/admin/partners/${id}/reject`, { reason: rejectReason })
      setSelected(null)
      setRejectReason('')
      setShowRejectInput(false)
      fetchPartners()
    } finally { setActing(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Partner Applications
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Review and approve printer partner requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button key={t} onClick={() => { setFilter(t); setSelected(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
              filter === t
                ? 'bg-[#1DBF73] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="w-80 shrink-0 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : partners.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm">No {filter} applications</p>
            </div>
          ) : partners.map(p => (
            <button key={p.id} onClick={() => { setSelected(p); setShowRejectInput(false); setRejectReason('') }}
              className={`w-full text-left bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                selected?.id === p.id ? 'border-[#1DBF73] ring-2 ring-[#1DBF73]/20' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1DBF73]/10 flex items-center justify-center text-sm font-bold text-[#1DBF73] shrink-0">
                  {p.user_name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{p.user_name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.user_email}</p>
                </div>
                {p.status === 'pending' && (
                  <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {(p.printers_owned ?? []).slice(0, 2).map(pr => (
                  <span key={pr} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{pr}</span>
                ))}
                {(p.printers_owned ?? []).length > 2 && (
                  <span className="text-xs text-gray-400">+{p.printers_owned.length - 2} more</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {selected.user_name}
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">{selected.user_email}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                selected.status === 'pending'  ? 'bg-amber-50 text-amber-600 border-amber-200' :
                selected.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                'bg-red-50 text-red-500 border-red-200'
              }`}>
                {selected.status}
              </span>
            </div>

            <div className="p-6 space-y-6">

              {/* Photos side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Printer Photo</p>
                  {selected.printer_photo_url ? (
                    <img src={selected.printer_photo_url} alt="Printer"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                  ) : (
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">ID / Passport</p>
                  {selected.id_photo_url ? (
                    <img src={selected.id_photo_url} alt="ID"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                  ) : (
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                      No photo
                    </div>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Printers Owned</p>
                  <div className="flex flex-wrap gap-1">
                    {(selected.printers_owned ?? []).map(p => (
                      <span key={p} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Materials</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(selected.material_prices ?? {}).map(m => (
                      <span key={m} className="bg-[#1DBF73]/10 text-[#1DBF73] text-xs px-2.5 py-1 rounded-full font-semibold">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-gray-700">{[selected.district, selected.province].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Contact</p>
                  <p className="text-gray-700">{selected.phone || '—'}</p>
                  {selected.line_id && <p className="text-gray-500 text-xs">Line: {selected.line_id}</p>}
                </div>
              </div>

              {selected.bio && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selected.bio}</p>
                </div>
              )}

              {/* Actions — only for pending */}
              {selected.status === 'pending' && (
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  {showRejectInput ? (
                    <div className="space-y-2">
                      <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none placeholder:text-gray-400 transition"
                        placeholder="Reason for rejection (optional — will be sent to applicant)..." />
                      <div className="flex gap-2">
                        <button onClick={() => reject(selected.id)} disabled={acting}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors">
                          {acting ? 'Rejecting…' : 'Confirm Rejection'}
                        </button>
                        <button onClick={() => setShowRejectInput(false)}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => approve(selected.id)} disabled={acting}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#1DBF73] hover:bg-[#19a463] disabled:opacity-60 transition-colors">
                        {acting ? 'Approving…' : '✓ Approve'}
                      </button>
                      <button onClick={() => setShowRejectInput(true)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 text-sm">
            Select an application to review
          </div>
        )}
      </div>
    </div>
  )
}
