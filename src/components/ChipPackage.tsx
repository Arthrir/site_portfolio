import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { Sparkles, Eye } from "lucide-react";

interface ChipPackageProps {
  onColorChange?: (color: string) => void;
}

export default function ChipPackage({ onColorChange }: ChipPackageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [9, -9]), { stiffness: 160, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-9, 9]), { stiffness: 160, damping: 22 });
  const { tr } = useLang();

  // Mode Rayons-X / Vue interne du Die en silicium (au clic)
  const [xray, setXray] = useState(false);
  const [activeLed, setActiveLed] = useState(0);

  const ledColors = ["#E10600", "#2340F0", "#10B981", "#D4AF37"];
  const handleToggleXray = () => {
    const next = (activeLed + 1) % ledColors.length;
    setActiveLed(next);
    setXray(!xray);
    if (onColorChange) onColorChange(ledColors[next]);
  };

  return (
    <div className="relative w-full max-w-[420px] select-none [perspective:1200px]">
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry }}
        onClick={handleToggleXray}
        className="group relative aspect-square w-full cursor-pointer rounded-2xl bg-gradient-to-br from-[#1C1C1E] via-[#121214] to-[#0A0A0C] p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55),0_10px_30px_-10px_rgba(0,0,0,0.3)] ring-1 ring-white/10 [transform-style:preserve-3d] transition-shadow hover:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7)]"
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
        {/* Substrat céramique avec chanfrein biseauté usiné CNC */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

        {/* Index d'orientation Pin 1 (encoche dorée gravée en haut à gauche) */}
        <div className="absolute top-3 left-3 size-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/30 shadow-[0_0_8px_rgba(212,175,55,0.4)]" />

        {/* Pastilles / BGA Contact Pads dorées tout autour (4 côtés) */}
        <div className="absolute inset-2 pointer-events-none flex flex-col justify-between">
          {/* Haut & Bas */}
          <div className="flex justify-between px-6">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={`top-${i}`} className="h-1.5 w-1 rounded-sm bg-[#D4AF37]/50 shadow-[0_0_2px_rgba(212,175,55,0.3)]" />
            ))}
          </div>
          <div className="flex justify-between px-6">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={`bot-${i}`} className="h-1.5 w-1 rounded-sm bg-[#D4AF37]/50 shadow-[0_0_2px_rgba(212,175,55,0.3)]" />
            ))}
          </div>
        </div>
        <div className="absolute inset-2 pointer-events-none flex justify-between py-6">
          {/* Gauche & Droite */}
          <div className="flex flex-col justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={`left-${i}`} className="h-1 w-1.5 rounded-sm bg-[#D4AF37]/50 shadow-[0_0_2px_rgba(212,175,55,0.3)]" />
            ))}
          </div>
          <div className="flex flex-col justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={`right-${i}`} className="h-1 w-1.5 rounded-sm bg-[#D4AF37]/50 shadow-[0_0_2px_rgba(212,175,55,0.3)]" />
            ))}
          </div>
        </div>

        {/* Heat Spreader métallique central (IHS) usiné en titane brossé */}
        <div className="relative size-full rounded-xl bg-gradient-to-br from-[#27272A] via-[#1E1E22] to-[#141416] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.6),0_10px_25px_-5px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col justify-between">
          
          {/* Reflet spéculaire dynamique suivant la souris */}
          <motion.div
            style={{
              x: useTransform(mx, [-1, 1], [-60, 60]),
              y: useTransform(my, [-1, 1], [-60, 60]),
            }}
            className="pointer-events-none absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0%,transparent_65%)]"
          />

          {!xray ? (
            /* --- VUE EXTÉRIEURE : GRAVURE LASER INDUSTRIELLE ÉPURÉE --- */
            <>
              {/* En-tête packaging */}
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase">ARTHUR DORADOUX</span>
                    <span
                      className="size-1.5 rounded-full animate-pulse shadow-sm"
                      style={{ backgroundColor: ledColors[activeLed] }}
                    />
                  </div>
                  <span className="font-mono text-[9px] tracking-wider text-white/40 block mt-0.5">MINES SAINT-ÉTIENNE × POLIMI</span>
                </div>
                <div className="font-mono text-[8px] text-white/30 text-right">
                  REV 3.0<br />2026
                </div>
              </div>

              {/* Centre du Die : Logo technique et nomenclature SoC */}
              <div className="relative z-10 my-auto text-center py-4">
                <div className="mx-auto mb-3 grid size-14 place-items-center rounded-xl border border-white/20 bg-white/[0.04] shadow-inner backdrop-blur-sm">
                  {/* Logo monogramme AD épuré */}
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-white/90">
                    <path d="M14 4 L24 22 L20 22 L14 11 L8 22 L4 22 Z" fill="currentColor" />
                    <rect x="10" y="15" width="8" height="2" fill="currentColor" opacity="0.9" />
                  </svg>
                </div>
                <h3 className="font-mono text-sm font-semibold tracking-[0.16em] text-white/95">AD-32X SILICON CORE</h3>
                <p className="mt-1 font-mono text-[10px] tracking-wider text-white/50">32-BIT RISC-V SoC · TAPE-OUT READY</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[9px] text-white/60">
                  <span>64 KB SRAM</span>
                  <span className="text-white/20">·</span>
                  <span>SPI / I2C / UART</span>
                  <span className="text-white/20">·</span>
                  <span style={{ color: ledColors[activeLed] }}>RTL PASSED</span>
                </div>
              </div>

              {/* Pied de puce : DataMatrix et certificat fonderie */}
              <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-3">
                <div className="font-mono text-[8px] text-white/40 leading-tight">
                  FAB: MINES-SE-MICROLAB<br />
                  DIE: 3.2 × 3.2 mm · QFN-56
                </div>
                {/* Faux DataMatrix 2D Code haute précision */}
                <div className="grid grid-cols-4 gap-0.5 rounded border border-white/20 p-1 bg-black/40">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className={`size-1 rounded-[0.5px] ${i % 3 === 0 || i === 0 || i === 15 || i === 6 ? "bg-white/80" : "bg-white/15"}`}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* --- VUE INTERNE RAYONS-X : LE SILICIUM BRUT ET LES WIRE-BONDS --- */
            <div className="relative z-10 size-full flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-[9px] text-[#00FFCC]">
                <span>X-RAY :: SILICON DIE VIEW</span>
                <span className="animate-pulse">ONLINE</span>
              </div>

              {/* Le coeur en silicium miroir irisé */}
              <div className="relative my-auto mx-auto size-36 rounded-lg border border-[#00FFCC]/50 bg-gradient-to-br from-[#041E26] via-[#021015] to-black p-3 shadow-[0_0_20px_rgba(0,255,204,0.15)] flex flex-col justify-between">
                {/* Grille lithographique microscopique */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,204,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,204,0.1)_1px,transparent_1px)] bg-[size:8px_8px] rounded-lg" />
                
                <div className="relative z-10 flex justify-between font-mono text-[7px] text-[#00FFCC]/80">
                  <span>ALU_RV32I</span>
                  <span>REGFILE_32x32</span>
                </div>

                <div className="relative z-10 text-center my-auto">
                  <span className="font-mono text-xs font-bold tracking-widest text-white">CORE-0</span>
                  <div className="mt-1 font-mono text-[8px] text-[#00FFCC]">ACTIVE SILICON</div>
                </div>

                <div className="relative z-10 flex justify-between font-mono text-[7px] text-[#00FFCC]/80">
                  <span>STAGE_EX/MEM</span>
                  <span>CSR_STATUS</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-[8px] text-white/50 border-t border-white/10 pt-2">
                <span>WIRE-BOND: 56x 25µm GOLD</span>
                <span className="text-[#00FFCC]">CLICK TO CLOSE X-RAY</span>
              </div>
            </div>
          )}
        </div>

        {/* Info-bulle interactive discrète au survol */}
        <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-mute">
          <span className="flex items-center gap-1.5">
            <Eye className="size-3 text-signal" />
            {tr("Cliquer pour vue Rayons-X / Silicium", "Click for X-Ray / Silicon view")}
          </span>
          <span className="text-ink/60 font-medium">QFN-56 Packaging</span>
        </div>
      </motion.div>
    </div>
  );
}
