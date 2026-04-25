// Skeleton.tsx

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'circle'
  width?: string
  height?: string
  lines?: number
  className?: string
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}: SkeletonProps) {
  const base = 'animate-pulse bg-surface rounded-md'

  if (variant === 'card') {
    return (
      <div
        className={`${base} rounded-lg ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}
      />
    )
  }

  if (variant === 'avatar') {
    return (
      <div
        className={`${base} rounded-full ${className}`}
        style={{ width: width || '40px', height: height || '40px' }}
      />
    )
  }

  if (variant === 'circle') {
    return (
      <div
        className={`${base} rounded-full ${className}`}
        style={{ width: width || '48px', height: height || '48px' }}
      />
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={base}
          style={{
            width: width || '100%',
            height: height || '16px',
            opacity: 0.5 + i * 0.1,
          }}
        />
      ))}
    </div>
  )
}
