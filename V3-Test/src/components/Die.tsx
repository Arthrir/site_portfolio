import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/* ---------------- Chip die (hero visual) ----------------
 * Technical CAD/SoC floorplan visualization of a custom silicon die.
 * Microelectronics architecture: Cores, caches, buses, and high-speed I/O.
 * -------------------------------------------------------------------------- */
export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 150, damping: 20 });

  return (
    <div className="relative w-full max-w-[420px] pb-6 [perspective:1200px]">
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative aspect-square w-full [transform-style:preserve-3d]"
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
          my.set(((e.clientY - r.top) / r.height) * 2 - 1);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible select-none">
          {/* Substrate */}
          <rect width="400" height="400" rx="24" fill="#0A0A0A" className="stroke-ink/30" strokeWidth="2" />

          {/* Grid */}
          <g className="stroke-ink/5" strokeWidth="1">
            {Array.from({ length: 19 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={(i + 1) * 20} x2="400" y2={(i + 1) * 20} />
            ))}
            {Array.from({ length: 19 }).map((_, i) => (
              <line key={`v-${i}`} x1={(i + 1) * 20} y1="0" x2={(i + 1) * 20} y2="400" />
            ))}
          </g>

          {/* Peripheral Pads */}
          {Array.from({ length: 16 }).map((_, i) => (
            <g key={`pads-${i}`} fill="#333">
              <rect x={20 + i * 23} y="8" width="12" height="6" rx="2" />
              <rect x={20 + i * 23} y="386" width="12" height="6" rx="2" />
              <rect y={20 + i * 23} x="8" height="12" width="6" rx="2" />
              <rect y={20 + i * 23} x="386" height="12" width="6" rx="2" />
            </g>
          ))}

          {/* L3 Cache (24MB SRAM) */}
          <rect x="40" y="40" width="320" height="80" rx="4" fill="transparent" className="stroke-ink/20" strokeWidth="1" strokeDasharray="4 4" />
          <text x="200" y="85" textAnchor="middle" fill="#666" fontSize="13" fontFamily="monospace" letterSpacing="2">L3_CACHE_24MB</text>

          {/* Core 0 & Core 1 */}
          <rect x="40" y="140" width="150" height="140" rx="4" fill="#111" className="stroke-ink/40" strokeWidth="1" />
          <text x="115" y="170" textAnchor="middle" fill="#888" fontSize="12" fontFamily="monospace">CORE_0 (RV32I)</text>
          <rect x="55" y="190" width="50" height="70" fill="#1A1A1A" />
          <text x="80" y="230" textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">ALU</text>
          <rect x="115" y="190" width="60" height="30" fill="#1A1A1A" />
          <text x="145" y="210" textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">L1-I</text>
          <rect x="115" y="230" width="60" height="30" fill="#1A1A1A" />
          <text x="145" y="250" textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">L1-D</text>

          <rect x="210" y="140" width="150" height="140" rx="4" fill="#111" className="stroke-ink/40" strokeWidth="1" />
          <text x="285" y="170" textAnchor="middle" fill="#888" fontSize="12" fontFamily="monospace">CORE_1 (RV32I)</text>
          <rect x="225" y="190" width="50" height="70" fill="#1A1A1A" />
          <text x="250" y="230" textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">ALU</text>
          <rect x="285" y="190" width="60" height="30" fill="#1A1A1A" />
          <text x="315" y="210" textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">L1-I</text>
          <rect x="285" y="230" width="60" height="30" fill="#1A1A1A" />
          <text x="315" y="250" textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">L1-D</text>

          {/* Memory Controller & PCIe */}
          <rect x="40" y="300" width="120" height="60" rx="4" fill="transparent" className="stroke-ink/30" strokeWidth="1" />
          <text x="100" y="335" textAnchor="middle" fill="#777" fontSize="11" fontFamily="monospace">DDR5_CTRL</text>
          <rect x="180" y="300" width="180" height="60" rx="4" fill="transparent" className="stroke-ink/30" strokeWidth="1" />
          <text x="270" y="335" textAnchor="middle" fill="#777" fontSize="11" fontFamily="monospace">PCIe_GEN5_PHY</text>

          {/* Coherent Ring Bus */}
          <g className="stroke-signal/50" strokeWidth="2" fill="none">
            <path d="M 80,130 L 320,130" />
            <path d="M 115,130 L 115,140" className="stroke-signal/80" strokeWidth="1" />
            <path d="M 285,130 L 285,140" className="stroke-signal/80" strokeWidth="1" />
            <path d="M 140,130 L 140,140" className="stroke-signal/80" strokeWidth="1" />
            <path d="M 260,130 L 260,140" className="stroke-signal/80" strokeWidth="1" />
          </g>
          <g fill="#DC2626">
            <circle cx="115" cy="130" r="2" />
            <circle cx="285" cy="130" r="2" />
            <circle cx="140" cy="130" r="2" />
            <circle cx="260" cy="130" r="2" />
          </g>
        </svg>
      </motion.div>

      {/* Caption technique */}
      <div className="mt-3 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — layout soc silicium (cad view)</span>
        <span className="text-ink/60 font-semibold">RISC-V / 24MB L3</span>
      </div>
    </div>
  );
}
