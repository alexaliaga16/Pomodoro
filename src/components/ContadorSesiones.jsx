import GlassButton from "./ui/GlassButton";
import { useState } from "react";

function ContadorSesiones({ sesion, totalSesiones, onCambiarSesion }) {


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
        <div className={'flex justify-center'}>
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
                    className="text-xl font-[Source_Code_Pro] font-bold bg-transparent text-center w-20 outline-none border-b-2 border-white/50"

                />
            ) : (
                <GlassButton
                    onClick={abrirEditor}
                    className={'font-[Source_Code_Pro] px-8 py-2 text-sm font-bold'}>
                    SESSION #{sesion} / {totalSesiones}
                </GlassButton>
            )}
        </div>
    )
}

export default ContadorSesiones;