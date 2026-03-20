import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import ModoSelector from './components/ModoSelector'

function App() {
  const [modo, setModo] = useState('focus')
  const [tiempos, setTiempos] = useState({
    focus: 45 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  })
  const [corriendo, setCorriendo] = useState(false)

  const segundos = tiempos[modo]

  useEffect(() => {
    if (!corriendo) return
    const intervalo = setInterval(() => {
      setTiempos(t => ({ ...t, [modo]: t[modo] - 1 }))
    }, 1000)
    return () => clearInterval(intervalo)
  }, [corriendo, modo])

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setCorriendo(false)
  }

  const ajustarTiempo = (direccion) => {
    setTiempos(t => {
      const actual = t[modo]
      const nuevoSegundos = actual + direccion * 5 * 60
      const minutos = Math.round(nuevoSegundos / 60)
      const clamp = Math.min(Math.max(minutos, 1), 999)
      return { ...t, [modo]: clamp * 60 }
    })
    setCorriendo(false)
  }

  const cambiarTiempo = (minutos) => {
    setTiempos(t => ({ ...t, [modo]: minutos * 60 }))
    setCorriendo(false)
  }

  return (
    <div className="relative flex h-screen w-screen text-white"
      style={{
        backgroundImage: 'url(https://img.goodfon.com/wallpaper/nbig/7/d5/anime-les-dozhd-kapli-voda.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >

      {/* Panel izquierdo */}
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-80 min-h-200  bg-black/60 backdrop-blur-sm rounded-4xl p-4 border border-white/10 transition-all duration-500
  ${corriendo ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        <h2 className="text-sm font-bold tracking-widest">TAREAS</h2>
      </div>

      {/* Panel central */}
      <div className={`flex-1 flex flex-col items-center justify-center gap-8 transition-all duration-500
        ${corriendo ? 'scale-110' : 'scale-100'}`}>

        <ModoSelector modo={modo} onCambiarModo={cambiarModo} />

        <Timer
          segundos={segundos}
          corriendo={corriendo}
          onToggle={() => setCorriendo(!corriendo)}
          onAjustar={ajustarTiempo}
          onCambiarTiempo={cambiarTiempo}
        />

      </div>

      {/* Panel derecho */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-80 min-h-200 bg-black/60 backdrop-blur-sm rounded-4xl p-4 border border-white/10 transition-all duration-500
  ${corriendo ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        <h2 className="text-sm font-bold tracking-widest">VIBES</h2>
      </div>

    </div>
  )
}

export default App