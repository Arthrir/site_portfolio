import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { motion } from "motion/react";
import { useLang } from "../i18n";

import { buildTrack, curvature, cornerRuns, drawKerb, bandPath, normals, offsetPath, type Pt } from "./f1/track";
import { TRACKS, type TrackId } from "./f1/tracks";

type Ctrl = "p1" | "p2" | "ai";

const W = 800;
const H = 450;

function distToTrack(px: number, py: number, pts: Pt[]) {
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2)) : 0;
    const d = Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
    if (d < min) min = d;
  }
  return min;
}

const getBest = (id: TrackId) => {
  try {
    const v = localStorage.getItem("f1_best_lap_" + id);
    return v ? parseFloat(v) : null;
  } catch {
    return null;
  }
};
const setBest = (id: TrackId, t: number) => {
  try {
    localStorage.setItem("f1_best_lap_" + id, t.toFixed(2));
  } catch {
    /* ignore */
  }
};

class Car {
  x: number; y: number; angle: number; speed = 0;
  color: string; ctrl: Ctrl;
  maxSpeed: number; accel = 0.045; turn = 0.042; friction = 0.975;
  target = 4; aiVar = 0.9 + Math.random() * 0.15;
  lapStart: number | null = null; best: number | null = null; lastCheck = 0; laps = 0;
  constructor(x: number, y: number, a: number, color: string, ctrl: Ctrl) {
    this.x = x; this.y = y; this.angle = a; this.color = color; this.ctrl = ctrl;
    this.maxSpeed = ctrl === "ai" ? 1.7 : 2.05;
  }
}

type Keys = Record<string, boolean>;

export default function F1({ onClose }: { onClose: () => void }) {
  const { tr } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trackId, setTrackId] = useState<TrackId>("monza");
  const [p2, setP2] = useState(false);
  const [lights, setLights] = useState(0); // 0-5 lit, -1 = go
  const [phase, setPhase] = useState<"lights" | "race" | "jump">("lights");
  const [reaction, setReaction] = useState<number | null>(null);
  const [t1, setT1] = useState("0.00");
  const [t2, setT2] = useState("0.00");
  const [best, setBestState] = useState<number | null>(getBest("monza"));
  const [runId, setRunId] = useState(0);

  const keys = useRef<Keys>({});
  const p2Ref = useRef(false);
  const phaseRef = useRef(phase);
  const goAt = useRef(0);
  phaseRef.current = phase;
  const reactionPending = useRef(true);

  const gasPressed = () => {
    if (phaseRef.current === "race" && goAt.current && reactionPending.current) {
      reactionPending.current = false;
      setReaction((performance.now() - goAt.current) / 1000);
    }
    if (phaseRef.current === "lights") setPhase("jump");
  };
  const touch = (key: string, on: boolean) => {
    keys.current[key] = on;
    if (on && key === "ArrowUp") gasPressed();
  };

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      keys.current[k] = true;
      if (["z", "q", "s", "d", "w", "a"].includes(k) && !p2Ref.current) {
        p2Ref.current = true;
        setP2(true);
      }
      if (k === "ArrowUp" || k === "z" || k === "w") gasPressed();
      if (k === "r" || k === "Enter") setRunId((r) => r + 1);
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      keys.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.body.style.overflow = prev;
    };
  }, [onClose]);


  // Start light sequence
  useEffect(() => {
    setPhase("lights");
    setLights(0);
    setReaction(null);
    reactionPending.current = true;
    goAt.current = 0;
    const timers: number[] = [];
    for (let i = 1; i <= 5; i++) timers.push(window.setTimeout(() => setLights(i), 700 * i));
    const out = 700 * 5 + 600 + Math.random() * 1800;
    timers.push(
      window.setTimeout(() => {
        if (phaseRef.current === "jump") return;
        setLights(-1);
        goAt.current = performance.now();
        setPhase("race");
      }, out),
    );
    return () => timers.forEach(clearTimeout);
  }, [trackId, runId]);

  // Jump start: release after penalty
  useEffect(() => {
    if (phase !== "jump") return;
    const t = window.setTimeout(() => {
      setLights(-1);
      goAt.current = performance.now();
      reactionPending.current = false;
      setPhase("race");
    }, 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const signal = getComputedStyle(document.documentElement).getPropertyValue("--color-signal").trim() || "#FF4D00";
    const def = TRACKS[trackId];
    const pts = buildTrack(def.cp, 4);
    const n = pts.length;
    const nor = normals(pts);
    const curv = curvature(pts, 5);
    const aiPts = pts.filter((_, i) => i % 10 === 0);
    const tw = def.width;
    setBestState(getBest(trackId));

    const a0 = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    const slot = (back: number, lat: number) => ({
      x: pts[0].x - Math.cos(a0) * back + Math.cos(a0 + Math.PI / 2) * lat,
      y: pts[0].y - Math.sin(a0) * back + Math.sin(a0 + Math.PI / 2) * lat,
    });
    const s = [slot(18, -16), slot(50, 16), slot(82, -16), slot(114, 16)];
    const cars = [
      new Car(s[0].x, s[0].y, a0, signal, "p1"),
      new Car(s[1].x, s[1].y, a0, "#2F6BFF", p2Ref.current ? "p2" : "ai"),
      new Car(s[2].x, s[2].y, a0, "#F4F2EC", "ai"),
      new Car(s[3].x, s[3].y, a0, "#8A8780", "ai"),
    ];
    cars[1].target = 3; cars[2].target = 2; cars[3].target = 1;

    // Pre-render static track layer
    const bg = document.createElement("canvas");
    bg.width = W * dpr;
    bg.height = H * dpr;
    const b = bg.getContext("2d")!;
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    // grass: flat muted green with very subtle mowing stripes
    b.fillStyle = "#5E7A4E";
    b.fillRect(0, 0, W, H);
    b.fillStyle = "rgba(255,255,255,0.035)";
    for (let x = 0; x < W; x += 56) b.fillRect(x, 0, 28, H);
    b.lineCap = "round";
    b.lineJoin = "round";
    const runs = cornerRuns(curv, 1 / 150, 8);
    // gravel traps: outside of the biggest braking corners only
    const big = runs
      .map((r) => {
        let s = 0;
        for (let k = 0; k < r.len; k++) s += Math.abs(curv[(r.start + k) % n]);
        return { r, s };
      })
      .sort((a, c) => c.s - a.s)
      .slice(0, 3);
    for (const { r } of big) {
      const ext = Math.floor(r.len * 0.25);
      const g = { start: (r.start - ext + n) % n, len: r.len + ext * 2, side: r.side };
      b.save();
      bandPath(b, pts, nor, g, tw / 2, 30);
      b.fillStyle = "#D9C9A3";
      b.fill();
      b.clip();
      let seed = g.start * 9301 + 49297;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let k = 0; k < g.len * 14; k++) {
        const i = (g.start + Math.floor(rnd() * g.len)) % n;
        const off = (tw / 2 + rnd() * 32) * g.side;
        const x = pts[i].x + nor[i].x * off + (rnd() - 0.5) * 4, y = pts[i].y + nor[i].y * off + (rnd() - 0.5) * 4;
        b.fillStyle = rnd() < 0.5 ? "rgba(120,100,70,0.28)" : "rgba(255,250,235,0.45)";
        b.fillRect(x, y, 1, 1);
      }
      b.restore();
    }
    // asphalt
    offsetPath(b, pts, nor, 0);
    b.lineWidth = tw;
    b.strokeStyle = "#262624";
    b.stroke();
    // thin white edge lines
    b.lineWidth = 1.5;
    b.strokeStyle = "rgba(244,242,236,0.85)";
    offsetPath(b, pts, nor, tw / 2 - 3);
    b.stroke();
    offsetPath(b, pts, nor, -(tw / 2 - 3));
    b.stroke();

    // Kerbs straddle the white edge line (half on asphalt edge, half outside): outside of corners + inside apex
    const RED = "#C8352B", WHITE = "#F4F2EC";
    const KW = 6, K0 = tw / 2 - 3;
    for (const r of runs) {
      drawKerb(b, pts, nor, r, K0, KW, 9, [RED, WHITE]);
      const cut = Math.floor(r.len * 0.3);
      const apex = { start: (r.start + cut) % n, len: r.len - cut * 2, side: (r.side * -1) as 1 | -1 };
      if (apex.len >= 6) drawKerb(b, pts, nor, apex, K0, KW, 9, [RED, WHITE]);
    }

    // Start/finish checker, perpendicular to the track
    b.save();
    b.translate(pts[0].x, pts[0].y);
    b.rotate(a0);
    const sq = 4;
    const rows = Math.floor((tw - 6) / sq);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        b.fillStyle = (r + c) % 2 ? "#121211" : "#F4F2EC";
        b.fillRect(-sq + c * sq, -((rows * sq) / 2) + r * sq, sq, sq);
      }
    }
    b.restore();
    // grid slots
    b.strokeStyle = "rgba(244,242,236,0.5)";
    b.lineWidth = 1.2;
    for (const p of s) {
      b.save();
      b.translate(p.x, p.y);
      b.rotate(a0);
      b.beginPath();
      b.moveTo(18, -9); b.lineTo(20, -9); b.lineTo(20, 9); b.lineTo(18, 9);
      b.stroke();
      b.restore();
    }

    const drawCar = (c: Car) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.save();
      ctx.translate(1.5, 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.roundRect(-17, -9, 34, 18, 4);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#111";
      ctx.fillRect(5, -9.5, 7, 3.6);
      ctx.fillRect(5, 5.9, 7, 3.6);
      ctx.fillRect(-13, -10.5, 8, 4.4);
      ctx.fillRect(-13, 6.1, 8, 4.4);
      ctx.fillRect(-17, -9, 3, 18);
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.moveTo(17, 0); ctx.lineTo(12, -2.2); ctx.lineTo(4, -2.8); ctx.lineTo(2, -5.5); ctx.lineTo(-7, -5.8);
      ctx.lineTo(-11, -3); ctx.lineTo(-14, -1.8); ctx.lineTo(-14, 1.8); ctx.lineTo(-11, 3); ctx.lineTo(-7, 5.8);
      ctx.lineTo(2, 5.5); ctx.lineTo(4, 2.8); ctx.lineTo(12, 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(14, -8.5, 3, 17);
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(1.5, 0, 3.8, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.ctrl === "p1" ? "#F4F2EC" : c.ctrl === "p2" ? "#9DB8FF" : "#888";
      ctx.beginPath();
      ctx.arc(1.2, 0, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const update = (c: Car, now: number) => {
      const k = keys.current;
      if (c.ctrl === "p2" || (c === cars[1] && p2Ref.current)) c.ctrl = "p2";
      const steer = (left: boolean, right: boolean) => {
        if (c.speed === 0) return;
        const flip = c.speed > 0 ? 1 : -1;
        const f = Math.min(Math.abs(c.speed) / 1.6, 1);
        const r = c.turn * (0.4 + 0.6 * f);
        if (left) c.angle -= r * flip;
        if (right) c.angle += r * flip;
      };
      if (c.ctrl === "p1") {
        if (k.ArrowUp) c.speed += c.accel;
        if (k.ArrowDown) c.speed -= c.accel * 1.5;
        steer(!!k.ArrowLeft, !!k.ArrowRight);
      } else if (c.ctrl === "p2") {
        if (k.z || k.w) c.speed += c.accel;
        if (k.s) c.speed -= c.accel * 1.5;
        steer(!!(k.q || k.a), !!k.d);
      } else {
        const an = aiPts.length;
        let t = aiPts[c.target % an];
        let guard = 0;
        while (Math.hypot(t.x - c.x, t.y - c.y) < 36 && guard++ < an) {
          c.target = (c.target + 1) % an;
          t = aiPts[c.target];
        }
        let d = Math.atan2(t.y - c.y, t.x - c.x) - c.angle;
        while (d < -Math.PI) d += Math.PI * 2;
        while (d > Math.PI) d -= Math.PI * 2;
        c.angle += Math.sign(d) * Math.min(Math.abs(d), c.turn * 0.95);
        if (Math.abs(d) > 0.45) c.speed *= 0.985;
        else c.speed += c.accel * 0.75 * c.aiVar;
      }
      c.speed *= c.friction;
      c.speed = Math.max(-0.9, Math.min(c.maxSpeed, c.speed));
      c.x += Math.cos(c.angle) * c.speed;
      c.y += Math.sin(c.angle) * c.speed;
      c.x = Math.max(8, Math.min(W - 8, c.x));
      c.y = Math.max(8, Math.min(H - 8, c.y));
      if (distToTrack(c.x, c.y, pts) > tw / 2 + 4) {
        c.speed *= 0.92;
        if (c.speed > 1.1) c.speed = 1.1;
      }
      if (Math.hypot(c.x - pts[0].x, c.y - pts[0].y) < tw * 0.6 && now - c.lastCheck > 2800) {
        if (c.lapStart !== null) {
          const lap = (now - c.lapStart) / 1000;
          if (lap > 3) {
            c.laps++;
            if (!c.best || lap < c.best) c.best = lap;
            if (c.ctrl === "p1") {
              const saved = getBest(trackId);
              if (!saved || lap < saved) {
                setBest(trackId, lap);
                setBestState(lap);
              }
            }
            c.lapStart = now;
          }
        } else c.lapStart = now;
        c.lastCheck = now;
      }
    };

    let raf = 0;
    let frame = 0;
    const loop = () => {
      const now = performance.now();
      ctx.drawImage(bg, 0, 0, W, H);
      const racing = phaseRef.current === "race";
      for (const c of cars) {
        if (racing) update(c, now);
        drawCar(c);
      }
      if (++frame % 6 === 0) {
        setT1(cars[0].lapStart ? ((now - cars[0].lapStart) / 1000).toFixed(2) : "0.00");
        setT2(cars[1].lapStart ? ((now - cars[1].lapStart) / 1000).toFixed(2) : "0.00");
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [trackId, runId]);

  const fmt = (v: number | null) => (v ? v.toFixed(2) : "--");

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-ink text-paper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Grand Prix"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/10 px-5 py-4 md:px-8">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Easter egg</span>
          <h2 className="font-sans text-xl font-semibold tracking-tight md:text-2xl">Grand Prix</h2>
        </div>
        <nav className="flex gap-1 font-mono text-xs uppercase tracking-wider" aria-label="Circuit">
          {(Object.keys(TRACKS) as TrackId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTrackId(id)}
              className={`px-3 py-1.5 transition-colors ${id === trackId ? "bg-signal text-paper" : "text-paper/60 hover:text-paper"}`}
            >
              {TRACKS[id].name}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs uppercase tracking-[0.15em] text-paper/60 transition-colors hover:text-signal"
        >
          {tr("Fermer", "Close")}&nbsp;&nbsp;ESC
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-4 md:p-8">
        <div className="relative w-full max-w-[1100px]" style={{ aspectRatio: `${W} / ${H}` }}>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          <div className="absolute left-3 top-3 space-y-1 bg-ink/70 px-3 py-2 font-mono text-xs tabular-nums">
            <div><span className="mr-2 text-signal">J1</span>Tour {t1}s</div>
            {p2 && <div><span className="mr-2 text-[#9DB8FF]">J2</span>Tour {t2}s</div>}
          </div>
          <div className="absolute right-3 top-3 bg-ink/70 px-3 py-2 font-mono text-xs tabular-nums">
            <span className="text-paper/50">{TRACKS[trackId].name.toUpperCase()} / Record </span>
            {fmt(best)}s
          </div>

          {(phase === "lights" || phase === "jump") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-ink/40">
              <div className="flex gap-3 bg-ink px-5 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <span className="h-7 w-7 rounded-full bg-paper/10" />
                    <span
                      className="h-7 w-7 rounded-full transition-colors duration-75"
                      style={{ background: lights >= i ? "#E10600" : "rgba(239,237,231,0.1)", boxShadow: lights >= i ? "0 0 14px #E10600" : "none" }}
                    />
                  </div>
                ))}
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/80">
                {phase === "jump" ? "Faux départ. Pénalité de 2 secondes." : "Attendez l'extinction des feux"}
              </p>
            </div>
          )}
          {phase === "race" && reaction !== null && (
            <motion.div
              key={reaction}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink/80 px-3 py-2 font-mono text-xs"
            >
              Réaction <span className="text-signal">{reaction.toFixed(3)}s</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="hidden select-none items-stretch justify-between gap-3 px-4 pb-4 [@media(pointer:coarse)]:flex" style={{ touchAction: "none" }}>
        {[
          [["ArrowLeft", "Gauche", "M15 6l-6 6 6 6"], ["ArrowRight", "Droite", "M9 6l6 6-6 6"]],
          [["ArrowDown", "Frein", "M6 12h12"], ["ArrowUp", "Gaz", "M6 15l6-6 6 6"]],
        ].map((group, gi) => (
          <div key={gi} className="flex gap-2">
            {group.map(([key, label, d]) => {
              const on = (e: RPE) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); touch(key, true); };
              const off = () => touch(key, false);
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  onPointerDown={on}
                  onPointerUp={off}
                  onPointerCancel={off}
                  onLostPointerCapture={off}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`flex h-16 w-20 flex-col items-center justify-center gap-1 border border-paper/15 font-mono text-[10px] uppercase tracking-wider text-paper/70 active:bg-paper/10 ${key === "ArrowUp" ? "border-signal/60 text-signal" : ""}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={d} /></svg>
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-paper/10 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-paper/50 md:px-8">
        <span>{p2 ? "2 joueurs : J1 flèches / J2 ZQSD ou WASD" : "J1 : flèches. Appuyez sur ZQSD ou WASD pour jouer à deux"}</span>
        <span>R : nouveau départ</span>
      </footer>
    </motion.div>
  );
}
