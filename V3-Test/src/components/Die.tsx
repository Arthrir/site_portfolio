import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip & PCB Lab ----------------
 * Conception électronique & CAO :
 * - Fond 100% transparent (fond crème du portfolio préservé).
 * - Câblage orthogonal 100% connecté et sans aucun croisement sauvage :
 *   - Boutons A (Orange) et B (Cyan) avec couleurs bien distinctes.
 *   - Rails A et B parallèles continus (Rail B part bien du pin B du XOR et descend jusqu'au processeur).
 *   - 3 portes logiques ANSI (XOR, AND, OR) avec sondes LED maintenues STRICTEMENT à l'intérieur du PCB (x <= 370).
 *   - Sorties des portes acheminées vers les broches GPIO du chip via R1, R2, R3 (1k).
 * - Synchronisation dynamique de la couleur du site :
 *   - Liée directement aux combinaisons logiques des portes (A, B) :
 *     (0,0) -> Orange | (1,0) -> Cyan | (0,1) -> Vert | (1,1) -> Violet.
 *   - Notification instantanée de 2s sur le mini écran OLED I2C en haut.
 * - Bas de carte entièrement connecté et vivant :
 *   - Interface UART (TX / RX) avec LEDs d'activité en temps réel.
 *   - Bus I2C (SDA / SCL) avec résistances de tirage R4 & R5 bien espacées sans chevauchement avec C2.
 *   - 3 LEDs d'état CMS (ACT, USR, PWR illuminée à la couleur du thème).
 *   - Connecteur de débug SWD / JTAG 6 broches en bas à droite entièrement câblé au MCU !
 * - Interrupteur à glissière matériel réaliste SW1 (SPDT Slide Switch) pour le Reset à gauche.
 * - Cœur RISC-V SoC avec modules internes VIVANTS et RÉACTIFS :
 *   - SRAM 32KB : matrice de cellules mémoires s'illuminant au clic.
 *   - ALU & Banque de registres RV32I : mise à jour instantanée des registres x10 à x14.
 *   - Oscillateur quartz 120 MHz Y1.
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
  const [logicB, setLogicB] = useState(false);

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

  // Palette dynamique liée aux combinaisons des portes logiques A & B
  const GATE_COLOR_MAP: Record<string, { hex: string; name: string }> = {
    "00": { hex: "#FF4D00", name: "ORANGE" },
    "10": { hex: "#06B6D4", name: "CYAN" },
    "01": { hex: "#10B981", name: "GREEN" },
    "11": { hex: "#8B5CF6", name: "PURPLE" },
  };
  const currentTheme = GATE_COLOR_MAP[`${valA}${valB}`];

  // Notification temporaire sur l'écran OLED (pendant 2 secondes)
  const [oledOverride, setOledOverride] = useState<string | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (onColorChange) {
      onColorChange(currentTheme.hex);
    }
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setOledOverride(`COLOR :: ${currentTheme.name}`);
    const timer = setTimeout(() => {
      setOledOverride(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [logicA, logicB, currentTheme.hex, currentTheme.name, onColorChange]);

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

  // Interrupteur à glissière RESET mécanique
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = () => {
    setIsResetting(true);
    setLogicA(false);
    setLogicB(false);
    setOledOverride("SYS :: RESET");
    setTimeout(() => {
      setIsResetting(false);
    }, 300);
    setTimeout(() => {
      setOledOverride(null);
    }, 1800);
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
              Toutes les pistes et composants restent STRICTEMENT à l'intérieur de [12..388]
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
          <path d="M 205 24 V 126" stroke="#D97706" strokeWidth="1.2" fill="none" />
          <g transform="translate(205, 52)">
            <rect x="-3" y="-5.5" width="6" height="11" fill="#52525B" />
            <rect x="-3" y="-5" width="6" height="10" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-3" y="-5" width="6" height="2.5" fill="#E4E4E7" />
            <rect x="-3" y="2.5" width="6" height="2.5" fill="#E4E4E7" />
            <text x="6" y="1" textAnchor="start" fontSize="3.8" fill="#71717A">C1</text>
          </g>
          <g transform="translate(205, 24)">
            <circle cx="0" cy="0" r="2.4" fill="none" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1" fill="#D97706" />
            <text x="0" y="-5" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#71717A">VDD 3.3V</text>
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
              {/* Ligne 2 : Message défilant ou notification de couleur */}
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
          <text x="220" y="73" textAnchor="middle" fontSize="3.5" fill="#71717A">TP1</text>

          <path d="M 235 126 V 82" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="235" cy="80" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <text x="235" y="73" textAnchor="middle" fontSize="3.5" fill="#71717A">TP2</text>

          <path d="M 250 126 V 82" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="250" cy="80" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <text x="250" y="73" textAnchor="middle" fontSize="3.5" fill="#71717A">TP3</text>

          {/* =================================================================
              3. HORLOGE OSCILLATEUR QUARTZ 120 MHz & INTERRUPTEUR DE RESET SPDT (GAUCHE)
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

          {/* INTERRUPTEUR À GLISSIÈRE MINIATURE SMD RÉALISTE (SPDT SLIDE SWITCH SW1) */}
          <g
            className="cursor-pointer group"
            onClick={handleReset}
            transform="translate(44, 208)"
          >
            {/* Pattes de fixation métalliques latérales */}
            <rect x="-3" y="7" width="3" height="8" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="46" y="7" width="3" height="8" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Boîtier métallique chromé du switch */}
            <rect x="0" y="0" width="46" height="24" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="0.9" />
            <circle cx="5" cy="12" r="1.4" fill="#0F172A" stroke="#475569" strokeWidth="0.4" />
            <circle cx="41" cy="12" r="1.4" fill="#0F172A" stroke="#475569" strokeWidth="0.4" />

            {/* Glissière intérieure creuse */}
            <rect x="10" y="6.5" width="26" height="11" rx="1.5" fill="#09090B" stroke="#334155" strokeWidth="0.6" />

            {/* Curseur mobile tactile en relief (rouge) */}
            <g transform={isResetting ? "translate(11, 5)" : "translate(22, 5)"} className="transition-transform duration-150">
              <rect x="0" y="0" width="13" height="14" rx="1.5" fill="#DC2626" stroke="#EF4444" strokeWidth="0.8" />
              {/* Rainures antidérapantes sur le curseur */}
              <line x1="3.5" y1="3" x2="3.5" y2="11" stroke="#FEE2E2" strokeWidth="0.7" />
              <line x1="6.5" y1="3" x2="6.5" y2="11" stroke="#FEE2E2" strokeWidth="0.7" />
              <line x1="9.5" y1="3" x2="9.5" y2="11" stroke="#FEE2E2" strokeWidth="0.7" />
            </g>

            {/* Sérigraphie industrielle */}
            <text x="23" y="-3.5" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#94A3B8">
              SW1 · RESET
            </text>
            <text x="13" y="21" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#EF4444">RST</text>
            <text x="33" y="21" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#10B981">RUN</text>
          </g>

          {/* Piste NRST reliant l'interrupteur au Pin 6 gauche du microcontrôleur (y=220) */}
          <path d="M 90 220 H 126" stroke="#EF4444" strokeWidth="1.2" fill="none" />
          <circle cx="108" cy="220" r="1.5" fill="#EF4444" />
          <text x="108" y="215" textAnchor="middle" fontSize="4" fill="#71717A">NRST</text>

          {/* =================================================================
              4. BANC MULTI-PORTES FLUIDE ET CONNECTÉ (HAUT-DROITE)
              Bouton A (ORANGE) & Bouton B (CYAN) bien distincts !
              Rails orthogonaux sans coupure : Rail B relie fermement le XOR pin B jusqu'au bas !
              Toutes les sondes et retours sont contenus à l'intérieur de x <= 370 !
              ================================================================= */}
          {/* Ligne d'alimentation VDD commune aux entrées gauches des boutons A et B (x=238) */}
          <path d="M 205 24 H 238 V 84" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" fill="none" />
          <circle cx="238" cy="29" r="1.3" fill="#D97706" />
          <circle cx="238" cy="43" r="1.3" fill="#D97706" />
          <circle cx="238" cy="69" r="1.3" fill="#D97706" />
          <circle cx="238" cy="83" r="1.3" fill="#D97706" />
          <path d="M 238 29 H 241" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 238 43 H 241" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 238 69 H 241" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 238 83 H 241" stroke="#D97706" strokeWidth="1" fill="none" />

          {/* Bouton Poussoir Tactile SMD A à (244, 26) - ACCENT ORANGE (#FF4D00) */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)} transform="translate(244, 26)">
            {/* 4 pattes de soudure métalliques */}
            <rect x="-3" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="16" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="16" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Boîtier 6x6mm */}
            <rect x="0" y="0" width="24" height="24" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Plongeur central orange */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              fill={logicA ? "#FF4D00" : "#334155"}
              stroke={logicA ? "#FF7A33" : "#475569"}
              strokeWidth="0.8"
              filter={logicA ? "url(#glow-led)" : undefined}
            />
            {/* Sérigraphie au-dessus du bouton */}
            <text x="12" y="-4" textAnchor="middle" fontSize="4.6" fontWeight="bold" fill={logicA ? "#FF4D00" : "#71717A"}>
              BTN A ({valA})
            </text>
          </g>

          {/* Bouton Poussoir Tactile SMD B à (244, 66) - ACCENT CYAN (#06B6D4) */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)} transform="translate(244, 66)">
            {/* 4 pattes de soudure métalliques */}
            <rect x="-3" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="16" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="16" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Boîtier 6x6mm */}
            <rect x="0" y="0" width="24" height="24" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Plongeur central cyan bien distinct de A ! */}
            <circle
              cx="12"
              cy="12"
              r="6.5"
              fill={logicB ? "#06B6D4" : "#334155"}
              stroke={logicB ? "#22D3EE" : "#475569"}
              strokeWidth="0.8"
              filter={logicB ? "url(#glow-led)" : undefined}
            />
            {/* Sérigraphie au-dessus du bouton */}
            <text x="12" y="-4" textAnchor="middle" fontSize="4.6" fontWeight="bold" fill={logicB ? "#06B6D4" : "#71717A"}>
              BTN B ({valB})
            </text>
          </g>

          {/* SORTIES DES BOUTONS VERS LES RAILS DE DISTRIBUTION :
              Sortie A part des pads droits de BTN A -> pont à x=276 -> Rail A à x=286
              Sortie B part des pads droits de BTN B -> pont à x=276 -> Rail B à x=300 */}
          {/* Pont de sortie A */}
          <path d="M 268 29 H 276 V 43 H 268" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth="1" fill="none" />
          <path d="M 276 36 H 286" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.6 : 1} fill="none" />

          {/* Pont de sortie B */}
          <path d="M 268 69 H 276 V 83 H 268" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth="1" fill="none" />
          <path d="M 276 76 H 300" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth={logicB ? 1.6 : 1} fill="none" />

          {/* RAIL A VERTICAL (Orange) : va de y=36 à y=145 (Pin 1 du CPU) */}
          <path
            d="M 286 36 V 145 H 274"
            stroke={logicA ? "#FF4D00" : "#52525B"}
            strokeWidth={logicA ? 1.5 : 1}
            fill="none"
          />
          <circle cx="286" cy="36" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="286" cy="145" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* RAIL B VERTICAL (Cyan) : PART DU HAUT (y=56, XOR pin B) JUSQU'À y=160 (Pin 2 du CPU)
              100% continu, solide, physiquement relié à BTN B à y=76 et au XOR B à y=56 ! */}
          <path
            d="M 300 56 V 160 H 274"
            stroke={logicB ? "#06B6D4" : "#52525B"}
            strokeWidth={logicB ? 1.5 : 1}
            fill="none"
          />
          <circle cx="300" cy="56" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />
          <circle cx="300" cy="76" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />
          <circle cx="300" cy="160" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />

          {/* --- PORTE 1 : XOR (Y = A ⊕ B) à y=50 --- */}
          {/* Entrée A du XOR (x=286 -> x=322, y=44) */}
          <path d="M 286 44 H 322" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.4 : 1} fill="none" />
          <circle cx="286" cy="44" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* Entrée B du XOR : Ligne continue directe depuis le Rail B (x=300 -> x=322, y=56) */}
          <path d="M 300 56 H 322" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth={logicB ? 1.4 : 1} fill="none" />

          {/* Corps de la porte XOR (positionnée de x=322 à x=342, compacte et nette) */}
          <g>
            {/* Arc d'entrée XOR séparé */}
            <path d="M 319 40 Q 323 50 319 60" fill="none" stroke="#3F3F46" strokeWidth="1.2" strokeLinecap="round" />
            {/* Corps principal XOR */}
            <path
              d="M 322 40 Q 334 43 342 50 Q 334 57 322 60 Q 326 50 322 40 Z"
              fill="#181A22"
              stroke="#FF4D00"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="332" y="36" fontSize="4.6" textAnchor="middle" fill="#FF4D00" fontWeight="bold">XOR</text>

            {/* Sortie XOR vers LED probe (x=354 max, reste à l'intérieur du PCB !) */}
            <path d="M 342 50 H 354" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth={outXOR ? 1.5 : 1} fill="none" />
            <circle cx="354" cy="50" r="2.6" fill={outXOR ? "#FF4D00" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.5" />
            <text x="359" y="52" fontSize="4.4" fontWeight="bold" fill={outXOR ? "#FF4D00" : "#71717A"}>
              ={outXOR ? "1" : "0"}
            </text>
          </g>

          {/* Piste de retour XOR vers Pin 3 du processeur (y=175) avec résistance R1 */}
          <path d="M 346 50 V 62 H 368 V 175 H 274" stroke={outXOR ? "#FF4D00" : "#52525B"} strokeWidth={1.1} fill="none" />
          <g transform="translate(324, 175)">
            <rect x="-5" y="-2.5" width="10" height="5" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-5" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <rect x="3" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.6" fill="#71717A">R1 (1k)</text>
          </g>

          {/* --- PORTE 2 : AND (Y = A · B) à y=98 --- */}
          {/* Entrée A du AND (x=286 -> x=322, y=93) */}
          <path d="M 286 93 H 322" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.4 : 1} fill="none" />
          <circle cx="286" cy="93" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* Entrée B du AND (x=300 -> x=322, y=103) */}
          <path d="M 300 103 H 322" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth={logicB ? 1.4 : 1} fill="none" />
          <circle cx="300" cy="103" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />

          <g>
            <path
              d="M 322 89 H 332 A 9 9 0 0 1 332 107 H 322 Z"
              fill="#181A22"
              stroke="#10B981"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="330" y="85" fontSize="4.6" textAnchor="middle" fill="#10B981" fontWeight="bold">AND</text>

            {/* Sortie AND vers LED probe */}
            <path d="M 341 98 H 354" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth={outAND ? 1.5 : 1} fill="none" />
            <circle cx="354" cy="98" r="2.6" fill={outAND ? "#10B981" : "#27272A"} filter={outAND ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.5" />
            <text x="359" y="100" fontSize="4.4" fontWeight="bold" fill={outAND ? "#10B981" : "#71717A"}>
              ={outAND ? "1" : "0"}
            </text>
          </g>

          {/* Piste de retour AND vers Pin 4 du processeur (y=190) avec résistance R2 */}
          <path d="M 345 98 V 110 H 368 V 190 H 274" stroke={outAND ? "#10B981" : "#52525B"} strokeWidth={1.1} fill="none" />
          <g transform="translate(324, 190)">
            <rect x="-5" y="-2.5" width="10" height="5" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-5" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <rect x="3" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.6" fill="#71717A">R2 (1k)</text>
          </g>

          {/* --- PORTE 3 : OR (Y = A + B) à y=146 --- */}
          {/* Entrée A du OR (x=286 -> x=322, y=141) */}
          <path d="M 286 141 H 322" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.4 : 1} fill="none" />
          <circle cx="286" cy="141" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* Entrée B du OR (x=300 -> x=322, y=151) */}
          <path d="M 300 151 H 322" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth={logicB ? 1.4 : 1} fill="none" />
          <circle cx="300" cy="151" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />

          <g>
            <path
              d="M 322 137 Q 326 146 322 155 Q 333 155 342 146 Q 333 137 322 137 Z"
              fill="#181A22"
              stroke="#8B5CF6"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="330" y="133" fontSize="4.6" textAnchor="middle" fill="#8B5CF6" fontWeight="bold">OR</text>

            {/* Sortie OR vers LED probe */}
            <path d="M 342 146 H 354" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth={outOR ? 1.5 : 1} fill="none" />
            <circle cx="354" cy="146" r="2.6" fill={outOR ? "#8B5CF6" : "#27272A"} filter={outOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.5" />
            <text x="359" y="148" fontSize="4.4" fontWeight="bold" fill={outOR ? "#8B5CF6" : "#71717A"}>
              ={outOR ? "1" : "0"}
            </text>
          </g>

          {/* Piste de retour OR vers Pin 5 du processeur (y=205) avec résistance R3 */}
          <path d="M 346 146 H 368 V 205 H 274" stroke={outOR ? "#8B5CF6" : "#52525B"} strokeWidth={1.1} fill="none" />
          <g transform="translate(324, 205)">
            <rect x="-5" y="-2.5" width="10" height="5" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-5" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <rect x="3" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.6" fill="#71717A">R3 (1k)</text>
          </g>

          {/* =================================================================
              5. BAS DU CHIP & BAS-DROITE TOTALEMENT CONNECTÉ
              UART, I2C, STATUS LEDS, CONNECTEUR SWD/JTAG ENTIÈREMENT CÂBLÉ
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

          {/* 2. Bus I2C (SDA / SCL) avec résistances de pull-up R4 & R5 bien disposées SANS chevauchement avec C2 */}
          <path d="M 175 274 V 330" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />
          <path d="M 190 274 V 330" stroke="#A855F7" strokeWidth="1.2" fill="none" />
          {/* R4 Pullup sur SDA (texte à gauche de 175) */}
          <g transform="translate(175, 302)">
            <rect x="-2.5" y="-5.5" width="5" height="11" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-2.5" y="-5.5" width="5" height="2.5" fill="#E4E4E7" />
            <rect x="-2.5" y="3" width="5" height="2.5" fill="#E4E4E7" />
            <text x="-5.5" y="1.2" textAnchor="end" fontSize="3.8" fill="#71717A">R4</text>
          </g>
          {/* R5 Pullup sur SCL (texte à gauche de 190, ne chevauche jamais C2 qui est à x=205 !) */}
          <g transform="translate(190, 302)">
            <rect x="-2.5" y="-5.5" width="5" height="11" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-2.5" y="-5.5" width="5" height="2.5" fill="#E4E4E7" />
            <rect x="-2.5" y="3" width="5" height="2.5" fill="#E4E4E7" />
            <text x="-5.5" y="1.2" textAnchor="end" fontSize="3.8" fill="#71717A">R5</text>
          </g>
          <text x="182.5" y="288" textAnchor="middle" fontSize="3.6" fill="#71717A">4.7k PULLUP</text>

          <g transform="translate(175, 336)">
            <circle cx="0" cy="0" r="2.2" fill="none" stroke="#8B5CF6" strokeWidth="0.7" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">SDA</text>
          </g>
          <g transform="translate(190, 336)">
            <circle cx="0" cy="0" r="2.2" fill="none" stroke="#A855F7" strokeWidth="0.7" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">SCL</text>
          </g>
          <text x="182.5" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">I2C</text>

          {/* 3. Ligne GND avec condensateur C2 vertical à pin 5 (x=205) - texte C2 à droite dégagé ! */}
          <path d="M 205 274 V 360" stroke="#71717A" strokeWidth="1.2" fill="none" />
          <g transform="translate(205, 302)">
            <rect x="-2.5" y="-5.5" width="5" height="11" rx="0.5" fill="#52525B" />
            <rect x="-2.5" y="-5" width="5" height="10" fill="#1E293B" stroke="#09090B" strokeWidth="0.5" />
            <rect x="-2.5" y="-5" width="5" height="2.5" fill="#E4E4E7" />
            <rect x="-2.5" y="2.5" width="5" height="2.5" fill="#E4E4E7" />
            <text x="5.5" y="1.2" textAnchor="start" fontSize="3.8" fill="#71717A">C2</text>
          </g>
          <g transform="translate(205, 360)">
            <circle cx="0" cy="0" r="2.8" fill="none" stroke="#71717A" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#71717A" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">GND</text>
          </g>

          {/* 4. LEDs d'état CMS (ACT, USR, PWR) reliées aux pins 6, 7, 8 (x=220, 235, 250) */}
          <path d="M 220 274 V 330" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <path d="M 235 274 V 330" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
          <path d="M 250 274 V 330" stroke={currentTheme.hex} strokeWidth="1.2" fill="none" />

          {/* D1 ACT LED (verte) */}
          <g transform="translate(220, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 2 === 0 ? "#10B981" : "#27272A"} filter={clockTick % 2 === 0 ? "url(#glow-led)" : undefined} stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">ACT</text>
          </g>
          {/* D2 USR LED (orange si XOR actif) */}
          <g transform="translate(235, 336)">
            <circle cx="0" cy="0" r="2.8" fill={outXOR ? "#F59E0B" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">USR</text>
          </g>
          {/* D3 PWR LED (s'illumine avec la couleur active du thème !) */}
          <g transform="translate(250, 336)">
            <circle cx="0" cy="0" r="2.8" fill={currentTheme.hex} filter="url(#glow-led)" stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">PWR</text>
          </g>
          <text x="235" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">STATUS</text>

          {/* 5. EN BAS À DROITE : CONNECTEUR SWD / JTAG 6 BROCHES 100% CÂBLÉ AU MCU */}
          {/* Pistes de liaison depuis les broches 6, 7, 8 droites du processeur (y=220, 235, 250) */}
          <path d="M 274 220 H 340 V 306" stroke="#06B6D4" strokeWidth="1.1" fill="none" />
          <path d="M 274 235 H 325 V 306" stroke="#10B981" strokeWidth="1.1" fill="none" />
          <path d="M 274 250 H 325 V 324" stroke="#EF4444" strokeWidth="1.1" fill="none" />
          {/* Piste 3.3V vers SWD Pin 1 */}
          <path d="M 268 260 H 310 V 306" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" fill="none" />
          {/* Piste GND vers SWD Pin 4 */}
          <path d="M 310 324 V 345" stroke="#71717A" strokeWidth="1" fill="none" />

          {/* Embase connecteur JTAG / SWD J1 à (296, 294) */}
          <g transform="translate(296, 294)">
            {/* Boîtier embase Shrouded Header 2x3 */}
            <rect x="0" y="0" width="56" height="42" rx="2" fill="#111216" stroke="#475569" strokeWidth="0.9" />
            <text x="28" y="-4" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#71717A">
              SWD / JTAG (J1)
            </text>

            {/* Rangée du haut (y=12) : 3V3 (14), SWDIO (29), SWCLK (44) */}
            <g transform="translate(14, 12)">
              <circle cx="0" cy="0" r="2.4" fill="#27272A" stroke="#D97706" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="0.9" fill="#D97706" />
              <text x="0" y="-3.5" textAnchor="middle" fontSize="3" fill="#D97706">3V3</text>
            </g>
            <g transform="translate(29, 12)">
              <circle cx="0" cy="0" r="2.4" fill="#27272A" stroke="#10B981" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="0.9" fill="#10B981" />
              <text x="0" y="-3.5" textAnchor="middle" fontSize="3" fill="#10B981">DIO</text>
            </g>
            <g transform="translate(44, 12)">
              <circle cx="0" cy="0" r="2.4" fill="#27272A" stroke="#06B6D4" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="0.9" fill="#06B6D4" />
              <text x="0" y="-3.5" textAnchor="middle" fontSize="3" fill="#06B6D4">CLK</text>
            </g>

            {/* Rangée du bas (y=30) : GND (14), NRST (29), GND (44) */}
            <g transform="translate(14, 30)">
              <circle cx="0" cy="0" r="2.4" fill="#27272A" stroke="#71717A" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="0.9" fill="#71717A" />
              <text x="0" y="5.5" textAnchor="middle" fontSize="3" fill="#71717A">GND</text>
            </g>
            <g transform="translate(29, 30)">
              <circle cx="0" cy="0" r="2.4" fill="#27272A" stroke="#EF4444" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="0.9" fill="#EF4444" />
              <text x="0" y="5.5" textAnchor="middle" fontSize="3" fill="#EF4444">RST</text>
            </g>
            <g transform="translate(44, 30)">
              <circle cx="0" cy="0" r="2.4" fill="#27272A" stroke="#71717A" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="0.9" fill="#71717A" />
              <text x="0" y="5.5" textAnchor="middle" fontSize="3" fill="#71717A">GND</text>
            </g>
          </g>

          {/* =================================================================
              6. BOÎTIER CENTRAL IC QFP (CHIP SILICIUM AVEC BROCHES RÉELLES)
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

              <rect x="13" y="0" width="10" height="8" rx="0.5" fill={logicB ? "#06B6D4" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="18" y="6" textAnchor="middle" fontSize="4" fill={logicB ? "#FFF" : "#71717A"}>{valB}</text>

              <rect x="26" y="0" width="10" height="8" rx="0.5" fill={outXOR ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="31" y="6" textAnchor="middle" fontSize="4" fill={outXOR ? "#FFF" : "#71717A"}>{outXOR ? 1 : 0}</text>

              <rect x="39" y="0" width="10" height="8" rx="0.5" fill={outAND ? "#10B981" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="44" y="6" textAnchor="middle" fontSize="4" fill={outAND ? "#FFF" : "#71717A"}>{outAND ? 1 : 0}</text>

              <rect x="52" y="0" width="10" height="8" rx="0.5" fill={outOR ? "#8B5CF6" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="57" y="6" textAnchor="middle" fontSize="4" fill={outOR ? "#FFF" : "#71717A"}>{outOR ? 1 : 0}</text>

              <text x="0" y="20" fontSize="4.2" fill="#71717A">
                BUS: <tspan fill={logicA ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{valA}</tspan><tspan fill={logicB ? "#06B6D4" : "#71717A"} fontWeight="bold">{valB}</tspan> · RET: <tspan fill={outXOR ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{outXOR ? 1 : 0}</tspan>
              </text>
            </g>
          </g>

          {/* Module 3 : CŒUR RV32I ALU & REGFILE EN DIRECT (Center) */}
          <g transform="translate(138, 180)">
            <rect x="0" y="0" width="124" height="48" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="124" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.5" fontWeight="bold" fill="#F4F4F5">RV32I EXECUTION CORE</text>
            <text x="120" y="6.5" textAnchor="end" fontSize="4" fill={currentTheme.hex}>x0..x31 REGFILE</text>

            <g transform="translate(6, 14)">
              <text x="0" y="6" fontSize="4.5" fill="#A1A1AA">x10 (a0): <tspan fill={logicA ? "#FF4D00" : "#71717A"} fontWeight="bold">0x0{valA}</tspan></text>
              <text x="60" y="6" fontSize="4.5" fill="#A1A1AA">x11 (a1): <tspan fill={logicB ? "#06B6D4" : "#71717A"} fontWeight="bold">0x0{valB}</tspan></text>

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
            <text x="0" y="28" fontSize="5" fill={isResetting ? "#EF4444" : "#10B981"} fontWeight="bold">
              STATUS: {isResetting ? "CORE RESETTING..." : "PIPELINE EXECUTING"}
            </text>
          </g>
        </svg>
      </motion.div>

      {/* Légende bas discrète et technique */}
      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — processeur rv32i & banc logique multi-portes</span>
        <span className="font-semibold" style={{ color: currentTheme.hex }}>
          XOR:{outXOR ? 1 : 0} · AND:{outAND ? 1 : 0} · OR:{outOR ? 1 : 0}
        </span>
      </div>
    </div>
  );
}
