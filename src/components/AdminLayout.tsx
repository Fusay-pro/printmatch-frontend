import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white flex flex-col border-r border-gray-200">

        {/* Logo + badge */}
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-gray-100 shrink-0">
          <span className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Print<span className="text-[#1DBF73]">Match</span>
          </span>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full tracking-wide uppercase">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <AdminLink to="/admin" icon="⊞" label="Overview" end />
          <AdminLink to="/admin/jobs" icon="📋" label="All Commissions" />
          <AdminLink to="/admin/partners" icon="👥" label="Partner Applications" />
          <AdminLink to="/admin/appeals" icon="⚑" label="Appeals" />
          <AdminLink to="/admin/reports" icon="🚩" label="Reports" />
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-gray-100 shrink-0 relative">
          <div
            className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
            onClick={() => setShowUserMenu(v => !v)}
            style={{ background: showUserMenu ? '#f9fafb' : undefined }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-amber-500">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-amber-500 font-semibold">Admin</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-gray-400">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl overflow-hidden z-20 shadow-xl border border-gray-100 bg-white">
                <button onClick={() => { setShowUserMenu(false); navigate('/admin/settings') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors">
                  ⚙️ Settings
                </button>
                <div className="border-t border-gray-100" />
                <button onClick={() => { setShowUserMenu(false); logout(); navigate('/login') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 transition-colors">
                  ↩ Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function AdminLink({ to, icon, label, end }: { to: string; icon: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-amber-50 text-amber-600'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`
      }
    >
      <span className="text-base leading-none w-4 text-center">{icon}</span>
      {label}
    </NavLink>
  )
}
