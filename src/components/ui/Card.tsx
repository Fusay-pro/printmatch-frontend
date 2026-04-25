import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({ children, padding = 'md', className = '', hover = false, ...props }: CardProps) {
  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={[
        'bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg',
        paddings[padding],
        hover
          ? 'hover:border-accent/40 transition-colors duration-150 cursor-pointer'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
