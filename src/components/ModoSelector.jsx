import GlassButton from "./ui/GlassButton"

const MODOS_LABELS = {
  focus:      'Focus',
  shortBreak: 'Short break',
  longBreak:  'Long break',
}

function ModoSelector({ modo, onCambiarModo, accentRgb, accentStrength }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {Object.entries(MODOS_LABELS).map(([key, label]) => (
        <GlassButton
          key={key}
          onClick={() => onCambiarModo(key)}
          theme="dark"
          accentRgb={accentRgb}
          accentStrength={accentStrength}
          className={`min-w-[122px] px-4 py-2 rounded-full text-center text-[20px] sm:text-[20px] leading-none tracking-[0.08em] transition-all hover:scale-105 sm:min-w-[128px] sm:px-5
            ${modo === key ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          style={{ fontFamily: "'VT323', monospace" }}
        >
          {label}
        </GlassButton>
      ))}
    </div>
  )
}

export default ModoSelector
