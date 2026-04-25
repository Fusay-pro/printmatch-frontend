import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

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
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-in font-sans">
      <PageHeader
        title="Become a Printer"
        subtitle="Set up your seller profile to start accepting and quoting on jobs"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-100 text-danger text-xs px-3 py-2 rounded-md">{error}</div>
        )}

        <Card padding="md">
          <h2 className="text-xs font-semibold text-base mb-4">About You</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-base/80 uppercase tracking-wide">
                Bio <span className="text-muted font-normal normal-case">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none placeholder:text-muted transition-colors"
                placeholder="Tell commissioners about your setup, what you specialise in..."
              />
            </div>
            <Input
              type="number" min="0"
              label="Machine rate (฿ per hour)"
              value={ratePerHour}
              onChange={e => setRatePerHour(e.target.value)}
              required
              placeholder="e.g. 30"
            />
            <Input
              label="Printers you own"
              value={printers}
              onChange={e => setPrinters(e.target.value)}
              placeholder="e.g. Bambu X1C, Ender 3"
              hint="Separate multiple printers with commas"
            />
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-xs font-semibold text-base mb-1">Material Prices</h2>
          <p className="text-xs text-muted mb-4">Set your price per gram for each material you support. Leave blank to skip.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MATERIALS.map(m => (
              <div key={m} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted w-12 shrink-0">{m}</span>
                <div className="relative flex-1">
                  <input
                    type="number" min="0" step="0.01"
                    value={materialPrices[m]}
                    onChange={e => setMaterialPrices(p => ({ ...p, [m]: e.target.value }))}
                    className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md pl-3 pr-8 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder:text-muted transition-colors"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">฿/g</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" loading={loading} size="lg">
          {loading ? 'Creating profile...' : 'Create Printer Profile'}
        </Button>
      </form>
    </div>
  )
}
