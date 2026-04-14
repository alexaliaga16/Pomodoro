export default function ModalEstaciones({
  abierto,
  estacionesRestantes,
  onClose,
  onAgregarEstacion,
}) {
  if (!abierto) return null;

  return (
    <div
      className="absolute inset-0 z-[400] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[10px]"
      onClick={onClose}
    >
      <div
        className="glass-dark w-full max-w-3xl overflow-hidden rounded-[32px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Estaciones</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Agrega mas vibras</h3>
            <p className="mt-1 text-sm text-white/60">
              Sube tus imagenes a `public/vibes` y usa esos nombres para personalizar las tarjetas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/14 hover:text-white"
          >
            <i className="fas fa-xmark" />
          </button>
        </div>

        {estacionesRestantes.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/6 px-5 py-12 text-center text-white/65">
            Ya agregaste todas las estaciones disponibles.
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-auto pr-1 md:grid-cols-2">
            {estacionesRestantes.map((item) => (
              <div
                key={item.name}
                className="relative overflow-hidden rounded-3xl border border-white/10 p-4"
                style={{
                  backgroundImage: `linear-gradient(160deg, ${item.color}40 0%, rgba(9,12,20,0.82) 55%), url(${item.image || "/hero.png"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[5px]" />
                <div className="relative z-10 flex min-h-36 flex-col justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="mt-1 max-w-[22ch] text-sm text-white/65">
                      Disponible para agregar al panel de Vibras.
                    </p>
                  </div>

                  <button
                    onClick={() => onAgregarEstacion(item)}
                    className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-white/18"
                  >
                    <i className="fas fa-plus" />
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
