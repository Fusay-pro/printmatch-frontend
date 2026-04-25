import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?:
    | 'brand'
    | 'blue'
    | 'amber'
    | 'orange'
    | 'purple'
    | 'emerald'
    | 'red'
    | 'gray'
  className?: string
}

export default function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const styles: Record<string, string> = {
    brand:
      'bg-accent/5 text-accent border-accent/20',
    blue:
      'bg-accent-2/5 text-accent-2 border-accent-2/20',
    amber:
      'bg-amber-50 text-amber-700 border-amber-100',
    orange:
      'bg-orange-50 text-orange-700 border-orange-100',
    purple:
      'bg-purple-50 text-purple-700 border-purple-100',
    emerald:
      'bg-emerald-50 text-emerald-700 border-emerald-100',
    red:
      'bg-red-50 text-danger border-red-100',
    gray:
      'bg-surface text-muted border-hairline',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold border uppercase tracking-wider',
        styles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
