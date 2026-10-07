import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip EDA Lab ----------------
 * Boîtier silicium noir & orange ultra-technique et épuré :
 * - Aucune commande importante dans la zone haut-gauche (réservée à la photo polaroid)
 * - Banc logique interactif spacieux en haut à droite : boutons A, B, sélecteur de porte, sonde OUT
 * - Calculs ALU 100% cohérents et exacts : A (0/1), B (0/1), porte (XOR, AND, OR), ALU OUT, registre a2
 * - Boîtier IC noir mat avec slug cuivre orange, chanfrein Pin 1, marquage laser RISC-V / STM32
 * - Module d'horloge FSM en bas à gauche avec bouton RUN/HALT et LED cadencée
 * -------------------------------------------------------------------------- */

export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 140, damping: 20 });
  const { tr } = useLang();

  // Entrées logiques 1-bit
  const [inA, setInA] = useState(true);
  const [inB, setInB] = useState(false);
  const [gateType, setGateType] = useState<"XOR" | "AND" | "OR">("XOR");
  const [isRunning, setIsRunning] = useState(true);
  const [clockTick, setClockTick] = useState(0);

  // Horloge logique
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setClockTick((t) => (t + 1) % 16);
    }, 450);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Valeurs logiques strictes et rigoureusement exactes
  const valA = inA ? 1 : 0;
  const valB = inB ? 1 : 0;
  const aluOut =
    gateType === "XOR"
      ? valA ^ valB
      : gateType === "AND"
      ? valA & valB
      : valA | valB;

  const isZero = aluOut === 0 ? 1 : 0;

  return (
    <div className="relative w-full max-w-[420px] pb-4 [perspective:1200px]">
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
            {/* Grille technique EDA fine */}
            <pattern id="eda-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="#3F3F46" opacity="0.25" />
            </pattern>

            {/* Hachures cuivre du slug thermique */}
            <pattern id="slug-hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#C2410C" strokeWidth="1" />
            </pattern>

            {/* Lueur pour les LEDs actives */}
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* =================================================================
              1. SUBSTRAT PCB NOIR & PASTILLES DE CONTACT
              ================================================================= */}
          <rect width="400" height="400" rx="3" fill="#0C0D10" stroke="#27272A" strokeWidth="1.5" />
          <rect width="400" height="400" fill="url(#eda-grid)" pointerEvents="none" />

          {/* Repères fiduciels de précision PCB */}
          {[
            { cx: 18, cy: 18 },
            { cx: 382, cy: 18 },
            { cx: 18, cy: 382 },
            { cx: 382, cy: 382 },
          ].map((f, i) => (
            <g key={`fid-${i}`}>
              <circle cx={f.cx} cy={f.cy} r="4" fill="none" stroke="#52525B" strokeWidth="0.8" />
              <circle cx={f.cx} cy={f.cy} r="1.4" fill="#FF4D00" />
            </g>
          ))}

          {/* Pastilles périphériques CMS (14 pads par bord) */}
          {Array.from({ length: 14 }).map((_, i) => (
            <g key={`pads-${i}`}>
              {/* Haut */}
              <rect x={44 + i * 22} y={8} width={9} height={12} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              {/* Bas */}
              <rect x={44 + i * 22} y={380} width={9} height={12} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              {/* Gauche */}
              <rect x={8} y={44 + i * 22} width={12} height={9} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              {/* Droite */}
              <rect x={380} y={44 + i * 22} width={12} height={9} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
            </g>
          ))}

          {/* Pistes de routage passives dans la zone haut-gauche (zone sous la photo) */}
          <g stroke="#27272A" strokeWidth="1.2" fill="none">
            <path d="M 20 80 H 70 V 130" />
            <path d="M 20 102 H 55 V 150" />
            <path d="M 80 20 V 50 H 120" />
            <circle cx="70" cy="130" r="1.8" fill="#3F3F46" />
            <circle cx="55" cy="150" r="1.8" fill="#3F3F46" />
          </g>

          {/* =================================================================
              2. BANC LOGIQUE INTERACTIF (HAUT-DROITE - ENTIÈREMENT DÉGAGÉ)
              Boutons A et B larges, sélecteur de porte, symbole ANSI & Sonde
              ================================================================= */}
          <g transform="translate(142, 24)">
            {/* Boîtier du banc logique */}
            <rect x="0" y="0" width="234" height="106" rx="2" fill="#13141A" stroke="#27272A" strokeWidth="1.2" />
            <rect x="0" y="0" width="234" height="18" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <text x="8" y="12.5" fontSize="7" fontWeight="bold" fill="#F4F4F5" letterSpacing="0.4">
              LOGIC TESTBENCH :: GATE STAGE
            </text>
            <text x="226" y="12.5" textAnchor="end" fontSize="6.5" fill="#71717A">
              LOGISIM CAO
            </text>

            {/* Bouton Entrée A */}
            <g className="cursor-pointer" onClick={() => setInA((v) => !v)} transform="translate(10, 26)">
              <rect
                x="0"
                y="0"
                width="48"
                height="22"
                rx="2"
                fill={inA ? "#FF4D00" : "#1F2028"}
                stroke={inA ? "#FF7A33" : "#3F3F46"}
                strokeWidth="1.2"
              />
              <text x="24" y="14" textAnchor="middle" fontSize="8" fontWeight="bold" fill={inA ? "#FFFFFF" : "#9CA3AF"}>
                IN_A [{valA}]
              </text>
            </g>

            {/* Bouton Entrée B */}
            <g className="cursor-pointer" onClick={() => setInB((v) => !v)} transform="translate(64, 26)">
              <rect
                x="0"
                y="0"
                width="48"
                height="22"
                rx="2"
                fill={inB ? "#FF4D00" : "#1F2028"}
                stroke={inB ? "#FF7A33" : "#3F3F46"}
                strokeWidth="1.2"
              />
              <text x="24" y="14" textAnchor="middle" fontSize="8" fontWeight="bold" fill={inB ? "#FFFFFF" : "#9CA3AF"}>
                IN_B [{valB}]
              </text>
            </g>

            {/* Sélecteur de porte logique (XOR / AND / OR) */}
            <g
              className="cursor-pointer"
              onClick={() => setGateType((g) => (g === "XOR" ? "AND" : g === "AND" ? "OR" : "XOR"))}
              transform="translate(118, 26)"
            >
              <rect x="0" y="0" width="54" height="22" rx="2" fill="#27272F" stroke="#52525B" strokeWidth="1.2" />
              <text x="27" y="14" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#F4F4F5">
                OP: {gateType} ▾
              </text>
            </g>

            {/* Voyant / Probe de sortie OUT (LED temps réel) */}
            <g transform="translate(178, 26)">
              <rect
                x="0"
                y="0"
                width="46"
                height="22"
                rx="2"
                fill={aluOut ? "#052e16" : "#1F2028"}
                stroke={aluOut ? "#22C55E" : "#3F3F46"}
                strokeWidth="1.2"
              />
              <circle
                cx="12"
                cy="11"
                r="4"
                fill={aluOut ? "#22C55E" : "#52525B"}
                filter={aluOut ? "url(#glow-green)" : undefined}
              />
              <text x="22" y="14" fontSize="7.5" fontWeight="bold" fill={aluOut ? "#4ADE80" : "#9CA3AF"}>
                Y=[{aluOut}]
              </text>
            </g>

            {/* Câblage orthogonal vers la porte logique */}
            <path d="M 34 48 V 68 H 82" fill="none" stroke={inA ? "#FF4D00" : "#3F3F46"} strokeWidth="1.4" />
            <path d="M 88 48 V 78 H 82" fill="none" stroke={inB ? "#FF4D00" : "#3F3F46"} strokeWidth="1.4" />

            {/* VÉRITABLE SYMBOLE ANSI DE LA PORTE LOGIQUE */}
            <g transform="translate(82, 63)">
              {gateType === "XOR" ? (
                <g>
                  <path d="M0 2 Q5 10 0 18" fill="none" stroke="#FF4D00" strokeWidth="1.3" />
                  <path d="M4 2 Q16 4 24 10 Q16 16 4 18 Q9 10 4 2 Z" fill="#181A22" stroke="#FF4D00" strokeWidth="1.3" />
                  <text x="12" y="12" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#F4F4F5">XOR</text>
                </g>
              ) : gateType === "AND" ? (
                <g>
                  <path d="M0 2 H12 A8 8 0 0 1 12 18 H0 Z" fill="#181A22" stroke="#FF4D00" strokeWidth="1.3" />
                  <text x="10" y="12" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#F4F4F5">AND</text>
                </g>
              ) : (
                <g>
                  <path d="M0 2 Q5 10 0 18 Q12 18 22 10 Q12 2 0 2 Z" fill="#181A22" stroke="#FF4D00" strokeWidth="1.3" />
                  <text x="10" y="12" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#F4F4F5">OR</text>
                </g>
              )}
            </g>

            {/* Ligne de sortie de la porte vers le bloc de statut */}
            <path d="M 106 73 H 140" fill="none" stroke={aluOut ? "#22C55E" : "#3F3F46"} strokeWidth="1.5" />
            <circle cx="106" cy="73" r="1.8" fill={aluOut ? "#22C55E" : "#3F3F46"} />

            {/* Équation logique récapitulative nette */}
            <g transform="translate(142, 60)">
              <rect x="0" y="0" width="82" height="28" rx="1" fill="#0C0D10" stroke="#27272A" strokeWidth="0.8" />
              <text x="6" y="11" fontSize="5.5" fill="#71717A">EQUATION :</text>
              <text x="6" y="21" fontSize="7" fontWeight="bold" fill={aluOut ? "#4ADE80" : "#F4F4F5"}>
                Y = {valA} {gateType === "XOR" ? "⊕" : gateType === "AND" ? "·" : "+"} {valB} = {aluOut}
              </text>
            </g>

            {/* Test point TP_LOGIC */}
            <g transform="translate(124, 73)">
              <circle cx="0" cy="0" r="2.8" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1" fill={aluOut ? "#22C55E" : "#FF4D00"} />
              <text x="-2" y="-5" fontSize="4.5" fill="#71717A">TP_LOGIC</text>
            </g>
          </g>

          {/* =================================================================
              3. BUS DE SIGNAL VERTICAL DU BANC LOGIQUE VERS L'IC
              ================================================================= */}
          <path
            d="M 230 130 V 146"
            fill="none"
            stroke={aluOut ? "#22C55E" : "#FF4D00"}
            strokeWidth="1.6"
          />
          {isRunning && (
            <motion.circle
              cx="230"
              cy="130"
              r="2.2"
              fill={aluOut ? "#22C55E" : "#FF4D00"}
              animate={{ cy: [130, 146] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* =================================================================
              4. BOÎTIER IC CENTRAL NOIR ET ORANGE (CHIP SILICIUM QFP-144)
              Corps noir mat #111216, slug cuivre orange, ALU trapézoïdale
              ================================================================= */}
          <g transform="translate(110, 146)">
            {/* Boîtier avec chanfrein Pin 1 en haut à gauche */}
            <path
              d="M 20 0 H 266 V 210 H 0 V 20 Z"
              fill="#111216"
              stroke="#27272A"
              strokeWidth="1.5"
            />

            {/* Index Pin 1 */}
            <circle cx="14" cy="14" r="3.5" fill="none" stroke="#FF4D00" strokeWidth="1" />
            <circle cx="14" cy="14" r="1.5" fill="#FF4D00" />

            {/* Bandeau supérieur de sérigraphie */}
            <text x="28" y="14" fontSize="7" fontWeight="bold" fill="#F4F4F5" letterSpacing="0.5">
              ISMIN-RV32I CORE :: SOC DIE
            </text>
            <text x="256" y="14" textAnchor="end" fontSize="6" fill="#71717A">
              STM32 / HW LAB
            </text>
            <line x1="0" y1="20" x2="266" y2="20" stroke="#27272A" strokeWidth="1" />

            {/* --- SLUG THERMIQUE CUIVRE ORANGE (ICONIQUE) --- */}
            <g transform="translate(14, 30)">
              <rect x="0" y="0" width="62" height="62" rx="2" fill="#EA580C" stroke="#FF7A33" strokeWidth="1.2" />
              <rect x="0" y="0" width="62" height="62" fill="url(#slug-hatch)" opacity="0.45" />
              <line x1="0" y1="0" x2="62" y2="62" stroke="#FFEDD5" strokeWidth="0.8" opacity="0.3" />
              <line x1="62" y1="0" x2="0" y2="62" stroke="#FFEDD5" strokeWidth="0.8" opacity="0.3" />

              {/* Étiquette centrale du slug */}
              <rect x="5" y="16" width="52" height="30" fill="#0C0D10" stroke="#FF4D00" strokeWidth="0.8" />
              <text x="31" y="27" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FF4D00">
                THERMAL SLUG
              </text>
              <text x="31" y="36" textAnchor="middle" fontSize="5" fill="#E4E4E7">
                RV32I · CM4
              </text>
            </g>

            {/* Bus slug vers ALU */}
            <path d="M 76 48 H 92" fill="none" stroke="#FF4D00" strokeWidth="1.4" />
            <path d="M 76 74 H 92" fill="none" stroke="#FF4D00" strokeWidth="1.4" />

            {/* --- UNITE ALU TRAPEZOIDALE CAO --- */}
            <g transform="translate(92, 32)">
              <polygon
                points="0,0 46,14 46,46 0,60 0,36 10,30 0,24"
                fill="#181A22"
                stroke="#FF4D00"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <text x="23" y="33" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#F4F4F5">
                ALU
              </text>
              <text x="23" y="41" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#FF4D00">
                {gateType}
              </text>

              {/* Pins d'entrées et sortie */}
              <text x="3" y="16" fontSize="5" fill="#A1A1AA">A</text>
              <text x="3" y="52" fontSize="5" fill="#A1A1AA">B</text>
              <text x="40" y="32" fontSize="5" fill={aluOut ? "#22C55E" : "#A1A1AA"} fontWeight="bold">Y</text>
            </g>

            {/* Bus de sortie ALU vers banque de registres */}
            <path
              d="M 138 62 H 154"
              fill="none"
              stroke={aluOut ? "#22C55E" : "#3F3F46"}
              strokeWidth="1.6"
            />
            <circle cx="138" cy="62" r="1.8" fill={aluOut ? "#22C55E" : "#3F3F46"} />

            {/* --- BANQUE DE REGISTRES & AFFICHEUR HEX --- */}
            <g transform="translate(154, 28)">
              <rect x="0" y="0" width="102" height="66" rx="1" fill="#181A22" stroke="#27272A" strokeWidth="1" />
              <rect x="0" y="0" width="102" height="13" fill="#13141A" stroke="#27272A" strokeWidth="0.8" />
              <text x="6" y="9.5" fontSize="5.5" fontWeight="bold" fill="#F4F4F5">
                REGISTER FILE & HEX OUT
              </text>

              {/* Afficheur HEX 7-segments */}
              <g transform="translate(6, 17)">
                <rect x="0" y="0" width="42" height="18" fill="#0C0D10" stroke="#FF4D00" strokeWidth="0.8" />
                <text
                  x="21"
                  y="13"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fill="#FF4D00"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  0x0{aluOut}
                </text>
                <text x="0" y="24" fontSize="4.5" fill="#71717A">HEX_ALU</text>
              </g>

              {/* Instruction ASM */}
              <g transform="translate(52, 17)">
                <rect x="0" y="0" width="44" height="18" fill="#0C0D10" stroke="#27272A" strokeWidth="0.8" />
                <text x="4" y="8" fontSize="4.5" fill="#71717A">ASM OP:</text>
                <text x="4" y="15" fontSize="5.2" fontWeight="bold" fill="#4ADE80">
                  {gateType.toLowerCase()} a2,a0,a1
                </text>
              </g>

              {/* Registres x10, x11, x12 */}
              <g transform="translate(6, 44)">
                <text x="0" y="8" fontSize="5" fill="#A1A1AA">a0: <tspan fill="#FF4D00" fontWeight="bold">0x0{valA}</tspan></text>
                <text x="32" y="8" fontSize="5" fill="#A1A1AA">a1: <tspan fill="#FF4D00" fontWeight="bold">0x0{valB}</tspan></text>
                <text x="64" y="8" fontSize="5" fill="#A1A1AA">a2: <tspan fill={aluOut ? "#22C55E" : "#71717A"} fontWeight="bold">0x0{aluOut}</tspan></text>
              </g>

              <text x="6" y="60" fontSize="4.8" fill="#71717A">
                FLAGS: ZERO={isZero} · CARRY=0
              </text>
            </g>

            {/* --- SÉRIGRAPHIE TECHNIQUE DU CHIP (LIGNES & TEXTE LASER) --- */}
            <g transform="translate(14, 104)">
              <rect x="0" y="0" width="242" height="96" fill="#14151C" stroke="#27272A" strokeWidth="1" />
              <rect x="0" y="0" width="242" height="15" fill="#0F1015" stroke="#27272A" strokeWidth="0.8" />
              <text x="8" y="10.5" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">
                MICROARCHITECTURE & INTERNAL BUSES
              </text>
              <text x="234" y="10.5" textAnchor="end" fontSize="6" fill="#FF4D00">
                LOT: AD-2027-APR
              </text>

              {/* Lignes de bus microélectronique */}
              <g stroke="#27272A" strokeWidth="1" fill="none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`bus-${i}`} x1={14 + i * 40} y1="20" x2={14 + i * 40} y2="40" />
                ))}
              </g>

              {/* Marquage laser */}
              <g transform="translate(10, 48)">
                <text x="0" y="0" fontSize="7" fontWeight="bold" fill="#E4E4E7">
                  RV32I 32-BIT PIPELINED PROCESSOR
                </text>
                <text x="0" y="10" fontSize="6" fill="#FF4D00">
                  DESIGNED AT MINES SAINT-ÉTIENNE (ISMIN) × POLIMI
                </text>
                <text x="0" y="20" fontSize="5.5" fill="#A1A1AA">
                  • SystemVerilog RTL & Logisim Architecture Verification
                </text>
                <text x="0" y="29" fontSize="5.5" fill="#71717A">
                  • Hardware-Software Interfacing (C, Assembly, RTOS, STM32)
                </text>
              </g>

              {/* Point de test TP_CORE */}
              <g transform="translate(224, 76)">
                <circle cx="0" cy="0" r="2.8" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1" fill="#FF4D00" />
                <text x="-4" y="-5" fontSize="4.5" textAnchor="end" fill="#71717A">TP_CORE</text>
              </g>
            </g>
          </g>

          {/* =================================================================
              5. MODULE HORLOGE / FSM (BAS-GAUCHE - HORS DE LA PHOTO POLAROID)
              Accessible et dégagé
              ================================================================= */}
          <g transform="translate(18, 170)">
            <rect x="0" y="0" width="84" height="84" rx="2" fill="#13141A" stroke="#27272A" strokeWidth="1.2" />
            <rect x="0" y="0" width="84" height="15" fill="#181A22" stroke="#27272A" strokeWidth="0.8" />
            <text x="6" y="10.5" fontSize="6" fontWeight="bold" fill="#F4F4F5">
              SYS_CLK / FSM
            </text>

            {/* Bouton Run / Halt */}
            <g className="cursor-pointer" onClick={() => setIsRunning((r) => !r)} transform="translate(8, 22)">
              <rect
                x="0"
                y="0"
                width="68"
                height="20"
                rx="2"
                fill={isRunning ? "#052e16" : "#450a0a"}
                stroke={isRunning ? "#22C55E" : "#EF4444"}
                strokeWidth="1"
              />
              <text
                x="34"
                y="13"
                textAnchor="middle"
                fontSize="7"
                fontWeight="bold"
                fill={isRunning ? "#4ADE80" : "#F87171"}
              >
                CLK: {isRunning ? "RUNNING" : "HALTED"}
              </text>
            </g>

            {/* LED Horloge clignotante */}
            <g transform="translate(16, 54)">
              <circle
                cx="0"
                cy="0"
                r="4.5"
                fill={clockTick % 2 === 0 ? "#FF4D00" : "#27272A"}
                stroke="#52525B"
                strokeWidth="0.8"
                filter={clockTick % 2 === 0 ? "url(#glow-orange)" : undefined}
              />
              <text x="10" y="2.5" fontSize="6" fill="#A1A1AA">PULSE</text>
            </g>

            {/* Cycle hexadécimal */}
            <text x="8" y="74" fontSize="5.5" fill="#71717A">
              CYCLE: 0x{clockTick.toString(16).toUpperCase()}
            </text>
          </g>

          {/* Ligne reliant le module d'horloge au chip central */}
          <path
            d="M 102 212 H 110"
            fill="none"
            stroke={isRunning ? "#FF4D00" : "#3F3F46"}
            strokeWidth="1.4"
          />
          <circle cx="102" cy="212" r="1.5" fill="#FF4D00" />

          {/* =================================================================
              6. COMPOSANTS PASSIFS CMS 0603 & POINTS DE TEST
              ================================================================= */}
          {[
            { x: 30, y: 280, l: "C1" },
            { x: 60, y: 310, l: "C2" },
            { x: 80, y: 340, l: "C3" },
          ].map((c) => (
            <g key={c.l} transform={`translate(${c.x}, ${c.y})`}>
              <rect x="-7" y="-3.5" width="14" height="7" rx="0.5" fill="#27272A" stroke="#3F3F46" strokeWidth="0.6" />
              <rect x="-7" y="-3.5" width="2.5" height="7" fill="#E4E4E7" />
              <rect x="4.5" y="-3.5" width="2.5" height="7" fill="#E4E4E7" />
              <text x="0" y="-5" textAnchor="middle" fontSize="4.5" fill="#71717A">{c.l}</text>
            </g>
          ))}

          {/* Peigne de broches inférieur */}
          <g transform="translate(120, 362)">
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`pin-${i}`} transform={`translate(${i * 20}, 0)`}>
                <line x1="6" y1="0" x2="6" y2="10" stroke="#3F3F46" strokeWidth="1" />
                <rect
                  x="4"
                  y="8"
                  width="4"
                  height="6"
                  fill={i % 3 === 0 ? "#FF4D00" : "#52525B"}
                />
              </g>
            ))}
          </g>
        </svg>
      </motion.div>

      {/* Légende bas discrète et technique */}
      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — boîtier rv32i & banc logique interactif</span>
        <span className="text-signal font-semibold">
          {isRunning ? `RUNNING (OP: ${gateType})` : "CLK HALTED"}
        </span>
      </div>
    </div>
  );
}
