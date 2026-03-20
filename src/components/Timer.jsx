import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

function Timer({ segundos, corriendo, onToggle, onAjustar, onCambiarTiempo }) {
    const [editando, setEditando] = useState(false)
    const [valorInput, setValorInput] = useState('')

    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    const display = `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`

    const abrirEditor = () => {
        setEditando(true)
        setValorInput(String(Math.floor(segundos / 60)))
    }

    const confirmarEdicion = () => {
        const mins = parseInt(valorInput)
        if (!isNaN(mins)) {
            const clamp = Math.min(Math.max(mins, 1), 999)
            onCambiarTiempo(clamp)
        }
        setEditando(false)
    }

    return (
        <div className="flex flex-col items-center gap-8">

            <div className="flex items-center gap-8">
                <button
                    onClick={() => onAjustar(-1)}
                    className={`w-12 h-12 rounded-full 
                        bg-white/10 backdrop-blur-md 
                        border border-white/20 
                        text-white 
                        flex items-center justify-center
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)]
                        transition-all duration-300
                        hover:scale-110 hover:bg-white/20
                        active:scale-95
                        ${corriendo ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                    <FontAwesomeIcon icon={faMinus} />
                </button>

                {editando ? (
                    <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        value={valorInput}
                        onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '')
                            if (val === '' || parseInt(val) <= 999) setValorInput(val)
                        }}
                        onBlur={confirmarEdicion}
                        onKeyDown={e => e.key === 'Enter' && confirmarEdicion()}
                        className="text-8xl font-bold bg-transparent text-center w-64 outline-none border-b-2 border-white/50"
                    />
                ) : (
                    <h1
                        onClick={!corriendo ? abrirEditor : undefined}
                        className={`text-9xl font-bold transition-all duration-300
    ${!corriendo
                                ? 'cursor-pointer hover:opacity-100 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                                : 'cursor-default'
                            }`}
                    >
                        {display}
                    </h1>
                )}

                <button
                    onClick={() => onAjustar(1)}
                    className={`w-12 h-12 rounded-full 
                        bg-white/10 backdrop-blur-md 
                        border border-white/20 
                        text-white 
                        flex items-center justify-center
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)]
                        transition-all duration-300
                        hover:scale-110 hover:bg-white/20
                        active:scale-95
                        ${corriendo ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>

            <button
                onClick={onToggle}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
                {corriendo ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="3" y="2" width="5" height="16" rx="1" />
                        <rect x="12" y="2" width="5" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <polygon points="4,2 18,10 4,18" />
                    </svg>
                )}
            </button>

        </div>
    )
}

export default Timer