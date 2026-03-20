import GlassButton from "./ui/GlassButton"

const MODOS_LABELS = {
  focus:      'FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak:  'LONG BREAK',
}

function ModoSelector({ modo, onCambiarModo }) {
  return (
    <div className="flex gap-3">
      {Object.entries(MODOS_LABELS).map(([key, label]) => (
        <GlassButton
          key={key}
          onClick={() => onCambiarModo(key)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105
            ${modo === key ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
        >
          {label}
        </GlassButton>
      ))}
    </div>
  )
}

export default ModoSelector