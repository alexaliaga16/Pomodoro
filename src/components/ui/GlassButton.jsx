function GlassButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-full cursor-pointer border-0 bg-transparent
        shadow-[0_6px_6px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1)]
        transition-all duration-300 hover:scale-110
        ${className}`}
    >
      {/* Capa 1 - distorsión */}
      <div className="absolute inset-0 z-0" style={{ backdropFilter: 'blur(0px)', filter: 'url(#lg-dist)' }} />

      {/* Capa 2 - overlay */}
      <div className="absolute inset-0 z-10" style={{ background: 'rgba(255,255,255,0.25)' }} />

      {/* Capa 3 - brillo */}
      <div className="absolute inset-0 z-20 rounded-full"
        style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.75), inset 0 0 5px rgba(255,255,255,0.75)' }} />

      {/* Capa 4 - contenido */}
      <div className="relative z-30 flex items-center justify-center w-full h-full text-white/70">
        {children}
      </div>
    </button>
  )
}

export default GlassButton