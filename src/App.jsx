import { useState, useEffect } from "react";
import Timer from "./components/Timer";
import ModoSelector from "./components/ModoSelector";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= ESTADO ================= */
const colorEstado = (estado) =>
  estado === "terminado" ? "bg-green-400" : "bg-red-400";

/* ================= ITEM ================= */
function TareaItem({ tarea, cambiarEstado, eliminar }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: tarea.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform) }}
      className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-3"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          cambiarEstado(tarea.id);
        }}
        className={`w-3 h-3 rounded-full cursor-pointer ${colorEstado(tarea.estado)}`}
      />

      <span className="flex-1 text-sm text-white">{tarea.texto}</span>

      {/* ELIMINAR */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          eliminar(tarea.id);
        }}
        className="text-red-400 hover:text-red-300 text-xs"
      >
        ✕
      </button>

      <div {...attributes} {...listeners} className="cursor-grab text-white/50">
        ☰
      </div>
    </div>
  );
}

/* ================= APP ================= */
function App() {
  const defaultBg = "src/assets/Image_20260320_141153.png";

  const [modo, setModo] = useState("focus");
  const [tiempos, setTiempos] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  const [corriendo, setCorriendo] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  const [spotifyActivo, setSpotifyActivo] = useState(false);
  const [playlistActiva, setPlaylistActiva] = useState(null);

  const [fondo, setFondo] = useState(defaultBg);

  const segundos = tiempos[modo];

  /* TIMER */
  useEffect(() => {
    if (!corriendo) return;
    const i = setInterval(() => {
      setTiempos((t) => ({ ...t, [modo]: t[modo] - 1 }));
    }, 1000);
    return () => clearInterval(i);
  }, [corriendo, modo]);

  /* TAREAS */
  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;
    setTareas([
      { id: Date.now(), texto: nuevaTarea, estado: "pendiente" },
      ...tareas,
    ]);
    setNuevaTarea("");
  };

  const eliminarTarea = (id) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  const cambiarEstado = (id) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              estado: t.estado === "pendiente" ? "terminado" : "pendiente",
            }
          : t,
      ),
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTareas((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  return (
    <div
      className="relative flex h-screen w-screen text-white overflow-hidden"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* IZQUIERDA */}
      <div
        className={`absolute z-[100] left-15 top-1/2 -translate-y-1/2 w-80 h-[80%]
  bg-black/60 rounded-3xl p-4 flex flex-col transition-all duration-500
  ${corriendo ? "opacity-0 -translate-x-10" : "opacity-100"}`}
      >
        <h2 className="mb-3 text-sm">TAREAS</h2>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tareas.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 overflow-auto space-y-2">
              {tareas.map((t) => (
                <TareaItem
                  key={t.id}
                  tarea={t}
                  cambiarEstado={cambiarEstado}
                  eliminar={eliminarTarea}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <input
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
          placeholder="Nueva tarea..."
          className="mt-3 p-2 rounded-xl bg-white/10 outline-none"
        />
      </div>

      {/* CENTRO */}
      <div
        className={`flex-1 flex flex-col items-center justify-center gap-6
  transition-all duration-500 z-[1]
  ${corriendo ? "scale-[1.05]" : "scale-100"}`}
      >
        <ModoSelector modo={modo} onCambiarModo={setModo} />

        <Timer
          segundos={segundos}
          corriendo={corriendo}
          onToggle={() => setCorriendo(!corriendo)}
        />

        {spotifyActivo && (
          <div className="w-full flex justify-center mt-2">
            <div
              className="w-[500px] h-[320px] md:h-[360px]
      bg-black/50 rounded-2xl overflow-hidden border border-white/20"
            >
              <iframe
                src={`https://open.spotify.com/embed/playlist/${
                  playlistActiva || "37i9dQZF1DX8Uebhn9wzrS"
                }`}
                width="100%"
                height="100%"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        )}
      </div>

      {/* DERECHA */}
      <div
        className={`absolute z-[50] right-15 top-1/2 -translate-y-1/2 w-80 h-[80%]
  flex flex-col gap-4 transition-all duration-500
  ${corriendo ? "opacity-0 translate-x-10" : "opacity-100"}`}
      >
        {/* VIBES */}
        <div className="flex-1 bg-black/60 rounded-3xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Lofi", id: "37i9dQZF1DX8Uebhn9wzrS", color: "#ec4899" },
              { name: "Focus", id: "37i9dQZF1DX4sWSpwq3LiO", color: "#3b82f6" },
              { name: "Chill", id: "37i9dQZF1DX4WYpdgoIcn6", color: "#8b5cf6" },
              {
                name: "Energy",
                id: "37i9dQZF1DX0XUsuxWHRQd",
                color: "#f59e0b",
              },
              {
                name: "Ambient",
                id: "37i9dQZF1DX3Ogo9pFvBkY",
                color: "#10b981",
              },
              { name: "Deep", id: "37i9dQZF1DX4E3UdUs7fUx", color: "#a855f7" },
              { name: "Night", id: "37i9dQZF1DX7qK8ma5wgG1", color: "#64748b" },
              {
                name: "Coding",
                id: "37i9dQZF1DX2sUQwD7tbmL",
                color: "#06b6d4",
              },
            ].map((item) => {
              const activo = playlistActiva === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setPlaylistActiva(item.id);
                    setSpotifyActivo(true);
                  }}
                  className="relative h-18 rounded-xl cursor-pointer flex items-center justify-center text-xs overflow-hidden"
                >
                  {activo && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        border: `2px solid ${item.color}`,
                        boxShadow: `0 0 10px ${item.color}`,
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                  )}

                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: activo
                        ? `${item.color}33`
                        : "rgba(255,255,255,0.05)",
                    }}
                  />

                  <span className="relative z-10">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BACKGROUND */}
        <div className="flex-1 bg-black/60 rounded-3xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              defaultBg,
              "https://i.gifer.com/xK.gif",
              "https://i.gifer.com/QHC.gif",
              "https://i.gifer.com/ZP5.gif",
              "https://i.gifer.com/AJl.gif",
              "https://i.gifer.com/SxJ.gif",
              "https://i.gifer.com/SxQ.gif",
            ].map((img, i) => {
              const activo = fondo === img;

              return (
                <div
                  key={i}
                  onClick={() => setFondo(img)}
                  className="h-18 rounded-xl bg-cover bg-center cursor-pointer relative"
                  style={{ backgroundImage: `url(${img})` }}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-xl" />

                  {activo && (
                    <div className="absolute inset-0 border-2 border-white rounded-xl" />
                  )}
                </div>
              );
            })}

            <label className="h-18 rounded-xl flex items-center justify-center bg-white/10 cursor-pointer">
              +
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setFondo(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
