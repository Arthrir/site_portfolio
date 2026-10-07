import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / Silicon Chip EDA Lab ----------------
 * Hybride haute précision technique :
 * - Boîtier silicium noir mat & cuivre orange (#FF4D00 / #0D0E12)
 * - Chanfrein Pin 1, pastilles CMS périphériques, repères fiduciels PCB
 * - Schéma micro-architectural Logisim-evolution intégré (ALU, registres, bus)
 * - Banc de test logique interactif : entrées A et B, porte ANSI (XOR, AND, OR), sortie probe
 * - Afficheur HEX + décodage ASM temps réel (ex: xor a2, a0, a1)
 * - Références concrètes aux architectures étudiées : RISC-V RV32I, STM32, bancs de test industriels
 * -------------------------------------------------------------------------- */

export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-7, 7]), { stiffness: 140, damping: 20 });
  const { tr } = useLang();

  // Entrées logiques interactives
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
    }, 420);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Calcul combinatoire
  const outVal =
    gateType === "XOR"
      ? inA !== inB
      : gateType === "AND"
      ? inA && inB
      : inA || inB;

  // Valeurs de bus 8 bits simulées
  const busValA = inA ? 0x2a : 0x05;
  const busValB = inB ? 0x13 : 0x02;
  const aluOut =
    gateType === "XOR"
      ? busValA ^ busValB
      : gateType === "AND"
      ? busValA & busValB
      : busValA | busValB;

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
            {/* Grille technique EDA fine */}
            <pattern id="chip-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="#3F3F46" opacity="0.3" />
            </pattern>

            {/* Hachures cuivre / thermal slug */}
            <pattern id="copper-hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#9A3412" strokeWidth="1.2" />
            </pattern>

            {/* Lueur pour signaux actifs */}
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
              1. SUBSTRAT PCB NOIR PROFOND & PASTILLES DE CONTACT (LEADFRAME)
              ================================================================= */}
          {/* PCB Base */}
          <rect width="400" height="400" rx="3" fill="#0C0D10" stroke="#27272A" strokeWidth="1.5" />
          <rect width="400" height="400" fill="url(#chip-grid)" pointerEvents="none" />

          {/* Repères fiduciels de précision PCB (4 coins) */}
          {[
            { cx: 20, cy: 20 },
            { cx: 380, cy: 20 },
            { cx: 20, cy: 380 },
            { cx: 380, cy: 380 },
          ].map((f, i) => (
            <g key={`fid-${i}`}>
              <circle cx={f.cx} cy={f.cy} r="4" fill="none" stroke="#52525B" strokeWidth="1" />
              <circle cx={f.cx} cy={f.cy} r="1.5" fill="#FF4D00" />
            </g>
          ))}

          {/* Pastilles périphériques CMS (14 pads par côté) */}
          {Array.from({ length: 14 }).map((_, i) => (
            <g key={`pads-${i}`}>
              {/* Haut */}
              <rect x={44 + i * 22} y={10} width={9} height={14} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              <line x1={48.5 + i * 22} y1={24} x2={48.5 + i * 22} y2={32} stroke="#3F3F46" strokeWidth="1" />
              {/* Bas */}
              <rect x={44 + i * 22} y={376} width={9} height={14} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              <line x1={48.5 + i * 22} y1={368} x2={48.5 + i * 22} y2={376} stroke="#3F3F46" strokeWidth="1" />
              {/* Gauche */}
              <rect x={10} y={44 + i * 22} width={14} height={9} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              <line x1={24} y1={48.5 + i * 22} x2={32} y2={48.5 + i * 22} stroke="#3F3F46" strokeWidth="1" />
              {/* Droite */}
              <rect x={376} y={44 + i * 22} width={14} height={9} rx={1} fill="#52525B" stroke="#3F3F46" strokeWidth="0.5" />
              <line x1={368} y1={48.5 + i * 22} x2={376} y2={48.5 + i * 22} stroke="#3F3F46" strokeWidth="1" />
            </g>
          ))}

          {/* =================================================================
              2. BOÎTIER IC NOIR CENTRAL (CHIP PACKAGE AVEC CHANFREIN PIN 1)
              ================================================================= */}
          {/* Corps principal QFP / QFN chanfreiné en haut à gauche */}
          <path
            d="M 58 32 H 368 V 368 H 32 V 58 Z"
            fill="#121318"
            stroke="#27272A"
            strokeWidth="1.5"
          />

          {/* Repère Pin 1 (Index laser orange) */}
          <circle cx="48" cy="48" r="4.5" fill="none" stroke="#FF4D00" strokeWidth="1" />
          <circle cx="48" cy="48" r="2" fill="#FF4D00" />
          <text x="56" y="50" fontSize="5.5" fill="#A1A1AA" fontWeight="bold">PIN 1</text>

          {/* Bandeau supérieur de sérigraphie laser */}
          <line x1="68" y1="32" x2="68" y2="52" stroke="#27272A" strokeWidth="1" />
          <text x="76" y="44" fontSize="7" fontWeight="bold" fill="#F4F4F5" letterSpacing="0.6">
            ISMIN-RV32I CORE :: SOC DIE [REV 3.4]
          </text>
          <text x="360" y="44" textAnchor="end" fontSize="6.5" fill="#71717A">
            {isRunning ? "CLK 120 MHz" : "HALT"} · QFP-144
          </text>
          <line x1="32" y1="54" x2="368" y2="54" stroke="#27272A" strokeWidth="1" />

          {/* =================================================================
              3. TOP-LEFT : MODULE D'HORLOGE & CONTRÔLE FSM
              ================================================================= */}
          <g transform="translate(42, 64)">
            <rect x="0" y="0" width="112" height="58" fill="#181920" stroke="#27272A" strokeWidth="1" />
            <text x="6" y="11" fontSize="6.5" fontWeight="bold" fill="#E4E4E7">
              SYS_CLK / FSM GEN
            </text>

            {/* Bouton Run / Halt */}
            <g className="cursor-pointer" onClick={() => setIsRunning((r) => !r)}>
              <rect
                x="6"
                y="18"
                width="38"
                height="15"
                rx="1"
                fill={isRunning ? "#052e16" : "#450a0a"}
                stroke={isRunning ? "#22C55E" : "#EF4444"}
                strokeWidth="1"
              />
              <text
                x="25"
                y="28.5"
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="bold"
                fill={isRunning ? "#4ADE80" : "#F87171"}
              >
                {isRunning ? "RUN" : "HALT"}
              </text>
            </g>

            {/* LED clignotante SYS_CLK */}
            <circle
              cx="54"
              cy="25.5"
              r="4.5"
              fill={clockTick % 2 === 0 ? "#FF4D00" : "#27272A"}
              stroke="#52525B"
              strokeWidth="0.8"
              filter={clockTick % 2 === 0 ? "url(#glow-orange)" : undefined}
            />
            <text x="63" y="27.5" fontSize="6" fill="#A1A1AA">CLK_PULSE</text>

            {/* Compteur de cycle hexadécimal */}
            <text x="6" y="48" fontSize="6" fill="#71717A">
              CYCLE: 0x{clockTick.toString(16).toUpperCase().padStart(2, "0")}
            </text>
            <text x="62" y="48" fontSize="6" fill="#22C55E" fontWeight="bold">
              [LOCKED]
            </text>
          </g>

          {/* =================================================================
              4. TOP-RIGHT : BANC DE TEST LOGIQUE (IN_A, IN_B, OP GATE, PROBE)
              Accessible, non masqué par la photo polaroid
              ================================================================= */}
          <g transform="translate(164, 64)">
            <rect x="0" y="0" width="194" height="58" fill="#181920" stroke="#27272A" strokeWidth="1" />
            <text x="8" y="11" fontSize="6.5" fontWeight="bold" fill="#E4E4E7">
              LOGIC TESTBENCH :: DUAL-INPUT GATE STAGE
            </text>

            {/* Bouton Input A */}
            <g className="cursor-pointer" onClick={() => setInA((v) => !v)} transform="translate(8, 17)">
              <rect
                x="0"
                y="0"
                width="34"
                height="16"
                rx="1"
                fill={inA ? "#FF4D00" : "#27272A"}
                stroke={inA ? "#FF7A33" : "#3F3F46"}
                strokeWidth="1"
              />
              <text x="17" y="11" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={inA ? "#FFFFFF" : "#A1A1AA"}>
                A = {inA ? "1" : "0"}
              </text>
            </g>

            {/* Bouton Input B */}
            <g className="cursor-pointer" onClick={() => setInB((v) => !v)} transform="translate(48, 17)">
              <rect
                x="0"
                y="0"
                width="34"
                height="16"
                rx="1"
                fill={inB ? "#FF4D00" : "#27272A"}
                stroke={inB ? "#FF7A33" : "#3F3F46"}
                strokeWidth="1"
              />
              <text x="17" y="11" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={inB ? "#FFFFFF" : "#A1A1AA"}>
                B = {inB ? "1" : "0"}
              </text>
            </g>

            {/* Bouton sélecteur de porte logique */}
            <g
              className="cursor-pointer"
              onClick={() => setGateType((g) => (g === "XOR" ? "AND" : g === "AND" ? "OR" : "XOR"))}
              transform="translate(88, 17)"
            >
              <rect x="0" y="0" width="44" height="16" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="1" />
              <text x="22" y="11" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">
                {gateType} ▾
              </text>
            </g>

            {/* Sonde de sortie OUT LED */}
            <g transform="translate(138, 17)">
              <rect
                x="0"
                y="0"
                width="48"
                height="16"
                rx="1"
                fill={outVal ? "#064e3b" : "#27272A"}
                stroke={outVal ? "#10B981" : "#3F3F46"}
                strokeWidth="1"
              />
              <circle
                cx="10"
                cy="8"
                r="3.5"
                fill={outVal ? "#22C55E" : "#71717A"}
                filter={outVal ? "url(#glow-green)" : undefined}
              />
              <text x="19" y="11" fontSize="6.5" fontWeight="bold" fill={outVal ? "#4ADE80" : "#A1A1AA"}>
                Y = {outVal ? "1" : "0"}
              </text>
            </g>

            {/* Pistes internes du banc logique */}
            <path d="M 25 33 V 44 H 90" fill="none" stroke={inA ? "#FF4D00" : "#3F3F46"} strokeWidth="1.2" />
            <path d="M 65 33 V 48 H 90" fill="none" stroke={inB ? "#FF4D00" : "#3F3F46"} strokeWidth="1.2" />

            {/* Mini porte ANSI dessinée */}
            <g transform="translate(92, 40)">
              {gateType === "XOR" ? (
                <g>
                  <path d="M0 2 Q4 8 0 14" fill="none" stroke="#FF4D00" strokeWidth="1.2" />
                  <path d="M3 2 Q14 3 20 8 Q14 13 3 14 Q7 8 3 2 Z" fill="#181920" stroke="#FF4D00" strokeWidth="1.2" />
                </g>
              ) : gateType === "AND" ? (
                <path d="M0 2 H10 A6 6 0 0 1 10 14 H0 Z" fill="#181920" stroke="#FF4D00" strokeWidth="1.2" />
              ) : (
                <path d="M0 2 Q4 8 0 14 Q10 14 18 8 Q10 2 0 2 Z" fill="#181920" stroke="#FF4D00" strokeWidth="1.2" />
              )}
            </g>
            <path d="M 112 48 H 155" fill="none" stroke={outVal ? "#22C55E" : "#3F3F46"} strokeWidth="1.4" />
            <circle cx="155" cy="48" r="2" fill={outVal ? "#22C55E" : "#3F3F46"} />
          </g>

          {/* =================================================================
              5. CENTRE DU CHIP : SLUG CUIVRE ORANGE + ARCHITECTURE LOGISIM
              ================================================================= */}
          {/* SLUG EN CUIVRE ORANGE (HEATSINK THERMAL PAD ICONIQUE DU DÉBUT) */}
          <g transform="translate(42, 132)">
            {/* Base cuivre orange franc */}
            <rect x="0" y="0" width="76" height="76" rx="2" fill="#EA580C" stroke="#FF7A33" strokeWidth="1.2" />
            {/* Trame striée cuivre */}
            <rect x="0" y="0" width="76" height="76" fill="url(#copper-hatch)" opacity="0.45" />

            {/* Lignes diagonales de dissipation thermique */}
            <line x1="0" y1="0" x2="76" y2="76" stroke="#FFEDD5" strokeWidth="0.8" opacity="0.3" />
            <line x1="76" y1="0" x2="0" y2="76" stroke="#FFEDD5" strokeWidth="0.8" opacity="0.3" />

            {/* Sérigraphie laser au centre du slug */}
            <rect x="6" y="20" width="64" height="36" fill="#121318" stroke="#FF4D00" strokeWidth="1" />
            <text x="38" y="32" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#FF4D00">
              THERMAL SLUG
            </text>
            <text x="38" y="42" textAnchor="middle" fontSize="5.5" fill="#E4E4E7">
              DIE: RV32I-CM4
            </text>
            <text x="38" y="50" textAnchor="middle" fontSize="5" fill="#A1A1AA">
              EMSE × POLIMI
            </text>
          </g>

          {/* BUS ORTHOGONAUX RELIANT LE SLUG À L'ALU */}
          <path d="M 118 150 H 132" fill="none" stroke="#FF4D00" strokeWidth="1.5" />
          <path d="M 118 190 H 132" fill="none" stroke="#FF4D00" strokeWidth="1.5" />

          {/* BLOC ALU LOGISIM (ARITHMETIC LOGIC UNIT - TRAPÈZE CAO PUR) */}
          <g transform="translate(132, 135)">
            <polygon
              points="0,0 46,16 46,54 0,70 0,42 12,35 0,28"
              fill="#181920"
              stroke="#FF4D00"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <text x="22" y="38" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#F4F4F5">
              ALU
            </text>
            <text x="22" y="46" textAnchor="middle" fontSize="5" fill="#FF4D00" fontWeight="bold">
              {gateType}
            </text>

            {/* Étiquettes des broches ALU */}
            <text x="3" y="15" fontSize="5" fill="#A1A1AA">A</text>
            <text x="3" y="62" fontSize="5" fill="#A1A1AA">B</text>
            <text x="40" y="37" fontSize="5" fill="#22C55E" fontWeight="bold">Y</text>
          </g>

          {/* BUS DE SORTIE ALU VERS LE BLOC INSTRUCTION & REGISTRES */}
          <path
            d="M 178 170 H 198"
            fill="none"
            stroke={outVal ? "#22C55E" : "#FF4D00"}
            strokeWidth="2"
            strokeLinecap="square"
          />
          <circle cx="178" cy="170" r="2" fill="#FF4D00" />
          {isRunning && (
            <motion.circle
              cx="178"
              cy="170"
              r="2.5"
              fill="#22C55E"
              animate={{ cx: [178, 198] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* BANQUE DE REGISTRES & DÉCODEUR ASM (BLOC DROIT NOIR & ORANGE) */}
          <g transform="translate(198, 130)">
            <rect x="0" y="0" width="160" height="80" fill="#181920" stroke="#27272A" strokeWidth="1" />
            <rect x="0" y="0" width="160" height="15" fill="#121318" stroke="#27272A" strokeWidth="0.8" />
            <text x="6" y="10.5" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">
              REGISTERS & INSTRUCTION DECODE
            </text>

            {/* Afficheur 7-Segments HEX ALU OUT */}
            <g transform="translate(6, 20)">
              <rect x="0" y="0" width="62" height="20" fill="#0C0D10" stroke="#FF4D00" strokeWidth="0.8" />
              <text
                x="31"
                y="14"
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
                fill="#FF4D00"
                fontWeight="bold"
                letterSpacing="1"
              >
                0x0{aluOut.toString(16).toUpperCase()}
              </text>
              <text x="0" y="27" fontSize="5" fill="#71717A">HEX_ALU_OUT</text>
            </g>

            {/* Instruction ASM courante */}
            <g transform="translate(74, 20)">
              <rect x="0" y="0" width="80" height="20" fill="#0C0D10" stroke="#27272A" strokeWidth="0.8" />
              <text x="5" y="9" fontSize="5" fontWeight="bold" fill="#71717A">ASM OP:</text>
              <text x="5" y="16" fontSize="6" fontFamily="monospace" fill="#4ADE80" fontWeight="bold">
                {gateType.toLowerCase()} a2, a0, a1
              </text>
              <text x="0" y="27" fontSize="5" fill="#71717A">RISC-V PIPELINE</text>
            </g>

            {/* Registres visualisés */}
            <g transform="translate(6, 32)">
              {[
                { r: "x10 (a0)", v: inA ? "0x01" : "0x00" },
                { r: "x11 (a1)", v: inB ? "0x01" : "0x00" },
                { r: "x12 (a2)", v: outVal ? "0x01" : "0x00" },
                { r: "x13 (t0)", v: `0x${aluOut.toString(16).toUpperCase().padStart(2, "0")}` },
              ].map((reg, idx) => (
                <g key={reg.r} transform={`translate(${idx * 37.5}, 12)`}>
                  <rect x="0" y="0" width="35" height="18" fill="#121318" stroke="#27272A" strokeWidth="0.6" />
                  <text x="3" y="8" fontSize="4.8" fill="#A1A1AA">{reg.r}</text>
                  <text x="3" y="15" fontSize="5.2" fontWeight="bold" fill={idx === 2 && outVal ? "#4ADE80" : "#FF4D00"}>
                    {reg.v}
                  </text>
                </g>
              ))}
            </g>

            {/* Flags de contrôle */}
            <text x="6" y="74" fontSize="5" fill="#71717A">
              STATUS: ZERO={outVal ? "0" : "1"} · CARRY=0 · EX_STAGE=ACTIVE
            </text>
          </g>

          {/* =================================================================
              6. BAS DU CHIP : ARCHITECTURES CIBLES & COMPOSANTS CMS RÉELS
              ================================================================= */}
          <g transform="translate(42, 220)">
            <rect x="0" y="0" width="316" height="88" fill="#181920" stroke="#27272A" strokeWidth="1" />
            <rect x="0" y="0" width="316" height="15" fill="#121318" stroke="#27272A" strokeWidth="0.8" />
            <text x="8" y="10.5" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">
              TARGET PLATFORMS & EMBEDDED ARCHITECTURES
            </text>
            <text x="308" y="10.5" textAnchor="end" fontSize="6" fill="#FF4D00">
              ISMIN × POLIMI EXPERTISE
            </text>

            {/* 3 Blocs cibles techniques nets */}
            {/* 1. RISC-V RV32I */}
            <g transform="translate(8, 20)">
              <rect x="0" y="0" width="94" height="60" fill="#121318" stroke="#27272A" strokeWidth="0.8" />
              <text x="6" y="13" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">RISC-V RV32I</text>
              <text x="6" y="24" fontSize="5.5" fill="#FF4D00">Custom Pipelined Core</text>
              <text x="6" y="35" fontSize="5" fill="#A1A1AA">Logisim & Verilog RTL</text>
              <text x="6" y="46" fontSize="5" fill="#71717A">Dual-issue / ALU</text>
              <circle cx="86" cy="12" r="2.5" fill="#22C55E" />
            </g>

            {/* 2. STM32 ARM Microcontrollers */}
            <g transform="translate(111, 20)">
              <rect x="0" y="0" width="94" height="60" fill="#121318" stroke="#27272A" strokeWidth="0.8" />
              <text x="6" y="13" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">STM32 Microcontrollers</text>
              <text x="6" y="24" fontSize="5.5" fill="#FF4D00">ARM Cortex-M4 / C</text>
              <text x="6" y="35" fontSize="5" fill="#A1A1AA">Capacitive Sensing</text>
              <text x="6" y="46" fontSize="5" fill="#71717A">FreeRTOS / Low Power</text>
              <circle cx="86" cy="12" r="2.5" fill="#22C55E" />
            </g>

            {/* 3. Infineon / Powertrain (Phinia Stage) */}
            <g transform="translate(214, 20)">
              <rect x="0" y="0" width="94" height="60" fill="#121318" stroke="#27272A" strokeWidth="0.8" />
              <text x="6" y="13" fontSize="6.5" fontWeight="bold" fill="#F4F4F5">Automotive & Power</text>
              <text x="6" y="24" fontSize="5.5" fill="#FF4D00">AURIX / Bancs de test</text>
              <text x="6" y="35" fontSize="5" fill="#A1A1AA">PHINIA Stage Powertrain</text>
              <text x="6" y="46" fontSize="5" fill="#71717A">Hardware Testing & ECUs</text>
              <circle cx="86" cy="12" r="2.5" fill="#22C55E" />
            </g>
          </g>

          {/* =================================================================
              7. COMPOSANTS PASSIFS CMS 0603 & POINTS DE TEST (TP)
              ================================================================= */}
          {/* Condensateurs CMS de découplage C1, C2, C3, C4 */}
          {[
            { x: 52, y: 326, l: "C1" },
            { x: 120, y: 326, l: "C2" },
            { x: 236, y: 326, l: "C3" },
            { x: 330, y: 326, l: "C4" },
          ].map((c) => (
            <g key={c.l} transform={`translate(${c.x}, ${c.y})`}>
              {/* Corps sombre céramique */}
              <rect x="-8" y="-4" width="16" height="8" rx="1" fill="#27272A" stroke="#3F3F46" strokeWidth="0.6" />
              {/* Embouts étamés argentés */}
              <rect x="-8" y="-4" width="3" height="8" fill="#E4E4E7" />
              <rect x="5" y="-4" width="3" height="8" fill="#E4E4E7" />
              <text x="0" y="-6" textAnchor="middle" fontSize="4.8" fill="#71717A">{c.l}</text>
            </g>
          ))}

          {/* Points de test de précision TP1 à TP4 avec anneaux cuivre */}
          {[
            { x: 80, y: 326, l: "TP1_CLK", active: isRunning },
            { x: 178, y: 326, l: "TP2_ALU", active: true },
            { x: 282, y: 326, l: "TP3_GATE", active: outVal },
          ].map((tp) => (
            <g key={tp.l} transform={`translate(${tp.x}, ${tp.y})`}>
              <circle cx="0" cy="0" r="3.2" fill="none" stroke="#FF4D00" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.2" fill={tp.active ? "#FF4D00" : "#52525B"} />
              <text x="6" y="2" fontSize="5" fill="#A1A1AA">{tp.l}</text>
            </g>
          ))}

          {/* Connecteurs de bus en peigne inférieur */}
          <g transform="translate(42, 346)">
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={`pin-${i}`} transform={`translate(${i * 20}, 0)`}>
                <line x1="6" y1="0" x2="6" y2="12" stroke="#3F3F46" strokeWidth="1" />
                <rect
                  x="4"
                  y="10"
                  width="4"
                  height="6"
                  fill={i % 4 === 0 ? "#FF4D00" : i % 2 === 0 ? "#22C55E" : "#52525B"}
                />
              </g>
            ))}
          </g>
        </svg>
      </motion.div>

      {/* Légende bas discrète et technique */}
      <div className="mt-3 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — processeur rv32i & chip silicium interactif</span>
        <span className="text-signal font-semibold">
          {isRunning ? `RUNNING (OP: ${gateType})` : "CLK HALTED"}
        </span>
      </div>
    </div>
  );
}
