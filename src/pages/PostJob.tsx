import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

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
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Post a Print Job</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Describe what you need and set your budget ceiling</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Basic info */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700">Job Details</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Title</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
              placeholder="e.g. Pikachu figure 15cm in red PLA"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Description <span className="text-zinc-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder:text-zinc-400"
              placeholder="Special requirements, references, colour preferences..."
            />
          </div>
        </div>

        {/* Print specs */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700">Print Specifications</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Material</label>
              <select
                value={form.material}
                onChange={e => set('material', e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Complexity</label>
              <select
                value={form.complexity}
                onChange={e => set('complexity', e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Est. weight <span className="text-zinc-400 font-normal">(grams)</span></label>
              <input
                type="number" min="0"
                value={form.estimated_weight_g}
                onChange={e => set('estimated_weight_g', e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
                placeholder="e.g. 80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Est. print time <span className="text-zinc-400 font-normal">(hours)</span></label>
              <input
                type="number" min="0"
                value={form.estimated_time_hr}
                onChange={e => set('estimated_time_hr', e.target.value)}
                className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
                placeholder="e.g. 6"
              />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700">Budget & Priority</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Maximum budget (฿)</label>
            <input
              type="number" min="1"
              value={form.budget_max}
              onChange={e => set('budget_max', e.target.value)}
              required
              className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-zinc-400"
              placeholder="e.g. 500"
            />
            <p className="text-xs text-zinc-400">Printers cannot quote above this amount</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
            <input
              type="checkbox"
              checked={form.is_rush}
              onChange={e => set('is_rush', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-zinc-800">Rush order</p>
              <p className="text-xs text-zinc-500 mt-0.5">+30% price premium — printers will prioritise your job</p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors shadow-sm"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}
