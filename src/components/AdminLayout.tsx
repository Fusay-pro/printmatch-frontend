import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  FileText,
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[220px] shrink-0 bg-[var(--color-sidebar-bg)] flex flex-col border-r border-hairline
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-4 h-14 flex items-center gap-2 border-b border-hairline shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-base tracking-tight font-display">
              Print<span className="text-accent">Match</span>
            </span>
            <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm tracking-wide uppercase">
              Admin
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

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <AdminLink to="/admin" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" end onClick={() => setSidebarOpen(false)} />
          <AdminLink to="/admin/jobs" icon={<FileText className="w-4 h-4" />} label="All Commissions" onClick={() => setSidebarOpen(false)} />
          <AdminLink to="/admin/partners" icon={<Users className="w-4 h-4" />} label="Partner Applications" onClick={() => setSidebarOpen(false)} />
          <AdminLink to="/admin/appeals" icon={<AlertTriangle className="w-4 h-4" />} label="Appeals" onClick={() => setSidebarOpen(false)} />
          <AdminLink to="/admin/reports" icon={<BarChart3 className="w-4 h-4" />} label="Reports" onClick={() => setSidebarOpen(false)} />
        </nav>

        {/* User footer */}
        <div className="px-2 py-2 border-t border-hairline shrink-0 relative">
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-surface ${
              showUserMenu ? 'bg-surface' : ''
            }`}
            onClick={() => setShowUserMenu(v => !v)}
          >
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-amber-500">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-base truncate">{user?.name}</p>
              <p className="text-[10px] text-accent font-medium">Admin</p>
            </div>
            <ChevronDown className={`w-3 h-3 shrink-0 text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-2 right-2 mb-1 rounded-md overflow-hidden z-20 shadow-modal border border-hairline bg-[var(--color-sidebar-bg)]">
                <button onClick={() => { setShowUserMenu(false); navigate('/admin/settings') }}
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden shrink-0 h-14 px-4 flex items-center gap-3 bg-[var(--color-sidebar-bg)] border-b border-hairline sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-surface text-muted"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-semibold text-base font-display text-sm">Admin</span>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

function AdminLink({ to, icon, label, end, onClick }: { to: string; icon: React.ReactNode; label: string; end?: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
          isActive
            ? 'bg-amber-50 text-amber-700'
            : 'text-muted hover:bg-surface hover:text-base'
        }`
      }
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      {label}
    </NavLink>
  )
}
