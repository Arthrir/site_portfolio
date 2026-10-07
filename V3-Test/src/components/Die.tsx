import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip & PCB Lab ----------------
 * Conception électronique & CAO :
 * - Fond 100% transparent (fond crème du portfolio préservé).
 * - Câblage orthogonal 100% connecté et sans aucun croisement :
 *   - Bouton A (Orange) et Bouton B (Cyan) avec sorties parfaitement centrées sur l'axe du composant.
 *   - VDD 3.3V routé proprement en haut sans croiser les points de test TP1, TP2, TP3.
 *   - Rail B continu partant du pin B de XOR (y=56) jusqu'au pin 2 du CPU (y=160).
 *   - Porte XOR avec identité couleur unique (Magenta néon #EC4899) pour la distinguer totalement de l'entrée A (Orange).
 *   - Portes logiques (XOR Magenta, AND Vert, OR Violet) avec sondes strictement dans les limites du PCB.
 * - Synchronisation dynamique de la couleur du site :
 *   - Liée directement aux combinaisons logiques des portes (A, B) :
 *     (0,0) -> Orange | (1,0) -> Cyan | (0,1) -> Vert | (1,1) -> Violet.
 *   - Notification instantanée de 2s sur le mini écran OLED I2C en haut.
 * - Bas de carte entièrement connecté :
 *   - Toutes les pistes descendent au centre exact (cx, cy) des cercles (LEDs, pads, bus).
 *   - Connecteur SWD / JTAG 6 broches entièrement câblé avec pistes visibles pénétrant chaque broche.
 * - Bouton poussoir tactile CMS réaliste (RESET) avec dôme rouge et clic interactif à gauche.
 * - Cœur RISC-V SoC avec architecture exacte :
 *   - REGFILE 128B (32x 32-bit = 1024 bits = 128 octets réels pour les registres x0..x31).
 *   - Registre matériel invariant x0 (zero) = 0x00.
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

  // Bouton tactile RESET mécanique (avec impulsion visuelle)
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = () => {
    setIsResetting(true);
    setLogicA(false);
    setLogicB(false);
    setOledOverride("SYS :: RESET");
    setTimeout(() => {
      setIsResetting(false);
    }, 250);
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
            {/* Texte VDD placé à gauche avec marge, aucun chevauchement */}
            <text x="-6" y="1.5" textAnchor="end" fontSize="4.2" fontWeight="bold" fill="#71717A">VDD 3.3V</text>
          </g>

          {/* Ligne d'alimentation VDD vers les boutons : passe par le haut (y=16)
              pour NE PAS chevaucher les points de test TP1, TP2, TP3 ! */}
          <path d="M 205 24 V 16 H 241 V 85" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" fill="none" />
          <circle cx="241" cy="16" r="1.2" fill="#D97706" />

          {/* MINI ÉCRAN OLED SSD1306 (0.91" 128x32) BRANCHÉ SUR LE BUS I2C / GPIO EN HAUT */}
          <path d="M 145 126 V 76" stroke="#71717A" strokeWidth="1" fill="none" />
          <path d="M 160 126 V 76" stroke="#D97706" strokeWidth="1" fill="none" />
          <path d="M 175 126 V 76" stroke="#A855F7" strokeWidth="1" fill="none" />
          <path d="M 190 126 V 76" stroke="#8B5CF6" strokeWidth="1" fill="none" />

          {/* Module OLED à (120, 24) */}
          <g transform="translate(120, 24)">
            <rect x="0" y="0" width="76" height="52" rx="2" fill="#0B132B" stroke="#334155" strokeWidth="1" />
            <rect x="4" y="6" width="68" height="26" rx="1" fill="#020617" stroke="#1E293B" strokeWidth="0.8" />

            {/* Matrice OLED avec texte qui défile en direct */}
            <g clipPath="url(#oled-clip)">
              <defs>
                <clipPath id="oled-clip">
                  <rect x="5" y="7" width="66" height="24" rx="1" />
                </clipPath>
              </defs>
              <text x="8" y="14" fontSize="4.2" fill="#38BDF8" fontFamily="monospace" fontWeight="bold">
                OLED :: I2C 0x3C
              </text>
              <text x="8" y="22" fontSize="4.6" fill="#00FFCC" fontFamily="monospace" fontWeight="bold">
                {displayText}
              </text>
              <text x="8" y="28" fontSize="3.8" fill="#94A3B8" fontFamily="monospace">
                CLK:{120 + (clockTick % 3)}MHz · PWR:OK
              </text>
            </g>

            {/* Broches d'en-tête soudées alignées avec les pistes */}
            <g transform="translate(25, 46)">
              <circle cx="0" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="0" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#71717A">GND</text>

              <circle cx="15" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="15" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#D97706">VCC</text>

              <circle cx="30" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="30" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#A855F7">SCL</text>

              <circle cx="45" cy="0" r="2.2" fill="#181A22" stroke="#D4D4D8" strokeWidth="0.6" />
              <text x="45" y="-3.5" textAnchor="middle" fontSize="3.2" fill="#8B5CF6">SDA</text>
            </g>
          </g>

          {/* Broches 6, 7, 8 du haut (x=220, 235, 250) reliées à des points de test GPIO TP1, TP2, TP3
              Aucun câble ne passe à côté : zone parfaitement dégagée ! */}
          <path d="M 220 126 V 76" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="220" cy="76" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <circle cx="220" cy="76" r="0.8" fill="#71717A" />
          <text x="220" y="68" textAnchor="middle" fontSize="3.6" fill="#71717A">TP1</text>

          <path d="M 235 126 V 76" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="235" cy="76" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <circle cx="235" cy="76" r="0.8" fill="#71717A" />
          <text x="235" y="68" textAnchor="middle" fontSize="3.6" fill="#71717A">TP2</text>

          <path d="M 250 126 V 76" stroke="#71717A" strokeWidth="1" fill="none" />
          <circle cx="250" cy="76" r="2" fill="none" stroke="#71717A" strokeWidth="0.8" />
          <circle cx="250" cy="76" r="0.8" fill="#71717A" />
          <text x="250" y="68" textAnchor="middle" fontSize="3.6" fill="#71717A">TP3</text>

          {/* =================================================================
              3. HORLOGE OSCILLATEUR QUARTZ 120 MHz & BOUTON TACTILE RESET CMS (GAUCHE)
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

          {/* BOUTON POUSSOIR TACTILE RESET CMS RÉALISTE AVEC ACTIONNEUR ROUGE ET CLIC */}
          <g
            className="cursor-pointer group"
            onClick={handleReset}
            transform="translate(46, 208)"
          >
            {/* 4 pattes de soudure métalliques CMS */}
            <rect x="-3" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="18" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="2" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="24" y="18" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Boîtier métallique chromé du bouton poussoir */}
            <rect x="0" y="0" width="24" height="24" rx="2" fill="#181A22" stroke="#64748B" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="9" fill="#0F172A" stroke="#334155" strokeWidth="0.6" />

            {/* Plongeur tactile central rouge vif */}
            <circle
              cx="12"
              cy="12"
              r={isResetting ? "5.5" : "6.5"}
              fill={isResetting ? "#B91C1C" : "#EF4444"}
              stroke="#FCA5A5"
              strokeWidth="0.8"
              filter={isResetting ? "url(#glow-led)" : undefined}
            />

            {/* Sérigraphie industrielle */}
            <text x="12" y="-4" textAnchor="middle" fontSize="4.6" fontWeight="bold" fill="#EF4444">
              RESET
            </text>
            <text x="12" y="30" textAnchor="middle" fontSize="3.6" fill="#71717A">
              SW1 · NRST
            </text>
          </g>

          {/* Piste NRST reliant la sortie droite du bouton au Pin 6 gauche du microcontrôleur (y=220) */}
          <path d="M 73 220 H 126" stroke="#EF4444" strokeWidth="1.2" fill="none" />
          <circle cx="100" cy="220" r="1.4" fill="#EF4444" />
          <text x="100" y="215" textAnchor="middle" fontSize="4" fill="#71717A">NRST</text>

          {/* =================================================================
              4. BANC MULTI-PORTES FLUIDE ET CONNECTÉ (HAUT-DROITE)
              Bouton A (ORANGE) & Bouton B (CYAN) avec connexions parfaitement centrées !
              Porte XOR : COULEUR UNIQUE (MAGENTA NÉON #EC4899) pour ne pas confondre avec l'entrée A !
              Rails orthogonaux sans coupure : Rail B relie fermement le XOR pin B jusqu'au bas !
              ================================================================= */}
          {/* Bouton Poussoir Tactile SMD A à (243, 27) - ACCENT ORANGE (#FF4D00)
              Centre exact du bouton : (254, 38) */}
          <g className="cursor-pointer" onClick={() => setLogicA((a) => !a)} transform="translate(243, 27)">
            {/* 4 pattes de soudure métalliques */}
            <rect x="-3" y="3" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="15" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="22" y="3" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="22" y="15" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Boîtier 22x22mm */}
            <rect x="0" y="0" width="22" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="11" cy="11" r="8.5" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Plongeur central orange */}
            <circle
              cx="11"
              cy="11"
              r="6"
              fill={logicA ? "#FF4D00" : "#334155"}
              stroke={logicA ? "#FF7A33" : "#475569"}
              strokeWidth="0.8"
              filter={logicA ? "url(#glow-led)" : undefined}
            />
            <text x="11" y="-4" textAnchor="middle" fontSize="4.6" fontWeight="bold" fill={logicA ? "#FF4D00" : "#71717A"}>
              BTN A ({valA})
            </text>
          </g>

          {/* Bouton Poussoir Tactile SMD B à (243, 67) - ACCENT CYAN (#06B6D4)
              Centre exact du bouton : (254, 78) */}
          <g className="cursor-pointer" onClick={() => setLogicB((b) => !b)} transform="translate(243, 67)">
            {/* 4 pattes de soudure métalliques */}
            <rect x="-3" y="3" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="-3" y="15" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="22" y="3" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />
            <rect x="22" y="15" width="3" height="4" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="0.4" />

            {/* Boîtier 22x22mm */}
            <rect x="0" y="0" width="22" height="22" rx="2" fill="#181A22" stroke="#475569" strokeWidth="0.8" />
            <circle cx="11" cy="11" r="8.5" fill="#111216" stroke="#334155" strokeWidth="0.6" />
            {/* Plongeur central cyan */}
            <circle
              cx="11"
              cy="11"
              r="6"
              fill={logicB ? "#06B6D4" : "#334155"}
              stroke={logicB ? "#22D3EE" : "#475569"}
              strokeWidth="0.8"
              filter={logicB ? "url(#glow-led)" : undefined}
            />
            <text x="11" y="-4" textAnchor="middle" fontSize="4.6" fontWeight="bold" fill={logicB ? "#06B6D4" : "#71717A"}>
              BTN B ({valB})
            </text>
          </g>

          {/* SORTIES DES BOUTONS PARFAITEMENT CENTRÉES SUR L'AXE (y=38 pour A, y=78 pour B) :
              Les pattes droites sont reliées, et la piste sort exactement au centre ! */}
          {/* Pont et sortie pour Bouton A à y=38 */}
          <path d="M 265 30 H 268 V 46 H 265" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth="1" fill="none" />
          <path d="M 268 38 H 286" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.6 : 1} fill="none" />

          {/* Pont et sortie pour Bouton B à y=78 */}
          <path d="M 265 70 H 268 V 86 H 265" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth="1" fill="none" />
          <path d="M 268 78 H 300" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth={logicB ? 1.6 : 1} fill="none" />

          {/* RAIL A VERTICAL (Orange) : va de y=38 à y=145 (Pin 1 du CPU) */}
          <path
            d="M 286 38 V 145 H 274"
            stroke={logicA ? "#FF4D00" : "#52525B"}
            strokeWidth={logicA ? 1.5 : 1}
            fill="none"
          />
          <circle cx="286" cy="38" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />
          <circle cx="286" cy="145" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* RAIL B VERTICAL (Cyan) : PART DU HAUT (y=56, XOR pin B) JUSQU'À y=160 (Pin 2 du CPU)
              100% continu, solide, physiquement relié à BTN B à y=78 et au XOR B à y=56 ! */}
          <path
            d="M 300 56 V 160 H 274"
            stroke={logicB ? "#06B6D4" : "#52525B"}
            strokeWidth={logicB ? 1.5 : 1}
            fill="none"
          />
          <circle cx="300" cy="56" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />
          <circle cx="300" cy="78" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />
          <circle cx="300" cy="160" r="1.4" fill={logicB ? "#06B6D4" : "#52525B"} />

          {/* --- PORTE 1 : XOR (Y = A ⊕ B) à y=50 ---
              COULEUR EXCLUSIVE : MAGENTA NÉON (#EC4899)
              Permet une distinction immédiate entre l'entrée A (Orange), l'entrée B (Cyan) et la sortie XOR (Magenta) ! */}
          {/* Entrée A du XOR (Orange, x=286 -> x=322, y=44) */}
          <path d="M 286 44 H 322" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.4 : 1} fill="none" />
          <circle cx="286" cy="44" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

          {/* Entrée B du XOR (Cyan, x=300 -> x=322, y=56) */}
          <path d="M 300 56 H 322" stroke={logicB ? "#06B6D4" : "#52525B"} strokeWidth={logicB ? 1.4 : 1} fill="none" />

          {/* Corps de la porte XOR (Magenta #EC4899) */}
          <g>
            {/* Arc d'entrée XOR séparé */}
            <path d="M 319 40 Q 323 50 319 60" fill="none" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
            {/* Corps principal XOR */}
            <path
              d="M 322 40 Q 334 43 342 50 Q 334 57 322 60 Q 326 50 322 40 Z"
              fill="#181A22"
              stroke="#EC4899"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <text x="332" y="36" fontSize="4.6" textAnchor="middle" fill="#EC4899" fontWeight="bold">XOR</text>

            {/* Sortie XOR vers LED probe (Magenta) */}
            <path d="M 342 50 H 354" stroke={outXOR ? "#EC4899" : "#52525B"} strokeWidth={outXOR ? 1.5 : 1} fill="none" />
            <circle cx="354" cy="50" r="2.6" fill={outXOR ? "#EC4899" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#52525B" strokeWidth="0.5" />
            <text x="359" y="52" fontSize="4.4" fontWeight="bold" fill={outXOR ? "#EC4899" : "#71717A"}>
              ={outXOR ? "1" : "0"}
            </text>
          </g>

          {/* Piste de retour XOR vers Pin 3 du processeur (y=175) avec résistance R1 (Magenta) */}
          <path d="M 346 50 V 62 H 368 V 175 H 274" stroke={outXOR ? "#EC4899" : "#52525B"} strokeWidth={1.1} fill="none" />
          <g transform="translate(324, 175)">
            <rect x="-5" y="-2.5" width="10" height="5" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-5" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <rect x="3" y="-2.5" width="2" height="5" fill="#E4E4E7" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.6" fill="#71717A">R1 (1k)</text>
          </g>

          {/* --- PORTE 2 : AND (Y = A · B) à y=98 --- (Vert #10B981) */}
          <path d="M 286 93 H 322" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.4 : 1} fill="none" />
          <circle cx="286" cy="93" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

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

          {/* --- PORTE 3 : OR (Y = A + B) à y=146 --- (Violet #8B5CF6) */}
          <path d="M 286 141 H 322" stroke={logicA ? "#FF4D00" : "#52525B"} strokeWidth={logicA ? 1.4 : 1} fill="none" />
          <circle cx="286" cy="141" r="1.4" fill={logicA ? "#FF4D00" : "#52525B"} />

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
              Toutes les pistes descendent au CENTRE EXACT (cx, cy) des cercles !
              Connecteur SWD / JTAG entièrement câblé avec pistes visibles entrant dans les pastilles.
              ================================================================= */}
          {/* 1. Interface UART (TX / RX) : pistes descendant jusqu'au centre de la LED (y=336) */}
          <path d="M 145 274 V 336" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
          <path d="M 160 274 V 336" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <g transform="translate(145, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 4 === 0 ? "#06B6D4" : "#27272A"} filter={clockTick % 4 === 0 ? "url(#glow-led)" : undefined} stroke="#475569" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">TX</text>
          </g>
          <g transform="translate(160, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 3 === 0 ? "#10B981" : "#27272A"} filter={clockTick % 3 === 0 ? "url(#glow-led)" : undefined} stroke="#475569" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">RX</text>
          </g>
          <text x="152.5" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">UART</text>

          {/* 2. Bus I2C (SDA / SCL) : pistes descendant jusqu'au centre du point de test (y=336) */}
          <path d="M 175 274 V 336" stroke="#8B5CF6" strokeWidth="1.2" fill="none" />
          <path d="M 190 274 V 336" stroke="#A855F7" strokeWidth="1.2" fill="none" />
          {/* R4 Pullup sur SDA */}
          <g transform="translate(175, 302)">
            <rect x="-2.5" y="-5.5" width="5" height="11" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-2.5" y="-5.5" width="5" height="2.5" fill="#E4E4E7" />
            <rect x="-2.5" y="3" width="5" height="2.5" fill="#E4E4E7" />
            <text x="-5.5" y="1.2" textAnchor="end" fontSize="3.8" fill="#71717A">R4</text>
          </g>
          {/* R5 Pullup sur SCL */}
          <g transform="translate(190, 302)">
            <rect x="-2.5" y="-5.5" width="5" height="11" fill="#181A22" stroke="#3F3F46" strokeWidth="0.5" />
            <rect x="-2.5" y="-5.5" width="5" height="2.5" fill="#E4E4E7" />
            <rect x="-2.5" y="3" width="5" height="2.5" fill="#E4E4E7" />
            <text x="-5.5" y="1.2" textAnchor="end" fontSize="3.8" fill="#71717A">R5</text>
          </g>
          <text x="182.5" y="288" textAnchor="middle" fontSize="3.6" fill="#71717A">4.7k PULLUP</text>

          <g transform="translate(175, 336)">
            <circle cx="0" cy="0" r="2.4" fill="#181A22" stroke="#8B5CF6" strokeWidth="0.7" />
            <circle cx="0" cy="0" r="0.9" fill="#8B5CF6" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">SDA</text>
          </g>
          <g transform="translate(190, 336)">
            <circle cx="0" cy="0" r="2.4" fill="#181A22" stroke="#A855F7" strokeWidth="0.7" />
            <circle cx="0" cy="0" r="0.9" fill="#A855F7" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">SCL</text>
          </g>
          <text x="182.5" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">I2C</text>

          {/* 3. Ligne GND avec condensateur C2 vertical : va au centre exact du pad GND (y=360) */}
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

          {/* 4. LEDs d'état CMS (ACT, USR, PWR) : pistes descendant jusqu'au centre de chaque LED (y=336) */}
          <path d="M 220 274 V 336" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <path d="M 235 274 V 336" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
          <path d="M 250 274 V 336" stroke={currentTheme.hex} strokeWidth="1.2" fill="none" />

          {/* D1 ACT LED (verte) */}
          <g transform="translate(220, 336)">
            <circle cx="0" cy="0" r="2.8" fill={clockTick % 2 === 0 ? "#10B981" : "#27272A"} filter={clockTick % 2 === 0 ? "url(#glow-led)" : undefined} stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">ACT</text>
          </g>
          {/* D2 USR LED (ambre si XOR actif) */}
          <g transform="translate(235, 336)">
            <circle cx="0" cy="0" r="2.8" fill={outXOR ? "#F59E0B" : "#27272A"} filter={outXOR ? "url(#glow-led)" : undefined} stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">USR</text>
          </g>
          {/* D3 PWR LED (couleur dynamique du thème) */}
          <g transform="translate(250, 336)">
            <circle cx="0" cy="0" r="2.8" fill={currentTheme.hex} filter="url(#glow-led)" stroke="#3F3F46" strokeWidth="0.5" />
            <text x="0" y="8" textAnchor="middle" fontSize="4.2" fill="#71717A">PWR</text>
          </g>
          <text x="235" y="356" textAnchor="middle" fontSize="4.5" fill="#71717A" fontWeight="bold">STATUS</text>

          {/* 5. CONNECTEUR SWD / JTAG 6 BROCHES EN BAS À DROITE :
              Le boîtier est dessiné en premier, et les pistes entrent VISIBLEMENT
              dans le centre exact de chaque pastille circulaire ! */}
          {/* Boîtier d'embase Shrouded Header 2x3 à (294, 288) */}
          <g transform="translate(294, 288)">
            <rect x="0" y="0" width="64" height="50" rx="2" fill="#0B132B" stroke="#475569" strokeWidth="0.9" />
            <text x="32" y="-4" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#71717A">
              SWD / JTAG (J1)
            </text>
          </g>

          {/* Pistes de signaux entrant dans chaque broche du connecteur */}
          {/* Pin 1 : 3V3 à (306, 302) */}
          <path d="M 268 260 H 306 V 302" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          {/* Pin 2 : SWDIO à (326, 302) */}
          <path d="M 274 235 H 326 V 302" stroke="#10B981" strokeWidth="1.2" fill="none" />
          {/* Pin 3 : SWCLK à (346, 302) */}
          <path d="M 274 220 H 346 V 302" stroke="#06B6D4" strokeWidth="1.2" fill="none" />

          {/* Pin 4 : GND à (306, 324) */}
          <path d="M 306 324 V 352" stroke="#71717A" strokeWidth="1.2" fill="none" />
          {/* Pin 5 : NRST à (326, 324) */}
          <path d="M 274 250 H 354 V 324 H 326" stroke="#EF4444" strokeWidth="1.2" fill="none" />
          {/* Pin 6 : GND à (346, 324) */}
          <path d="M 346 324 V 352" stroke="#71717A" strokeWidth="1.2" fill="none" />

          {/* Pastilles annulaires dessinées PAR-DESSUS les pistes aux centres exacts */}
          {/* Rangée 1 (y=302) */}
          <g transform="translate(306, 302)">
            <circle cx="0" cy="0" r="3" fill="#181A22" stroke="#E4E4E7" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#D97706" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#D97706">3V3</text>
          </g>
          <g transform="translate(326, 302)">
            <circle cx="0" cy="0" r="3" fill="#181A22" stroke="#E4E4E7" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#10B981" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#10B981">DIO</text>
          </g>
          <g transform="translate(346, 302)">
            <circle cx="0" cy="0" r="3" fill="#181A22" stroke="#E4E4E7" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#06B6D4" />
            <text x="0" y="-4" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#06B6D4">CLK</text>
          </g>

          {/* Rangée 2 (y=324) */}
          <g transform="translate(306, 324)">
            <circle cx="0" cy="0" r="3" fill="#181A22" stroke="#E4E4E7" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#71717A" />
            <text x="0" y="6" textAnchor="middle" fontSize="3.2" fill="#71717A">GND</text>
          </g>
          <g transform="translate(326, 324)">
            <circle cx="0" cy="0" r="3" fill="#181A22" stroke="#E4E4E7" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#EF4444" />
            <text x="0" y="6" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#EF4444">RST</text>
          </g>
          <g transform="translate(346, 324)">
            <circle cx="0" cy="0" r="3" fill="#181A22" stroke="#E4E4E7" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.1" fill="#71717A" />
            <text x="0" y="6" textAnchor="middle" fontSize="3.2" fill="#71717A">GND</text>
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

          {/* Module 2 : BANC DE REGISTRES RV32I REGFILE 128B (Top-Right)
              Précision technique : 32 registres de 32 bits = 1024 bits = 128 octets exacts ! */}
          <g transform="translate(180, 138)">
            <rect x="0" y="0" width="82" height="36" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <rect x="0" y="0" width="82" height="9" fill="#13141A" stroke="#27272A" strokeWidth="0.5" />
            <text x="4" y="6.5" fontSize="4.2" fontWeight="bold" fill="#F4F4F5">REGFILE 128B</text>
            <text x="78" y="6.5" textAnchor="end" fontSize="3.8" fill="#10B981">[RV32I 32x32b]</text>

            {/* Matrice des cellules mémoires dynamiques avec leurs vraies couleurs dédiées */}
            <g transform="translate(4, 12)">
              {/* a0 (Orange) */}
              <rect x="0" y="0" width="10" height="8" rx="0.5" fill={logicA ? "#FF4D00" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="5" y="6" textAnchor="middle" fontSize="4" fill={logicA ? "#FFF" : "#71717A"}>{valA}</text>

              {/* a1 (Cyan) */}
              <rect x="13" y="0" width="10" height="8" rx="0.5" fill={logicB ? "#06B6D4" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="18" y="6" textAnchor="middle" fontSize="4" fill={logicB ? "#FFF" : "#71717A"}>{valB}</text>

              {/* x12 (XOR - Magenta) */}
              <rect x="26" y="0" width="10" height="8" rx="0.5" fill={outXOR ? "#EC4899" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="31" y="6" textAnchor="middle" fontSize="4" fill={outXOR ? "#FFF" : "#71717A"}>{outXOR ? 1 : 0}</text>

              {/* x13 (AND - Vert) */}
              <rect x="39" y="0" width="10" height="8" rx="0.5" fill={outAND ? "#10B981" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="44" y="6" textAnchor="middle" fontSize="4" fill={outAND ? "#FFF" : "#71717A"}>{outAND ? 1 : 0}</text>

              {/* x14 (OR - Violet) */}
              <rect x="52" y="0" width="10" height="8" rx="0.5" fill={outOR ? "#8B5CF6" : "#27272A"} stroke="#3F3F46" strokeWidth="0.4" />
              <text x="57" y="6" textAnchor="middle" fontSize="4" fill={outOR ? "#FFF" : "#71717A"}>{outOR ? 1 : 0}</text>

              <text x="0" y="20" fontSize="4" fill="#71717A">
                FAST REGISTERS · DUAL-PORT 32-BIT
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

              {/* x12 xor affiché en Magenta pour concorder avec la porte XOR ! */}
              <text x="0" y="16" fontSize="4.5" fill="#A1A1AA">x12 (xor): <tspan fill={outXOR ? "#EC4899" : "#71717A"} fontWeight="bold">0x0{outXOR ? 1 : 0}</tspan></text>
              <text x="60" y="16" fontSize="4.5" fill="#A1A1AA">x13 (and): <tspan fill={outAND ? "#10B981" : "#71717A"} fontWeight="bold">0x0{outAND ? 1 : 0}</tspan></text>

              <text x="0" y="26" fontSize="4.5" fill="#A1A1AA">x14 (or): <tspan fill={outOR ? "#8B5CF6" : "#71717A"} fontWeight="bold">0x0{outOR ? 1 : 0}</tspan></text>
              {/* x0 (zero) registre standard RISC-V câblé à 0, remplace le drapeau confus */}
              <text x="60" y="26" fontSize="4.5" fill="#71717A">x0 (zero): <tspan fill="#71717A" fontWeight="bold">0x00</tspan></text>
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
