import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BecomePartnerModal from './BecomePartnerModal'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isPrinter, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'commissioner' | 'partner'>('commissioner')
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (isPrinter) setActiveTab('partner')
  }, [isPrinter])

  const switchTab = (tab: 'commissioner' | 'partner') => {
    if (tab === 'commissioner') {
      setActiveTab('commissioner')
      navigate('/dashboard')
    } else {
      if (isPrinter) {
        setActiveTab('partner')
        navigate('/browse')
      } else {
        setActiveTab('partner')
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Nunito Sans', sans-serif", background: '#f5f7fa' }}>

      {showPartnerModal && (
        <BecomePartnerModal
          onClose={() => { setShowPartnerModal(false); setActiveTab('commissioner') }}
          onSuccess={() => { setShowPartnerModal(false); setActiveTab('partner'); navigate('/browse') }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="w-[220px] shrink-0 flex flex-col" style={{
        background: 'linear-gradient(180deg, #0f1a14 0%, #162210 100%)',
      }}>

        {/* Logo */}
        <div className="px-5 h-[60px] flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1DBF73' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="6" width="10" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
              <path d="M4 6V4a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#fff' }}>
            Print<span style={{ color: '#1DBF73' }}>Match</span>
          </span>
        </div>

        {/* Tab switcher */}
        <div className="px-3 pb-3 shrink-0">
          <div className="grid grid-cols-2 gap-0.5 rounded-xl p-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
            {(['commissioner', 'partner'] as const).map(tab => (
              <button key={tab} onClick={() => switchTab(tab)}
                className="py-1.5 text-xs font-bold rounded-[10px] transition-all capitalize"
                style={activeTab === tab
                  ? { background: '#1DBF73', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }
                }>
                {tab === 'commissioner' ? 'Commission' : 'Partner'}
              </button>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2.5 overflow-y-auto space-y-0.5">
          {activeTab === 'commissioner' ? (
            <>
              <SidebarLink to="/browse-partners" icon="search" label="Find a Partner" />
              <SidebarLink to="/conversations" icon="chat" label="Messages" />
              <div className="my-2 mx-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
              <SidebarLink to="/dashboard" icon="grid" label="My Commissions" end />
              <SidebarLink to="/dashboard?tab=completed" icon="check" label="Completed" />
            </>
          ) : isPrinter ? (
            <>
              <SidebarLink to="/requests" icon="inbox" label="Requests" />
              <SidebarLink to="/requests?tab=active" icon="print" label="Active Orders" />
              <SidebarLink to="/conversations" icon="chat" label="Messages" />
            </>
          ) : (
            <div className="px-2 pt-2">
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                You're not a partner yet.
              </p>
              <button onClick={() => setShowPartnerModal(true)}
                className="text-sm font-semibold transition-colors"
                style={{ color: '#1DBF73' }}>
                Become a Partner →
              </button>
            </div>
          )}
        </nav>

        {/* Appeal */}
        <div className="px-2.5 pb-1 shrink-0">
          <SidebarLink to="/appeal" icon="flag" label="Submit Appeal" />
        </div>

        {/* User footer */}
        <div className="px-2.5 py-3 shrink-0 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer transition-colors"
            style={{ background: showUserMenu ? 'rgba(255,255,255,0.08)' : undefined }}
            onClick={() => setShowUserMenu(v => !v)}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #1DBF73, #16a35f)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: '#fff' }}>{user?.name}</p>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-2.5 right-2.5 mb-1 rounded-xl overflow-hidden z-20 shadow-2xl"
                style={{ background: '#1a2a1e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => { setShowUserMenu(false); navigate('/profile') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  👤 Profile
                </button>
                <button onClick={() => { setShowUserMenu(false); navigate('/settings') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  ⚙️ Settings
                </button>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                <button onClick={() => { setShowUserMenu(false); logout(); navigate('/login') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{ color: '#f87171' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  ↩ Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <PageHeader />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

const PAGE_META: Record<string, { label: string; sub: string }> = {
  '/browse-partners':       { label: 'Find a Partner',   sub: 'Browse approved 3D printing partners' },
  '/conversations':         { label: 'Messages',         sub: 'Your active conversations' },
  '/dashboard':             { label: 'My Commissions',   sub: 'Track your print requests' },
  '/requests':              { label: 'Requests',         sub: 'Incoming print requests' },
  '/appeal':                { label: 'Submit Appeal',    sub: 'Dispute a decision' },
  '/profile':               { label: 'Profile',          sub: 'Your account settings' },
  '/settings':              { label: 'Settings',         sub: 'Security and preferences' },
  '/post-job':              { label: 'Post a Job',       sub: 'Create a new print request' },
  '/become-printer':        { label: 'Become a Partner', sub: 'Join as a printing partner' },
}

function PageHeader() {
  const location = useLocation()
  // Match exact path first, then prefix (for /conversations/:id etc.)
  const meta =
    PAGE_META[location.pathname] ??
    Object.entries(PAGE_META).find(([k]) => location.pathname.startsWith(k) && k !== '/')?.[1]

  if (!meta) return null

  return (
    <div className="shrink-0 px-8 pt-7 pb-5" style={{
      background: 'linear-gradient(135deg, #0f1a14 0%, #1a2e1e 100%)',
    }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#1DBF73' }}>
        PrintMatch
      </p>
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {meta.label}
      </h1>
      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{meta.sub}</p>
    </div>
  )
}

const ICONS: Record<string, React.ReactElement> = {
  search: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chat: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 3.5A1.5 1.5 0 013.5 2h8A1.5 1.5 0 0113 3.5v6A1.5 1.5 0 0111.5 11H9l-2 2.5L5 11H3.5A1.5 1.5 0 012 9.5v-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  grid: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="8.5" y="2" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="8.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  check: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7.5l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  inbox: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 9.5h2.5l1.5 2h3l1.5-2H13M2 9.5V4a1 1 0 011-1h9a1 1 0 011 1v5.5M2 9.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  print: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="4" y="2" width="7" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M4 10H2.5A.5.5 0 012 9.5v-4A.5.5 0 012.5 5h10a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H11" stroke="currentColor" strokeWidth="1.5"/><rect x="4" y="9" width="7" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  flag: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2v11M3 2h8l-2 3.5L11 9H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function SidebarLink({ to, icon, label, end }: { to: string; icon: string; label: string; end?: boolean }) {
  const [pathname, search] = to.split('?')
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => {
        const fullMatch = search
          ? window.location.search === `?${search}` && window.location.pathname === pathname
          : isActive
        return `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          fullMatch ? 'active-nav' : 'inactive-nav'
        }`
      }}
      style={({ isActive }) => {
        const fullMatch = search
          ? window.location.search === `?${search}` && window.location.pathname === pathname
          : isActive
        return fullMatch
          ? { background: 'rgba(29,191,115,0.15)', color: '#1DBF73' }
          : { color: 'rgba(255,255,255,0.45)' }
      }}
    >
      <span className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
        {ICONS[icon]}
      </span>
      {label}
    </NavLink>
  )
}
