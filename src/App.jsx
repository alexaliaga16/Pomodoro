import { useState, useEffect, useRef, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Timer          from "./components/Timer";
import ModoSelector   from "./components/ModoSelector";
import ContadorSesiones from "./components/ContadorSesiones";
import Reproductor    from "./components/Reproductor";
import TareaItem      from "./components/TareaItem";

import { usePomodoro } from "./hooks/usePomodoro";
import { vibes, fondos, defaultBg } from "./data/index";

/* ================= APP ================= */
export default function App() {
  const {
    modo, cambiarModo,
    segundos,
    corriendo, toggle,
    sesion, totalSesiones, cambiarSesion,
    cambiarTiempo, ajustarTiempo,
  } = usePomodoro();

  /* ── UI ── */
  const [visible, setVisible]         = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  /* ── Tareas ── */
  const [tareas, setTareas] = useState(() => {
    const g = localStorage.getItem("tareas");
    return g ? JSON.parse(g) : [];
  });
  const [nuevaTarea, setNuevaTarea] = useState("");

  /* ── Fondo ── */
  const [indexFondo, setIndexFondo] = useState(() => {
    const saved = localStorage.getItem("fondo");
    const i = fondos.indexOf(saved);
    return i !== -1 ? i : 0;
  });
  const fondo = fondos[indexFondo] ?? defaultBg;
  const [fondoCustom, setFondoCustom] = useState(() => {
    const s = localStorage.getItem("fondo");
    return s?.startsWith("data:") ? s : null;
  });
  const fondoActual = fondoCustom ?? fondo;

  /* ── Vibes / audio ── */
  const audioRef           = useRef(null);
  const currentStreamRef   = useRef(null);
  const retryRef           = useRef(null);
  const errorHandledRef    = useRef(false);

  const [vibeActiva, setVibeActiva]   = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [estadoStream, setEstadoStream] = useState("idle");
  const [intentos, setIntentos]       = useState(0);
  const [favoritos, setFavoritos]     = useState(() => {
    const g = localStorage.getItem("favoritos");
    return g ? JSON.parse(g) : [];
  });

  const vibesOrdenadas = useMemo(() => {
    return [...vibes].sort((a, b) => {
      const aF = favoritos.includes(a.name);
      const bF = favoritos.includes(b.name);
      return aF === bF ? 0 : aF ? -1 : 1;
    });
  }, [favoritos]);

  /* ── Efectos iniciales ── */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("tareas", JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    if (!fondoCustom) localStorage.setItem("fondo", fondo);
  }, [fondo, fondoCustom]);

  /* ── Teclado: fondos + radio ── */
  useEffect(() => {
    const handle = (e) => {
      if (e.code === "ArrowRight") setIndexFondo((i) => (i + 1) % fondos.length);
      if (e.code === "ArrowLeft")  setIndexFondo((i) => (i - 1 + fondos.length) % fondos.length);

      if (!vibeActiva) return;
      const idx = vibesOrdenadas.findIndex((v) => v.name === vibeActiva);
      if (idx === -1) return;

      if (e.code === "ArrowUp") {
        setIntentos(0);
        reproducirStream(vibesOrdenadas[(idx - 1 + vibesOrdenadas.length) % vibesOrdenadas.length]);
      }
      if (e.code === "ArrowDown") {
        setIntentos(0);
        reproducirStream(vibesOrdenadas[(idx + 1) % vibesOrdenadas.length]);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [vibeActiva, vibesOrdenadas]);

  /* ── Teclado: espacio ── */
  useEffect(() => {
    const handle = (e) => {
      if (e.code === "Space" && vibeActiva) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [vibeActiva, isPlaying]);

  /* ── Audio ── */
  const reproducirStream = (vibe) => {
    clearTimeout(retryRef.current);
    errorHandledRef.current = false;
    currentStreamRef.current = vibe.url;

    setVibeActiva(vibe.name);
    setIsPlaying(true);
    setEstadoStream("connecting");

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const a = new Audio(vibe.url);
    a.loop   = true;
    a.volume = 0.5;
    audioRef.current = a;

    a.onplaying = () => {
      if (currentStreamRef.current !== vibe.url) return;
      setEstadoStream("playing");
    };

    const intentarReconexion = () => {
      if (errorHandledRef.current) return;
      errorHandledRef.current = true;
      if (currentStreamRef.current !== vibe.url) return;
      setEstadoStream("error");

      setIntentos((prev) => {
        if (prev >= 1) return prev;
        retryRef.current = setTimeout(() => {
          if (currentStreamRef.current !== vibe.url) return;
          reproducirStream(vibe);
        }, 3000);
        return prev + 1;
      });
    };

    a.onerror = intentarReconexion;
    a.play().catch(intentarReconexion);
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => { setIsPlaying(true); setEstadoStream("playing"); }).catch(() => setEstadoStream("error"));
    } else {
      a.pause();
      setIsPlaying(false);
      setEstadoStream("idle");
    }
  };

  /* ── Tareas ── */
  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;
    setTareas((prev) => [
      {
        id:       Date.now(),
        texto:    nuevaTarea,
        estado:   "pendiente",
        prioridad:"media",
        fecha:    new Date().toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
    setNuevaTarea("");
  };

  const eliminarTarea = (id) => {
    setEliminandoId(id);
    setTimeout(() => { setTareas((p) => p.filter((t) => t.id !== id)); setEliminandoId(null); }, 300);
  };

  const cambiarEstado = (id) => {
    setTareas((prev) => prev.map((t) => t.id === id ? { ...t, estado: t.estado === "pendiente" ? "terminado" : "pendiente" } : t));
  };

  const cambiarPrioridad = (id, prioridad) => {
    setTareas((prev) => prev.map((t) => t.id === id ? { ...t, prioridad } : t));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setTareas((items) => arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id)));
  };

  const toggleFavorito = (name) => {
    setFavoritos((prev) => {
      const nuevo = prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name];
      localStorage.setItem("favoritos", JSON.stringify(nuevo));
      return nuevo;
    });
  };

  /* ── Render ── */
  return (
    <div
      className="app-container relative flex h-screen w-screen text-white overflow-hidden"
      style={{ backgroundImage: `url(${fondoActual})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] backdrop-brightness-90" />

      <div className="panels-row">
        {/* PANEL IZQUIERDA – Tareas */}
        <div className={`panel-left absolute z-[100] left-15 top-1/2 -translate-y-1/2 w-90 h-[80%] glass-dark rounded-3xl p-4 flex flex-col
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${corriendo ? "opacity-0 -translate-x-40" : visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-40"}`}>

          <h2 className="mb-3 text-sm tit">Tasks</h2>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 overflow-auto space-y-2 overflow-hidden">
                {tareas.map((t) => (
                  <TareaItem
                    key={t.id} tarea={t}
                    cambiarEstado={cambiarEstado} eliminar={eliminarTarea}
                    cambiarPrioridad={cambiarPrioridad} eliminando={eliminandoId === t.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-3 flex gap-2 items-center">
            <input
              value={nuevaTarea} onChange={(e) => setNuevaTarea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
              placeholder="Nueva tarea..."
              className="flex-1 p-2 px-3 rounded-xl bg-white/10 outline-none text-sm"
            />
            <button
              onClick={agregarTarea} disabled={!nuevaTarea.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90
                ${nuevaTarea.trim() ? "bg-blue-500 scale-100 opacity-100" : "bg-white/10 scale-90 opacity-50 cursor-not-allowed"}`}>
              <i className="fas fa-paper-plane text-white text-sm" />
            </button>
          </div>
        </div>

        {/* PANEL DERECHA – Vibes + Theme */}
        <div className={`panel-right absolute z-[50] right-15 top-1/2 -translate-y-1/2 w-95 h-[80%] flex flex-col gap-4
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${corriendo ? "opacity-0 translate-x-40" : visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-40"}`}>

          {/* Vibes */}
          <div className="flex-1 relative overflow-hidden rounded-3xl py-6 px-3 flex flex-col
            bg-[rgba(20,20,30,0.45)] backdrop-blur-[20px] backdrop-saturate-150 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="text-sm tit">Vibes</h2>

              {vibeActiva && (
                <div className="flex items-center gap-2 text-[13px] text-white/70">
                  {estadoStream === "connecting" && (<><i className="fa-solid fa-circle-notch animate-spin text-yellow-400" /> Conectando...</>)}
                  {estadoStream === "playing"    && (<><span className="animate-pulse text-red-500 drop-shadow-[0_0_6px_red]">●</span> En vivo</>)}
                  {estadoStream === "error"      && (intentos < 1
                    ? (<><i className="fa-solid fa-rotate animate-spin text-yellow-400" /> Reconectando...</>)
                    : (<><i className="fa-solid fa-triangle-exclamation text-red-400" /> Sin conexión</>)
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto scroll-invisible px-2">
              <div className="grid grid-cols-2 gap-3">
                {vibesOrdenadas.map((item) => {
                  const seleccionado = vibeActiva === item.name;
                  const activo       = seleccionado && isPlaying;

                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        if (vibeActiva === item.name) { togglePlay(); }
                        else { setIntentos(0); reproducirStream(item); }
                      }}
                      className="group relative h-20 rounded-2xl cursor-pointer overflow-hidden flex items-center gap-3 px-3
                        border border-white/10 bg-[rgba(20,20,30,0.5)] backdrop-blur-[14px]
                        transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    >
                      {activo && <div className="absolute inset-0 rounded-2xl opacity-12" style={{ background: item.color }} />}

                      <div className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(https://picsum.photos/200?random=${item.name})` }} />

                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-white/50">Live radio</p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorito(item.name); }}
                        className={`absolute top-2 right-2 z-20 flex items-center justify-center w-6 h-6 rounded-full
                          transition-all duration-300
                          ${favoritos.includes(item.name)
                            ? "bg-yellow-400/20 backdrop-blur-md scale-100 opacity-100"
                            : "opacity-0 scale-75 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"}`}>
                        <i className={`fas fa-star text-[11px] transition-all duration-300
                          ${favoritos.includes(item.name)
                            ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]"
                            : "text-white/60 hover:text-yellow-300"}`} />
                      </button>

                      {activo && (
                        <div className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
                          style={{ border: `2px solid ${item.color}`, boxShadow: `0 0 12px ${item.color}` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="flex-1 relative overflow-hidden rounded-3xl p-6 flex flex-col
            bg-[rgba(20,20,30,0.45)] backdrop-blur-[20px] backdrop-saturate-150 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <h2 className="mb-3 text-sm tit shrink-0">Theme</h2>

            <div className="flex-1 overflow-auto scroll-invisible">
              <div className="grid grid-cols-2 gap-3.5">
                {fondos.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => { setFondoCustom(null); setIndexFondo(i); }}
                    className="h-18 rounded-xl bg-cover bg-center cursor-pointer relative"
                    style={{ backgroundImage: `url(${img})` }}
                  >
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] rounded-xl" />
                    {fondoActual === img && !fondoCustom && (
                      <>
                        <div className="absolute inset-0 rounded-xl border-2 border-white/80" />
                        <div className="absolute inset-0 rounded-xl animate-pulse border border-white/30" />
                      </>
                    )}
                  </div>
                ))}

                <label className="h-18 rounded-2xl cursor-pointer relative overflow-hidden flex items-center justify-center border border-white/10 group"
                  style={{ backgroundImage: fondoCustom ? `url(${fondoCustom})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />
                  <span className="relative z-10 text-lg text-white transition-all duration-300 group-hover:scale-125">
                    <i className={`fas ${fondoCustom ? "fa-pen" : "fa-upload"}`} />
                  </span>
                  <input type="file" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFondoCustom(reader.result);
                        localStorage.setItem("fondo", reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CENTRO */}
      <div className={`panel-center flex-1 flex flex-col items-center justify-center gap-6
        transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-[1]
        ${corriendo ? "focus-mode" : ""}
        ${!visible ? "opacity-0 scale-75" : corriendo ? "opacity-100 scale-[1.05]" : "opacity-100 scale-100"}`}>

        <ContadorSesiones sesion={sesion} totalSesiones={totalSesiones} onCambiarSesion={cambiarSesion} />
        <ModoSelector modo={modo} onCambiarModo={cambiarModo} />
        <Timer
          segundos={segundos} corriendo={corriendo}
          onCambiarTiempo={cambiarTiempo} onAjustar={ajustarTiempo}
          onToggle={toggle}
        />

        {(corriendo || vibeActiva) && (
          <div className={`absolute top-[6%] right-[6%] z-[200] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${corriendo ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-90 pointer-events-none"}`}>
            <Reproductor
              vibeActiva={vibeActiva} vibes={vibes} onPlay={reproducirStream}
              favoritos={favoritos} toggleFavorito={toggleFavorito}
              togglePlay={togglePlay} isPlaying={isPlaying}
            />
          </div>
        )}
      </div>

      {!corriendo && (
        <div
          className={`px-5 info absolute bottom-4 left-4 z-[200] transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(14px, 2vw, 22px)" }}
        >
          ← → cambia entre fondos · ↑ ↓ cambia de estación de radio · Space reproduce o pausa la música
        </div>
      )}
    </div>
  );
}
