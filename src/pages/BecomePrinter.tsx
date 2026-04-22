import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const MATERIALS = ['PLA', 'ABS', 'PETG', 'resin', 'TPU', 'nylon', 'other']

export default function BecomePrinter() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [bio, setBio] = useState('')
  const [ratePerHour, setRatePerHour] = useState('')
  const [printers, setPrinters] = useState('')
  const [materialPrices, setMaterialPrices] = useState<Record<string, string>>(
    Object.fromEntries(MATERIALS.map(m => [m, '']))
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const filteredPrices = Object.fromEntries(
      Object.entries(materialPrices).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)])
    )
    if (Object.keys(filteredPrices).length === 0) {
      setError('Add at least one material price')
      return
    }
    setLoading(true)
    try {
      await client.post('/api/printers', {
        bio,
        rate_per_hour: Number(ratePerHour),
        material_prices: filteredPrices,
        printers_owned: printers.split(',').map(p => p.trim()).filter(Boolean),
      })
      await refreshUser()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Become a Printer</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Set up your seller profile to start accepting and quoting on jobs</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700">About You</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Bio <span className="text-zinc-400 font-normal">(optional)</span></label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder:text-zinc-400"
              placeholder="Tell commissioners about your setup, what you specialise in..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Machine rate <span className="text-zinc-400 font-normal">(฿ per hour)</span></label>
            <input
              type="number" min="0"
              value={ratePerHour}
              onChange={e => setRatePerHour(e.target.value)}
              required
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
              placeholder="e.g. 30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Printers you own <span className="text-zinc-400 font-normal">(comma separated)</span></label>
            <input
              value={printers}
              onChange={e => setPrinters(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
              placeholder="e.g. Bambu X1C, Ender 3"
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-700 mb-1">Material Prices</h2>
          <p className="text-xs text-zinc-400 mb-4">Set your price per gram for each material you support. Leave blank to skip.</p>
          <div className="grid grid-cols-2 gap-3">
            {MATERIALS.map(m => (
              <div key={m} className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-600 w-12 shrink-0">{m}</span>
                <div className="relative flex-1">
                  <input
                    type="number" min="0" step="0.01"
                    value={materialPrices[m]}
                    onChange={e => setMaterialPrices(p => ({ ...p, [m]: e.target.value }))}
                    className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">฿/g</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors shadow-sm"
        >
          {loading ? 'Creating profile...' : 'Create Printer Profile'}
        </button>
      </form>
    </div>
  )
}
