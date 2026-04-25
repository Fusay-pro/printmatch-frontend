import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const MATERIALS = ['PLA', 'ABS', 'PETG', 'resin', 'TPU', 'nylon', 'other']

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', material: 'PLA',
    estimated_weight_g: '', estimated_time_hr: '',
    complexity: 'medium', is_rush: false, budget_max: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await client.post('/api/jobs', {
        ...form,
        estimated_weight_g: form.estimated_weight_g ? Number(form.estimated_weight_g) : null,
        estimated_time_hr: form.estimated_time_hr ? Number(form.estimated_time_hr) : null,
        budget_max: Number(form.budget_max),
      })
      navigate(`/jobs/${res.data.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-in font-sans">
      <PageHeader
        title="Post a Print Job"
        subtitle="Describe what you need and set your budget ceiling"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-100 text-danger text-xs px-3 py-2 rounded-md">{error}</div>
        )}

        {/* Basic info */}
        <Card padding="md">
          <h2 className="text-xs font-semibold text-base mb-4">Job Details</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              placeholder="e.g. Pikachu figure 15cm in red PLA"
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-base/80 uppercase tracking-wide">
                Description <span className="text-muted font-normal normal-case">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none placeholder:text-muted transition-colors"
                placeholder="Special requirements, references, colour preferences..."
              />
            </div>
          </div>
        </Card>

        {/* Print specs */}
        <Card padding="md">
          <h2 className="text-xs font-semibold text-base mb-4">Print Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-base/80 uppercase tracking-wide">Material</label>
              <select
                value={form.material}
                onChange={e => set('material', e.target.value)}
                className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              >
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-base/80 uppercase tracking-wide">Complexity</label>
              <select
                value={form.complexity}
                onChange={e => set('complexity', e.target.value)}
                className="w-full bg-[var(--color-sidebar-bg)] border border-hairline text-base rounded-md px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <Input
              type="number" min="0"
              label="Est. weight (grams)"
              value={form.estimated_weight_g}
              onChange={e => set('estimated_weight_g', e.target.value)}
              placeholder="e.g. 80"
            />
            <Input
              type="number" min="0"
              label="Est. print time (hours)"
              value={form.estimated_time_hr}
              onChange={e => set('estimated_time_hr', e.target.value)}
              placeholder="e.g. 6"
            />
          </div>
        </Card>

        {/* Budget */}
        <Card padding="md">
          <h2 className="text-xs font-semibold text-base mb-4">Budget & Priority</h2>
          <div className="space-y-4">
            <Input
              type="number" min="1"
              label="Maximum budget (฿)"
              value={form.budget_max}
              onChange={e => set('budget_max', e.target.value)}
              required
              placeholder="e.g. 500"
              hint="Printers cannot quote above this amount"
            />
            <label className="flex items-start gap-3 cursor-pointer select-none p-3 bg-amber-50/50 border border-amber-100 rounded-md hover:bg-amber-50 transition-colors">
              <input
                type="checkbox"
                checked={form.is_rush}
                onChange={e => set('is_rush', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent"
              />
              <div>
                <p className="text-sm font-medium text-base flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-accent" />Rush order</p>
                <p className="text-xs text-muted mt-0.5">+30% price premium — printers will prioritise your job</p>
              </div>
            </label>
          </div>
        </Card>

        <Button type="submit" loading={loading} size="lg">
          {loading ? 'Posting...' : 'Post Job'}
        </Button>
      </form>
    </div>
  )
}
