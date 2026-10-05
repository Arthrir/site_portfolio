import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "../i18n";

const DURATION = 15;
const TARGETS = 3;
const PAD = 36;
const BEST_KEY = "vit_best_score";

type Phase = "menu" | "play" | "end";
type Target = { id: number; x: number; y: number; born: number };
type Float = { id: number; x: number; y: number; hue: number };

const RGB =
  "linear-gradient(90deg,#ff2d55,#ff9f0a,#ffd60a,#30d158,#0ad7ff,#5e5ce6,#bf5af2,#ff2d55)";
const CONIC =
  "conic-gradient(from 0deg,#ff2d55,#ff9f0a,#ffd60a,#30d158,#0ad7ff,#5e5ce6,#bf5af2,#ff2d55)";
const HUE_PERIOD = 12; // seconds per full hue cycle (matches CSS animation)
const hueNow = () => ((performance.now() / 1000 / HUE_PERIOD) * 360 + 345) % 360;
const CROSSHAIR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g stroke="#000" stroke-width="3" stroke-linecap="square"><path d="M16 4v7M16 21v7M4 16h7M21 16h7"/></g><g stroke="#fff" stroke-width="1.5" stroke-linecap="square"><path d="M16 4v7M16 21v7M4 16h7M21 16h7"/></g><circle cx="16" cy="16" r="1.5" fill="#fff" stroke="#000" stroke-width="0.75"/></svg>',
)}") 16 16, crosshair`;
const GRID_BG =
  "radial-gradient(ellipse at center, rgba(255,255,255,0.035), transparent 70%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)";
const STYLES = `
@keyframes al-hue { from { filter: hue-rotate(0deg); } to { filter: hue-rotate(360deg); } }
@keyframes al-spin { to { transform: rotate(360deg); } }
.al-hue { animation: al-hue ${HUE_PERIOD}s linear infinite; }
.al-spin { animation: al-spin 2.4s linear infinite; }
@media (prefers-reduced-motion: reduce) { .al-hue, .al-spin { animation: none; } }
`;

function RgbBar({ className = "" }: { className?: string }) {
  return <div className={`al-hue ${className}`} style={{ backgroundImage: RGB }} />;
}

const label = "font-mono text-[10px] uppercase tracking-[0.14em] sm:text-[11px]";

function readBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

export default function AimLab({ onClose }: { onClose: () => void }) {
  const { tr } = useLang();
  const [phase, setPhase] = useState<Phase>("menu");
  const [best, setBest] = useState(readBest);
  const [prevBest, setPrevBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hits, setHits] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [floats, setFloats] = useState<Float[]>([]);
  const arenaRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const hitsRef = useRef(0);

  const score = hits * 100;
  const accuracy = clicks ? Math.round((hits / clicks) * 100) : 100;
  const avgReaction = reactions.length
    ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
    : 0;

  const makeTarget = useCallback((): Target => {
    const r = arenaRef.current?.getBoundingClientRect();
    const w = r && r.width > 0 ? r.width : 600;
    const h = r && r.height > 0 ? r.height : 400;
    return {
      id: ++idRef.current,
      x: Math.round(PAD + Math.random() * Math.max(0, w - PAD * 2)),
      y: Math.round(PAD + Math.random() * Math.max(0, h - PAD * 2)),
      born: performance.now(),
    };
  }, []);

  const start = useCallback(() => {
    hitsRef.current = 0;
    setHits(0);
    setClicks(0);
    setReactions([]);
    setFloats([]);
    setTimeLeft(DURATION);
    setPrevBest(readBest());
    setPhase("play");
  }, []);

  // spawn initial targets once arena is mounted
  useEffect(() => {
    if (phase !== "play") return;
    setTargets(Array.from({ length: TARGETS }, makeTarget));
    const t0 = performance.now();
    const iv = window.setInterval(() => {
      const left = DURATION - (performance.now() - t0) / 1000;
      if (left <= 0) {
        window.clearInterval(iv);
        setTimeLeft(0);
        setTargets([]);
        const final = hitsRef.current * 100;
        const stored = readBest();
        if (final > stored) {
          try {
            localStorage.setItem(BEST_KEY, String(final));
          } catch {
            /* ignore */
          }
          setBest(final);
        }
        setPhase("end");
      } else {
        setTimeLeft(left);
      }
    }, 50);
    return () => window.clearInterval(iv);
  }, [phase, makeTarget]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const hit = (t: Target) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phase !== "play") return;
    hitsRef.current += 1;
    setHits((h) => h + 1);
    setClicks((c) => c + 1);
    setReactions((r) => [...r, performance.now() - t.born]);
    const fid = ++idRef.current;
    setFloats((f) => [...f, { id: fid, x: t.x, y: t.y, hue: hueNow() }]);
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== fid)), 500);
    setTargets((ts) => [...ts.filter((x) => x.id !== t.id), makeTarget()]);
  };

  const miss = () => {
    if (phase === "play") setClicks((c) => c + 1);
  };

  const isRecord = phase === "end" && score > prevBest && score > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[#050507] font-sans text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Aim Lab"
    >
      <style>{STYLES}</style>
      {/* Top bar */}
      <header className="relative flex items-center justify-between px-4 py-3 sm:px-8">
        <span className={`${label} flex items-center gap-2.5 font-semibold text-white`}>
          <span className="al-hue h-2 w-2 rounded-full" style={{ backgroundImage: CONIC }} />
          Aim Lab
          <span className="text-white/30">/</span>
          <span className="text-white/50">Gridshot</span>
        </span>
        <button
          onClick={onClose}
          className={`${label} text-white/60 transition-colors hover:text-white`}
        >
          {tr("Fermer", "Close")}{" "}
          <span className="ml-2 hidden rounded-sm border border-white/20 px-1.5 py-0.5 sm:inline">ESC</span>
        </button>
        <span className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      </header>

      {phase === "menu" && (
        <div
          className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-8"
          style={{ backgroundImage: GRID_BG, backgroundSize: "100% 100%, 48px 48px, 48px 48px" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <div className="mb-8 flex justify-center">
              <span className="al-spin relative block h-14 w-14 rounded-full p-[3px]" style={{ backgroundImage: CONIC }}>
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[#050507]">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </span>
              </span>
            </div>
            <h2 className="text-5xl font-semibold uppercase leading-none tracking-[0.08em] sm:text-6xl">
              Aim Lab
            </h2>
            <p className={`${label} mt-4 text-white/50`}>Gridshot · 15 s drill · {TARGETS} cibles</p>

            <div className="relative mt-12">
              <RgbBar className="absolute -inset-px rounded-md opacity-70 blur-md" />
              <RgbBar className="absolute -inset-px rounded-md" />
              <button
                onClick={start}
                className={`${label} relative w-full rounded-md bg-[#0b0b10] py-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#15151c]`}
              >
                Commencer
              </button>
            </div>

            <div className="mt-10 flex items-baseline justify-between border-t border-white/10 pt-4">
              <span className={`${label} text-white/50`}>Record personnel</span>
              <span className="font-mono text-2xl tabular-nums text-white">
                {best > 0 ? best : "—"}
              </span>
            </div>
            <p className="mt-6 text-sm text-white/50">
              Touchez les cibles le plus vite possible. Les tirs dans le vide comptent contre
              votre précision.
            </p>
            <p className={`${label} mt-10 text-[9px] text-white/25 sm:text-[9px]`}>feat. Team Vitality</p>
          </motion.div>
        </div>
      )}

      {phase !== "menu" && (
        <>
          {/* HUD */}
          <div className="grid grid-cols-4">
            {[
              ["Temps", `${timeLeft.toFixed(1)}`, "s"],
              ["Score", String(score), ""],
              ["Précision", `${accuracy}`, "%"],
              ["Record", String(Math.max(best, prevBest)), ""],
            ].map(([k, v, u], i) => (
              <div key={k} className={`min-w-0 px-3 py-2.5 sm:px-8 sm:py-3 ${i ? "border-l border-white/10" : ""}`}>
                <div className={`${label} truncate text-white/45`}>{k}</div>
                <div className="mt-1 font-mono text-base font-semibold tabular-nums text-white sm:text-2xl">
                  {v}
                  {u && <span className="ml-1 text-[0.6em] font-normal text-white/40">{u}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="h-[2px] bg-white/10">
            <RgbBar className="h-[2px]" />
          </div>

          {/* Arena with RGB edge glow */}
          <div className="relative flex flex-1 p-2 sm:p-4">
            <div className="relative flex flex-1">
              <RgbBar className="pointer-events-none absolute -inset-px rounded-lg opacity-40 blur-md" />
              <RgbBar className="pointer-events-none absolute -inset-px rounded-lg opacity-80" />
              <div
                ref={arenaRef}
                onPointerDown={miss}
                className="relative flex-1 touch-manipulation select-none overflow-hidden rounded-lg bg-[#07070a]"
                style={{
                  cursor: CROSSHAIR,
                  touchAction: "none",
                  backgroundImage: GRID_BG,
                  backgroundSize: "100% 100%, 48px 48px, 48px 48px",
                }}
              >
                <AnimatePresence>
                  {targets.map((t) => (
                    <motion.button
                      key={t.id}
                      aria-label="Cible"
                      onPointerDown={hit(t)}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -ml-7 -mt-7 h-14 w-14 rounded-full"
                      style={{ left: t.x, top: t.y, cursor: CROSSHAIR }}
                    >
                      <span
                        className="al-spin al-hue absolute inset-0 rounded-full"
                        style={{ backgroundImage: CONIC }}
                      />
                      <span className="absolute inset-[3px] flex items-center justify-center rounded-full bg-[#0b0b10] shadow-[inset_0_0_12px_rgba(255,255,255,0.06)]">
                        <span className="absolute inset-[9px] rounded-full border border-white/15" />
                        <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {floats.map((f) => (
                  <motion.span
                    key={`r${f.id}`}
                    initial={{ scale: 0.6, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="pointer-events-none absolute -ml-7 -mt-7 h-14 w-14 rounded-full border-2"
                    style={{
                      left: f.x,
                      top: f.y,
                      borderColor: `hsl(${f.hue} 100% 60%)`,
                      boxShadow: `0 0 18px hsl(${f.hue} 100% 60% / 0.6)`,
                    }}
                  />
                ))}
                {floats.map((f) => (
                  <motion.span
                    key={f.id}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.45 }}
                    className="pointer-events-none absolute -translate-x-1/2 font-mono text-xs font-semibold"
                    style={{ left: f.x, top: f.y - 30, color: `hsl(${f.hue} 100% 70%)` }}
                  >
                    +100
                  </motion.span>
                ))}

                {phase === "end" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm sm:px-6" style={{ cursor: "default" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-[#0b0b10] p-6 sm:p-8"
                    >
                      <RgbBar className="absolute inset-x-0 top-0 h-[2px]" />
                      <div className="flex items-center justify-between">
                        <span className={`${label} text-white/50`}>Résultat</span>
                        {isRecord && (
                          <span className="relative overflow-hidden rounded-sm p-px">
                            <RgbBar className="absolute inset-0" />
                            <span className={`${label} relative block rounded-sm bg-[#0b0b10] px-2 py-1 font-semibold text-white`}>
                              Nouveau record
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="font-mono text-5xl font-semibold tabular-nums leading-none text-white sm:text-6xl">{score}</span>
                        <span className="text-right">
                          <span className={`${label} block text-white/50`}>Record</span>
                          <span className="font-mono text-xl tabular-nums">{best}</span>
                        </span>
                      </div>
                      <dl className="mt-8 grid grid-cols-3 border-t border-white/10">
                        {[
                          ["Cibles", String(hits)],
                          ["Précision", `${accuracy} %`],
                          ["Réaction", avgReaction ? `${avgReaction} ms` : "—"],
                        ].map(([k, v], i) => (
                          <div key={k} className={`pt-3 ${i ? "border-l border-white/10 pl-3" : ""}`}>
                            <dt className={`${label} text-white/50`}>{k}</dt>
                            <dd className="mt-1 font-mono text-lg tabular-nums">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <button
                          onClick={start}
                          className={`${label} rounded-md bg-white py-4 font-semibold text-black transition-colors hover:bg-white/85`}
                        >
                          Rejouer
                        </button>
                        <button
                          onClick={onClose}
                          className={`${label} rounded-md border border-white/20 py-4 transition-colors hover:border-white/60`}
                        >
                          Quitter
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
