function GlassButton({ children, onClick, className = '', theme = 'light', style, accentRgb = '255, 255, 255', accentStrength = 0 }) {
  const isDark = theme === 'dark'
  const [accentR = 255, accentG = 255, accentB = 255] = accentRgb.split(",").map((value) => Number(value.trim()))
  const accentAlpha = `var(--accent-strength, ${accentStrength})`

  return (
    <button
      onClick={onClick}
      style={{
        ...style,
        "--glass-accent-r": `var(--accent-r, ${accentR})`,
        "--glass-accent-g": `var(--accent-g, ${accentG})`,
        "--glass-accent-b": `var(--accent-b, ${accentB})`,
        "--glass-accent-strength": accentAlpha,
      }}
      className={`relative overflow-hidden rounded-full cursor-pointer border-0 bg-transparent
        shadow-[0_6px_6px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1)]
        transition-all duration-300 hover:scale-110
        ${className}`}
    >
      <div className="absolute inset-0 z-0" style={{ backdropFilter: 'blur(0px)', filter: 'url(#lg-dist)' }} />

      <div
        className="absolute inset-0 z-10 transition-all duration-500"
        style={{
          background: isDark
            ? `linear-gradient(180deg, rgba(var(--glass-accent-r), var(--glass-accent-g), var(--glass-accent-b), calc(0.22 * var(--glass-accent-strength))) 0%, rgba(var(--glass-accent-r), var(--glass-accent-g), var(--glass-accent-b), calc(0.1 * var(--glass-accent-strength))) 30%, rgba(15,15,20,0.52) 100%)`
            : 'rgba(255,255,255,0.25)'
        }}
      />

      <div
        className="absolute inset-0 z-20 rounded-full transition-all duration-500"
        style={{
          boxShadow: isDark
            ? `0 0 0 1px rgba(var(--glass-accent-r), var(--glass-accent-g), var(--glass-accent-b), calc(0.22 * var(--glass-accent-strength))), 0 0 18px rgba(var(--glass-accent-r), var(--glass-accent-g), var(--glass-accent-b), calc(0.18 * var(--glass-accent-strength))), inset 1px 1px 0 rgba(255,255,255,0.16), inset 0 0 5px rgba(255,255,255,0.08), inset 0 12px 18px rgba(var(--glass-accent-r), var(--glass-accent-g), var(--glass-accent-b), calc(0.14 * var(--glass-accent-strength)))`
            : 'inset 1px 1px 0 rgba(255,255,255,0.75), inset 0 0 5px rgba(255,255,255,0.75)',
          border: isDark ? `2px solid rgba(var(--glass-accent-r), var(--glass-accent-g), var(--glass-accent-b), calc(0.16 + (0.34 * var(--glass-accent-strength))))` : 'none',
        }}
      />

      <div className={`relative z-30 flex h-full w-full items-center justify-center ${isDark ? 'text-white/88' : 'text-white/70'}`}>
        {children}
      </div>
    </button>
  )
}

export default GlassButton
