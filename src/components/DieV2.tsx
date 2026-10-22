import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { Cpu, Activity, Flame, Sparkles, CheckCircle2, RotateCw } from "lucide-react";
import { useLang } from "../i18n";

interface DieV2Props {
  onColorChange?: (color: string) => void;
}

type ViewMode = "run" | "silicon" | "thermal";

interface Instruction {
  asm: string;
  op: string;
  reg: string;
  val: string;
}

const INSTRUCTIONS: Instruction[] = [
  { asm: "ADDI x10, x0, 0x2A", op: "EXECUTE", reg: "a0 (x10)", val: "42" },
  { asm: "XOR  x12, x10, x11", op: "LOGIC",   reg: "a2 (x12)", val: "0x1F" },
  { asm: "ASCON_ENC x1, x2",  op: "CRYPTO",  reg: "tag",      val: "NIST-OK" },
  { asm: "LW   x5, 8(sp)",     op: "MEMORY",  reg: "t0 (x5)",  val: "0xCAFE" },
  { asm: "BNE  x10, x11, +12", op: "BRANCH",  reg: "pc",       val: "0x8004" },
  { asm: "CSRW mstatus, x7",   op: "SYSTEM",  reg: "priv",     val: "M-MODE" },
];

export default function DieV2({ onColorChange }: DieV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tr } = useLang();

  // 3D Tilt dynamique interactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 160, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 160, damping: 20 });

  // Mode de visualisation : run (pipeline live), silicon (nanométrique), thermal (infrarouge)
  const [mode, setMode] = useState<ViewMode>("run");
  const [instIndex, setInstIndex] = useState(0);
  const [clockTick, setClockTick] = useState(0);
  const [isOverclocked, setIsOverclocked] = useState(false);
  const [probeRipple, setProbeRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Cycle d'horloge & défilement d'instructions RISC-V en direct
  useEffect(() => {
    const speed = isOverclocked ? 260 : 700;
    const interval = setInterval(() => {
      setClockTick((c) => (c + 1) % 100);
      setInstIndex((i) => (i + 1) % INSTRUCTIONS.length);
    }, speed);
    return () => clearInterval(interval);
  }, [isOverclocked]);

  const currentInst = INSTRUCTIONS[instIndex];

  // Gestion de la souris
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(nx);
    my.set(ny);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const handleDieClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setProbeRipple({ x, y, id: Date.now() });
    setIsOverclocked((o) => !o);

    if (onColorChange) {
      const colors = ["#D4AF37", "#2340F0", "#10B981", "#E10600", "#8B5CF6"];
      onColorChange(colors[(instIndex + 1) % colors.length]);
    }
  };

  // Wirebonds (32 fils d'or microscopiques connectant le boîtier au die central)
  // 8 sur chaque côté : Top, Bottom, Left, Right
  const renderWirebonds = () => {
    const wires = [];
    const strokeGold = "url(#gold-wire-gradient)";

    // Top wires (boîtier y=50 -> die y=85)
    for (let i = 0; i < 8; i++) {
      const xPkg = 90 + i * 20;
      const xDie = 115 + i * 14.5;
      wires.push(
        <path
          key={`w-top-${i}`}
          d={`M ${xPkg} 54 C ${xPkg} 68, ${xDie} 72, ${xDie} 86`}
          stroke={strokeGold}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      );
      // Plots de soudure or
      wires.push(<circle key={`pad-pkg-t-${i}`} cx={xPkg} cy={54} r="2.2" fill="#D4AF37" />);
      wires.push(<circle key={`pad-die-t-${i}`} cx={xDie} cy={86} r="1.8" fill="#FDE047" />);
    }

    // Bottom wires (die y=234 -> boîtier y=266)
    for (let i = 0; i < 8; i++) {
      const xPkg = 90 + i * 20;
      const xDie = 115 + i * 14.5;
      wires.push(
        <path
          key={`w-bot-${i}`}
          d={`M ${xDie} 234 C ${xDie} 248, ${xPkg} 252, ${xPkg} 266`}
          stroke={strokeGold}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      );
      wires.push(<circle key={`pad-die-b-${i}`} cx={xDie} cy={234} r="1.8" fill="#FDE047" />);
      wires.push(<circle key={`pad-pkg-b-${i}`} cx={xPkg} cy={266} r="2.2" fill="#D4AF37" />);
    }

    // Left wires (boîtier x=54 -> die x=86)
    for (let i = 0; i < 8; i++) {
      const yPkg = 90 + i * 20;
      const yDie = 115 + i * 14.5;
      wires.push(
        <path
          key={`w-left-${i}`}
          d={`M 54 ${yPkg} C 68 ${yPkg}, 72 ${yDie}, 86 ${yDie}`}
          stroke={strokeGold}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      );
      wires.push(<circle key={`pad-pkg-l-${i}`} cx={54} cy={yPkg} r="2.2" fill="#D4AF37" />);
      wires.push(<circle key={`pad-die-l-${i}`} cx={86} cy={yDie} r="1.8" fill="#FDE047" />);
    }

    // Right wires (die x=234 -> boîtier x=266)
    for (let i = 0; i < 8; i++) {
      const yPkg = 90 + i * 20;
      const yDie = 115 + i * 14.5;
      wires.push(
        <path
          key={`w-right-${i}`}
          d={`M 234 ${yDie} C 248 ${yDie}, 252 ${yPkg}, 266 ${yPkg}`}
          stroke={strokeGold}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      );
      wires.push(<circle key={`pad-die-r-${i}`} cx={234} cy={yDie} r="1.8" fill="#FDE047" />);
      wires.push(<circle key={`pad-pkg-r-${i}`} cx={266} cy={yPkg} r="2.2" fill="#D4AF37" />);
    }

    return wires;
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* 1. HUD Microscope & Sélecteur de Mode */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 font-mono text-[10px] text-mute uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-ink">
          <span className={`size-2 rounded-full ${isOverclocked ? "bg-amber-400" : "bg-emerald-500"} animate-pulse`} />
          <span>RV32I DELIDDED DIE · 4nm FinFET</span>
        </span>

        {/* Sélecteur de Mode Tactile */}
        <div className="flex items-center gap-1 rounded-full bg-line/60 p-0.5 border border-ink/10">
          <button
            onClick={() => setMode("run")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
              mode === "run" ? "bg-ink text-paper font-semibold" : "text-mute hover:text-ink"
            }`}
          >
            <Activity className="size-2.5" />
            <span>RUN</span>
          </button>
          <button
            onClick={() => setMode("silicon")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
              mode === "silicon" ? "bg-ink text-paper font-semibold" : "text-mute hover:text-ink"
            }`}
          >
            <Sparkles className="size-2.5" />
            <span>OPTIC</span>
          </button>
          <button
            onClick={() => setMode("thermal")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
              mode === "thermal" ? "bg-ink text-paper font-semibold" : "text-mute hover:text-ink"
            }`}
          >
            <Flame className="size-2.5" />
            <span>HEAT</span>
          </button>
        </div>
      </div>

      {/* 2. CHIP 3D PHYSIQUE FLOTTANT */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleDieClick}
        className="relative aspect-square w-full max-w-[420px] cursor-pointer rounded-2xl bg-gradient-to-br from-[#1E2530] via-[#0E131B] to-[#06080D] p-3 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.65),0_10px_30px_-10px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-2px_6px_rgba(0,0,0,0.9)] border border-white/20 transition-shadow duration-500 hover:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)]"
      >
        <svg
          viewBox="0 0 320 320"
          className="size-full overflow-visible drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Dégradé or 18k pour les wirebonds */}
            <linearGradient id="gold-wire-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFF2A3" />
              <stop offset="100%" stopColor="#B38728" />
            </linearGradient>

            {/* Dégradé de silicium poli miroir */}
            <radialGradient id="silicon-substrate" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#1E2A42" />
              <stop offset="45%" stopColor="#111827" />
              <stop offset="85%" stopColor="#080C14" />
              <stop offset="100%" stopColor="#030508" />
            </radialGradient>

            {/* Dégradé thermique infrarouge */}
            <radialGradient id="thermal-gradient" cx="45%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="25%" stopColor="#F97316" />
              <stop offset="60%" stopColor="#9333EA" />
              <stop offset="85%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#050510" />
            </radialGradient>

            {/* Dégradé optique irisé nanométrique */}
            <linearGradient id="iridescent-sheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(236, 72, 153, 0.35)" />
              <stop offset="25%" stopColor="rgba(59, 130, 246, 0.40)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="75%" stopColor="rgba(245, 158, 11, 0.38)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.35)" />
            </linearGradient>
          </defs>

          {/* =========================================================
              A. SUBSTRAT CÉRAMIQUE DU BOÎTIER & CHANFREIN DORÉ
              ========================================================= */}
          {/* Broches périphériques argentées étamées (Gull-wing pads) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const pos = 42 + i * 20;
            return (
              <g key={`pin-periph-${i}`}>
                {/* Top pins */}
                <rect x={pos - 3} y={12} width={6} height={10} rx={1} fill="#71717A" stroke="#27272A" strokeWidth="0.5" />
                <rect x={pos - 1.5} y={13} width={3} height={8} fill="#E4E4E7" />
                {/* Bottom pins */}
                <rect x={pos - 3} y={298} width={6} height={10} rx={1} fill="#71717A" stroke="#27272A" strokeWidth="0.5" />
                <rect x={pos - 1.5} y={299} width={3} height={8} fill="#E4E4E7" />
                {/* Left pins */}
                <rect x={12} y={pos - 3} width={10} height={6} rx={1} fill="#71717A" stroke="#27272A" strokeWidth="0.5" />
                <rect x={13} y={pos - 1.5} width={8} height={3} fill="#E4E4E7" />
                {/* Right pins */}
                <rect x={298} y={pos - 3} width={10} height={6} rx={1} fill="#71717A" stroke="#27272A" strokeWidth="0.5" />
                <rect x={299} y={pos - 1.5} width={8} height={3} fill="#E4E4E7" />
              </g>
            );
          })}

          {/* Boîtier Céramique noir mat biseauté avec chanfrein */}
          <rect
            x="24"
            y="24"
            width="272"
            height="272"
            rx="12"
            fill="#0B0F17"
            stroke="#1F2937"
            strokeWidth="1.5"
          />

          {/* Chanfrein biseauté doré intérieur */}
          <rect
            x="32"
            y="32"
            width="256"
            height="256"
            rx="8"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* Repère Pin 1 (triangle doré gravé laser) */}
          <polygon points="38,38 46,38 38,46" fill="#D4AF37" opacity="0.9" />

          {/* Sérigraphie industrielle du boîtier */}
          <text x="52" y="44" fill="#9CA3AF" fontSize="6" fontFamily="monospace" fontWeight="bold" letterSpacing="0.8">
            ARTHUR-DX · RISC-V 32I
          </text>
          <text x="268" y="44" textAnchor="end" fill="#6B7280" fontSize="5" fontFamily="monospace" letterSpacing="0.5">
            ISMIN FAB 2026
          </text>

          {/* =========================================================
              B. CAVITÉ DU DIE DÉCALOTTÉ (DELIDDED CAVITY)
              ========================================================= */}
          {/* Cuve en retrait avec ombre interne prononcée */}
          <rect
            x="76"
            y="76"
            width="168"
            height="168"
            rx="4"
            fill="#05070B"
            stroke="#374151"
            strokeWidth="1.2"
          />

          {/* =========================================================
              C. CŒUR DE SILICIUM NU (THE BARE SILICON DIE)
              ========================================================= */}
          <g>
            {/* Plaquette de silicium actif (148x148) */}
            <rect
              x="86"
              y="86"
              width="148"
              height="148"
              rx="2"
              fill={mode === "thermal" ? "url(#thermal-gradient)" : "url(#silicon-substrate)"}
              stroke={mode === "thermal" ? "#F97316" : "#4B5563"}
              strokeWidth="0.8"
            />

            {/* Couche optique irisée en mode 'silicon' */}
            {mode === "silicon" && (
              <rect
                x="86"
                y="86"
                width="148"
                height="148"
                rx="2"
                fill="url(#iridescent-sheen)"
                style={{ mixBlendMode: "screen" }}
                className="pointer-events-none"
              />
            )}

            {/* Floorplan des micro-blocs du SoC (Microarchitecture) */}
            {mode !== "thermal" && (
              <g className="transition-opacity duration-300">
                {/* 1. RV32I Execution Core (Fetch, Decode, ALU) */}
                <g transform="translate(92, 92)">
                  <rect
                    x="0"
                    y="0"
                    width="66"
                    height="66"
                    rx="1.5"
                    fill="#131B2A"
                    stroke={mode === "run" ? "#38BDF8" : "#2563EB"}
                    strokeWidth="0.8"
                    strokeOpacity="0.7"
                  />
                  <rect x="0" y="0" width="66" height="11" fill="#0F172A" />
                  <text x="4" y="8" fill="#38BDF8" fontSize="4.8" fontFamily="monospace" fontWeight="bold">
                    RV32I CORE
                  </text>
                  <circle cx="58" cy="6" r="2" fill={clockTick % 2 === 0 ? "#10B981" : "#047857"} />

                  {/* Micro-unités de l'ALU */}
                  <g transform="translate(4, 15)">
                    <rect x="0" y="0" width="26" height="18" fill="#1E293B" stroke="#334155" strokeWidth="0.4" />
                    <text x="3" y="11" fill="#E2E8F0" fontSize="4" fontFamily="monospace">
                      ALU 32b
                    </text>

                    <rect x="30" y="0" width="28" height="18" fill="#1E293B" stroke="#334155" strokeWidth="0.4" />
                    <text x="33" y="11" fill="#FDE047" fontSize="4" fontFamily="monospace">
                      DECODER
                    </text>

                    <rect x="0" y="22" width="58" height="24" fill="#0F172A" stroke="#1E293B" strokeWidth="0.4" />
                    <text x="3" y="32" fill="#94A3B8" fontSize="3.6" fontFamily="monospace">
                      REGFILE: x0..x31
                    </text>
                    <text x="3" y="40" fill="#38BDF8" fontSize="3.8" fontFamily="monospace" fontWeight="bold">
                      {currentInst.reg} = {currentInst.val}
                    </text>
                  </g>
                </g>

                {/* 2. SRAM Cache L1/L2 High Density Matrix */}
                <g transform="translate(162, 92)">
                  <rect
                    x="0"
                    y="0"
                    width="66"
                    height="66"
                    rx="1.5"
                    fill="#131B2A"
                    stroke="#D4AF37"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                  />
                  <rect x="0" y="0" width="66" height="11" fill="#0F172A" />
                  <text x="4" y="8" fill="#D4AF37" fontSize="4.8" fontFamily="monospace" fontWeight="bold">
                    SRAM CACHE 64K
                  </text>

                  {/* Matrice de cellules mémoires (effets de bits clignotants) */}
                  <g transform="translate(4, 15)">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const bx = (i % 6) * 9.5;
                      const by = Math.floor(i / 6) * 11;
                      const active = (i + clockTick) % 5 === 0;
                      return (
                        <rect
                          key={`sram-cell-${i}`}
                          x={bx}
                          y={by}
                          width="7.5"
                          height="8.5"
                          rx="0.5"
                          fill={active ? "rgba(212, 175, 55, 0.45)" : "#1E293B"}
                          stroke="#334155"
                          strokeWidth="0.3"
                        />
                      );
                    })}
                  </g>
                </g>

                {/* 3. ASCON-128 NIST Cryptographic Accelerator */}
                <g transform="translate(92, 162)">
                  <rect
                    x="0"
                    y="0"
                    width="66"
                    height="66"
                    rx="1.5"
                    fill="#131B2A"
                    stroke="#A855F7"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                  />
                  <rect x="0" y="0" width="66" height="11" fill="#0F172A" />
                  <text x="4" y="8" fill="#C084FC" fontSize="4.6" fontFamily="monospace" fontWeight="bold">
                    ASCON-128 AEAD
                  </text>

                  <g transform="translate(4, 16)">
                    <text x="2" y="10" fill="#E9D5FF" fontSize="3.8" fontFamily="monospace">
                      S-BOX PERMUTATION
                    </text>
                    <text x="2" y="22" fill="#A855F7" fontSize="3.6" fontFamily="monospace">
                      NIST LWC FINALIST
                    </text>
                    <text x="2" y="36" fill="#10B981" fontSize="4.2" fontFamily="monospace" fontWeight="bold">
                      TAG AUTH: VALID
                    </text>
                  </g>
                </g>

                {/* 4. Peripheral Bus & I/O Matrix */}
                <g transform="translate(162, 162)">
                  <rect
                    x="0"
                    y="0"
                    width="66"
                    height="66"
                    rx="1.5"
                    fill="#131B2A"
                    stroke="#10B981"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                  />
                  <rect x="0" y="0" width="66" height="11" fill="#0F172A" />
                  <text x="4" y="8" fill="#34D399" fontSize="4.6" fontFamily="monospace" fontWeight="bold">
                    SYSTEM BUS & I/O
                  </text>

                  <g transform="translate(4, 16)">
                    <text x="2" y="10" fill="#94A3B8" fontSize="3.6" fontFamily="monospace">
                      UART · SPI · CAN BUS
                    </text>
                    <text x="2" y="22" fill="#94A3B8" fontSize="3.6" fontFamily="monospace">
                      F_CLK: {isOverclocked ? "240 MHz" : "120 MHz"}
                    </text>
                    <text x="2" y="36" fill="#F59E0B" fontSize="4" fontFamily="monospace" fontWeight="bold">
                      JTAG SWD ACTIVE
                    </text>
                  </g>
                </g>

                {/* Bus interconnect lumineux central (Croix de bus) */}
                <line x1="92" y1="160" x2="228" y2="160" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                <line x1="160" y1="92" x2="160" y2="228" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                <circle cx="160" cy="160" r="4" fill="#38BDF8" opacity="0.8" />
              </g>
            )}

            {/* Vue thermique : contours d'isothermes et gradient chaud */}
            {mode === "thermal" && (
              <g className="font-mono text-white">
                <circle cx="130" cy="130" r="32" fill="none" stroke="#FEF08A" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.7" />
                <circle cx="130" cy="130" r="48" fill="none" stroke="#F97316" strokeWidth="0.8" opacity="0.5" />
                <text x="96" y="104" fill="#FEF08A" fontSize="4.5" fontWeight="bold">T_JUNCTION: 48.2°C</text>
                <text x="96" y="114" fill="#F97316" fontSize="4">CORE HOTSPOT: ALU</text>
                <text x="96" y="220" fill="#9333EA" fontSize="4">AMBIENT: 22.4°C (PASSIVE)</text>
              </g>
            )}
          </g>

          {/* =========================================================
              D. LES WIREBONDS EN OR PUR 3D (32 MICRO-FILS D'OR)
              ========================================================= */}
          <g>{renderWirebonds()}</g>

          {/* Gravure laser d'identification en bas du boîtier */}
          <text x="160" y="284" textAnchor="middle" fill="#9CA3AF" fontSize="6.5" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            ARTHUR DORADOUX · TAPE-OUT 2026
          </text>
          <text x="160" y="293" textAnchor="middle" fill="#4B5563" fontSize="4.5" fontFamily="monospace" letterSpacing="0.6">
            DUAL-ISSUE IN-ORDER · 32-BIT RISC-V ISA · ASCON AEAD
          </text>
        </svg>

        {/* Effet d'onde de sonde (Probe ripple) lors d'un clic */}
        {probeRipple && (
          <motion.div
            key={probeRipple.id}
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ left: probeRipple.x, top: probeRipple.y }}
            className="pointer-events-none absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-amber-400/20"
          />
        )}
      </motion.div>

      {/* 3. FICHE DE TÉLÉMÉTRIE D'EXÉCUTION EN BAS */}
      <div className="mt-3.5 flex items-center justify-between w-full max-w-[420px] font-mono text-[10.5px] text-mute px-2">
        <div className="flex items-center gap-1.5 truncate">
          <Cpu className="size-3.5 text-signal shrink-0" />
          <span className="font-semibold text-ink truncate">
            {currentInst.asm}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-emerald-600 font-semibold text-[10px]">
          <CheckCircle2 className="size-3" />
          <span>{currentInst.op}</span>
          <span className="text-mute font-normal">({isOverclocked ? "240 MHz" : "120 MHz"})</span>
        </div>
      </div>

      <p className="mt-1 font-mono text-[9px] text-mute text-center">
        Cliquez sur la puce pour déclencher une impulsion d'horloge · Changez de mode en haut à droite
      </p>
    </div>
  );
}
