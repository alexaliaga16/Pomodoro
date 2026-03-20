const MODOS_LABELS = {
  focus:      'FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak:  'LONG BREAK',
}

function ModoSelector({ modo, onCambiarModo }) {
  return (
    <div className="flex gap-3">
      {Object.entries(MODOS_LABELS).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onCambiarModo(key)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105
            ${modo === key
              ? 'bg-white/10 text-white border-2 border-white/30'
              : 'bg-white/5 text-white/50 border border-white/5 hover:text-white hover:bg-white/10'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default ModoSelector