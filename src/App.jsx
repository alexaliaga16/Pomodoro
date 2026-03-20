import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import ModoSelector from './components/ModoSelector'

import {
  DndContext,
  closestCenter
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

const colorEstado = (estado) => {
  switch (estado) {
    case 'activo':
      return 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)]'
    case 'terminado':
      return 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]'
    default:
      return 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]'
  }
}

function TareaItem({ tarea, cambiarEstado }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: tarea.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'transform 200ms ease'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 
        bg-white/10 backdrop-blur-md border border-white/20 
        rounded-2xl px-4 py-4 text-base
        transition-all duration-300
        hover:bg-white/20 active:scale-[0.98]
        animate-[pushDown_.25s_ease]
        will-change-transform"
    >

      <div
        onClick={(e) => {
          e.stopPropagation()
          cambiarEstado(tarea.id)
        }}
        className={`w-4 h-4 rounded-full cursor-pointer 
          ${colorEstado(tarea.estado)}
          transition-all duration-300 
          hover:scale-125 active:scale-95`}
      />

      <span className={`flex-1 transition-all duration-300
        ${tarea.estado === 'terminado'
          ? 'line-through text-white/40'
          : 'text-white/90'}`}>
        {tarea.texto}
      </span>

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-white/40 hover:text-white"
      >
        ☰
      </div>

    </div>
  )
}

function App() {
  const [modo, setModo] = useState('focus')
  const [tiempos, setTiempos] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  })
  const [corriendo, setCorriendo] = useState(false)

  const [tareas, setTareas] = useState([])
  const [nuevaTarea, setNuevaTarea] = useState('')

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

  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return

    const nueva = {
      id: Date.now(),
      texto: nuevaTarea,
      estado: 'pendiente'
    }

    setTareas(prev => [nueva, ...prev])
    setNuevaTarea('')
  }

  const cambiarEstado = (id) => {
    setTareas(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              estado:
                t.estado === 'pendiente'
                  ? 'activo'
                  : t.estado === 'activo'
                  ? 'terminado'
                  : 'pendiente'
            }
          : t
      )
    )
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTareas((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return (
    <div
      className="relative flex h-screen w-screen text-white"
      style={{
        backgroundImage: 'url(src/assets/Image_20260320_141153.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >

      {/* PANEL IZQUIERDO */}
      <div className={`absolute z-[50] left-[60px] left-[60px] top-1/2 -translate-y-1/2 w-80 min-h-200
        bg-black/60 backdrop-blur-sm rounded-3xl p-4 border border-white/10
        transition-all duration-500 flex flex-col
        ${corriendo ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'}`}>

        <h2 className="text-sm font-bold tracking-widest pl-2 mb-4">
          TAREAS
        </h2>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={tareas.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {tareas.map(t => (
                <TareaItem
                  key={t.id}
                  tarea={t}
                  cambiarEstado={cambiarEstado}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={nuevaTarea}
            onChange={e => setNuevaTarea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && agregarTarea()}
            placeholder="Nueva tarea..."
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm outline-none placeholder:text-white/50"
          />

          <button
            onClick={agregarTarea}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            +
          </button>
        </div>

      </div>

      <div className={`flex-1 flex flex-col items-center justify-center gap-8 z-[1]
        transition-all duration-500
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

      <div className={`absolute z-[50] right-[60px] right-[60px] top-1/2 -translate-y-1/2 w-80 min-h-200
        bg-black/60 backdrop-blur-sm rounded-3xl p-4 border border-white/10
        transition-all duration-500
        ${corriendo ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>

        <h2 className="text-sm font-bold tracking-widest pl-2">
          VIBES
        </h2>

      </div>

    </div>
  )
}

export default App