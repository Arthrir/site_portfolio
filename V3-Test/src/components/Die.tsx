import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip & PCB Lab ----------------
 * Conception électronique & CAO :
 * - Fond 100% transparent (fond crème du portfolio préservé).
 * - Câblage orthogonal 100% connecté et sans aucun croisement sauvage :
 *   - Boutons A et B à gauche des portes, alimentant 2 rails verticaux parallèles.
 *   - 3 portes logiques ANSI (XOR, AND, OR) avec dérivations et nœuds de jonction nets.
 *   - Sorties des portes acheminées proprement vers les broches GPIO du chip via R1, R2, R3.
 * - Bas de carte entièrement connecté et vivant :
 *   - Interface UART (TX / RX) avec LEDs d'activité en temps réel.
 *   - Bus I2C (SDA / SCL) avec réseau de résistances de tirage RP1.
 *   - 3 LEDs d'état CMS (D1 ACT, D2 USR, D3 PWR 3.3V).
 *   - Connecteur d'extension GPIO au bord inférieur.
 * - Cœur RISC-V SoC avec modules internes VIVANTS et RÉACTIFS :
 *   - SRAM 32KB : matrice de cellules mémoires s'illuminant au clic.
 *   - ALU & Banque de registres RV32I : mise à jour instantanée des registres x10 à x14.
 *   - Oscillateur quartz 120 MHz et bouton Reset fonctionnel à gauche.
 * -------------------------------------------------------------------------- */

interface DieProps {
  onColorChange?: (color: string) => void;
}

export default function Die({ onColorChange }: DieProps) {
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

  // Horloge cadencée (simule l'activité UART et bus)
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setClockTick((t) => (t + 1) % 16);
    }, 380);
    return () => clearInterval(id);
  }, []);

  // Palette de couleurs pour le bouton couleur en bas à droite
  const COLOR_PALETTE = [
    { name: "ORANGE", hex: "#FF4D00" },
    { name: "GREEN", hex: "#10B981" },
    { name: "PURPLE", hex: "#8B5CF6" },
    { name: "CYAN", hex: "#06B6D4" },
    { name: "AMBER", hex: "#F59E0B" },
  ];
  const [colorIndex, setColorIndex] = useState(0);

  // Message temporaire sur l'écran OLED (pendant 2 secondes)
  const [oledOverride, setOledOverride] = useState<string | null>(null);

  const triggerColorChange = () => {
    const nextIdx = (colorIndex + 1) % COLOR_PALETTE.length;
    setColorIndex(nextIdx);
    const chosen = COLOR_PALETTE[nextIdx];
    if (onColorChange) onColorChange(chosen.hex);
    // Notification 2s sur l'OLED
    setOledOverride(`COLOR :: ${chosen.name}`);
    setTimeout(() => {
      setOledOverride(null);
    }, 2000);
  };

  // Message qui défile sur le mini écran OLED
  const fullText = "SYS:OK · ARTHUR DX · EMBEDDED & FPGA · RV32I CORE ACTIVE · ";
  const [scrollIdx, setScrollIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setScrollIdx((s) => (s + 1) % fullText.length);
    }, 280);
    return () => clearInterval(id);
  }, [fullText.length]);
  const defaultDisplayText = (fullText + fullText).slice(scrollIdx, scrollIdx + 15);
  const displayText = oledOverride || defaultDisplayText;

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
              1. SUBSTRAT PCB TRANSPARENT & SÉRIGRAPHIE DE CONTOUR
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

          {/* Sérigraphie carte de test */}
          <text x="366" y="372" textAnchor="end" fontSize="5" fill="#71717A" opacity="0.6">
            EVAL-RV32I :: SOC TESTBENCH
          </text>

          {/* =================================================================
              2. ALIMENTATION VDD & CONDENSATEUR DE DÉCOUPLAGE (HAUT)
              + MODULE MINI ÉCRAN OLED I2C QUI DÉFILE (HAUT-DROITE PINS)
              ================================================================= */}
          {/* Ligne VDD 3.3V vers Pin 5 du haut (x=205) */}
          <path d="M 205 28 V 126" stroke="#D97706" strokeWidth="1.2" fill="none" />
          <g transform="translate(205, 58)">
            <rect x="-3" y="-6" width="6" height="12" fill="#52525B" />
            <rect x="-3" y="-5.5" width="6" height="11" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-3" y="-5.5" width="6" height="2.5" fill="#E4E4E7" />
            <rect x="-3" y="3" width="6" height="2.5" fill="#E4E4E7" />
            <text x="-5" y="1" textAnchor="end" fontSize="3.8" fill="#71717A">C1</text>
          </g>
          <g transform="translate(205, 28)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#D97706" />
            <text x="5" y="2" fontSize="4.2" fill="#71717A">VDD 3.3V</text>
          </g>

          {/* MINI ÉCRAN OLED SSD1306 (0.91" 128x32) BRANCHÉ SUR LE BUS I2C / GPIO EN HAUT */}
          {/* Câblage depuis les pins du haut : Pin 1 (GND x=145), Pin 2 (VCC x=160), Pin 3 (SCL x=175), Pin 4 (SDA x=190) */}
          <path d="M 145 126 V 76" stroke="#71717A" strokeWidth="1" fill="none" />
          <path d="M 160 126 V 76" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 175 126 V 76" stroke="#A855F7" strokeWidth="1" fill="none" />
          <path d="M 190 126 V 76" stroke="#8B5CF6" strokeWidth="1" fill="none" />

          {/* Module OLED à (120, 24) */}
          <g transform="translate(120, 24)">
            {/* PCB de support bleu foncé/noir */}
            <rect x="0" y="0" width="76" height="52" rx="2" fill="#0B132B" stroke="#334155" strokeWidth="1" />
            {/* Écran en verre noir */}
            <rect x="4" y="6" width="68" height="26" rx="1" fill="#020617" stroke="#1E293B" strokeWidth="0.8" />

            {/* Matrice OLED avec texte qui défile en direct */}
            <g clipPath="url(#oled-clip)">
              <defs>
                <clipPath id="oled-clip">
                  <rect x="5" y="7" width="66" height="24" rx="1" />
                </clipPath>
              </defs>
              {/* Ligne 1 : Titre fixe */}
              <text x="8" y="14" fontSize="4.2" fill="#38BDF8" fontFamily="monospace" fontWeight="bold">
                OLED :: I2C 0x3C
              </text>
              {/* Ligne 2 : Message défilant basé sur l'état */}
              <text x="8" y="22" fontSize="4.6" fill="#00FFCC" fontFamily="monospace" fontWeight="bold">
                {displayText}
              </text>
              {/* Ligne 3 : Télémétrie en temps réel */}
              <text x="8" y="28" fontSize="3.8" fill="#94A3B8" fontFamily="monospace">
                CLK:{120 + (clockTick % 3)}MHz · PWR:OK
              </text>
            </g>

            {/* Broches d'en-tête soudées (GND, VCC, SCL, SDA) alignées avec les pistes */}
            <g transform="translate(25, 46)">
              {/* Pin 1 (145 absolu = 120 + 25) */}
              <circle cx="0" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="0" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#71717A">GND</text>

              {/* Pin 2 (160 absolu = 120 + 40) */}
              <circle cx="15" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="15" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#D97706">VCC</text>

              {/* Pin 3 (175 absolu = 120 + 55) */}
              <circle cx="30" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="30" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#A855F7">SCL</text>

              {/* Pin 4 (190 absolu = 120 + 70) */}
              <circle cx="45" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="45" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#8B5CF6">SDA</text>
            </g>
          </g>

          {/* Broches 6, 7, 8 du haut (x=220, 235, 250) reliées à des points de test GPIO TP1, TP2, TP3 */}
          <path d="M 220 126 V 82" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="220" cy="80" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <text x="220" y="74" textAnchor="middle" fontSize="3.5" fill="#71717A">TP1</text>

          <path d="M 235 126 V 82" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="235" cy="80" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <text x="235" y="74" textAnchor="middle" fontSize="3.5" fill="#71717A">TP2</text>

          <path d="M 250 126 V 82" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="250" cy="80" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <text x="250" y="74" textAnchor="middle" fontSize="3.5" fill="#71717A">TP3</text>

          {/* =================================================================
              3. HORLOGE OSCILLATEUR QUARTZ 120 MHz & BOUTON RESET (GAUCHE)
              ================================================================= */}
          {/* Oscillateur Quartz 120 MHz Y1 relié au pin CLK_IN (y=175) */}
          <g transform="translate(44, 162)">
            <rect x="0" y="0" width="50" height="26" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <rect x="2" y="2" width="46" height="22" rx="1" fill="#0F172A" />
            <text x="25" y="12" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#E2E8F0">OSC 120M</text>
            <text x="25" y="20" textAnchor="middle" fontSize="4.2" fill="#FF4D00">Y1 QUARTZ</text>
          </g>
          <path d="M 94 175 H 126" stroke="#FF4D00" strokeWidth="1.2" fill="none" />
          <circle
            cx="110"
            cy="175"
            r="2"
            fill={clockTick % 2 === 0 ? "#FF4D00" : "#52525B"}
            filter={clockTick % 2 === 0 ? "url(#glow-led)" : undefined}
          />
          <text x="110" y="169" textAnchor="middle" fontSize="4" fill="#71717A">CLK_IN</text>

          {/* Bouton Tactile RESET relié au pin NRST (y=220) */}
          <g className="cursor-pointer" onClick={handleReset} transform="translate(52, 210)">
            <rect x="0" y="0" width="38" height="20" rx="2" fill="#181A22" stroke="#475569" strokeWidth="1" />
            <circle cx="12" cy="10" r="5" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
            <text x="26" y="12.5" fontSize="5" fontWeight="bold" fill="#E2E8F0">RST</text>
          </g>
          <path d="M 90 220 H 126" stroke="#71717A" strokeWidth="1.2" fill="none" />
          <text x="108" y="215" textAnchor="middle" fontSize="4" fill="#71717A">NRST</text>

          {/* =================================================================
              4. BANC MULTI-PORTES FLUIDE ET CONNECTÉ (HAUT-DROITE)
              Boutons poussoirs tactiles réels (6x6mm SMD) alimentant les rails A et B
              Pattes gauches au plan VDD 3.3V, pattes droites vers le bus logique
              ================================================================= */}
          {/* Ligne d'alimentation VDD commune aux entrées gauches des boutons A et B (x=244) */}
          <path d="M 205 28 H 244 V 86" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" fill="none" />
          <circle cx="244" cy="30" r="1.3" fill="#D97706" />
          <circle cx="244" cy="46" r="1.3" fill="#D97706" />
          <circle cx="244" cy="70" r="1.3" fill="#D97706" />
          <circle cx="244" cy="86" r="1.3" fill="#D97706" />
          <path d="M 244 30 H 249" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 244 46 H 249" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 244 70 H 249" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 244 86 H 249" stroke="#D97706" strokeWidth="1" fill="none" />

          {/* Bouton Poussoir Tactile SMD A à (252, 28) */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)} transform="translate(252, 26)">
            {/* 4 pattes de soudure métalliques aux 4 coins (liées 2 par 2 en interne) */}
            <rect x="-3" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="18" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="18" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Corps métallique du boîtier bouton poussoir 6x6mm */}
            <rect x="0" y="0" width="24" height="24" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Actionneur central rond (plongeur / bouton) */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              fill={logicA ? "#FF4D00" : "#334155"}
              stroke={logicA ? "#FF7A33" : "#475569"}
              strokeWidth="0.8"
              filter={logicA ? "url(#glow-led)" : undefined}
            />
            {/* Étiquette sérigraphie sombre et lisible au-dessus du bouton */}
            <text x="12" y="-3.5" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill={logicA ? "#FF4D00" : "#3F3F46"}>
              BTN A ({valA})
            </text>
          </g>

          {/* Bouton Poussoir Tactile SMD B à (252, 68) */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)} transform="translate(252, 66)">
            {/* 4 pattes de soudure métalliques aux 4 coins */}
            <rect x="-3" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="18" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="18" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Corps métallique du boîtier bouton poussoir 6x6mm */}
            <rect x="0" y="0" width="24" height="24" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Actionneur central rond (plongeur / bouton) */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              fill={logicB ? "#FF4D00" : "#334155"}
              stroke={logicB ? "#FF7A33" : "#475569"}
              strokeWidth="0.8"
              filter={logicB ? "url(#glow-led)" : undefined}
            />
            {/* Étiquette sérigraphie sombre et lisible au-dessus du bouton */}
            <text x="12" y="-3.5" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill={logicB ? "#FF4D00" : "#3F3F46"}>
              BTN B ({valB})
            </text>
          </g>

          {/* RAILS DE DISTRIBUTION PARALLÈLES :
              Sortie A part des 2 pads droits du bouton A (reliés en H) -> Rail A à x=304
              Sortie B part des 2 pads droits du bouton B (reliés en H) -> Rail B à x=316 */}
          {/* Pont de sortie pour bouton A (pad haut 28, pad bas 44 reliés vers rail x=304) */}
          <path d="M 276 28 H 284 V 44 H 276" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth="1" fill="none" />
          <path
            d="M 284 36 H 304 V 141"
            stroke={logicA ? "#FF4D00" : "#52525B"}
            strokeWidth={logicA ? 1.6 : 1}
            fill="none"
          />

          {/* Pont de sortie pour bouton B (pad haut 68, pad bas 84 reliés vers rail x=316) */}
          <path d="M 276 68 H 284 V 84 H 276" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth="1" fill="none" />
          <path
            d="M 284 76 H 316 V 151"
            stroke={logicB ? "#FF4D00" : "#52525B"}
            strokeWidth={logicB ? 1.6 : 1}
            fill="none"
          />

          {/* Entrées directes depuis A et B vers les broches 1 et 2 du processeur */}
          <path d="M 296 36 V 145 H 274" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />
          <circle cx="296" cy="36" r="1.3" fill={logicA ? "#FF4D00" : "#52525B"} />

          <path d="M 290 76 V 160 H 274" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth="1.2" fill="none" />
          <circle cx="290" cy="76" r="1.3" fill={logicB ? "#FF4D00" : "#52525B"} />

          {/* --- PORTE 1 : XOR (Y = A ⊕ B) à y=50 --- */}
          {/* Entrée A du XOR : ligne continue (x=304 -> x=348, y=44) */}
          <path d="M 304 44 H 348" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <circle cx="304" cy="44" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* Entrée B du XOR : ligne continue directe sans aucun via parasite (x=316 -> x=348, y=56) */}
          <path d="M 316 56 H 348" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="316" cy="56" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          {/* Corps de la porte XOR normalisé ANSI (porte positionnée de x=348 à x=368) */}
          <g>
            {/* Arc d'entrée séparé (spécifique au symbole XOR) de x=344 */}
            <path d="M 344 40 Q 349 50 344 60" fill="none" stroke="#3F3F46" strokeWidth="1.3" strokeLinecap="round" />
            {/* Corps principal XOR */}
            <path
              d="M 348 40 Q 360 43 368 50 Q 360 57 348 60 Q 353 50 348 40 Z"
              fill="#181A22"
              stroke="#FF4D00"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="358" y="36" fontSize="4.8" textAnchor="middle" fill="#FF4D00" fontWeight="bold">XOR</text>

            {/* Sortie XOR vers LED probe */}
            <path d="M 368 50 H 380" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth={outXOR ? 1.6 : 1} fill="none" />
            <g transform="translate(380, 50)">
              <circle cx="0" cy="0" r="3.2" fill={outXOR ? "#FF4D00" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="5" y="2.2" fontSize="5" fontWeight="bold" fill={outXOR ? "#FF4D00" : "#71717A"}>
                ={outXOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Ligne de sortie XOR vers Pin 3 (y=175) avec résistance R1 */}
          <path d="M 372 50 V 62 H 392 V 175 H 274" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth={1.2} fill="none" />
          <g transform="translate(330, 175)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4" fill="#71717A">R1 (1k)</text>
          </g>

          {/* --- PORTE 2 : AND (Y = A · B) à y=98 --- */}
          <path d="M 304 93 H 348" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 316 103 H 348" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="304" cy="93" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="316" cy="103" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path
              d="M 348 89 H 358 A 9 9 0 0 1 358 107 H 348 Z"
              fill="#181A22"
              stroke="#10B981"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="357" y="85" fontSize="4.8" textAnchor="middle" fill="#10B981" fontWeight="bold">AND</text>

            {/* Sortie AND vers LED probe */}
            <path d="M 367 98 H 380" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth={outAND ? 1.6 : 1} fill="none" />
            <g transform="translate(380, 98)">
              <circle cx="0" cy="0" r="3.2" fill={outAND ? "#10B981" : "#27272A"} filter={outAND ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="5" y="2.2" fontSize="5" fontWeight="bold" fill={outAND ? "#10B981" : "#71717A"}>
                ={outAND ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Ligne de sortie AND vers Pin 4 (y=190) avec résistance R2 */}
          <path d="M 370 98 V 110 H 384 V 190 H 274" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth={1.2} fill="none" />
          <g transform="translate(330, 190)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4" fill="#71717A">R2 (1k)</text>
          </g>

          {/* --- PORTE 3 : OR (Y = A + B) à y=146 --- */}
          <path d="M 304 141 H 348" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.5 : 1} fill="none" />
          <path d="M 316 151 H 348" stroke={logicB ? "#FF4D00" : "#52525B"} strokeWidth={logicB ? 1.5 : 1} fill="none" />
          <circle cx="304" cy="141" r="1.5" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="316" cy="151" r="1.5" fill={logicB ? "#FF4D00" : "#52525B"} />

          <g>
            <path
              d="M 348 137 Q 353 146 348 155 Q 359 155 368 146 Q 359 137 348 137 Z"
              fill="#181A22"
              stroke="#8B5CF6"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="357" y="133" fontSize="4.8" textAnchor="middle" fill="#8B5CF6" fontWeight="bold">OR</text>

            {/* Sortie OR vers LED probe */}
            <path d="M 368 146 H 380" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth={outOR ? 1.6 : 1} fill="none" />
            <g transform="translate(380, 146)">
              <circle cx="0" cy="0" r="3.2" fill={outOR ? "#8B5CF6" : "#27272A"} filter={outOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.6" />
              <text x="5" y="2.2" fontSize="5" fontWeight="bold" fill={outOR ? "#8B5CF6" : "#71717A"}>
                ={outOR ? "1" : "0"}
              </text>
            </g>
          </g>

          {/* Ligne de sortie OR vers Pin 5 (y=205) avec résistance R3 */}
          <path d="M 368 146 H 376 V 205 H 274" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth={1.2} fill="none" />
          <g transform="translate(330, 205)">
            <rect x="-6" y="-3" width="12" height="6" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-6" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <rect x="3.5" y="-3" width="2.5" height="6" fill="#E4E4E7" />
            <text x="0" y="-4.5" textAnchor="middle" fontSize="4" fill="#71717A">R3 (1k)</text>
          </g>

          {/* Lignes de retour/interruption vers les pins 6, 7, 8 de droite */}
          <path d="M 360 220 H 274" stroke="#71717A" strokeWidth="1.1" fill="none" />
          <text x="350" y="217" textAnchor="end" fontSize="3.8" fill="#71717A">INT0</text>

          <path d="M 360 235 H 274" stroke="#71717A" strokeWidth="1.1" fill="none" />
          <text x="350" y="232" textAnchor="end" fontSize="3.8" fill="#71717A">INT1</text>

          <path d="M 360 250 H 274" stroke="#71717A" strokeWidth="1.1" fill="none" />
          <text x="350" y="247" textAnchor="end" fontSize="3.8" fill="#71717A">GPIO7</text>

          {/* =================================================================
              5. BAS DU CHIP & BAS-DROITE TOTALEMENT CONNECTÉ
              UART, I2C, STATUS LEDS, CONNECTEUR JTAG + BOUTON COULEUR EN BAS À DROITE
              ================================================================= */}
          {/* 1. Interface UART (TX / RX) connectée aux pins 1 & 2 du bas (x=145, 160) */}
          <path d="M 145 274 V 330" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
          <path d="M 160 274 V 330" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <g transform="translate(145, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 4 === 0 ? "#06B6D4" : "#27272A"} filter={clockTick % 4 === 0 ? "url(#glow-led)" : undefined} stroke="#475569" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">TX</text>
          </g>
          <g transform="translate(160, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 3 === 0 ? "#10B981" : "#27272A"} filter={clockTick % 3 === 0 ? "url(#glow-led)" : undefined} stroke="#475569" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">RX</text>
          </g>
          <text x="152.5" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">UART</text>

          {/* 2. Bus I2C (SDA / SCL) avec résistances de pull-up R4 & R5 verticales alignées sur les pistes ! */}
          <path d="M 175 274 V 330" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />
          <path d="M 190 274 V 330" stroke="#A855F7" strokeWidth="1.2" fill="none" />
          {/* R4 Pullup sur SDA */}
          <g transform="translate(175, 302)">
            <rect x="-3" y="-6" width="6" height="12" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-3" y="-6" width="6" height="2.5" fill="#E4E4E7" />
            <rect x="-3" y="3.5" width="6" height="2.5" fill="#E4E4E7" />
            <text x="-5" y="1" textAnchor="end" fontSize="3.8" fill="#71717A">R4</text>
          </g>
          {/* R5 Pullup sur SCL */}
          <g transform="translate(190, 302)">
            <rect x="-3" y="-6" width="6" height="12" fill="#181A22" stroke="#3F3F46" strokeWidth="0.6" />
            <rect x="-3" y="-6" width="6" height="2.5" fill="#E4E4E7" />
            <rect x="-3" y="3.5" width="6" height="2.5" fill="#E4E4E7" />
            <text x="6" y="1" textAnchor="start" fontSize="3.8" fill="#71717A">R5</text>
          </g>
          <text x="182.5" y="290" textAnchor="middle" fontSize="3.8" fill="#71717A">4.7k PULLUP</text>

          <g transform="translate(175, 336)">
            <circle cx="0" cy="0" r="2.2" fill="none" stroke="#8B5CF6" strokeWidth="0.7" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">SDA</text>
          </g>
          <g transform="translate(190, 336)">
            <circle cx="0" cy="0" r="2.2" fill="none" stroke="#A855F7" strokeWidth="0.7" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">SCL</text>
          </g>
          <text x="182.5" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">I2C</text>

          {/* 3. Ligne GND avec condensateur C2 vertical à pin 5 (x=205) */}
          <path d="M 205 274 V 360" stroke="#71717A" strokeWidth="1.2" fill="none" />
          <g transform="translate(205, 305)">
            <rect x="-3.5" y="-7" width="7" height="14" rx="0.5" fill="#52525B" />
            <rect x="-3" y="-6.5" width="6" height="13" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-3" y="-6.5" width="6" height="3" fill="#E4E4E7" />
            <rect x="-3" y="3.5" width="6" height="3" fill="#E4E4E7" />
            <text x="-5.5" y="1" textAnchor="end" fontSize="3.8" fill="#71717A">C2</text>
          </g>
          <g transform="translate(205, 360)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#71717A" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#71717A" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">GND</text>
          </g>

          {/* 4. LEDs d'état CMS (ACT, USR, PWR) reliées aux pins 6, 7, 8 (x=220, 235, 250) */}
          <path d="M 220 274 V 330" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <path d="M 235 274 V 330" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
          <path d="M 250 274 V 330" stroke="#FF4D00" strokeWidth="1.2" fill="none" />

          {/* D1 ACT LED (verte) */}
          <g transform="translate(220, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 2 === 0 ? "#10B981" : "#27272A"} filter={clockTick % 2 === 0 ? "url(#glow-led)" : undefined} stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">ACT</text>
          </g>
          {/* D2 USR LED (orange) */}
          <g transform="translate(235, 336)">
            <circle cx="0" cy="0" r="2.8" fill={outXOR ? "#F59E0B" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">USR</text>
          </g>
          {/* D3 PWR LED (active constante) */}
          <g transform="translate(250, 336)">
            <circle cx="0" cy="0" r="2.8" fill={COLOR_PALETTE[colorIndex].hex} filter="url(#glow-led)" stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">PWR</text>
          </g>
          <text x="235" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">STATUS</text>

          {/* 5. EN BAS À DROITE : PORT JTAG / SWD + BOUTON POUSSOIR TACTILE DE CYCLE DE COULEUR */}
          <g transform="translate(286, 305)">
            {/* Header 2x3 compact pour JTAG/SWD */}
            <rect x="0" y="0" width="38" height="34" rx="2" fill="#111216" stroke="#475569" strokeWidth="1" />
            <text x="19" y="-3.5" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#71717A">SWD/J1</text>
            {Array.from({ length: 3 }).map((_, col) => (
              <g key={`swd-${col}`}>
                <circle cx={8 + col * 11} cy={10} r="2.2" fill="#27272A" stroke="#D4D4D8" strokeWidth="0.6" />
                <circle cx={8 + col * 11} cy={10} r="0.8" fill="#F59E0B" />
                <circle cx={8 + col * 11} cy={24} r="2.2" fill="#27272A" stroke="#D4D4D8" strokeWidth="0.6" />
                <circle cx={8 + col * 11} cy={24} r="0.8" fill="#F59E0B" />
              </g>
            ))}
          </g>

          {/* BOUTON POUSSOIR TACTILE DE CHANGEMENT DE COULEUR (BTN COLOR THEME) */}
          <g className="cursor-pointer" onClick={triggerColorChange} transform="translate(340, 308)">
            {/* 4 pattes de soudure */}
            <rect x="-2.5" y="2" width="2.5" height="3.5" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-2.5" y="16.5" width="2.5" height="3.5" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="22" y="2" width="2.5" height="3.5" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="22" y="16.5" width="2.5" height="3.5" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Corps du poussoir */}
            <rect x="0" y="0" width="22" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="11" cy="11" r="8" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Plongeur illuminé à la couleur active */}
            <circle
              cx="11"
              cy="11"
              r="6"
              fill={COLOR_PALETTE[colorIndex].hex}
              stroke="#FFF"
              strokeWidth="0.8"
              filter="url(#glow-led)"
            />
            {/* Sérigraphie au-dessus et en-dessous */}
            <text x="11" y="-4" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill={COLOR_PALETTE[colorIndex].hex}>
              COLOR
            </text>
            <text x="11" y="29" textAnchor="middle" fontSize="3.8" fill="#71717A">
              DOT THEME
            </text>
          </g>
          {/* Piste reliant le bouton COLOR au microcontrôleur */}
          <path d="M 274 250 H 351 V 308" stroke={COLOR_PALETTE[colorIndex].hex} strokeWidth="1" strokeDasharray="3 2" fill="none" />

          {/* =================================================================
              6. BOÎTIER CENTRAL IC QFP (CHIP SILICIUM AVEC BROCHES REELLES)
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
          {/* Bottom Pins (tous connectés !) */}
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

          {/* --- MODULES INTERNES DYNAMIQUES DU SOC --- */}

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
          <g transform="translate(180, 138)">
            <rect x="0" y="0" width="82" height="36" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="82" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">SRAM 32KB</text>
            <text x="78" y="6.5" textAnchor="end" fontSize="4" fill="#10B981">[WRITE OK]</text>

            {/* Matrice de cellules mémoires dynamiques */}
            <g transform="translate(4, 12)">
              <rect x="0" y="0" width="10" height="8" rx="0.5" fill={logicA ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="5" y="6" textAnchor="middle" fontSize="4" fill={logicA ? "#FFF" : "#71717A"}>{valA}</text>

              <rect x="13" y="0" width="10" height="8" rx="0.5" fill={logicB ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="18" y="6" textAnchor="middle" fontSize="4" fill={logicB ? "#FFF" : "#71717A"}>{valB}</text>

              <rect x="26" y="0" width="10" height="8" rx="0.5" fill={outXOR ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="31" y="6" textAnchor="middle" fontSize="4" fill={outXOR ? "#FFF" : "#71717A"}>{outXOR ? 1 : 0}</text>

              <rect x="39" y="0" width="10" height="8" rx="0.5" fill={outAND ? "#10B981" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="44" y="6" textAnchor="middle" fontSize="4" fill={outAND ? "#FFF" : "#71717A"}>{outAND ? 1 : 0}</text>

              <rect x="52" y="0" width="10" height="8" rx="0.5" fill={outOR ? "#8B5CF6" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="57" y="6" textAnchor="middle" fontSize="4" fill={outOR ? "#FFF" : "#71717A"}>{outOR ? 1 : 0}</text>

              <text x="0" y="20" fontSize="4.2" fill="#71717A">
                BUS: <tspan fill="#FF4D00" fontWeight="bold">0x0{valA}{valB}</tspan> · RET: <tspan fill="#10B981" fontWeight="bold">0x0{outXOR ? 1 : 0}</tspan>
              </text>
            </g>
          </g>

          {/* Module 3 : CŒUR RV32I ALU & REGFILE EN DIRECT (Center) */}
          <g transform="translate(138, 180)">
            <rect x="0" y="0" width="124" height="48" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="124" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">RV32I EXECUTION CORE</text>
            <text x="120" y="6.5" textAnchor="end" fontSize="4" fill="#FF4D00">x0..x31 REGFILE</text>

            <g transform="translate(6, 14)">
              <text x="0" y="6" fontSize="4.5" fill="#A1A1AA">x10 (a0): <tspan fill={logicA ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{valA}</tspan></text>
              <text x="60" y="6" fontSize="4.5" fill="#A1A1AA">x11 (a1): <tspan fill={logicB ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{valB}</tspan></text>

              <text x="0" y="16" fontSize="4.5" fill="#A1A1AA">x12 (xor): <tspan fill={outXOR ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{outXOR ? 1 : 0}</tspan></text>
              <text x="60" y="16" fontSize="4.5" fill="#A1A1AA">x13 (and): <tspan fill={outAND ? "#10B981" : "#71717A"} fontWeight="bold">0x0{outAND ? 1 : 0}</tspan></text>

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
