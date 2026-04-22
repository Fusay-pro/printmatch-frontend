import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { icon: '🖨', label: 'PLA Printing',      bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700' },
  { icon: '💎', label: 'Resin Prints',       bg: 'bg-cyan-50 hover:bg-cyan-100',       text: 'text-cyan-700' },
  { icon: '⚙️', label: 'Functional Parts',  bg: 'bg-slate-100 hover:bg-slate-200',     text: 'text-slate-700' },
  { icon: '🎭', label: 'Cosplay Props',      bg: 'bg-purple-50 hover:bg-purple-100',    text: 'text-purple-700' },
  { icon: '🏺', label: 'Miniatures',         bg: 'bg-amber-50 hover:bg-amber-100',      text: 'text-amber-700' },
  { icon: '🔩', label: 'Prototypes',         bg: 'bg-rose-50 hover:bg-rose-100',        text: 'text-rose-700' },
]

const POPULAR = ['PLA', 'Resin', 'Cosplay Props', 'Functional Parts', 'Miniatures', 'PETG']

const HOW = [
  { n: '1', title: 'Post your job', desc: 'Describe what you need — material, size, budget. Takes under 2 minutes.' },
  { n: '2', title: 'Receive quotes', desc: 'Verified local printers bid on your job. Compare price, rating, and distance.' },
  { n: '3', title: 'Print & deliver', desc: 'Payment held in escrow. Released only when you confirm delivery.' },
]

const STATS = [
  { value: '500+', label: 'Active printers' },
  { value: '2,400+', label: 'Jobs completed' },
  { value: '4.8 / 5', label: 'Average rating' },
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
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="text-2xl font-bold text-gray-900 shrink-0" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Print<span className="text-[#1DBF73]">Match</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1 max-w-xs">
            {['PLA', 'Resin', 'Cosplay', 'Functional'].map(t => (
              <Link key={t} to="/register" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                {t}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link to="/register" className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-[#1DBF73] transition-colors">
              Become a Partner
            </Link>
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link to="/register"
              className="text-sm font-semibold px-4 py-2 rounded border-2 border-[#1DBF73] text-[#1DBF73] hover:bg-[#1DBF73] hover:text-white transition-colors">
              Join
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#1DBF73' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 blur-2xl" style={{ background: '#1DBF73' }} />

        <div className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] animate-pulse" />
            Now live in Thailand · 500+ verified printers
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Find the perfect<br />3D print service
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Connect with verified local 3D printers. Get quoted, tracked, and delivered — all in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl mx-auto mb-8">
            <select className="border-r border-gray-200 px-4 py-4 text-sm text-gray-600 bg-white outline-none cursor-pointer">
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
              className="flex-1 px-5 py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-8 py-4 text-white text-sm font-bold bg-[#1DBF73] hover:bg-[#19a463] transition-colors"
            >
              Search
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-white/40 text-sm">Popular:</span>
            {POPULAR.map(tag => (
              <Link key={tag} to="/register"
                className="text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/50 px-3 py-1 rounded-full transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value}</span>
              <span className="text-gray-500 text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Explore the marketplace
        </h2>
        <p className="text-gray-500 mb-8">Browse by print type or material</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to="/register"
              className={`${cat.bg} rounded-xl p-5 transition-all group hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}>
              <div className="text-3xl mb-3">{cat.icon}</div>
              <p className={`text-sm font-bold ${cat.text}`}>{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-12">
            <p className="text-[#1DBF73] text-sm font-bold uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              From idea to doorstep<br />in three steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {HOW.map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: '#1DBF73' }}>
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
          What people are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map(r => (
            <div key={r.name} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-5">"{r.text}"</p>
              <div>
                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Printer CTA ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }}>
            <div>
              <p className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: '#1DBF73' }}>For partners</p>
              <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Turn your idle printer<br />into steady income
              </h2>
              <p className="text-white/50 leading-relaxed max-w-md">
                Set your own rates, pick the jobs you want, and get paid through secure escrow. No chasing invoices, no cold sales.
              </p>
            </div>
            <Link to="/register"
              className="shrink-0 font-bold px-8 py-4 rounded-xl text-white text-sm transition-colors bg-[#1DBF73] hover:bg-[#19a463] whitespace-nowrap">
              Become a Partner →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Print<span className="text-[#1DBF73]">Match</span>
          </span>
          <p className="text-gray-400 text-sm">© 2026 PrintMatch. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
