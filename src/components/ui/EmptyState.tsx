import React from 'react'
import { AlertCircle } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-[var(--color-sidebar-bg)] border border-hairline rounded-lg p-14 text-center animate-fade-in">
      {icon ? (
        <div className="mb-4 flex justify-center">{icon}</div>
      ) : (
        <div className="w-10 h-10 rounded-md mx-auto mb-4 flex items-center justify-center bg-surface border border-hairline">
          <AlertCircle className="w-5 h-5 text-muted" />
        </div>
      )}
      <p className="font-semibold text-base mb-1">{title}</p>
      {description && <p className="text-muted text-sm mb-5">{description}</p>}
      {actionLabel && (
        onAction ? (
          <Button onClick={onAction} size="sm">{actionLabel}</Button>
        ) : (
          <a href={actionHref}>
            <Button size="sm">{actionLabel}</Button>
          </a>
        )
      )}
    </div>
  )
}
