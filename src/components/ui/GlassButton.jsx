function GlassButton({ children, onClick, className = '', theme = 'light', style, accentRgb = '255, 255, 255', accentStrength = 0 }) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onClick}
      style={style}
      className={`relative overflow-hidden rounded-full cursor-pointer border-0 bg-transparent
        shadow-[0_6px_6px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1)]
        transition-all duration-300 hover:scale-110
        ${className}`}
    >
      <div className="absolute inset-0 z-0" style={{ backdropFilter: 'blur(0px)', filter: 'url(#lg-dist)' }} />

      <div
        className="absolute inset-0 z-10"
        style={{
          background: isDark
            ? `linear-gradient(180deg, rgba(${accentRgb},${0.22 * accentStrength}) 0%, rgba(${accentRgb},${0.1 * accentStrength}) 30%, rgba(15,15,20,0.52) 100%)`
            : 'rgba(255,255,255,0.25)'
        }}
      />

      <div
        className="absolute inset-0 z-20 rounded-full"
        style={{
          boxShadow: isDark
            ? `0 0 0 1px rgba(${accentRgb},${0.22 * accentStrength}), 0 0 18px rgba(${accentRgb},${0.18 * accentStrength}), inset 1px 1px 0 rgba(255,255,255,0.16), inset 0 0 5px rgba(255,255,255,0.08), inset 0 12px 18px rgba(${accentRgb},${0.14 * accentStrength})`
            : 'inset 1px 1px 0 rgba(255,255,255,0.75), inset 0 0 5px rgba(255,255,255,0.75)',
          border: isDark ? `2px solid rgba(${accentRgb},${0.16 + (0.34 * accentStrength)})` : 'none',
        }}
      />

      <div className={`relative z-30 flex h-full w-full items-center justify-center ${isDark ? 'text-white/88' : 'text-white/70'}`}>
        {children}
      </div>
    </button>
  )
}

export default GlassButton
