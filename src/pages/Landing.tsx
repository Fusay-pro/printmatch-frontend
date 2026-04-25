import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Printer,
  Gem,
  Wrench,
  Drama,
  Shapes,
  FlaskConical,
  Star,
  ArrowRight,
} from 'lucide-react'

const CATEGORIES = [
  { icon: <Printer className="w-5 h-5" />, label: 'PLA Printing' },
  { icon: <Gem className="w-5 h-5" />, label: 'Resin Prints' },
  { icon: <Wrench className="w-5 h-5" />, label: 'Functional Parts' },
  { icon: <Drama className="w-5 h-5" />, label: 'Cosplay Props' },
  { icon: <Shapes className="w-5 h-5" />, label: 'Miniatures' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Prototypes' },
]

const POPULAR = ['PLA', 'Resin', 'Cosplay Props', 'Functional Parts', 'Miniatures', 'PETG']

const HOW = [
  { n: '01', title: 'Post your job', desc: 'Describe what you need — material, size, budget. Takes under 2 minutes.' },
  { n: '02', title: 'Receive quotes', desc: 'Verified local printers bid on your job. Compare price, rating, and distance.' },
  { n: '03', title: 'Print & deliver', desc: 'Payment held in escrow. Released only when you confirm delivery.' },
]

const STATS = [
  { value: '500+', label: 'Active printers' },
  { value: '2,400+', label: 'Jobs completed' },
  { value: '4.8', label: 'Average rating' },
  { value: '฿2.1M+', label: 'Secured in escrow' },
]

const REVIEWS = [
  { name: 'Natthapong K.', role: 'Product designer', text: 'Had 4 quotes by morning. Matched printer was 8km from me. Delivered in 3 days.', stars: 5 },
  { name: 'Siriwan M.',    role: 'Cosplay creator',  text: 'Found a resin specialist for my helmet parts. Perfect finish, great price.',    stars: 5 },
  { name: 'Chayanon T.',   role: 'Printer owner',    text: 'The escrow system means I always get paid on time. Best side income I have.',   stars: 5 },
]

export default function Landing() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/register')
  }

  return (
    <div className="min-h-screen bg-[var(--color-sidebar-bg)] font-sans text-base">

      {/* ── Nav ── */}
      <nav className="bg-[var(--color-sidebar-bg)] border-b border-hairline sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <Link to="/" className="text-[15px] font-semibold text-base shrink-0 font-display tracking-tight">
            Print<span className="text-accent">Match</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {['PLA', 'Resin', 'Cosplay', 'Functional'].map(t => (
              <Link key={t} to="/register" className="text-xs text-muted hover:text-base px-3 py-1.5 rounded-sm hover:bg-surface transition-colors whitespace-nowrap">
                {t}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/register" className="hidden sm:block text-xs font-medium text-muted hover:text-base transition-colors">
              Become a Partner
            </Link>
            <Link to="/login" className="text-xs font-medium text-muted hover:text-base transition-colors">
              Sign in
            </Link>
            <Link to="/register"
              className="text-xs font-medium px-3 py-1.5 rounded-sm border border-accent text-accent hover:bg-accent hover:text-white transition-colors">
              Join
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-4">
            Thailand's 3D printing marketplace
          </p>
          <h1 className="text-5xl sm:text-6xl font-semibold text-base leading-[1.05] mb-5 font-display tracking-tight">
            Find the perfect<br />3D print service
          </h1>
          <p className="text-muted text-base mb-10 max-w-md leading-relaxed">
            Connect with verified local 3D printers. Get quoted, tracked, and delivered — all in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex bg-[var(--color-sidebar-bg)] border border-hairline rounded-md overflow-hidden max-w-lg mb-6">
            <select className="border-r border-hairline px-3 py-3 text-xs text-muted bg-[var(--color-sidebar-bg)] outline-none cursor-pointer">
              <option>All materials</option>
              <option>PLA</option>
              <option>Resin</option>
              <option>PETG</option>
              <option>ABS</option>
              <option>TPU</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What do you need printed?"
              className="flex-1 px-4 py-3 text-sm text-base outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="px-6 py-3 text-white text-xs font-medium bg-accent hover:bg-accent-hover transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted text-xs">Popular:</span>
            {POPULAR.map(tag => (
              <Link key={tag} to="/register"
                className="text-xs text-muted hover:text-base border border-hairline hover:border-muted px-2.5 py-1 rounded-sm transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-hairline bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-8 md:gap-12">
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-sm font-semibold text-base font-display">{s.value}</span>
              <span className="text-muted text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-base font-display tracking-tight">
              Explore the marketplace
            </h2>
            <p className="text-muted text-sm mt-1">Browse by print type or material</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to="/register"
              className="border border-hairline bg-[var(--color-sidebar-bg)] rounded-md p-4 transition-colors group hover:border-accent cursor-pointer">
              <div className="text-accent mb-2.5">{cat.icon}</div>
              <p className="text-xs font-medium text-base">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-surface border-y border-hairline py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-xl font-semibold text-base font-display tracking-tight mb-10">
            From idea to doorstep in three steps
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-[19px] top-8 bottom-8 w-px bg-hairline" />

            <div className="grid md:grid-cols-1 gap-8">
              {HOW.map(s => (
                <div key={s.n} className="flex gap-5 relative">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center text-xs font-semibold shrink-0 bg-[var(--color-sidebar-bg)] border border-hairline text-accent z-10">
                    {s.n}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-medium text-base text-sm mb-1">{s.title}</h3>
                    <p className="text-muted text-sm leading-relaxed max-w-md">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-xl font-semibold text-base font-display tracking-tight mb-8">
          What people are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {REVIEWS.map(r => (
            <div key={r.name} className="bg-[var(--color-sidebar-bg)] border border-hairline rounded-md p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-base text-sm leading-relaxed mb-4">"{r.text}"</p>
              <div>
                <p className="font-medium text-base text-xs">{r.name}</p>
                <p className="text-muted text-[11px] mt-0.5">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Printer CTA ── */}
      <section className="bg-base py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-medium mb-3 uppercase tracking-widest text-accent">For partners</p>
              <h2 className="text-2xl font-semibold text-white mb-3 font-display tracking-tight">
                Turn your idle printer<br />into steady income
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-md">
                Set your own rates, pick the jobs you want, and get paid through secure escrow. No chasing invoices, no cold sales.
              </p>
            </div>
            <Link to="/register"
              className="shrink-0 font-medium px-6 py-3 rounded-md text-white text-xs transition-colors bg-accent hover:bg-accent-hover whitespace-nowrap inline-flex items-center gap-1.5">
              Become a Partner <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-hairline bg-[var(--color-sidebar-bg)]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[15px] font-semibold text-base font-display tracking-tight">
            Print<span className="text-accent">Match</span>
          </span>
          <p className="text-muted text-xs">© 2026 PrintMatch. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-muted">
            <a href="#" className="hover:text-base transition-colors">Privacy</a>
            <a href="#" className="hover:text-base transition-colors">Terms</a>
            <a href="#" className="hover:text-base transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
