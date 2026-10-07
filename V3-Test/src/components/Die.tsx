import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip & PCB Lab ----------------
 * Conception électronique & CAO :
 * - Fond 100% transparent (fond crème du portfolio préservé).
 * - Câblage orthogonal 100% connecté et cohérent (zéro composant inutile en bas à gauche).
 * - Boutons tactiles A & B alimentant simultanément 3 portes logiques (XOR, AND, OR).
 * - Sorties des portes acheminées via résistances CMS R1, R2, R3 vers les broches du processeur.
 * - Cœur RISC-V SoC avec modules internes VIVANTS et RÉACTIFS :
 *   - SRAM 32KB : matrice de cellules mémoires qui s'allument et changent d'état en temps réel.
 *   - ALU & Banque de registres RV32I : mise à jour instantanée des registres x10 à x14.
 *   - Oscillateur quartz 120 MHz et bouton Reset fonctionnel à gauche.
 * -------------------------------------------------------------------------- */

export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 130, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-7, 7]), { stiffness: 130, damping: 18 });
  const { tr } = useLang();

  // Entrées logiques A et B (1-bit)
  const [logicA, setLogicA] = useState(false);
  const [logicB, setLogicB] = useState(true);

  // Sorties simultanées des 3 portes logiques
  const outXOR = logicA !== logicB;
  const outAND = logicA && logicB;
  const outOR = logicA || logicB;

  const valA = logicA ? 1 : 0;
  const valB = logicB ? 1 : 0;

  // Horloge active
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setClockTick((t) => (t + 1) % 8);
    }, 450);
    return () => clearInterval(id);
  }, []);

  // Action Reset
  const handleReset = () => {
    setLogicA(false);
    setLogicB(false);
  };

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
            <filter id="glow-led" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Trame cuivre pour le thermal slug */}
            <pattern id="slug-cross" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#9A3412" strokeWidth="0.9" />
            </pattern>
          </defs>

          {/* =================================================================
              1. SUBSTRAT PCB TRANSPARENT & LIGNE DE CADRE
              ================================================================= */}
          <rect
            x="12"
            y="12"
            width="376"
            height="376"
            rx="6"
            fill="none"
            stroke="#27272A"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.35"
          />

          {/* Repères fiduciels aux 4 coins */}
          {[
            { cx: 24, cy: 24 },
            { cx: 376, cy: 24 },
            { cx: 24, cy: 376 },
            { cx: 376, cy: 376 },
          ].map((f, i) => (
            <g key={`fid-${i}`}>
              <circle cx={f.cx} cy={f.cy} r="4" fill="none" stroke="#71717A" strokeWidth="0.8" />
              <circle cx={f.cx} cy={f.cy} r="1.4" fill="#FF4D00" />
            </g>
          ))}

          {/* Sérigraphie de version de carte */}
          <text x="366" y="372" textAnchor="end" fontSize="5" fill="#71717A" opacity="0.6">
            EVAL-RV32I :: SOC TESTBENCH
          </text>

          {/* =================================================================
              2. ALIMENTATION VDD & GND (TOP & BOTTOM)
              ================================================================= */}
          {/* Ligne VDD top connectée à C1 et au pin d'alim du chip */}
          <path d="M 200 30 V 126" stroke="#D97706" strokeWidth="1.2" fill="none" />
          <g transform="translate(200, 70)">
            <rect x="-7" y="-3.5" width="14" height="7" rx="0.5" fill="#52525B" />
            <rect x="-6.5" y="-3" width="13" height="6" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-6.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <text x="0" y="-5" textAnchor="middle" fontSize="4.5" fill="#71717A">C1 (100nF)</text>
          </g>
          <g transform="translate(200, 30)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#D97706" />
            <text x="5" y="2" fontSize="4.5" fill="#71717A">VDD</text>
          </g>

          {/* Ligne GND bottom connectée à C2 et au pin GND du chip */}
          <path d="M 200 274 V 370" stroke="#71717A" strokeWidth="1.2" fill="none" />
          <g transform="translate(200, 320)">
            <rect x="-7" y="-3.5" width="14" height="7" rx="0.5" fill="#52525B" />
            <rect x="-6.5" y="-3" width="13" height="6" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-6.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <text x="0" y="-5" textAnchor="middle" fontSize="4.5" fill="#71717A">C2 (GND)</text>
          </g>
          <g transform="translate(200, 370)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#71717A" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#71717A" />
            <text x="5" y="2" fontSize="4.5" fill="#71717A">GND</text>
          </g>

          {/* =================================================================
              3. HORLOGE OSCILLATEUR QUARTZ 120 MHz & BOUTON RESET (GAUCHE)
              Composants utiles, connectés aux broches du microprocesseur
              ================================================================= */}
          {/* Oscillateur Quartz 120 MHz Y1 relié au pin CLK_IN (y=175) */}
          <g transform="translate(48, 162)">
            <rect x="0" y="0" width="48" height="26" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <rect x="2" y="2" width="44" height="22" rx="1" fill="#0F172A" />
            <text x="24" y="12" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#E2E8F0">OSC 120M</text>
            <text x="24" y="20" textAnchor="middle" fontSize="4.2" fill="#FF4D00">Y1 QUARTZ</text>
          </g>
          <path d="M 96 175 H 126" stroke="#FF4D00" strokeWidth="1.2" fill="none" />
          <circle
            cx="110"
            cy="175"
            r="2"
            fill={clockTick % 2 === 0 ? "#FF4D00" : "#52525B"}
            filter={clockTick % 2 === 0 ? "url(#glow-led)" : undefined}
          />

          {/* Bouton Tactile RESET relié au pin NRST (y=220) */}
          <g className="cursor-pointer" onClick={handleReset} transform="translate(54, 210)">
            <rect x="0" y="0" width="36" height="20" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="18" cy="10" r="5" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
            <text x="18" y="12" fontSize="5" textAnchor="middle" className="font-mono font-bold fill-white">RST</text>
          </g>
          <path d="M 90 220 H 126" stroke="#71717A" strokeWidth="1.2" fill="none" />
          <text x="100" y="215" fontSize="4.5" fill="#71717A">NRST</text>

          {/* =================================================================
              4. BANC DE TEST MULTI-PORTES (HAUT-DROITE)
              Boutons A & B et portes XOR, AND, OR
              ================================================================= */}
          {/* Bouton A */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)} transform="translate(262, 32)">
            <rect x="0" y="0" width="36" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="12" cy="11" r="5.5" fill={logicA ? "#FF4D00" : "#334155"} stroke="#1E293B" strokeWidth="0.8" />
            <text x="24" y="14" fontSize="7" fontWeight="bold" fill={logicA ? "#FF4D00" : "#E2E8F0"}>
              A:{valA}
            </text>
          </g>

          {/* Bouton B */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)} transform="translate(262, 60)">
            <rect x="0" y="0" width="36" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="12" cy="11" r="5.5" fill={logicB ? "#FF4D00" : "#334155"} stroke="#1E293B" strokeWidth="0.8" />
            <text x="24" y="14" fontSize="7" fontWeight="bold" fill={logicB ? "#FF4D00" : "#E2E8F0"}>
              B:{valB}
            </text>
          </g>

          {/* Connexion directe de A et B vers les broches du microcontrôleur */}
          {/* Ligne A vers Pin 1 droite du chip (y=145) */}
          <path d="M 280 54 V 145 H 274" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />
          {/* Ligne B vers Pin 2 droite du chip (y=160) */}
          <path d="M 280 82 V 160 H 274" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />

          {/* Rails de distribution vers les portes logiques */}
          {/* Rail A (x=312) */}
          <path
            d="M 298 43 H 312 V 145"
            stroke={logicA ? "#FF4D00" : "#52525B"}
            strokeWidth={logicA ? 1.6 : 1}
            fill="none"
          />
          {/* Rail B (x=322) */}
          <path
            d="M 298 71 H 322 V 155"
            stroke={logicB ? "#FF4D00" : "#52525B"}
            strokeWidth={logicB ? 1.6 : 1}
            fill="none"
          />

          {/* --- PORTE 1 : XOR (Y = A ⊕ B) à y=48 --- */}
          <path d="M 312 43 H 328" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 322 53 H 328" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="312" cy="43" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="322" cy="53" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path d="M 326 39 Q 331 48 326 57" fill="none" stroke="#27272A" strokeWidth="1.3" strokeLinecap="round" />
            <path
              d="M 330 39 Q 342 41 350 48 Q 342 55 330 57 Q 334 48 330 39 Z"
              fill="#181A22"
              stroke="#FF4D00"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="339" y="35" fontSize="5" textAnchor="middle" fill="#FF4D00" fontWeight="bold">XOR</text>

            {/* Sortie XOR vers LED probe */}
            <path d="M 350 48 H 368" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth={outXOR ? 1.6 : 1} fill="none" />
            <g transform="translate(368, 48)">
              <circle cx="0" cy="0" r="3.5" fill={outXOR ? "#FF4D00" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outXOR ? "#FF4D00" : "#71717A"}>
                ={outXOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Ligne de sortie XOR vers Pin 3 (y=175) avec résistance R1 */}
          <path d="M 358 48 V 64 H 384 V 175 H 274" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />
          <g transform="translate(330, 175)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4.2" fill="#71717A">R1 (1k)</text>
          </g>

          {/* --- PORTE 2 : AND (Y = A · B) à y=96 --- */}
          <path d="M 312 91 H 328" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 322 101 H 328" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="312" cy="91" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="322" cy="101" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path
              d="M 328 87 H 338 A 9 9 0 0 1 338 105 H 328 Z"
              fill="#181A22"
              stroke="#10B981"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="337" y="83" fontSize="5" textAnchor="middle" fill="#10B981" fontWeight="bold">AND</text>

            {/* Sortie AND vers LED probe */}
            <path d="M 347 96 H 368" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth={outAND ? 1.6 : 1} fill="none" />
            <g transform="translate(368, 96)">
              <circle cx="0" cy="0" r="3.5" fill={outAND ? "#10B981" : "#27272A"} filter={outAND ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outAND ? "#10B981" : "#71717A"}>
                ={outAND ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Ligne de sortie AND vers Pin 4 (y=190) avec résistance R2 */}
          <path d="M 356 96 V 110 H 374 V 190 H 274" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth="1.2" fill="none" />
          <g transform="translate(330, 190)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4.2" fill="#71717A">R2 (1k)</text>
          </g>

          {/* --- PORTE 3 : OR (Y = A + B) à y=144 --- */}
          <path d="M 312 139 H 328" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 322 149 H 328" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="312" cy="139" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="322" cy="149" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path
              d="M 328 135 Q 333 144 328 153 Q 339 153 348 144 Q 339 135 328 135 Z"
              fill="#181A22"
              stroke="#8B5CF6"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="337" y="131" fontSize="5" textAnchor="middle" fill="#8B5CF6" fontWeight="bold">OR</text>

            {/* Sortie OR vers LED probe */}
            <path d="M 348 144 H 368" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth={outOR ? 1.6 : 1} fill="none" />
            <g transform="translate(368, 144)">
              <circle cx="0" cy="0" r="3.5" fill={outOR ? "#8B5CF6" : "#27272A"} filter={outOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outOR ? "#8B5CF6" : "#71717A"}>
                ={outOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Ligne de sortie OR vers Pin 5 (y=205) avec résistance R3 */}
          <path d="M 354 144 V 205 H 274" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth="1.2" fill="none" />
          <g transform="translate(330, 205)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4.2" fill="#71717A">R3 (1k)</text>
          </g>

          {/* =================================================================
              5. BOÎTIER CENTRAL IC QFP (CHIP SILICIUM AVEC BROCHES REELLES)
              ================================================================= */}
          {/* BROCHES METALLIQUES SOUDEES (PINS GULL-WING) */}
          {/* Top Pins */}
          {Array.from({ length: 8 }).map((_, i) => {
            const px = 145 + i * 15;
            return (
              <g key={`pin-t-${i}`}>
                <rect x={px - 2.5} y={122} width={5} height={10} rx={0.5} fill="#52525B" />
                <rect x={px - 1.5} y={124} width={3} height={10} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}
          {/* Bottom Pins */}
          {Array.from({ length: 8 }).map((_, i) => {
            const px = 145 + i * 15;
            return (
              <g key={`pin-b-${i}`}>
                <rect x={px - 2.5} y={268} width={5} height={10} rx={0.5} fill="#52525B" />
                <rect x={px - 1.5} y={266} width={3} height={10} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}
          {/* Left Pins */}
          {Array.from({ length: 8 }).map((_, i) => {
            const py = 145 + i * 15;
            return (
              <g key={`pin-l-${i}`}>
                <rect x={122} y={py - 2.5} width={10} height={5} rx={0.5} fill="#52525B" />
                <rect x={124} y={py - 1.5} width={10} height={3} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}
          {/* Right Pins */}
          {Array.from({ length: 8 }).map((_, i) => {
            const py = 145 + i * 15;
            return (
              <g key={`pin-r-${i}`}>
                <rect x={268} y={py - 2.5} width={10} height={5} rx={0.5} fill="#52525B" />
                <rect x={266} y={py - 1.5} width={10} height={3} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* CORPS DU BOÎTIER IC SILICIUM NOIR MAT (130x130 à 270x270) */}
          <path
            d="M 144 130 H 270 V 270 H 130 V 144 Z"
            fill="#111216"
            stroke="#27272A"
            strokeWidth="1.5"
          />

          {/* Repère Pin 1 */}
          <circle cx="138" cy="138" r="3.5" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
          <circle cx="138" cy="138" r="1.5" fill="#FF4D00" />

          {/* --- MODULES INTERNES DYNAMIQUES DU SOC (REACTIFS AUX BOUTONS) --- */}

          {/* Module 1 : SLUG THERMIQUE CUIVRE ORANGE (Top-Left) */}
          <g transform="translate(138, 138)">
            <rect x="0" y="0" width="36" height="36" rx="1.5" fill="#EA580C" stroke="#FF7A33" strokeWidth="0.8" />
            <rect x="0" y="0" width="36" height="36" fill="url(#slug-cross)" opacity="0.45" />
            <line x1="0" y1="0" x2="36" y2="36" stroke="#FFEDD5" strokeWidth="0.6" opacity="0.3" />
            <line x1="36" y1="0" x2="0" y2="36" stroke="#FFEDD5" strokeWidth="0.6" opacity="0.3" />
            <rect x="3" y="10" width="30" height="16" fill="#111216" stroke="#FF4D00" strokeWidth="0.6" />
            <text x="18" y="20" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#FF4D00">THERMAL</text>
          </g>

          {/* Module 2 : BLOC MEMOIRE SRAM 32KB ACTIF (Top-Right) */}
          {/* Les cellules de la SRAM changent d'état en direct selon A, B, XOR, AND, OR ! */}
          <g transform="translate(180, 138)">
            <rect x="0" y="0" width="82" height="36" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="82" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">SRAM 32KB</text>
            <text x="78" y="6.5" textAnchor="end" fontSize="4" fill="#10B981">[WRITE OK]</text>

            {/* Matrice de cellules mémoires dynamiques */}
            <g transform="translate(4, 12)">
              {/* Ligne 0 : Mappée sur Entrées A et B */}
              <rect x="0" y="0" width="10" height="8" rx="0.5" fill={logicA ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="5" y="6" textAnchor="middle" fontSize="4" fill={logicA ? "#FFF" : "#71717A"}>{valA}</text>

              <rect x="13" y="0" width="10" height="8" rx="0.5" fill={logicB ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="18" y="6" textAnchor="middle" fontSize="4" fill={logicB ? "#FFF" : "#71717A"}>{valB}</text>

              {/* Ligne 1 : Mappée sur Sorties XOR, AND, OR */}
              <rect x="26" y="0" width="10" height="8" rx="0.5" fill={outXOR ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="31" y="6" textAnchor="middle" fontSize="4" fill={outXOR ? "#FFF" : "#71717A"}>{outXOR ? 1 : 0}</text>

              <rect x="39" y="0" width="10" height="8" rx="0.5" fill={outAND ? "#10B981" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="44" y="6" textAnchor="middle" fontSize="4" fill={outAND ? "#FFF" : "#71717A"}>{outAND ? 1 : 0}</text>

              <rect x="52" y="0" width="10" height="8" rx="0.5" fill={outOR ? "#8B5CF6" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="57" y="6" textAnchor="middle" fontSize="4" fill={outOR ? "#FFF" : "#71717A"}>{outOR ? 1 : 0}</text>

              {/* Adresse et statut bus SRAM */}
              <text x="0" y="20" fontSize="4.2" fill="#71717A">
                DATABUS: <tspan fill="#FF4D00" fontWeight="bold">0x0{valA}{valB}</tspan> · RET: <tspan fill="#10B981" fontWeight="bold">0x0{outXOR ? 1 : 0}</tspan>
              </text>
            </g>
          </g>

          {/* Module 3 : CŒUR RV32I ALU & REGFILE EN DIRECT (Center) */}
          <g transform="translate(138, 180)">
            <rect x="0" y="0" width="124" height="48" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="124" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">RV32I EXECUTION CORE</text>
            <text x="120" y="6.5" textAnchor="end" fontSize="4" fill="#FF4D00">x0..x31 REGFILE</text>

            {/* Registres du processeur mis à jour en direct */}
            <g transform="translate(6, 14)">
              {/* Ligne 1 : Registres a0 et a1 (Entrées) */}
              <text x="0" y="6" fontSize="4.5" fill="#A1A1AA">x10 (a0): <tspan fill={logicA ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{valA}</tspan></text>
              <text x="60" y="6" fontSize="4.5" fill="#A1A1AA">x11 (a1): <tspan fill={logicB ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{valB}</tspan></text>

              {/* Ligne 2 : Registres a2 (XOR), a3 (AND), a4 (OR) */}
              <text x="0" y="16" fontSize="4.5" fill="#A1A1AA">x12 (xor): <tspan fill={outXOR ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{outXOR ? 1 : 0}</tspan></text>
              <text x="60" y="16" fontSize="4.5" fill="#A1A1AA">x13 (and): <tspan fill={outAND ? "#10B981" : "#71717A"} fontWeight="bold">0x0{outAND ? 1 : 0}</tspan></text>

              {/* Ligne 3 : Registre a4 et indicateur Zero flag */}
              <text x="0" y="26" fontSize="4.5" fill="#A1A1AA">x14 (or): <tspan fill={outOR ? "#8B5CF6" : "#71717A"} fontWeight="bold">0x0{outOR ? 1 : 0}</tspan></text>
              <text x="60" y="26" fontSize="4.5" fill="#71717A">ZERO: <tspan fill={!outXOR ? "#10B981" : "#71717A"} fontWeight="bold">{!outXOR ? "1" : "0"}</tspan></text>
            </g>
          </g>

          {/* Module 4 : MARQUAGE LASER SERIGRAPHIE (Bottom) */}
          <g className="font-mono" transform="translate(138, 234)">
            <text x="0" y="8" fontSize="6.5" fontWeight="bold" fill="#F4F4F5" letterSpacing="0.5">
              RV32I SOC DIE
            </text>
            <text x="0" y="18" fontSize="5" fill="#A1A1AA" letterSpacing="0.3">
              FREQ: 120 MHz · LOT: AD-27
            </text>
            <text x="0" y="28" fontSize="5" fill="#10B981" fontWeight="bold">
              STATUS: PIPELINE EXECUTING
            </text>
          </g>
        </svg>
      </motion.div>

      {/* Légende bas discrète et technique */}
      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — processeur rv32i & banc logique multi-portes</span>
        <span className="text-signal font-semibold">
          XOR:{outXOR ? 1 : 0} · AND:{outAND ? 1 : 0} · OR:{outOR ? 1 : 0}
        </span>
      </div>
    </div>
  );
}
