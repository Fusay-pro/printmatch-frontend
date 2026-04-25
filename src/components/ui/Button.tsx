import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:translate-y-[1px]'

  const variants: Record<string, string> = {
    primary:
      'bg-accent text-white hover:bg-accent-hover focus:ring-accent/30',
    secondary:
      'bg-[var(--color-sidebar-bg)] text-base border border-hairline hover:border-accent hover:text-accent focus:ring-accent/20',
    ghost:
      'bg-transparent text-muted hover:bg-surface hover:text-base focus:ring-hairline',
    danger:
      'bg-danger text-white hover:opacity-90 focus:ring-danger/30',
  }

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }

  return (
    <button
      className={[
        base,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-50 cursor-not-allowed active:translate-y-0' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
