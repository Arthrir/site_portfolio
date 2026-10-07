import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Chip die (hero visual) ----------------
 * Architecture Hybride Microélectronique & Conception Silicium :
 * - Substrat PCB / Silicium haute fidélité avec anneau de pads périphériques bondés (QFP/BGA)
 * - Traces de bus différentiels et signaux haute vitesse routés à 45°
 * - Puce centrale détaillée : Die silicium avec Floorplan CAD (Cœurs RV32I, ALU, L1-I/D, L3 Cache, DDR5/PCIe PHY)
 * - Pistes de liaisons et bus de cohérence internes avec routage physique vers les entrées/sorties
 * - Composants CMS passifs réels (condensateurs 0603, points de test plaqués or)
 * - Étage interactif logique et horloge :
 *    * Bouton poussoir tactile CLOCK (pulse 120 MHz avec propagation de paquets)
 *    * Banc de test XOR (entrées logiques A & B, porte ANSI, LED d'état)
 *    * Commutateur SPDT RUN / DEBUG
 * -------------------------------------------------------------------------- */

const BUS_TRACES = [
  // Top bus (D0..D3 + VDD rail)
  { d: "M149 126 V44", color: "#06B6D4" }, // Cyan (D0 / High-speed)
  { d: "M171 126 V44", color: "#10B981" }, // Emerald (D1 / Signal)
  { d: "M193 126 V44", color: "#F59E0B" }, // Amber VDD rail (porte C1)
  { d: "M215 126 V44", color: "#8B5CF6" }, // Violet (D2 / Clock)
  { d: "M237 126 V44", color: "#F43F5E" }, // Rose (D3 / Strobe)

  // Bottom bus (D4..D7 + GND rail + Analog)
  { d: "M149 274 V356", color: "#06B6D4" }, // Cyan
  { d: "M171 274 V356", color: "#10B981" }, // Emerald
  { d: "M193 274 V356", color: "#71717A" }, // Gray GND rail (porte C2)
  { d: "M215 274 V356", color: "#8B5CF6" }, // Violet
  { d: "M237 274 V356", color: "#F43F5E" }, // Rose
  { d: "M259 274 V310 H281 V356", color: "#F59E0B" }, // Amber Analog rail (porte C3)

  // Left bus (SPI: SCK, MISO, MOSI, CS)
  { d: "M126 171 H44", color: "#06B6D4" }, // Cyan
  { d: "M126 193 H44", color: "#10B981" }, // Emerald
  { d: "M126 215 H44", color: "#8B5CF6" }, // Violet
  { d: "M126 237 H44", color: "#F43F5E" }, // Rose

  // Right bus (UART TX + I2C SCL/SDA + VREF)
  { d: "M270 149 H356", color: "#06B6D4" }, // Cyan UART TX (porte TP2_TX)
  { d: "M270 171 H356", color: "#10B981" }, // Emerald I2C SCL
  { d: "M270 193 H356", color: "#8B5CF6" }, // Violet I2C SDA
  { d: "M270 259 H356", color: "#F59E0B" }, // Amber VREF (porte TP4_VREF et C4)
];

const SM_CAPS = [
  { x: 193, y: 85, vertical: true, label: "C1" },   // Découplage VDD top
  { x: 193, y: 315, vertical: true, label: "C2" },  // Découplage GND bottom
  { x: 281, y: 332, vertical: true, label: "C3" },  // Découplage alimentation analogique
  { x: 325, y: 259, vertical: false, label: "C4" }, // Filtre VREF
];

export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 130, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-7, 7]), { stiffness: 130, damping: 18 });
  const { tr } = useLang();

  // Banc logique (2 entrées -> 1 sortie XOR)
  const [logicA, setLogicA] = useState(false);
  const [logicB, setLogicB] = useState(true);
  const logicOut = logicA !== logicB;

  // Bouton Test / Pulse Clock
  const [clockSurge, setClockSurge] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // Commutateur RUN / DEBUG
  const [isDebug, setIsDebug] = useState(false);

  const triggerClockPulse = () => {
    setPulseCount((c) => c + 1);
    setClockSurge(true);
    setTimeout(() => setClockSurge(false), 850);
  };

  const animDuration = isDebug ? 999999 : clockSurge ? 0.45 : 2.0;

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
          <defs>
            <filter id="glow-led" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="die-silicon-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#141415" />
              <stop offset="50%" stopColor="#0B0B0C" />
              <stop offset="100%" stopColor="#18181A" />
            </linearGradient>
            <linearGradient id="cu-slug" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C2410C" stopOpacity="0.95" />
            </linearGradient>
            <pattern id="silicon-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#222" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Substrat PCB & repères fiduciels */}
          <circle cx="28" cy="28" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="28" cy="28" r="1.5" className="fill-ink/50" />
          <circle cx="372" cy="28" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="372" cy="28" r="1.5" className="fill-ink/50" />
          <circle cx="372" cy="372" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="372" cy="372" r="1.5" className="fill-ink/50" />
          <circle cx="28" cy="372" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="28" cy="372" r="1.5" className="fill-ink/50" />

          {/* Peripheral SMD Pads (13 pads par côté, contact cuivre doré) */}
          {Array.from({ length: 13 }).map((_, i) => (
            <g key={`pads-${i}`} className="fill-ink/80">
              <rect x={56 + i * 22} y={30} width={10} height={14} rx={1} />
              <rect x={56 + i * 22} y={356} width={10} height={14} rx={1} />
              <rect x={30} y={56 + i * 22} width={14} height={10} rx={1} />
              <rect x={356} y={56 + i * 22} width={14} height={10} rx={1} />
            </g>
          ))}

          {/* =================================================================
              CIRCUITS PÉRIPHÉRIQUES INTERACTIFS RÉELS (Horloge, Logique, Mode)
              ================================================================= */}

          {/* ÉTAGE TOP-LEFT : PISTES & BOUTON CLOCK PULSE */}
          <path d="M83 44 V62" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M83 78 V95" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M83 105 V117" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M83 127 V155 H126" className="stroke-line" strokeWidth="1.25" fill="none" />
          {!isDebug && (
            <motion.path
              d="M83 127 V155 H126"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-signal"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: [0, 0.35, 0], pathOffset: [0, 0.65, 1] }}
              transition={{ duration: clockSurge ? 0.3 : 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Bouton poussoir tactile CLOCK */}
          <g
            className="cursor-pointer transition-transform active:scale-95"
            onClick={triggerClockPulse}
          >
            <rect x="74" y="62" width="18" height="16" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
            <rect x="76" y="64" width="14" height="12" rx="1" fill="#CBD5E1" />
            <circle cx="83" cy="70" r="4.8" fill={clockSurge ? "#FF4D00" : "#64748B"} stroke="#334155" strokeWidth="0.8" />
            <text x="83" y="72" fontSize="4.2" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">CLK</text>
            <text x="67" y="72" fontSize="5" className="fill-mute font-mono">PULSE</text>
          </g>

          {/* LED Horloge (LED_CLK) */}
          <g transform="translate(83, 100)">
            <rect x="-4" y="-5" width="8" height="10" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.75" />
            <rect x="-4" y="-5" width="8" height="2" fill="#94A3B8" />
            <rect x="-4" y="3" width="8" height="2" fill="#94A3B8" />
            <circle
              cx="0"
              cy="0"
              r="2.5"
              filter={clockSurge ? "url(#glow-led)" : undefined}
              fill={clockSurge ? "#F59E0B" : isDebug ? "#64748B" : "#10B981"}
            />
            <text x="7" y="2" fontSize="5" className="fill-mute font-mono">LED_CLK</text>
          </g>

          {/* Résistance CMS R_CLK */}
          <g transform="translate(83, 122)">
            <rect x="-4" y="-3" width="8" height="6" rx="0.5" fill="#18181B" stroke="#09090B" strokeWidth="0.75" />
            <rect x="-4" y="-3" width="2" height="6" fill="#E4E4E7" />
            <rect x="2" y="-3" width="2" height="6" fill="#E4E4E7" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#71717A" strokeWidth="0.6" />
            <text x="8" y="2" fontSize="5" className="fill-mute font-mono">R_CLK</text>
          </g>

          {/* Point de test TP1_CLK */}
          <g transform="translate(105, 155)">
            <circle cx="0" cy="0" r="3.2" className="fill-signal/15 stroke-signal" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.2" className="fill-signal" />
            <text x="-4" y="-5" fontSize="5" className="fill-mute font-mono">TP1_CLK</text>
          </g>

          {/* ÉTAGE TOP-RIGHT : BANC LOGIQUE XOR */}
          <path d="M281 44 V60 H285 V62" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M303 44 V52 H272 V86 H285" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M293 70 H304" className={logicA ? "stroke-signal" : "stroke-line"} strokeWidth={logicA ? "1.6" : "1.25"} fill="none" />
          <path d="M293 92 H304" className={logicB ? "stroke-signal" : "stroke-line"} strokeWidth={logicB ? "1.6" : "1.25"} fill="none" />
          <path d="M328 81 H342 V97" className={logicOut ? "stroke-signal" : "stroke-line"} strokeWidth={logicOut ? "1.6" : "1.25"} fill="none" />
          <path d="M342 107 V115" className={logicOut ? "stroke-signal" : "stroke-line"} strokeWidth={logicOut ? "1.6" : "1.25"} fill="none" />
          <path d="M342 125 V127 H356" className={logicOut ? "stroke-signal" : "stroke-line"} strokeWidth={logicOut ? "1.6" : "1.25"} fill="none" />

          {/* Bouton tactile A */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)}>
            <rect x="277" y="62" width="16" height="16" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
            <circle cx="285" cy="70" r="4.8" fill={logicA ? "#FF4D00" : "#64748B"} stroke="#334155" strokeWidth="0.8" />
            <text x="285" y="72" fontSize="4.5" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">A</text>
            <text x="285" y="58" fontSize="5" textAnchor="middle" className="fill-mute font-mono">{logicA ? "1" : "0"}</text>
          </g>

          {/* Bouton tactile B */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)}>
            <rect x="277" y="84" width="16" height="16" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
            <circle cx="285" cy="92" r="4.8" fill={logicB ? "#FF4D00" : "#64748B"} stroke="#334155" strokeWidth="0.8" />
            <text x="285" y="94" fontSize="4.5" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">B</text>
            <text x="285" y="106" fontSize="5" textAnchor="middle" className="fill-mute font-mono">{logicB ? "1" : "0"}</text>
          </g>

          {/* Porte Logique XOR ANSI */}
          <g>
            <path d="M300 65 Q306 81 300 97" fill="none" stroke="#18181B" strokeWidth="1.3" strokeLinecap="round" />
            <path
              d="M304 65 Q318 67 328 81 Q318 95 304 97 Q310 81 304 65 Z"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="314" y="60" fontSize="5" textAnchor="middle" className="fill-mute font-mono font-bold">XOR</text>
          </g>

          {/* Résistance R_LOGIC */}
          <g transform="translate(342, 102)">
            <rect x="-3" y="-5" width="6" height="10" rx="0.5" fill="#18181B" stroke="#09090B" strokeWidth="0.75" />
            <rect x="-3" y="-5" width="6" height="2.5" fill="#E4E4E7" />
            <rect x="-3" y="2.5" width="6" height="2.5" fill="#E4E4E7" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#71717A" strokeWidth="0.6" />
          </g>

          {/* LED de sortie LED_Y */}
          <g transform="translate(342, 120)">
            <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.75" />
            <rect x="-4" y="-4" width="8" height="2" fill="#94A3B8" />
            <rect x="-4" y="2" width="8" height="2" fill="#94A3B8" />
            <circle
              cx="0"
              cy="0"
              r="2.5"
              filter={logicOut ? "url(#glow-led)" : undefined}
              fill={logicOut ? "#F59E0B" : "#64748B"}
            />
            <text x="6" y="2" fontSize="5" className="fill-mute font-mono">LED_Y {logicOut ? "=1" : "=0"}</text>
          </g>

          {/* ÉTAGE BOTTOM-LEFT : COMMUTATEUR SPDT RUN / DEBUG */}
          <path d="M83 292 V255 H126" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M83 308 V356" className={isDebug ? "stroke-amber-500" : "stroke-line"} strokeWidth="1.25" fill="none" />
          <path d="M76 292 V278" className={!isDebug ? "stroke-emerald-600" : "stroke-line"} strokeWidth="1.25" fill="none" />
          <path d="M90 292 V278" className={isDebug ? "stroke-amber-500" : "stroke-line"} strokeWidth="1.25" fill="none" />

          {/* Voyants LED RUN (vert) & DBG (ambre) */}
          <g transform="translate(76, 274)">
            <rect x="-3" y="-4" width="6" height="8" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="2.2" filter={!isDebug ? "url(#glow-led)" : undefined} fill={!isDebug ? "#10B981" : "#64748B"} />
            <text x="0" y="-6" fontSize="4.5" textAnchor="middle" className="fill-mute font-mono font-semibold">RUN</text>
          </g>
          <g transform="translate(90, 274)">
            <rect x="-3" y="-4" width="6" height="8" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="2.2" filter={isDebug ? "url(#glow-led)" : undefined} fill={isDebug ? "#F59E0B" : "#64748B"} />
            <text x="0" y="-6" fontSize="4.5" textAnchor="middle" className="fill-mute font-mono font-semibold">DBG</text>
          </g>

          {/* Interrupteur SPDT à glissière */}
          <g className="cursor-pointer" onClick={() => setIsDebug((d) => !d)}>
            <rect x="74" y="290" width="4" height="4" fill="#94A3B8" />
            <rect x="81" y="290" width="4" height="4" fill="#94A3B8" />
            <rect x="88" y="290" width="4" height="4" fill="#94A3B8" />
            <rect x="81" y="306" width="4" height="4" fill="#94A3B8" />
            <rect x="71" y="294" width="24" height="12" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
            <rect x="74" y="297.5" width="18" height="5" rx="1" fill="#1E293B" />
            <rect
              x={isDebug ? "84" : "74"}
              y="295.5"
              width="8"
              height="9"
              rx="1.5"
              fill={isDebug ? "#F59E0B" : "#10B981"}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            <line x1={isDebug ? "86.5" : "76.5"} y1="297.5" x2={isDebug ? "86.5" : "76.5"} y2="302.5" stroke="#FFFFFF" strokeWidth="0.6" />
            <line x1={isDebug ? "89.5" : "79.5"} y1="297.5" x2={isDebug ? "89.5" : "79.5"} y2="302.5" stroke="#FFFFFF" strokeWidth="0.6" />
          </g>

          {/* Point de test TP3_RST */}
          <g transform="translate(83, 328)">
            <circle cx="0" cy="0" r="3.2" className="fill-signal/15 stroke-signal" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.2" className="fill-signal" />
            <text x="6" y="2" fontSize="5" className="fill-mute font-mono">TP3_RST</text>
          </g>

          {/* BUS PRINCIPAUX MULTI-COULEURS RELIÉS AUX PADS & AU DIE */}
          {BUS_TRACES.map((trace) => (
            <g key={trace.d}>
              <path d={trace.d} className="stroke-line/90" strokeWidth="1.25" strokeLinejoin="round" fill="none" />
              {!isDebug && (
                <motion.path
                  d={trace.d}
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke={trace.color}
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{ pathLength: [0, 0.28, 0], pathOffset: [0, 0.65, 1] }}
                  transition={{ duration: animDuration, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </g>
          ))}

          {/* ÉTAGE BOTTOM-RIGHT : PORTES LOGIQUES NUMÉRIQUES (AND, NOT, OR) */}
          <path d="M270 215 H280 V197 H292" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M259 274 V245 H280 V207 H292" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M280 229 H292" className="stroke-line" strokeWidth="1.25" fill="none" />
          <path d="M270 237 H292" className="stroke-line" strokeWidth="1.25" fill="none" />

          {!isDebug && (
            <motion.path
              d="M270 215 H280 V197 H292"
              fill="none"
              strokeWidth="1.6"
              stroke="#8B5CF6"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Porte ET (AND gate) */}
          <g transform="translate(292, 194)">
            <path d="M0 0 H8 A8 8 0 0 1 8 16 H0 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
            <text x="5" y="10.5" fontSize="4.2" textAnchor="middle" className="font-mono font-bold fill-ink">AND</text>
          </g>

          <path d="M308 202 H315" className="stroke-line" strokeWidth="1.25" fill="none" />

          {/* Porte NOT (Inverseur) */}
          <g transform="translate(315, 198)">
            <polygon points="0,0 8,4 0,8" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="10" cy="4" r="1.8" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
          </g>

          {/* Sortie NAND */}
          <path d="M327 202 H356" className="stroke-line" strokeWidth="1.25" fill="none" />
          <g transform="translate(340, 202)">
            <circle cx="0" cy="0" r="2.4" className="fill-signal/20 stroke-signal" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="0.9" className="fill-signal" />
            <text x="0" y="-4" fontSize="4" textAnchor="middle" className="fill-mute font-mono">NAND</text>
          </g>

          {/* Porte OU (OR gate) */}
          <g transform="translate(292, 226)">
            <path d="M0 0 Q5 8 0 16 Q10 16 17 8 Q10 0 0 0 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
            <text x="6" y="10.5" fontSize="4.2" textAnchor="middle" className="font-mono font-bold fill-ink">OR</text>
          </g>

          {/* Sortie OR */}
          <path d="M309 234 H356" className="stroke-line" strokeWidth="1.25" fill="none" />
          <g transform="translate(332, 234)">
            <circle cx="0" cy="0" r="2.4" className="fill-purple-500/20 stroke-purple-500" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="0.9" className="fill-purple-500" />
            <text x="0" y="-4" fontSize="4" textAnchor="middle" className="fill-mute font-mono">OR</text>
          </g>

          {/* Condensateurs CMS 0603 */}
          {SM_CAPS.map((cap) => (
            <g key={cap.label} transform={`translate(${cap.x}, ${cap.y})`}>
              {cap.vertical ? (
                <>
                  <rect x="-4.5" y="-8.5" width="9" height="17" rx="0.5" fill="#71717A" />
                  <rect x="-4" y="-8" width="8" height="16" rx="1" fill="#27272A" stroke="#09090B" strokeWidth="0.75" />
                  <rect x="-4" y="-8" width="8" height="3.5" fill="#E4E4E7" stroke="#71717A" strokeWidth="0.4" />
                  <rect x="-4" y="4.5" width="8" height="3.5" fill="#E4E4E7" stroke="#71717A" strokeWidth="0.4" />
                  <text x="6" y="2" fontSize="5" className="fill-mute font-mono font-medium">{cap.label}</text>
                </>
              ) : (
                <>
                  <rect x="-8.5" y="-4.5" width="17" height="9" rx="0.5" fill="#71717A" />
                  <rect x="-8" y="-4" width="16" height="8" rx="1" fill="#27272A" stroke="#09090B" strokeWidth="0.75" />
                  <rect x="-8" y="-4" width="3.5" height="8" fill="#E4E4E7" stroke="#71717A" strokeWidth="0.4" />
                  <rect x="4.5" y="-4" width="3.5" height="8" fill="#E4E4E7" stroke="#71717A" strokeWidth="0.4" />
                  <text x="-8" y="-6" fontSize="5" className="fill-mute font-mono font-medium">{cap.label}</text>
                </>
              )}
            </g>
          ))}

          {/* Points de test TP2_TX et TP4_VREF */}
          <g transform="translate(300, 149)">
            <circle cx="0" cy="0" r="3.2" className="fill-signal/15 stroke-signal" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.2" className="fill-signal" />
            <text x="6" y="-3" fontSize="5" className="fill-mute font-mono">TP2_TX</text>
          </g>

          <g transform="translate(288, 259)">
            <circle cx="0" cy="0" r="3.2" className="fill-signal/15 stroke-signal" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.2" className="fill-signal" />
            <text x="-4" y="9" fontSize="5" textAnchor="end" className="fill-mute font-mono">TP4_VREF</text>
          </g>

          {/* =================================================================
              PUCE CENTRALE HYBRIDE : SILICIUM + CAD SOC FLOORPLAN ARCHITECTURE
              Boîtier QFP chanfreiné (126,126 -> 274,274) avec micro-architecture
              ================================================================= */}
          <g>
            {/* Corps du composant QFP avec chanfrein Pin 1 */}
            <path
              d="M142 126 H270 V274 H126 V142 Z"
              fill="url(#die-silicon-grad)"
              stroke="#000000"
              strokeWidth="1.5"
            />
            {/* Grille interne de métallisation du silicium */}
            <rect x="130" y="130" width="136" height="136" fill="url(#silicon-grid)" pointerEvents="none" opacity="0.6" />

            {/* Repère Pin 1 */}
            <circle cx="138" cy="138" r="3.5" className="fill-paper/20 stroke-paper/40" strokeWidth="0.75" />

            {/* Wire bonds physiques (pads du die reliés au boîtier) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <g key={`bond-${i}`} stroke="#D97706" strokeWidth="0.6" opacity="0.7">
                <line x1={150 + i * 20} y1="126" x2={150 + i * 20} y2="133" />
                <line x1={150 + i * 20} y1="267" x2={150 + i * 20} y2="274" />
                <line x1="126" y1={150 + i * 20} x2="133" y2={150 + i * 20} />
                <line x1="267" y1={150 + i * 20} x2="274" y2={150 + i * 20} />
              </g>
            ))}

            {/* --- FLOORPLAN CAO SILICIUM INTÉGRÉ DANS LA PUCE --- */}

            {/* L3 Cache Unifié (Haut du die) */}
            <g transform="translate(136, 136)">
              <rect x="0" y="0" width="124" height="24" rx="1.5" fill="#1C1C1E" stroke="#3A3A3C" strokeWidth="0.75" strokeDasharray="2 2" />
              <text x="62" y="15" textAnchor="middle" fontSize="6.2" fontFamily="monospace" letterSpacing="0.8" fill="#A1A1AA" fontWeight="600">
                L3_CACHE 24MB (SRAM)
              </text>
            </g>

            {/* Bus de cohérence interne (Crossbar rouge/signal) */}
            <g stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.85">
              <line x1="144" y1="165" x2="252" y2="165" />
              <line x1="168" y1="165" x2="168" y2="171" strokeWidth="0.8" />
              <line x1="228" y1="165" x2="228" y2="171" strokeWidth="0.8" />
              <line x1="168" y1="160" x2="168" y2="165" strokeWidth="0.8" />
              <line x1="228" y1="160" x2="228" y2="165" strokeWidth="0.8" />
            </g>
            <circle cx="168" cy="165" r="1.5" fill="#EF4444" />
            <circle cx="228" cy="165" r="1.5" fill="#EF4444" />

            {/* CORE 0 (RV32I) — Côté gauche */}
            <g transform="translate(136, 171)">
              <rect x="0" y="0" width="59" height="52" rx="1.5" fill="#18181B" stroke="#3F3F46" strokeWidth="0.75" />
              <text x="29.5" y="10" textAnchor="middle" fontSize="5.2" fontFamily="monospace" fill="#E4E4E7" fontWeight="bold">
                CORE_0 (RV32I)
              </text>
              {/* Pipeline ALU & FPU */}
              <rect x="4" y="14" width="23" height="34" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
              <text x="15.5" y="32" textAnchor="middle" fontSize="5.5" fontFamily="monospace" fill="#A1A1AA" fontWeight="600">
                ALU
              </text>
              <text x="15.5" y="41" textAnchor="middle" fontSize="3.8" fontFamily="monospace" fill="#71717A">
                32b
              </text>
              {/* Caches L1-I & L1-D */}
              <rect x="30" y="14" width="25" height="15" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
              <text x="42.5" y="24" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="#A1A1AA">
                L1-I
              </text>
              <rect x="30" y="33" width="25" height="15" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
              <text x="42.5" y="43" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="#A1A1AA">
                L1-D
              </text>
            </g>

            {/* CORE 1 (RV32I) — Côté droit */}
            <g transform="translate(201, 171)">
              <rect x="0" y="0" width="59" height="52" rx="1.5" fill="#18181B" stroke="#3F3F46" strokeWidth="0.75" />
              <text x="29.5" y="10" textAnchor="middle" fontSize="5.2" fontFamily="monospace" fill="#E4E4E7" fontWeight="bold">
                CORE_1 (RV32I)
              </text>
              {/* Pipeline ALU */}
              <rect x="4" y="14" width="23" height="34" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
              <text x="15.5" y="32" textAnchor="middle" fontSize="5.5" fontFamily="monospace" fill="#A1A1AA" fontWeight="600">
                ALU
              </text>
              <text x="15.5" y="41" textAnchor="middle" fontSize="3.8" fontFamily="monospace" fill="#71717A">
                32b
              </text>
              {/* Caches L1-I & L1-D */}
              <rect x="30" y="14" width="25" height="15" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
              <text x="42.5" y="24" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="#A1A1AA">
                L1-I
              </text>
              <rect x="30" y="33" width="25" height="15" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
              <text x="42.5" y="43" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="#A1A1AA">
                L1-D
              </text>
            </g>

            {/* Interface Basse : DDR5 & PCIe / Microélectronique */}
            <g transform="translate(136, 228)">
              {/* Contrôleur mémoire DDR5 */}
              <rect x="0" y="0" width="59" height="24" rx="1.5" fill="#1C1C1E" stroke="#3A3A3C" strokeWidth="0.75" />
              <text x="29.5" y="11" textAnchor="middle" fontSize="4.8" fontFamily="monospace" fill="#A1A1AA" fontWeight="600">
                DDR5_CTRL
              </text>
              <text x="29.5" y="19" textAnchor="middle" fontSize="3.8" fontFamily="monospace" fill="#71717A">
                PHY 6400 MT/s
              </text>

              {/* Interface PCIe Gen5 / SoC Bus */}
              <rect x="65" y="0" width="59" height="24" rx="1.5" fill="#1C1C1E" stroke="#3A3A3C" strokeWidth="0.75" />
              <text x="94.5" y="11" textAnchor="middle" fontSize="4.8" fontFamily="monospace" fill="#A1A1AA" fontWeight="600">
                PCIe_GEN5_PHY
              </text>
              <text x="94.5" y="19" textAnchor="middle" fontSize="3.8" fontFamily="monospace" fill="#71717A">
                x16 DUAL-LANE
              </text>
            </g>

            {/* Sérigraphie laser technique en overlay bas */}
            <g className="font-mono text-paper" opacity="0.9">
              <text x="146" y="261" fontSize="5.5" letterSpacing="0.8" className="fill-paper/60 font-semibold">
                MINES-EMSE × POLIMI
              </text>
              <text x="250" y="261" fontSize="5.5" textAnchor="end" letterSpacing="0.5" className={isDebug ? "fill-amber-400 font-bold" : "fill-signal"}>
                {isDebug ? "HALT: STEP" : clockSurge ? "CLK: 120 MHz" : "LOT: AD-2027"}
              </text>
            </g>
          </g>
        </svg>
      </motion.div>

      {/* Légende bas technique */}
      <div className="mt-3 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — soc silicium & banc interactif</span>
        <span className="text-signal font-semibold">
          {isDebug ? "PAUSED (DEBUG HALT)" : clockSurge ? "CLOCK ×3.6 (120 MHZ)" : "32.768 KHZ"}
        </span>
      </div>
    </div>
  );
}
