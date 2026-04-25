import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  MessageSquare,
  LayoutGrid,
  CheckCircle2,
  Inbox,
  Printer,
  Flag,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BecomePartnerModal from './BecomePartnerModal'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isPrinter, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<'commissioner' | 'partner'>('commissioner')
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        navigate('/requests')
      } else {
        setShowPartnerModal(true)
        setActiveTab('partner')
      }
    }
    setSidebarOpen(false)
  }

  const isPartnerRoute = ['/requests', '/printer'].some(p => location.pathname.startsWith(p))
  const currentTab = isPartnerRoute ? 'partner' : activeTab

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-surface">
      {showPartnerModal && (
        <BecomePartnerModal
          onClose={() => { setShowPartnerModal(false); setActiveTab('commissioner') }}
          onSuccess={() => { setShowPartnerModal(false); setActiveTab('partner'); navigate('/requests') }}
        />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[220px] shrink-0 flex flex-col
        bg-sidebar-bg border-r border-hairline
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-4 h-14 flex items-center gap-2.5 shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0 bg-accent">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="6" rx="1" fill="white" fillOpacity="0.9"/>
                <path d="M4 6V4a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-base font-display">
              Print<span className="text-accent">Match</span>
            </span>
          </div>
          <button
            className="md:hidden text-muted hover:text-base"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 overflow-y-auto space-y-0.5">
          {currentTab === 'commissioner' ? (
            <>
              <SidebarLink to="/browse-partners" icon={<Search className="w-4 h-4" />} label="Find a Partner" onClick={() => setSidebarOpen(false)} />
              <SidebarLink to="/conversations" icon={<MessageSquare className="w-4 h-4" />} label="Messages" onClick={() => setSidebarOpen(false)} />
              <div className="my-2 mx-2 border-t border-hairline" />
              <SidebarLink to="/dashboard" icon={<LayoutGrid className="w-4 h-4" />} label="My Commissions" end onClick={() => setSidebarOpen(false)} />
              <SidebarLink to="/dashboard?tab=completed" icon={<CheckCircle2 className="w-4 h-4" />} label="Completed" onClick={() => setSidebarOpen(false)} />
            </>
          ) : isPrinter ? (
            <>
              <SidebarLink to="/requests" icon={<Inbox className="w-4 h-4" />} label="Requests" onClick={() => setSidebarOpen(false)} />
              <SidebarLink to="/requests?tab=active" icon={<Printer className="w-4 h-4" />} label="Active Orders" onClick={() => setSidebarOpen(false)} />
              <SidebarLink to="/conversations" icon={<MessageSquare className="w-4 h-4" />} label="Messages" onClick={() => setSidebarOpen(false)} />
            </>
          ) : (
            <div className="px-2 pt-2">
              <p className="text-xs leading-relaxed mb-3 text-muted">
                You're not a partner yet.
              </p>
              <button onClick={() => setShowPartnerModal(true)}
                className="text-sm font-medium transition-colors text-accent hover:text-accent-hover">
                Become a Partner →
              </button>
            </div>
          )}
        </nav>

        {/* Appeal */}
        <div className="px-2 pb-1 shrink-0">
          <SidebarLink to="/appeal" icon={<Flag className="w-4 h-4" />} label="Submit Appeal" onClick={() => setSidebarOpen(false)} />
        </div>

        {/* User footer */}
        <div className="px-2 py-2 shrink-0 relative border-t border-hairline">
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
              showUserMenu ? 'bg-surface' : ''
            }`}
            onClick={() => setShowUserMenu(v => !v)}
          >
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-semibold shrink-0 text-white bg-accent">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-base">{user?.name}</p>
              <p className="text-[10px] truncate text-muted">{user?.email}</p>
            </div>
            <ChevronDown className={`w-3 h-3 shrink-0 text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-2 right-2 mb-1 rounded-md overflow-hidden z-20 shadow-modal border border-hairline bg-[var(--color-sidebar-bg)]">
                <button onClick={() => { setShowUserMenu(false); navigate('/profile'); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-base hover:bg-surface transition-colors">
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button onClick={() => { setShowUserMenu(false); navigate('/settings'); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-base hover:bg-surface transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <div className="border-t border-hairline" />
                <button onClick={() => { setShowUserMenu(false); logout(); navigate('/login') }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-danger hover:bg-red-50 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <header className="shrink-0 h-14 px-6 bg-[var(--color-sidebar-bg)] border-b border-hairline flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 rounded-md hover:bg-surface text-muted"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Tab switcher */}
            <div className="flex items-center gap-0 bg-surface rounded-md p-0.5 border border-hairline">
              {(['commissioner', 'partner'] as const).map(tab => (
                <button key={tab} onClick={() => switchTab(tab)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-sm transition-all uppercase tracking-wide ${
                    currentTab === tab
                      ? 'bg-[var(--color-sidebar-bg)] text-accent shadow-sm border border-hairline'
                      : 'text-muted hover:text-base'
                  }`}>
                  {tab === 'commissioner' ? 'Commission' : 'Partner'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="p-1.5 rounded-md hover:bg-surface text-muted hover:text-base transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ to, icon, label, end, onClick }: { to: string; icon: React.ReactNode; label: string; end?: boolean; onClick?: () => void }) {
  const [pathname, search] = to.split('?')
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => {
        const fullMatch = search
          ? window.location.search === `?${search}` && window.location.pathname === pathname
          : isActive
        return `flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
          fullMatch
            ? 'bg-brand-50 text-accent'
            : 'text-muted hover:text-base hover:bg-surface'
        }`
      }}
    >
      <span className="w-4 h-4 flex items-center justify-center shrink-0">
        {icon}
      </span>
      {label}
    </NavLink>
  )
}
