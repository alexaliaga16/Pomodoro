import { useEffect } from "react";

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

    useEffect(() => {
        const handleKey = (e) => {
            if (!actual) return;

            if (e.code === "ArrowUp") {
                const prev = vibes[(index - 1 + vibes.length) % vibes.length];
                onPlay(prev);
            }

            if (e.code === "ArrowDown") {
                const next = vibes[(index + 1) % vibes.length];
                onPlay(next);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [actual, index, vibes, onPlay]);

    return (
        <div className="w-[450px] max-w-full p-2">
            <div className="h-[120px] rounded-3xl overflow-hidden flex relative border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

                <div
                    className="absolute inset-0 z-0 transition-all duration-500"
                    style={{
                        background: actual.color,
                        opacity: 0.18,
                    }}
                />

                <div className="absolute inset-0 backdrop-blur-[16px] z-0" />

                <div
                    className="absolute inset-0 z-0 opacity-30 transition-all duration-500"
                    style={{
                        boxShadow: `inset 0 0 50px ${actual.color}`,
                    }}
                />

                <div
                    key={actual.name + "-img"}
                    className="relative z-10 w-[95px] my-[12px] ml-[12px] rounded-2xl bg-cover bg-center shrink-0 transition-all duration-500"
                    style={{
                        backgroundImage: `url(https://picsum.photos/300?random=${actual.name})`,
                    }}
                />

                <div key={actual.name} className="relative z-10 flex-1 flex flex-col justify-between px-4 py-4 animate-[fadeSlide_.4s_ease]">
                    <div>
                        <h3 className="text-sm font-semibold">
                            {actual.name} Radio
                        </h3>
                        <p className="text-xs text-white/50">
                            Live stream • Focus vibes
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0" style={{ background: actual.color }} />
                            <div
                                className="absolute top-0 right-0 h-full bg-black animate-[liveEdge_2s_ease-in-out_infinite]"
                                style={{
                                    animationPlayState: isPlaying ? "running" : "paused",
                                }}
                            />

                        </div>

                        <button onClick={() => toggleFavorito(actual.name)} className="text-white/60 hover:text-yellow-400 transition">
                            <i className={`fas ${esFavorito ? "fa-star text-yellow-400" : "fa-star"}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-white/70">
                        <button
                            onClick={() => {
                                const prev =
                                    vibes[(index - 1 + vibes.length) % vibes.length];
                                onPlay(prev);
                            }}
                            className="hover:text-white transition">
                            <i className="fas fa-backward"></i>
                        </button>

                        <button onClick={togglePlay} className={`text-white text-lg scale-110 hover:scale-125 transition ${isPlaying ? "animate-pulse" : ""}`}>
                            <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
                        </button>

                        <button
                            onClick={() => { const next = vibes[(index + 1) % vibes.length]; onPlay(next); }} className="hover:text-white transition">
                            <i className="fas fa-forward"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reproductor;