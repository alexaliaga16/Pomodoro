import GlassButton from "./ui/GlassButton";
import { useState } from "react";

function ContadorSesiones({ sesion, totalSesiones, onCambiarSesion, accentRgb, accentStrength }) {


    const [editando, setEditando] = useState(false)
    const [valorInput, setValorInput] = useState('')

    const abrirEditor = () => {
        setEditando(true)
        setValorInput(totalSesiones)
    }

    const confirmarEdicion = () => {
        const valor = valorInput === '' ? 4 : parseInt(valorInput)
        onCambiarSesion(valor)
        setEditando(false)
    }

    return (
        <div className={'flex w-full justify-center px-3'}>
            {editando ? (
                <input
                    autoFocus
                    type="text"
                    placeholder="1-15"
                    value={valorInput}
                    onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        setValorInput(val)
                    }}
                    onBlur={confirmarEdicion}
                    onKeyDown={e => e.key === 'Enter' && confirmarEdicion()}
                    className="w-20 border-b-2 border-white/50 bg-transparent text-center text-lg font-[Source_Code_Pro] font-bold outline-none sm:text-xl"

                />
            ) : (
                <GlassButton
                    onClick={abrirEditor}
                    theme="dark"
                    accentRgb={accentRgb}
                    accentStrength={accentStrength}
                    style={{ fontFamily: "'VT323', monospace" }}
                    className={'timer-top-button w-full max-w-fit px-4 py-2 text-center text-[22px] leading-none tracking-[0.08em] sm:px-6 sm:text-[22px]'}>
                    Session #{sesion} / {totalSesiones}
                </GlassButton>
            )}
        </div>
    )
}

export default ContadorSesiones;
