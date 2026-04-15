import { useState, useEffect, useRef, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Timer from "./components/Timer";
import ModoSelector from "./components/ModoSelector";
import ContadorSesiones from "./components/ContadorSesiones";
import Reproductor from "./components/Reproductor";
import TareaItem from "./components/TareaItem";
import ModalEstaciones from "./components/ModalEstaciones";

import { usePomodoro } from "./hooks/usePomodoro";
import { vibes, extraVibes, fondos, defaultBg } from "./data/index";

const accentOptions = [
  { name: "Normal", hex: "transparent", rgb: "255, 255, 255", neutral: true },
  { name: "Azul", hex: "#4f7cff", rgb: "79, 124, 255" },
  { name: "Cian", hex: "#4de2ff", rgb: "77, 226, 255" },
  { name: "Lima", hex: "#b7ff4a", rgb: "183, 255, 74" },
  { name: "Coral", hex: "#ff7a6b", rgb: "255, 122, 107" },
  { name: "Oro", hex: "#ffd166", rgb: "255, 209, 102" },
  { name: "Magenta", hex: "#ff5fd2", rgb: "255, 95, 210" },
];
const accentPalette = accentOptions.filter((item) => !item.neutral);
const maxVibesVisibles = 6;
const defaultVibesVisibles = vibes.slice(0, maxVibesVisibles).map((item) => item.name);
const nombresVibesDisponibles = new Set([...vibes, ...extraVibes].map((item) => item.name));

const normalizarVibesVisibles = (names) => {
  const visibles = Array.isArray(names)
    ? names.filter((name, index) => (
      nombresVibesDisponibles.has(name) && names.indexOf(name) === index
    ))
    : [];

  for (const name of defaultVibesVisibles) {
    if (visibles.length >= maxVibesVisibles) break;
    if (!visibles.includes(name)) visibles.push(name);
  }

  return visibles.slice(0, maxVibesVisibles);
};

const obtenerCanalesRgb = (rgb) => (
  rgb.split(",").map((value) => Number(value.trim()))
);

export default function App() {
  const {
    modo, cambiarModo,
    segundos,
    corriendo, toggle,
    sesion, totalSesiones, cambiarSesion,
    cambiarTiempo, ajustarTiempo,
  } = usePomodoro();

  const [visible, setVisible] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [modalEstacionesAbierto, setModalEstacionesAbierto] = useState(false);

  const [tareas, setTareas] = useState(() => {
    const g = localStorage.getItem("tareas");
    return g ? JSON.parse(g) : [];
  });
  const [nuevaTarea, setNuevaTarea] = useState("");

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
  const [fondoTransicion, setFondoTransicion] = useState({
    actual: fondoCustom ?? fondo,
    anterior: null,
    version: 0,
  });
  const [accentHex, setAccentHex] = useState(() => {
    const saved = localStorage.getItem("ui-accent");
    return accentOptions.find((item) => item.hex === saved)?.hex ?? accentOptions[0].hex;
  });
  const fondoActual = fondoCustom ?? fondo;
  const accent = accentOptions.find((item) => item.hex === accentHex) ?? accentOptions[0];
  const accentVisualHex = accent.neutral ? "#ffffff" : accent.hex;
  const [accentR, accentG, accentB] = obtenerCanalesRgb(accent.rgb);

  const audioRef = useRef(null);
  const currentStreamRef = useRef(null);
  const retryRef = useRef(null);
  const errorHandledRef = useRef(false);

  const [vibeActiva, setVibeActiva] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [estadoStream, setEstadoStream] = useState("idle");
  const [intentos, setIntentos] = useState(0);
  const [favoritos, setFavoritos] = useState(() => {
    const g = localStorage.getItem("favoritos");
    return g ? JSON.parse(g) : [];
  });
  const [volumen, setVolumen] = useState(() => {
    const g = localStorage.getItem("volumen-radio");
    const parsed = Number(g);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0.5;
  });
  const [vibesVisiblesNombres, setVibesVisiblesNombres] = useState(() => {
    const g = localStorage.getItem("vibes-visibles");
    const parsed = g ? JSON.parse(g) : null;
    return normalizarVibesVisibles(parsed);
  });
  const [mostrarHudVolumen, setMostrarHudVolumen] = useState(false);
  const [hoverHudVolumen, setHoverHudVolumen] = useState(false);
  const hideVolumeHudRef = useRef(null);
  const draggingVolumeRef = useRef(false);
  const volumeTrackRef = useRef(null);
  const fondoTransicionRef = useRef(null);

  const todasLasVibes = useMemo(() => [...vibes, ...extraVibes], []);

  const vibesVisibles = useMemo(() => {
    return vibesVisiblesNombres
      .map((name) => todasLasVibes.find((item) => item.name === name))
      .filter(Boolean)
      .slice(0, maxVibesVisibles)
      .map((item, index) => ({
        ...item,
        uiAccent: accentPalette[index % accentPalette.length],
      }));
  }, [vibesVisiblesNombres, todasLasVibes]);

  const estacionesRestantes = useMemo(() => {
    return todasLasVibes.filter((item) => !vibesVisiblesNombres.includes(item.name));
  }, [todasLasVibes, vibesVisiblesNombres]);

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

  useEffect(() => {
    setFondoTransicion((prev) => {
      if (prev.actual === fondoActual) return prev;

      clearTimeout(fondoTransicionRef.current);
      fondoTransicionRef.current = setTimeout(() => {
        setFondoTransicion((current) => ({ ...current, anterior: null }));
      }, 950);

      return {
        actual: fondoActual,
        anterior: prev.actual,
        version: prev.version + 1,
      };
    });
  }, [fondoActual]);

  useEffect(() => () => clearTimeout(fondoTransicionRef.current), []);

  useEffect(() => {
    localStorage.setItem("ui-accent", accent.hex);
  }, [accent]);

  useEffect(() => {
    const normalizadas = normalizarVibesVisibles(vibesVisiblesNombres);
    if (normalizadas.join("|") !== vibesVisiblesNombres.join("|")) {
      setVibesVisiblesNombres(normalizadas);
      return;
    }

    localStorage.setItem("vibes-visibles", JSON.stringify(normalizadas));
  }, [vibesVisiblesNombres]);

  useEffect(() => {
    localStorage.setItem("volumen-radio", String(volumen));
    if (audioRef.current) audioRef.current.volume = volumen;
  }, [volumen]);

  useEffect(() => () => clearTimeout(hideVolumeHudRef.current), []);

  useEffect(() => {
    if (hoverHudVolumen) {
      clearTimeout(hideVolumeHudRef.current);
      setMostrarHudVolumen(true);
      return;
    }

    if (!mostrarHudVolumen) return;
    clearTimeout(hideVolumeHudRef.current);
    hideVolumeHudRef.current = setTimeout(() => setMostrarHudVolumen(false), 1200);
  }, [hoverHudVolumen, mostrarHudVolumen]);

  useEffect(() => {
    const handle = (e) => {
      if (e.code === "ArrowRight") setIndexFondo((i) => (i + 1) % fondos.length);
      if (e.code === "ArrowLeft") setIndexFondo((i) => (i - 1 + fondos.length) % fondos.length);

      if (!vibeActiva) return;
      const idx = vibesVisibles.findIndex((v) => v.name === vibeActiva);
      if (idx === -1) return;

      if (e.code === "ArrowUp") {
        setIntentos(0);
        reproducirStream(vibesVisibles[(idx - 1 + vibesVisibles.length) % vibesVisibles.length]);
      }
      if (e.code === "ArrowDown") {
        setIntentos(0);
        reproducirStream(vibesVisibles[(idx + 1) % vibesVisibles.length]);
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [vibeActiva, vibesVisibles]);

  useEffect(() => {
    const handle = (e) => {
      if (e.code === "Escape") setModalEstacionesAbierto(false);
      const tag = e.target?.tagName;
      const escribiendo = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
      if (escribiendo) return;
      if (e.code === "Space" && vibeActiva) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [vibeActiva, isPlaying]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (!e.ctrlKey) return;

      e.preventDefault();
      cambiarVolumen(e.deltaY < 0 ? 0.05 : -0.05);
      setMostrarHudVolumen(true);
      clearTimeout(hideVolumeHudRef.current);
      if (!hoverHudVolumen) {
        hideVolumeHudRef.current = setTimeout(() => setMostrarHudVolumen(false), 1200);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [hoverHudVolumen]);

  useEffect(() => {
    const handleZoomKeys = (e) => {
      const modifier = e.ctrlKey || e.metaKey;
      if (!modifier) return;

      if (["+", "-", "=", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };

    const preventGestureZoom = (e) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleZoomKeys, { passive: false });
    window.addEventListener("gesturestart", preventGestureZoom, { passive: false });
    window.addEventListener("gesturechange", preventGestureZoom, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleZoomKeys);
      window.removeEventListener("gesturestart", preventGestureZoom);
      window.removeEventListener("gesturechange", preventGestureZoom);
    };
  }, []);

  const reproducirStream = (vibe) => {
    clearTimeout(retryRef.current);
    errorHandledRef.current = false;
    currentStreamRef.current = vibe.url;
    if (vibe.uiAccent?.hex) setAccentHex(vibe.uiAccent.hex);

    setVibeActiva(vibe.name);
    setIsPlaying(true);
    setEstadoStream("connecting");

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const a = new Audio(vibe.url);
    a.loop = true;
    a.volume = volumen;
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
      a.play()
        .then(() => {
          setIsPlaying(true);
          setEstadoStream("playing");
        })
        .catch(() => setEstadoStream("error"));
    } else {
      a.pause();
      setIsPlaying(false);
      setEstadoStream("idle");
    }
  };

  const cambiarVolumen = (delta) => {
    setVolumen((prev) => Math.min(Math.max(prev + delta, 0), 1));
  };

  const setVolumenDesdePosicion = (clientX) => {
    const rect = volumeTrackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    setVolumen(Math.min(Math.max(ratio, 0), 1));
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!draggingVolumeRef.current) return;
      setVolumenDesdePosicion(e.clientX);
    };

    const handleUp = () => {
      draggingVolumeRef.current = false;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;
    setTareas((prev) => [
      {
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
      },
      ...prev,
    ]);
    setNuevaTarea("");
  };

  const eliminarTarea = (id) => {
    setEliminandoId(id);
    setTimeout(() => {
      setTareas((p) => p.filter((t) => t.id !== id));
      setEliminandoId(null);
    }, 300);
  };

  const cambiarEstado = (id) => {
    setTareas((prev) => prev.map((t) => (
      t.id === id
        ? { ...t, estado: t.estado === "pendiente" ? "terminado" : "pendiente" }
        : t
    )));
  };

  const cambiarPrioridad = (id, prioridad) => {
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, prioridad } : t)));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setTareas((items) => arrayMove(
      items,
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id),
    ));
  };

  const toggleFavorito = (name) => {
    setFavoritos((prev) => {
      const nuevo = prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name];
      localStorage.setItem("favoritos", JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const agregarEstacion = (station) => {
    setVibesVisiblesNombres((prev) => {
      if (prev.includes(station.name)) return prev;
      if (prev.length < maxVibesVisibles) return [...prev, station.name];

      const replaceIndex = [...prev].reverse().findIndex((name) => {
        const esFavorito = favoritos.includes(name);
        const esActiva = name === vibeActiva;
        return !esFavorito && !esActiva;
      });

      const realIndex = replaceIndex === -1 ? prev.length - 1 : prev.length - 1 - replaceIndex;
      const next = [...prev];
      next[realIndex] = station.name;
      return next;
    });
  };

  return (
    <div
      className="app-container text-white"
      style={{
        "--accent-hex": accent.neutral ? "255, 255, 255" : accent.hex,
        "--accent-r": accentR,
        "--accent-g": accentG,
        "--accent-b": accentB,
        "--accent-rgb": `${accentR}, ${accentG}, ${accentB}`,
        "--accent-strength": accent.neutral ? 0 : 1,
      }}
    >
      {fondoTransicion.anterior && (
        <div
          className="app-background app-background-previous"
          style={{ backgroundImage: `url(${fondoTransicion.anterior})` }}
        />
      )}
      <div
        key={fondoTransicion.version}
        className="app-background app-background-current"
        style={{ backgroundImage: `url(${fondoTransicion.actual})` }}
      />

      <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${corriendo
          ? "bg-black/24 backdrop-blur-[5px] backdrop-brightness-80 backdrop-saturate-90"
          : "bg-black/10 backdrop-blur-[2px] backdrop-brightness-90"}`}
      />

        <div className={`panel-left z-[100] rounded-3xl p-4 glass-dark neon-panel
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${corriendo ? "opacity-0 -translate-x-10 lg:-translate-x-20 pointer-events-none" : visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 lg:-translate-x-20"}`}>

          <h2 className="mb-3 text-sm tit">Tareas</h2>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 overflow-auto space-y-2 overflow-hidden">
                {tareas.map((t) => (
                  <TareaItem
                    key={t.id}
                    tarea={t}
                    cambiarEstado={cambiarEstado}
                    eliminar={eliminarTarea}
                    cambiarPrioridad={cambiarPrioridad}
                    eliminando={eliminandoId === t.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-3 flex items-center gap-2 max-sm:flex-col">
            <input
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
              placeholder="Nueva tarea..."
              className="flex-1 rounded-xl bg-white/10 p-2 px-3 text-sm outline-none max-sm:w-full"
            />
            <button
              onClick={agregarTarea}
              disabled={!nuevaTarea.trim()}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-90 max-sm:h-11 max-sm:w-full max-sm:rounded-2xl
                ${nuevaTarea.trim() ? "bg-blue-500 scale-100 opacity-100" : "bg-white/10 scale-90 opacity-50 cursor-not-allowed"}`}
            >
              <i className="fas fa-paper-plane text-sm text-white" />
            </button>
          </div>
        </div>

        <div className={`panel-right z-[50]
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${corriendo ? "opacity-0 translate-x-10 lg:translate-x-20 pointer-events-none" : visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 lg:translate-x-20"}`}>

          <div className="glass-dark neon-panel relative flex flex-1 flex-col overflow-hidden rounded-3xl py-6 px-3">

            <div className="mb-3 flex items-center justify-between gap-3 px-4 max-sm:flex-col max-sm:items-start">
              <div className="flex items-center gap-3 max-sm:flex-wrap">
                <h2 className="text-sm tit">Vibras</h2>
                <button
                  onClick={() => setModalEstacionesAbierto(true)}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-white/80 uppercase transition hover:bg-white/16 hover:text-white"
                >
                  + Agregar
                </button>
              </div>

              {vibeActiva && (
                <div className="flex items-center gap-2 text-[13px] text-white/70">
                  {estadoStream === "connecting" && (<><i className="fa-solid fa-circle-notch animate-spin text-yellow-400" /> Conectando...</>)}
                  {estadoStream === "playing" && (<><span className="animate-pulse text-red-500 drop-shadow-[0_0_6px_red]">•</span> En vivo</>)}
                  {estadoStream === "error" && (intentos < 1
                    ? (<><i className="fa-solid fa-rotate animate-spin text-yellow-400" /> Reconectando...</>)
                    : (<><i className="fa-solid fa-triangle-exclamation text-red-400" /> Sin conexion</>)
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto scroll-invisible px-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {vibesVisibles.map((item) => {
                  const seleccionado = vibeActiva === item.name;
                  const activo = seleccionado && isPlaying;
                  const vibeAccent = item.uiAccent ?? accentPalette[0];

                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        if (vibeActiva === item.name) togglePlay();
                        else {
                          setIntentos(0);
                          reproducirStream(item);
                        }
                      }}
                      className="radio-card group relative h-24 cursor-pointer overflow-hidden rounded-2xl border border-white/10
                        bg-[rgba(20,20,30,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(4,8,18,0.08) 0%, rgba(4,8,18,0.68) 65%, rgba(4,8,18,0.92) 100%), url(${item.image || "/hero.png"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 backdrop-blur-[1.5px] rounded-2xl "/>
                      <div
                        className="absolute inset-0 opacity-60"
                        style={{ background: `linear-gradient(135deg, ${vibeAccent.hex}55 0%, transparent 65%)` }}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorito(item.name);
                        }}
                        className={`absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300
                          ${favoritos.includes(item.name)
                            ? "bg-black/35 backdrop-blur-md scale-100 opacity-100"
                            : "opacity-0 scale-75 translate-y-1 bg-black/25 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"}`}
                      >
                        <i className={`fas fa-star text-[11px] transition-all duration-300
                          ${favoritos.includes(item.name)
                            ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]"
                            : "text-white/70 hover:text-yellow-300"}`} />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="text-[11px] text-white/65">Radio en vivo</p>
                          <span
                            className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/70"
                            style={{ borderColor: `${vibeAccent.hex}88`, backgroundColor: `${vibeAccent.hex}22` }}
                          >
                            Play
                          </span>
                        </div>
                      </div>

                      {activo && (
                        <>
                          <div className="absolute inset-0 rounded-2xl opacity-20" style={{ background: vibeAccent.hex }} />
                          <div
                            className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
                            style={{
                              border: `2px solid ${vibeAccent.hex}`,
                              boxShadow: `0 0 18px ${vibeAccent.hex}`,
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="background-panel glass-dark neon-panel relative flex flex-1 flex-col overflow-hidden rounded-3xl p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="shrink-0 text-sm tit">Fondos</h2>
              <div className="flex items-center gap-2">
                {accentOptions.map((option) => (
                  <button
                    key={option.hex}
                    type="button"
                    aria-label={`Cambiar acento a ${option.name}`}
                    onClick={() => setAccentHex((current) => (
                      option.neutral ? option.hex : current === option.hex ? "transparent" : option.hex
                    ))}
                    className={`color-dot ${accent.hex === option.hex ? "is-active" : ""}`}
                    style={{
                      "--dot-color": option.neutral ? "rgba(255,255,255,0.14)" : option.hex,
                      "--dot-rgb": option.rgb,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto scroll-invisible">
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-2">
                {fondos.map((img, i) => (
                  <div
                    key={img}
                    onClick={() => {
                      setFondoCustom(null);
                      setIndexFondo(i);
                    }}
                    className="background-thumb relative h-18 cursor-pointer rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-black/10 backdrop-blur-[0.5px]" />
                    {fondoActual === img && !fondoCustom && (
                      <>
                        <div className="absolute inset-0 rounded-xl border-2 transition-colors duration-500" style={{ borderColor: `${accentVisualHex}cc` }} />
                        <div className="absolute inset-0 rounded-xl animate-pulse border transition-all duration-500" style={{ borderColor: `${accentVisualHex}55`, boxShadow: `0 0 18px ${accentVisualHex}` }} />
                      </>
                    )}
                  </div>
                ))}

                <label
                  className="background-thumb group relative flex h-18 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border transition-colors duration-500"
                  style={{
                    borderColor: `${accentVisualHex}40`,
                    backgroundImage: fondoCustom ? `url(${fondoCustom})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />
                  <span className="relative z-10 text-lg text-white transition-all duration-300 group-hover:scale-125">
                    <i className={`fas ${fondoCustom ? "fa-pen" : "fa-upload"}`} />
                  </span>
                  <input
                    type="file"
                    className="hidden"
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

      <div className={`volume-hud ${mostrarHudVolumen ? "is-visible" : ""}`}>
        <div
          className="volume-hud-shell"
          onMouseEnter={() => setHoverHudVolumen(true)}
          onMouseLeave={() => setHoverHudVolumen(false)}
        >
          <div className="flex items-center gap-3">
            <div className="volume-icon-shell">
              <i className={`fas ${volumen <= 0.01 ? "fa-volume-xmark" : volumen < 0.5 ? "fa-volume-low" : "fa-volume-high"}`} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Volumen</p>
              <p className="text-sm font-semibold text-white/90">{Math.round(volumen * 100)}%</p>
            </div>
          </div>

          <div
            ref={volumeTrackRef}
            className="volume-track mt-3 w-[220px] max-w-full"
            onPointerDown={(e) => {
              draggingVolumeRef.current = true;
              setVolumenDesdePosicion(e.clientX);
            }}
          >
            <span className="volume-track-bg" />
            <span className="volume-track-fill" style={{ width: `${Math.round(volumen * 100)}%` }} />
            <span className="volume-thumb" style={{ left: `${Math.round(volumen * 100)}%` }} />
          </div>
        </div>
      </div>

      {volumen <= 0.01 && !mostrarHudVolumen && (
        <div className="mute-indicator" aria-label="Volumen silenciado">
          <div className="mute-indicator-shell">
            <i className="fas fa-volume-xmark" />
          </div>
        </div>
      )}

      {(corriendo || vibeActiva) && (
        <div className={`player-floating z-[200] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${corriendo ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95 pointer-events-none"}`}>
          <Reproductor
            vibeActiva={vibeActiva}
            vibes={vibesVisibles}
            onPlay={reproducirStream}
            favoritos={favoritos}
            toggleFavorito={toggleFavorito}
            togglePlay={togglePlay}
            isPlaying={isPlaying}
          />
        </div>
      )}

      <div className={`panel-center flex flex-col items-center justify-center gap-5 sm:gap-6
        transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${corriendo ? "focus-mode" : ""}
        ${!visible ? "opacity-0 scale-90" : corriendo ? "opacity-100 scale-[1.03]" : "opacity-100 scale-100"}`}>

        <ContadorSesiones
          sesion={sesion}
          totalSesiones={totalSesiones}
          onCambiarSesion={cambiarSesion}
          accentRgb={accent.rgb}
          accentStrength={accent.neutral ? 0 : 1}
        />
        <ModoSelector
          modo={modo}
          onCambiarModo={cambiarModo}
          accentRgb={accent.rgb}
          accentStrength={accent.neutral ? 0 : 1}
        />
        <Timer
          segundos={segundos}
          corriendo={corriendo}
          onCambiarTiempo={cambiarTiempo}
          onAjustar={ajustarTiempo}
          onToggle={toggle}
        />

      </div>

      {!corriendo && (
        <div
          className={`info-hints z-[220] px-4 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ fontFamily: "'VT323', monospace" }}
        >
          ← → cambia entre fondos · ↑ ↓ cambia de estacion de radio · Space reproduce o pausa la musica · Ctrl + Scroll ajusta volumen
        </div>
      )}

      <ModalEstaciones
        abierto={modalEstacionesAbierto}
        estacionesRestantes={estacionesRestantes}
        onClose={() => setModalEstacionesAbierto(false)}
        onAgregarEstacion={agregarEstacion}
      />
    </div>
  );
}
