import { useState, useEffect } from "react";

const DEFAULTS = {
  focus:      25 * 60,
  shortBreak:  5 * 60,
  longBreak:  15 * 60,
};

export function usePomodoro() {
  const [modo, setModo]                   = useState("focus");
  const [tiempoGuardado, setTiempoGuardado] = useState(DEFAULTS);
  const [tiempoDinamico, setTiempoDinamico] = useState(DEFAULTS);
  const [corriendo, setCorriendo]         = useState(false);
  const [sesion, setSesion]               = useState(1);
  const [totalSesiones, setTotalSesiones] = useState(4);

  // comienzo es el Date.now() cuando arrancó el timer actual
  const [comienzo, setComienzo] = useState(null);

  const segundos = tiempoDinamico[modo];

  /* ─── Tick del timer ─── */
  useEffect(() => {
    if (!corriendo || !comienzo) return;

    const id = setInterval(() => {
      const transcurridos = Math.floor((Date.now() - comienzo) / 1000);
      const restantes     = tiempoGuardado[modo] - transcurridos;
      setTiempoDinamico((t) => ({ ...t, [modo]: restantes }));
    }, 200);

    return () => clearInterval(id);
  }, [corriendo, modo, comienzo]);

  /* ─── Transiciones automáticas ─── */
  useEffect(() => {
    if (segundos > 0 || !corriendo) return;

    const ahora = Date.now();

    if (modo === "focus") {
      if (sesion < totalSesiones) {
        // focus → shortBreak
        setModo("shortBreak");
        setSesion((s) => s + 1);
        setComienzo(ahora);                          // ← FIX: reset comienzo
        setTiempoDinamico((t) => ({
          ...t,
          shortBreak: tiempoGuardado.shortBreak,
          focus:      tiempoGuardado.focus,
        }));
      } else {
        // última sesión → longBreak
        setModo("longBreak");
        setComienzo(ahora);                          // ← FIX: reset comienzo
        setTiempoDinamico((t) => ({
          ...t,
          longBreak: tiempoGuardado.longBreak,
          focus:     tiempoGuardado.focus,
        }));
      }
    } else if (modo === "shortBreak") {
      // shortBreak → focus
      setModo("focus");
      setComienzo(ahora);                            // ← FIX: reset comienzo
      setTiempoDinamico((t) => ({
        ...t,
        focus:      tiempoGuardado.focus,
        shortBreak: tiempoGuardado.shortBreak,
      }));
    } else if (modo === "longBreak") {
      // longBreak → detener, resetear ciclo
      setModo("focus");
      setSesion(1);
      setCorriendo(false);
      setComienzo(null);
      setTiempoDinamico(tiempoGuardado);
    }
  }, [segundos, corriendo]);

  /* ─── Acciones públicas ─── */
  const toggle = () => {
    setCorriendo((prev) => {
      const nuevoEstado = !prev;
      setComienzo(nuevoEstado ? Date.now() : null);
      return nuevoEstado;
    });
  };

  const cambiarModo = (nuevoModo) => {
    setCorriendo(false);
    setComienzo(null);
    setModo(nuevoModo);
    setTiempoDinamico((t) => ({ ...t, [nuevoModo]: tiempoGuardado[nuevoModo] }));
  };

  const cambiarTiempo = (minutos) => {
    const secs = minutos * 60;
    setTiempoGuardado((t) => ({ ...t, [modo]: secs }));
    setTiempoDinamico((t) => ({ ...t, [modo]: secs }));
  };

  const ajustarTiempo = (direccion) => {
    setTiempoGuardado((t) => {
      const nuevo   = t[modo] + direccion * 5 * 60;
      const limitado = Math.min(Math.max(nuevo, 60), 999 * 60);
      return { ...t, [modo]: limitado };
    });
    setTiempoDinamico((t) => {
      const nuevo    = t[modo] + direccion * 5 * 60;
      const limitado = Math.min(Math.max(nuevo, 60), 999 * 60);
      return { ...t, [modo]: limitado };
    });
  };

  const cambiarSesion = (total) => {
    setTotalSesiones(Math.min(Math.max(total, 1), 15));
  };

  return {
    modo, cambiarModo,
    segundos,
    corriendo, toggle,
    sesion, totalSesiones, cambiarSesion,
    cambiarTiempo, ajustarTiempo,
  };
}
