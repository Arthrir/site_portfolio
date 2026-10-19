import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Cpu } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
}

const GRID_SIZE = 32; // 32x32 = 1024 slots -> ~720 micro-dies réels sur le disque
const RADIUS = 15.2;
const CENTER = 15.5;

export default function SiliconWafer({ onColorChange }: SiliconWaferProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 180, damping: 24 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 180, damping: 24 });

  // Die sélectionné sur le wafer (par défaut au centre)
  const [selectedDie, setSelectedDie] = useState<{ x: number; y: number }>({ x: 16, y: 16 });
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
        className="group relative aspect-square w-full rounded-full [transform-style:preserve-3d] cursor-crosshair"
        onPointerMove={(e) => {
          if (!ref.current) return;
          const r = ref.current.getBoundingClientRect();
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
        {/* DISQUE DU WAFER : CERCLE PARFAIT (Aspect 1:1, biseau métallique, sans déformation) */}
        <div className="relative size-full rounded-full bg-gradient-to-tr from-[#05080F] via-[#101826] to-[#080B12] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55),0_10px_30px_-10px_rgba(0,0,0,0.35),inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-4px_12px_rgba(0,0,0,0.95)] border border-white/20 overflow-hidden flex items-center justify-center">

          {/* Anneau d'exclusion de bordure (Edge Bead Removal 3mm) - Gravure concentrique */}
          <div className="pointer-events-none absolute inset-2.5 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute inset-4 rounded-full border border-dashed border-white/15" />

          {/* Micro-repère d'encoche SEMI (Notch à 270° au bas du wafer) */}
          <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/90 rounded-t-sm border-t border-white/30 z-20" />

          {/* COUCHE D'INTERFÉRENCE OPTIQUE DIFFRACTANTE (Arc-en-ciel silicium qui tourne) */}
          <div
            style={{
              background: `linear-gradient(${iridAngle}deg, rgba(236,72,153,0.22) 0%, rgba(59,130,246,0.28) 25%, rgba(16,185,129,0.22) 50%, rgba(245,158,11,0.26) 75%, rgba(139,92,246,0.22) 100%)`,
            }}
            className="pointer-events-none absolute inset-0 mix-blend-screen transition-all duration-150"
          />

          {/* Reflet miroir spéculaire blanc de salle blanche qui suit le curseur */}
          <motion.div
            style={{
              x: useTransform(mx, [-1, 1], [-70, 70]),
              y: useTransform(my, [-1, 1], [-70, 70]),
            }}
            className="pointer-events-none absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.26)_0%,transparent_55%)]"
          />

          {/* RÉTICULES & AXES DE SCRIBE DU STEPPER LITHOGRAPHIQUE */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-white/10" />
            <div className="absolute h-full w-px bg-white/10" />
            <div className="absolute size-24 rounded-full border border-white/15" />
          </div>

          {/* MATRICE DENSE DE ~720 MICRO-DIES (32x32 = PLEIN DE TOUT PETITS CARRÉS DE SILICIUM) */}
          <div
            className="relative z-10 size-[84%] p-1"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gap: "1px",
            }}
          >
            {Array.from({ length: GRID_SIZE }).map((_, gy) =>
              Array.from({ length: GRID_SIZE }).map((_, gx) => {
                const dx = gx - CENTER;
                const dy = gy - CENTER;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > RADIUS) {
                  return <div key={`${gx}-${gy}`} className="size-full opacity-0 pointer-events-none" />;
                }

                const isSelected = selectedDie.x === gx && selectedDie.y === gy;
                const isCenter = (gx === 15 || gx === 16) && (gy === 15 || gy === 16);

                return (
                  <button
                    key={`${gx}-${gy}`}
                    onClick={() => handleDieClick(gx, gy)}
                    title={`Micro-Die [${gx}, ${gy}]`}
                    className={`relative size-full rounded-[0.5px] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white shadow-[0_0_10px_#FFFFFF] scale-150 z-30 border border-white"
                        : isCenter
                        ? "bg-[#D4AF37]/75 border border-[#D4AF37] hover:bg-[#D4AF37]"
                        : "bg-white/[0.08] hover:bg-white/[0.45] border border-white/10"
                    }`}
                  />
                );
              })
            )}
          </div>

          {/* Sérigraphie industrielle fonderie ASML / Mines */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[6.5px] tracking-[0.24em] text-white/50 uppercase">
            WAFER 200mm · SILICON ⟨100⟩ · ASML DUV · 720+ DIES
          </div>
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[6px] tracking-wider text-white/40 uppercase">
            MINES ST-ÉTIENNE MICROELECTRONICS LAB
          </div>
        </div>

        {/* Fiche de télémétrie du Micro-Die sélectionné */}
        <div className="mt-3.5 flex items-center justify-between font-mono text-[10.5px] text-mute px-2">
          <div className="flex items-center gap-1.5">
            <Crosshair className="size-3.5 text-signal" />
            <span className="font-semibold text-ink">
              DIE [{selectedDie.x}, {selectedDie.y}]
            </span>
            <span className="text-mute/60">· 720+ MICRO-DIES · YIELD 99.6%</span>
          </div>
          <div className="flex items-center gap-1 text-signal font-semibold">
            <Cpu className="size-3" />
            <span>RV32I TAPE-OUT</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
