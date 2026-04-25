export default function FilamentStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-[3px] rounded-full overflow-hidden ${className}`}>
      <div className="flex-1 bg-[#e8e8e8]" />{/* White PLA */}
      <div className="flex-1 bg-[#c25e00]" />{/* Burnt amber */}
      <div className="flex-1 bg-[#c32b2b]" />{/* Red */}
      <div className="flex-1 bg-[#0066ff]" />{/* Blue */}
      <div className="flex-1 bg-[#0d8a52]" />{/* Green */}
      <div className="flex-1 bg-[#d4a017]" />{/* Gold */}
      <div className="flex-1 bg-[#1a1a2e]" />{/* Black */}
      <div className="flex-1 bg-[#e8e8e8]" />{/* White */}
    </div>
  )
}
