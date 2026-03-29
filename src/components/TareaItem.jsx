import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const colorEstado = (estado) =>
  estado === "terminado" ? "bg-green-400" : "bg-red-400";

const colorPrioridad = {
  baja:  "bg-sky-500",
  media: "bg-amber-400",
  alta:  "bg-rose-500",
};

export default function TareaItem({ tarea, cambiarEstado, eliminar, cambiarPrioridad, eliminando }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id: tarea.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: "transform 250ms cubic-bezier(0.22,1,0.36,1)",
      }}
      className={`
        bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col gap-2
        transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${eliminando ? "opacity-0 translate-x-10 scale-95 blur-sm" : "opacity-100 translate-x-0 scale-100"}
      `}
    >
      {/* TOP */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => cambiarEstado(tarea.id)}
          className={`w-3 h-3 rounded-full cursor-pointer ${colorEstado(tarea.estado)}`}
        />

        <div className="flex-1 flex items-center gap-2">
          <span className={`text-sm break-words break-all whitespace-normal ${tarea.estado === "terminado" ? "line-through opacity-50" : ""}`}>
            {tarea.texto}
          </span>
          <span
            key={tarea.prioridad}
            className={`text-[10px] px-2 py-[2px] rounded-full font-medium transition-all duration-300 ease-out animate-[fadeIn_.3s_ease]
              ${tarea.prioridad === "alta"  && "bg-rose-500/20  text-rose-400  scale-105"}
              ${tarea.prioridad === "media" && "bg-amber-400/20 text-amber-300 scale-105"}
              ${tarea.prioridad === "baja"  && "bg-sky-500/20   text-sky-300   scale-105"}
            `}
          >
            {tarea.prioridad === "alta" ? "ALTA" : tarea.prioridad === "media" ? "MEDIA" : "BAJA"}
          </span>
        </div>

        <button onClick={() => eliminar(tarea.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
        <div {...attributes} {...listeners} className="cursor-grab text-white/50">☰</div>
      </div>

      {/* BOTTOM */}
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-white/40 tracking-wide text-[13px]">{tarea.fecha}</span>

        <div className="flex items-center gap-2">
          <span className="text-white/40 text-[12px]">Prioridad:</span>
          <div className="flex gap-2">
            {["baja", "media", "alta"].map((p) => (
              <div
                key={p}
                onClick={() => cambiarPrioridad(tarea.id, p)}
                className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-300
                  ${colorPrioridad[p]}
                  ${tarea.prioridad === p
                    ? "scale-110 ring-2 ring-white shadow-lg"
                    : "opacity-30 hover:opacity-100 hover:scale-110"}
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
