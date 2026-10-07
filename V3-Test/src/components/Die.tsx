import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Chip die (PCB interactif & processeur RV32I) ----------------
 * Conception électronique fidèle :
 * - Boîtier QFP central en silicium noir mat avec broches métalliques (pins & pads)
 *   attachées directement au pourtour du chip.
 * - Cœur RISC-V RV32I à l'intérieur du boîtier : slug thermique cuivre orange, marquage laser,
 *   bus internes et statut d'exécution temps réel.
 * - Banc logique multi-portes en haut à droite (zone parfaitement dégagée de la photo) :
 *   boutons poussoirs tactiles A & B alimentant simultanément 3 portes logiques ANSI
 *   distinctes (XOR, AND, OR) avec leurs voyants LED et points de test dédiés.
 * - Commutateur SPDT RUN/DEBUG et bouton CLK PULSE en bas à gauche.
 * - Condensateurs CMS 0603, résistances et points de test conformes aux normes CAO.
 * -------------------------------------------------------------------------- */

// Condensateurs de découplage CMS (0603)
const SM_CAPS = [
  { x: 200, y: 78, vertical: false, label: "C1" },  // VDD decoupling top
  { x: 200, y: 322, vertical: false, label: "C2" }, // GND decoupling bottom
  { x: 74, y: 220, vertical: true, label: "C3" },   // Filter CLK input
  { x: 330, y: 220, vertical: false, label: "C4" }, // VREF analog filter
];

export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 120, damping: 18 });
  const { tr } = useLang();

  // Entrées logiques A et B
  const [logicA, setLogicA] = useState(false);
  const [logicB, setLogicB] = useState(true);

  // Sorties simultanées des portes logiques connectées aux mêmes boutons
  const outXOR = logicA !== logicB;
  const outAND = logicA && logicB;
  const outOR = logicA || logicB;

  // Horloge & mode DEBUG
  const [clockSurge, setClockSurge] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [isDebug, setIsDebug] = useState(false);

  const triggerClockPulse = () => {
    setPulseCount((c) => c + 1);
    setClockSurge(true);
    setTimeout(() => setClockSurge(false), 850);
  };

  const animDuration = isDebug ? 999999 : clockSurge ? 0.35 : 1.4;

  return (
    <div className="relative w-full max-w-[420px] pb-6 [perspective:1200px]">
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative aspect-square w-full select-none [transform-style:preserve-3d]"
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
        <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible font-mono text-[10px]">
          <defs>
            {/* Lueur pour LEDs CMS */}
            <filter id="glow-led" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Trame cuivre pour le thermal slug */}
            <pattern id="slug-cross" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#9A3412" strokeWidth="1" />
            </pattern>
          </defs>

          {/* =================================================================
              1. SUBSTRAT PCB NOIR & REPÈRES DE FABRICATION (FIDUCIALS)
              ================================================================= */}
          <rect width="400" height="400" rx="3" fill="#0C0D10" stroke="#27272A" strokeWidth="1.5" />

          {/* Repères fiduciels de centrage CMS aux 4 coins */}
          {[
            { cx: 20, cy: 20 },
            { cx: 380, cy: 20 },
            { cx: 20, cy: 380 },
            { cx: 380, cy: 380 },
          ].map((f, i) => (
            <g key={`fid-${i}`}>
              <circle cx={f.cx} cy={f.cy} r="4" fill="none" stroke="#52525B" strokeWidth="0.8" />
              <circle cx={f.cx} cy={f.cy} r="1.4" fill="#FF4D00" />
            </g>
          ))}

          {/* =================================================================
              2. PISTES PCB DE ROUTAGE
              ================================================================= */}
          {/* Rail VDD & GND principaux reliés aux broches du chip */}
          <path d="M 200 120 V 50" stroke="#F59E0B" strokeWidth="1.25" fill="none" />
          <path d="M 200 280 V 350" stroke="#71717A" strokeWidth="1.25" fill="none" />

          {/* Pistes de bus de données (Cyan, Emerald, Violet) */}
          <path d="M 120 170 H 46" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
          <path d="M 120 190 H 46" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <path d="M 120 210 H 46" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />
          <path d="M 170 280 V 350" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
          <path d="M 230 280 V 350" stroke="#F43F5E" strokeWidth="1.2" fill="none" />

          {/* Paquets animés sur le bus de données */}
          {!isDebug && (
            <>
              <motion.circle
                cx={46}
                cy={170}
                r={2}
                fill="#06B6D4"
                animate={{ cx: [46, 120] }}
                transition={{ duration: animDuration, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle
                cx={120}
                cy={190}
                r={2}
                fill="#10B981"
                animate={{ cx: [120, 46] }}
                transition={{ duration: animDuration, repeat: Infinity, ease: "linear", delay: 0.3 }}
              />
            </>
          )}

          {/* =================================================================
              3. BANC LOGIQUE MULTI-PORTES (HAUT-DROITE, TOTALEMENT DÉGAGÉ)
              Boutons A & B reliés en parallèle à 3 portes : XOR, AND, OR
              ================================================================= */}
          {/* Lignes d'alimentation des boutons tactiles A et B */}
          <path d="M 276 26 V 40 H 262 V 48" stroke="#3F3F46" strokeWidth="1.2" fill="none" />
          <path d="M 296 26 V 34 H 262 V 80" stroke="#3F3F46" strokeWidth="1.2" fill="none" />

          {/* Rail commun A (Orange vif quand A=1) */}
          <path
            d="M 278 58 H 296 V 144"
            stroke={logicA ? "#FF4D00" : "#3F3F46"}
            strokeWidth={logicA ? 1.6 : 1.2}
            fill="none"
          />
          {/* Rail commun B (Orange vif quand B=1) */}
          <path
            d="M 278 90 H 304 V 156"
            stroke={logicB ? "#FF4D00" : "#3F3F46"}
            strokeWidth={logicB ? 1.6 : 1.2}
            fill="none"
          />

          {/* Bouton tactile A */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)}>
            <rect x="254" y="48" width="24" height="20" rx="2" fill="#1F2028" stroke="#475569" strokeWidth="1" />
            <circle cx="266" cy="58" r="5.5" fill={logicA ? "#FF4D00" : "#475569"} stroke="#334155" strokeWidth="0.8" />
            <text x="266" y="60.5" fontSize="5.5" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">A</text>
            <text x="248" y="60" fontSize="5.5" textAnchor="end" fill="#9CA3AF" className="font-mono">{logicA ? "1" : "0"}</text>
          </g>

          {/* Bouton tactile B */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)}>
            <rect x="254" y="80" width="24" height="20" rx="2" fill="#1F2028" stroke="#475569" strokeWidth="1" />
            <circle cx="266" cy="90" r="5.5" fill={logicB ? "#FF4D00" : "#475569"} stroke="#334155" strokeWidth="0.8" />
            <text x="266" y="92.5" fontSize="5.5" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">B</text>
            <text x="248" y="92" fontSize="5.5" textAnchor="end" fill="#9CA3AF" className="font-mono">{logicB ? "1" : "0"}</text>
          </g>

          {/* Branchements des Rails A & B vers les 3 portes logiques */}
          {/* Connexions vers Porte 1 : XOR */}
          <path d="M 296 52 H 312" stroke={logicA ? "#FF4D00" : "#3F3F46"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 304 64 H 312" stroke={logicB ? "#FF4D00" : "#3F3F46"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="296" cy="52" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="304" cy="64" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          {/* Connexions vers Porte 2 : AND */}
          <path d="M 296 98 H 312" stroke={logicA ? "#FF4D00" : "#3F3F46"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 304 110 H 312" stroke={logicB ? "#FF4D00" : "#3F3F46"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="296" cy="98" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="304" cy="110" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          {/* Connexions vers Porte 3 : OR */}
          <path d="M 296 144 H 312" stroke={logicA ? "#FF4D00" : "#3F3F46"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 304 156 H 312" stroke={logicB ? "#FF4D00" : "#3F3F46"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="296" cy="144" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="304" cy="156" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          {/* --- PORTE 1 : ANSI XOR (A ⊕ B) --- */}
          <g>
            <path d="M 310 48 Q 315 58 310 68" fill="none" stroke="#18181B" strokeWidth="1.3" strokeLinecap="round" />
            <path
              d="M 314 48 Q 326 50 334 58 Q 326 66 314 68 Q 319 58 314 48 Z"
              fill="#181A22"
              stroke="#FF4D00"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="323" y="44" fontSize="5" textAnchor="middle" fill="#FF4D00" fontWeight="bold">XOR</text>

            {/* Piste de sortie XOR vers LED et broche chip */}
            <path d="M 334 58 H 356" stroke={outXOR ? "#FF4D00" : "#3F3F46"} strokeWidth={outXOR ? 1.6 : 1} fill="none" />
            {/* LED XOR */}
            <g transform="translate(356, 58)">
              <circle cx="0" cy="0" r="3.5" fill={outXOR ? "#FF4D00" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outXOR ? "#FF4D00" : "#71717A"}>
                ={outXOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* --- PORTE 2 : ANSI AND (A · B) --- */}
          <g>
            <path
              d="M 312 94 H 322 A 10 10 0 0 1 322 114 H 312 Z"
              fill="#181A22"
              stroke="#10B981"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="322" y="90" fontSize="5" textAnchor="middle" fill="#10B981" fontWeight="bold">AND</text>

            {/* Piste de sortie AND vers LED */}
            <path d="M 332 104 H 356" stroke={outAND ? "#10B981" : "#3F3F46"} strokeWidth={outAND ? 1.6 : 1} fill="none" />
            {/* LED AND */}
            <g transform="translate(356, 104)">
              <circle cx="0" cy="0" r="3.5" fill={outAND ? "#10B981" : "#27272A"} filter={outAND ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outAND ? "#10B981" : "#71717A"}>
                ={outAND ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* --- PORTE 3 : ANSI OR (A + B) --- */}
          <g>
            <path
              d="M 312 140 Q 317 150 312 160 Q 324 160 334 150 Q 324 140 312 140 Z"
              fill="#181A22"
              stroke="#8B5CF6"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="322" y="136" fontSize="5" textAnchor="middle" fill="#8B5CF6" fontWeight="bold">OR</text>

            {/* Piste de sortie OR vers LED */}
            <path d="M 334 150 H 356" stroke={outOR ? "#8B5CF6" : "#3F3F46"} strokeWidth={outOR ? 1.6 : 1} fill="none" />
            {/* LED OR */}
            <g transform="translate(356, 150)">
              <circle cx="0" cy="0" r="3.5" fill={outOR ? "#8B5CF6" : "#27272A"} filter={outOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outOR ? "#8B5CF6" : "#71717A"}>
                ={outOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Traces reliant les sorties des portes aux broches d'entrée du processeur */}
          <path d="M 342 58 V 70 H 280 V 170 H 264" stroke={outXOR ? "#FF4D00" : "#3F3F46"} strokeWidth="1.2" fill="none" />
          <path d="M 342 104 V 116 H 280 V 190 H 264" stroke={outAND ? "#10B981" : "#3F3F46"} strokeWidth="1.2" fill="none" />
          <path d="M 342 150 V 162 H 280 V 210 H 264" stroke={outOR ? "#8B5CF6" : "#3F3F46"} strokeWidth="1.2" fill="none" />

          {/* =================================================================
              4. COMMUTATEUR SPDT RUN / DEBUG ET CLK PULSE (BAS-GAUCHE)
              Hors d'atteinte de la photo polaroid
              ================================================================= */}
          {/* Piste d'horloge reliant le bouton CLK au chip */}
          <path d="M 74 250 H 120" stroke={clockSurge ? "#FF4D00" : "#3F3F46"} strokeWidth="1.25" fill="none" />

          {/* Bouton tactile CLOCK PULSE */}
          <g className="cursor-pointer" onClick={triggerClockPulse} transform="translate(54, 240)">
            <rect x="0" y="0" width="20" height="20" rx="2" fill="#1F2028" stroke="#475569" strokeWidth="1" />
            <circle cx="10" cy="10" r="5.5" fill={clockSurge ? "#FF4D00" : "#64748B"} stroke="#334155" strokeWidth="0.8" />
            <text x="10" y="12" fontSize="4.5" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">CLK</text>
            <text x="-4" y="12" fontSize="5" textAnchor="end" fill="#9CA3AF">PULSE</text>
          </g>

          {/* LED Horloge clignotante */}
          <g transform="translate(86, 250)">
            <circle cx="0" cy="0" r="3" fill={clockSurge ? "#FF4D00" : "#334155"} filter={clockSurge ? "url(#glow-led)" : undefined} />
            <text x="6" y="2" fontSize="5" fill="#71717A">SYS_CLK</text>
          </g>

          {/* Commutateur SPDT RUN / DEBUG */}
          <g className="cursor-pointer" onClick={() => setIsDebug((d) => !d)} transform="translate(54, 290)">
            {/* Boîtier métallique chromé du commutateur */}
            <rect x="0" y="0" width="30" height="15" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            {/* Curseur mobile */}
            <rect
              x={isDebug ? "16" : "2"}
              y="2"
              width="12"
              height="11"
              rx="1.5"
              fill={isDebug ? "#F59E0B" : "#10B981"}
              stroke="#0F172A"
              strokeWidth="0.8"
            />
            {/* Voyants LED RUN & DBG */}
            <circle cx="4" cy="-6" r="2.2" fill={!isDebug ? "#10B981" : "#334155"} filter={!isDebug ? "url(#glow-led)" : undefined} />
            <text x="9" y="-4" fontSize="4.5" fill={!isDebug ? "#10B981" : "#64748B"} fontWeight="bold">RUN</text>
            <circle cx="22" cy="-6" r="2.2" fill={isDebug ? "#F59E0B" : "#334155"} filter={isDebug ? "url(#glow-led)" : undefined} />
            <text x="27" y="-4" fontSize="4.5" fill={isDebug ? "#F59E0B" : "#64748B"} fontWeight="bold">DBG</text>
          </g>

          {/* =================================================================
              5. BOÎTIER CENTRAL IC QFP (CHIP SILICIUM AVEC PINS DIRECTES)
              Pins métalliques émergeant directement des 4 côtés du boîtier !
              ================================================================= */}
          {/* PINS & SOLDER PADS ATTACHÉS DIRECTEMENT AU CHIP (TOP, BOTTOM, LEFT, RIGHT) */}
          {/* Top Pins (x: 140 à 260) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const px = 152 + i * 14;
            return (
              <g key={`pin-t-${i}`}>
                {/* Pastille de soudure PCB */}
                <rect x={px - 2.5} y={118} width={5} height={10} rx={0.5} fill="#52525B" />
                {/* Broche métallique gull-wing sortant du chip */}
                <rect x={px - 1.5} y={122} width={3} height={14} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* Bottom Pins (x: 140 à 260) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const px = 152 + i * 14;
            return (
              <g key={`pin-b-${i}`}>
                <rect x={px - 2.5} y={272} width={5} height={10} rx={0.5} fill="#52525B" />
                <rect x={px - 1.5} y={264} width={3} height={14} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* Left Pins (y: 140 à 260) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const py = 152 + i * 14;
            return (
              <g key={`pin-l-${i}`}>
                <rect x={118} y={py - 2.5} width={10} height={5} rx={0.5} fill="#52525B" />
                <rect x={122} y={py - 1.5} width={14} height={3} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* Right Pins (y: 140 à 260) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const py = 152 + i * 14;
            return (
              <g key={`pin-r-${i}`}>
                <rect x={272} y={py - 2.5} width={10} height={5} rx={0.5} fill="#52525B" />
                <rect x={264} y={py - 1.5} width={14} height={3} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* CORPS DU BOÎTIER IC SILICIUM NOIR MAT (136x136 à 264x264) */}
          <path
            d="M 148 136 H 264 V 264 H 136 V 148 Z"
            fill="#111216"
            stroke="#27272A"
            strokeWidth="1.5"
          />

          {/* Repère Pin 1 (Index laser) */}
          <circle cx="144" cy="144" r="3.5" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
          <circle cx="144" cy="144" r="1.5" fill="#FF4D00" />

          {/* THERMAL SLUG EN CUIVRE ORANGE AVEC CROSS-HATCH */}
          <g transform="translate(148, 148)">
            <rect x="0" y="0" width="46" height="46" rx="2" fill="#EA580C" stroke="#FF7A33" strokeWidth="1" />
            <rect x="0" y="0" width="46" height="46" fill="url(#slug-cross)" opacity="0.4" />
            <line x1="0" y1="0" x2="46" y2="46" stroke="#FFEDD5" strokeWidth="0.6" opacity="0.3" />
            <line x1="46" y1="0" x2="0" y2="46" stroke="#FFEDD5" strokeWidth="0.6" opacity="0.3" />
          </g>

          {/* BUS INTERNES MICROÉLECTRONIQUES EN HAUT À DROITE DU CHIP */}
          <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.75">
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`sub-${i}`} x1={204 + i * 11} y1="148" x2={204 + i * 11} y2="194" />
            ))}
          </g>

          {/* MARQUAGE LASER DU CŒUR RISC-V (EXCLUSIVEMENT TECHNIQUE, SANS ÉCOLE) */}
          <g className="font-mono">
            <text x="148" y="210" fontSize="7.5" fontWeight="bold" fill="#F4F4F5" letterSpacing="0.6">
              RV32I CORE
            </text>
            <text x="148" y="222" fontSize="5.8" fill="#A1A1AA" letterSpacing="0.4">
              32-BIT PIPELINED CPU
            </text>
            <text x="148" y="234" fontSize="5.5" fill="#FF4D00" fontWeight="bold" letterSpacing="0.4">
              ALU · REGFILE x0..x31
            </text>
            <text x="148" y="246" fontSize="5" fill="#71717A" letterSpacing="0.4">
              FREQ: 120 MHz · LOT: AD-27
            </text>
            <text x="148" y="257" fontSize="5" fill={isDebug ? "#F59E0B" : clockSurge ? "#FF4D00" : "#10B981"} fontWeight="bold">
              STATUS: {isDebug ? "HALT (STEP)" : clockSurge ? "SURGE (120MHz)" : "ACTIVE PIPELINE"}
            </text>
          </g>

          {/* =================================================================
              6. COMPOSANTS CMS (0603) & POINTS DE TEST SOUDÉS SUR LE PCB
              ================================================================= */}
          {/* Condensateurs CMS */}
          {SM_CAPS.map((cap) => (
            <g key={cap.label} transform={`translate(${cap.x}, ${cap.y})`}>
              {cap.vertical ? (
                <>
                  <rect x="-4" y="-7" width="8" height="14" rx="0.5" fill="#52525B" />
                  <rect x="-3.5" y="-6.5" width="7" height="13" rx="0.5" fill="#1E293B" stroke="#09090B" strokeWidth="0.6" />
                  <rect x="-3.5" y="-6.5" width="7" height="3" fill="#E4E4E7" />
                  <rect x="-3.5" y="3.5" width="7" height="3" fill="#E4E4E7" />
                  <text x="6" y="2" fontSize="4.5" fill="#71717A">{cap.label}</text>
                </>
              ) : (
                <>
                  <rect x="-7" y="-4" width="14" height="8" rx="0.5" fill="#52525B" />
                  <rect x="-6.5" y="-3.5" width="13" height="7" rx="0.5" fill="#1E293B" stroke="#09090B" strokeWidth="0.6" />
                  <rect x="-6.5" y="-3.5" width="3" height="7" fill="#E4E4E7" />
                  <rect x="3.5" y="-3.5" width="3" height="7" fill="#E4E4E7" />
                  <text x="-7" y="-6" fontSize="4.5" fill="#71717A">{cap.label}</text>
                </>
              )}
            </g>
          ))}

          {/* Points de test avec anneaux de cuivre */}
          {[
            { x: 300, y: 190, l: "TP_GPIO", active: outXOR },
            { x: 200, y: 350, l: "TP_GND", active: false },
            { x: 100, y: 200, l: "TP_RX", active: true },
          ].map((tp) => (
            <g key={tp.l} transform={`translate(${tp.x}, ${tp.y})`}>
              <circle cx="0" cy="0" r="2.8" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.1" fill={tp.active ? "#FF4D00" : "#52525B"} />
              <text x="5" y="2" fontSize="4.5" fill="#71717A">{tp.l}</text>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Légende bas discrète et technique */}
      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — processeur rv32i & banc silicium (touch & gates)</span>
        <span className="text-signal font-semibold">
          {isDebug ? "PAUSED (DEBUG)" : `XOR:${outXOR ? 1 : 0} · AND:${outAND ? 1 : 0} · OR:${outOR ? 1 : 0}`}
        </span>
      </div>
    </div>
  );
}
