import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip & PCB Lab ----------------
 * Conception électronique & CAO :
 * - Fond 100% transparent (s'intègre au papier crème du portfolio)
 * - Boîtier QFP central en silicium noir avec broches métalliques (pins) et
 *   pastilles de soudure CMS (pads) directement connectées au pourtour du chip.
 * - Cœur RISC-V SoC avec modules internes : SRAM 32KB, ALU & Control, Slug thermique cuivre.
 * - Câblage orthogonal parfait (zéro croisement incohérent) :
 *   - Boutons tactiles A et B en haut à droite (dégagés de la photo polaroid).
 *   - 3 portes logiques ANSI (XOR, AND, OR) alimentées en parallèle avec LEDs d'état.
 *   - Sorties des portes acheminées proprement vers les broches GPIO du microprocesseur via des résistances CMS 0603.
 * - En bas à gauche : commutateur SPDT RUN/DEBUG et bouton CLK PULSE avec LED cadencée.
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

  // Sorties simultanées des 3 portes logiques reliées aux mêmes entrées
  const outXOR = logicA !== logicB;
  const outAND = logicA && logicB;
  const outOR = logicA || logicB;

  // Horloge & mode DEBUG
  const [clockSurge, setClockSurge] = useState(false);
  const [isDebug, setIsDebug] = useState(false);

  const triggerClockPulse = () => {
    setClockSurge(true);
    setTimeout(() => setClockSurge(false), 800);
  };

  const animDuration = isDebug ? 999999 : clockSurge ? 0.35 : 1.5;

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
              1. SUBSTRAT PCB TRANSPARENT & LIGNE DE CADRE TECHNIQUE
              ================================================================= */}
          {/* Cadre discret de sérigraphie de la carte */}
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
            opacity="0.4"
          />

          {/* Repères fiduciels de précision PCB */}
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

          {/* Sérigraphie carte de test */}
          <text x="366" y="372" textAnchor="end" fontSize="5" fill="#71717A" opacity="0.6">
            EVAL-RV32I :: PCB REV 2.4
          </text>

          {/* =================================================================
              2. ALIMENTATION VDD & GND (TOP & BOTTOM)
              ================================================================= */}
          {/* Ligne VDD top reliée au condensateur C1 et au chip */}
          <path d="M 200 40 V 126" stroke="#D97706" strokeWidth="1.2" fill="none" />
          <g transform="translate(200, 76)">
            {/* Condensateur C1 (0603) */}
            <rect x="-7" y="-3.5" width="14" height="7" rx="0.5" fill="#52525B" />
            <rect x="-6.5" y="-3" width="13" height="6" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-6.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <text x="0" y="-5" textAnchor="middle" fontSize="4.5" fill="#71717A">C1 (VDD)</text>
          </g>
          {/* Test point TP_VDD */}
          <g transform="translate(200, 42)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#D97706" />
            <text x="5" y="2" fontSize="4.5" fill="#71717A">TP_VDD</text>
          </g>

          {/* Ligne GND bottom reliée au condensateur C2 et au chip */}
          <path d="M 200 274 V 360" stroke="#71717A" strokeWidth="1.2" fill="none" />
          <g transform="translate(200, 318)">
            {/* Condensateur C2 (0603) */}
            <rect x="-7" y="-3.5" width="14" height="7" rx="0.5" fill="#52525B" />
            <rect x="-6.5" y="-3" width="13" height="6" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-6.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="3" height="6" fill="#E4E4E7" />
            <text x="0" y="-5" textAnchor="middle" fontSize="4.5" fill="#71717A">C2 (GND)</text>
          </g>
          {/* Test point TP_GND */}
          <g transform="translate(200, 358)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#71717A" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#71717A" />
            <text x="5" y="2" fontSize="4.5" fill="#71717A">TP_GND</text>
          </g>

          {/* =================================================================
              3. BANC MULTI-PORTES (HAUT-DROITE - ENTIÈREMENT DÉGAGÉ ET PROPRE)
              Boutons A et B alimentant simultanément XOR, AND, OR
              ================================================================= */}
          {/* Bouton Tactile A */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)} transform="translate(254, 32)">
            <rect x="0" y="0" width="32" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="16" cy="11" r="6" fill={logicA ? "#FF4D00" : "#334155"} stroke="#1E293B" strokeWidth="0.8" />
            <text x="16" y="13.5" fontSize="6" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">A</text>
            <text x="-4" y="13.5" fontSize="6" textAnchor="end" fill="#A1A1AA" className="font-mono font-semibold">
              IN_A [{logicA ? "1" : "0"}]
            </text>
          </g>

          {/* Bouton Tactile B */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)} transform="translate(254, 62)">
            <rect x="0" y="0" width="32" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="16" cy="11" r="6" fill={logicB ? "#FF4D00" : "#334155"} stroke="#1E293B" strokeWidth="0.8" />
            <text x="16" y="13.5" fontSize="6" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">B</text>
            <text x="-4" y="13.5" fontSize="6" textAnchor="end" fill="#A1A1AA" className="font-mono font-semibold">
              IN_B [{logicB ? "1" : "0"}]
            </text>
          </g>

          {/* RAILS DE DISTRIBUTION ORTHOGONAUX : Rail A (x=298) & Rail B (x=306) */}
          <path
            d="M 286 43 H 298 V 145"
            stroke={logicA ? "#FF4D00" : "#52525B"}
            strokeWidth={logicA ? 1.6 : 1}
            fill="none"
          />
          <path
            d="M 286 73 H 306 V 155"
            stroke={logicB ? "#FF4D00" : "#52525B"}
            strokeWidth={logicB ? 1.6 : 1}
            fill="none"
          />

          {/* --- PORTE 1 : XOR (Y = A ⊕ B) à y=48 --- */}
          {/* Dérivation vers XOR */}
          <path d="M 298 43 H 314" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 306 53 H 314" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="298" cy="43" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="306" cy="53" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path d="M 312 39 Q 317 48 312 57" fill="none" stroke="#27272A" strokeWidth="1.3" strokeLinecap="round" />
            <path
              d="M 316 39 Q 328 41 336 48 Q 328 55 316 57 Q 320 48 316 39 Z"
              fill="#181A22"
              stroke="#FF4D00"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="325" y="35" fontSize="5" textAnchor="middle" fill="#FF4D00" fontWeight="bold">XOR</text>

            {/* Sortie XOR vers LED probe */}
            <path d="M 336 48 H 360" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth={outXOR ? 1.6 : 1} fill="none" />
            <g transform="translate(360, 48)">
              <circle cx="0" cy="0" r="3.5" fill={outXOR ? "#FF4D00" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outXOR ? "#FF4D00" : "#71717A"}>
                ={outXOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* --- PORTE 2 : AND (Y = A · B) à y=96 --- */}
          {/* Dérivation vers AND */}
          <path d="M 298 91 H 314" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 306 101 H 314" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="298" cy="91" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="306" cy="101" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path
              d="M 314 87 H 324 A 9 9 0 0 1 324 105 H 314 Z"
              fill="#181A22"
              stroke="#10B981"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="323" y="83" fontSize="5" textAnchor="middle" fill="#10B981" fontWeight="bold">AND</text>

            {/* Sortie AND vers LED probe */}
            <path d="M 333 96 H 360" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth={outAND ? 1.6 : 1} fill="none" />
            <g transform="translate(360, 96)">
              <circle cx="0" cy="0" r="3.5" fill={outAND ? "#10B981" : "#27272A"} filter={outAND ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outAND ? "#10B981" : "#71717A"}>
                ={outAND ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* --- PORTE 3 : OR (Y = A + B) à y=144 --- */}
          {/* Dérivation vers OR */}
          <path d="M 298 139 H 314" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 306 149 H 314" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="298" cy="139" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="306" cy="149" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path
              d="M 314 135 Q 319 144 314 153 Q 325 153 334 144 Q 325 135 314 135 Z"
              fill="#181A22"
              stroke="#8B5CF6"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="323" y="131" fontSize="5" textAnchor="middle" fill="#8B5CF6" fontWeight="bold">OR</text>

            {/* Sortie OR vers LED probe */}
            <path d="M 334 144 H 360" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth={outOR ? 1.6 : 1} fill="none" />
            <g transform="translate(360, 144)">
              <circle cx="0" cy="0" r="3.5" fill={outOR ? "#8B5CF6" : "#27272A"} filter={outOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="6" y="2.5" fontSize="5.5" fontWeight="bold" fill={outOR ? "#8B5CF6" : "#71717A"}>
                ={outOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* =================================================================
              4. ACHEMINEMENT PROPRE DES SORTIES VERS LES PINS DROITES DU CHIP
              Avec résistances CMS de protection (R1, R2, R3) et points de test
              ================================================================= */}
          {/* Ligne XOR vers Pin GPIO_0 (y=160) */}
          <path d="M 348 48 V 64 H 376 V 160 H 265" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />
          {/* Résistance CMS R1 (0603) sur la ligne XOR */}
          <g transform="translate(320, 160)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4.2" fill="#71717A">R1 (1k)</text>
          </g>

          {/* Ligne AND vers Pin GPIO_1 (y=175) */}
          <path d="M 346 96 V 110 H 366 V 175 H 265" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth="1.2" fill="none" />
          {/* Résistance CMS R2 (0603) sur la ligne AND */}
          <g transform="translate(320, 175)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4.2" fill="#71717A">R2 (1k)</text>
          </g>

          {/* Ligne OR vers Pin GPIO_2 (y=190) */}
          <path d="M 346 144 V 190 H 265" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth="1.2" fill="none" />
          {/* Résistance CMS R3 (0603) sur la ligne OR */}
          <g transform="translate(320, 190)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4.2" fill="#71717A">R3 (1k)</text>
          </g>

          {/* Test point TP_GPIO */}
          <g transform="translate(350, 215)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill={outXOR ? "#FF4D00" : "#52525B"} />
            <text x="6" y="2" fontSize="4.5" fill="#71717A">TP_GPIO</text>
          </g>

          {/* =================================================================
              5. BUS SPI & INTERFACE GAUCHE (Cyan, Emerald, Violet)
              ================================================================= */}
          <path d="M 135 160 H 30" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
          <path d="M 135 175 H 30" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <path d="M 135 190 H 30" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />

          {/* Test points SPI */}
          <g transform="translate(54, 160)">
            <circle cx="0" cy="0" r="2.5" fill="none" stroke="#06B6D4" strokeWidth="0.7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="4" fill="#71717A">MOSI</text>
          </g>
          <g transform="translate(74, 175)">
            <circle cx="0" cy="0" r="2.5" fill="none" stroke="#10B981" strokeWidth="0.7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="4" fill="#71717A">MISO</text>
          </g>
          <g transform="translate(94, 190)">
            <circle cx="0" cy="0" r="2.5" fill="none" stroke="#8B5CF6" strokeWidth="0.7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="4" fill="#71717A">SCK</text>
          </g>

          {/* Paquets animés sur le bus de données */}
          {!isDebug && (
            <>
              <motion.circle
                cx={30}
                cy={160}
                r={2}
                fill="#06B6D4"
                animate={{ cx: [30, 135] }}
                transition={{ duration: animDuration, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle
                cx={135}
                cy={175}
                r={2}
                fill="#10B981"
                animate={{ cx: [135, 30] }}
                transition={{ duration: animDuration, repeat: Infinity, ease: "linear", delay: 0.2 }}
              />
            </>
          )}

          {/* =================================================================
              6. HORLOGE CLK PULSE & COMMUTATEUR SPDT (BAS-GAUCHE)
              Hors d'atteinte de la photo polaroid
              ================================================================= */}
          {/* Ligne d'horloge reliant le bouton CLK au chip pin à y=235 */}
          <path d="M 74 246 H 135" stroke={clockSurge ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />

          {/* Bouton tactile CLOCK PULSE */}
          <g className="cursor-pointer" onClick={triggerClockPulse} transform="translate(38, 235)">
            <rect x="0" y="0" width="22" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="11" cy="11" r="6" fill={clockSurge ? "#FF4D00" : "#475569"} stroke="#334155" strokeWidth="0.8" />
            <text x="11" y="13.5" fontSize="4.8" textAnchor="middle" className="font-mono font-bold fill-white pointer-events-none">CLK</text>
            <text x="26" y="8" fontSize="5" fill="#71717A">PULSE</text>
          </g>

          {/* LED Horloge pulsée */}
          <g transform="translate(90, 246)">
            <circle cx="0" cy="0" r="3.2" fill={clockSurge ? "#FF4D00" : "#334155"} filter={clockSurge ? "url(#glow-led)" : undefined} />
            <text x="6" y="2" fontSize="4.8" fill="#71717A">SYS_CLK</text>
          </g>

          {/* Commutateur SPDT RUN / DEBUG */}
          {/* Piste reliant COM du switch au chip pin à y=250 */}
          <path d="M 74 287 H 135" stroke={isDebug ? "#F59E0B" : "#10B981"} strokeWidth="1.2" fill="none" />

          <g className="cursor-pointer" onClick={() => setIsDebug((d) => !d)} transform="translate(44, 280)">
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
            {/* LEDs RUN et DBG */}
            <circle cx="4" cy="-5" r="2" fill={!isDebug ? "#10B981" : "#334155"} filter={!isDebug ? "url(#glow-led)" : undefined} />
            <text x="8" y="-3.5" fontSize="4.2" fill={!isDebug ? "#10B981" : "#71717A"} fontWeight="bold">RUN</text>
            <circle cx="20" cy="-5" r="2" fill={isDebug ? "#F59E0B" : "#334155"} filter={isDebug ? "url(#glow-led)" : undefined} />
            <text x="24" y="-3.5" fontSize="4.2" fill={isDebug ? "#F59E0B" : "#71717A"} fontWeight="bold">DBG</text>
          </g>

          {/* =================================================================
              7. BOÎTIER CENTRAL IC QFP (CHIP SILICIUM AVEC SES VRAIES BROCHES)
              Broches métalliques gull-wing et pastilles CMS soudées au chip
              ================================================================= */}
          {/* BROCHES DE CONTACT MÉTALLIQUES (TOP, BOTTOM, LEFT, RIGHT) */}
          {/* Top Pins (x: 145 à 255) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const px = 150 + i * 14;
            return (
              <g key={`pin-t-${i}`}>
                <rect x={px - 2.5} y={124} width={5} height={10} rx={0.5} fill="#52525B" />
                <rect x={px - 1.5} y={126} width={3} height={10} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* Bottom Pins (x: 145 à 255) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const px = 150 + i * 14;
            return (
              <g key={`pin-b-${i}`}>
                <rect x={px - 2.5} y={266} width={5} height={10} rx={0.5} fill="#52525B" />
                <rect x={px - 1.5} y={264} width={3} height={10} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* Left Pins (y: 145 à 255) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const py = 150 + i * 14;
            return (
              <g key={`pin-l-${i}`}>
                <rect x={124} y={py - 2.5} width={10} height={5} rx={0.5} fill="#52525B" />
                <rect x={126} y={py - 1.5} width={10} height={3} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* Right Pins (y: 145 à 255) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const py = 150 + i * 14;
            return (
              <g key={`pin-r-${i}`}>
                <rect x={266} y={py - 2.5} width={10} height={5} rx={0.5} fill="#52525B" />
                <rect x={264} y={py - 1.5} width={10} height={3} fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.4" />
              </g>
            );
          })}

          {/* CORPS DU BOÎTIER IC SILICIUM NOIR MAT (135x135 à 265x265) */}
          <path
            d="M 147 135 H 265 V 265 H 135 V 147 Z"
            fill="#111216"
            stroke="#27272A"
            strokeWidth="1.5"
          />

          {/* Repère Pin 1 (Index laser) */}
          <circle cx="143" cy="143" r="3.5" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
          <circle cx="143" cy="143" r="1.5" fill="#FF4D00" />

          {/* --- ARCHITECTURE SOC INTERNE (MODULES SILICIUM FLOORPLAN) --- */}
          {/* Module 1 : SLUG THERMIQUE CUIVRE ORANGE (Top-Left) */}
          <g transform="translate(144, 144)">
            <rect x="0" y="0" width="38" height="38" rx="1.5" fill="#EA580C" stroke="#FF7A33" strokeWidth="0.8" />
            <rect x="0" y="0" width="38" height="38" fill="url(#slug-cross)" opacity="0.45" />
            <line x1="0" y1="0" x2="38" y2="38" stroke="#FFEDD5" strokeWidth="0.6" opacity="0.3" />
            <line x1="38" y1="0" x2="0" y2="38" stroke="#FFEDD5" strokeWidth="0.6" opacity="0.3" />
            <rect x="4" y="11" width="30" height="16" fill="#111216" stroke="#FF4D00" strokeWidth="0.6" />
            <text x="19" y="21" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#FF4D00">THERMAL</text>
          </g>

          {/* Module 2 : BLOC MÉMOIRE SRAM 32KB (Top-Right) */}
          <g transform="translate(188, 144)">
            <rect x="0" y="0" width="68" height="38" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="68" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">SRAM :: 32 KB</text>
            <text x="64" y="6.5" textAnchor="end" fontSize="4" fill="#10B981">CACHE</text>
            {/* Lignes de matrice mémoire */}
            <g stroke="#27272A" strokeWidth="0.5">
              <line x1="0" y1="16" x2="68" y2="16" />
              <line x1="0" y1="23" x2="68" y2="23" />
              <line x1="0" y1="30" x2="68" y2="30" />
              <line x1="22" y1="9" x2="22" y2="38" />
              <line x1="45" y1="9" x2="45" y2="38" />
            </g>
          </g>

          {/* Module 3 : CŒUR RV32I ALU & REGFILE (Center) */}
          <g transform="translate(144, 188)">
            <rect x="0" y="0" width="112" height="30" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="112" height="8" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">RV32I EXECUTION CORE</text>
            <text x="108" y="6" textAnchor="end" fontSize="4" fill="#FF4D00">ALU x0..x31</text>
            {/* Mini forme trapézoïdale ALU gravée au centre */}
            <polygon
              points="14,12 28,15 28,24 14,27 14,21 17,19.5 14,18"
              fill="#111216"
              stroke="#FF4D00"
              strokeWidth="0.7"
            />
            <text x="32" y="21" fontSize="4.5" fill="#E4E4E7">PIPELINED STAGES (IF·ID·EX·MEM·WB)</text>
          </g>

          {/* Module 4 : MARQUAGE LASER SERIGRAPHIE (Bottom) */}
          <g className="font-mono" transform="translate(144, 224)">
            <text x="0" y="8" fontSize="6.5" fontWeight="bold" fill="#F4F4F5" letterSpacing="0.5">
              RV32I SOC DIE
            </text>
            <text x="0" y="18" fontSize="5" fill="#A1A1AA" letterSpacing="0.3">
              FREQ: 120 MHz · LOT: AD-27
            </text>
            <text x="0" y="28" fontSize="5" fill={isDebug ? "#F59E0B" : clockSurge ? "#FF4D00" : "#10B981"} fontWeight="bold">
              STATUS: {isDebug ? "HALT (STEP MODE)" : clockSurge ? "CLK: 120 MHz" : "ACTIVE PIPELINE"}
            </text>
          </g>
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
