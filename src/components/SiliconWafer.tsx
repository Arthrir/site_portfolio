import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { Sparkles, Scan, Crosshair } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
}

export default function SiliconWafer({ onColorChange }: SiliconWaferProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 150, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 150, damping: 22 });
  const { tr } = useLang();

  // Die sélectionné sur le wafer
  const [selectedDie, setSelectedDie] = useState<{ x: number; y: number }>({ x: 6, y: 6 });
  const [iridAngle, setIridAngle] = useState(135);

  const colors = ["#2340F0", "#E10600", "#10B981", "#D4AF37", "#8B5CF6"];

  const handleDieClick = (gx: number, gy: number) => {
    setSelectedDie({ x: gx, y: gy });
    const col = colors[(gx + gy) % colors.length];
    if (onColorChange) onColorChange(col);
  };

  return (
    <div className="relative w-full max-w-[420px] select-none [perspective:1200px]">
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry }}
        className="group relative aspect-square w-full rounded-full p-4 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.45),0_10px_25px_-5px_rgba(0,0,0,0.2)] border border-black/10 [transform-style:preserve-3d] transition-shadow hover:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.6)] cursor-crosshair"
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
          mx.set(nx);
          my.set(ny);
          setIridAngle(Math.round(Math.atan2(ny, nx) * (180 / Math.PI) + 180));
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        {/* DISQUE DE WAFER EN SILICIUM PUR (AVEC ENCOCHE NOTCH D'ALIGNEMENT EN BAS) */}
        <div className="relative size-full rounded-full bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0A0F1D] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden flex items-center justify-center">

          {/* Encoche industrielle (Alignment Notch à 270° en bas) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#F1F3F5] rounded-t-full border-t border-black/20 z-20 pointer-events-none" />

          {/* Anneau d'exclusion de bordure (Edge Bead Removal 3mm) */}
          <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-3.5 rounded-full border border-dashed border-white/15 pointer-events-none" />

          {/* COUCHE D'INTERFÉRENCE OPTIQUE DIFFRACTANTE (RÉSEAU DE SILICIUM SOUS LITHOGRAPHIE) */}
          <div
            style={{
              background: `linear-gradient(${iridAngle}deg, rgba(236,72,153,0.18) 0%, rgba(59,130,246,0.25) 25%, rgba(16,185,129,0.22) 50%, rgba(245,158,11,0.25) 75%, rgba(139,92,246,0.18) 100%)`,
            }}
            className="pointer-events-none absolute inset-0 mix-blend-screen transition-all duration-150"
          />

          {/* Reflet miroir spéculaire blanc de salle blanche */}
          <motion.div
            style={{
              x: useTransform(mx, [-1, 1], [-80, 80]),
              y: useTransform(my, [-1, 1], [-80, 80]),
            }}
            className="pointer-events-none absolute -inset-24 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.28)_0%,transparent_60%)]"
          />

          {/* MATRICE DE DIES LITHOGRAPHIÉS (WAFER MAP) */}
          <div className="relative z-10 grid grid-cols-11 grid-rows-11 gap-1 size-[84%] p-2">
            {Array.from({ length: 11 }).map((_, gy) =>
              Array.from({ length: 11 }).map((_, gx) => {
                // Masquage circulaire des coins pour épouser le disque du wafer
                const dx = gx - 5;
                const dy = gy - 5;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 5.1) return <div key={`${gx}-${gy}`} className="size-full opacity-0 pointer-events-none" />;

                const isSelected = selectedDie.x === gx && selectedDie.y === gy;
                const isCenter = gx === 5 && gy === 5;

                return (
                  <button
                    key={`${gx}-${gy}`}
                    onClick={() => handleDieClick(gx, gy)}
                    className={`relative size-full rounded-[2px] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-110 z-20 border border-white"
                        : isCenter
                        ? "bg-[#D4AF37]/50 border border-[#D4AF37]/80 hover:bg-[#D4AF37]/80"
                        : "bg-white/[0.08] hover:bg-white/[0.25] border border-white/10"
                    }`}
                  >
                    {/* Micro-lignes de bus internes */}
                    <span className="absolute inset-0.5 border-t border-l border-white/20 opacity-50 block" />
                  </button>
                );
              })
            )}
          </div>

          {/* RÉTICULES & MIRES D'ALIGNEMENT STEPPER ASML AUX 4 AXES */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Lignes de scribe axes X et Y */}
            <div className="w-full h-px bg-white/10" />
            <div className="absolute h-full w-px bg-white/10" />
            <div className="absolute size-32 rounded-full border border-white/15" />
          </div>

          {/* Sérigraphie industrielle fonderie */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.2em] text-white/50 uppercase pointer-events-none">
            WAFER 200mm · SILICON ⟨100⟩ · ASML DUV
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-wider text-white/40 uppercase pointer-events-none">
            MINES ST-ÉTIENNE MICROELECTRONICS LAB
          </div>
        </div>

        {/* Fiche de télémétrie du Die sélectionné */}
        <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-mute px-2">
          <div className="flex items-center gap-1.5">
            <Crosshair className="size-3.5 text-signal" />
            <span className="font-semibold text-ink">
              DIE [{selectedDie.x}, {selectedDie.y}]
            </span>
            <span className="text-mute/60">· YIELD 99.2%</span>
          </div>
          <span className="text-signal font-semibold">RV32I TAPE-OUT</span>
        </div>
      </motion.div>
    </div>
  );
}
