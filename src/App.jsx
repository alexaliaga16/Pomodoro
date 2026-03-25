import { useState, useEffect, useRef } from "react";
import Timer from "./components/Timer";
import ModoSelector from "./components/ModoSelector";
import ContadorSesiones from "./components/ContadorSesiones";
import Reproductor from "./components/Reproductor";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const colorEstado = (estado) =>
  estado === "terminado" ? "bg-green-400" : "bg-red-400";

const colorPrioridad = {
  baja: "bg-sky-500",
  media: "bg-amber-400",
  alta: "bg-rose-500",
};


const vibes = [
  {
    name: "Lofi",
    url: "https://stream.zeno.fm/0vgy8qv3feruv",
    color: "#ec4899",
  },
  {
    name: "Focus",
    url: "https://stream.zeno.fm/0r0xa792kwzuv",
    color: "#3b82f6",
  },
  {
    name: "Chill",
    url: "https://stream.zeno.fm/8s5u5tpdtwzuv",
    color: "#8b5cf6",
  },
  {
    name: "Energy",
    url: "https://stream.zeno.fm/7b9v0h2zzwzuv",
    color: "#f59e0b",
  },
  {
    name: "Ambient",
    url: "https://stream.zeno.fm/4wqre23fytzuv",
    color: "#10b981",
  },
  {
    name: "Deep",
    url: "https://stream.zeno.fm/9k0y8p9k2wzuv",
    color: "#a855f7",
  },
];

function TareaItem({
  tarea,
  cambiarEstado,
  eliminar,
  cambiarPrioridad,
  eliminando,
}) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: tarea.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: "transform 250ms cubic-bezier(0.22,1,0.36,1)",
      }}
      className={`
        bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]      
        ${eliminando
          ? "opacity-0 translate-x-10 scale-95 blur-sm"
          : "opacity-100 translate-x-0 scale-100"
        }
      `}
    >
      {/* TOP */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => cambiarEstado(tarea.id)}
          className={`w-3 h-3 rounded-full cursor-pointer ${colorEstado(tarea.estado)}`}
        />

        <div className="flex-1 flex items-center gap-2">
          <span
            className={`text-sm break-words break-all whitespace-normal
            ${tarea.estado === "terminado" ? "line-through opacity-50" : ""}`}
          >
            {tarea.texto}
          </span>
          <span
            key={tarea.prioridad}
            className={`text-[10px] px-2 py-[2px] rounded-full font-medium transition-all duration-300 ease-out animate-[fadeIn_.3s_ease]
              ${tarea.prioridad === "alta" && "bg-rose-500/20 text-rose-400 scale-105"}
              ${tarea.prioridad === "media" && "bg-amber-400/20 text-amber-300 scale-105"}
              ${tarea.prioridad === "baja" && "bg-sky-500/20 text-sky-300 scale-105"}
              `}
          >
            {tarea.prioridad === "alta" ? "ALTA" : tarea.prioridad === "media" ? "MEDIA" : "BAJA"}
          </span>
        </div>

        <button onClick={() => eliminar(tarea.id)} className="text-red-400 hover:text-red-300 text-xs">
          ✕
        </button>

        <div {...attributes} {...listeners} className="cursor-grab text-white/50">
          ☰
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-white/40 tracking-wide text-[13px]">
          {tarea.fecha}
        </span>

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
                    : "opacity-30 hover:opacity-100 hover:scale-110"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= APP ================= */
function App() {
  const defaultBg = "src/assets/Image_20260320_141153.png";

  const [modo, setModo] = useState("focus");

  const [eliminandoId, setEliminandoId] = useState(null);

  const audioRef = useRef(null);


  const [tiempoGuardado, setTiempoGuardado] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  const [tiempoDinamico, setTiempoDinamico] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  const [corriendo, setCorriendo] = useState(false);
  const [tareas, setTareas] = useState(() => {
    const guardado = localStorage.getItem("tareas");
    return guardado ? JSON.parse(guardado) : [];
  });
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [audio, setAudio] = useState(null);
  const [vibeActiva, setVibeActiva] = useState(null);

  const [fondo, setFondo] = useState(() => {
    return localStorage.getItem("fondo") || defaultBg;
  });

  const [sesion, setSesion] = useState(1);
  const [totalSesiones, setTotalSesiones] = useState(4);

  const [visible, setVisible] = useState(false);

  const [favoritos, setFavoritos] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);

  const [intentos, setIntentos] = useState(0);
  
  const fondos = [
    defaultBg,
    "https://i.gifer.com/xK.gif",
    "https://i.gifer.com/QHC.gif",
    "https://i.gifer.com/ZP5.gif",
    "https://i.gifer.com/AJl.gif",
    "https://i.gifer.com/SxJ.gif",
    "https://i.gifer.com/SxQ.gif",
  ];

  const [indexFondo, setIndexFondo] = useState(() => {
    const i = fondos.indexOf(fondo);
    return i !== -1 ? i : 0;
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("tareas", JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    localStorage.setItem("fondo", fondo);
  }, [fondo]);

  useEffect(() => {
    setFondo(fondos[indexFondo]);
  }, [indexFondo]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "ArrowRight") {
        setIndexFondo((i) => (i + 1) % fondos.length);
      }

      if (e.code === "ArrowLeft") {
        setIndexFondo((i) => (i - 1 + fondos.length) % fondos.length);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const segundos = tiempoDinamico[modo];

  /* TIMER */
  useEffect(() => {
    if (!corriendo) return;
    const i = setInterval(() => {
      setTiempoDinamico((t) => ({ ...t, [modo]: t[modo] - 1 }));
    }, 1000);
    return () => clearInterval(i);
  }, [corriendo, modo]);

  useEffect(() => {
    if (segundos <= 0 && corriendo) {
      if (modo === "focus") {
        if (sesion < totalSesiones) {
          setModo("shortBreak");
          setSesion((s) => s + 1);
          setCorriendo(true);
          setTiempoDinamico((t) => ({
            ...t,
            shortBreak: tiempoGuardado.shortBreak,
            focus: tiempoGuardado.focus,
          }));
        } else {
          setModo("longBreak");
          setCorriendo(true);
          setTiempoDinamico((t) => ({
            ...t,
            longBreak: tiempoGuardado.longBreak,
            focus: tiempoGuardado.focus,
          }));
        }
      }

      if (modo === "shortBreak" || modo === "longBreak") {
        setModo("focus");
        setTiempoDinamico((t) => ({
          ...t,
          focus: tiempoGuardado.focus,
          shortBreak: tiempoGuardado.shortBreak,
          longBreak: tiempoGuardado.longBreak,
        }));

        if (modo === "longBreak") {
          setSesion(1);
          setCorriendo(false);
        } else {
          setCorriendo(true);
        }
      }
    }
  }, [segundos, corriendo]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();

        if (vibeActiva) {
          togglePlay();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [audio, isPlaying, vibeActiva]);

  const [estadoStream, setEstadoStream] = useState("idle");
  // idle | connecting | playing | error

  const retryRef = useRef(null);

  const reproducirStream = (vibe) => {
    setVibeActiva(vibe.name);
    setIsPlaying(true);
    setEstadoStream("connecting");

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const nuevoAudio = new Audio(vibe.url);
    nuevoAudio.loop = true;
    nuevoAudio.volume = 0.5;

    audioRef.current = nuevoAudio;

    // 🔥 BUFFERING (cuando está cargando)
    nuevoAudio.onwaiting = () => {
      setEstadoStream("connecting");
    };

    // 🔥 CUANDO YA SUENA
    nuevoAudio.onplaying = () => {
      setEstadoStream("playing");
    };

    // 🔥 ERROR → reintento automático
    const intentarReconexion = () => {
      setEstadoStream("error");

      clearTimeout(retryRef.current);

      retryRef.current = setTimeout(() => {
        console.log("Reintentando stream...");
        reproducirStream(vibe); // 🔁 retry automático
      }, 3000); // intenta cada 3s
    };

    nuevoAudio.onerror = intentarReconexion;

    nuevoAudio.play().catch(intentarReconexion);
  };

  const togglePlay = () => {
    const current = audioRef.current;

    if (!current) return;

    setIsPlaying(prev => !prev);

    if (current.paused) {
      current.play().catch(() => {
        setEstadoStream("error");
      });
    } else {
      current.pause();
    }
  };

  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;

    const nueva = {
      id: Date.now(),
      texto: nuevaTarea,
      estado: "pendiente",
      prioridad: "media",
      fecha: new Date().toLocaleString("es-PE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTareas((prev) => [nueva, ...prev]);
    setNuevaTarea("");
  };

  const toggleFavorito = (name) => {
    setFavoritos((prev) =>
      prev.includes(name)
        ? prev.filter((f) => f !== name)
        : [...prev, name]
    );
  };

  const eliminarTarea = (id) => {
    setEliminandoId(id);

    setTimeout(() => {
      setTareas((prev) => prev.filter((t) => t.id !== id));
      setEliminandoId(null);
    }, 300);
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

  const cambiarPrioridad = (id, prioridad) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, prioridad } : t)),
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

  const cambiarTiempo = (minutos) => {
    setTiempoGuardado((t) => ({ ...t, [modo]: minutos * 60 }));
    setTiempoDinamico((t) => ({ ...t, [modo]: minutos * 60 }));
  };

  const ajustarTiempo = (direccion) => {
    setTiempoGuardado((t) => {
      const nuevoValor = t[modo] + direccion * 5 * 60;
      const limitado = Math.min(Math.max(nuevoValor, 60), 999 * 60);
      return { ...t, [modo]: limitado };
    });

    setTiempoDinamico((t) => {
      const nuevoValor = t[modo] + direccion * 5 * 60;
      const limitado = Math.min(Math.max(nuevoValor, 60), 999 * 60);
      return { ...t, [modo]: limitado };
    });
  };

  const cambiarSesion = (totalSesiones) => {
    setTotalSesiones(Math.min(Math.max(totalSesiones, 1), 15));
  };

  const tareaActiva = tareas.find((t) => t.estado === "pendiente");

  return (
    <div className="relative flex h-screen w-screen text-white overflow-hidden"
      style={{ backgroundImage: `url(${fondo})`, backgroundSize: "cover", backgroundPosition: "center", }}>

      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] backdrop-brightness-90" />

      {/* IZQUIERDA */}
      <div
        className={`absolute z-[100] left-15 top-1/2 -translate-y-1/2 w-90 h-[85%] glass-dark rounded-3xl p-4 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] 
        ${corriendo ? "opacity-0 -translate-x-40" : visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-40"}`}>
        <h2 className="mb-3 text-sm tit">Tasks</h2>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex-1 overflow-auto space-y-2 overflow-hidden">
              {tareas.map((t) => (
                <TareaItem
                  key={t.id} tarea={t} cambiarEstado={cambiarEstado} eliminar={eliminarTarea} cambiarPrioridad={cambiarPrioridad} eliminando={eliminandoId === t.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-3 flex gap-2 items-center">
          <input
            value={nuevaTarea} onChange={(e) => setNuevaTarea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarTarea()} placeholder="Nueva tarea..." className="flex-1 p-2 px-3 rounded-xl bg-white/10 outline-none text-sm" />

          <button
            onClick={agregarTarea} disabled={!nuevaTarea.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90
              ${nuevaTarea.trim() ? "bg-blue-500 scale-100 opacity-100" : "bg-white/10 scale-90 opacity-50 cursor-not-allowed"}`}>
            <i className="fas fa-paper-plane text-white text-sm"></i>
          </button>
        </div>
      </div>

      {/* CENTRO */}
      <div
        className={`flex-1 flex flex-col items-center justify-center gap-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-[1]

          ${!visible ? "opacity-0 scale-75" : corriendo ? "opacity-100 scale-[1.08]" : "opacity-100 scale-100"}`}>

        <ContadorSesiones sesion={sesion} totalSesiones={totalSesiones} onCambiarSesion={cambiarSesion} />

        <ModoSelector modo={modo} onCambiarModo={setModo} />

        <Timer segundos={segundos} corriendo={corriendo} onCambiarTiempo={cambiarTiempo} onAjustar={ajustarTiempo}
          onToggle={() => {
            const nuevoEstado = !corriendo;
            setCorriendo(nuevoEstado);

            if (audio) {
              if (nuevoEstado) {
                audio.play();
              } else {
                audio.pause();
              }
            }
          }}
        />

        {(corriendo || vibeActiva) && (
          <div
            className={`absolute top-[6%] right-[6%] z-[200] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          
            ${corriendo ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-90 pointer-events-none"}`}>
            <Reproductor
              vibeActiva={vibeActiva} vibes={vibes} onPlay={reproducirStream} favoritos={favoritos}
              toggleFavorito={toggleFavorito} togglePlay={togglePlay} isPlaying={isPlaying} />
          </div>
        )}

      </div>

      {/* DERECHA */}
      <div
        className={`absolute z-[50] right-15 top-1/2 -translate-y-1/2 w-90 h-[85%] flex flex-col gap-4
            transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
            ${corriendo ? "opacity-0 translate-x-40" : visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-40"}`}>
        <div
          className="flex-1 relative overflow-hidden rounded-3xl py-6 px-4 flex flex-col
            bg-[rgba(20,20,30,0.45)] backdrop-blur-[20px] backdrop-saturate-150 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="mb-3 flex items-center justify-between px-4 ">
            <h2 className="text-sm tit">Vibes</h2>

            {vibeActiva && (
              <div className="flex items-center gap-2 text-[13px] text-white/70">

                {estadoStream === "connecting" && (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin text-yellow-400"></i>
                    Conectando...
                  </>
                )}

                {estadoStream === "playing" && (
                  <>
                    <span className="animate-pulse text-red-500 drop-shadow-[0_0_6px_red]">●</span>
                    En vivo
                  </>
                )}

                {estadoStream === "error" && (
                  <>
                    <i className="fa-solid fa-wifi text-red-400 animate-pulse"></i>
                    Reconectando...
                  </>
                )}

              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto scroll-invisible px-2">
            <div className="grid grid-cols-2 gap-3">
              {vibes.map((item) => {
                const seleccionado = vibeActiva === item.name;
                const activo = seleccionado && isPlaying;

                return (
                  <div
                    key={item.name}
                    onClick={() => {
                      reproducirStream(item);
                    }}
                    className={`relative h-18 rounded-2xl cursor-pointer overflow-hidden flex
                     items-center gap-3 px-3 border border-white/10 bg-[rgba(20,20,30,0.5)] backdrop-blur-[14px] transition-all duration-300 hover:scale-[1.03] active:scale-95`}>
                    {activo && (
                      <div
                        className="absolute inset-0 rounded-2xl opacity-12"
                        style={{
                          background: item.color,
                        }}
                      />
                    )}

                    <div
                      className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0"
                      style={{
                        backgroundImage: `url(https://picsum.photos/200?random=${item.name})`
                      }}
                    />

                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-white/50">
                        Live radio
                      </p>
                    </div>

                    {activo && (
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
                        style={{
                          border: `2px solid ${item.color}`,
                          boxShadow: `0 0 12px ${item.color}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* THEME */}
        <div
          className="flex-1 relative overflow-hidden rounded-3xl p-6 flex flex-col bg-[rgba(20,20,30,0.45)] 
          backdrop-blur-[20px] backdrop-saturate-150 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <h2 className="mb-3 text-sm tit shrink-0">Theme</h2>

          <div className="flex-1 overflow-auto scroll-invisible">
            <div className="grid grid-cols-2 gap-3.5">
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
                    onClick={() => {
                      setIndexFondo(i);
                    }}
                    className="h-18 rounded-xl bg-cover bg-center cursor-pointer relative"
                    style={{ backgroundImage: `url(${img})` }}>
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] rounded-xl" />
                    {activo && (
                      <>
                        <div className="absolute inset-0 rounded-xl border-2 border-white/80" />
                        <div className="absolute inset-0 rounded-xl animate-pulse border border-white/30" />
                      </>
                    )}
                  </div>
                );
              })}

              <label
                className="h-18 rounded-2xl cursor-pointer relative overflow-hidden flex items-center justify-center border border-white/10 group"
                style={{ backgroundImage: fondo?.startsWith("data:") ? `url(${fondo})` : "none", backgroundSize: "cover", backgroundPosition: "center", }}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />

                <span className="relative z-10 text-lg text-white transition-all duration-300 group-hover:scale-125">
                  <i className={`fas ${fondo?.startsWith("data:") ? "fa-pen" : "fa-plus"}`} />
                </span>

                <input type="file" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFondo(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;