import { useState } from 'react'
import GlassButton from './ui/GlassButton'
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
        <div className="bot flex w-full flex-col items-center gap-6 sm:gap-8">

            <div className="flex w-full items-center justify-center gap-3 sm:gap-8">

                <GlassButton
                    onClick={() => onAjustar(-1)}
                    className={`h-10 w-10 rounded-full sm:h-12 sm:w-12
                        ${corriendo ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}
                >
                    <FontAwesomeIcon icon={faMinus} />
                </GlassButton>

                {editando ? (
                    <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        placeholder='1-999'
                        value={valorInput}
                        onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '')
                            if (val === '' || parseInt(val) <= 999) setValorInput(val)
                        }}
                        onBlur={confirmarEdicion}
                        onKeyDown={e => e.key === 'Enter' && confirmarEdicion()}
                        className="w-[min(70vw,16rem)] border-b-2 border-white/50 bg-transparent text-center text-[clamp(3rem,15vw,8rem)] font-bold outline-none"
                    />
                ) : (
                    <h1
                        onClick={!corriendo ? abrirEditor : undefined}
                        className={`max-w-full text-center font-[Source_Code_Pro] font-bold transition-all duration-300 text-[clamp(3.6rem,15vw,9rem)]
                            ${!corriendo
                                ? 'cursor-pointer hover:opacity-100 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                                : 'cursor-default'
                            }`}
                    >
                        {display}
                    </h1>
                )}

                <GlassButton
                    onClick={() => onAjustar(1)}
                    className={`h-10 w-10 rounded-full sm:h-12 sm:w-12
                        ${corriendo ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </GlassButton>

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
