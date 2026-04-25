import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface font-sans px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-accent">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="6" width="10" height="6" rx="1" fill="white" fillOpacity="0.9"/>
            <path d="M4 6V4a3 3 0 016 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-base tracking-tight font-display">
          Print<span className="text-accent">Match</span>
        </span>
      </Link>

      <div className="w-full max-w-sm bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg p-6 md:p-8">
        {children}
      </div>

      <p className="mt-6 text-[11px] text-muted">© 2026 PrintMatch</p>
    </div>
  )
}
