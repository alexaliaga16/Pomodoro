function Reproductor({
  vibeActiva,
  vibes,
  onPlay,
  favoritos,
  toggleFavorito,
  togglePlay,
  isPlaying,
}) {
  const actual = vibes.find((v) => v.name === vibeActiva);
  if (!actual) return null;

  const index = vibes.findIndex((v) => v.name === vibeActiva);
  const esFavorito = favoritos?.includes(actual.name);

  return (
    <div className="w-[min(100%,425px)] p-1.5">
      <div className="relative flex h-[120px] overflow-hidden rounded-3xl border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.6)]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(var(--accent-rgb), calc(0.34 * var(--accent-strength))) 0%, rgba(10,14,20,0.28) 45%, rgba(10,14,20,0.82) 100%), url(${actual.image || "/hero.png"})`,
          }}
        />

        <div className="absolute inset-0 z-0 backdrop-blur-[14px]" />

        <div
          className="absolute inset-0 z-0 opacity-35 transition-all duration-500"
          style={{ boxShadow: `inset 0 0 50px rgba(var(--accent-rgb), calc(0.42 * var(--accent-strength)))` }}
        />

        <div className="relative z-10 flex flex-1 items-center gap-4 px-4 py-4 animate-[fadeSlide_.4s_ease]">
          <div
            className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-white/14 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(var(--accent-rgb), calc(0.34 * var(--accent-strength))) 0%, rgba(10,14,20,0.18) 100%), url(${actual.image || "/hero.png"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="h-full w-full bg-black/10 backdrop-blur-[0.5px]" />
          </div>

          <div className="flex flex-1 flex-col justify-between self-stretch">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{actual.name}</h3>
                <p className="text-[11px] text-white/55">Live stream - Focus vibes</p>
              </div>

              <button onClick={() => toggleFavorito(actual.name)} className="text-xs text-white/60 transition hover:text-yellow-400">
                <i className={`fas ${esFavorito ? "fa-star text-yellow-400" : "fa-star"}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-0" style={{ background: `rgb(var(--accent-rgb))` }} />
                <div
                  className="absolute top-0 right-0 h-full bg-black animate-[liveEdge_2s_ease-in-out_infinite]"
                  style={{ animationPlayState: isPlaying ? "running" : "paused" }}
                />
              </div>
              <span className="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/70" style={{ borderColor: `rgba(var(--accent-rgb), 0.55)` }}>
                Live
              </span>
            </div>

            <div className="flex items-center justify-center gap-5 text-base text-white/70">
              <button
                onClick={() => {
                  const prev = vibes[(index - 1 + vibes.length) % vibes.length];
                  onPlay(prev);
                }}
                className="transition hover:text-white"
              >
                <i className="fas fa-backward" />
              </button>

              <button
                onClick={togglePlay}
                className={`scale-105 text-white transition hover:scale-115 ${isPlaying ? "animate-pulse" : ""}`}
              >
                <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`} />
              </button>

              <button
                onClick={() => {
                  const next = vibes[(index + 1) % vibes.length];
                  onPlay(next);
                }}
                className="transition hover:text-white"
              >
                <i className="fas fa-forward" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reproductor;
