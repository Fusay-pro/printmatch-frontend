export default function LogoMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Three stacked offset layers — evokes 3D extrusion / layer lines */}
      <rect x="4" y="20" width="24" height="5" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="7" y="12" width="18" height="5" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="10" y="4" width="12" height="5" rx="1" fill="currentColor" />
      {/* Subtle vertical alignment guides */}
      <line x1="10" y1="9" x2="10" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="22" y1="9" x2="22" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="7" y1="17" x2="7" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="25" y1="17" x2="25" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  )
}
