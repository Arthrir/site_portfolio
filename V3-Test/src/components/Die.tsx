import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";

/* ---------------- Die / EDA Lab (Logisim-evolution Style) ----------------
 * Esthétique schématique pure CAO / EDA :
 * - Grille orthogonale à pas de 10px (points discrets comme Logisim / KiCad EEschema)
 * - Lignes de bus et fils vert franc émeraude (#009933 / #16a34a) et noir (#000000)
 * - Portes logiques ANSI géométriques pures (sans arrondis mous ni style "dessin animé IA")
 * - Blocs fonctionnels carrés, nets, étiquetés aux normes d'ingénierie (RV32I, ALU, REGFILE, ROM, CLK)
 * - Véritable circuit interactif avec toggles A, B, porte logique, sorties, et affichage 7-segments / LEDs
 * -------------------------------------------------------------------------- */

export default function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 140, damping: 20 });
  const { tr } = useLang();

  // Inputs interactifs
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
  const aluOut = gateType === "XOR" ? busValA ^ busValB : gateType === "AND" ? busValA & busValB : busValA | busValB;

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
            {/* Grille de points Logisim */}
            <pattern id="eda-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill="#18181B" opacity="0.18" />
            </pattern>
            {/* Lueur pour LEDs vertes actives */}
            <filter id="led-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* FOND SCHÉMATIQUE CAD BLANC CASSE */}
          <rect width="400" height="400" fill="#FDFCF7" stroke="#18181B" strokeWidth="1.5" />
          <rect width="400" height="400" fill="url(#eda-grid)" pointerEvents="none" />

          {/* BANDEAU EN-TÊTE CAD LOGISIM / SCHEMATIC */}
          <rect x="0" y="0" width="400" height="22" fill="#F3F2EB" stroke="#18181B" strokeWidth="1" />
          <text x="10" y="15" fontSize="8" fontWeight="bold" fill="#18181B" letterSpacing="0.5">
            EDA :: ISMIN-RV32I_CORE.circ [LOGISIM-EVOLUTION]
          </text>
          <text x="390" y="15" textAnchor="end" fontSize="7.5" fill="#52525B">
            CLK: {isRunning ? "2.2 Hz" : "HALT"} · RATIO 1:1
          </text>

          {/* =================================================================
              MODULE 1 : GÉNÉRATEUR D'HORLOGE & REGISTRE D'ÉTAT (Top-Left)
              ================================================================= */}
          <g transform="translate(18, 32)">
            <rect x="0" y="0" width="100" height="46" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
            <text x="6" y="11" fontSize="7" fontWeight="bold" fill="#18181B">CLK_GEN / FSM</text>

            {/* Bouton Run/Halt */}
            <g className="cursor-pointer" onClick={() => setIsRunning((r) => !r)}>
              <rect x="6" y="17" width="38" height="14" fill={isRunning ? "#DCFCE7" : "#FEE2E2"} stroke="#18181B" strokeWidth="0.8" />
              <text x="25" y="27" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={isRunning ? "#15803D" : "#B91C1C"}>
                {isRunning ? "RUN" : "HALT"}
              </text>
            </g>

            {/* LED Pulse Clock */}
            <circle
              cx="54"
              cy="24"
              r="4"
              fill={clockTick % 2 === 0 ? "#22C55E" : "#D4D4D8"}
              stroke="#18181B"
              strokeWidth="0.8"
              filter={clockTick % 2 === 0 ? "url(#led-glow)" : undefined}
            />
            <text x="62" y="26.5" fontSize="6.5" fill="#52525B">SYS_CLK</text>

            {/* Compteur de cycle 4-bits */}
            <text x="6" y="40" fontSize="6" fill="#71717A">
              CYCLE: 0x{clockTick.toString(16).toUpperCase()}
            </text>
            <text x="60" y="40" fontSize="6" fill="#15803D" fontWeight="bold">
              [ACTIVE]
            </text>
          </g>

          {/* =================================================================
              MODULE 2 : BANQUE D'ENTRÉES LOGIQUES ET SIGNAUX (Top-Right)
              Interrupteurs DIP / Logisim Pin Inputs [A] et [B]
              ================================================================= */}
          <g transform="translate(132, 32)">
            <rect x="0" y="0" width="250" height="46" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
            <text x="8" y="11" fontSize="7" fontWeight="bold" fill="#18181B">
              LOGIC TESTBENCH :: DUAL-INPUT GATE STAGE
            </text>

            {/* Input Pin A */}
            <g className="cursor-pointer" onClick={() => setInA((v) => !v)} transform="translate(8, 17)">
              <rect x="0" y="0" width="38" height="16" fill={inA ? "#18181B" : "#F4F4F5"} stroke="#18181B" strokeWidth="1" />
              <text x="19" y="11" textAnchor="middle" fontSize="7" fontWeight="bold" fill={inA ? "#FFFFFF" : "#18181B"}>
                IN_A [{inA ? "1" : "0"}]
              </text>
            </g>

            {/* Input Pin B */}
            <g className="cursor-pointer" onClick={() => setInB((v) => !v)} transform="translate(54, 17)">
              <rect x="0" y="0" width="38" height="16" fill={inB ? "#18181B" : "#F4F4F5"} stroke="#18181B" strokeWidth="1" />
              <text x="19" y="11" textAnchor="middle" fontSize="7" fontWeight="bold" fill={inB ? "#FFFFFF" : "#18181B"}>
                IN_B [{inB ? "1" : "0"}]
              </text>
            </g>

            {/* Sélecteur de porte (XOR / AND / OR) */}
            <g
              className="cursor-pointer"
              onClick={() => setGateType((g) => (g === "XOR" ? "AND" : g === "AND" ? "OR" : "XOR"))}
              transform="translate(100, 17)"
            >
              <rect x="0" y="0" width="48" height="16" fill="#F4F4F5" stroke="#18181B" strokeWidth="1" />
              <text x="24" y="11" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#09090B">
                OP: {gateType} ▾
              </text>
            </g>

            {/* Probe de sortie */}
            <g transform="translate(160, 17)">
              <rect x="0" y="0" width="82" height="16" fill={outVal ? "#DCFCE7" : "#F4F4F5"} stroke="#18181B" strokeWidth="1" />
              <circle
                cx="10"
                cy="8"
                r="3.5"
                fill={outVal ? "#16A34A" : "#A1A1AA"}
                stroke="#18181B"
                strokeWidth="0.8"
                filter={outVal ? "url(#led-glow)" : undefined}
              />
              <text x="19" y="11" fontSize="7" fontWeight="bold" fill={outVal ? "#15803D" : "#52525B"}>
                OUT = {outVal ? "1 (HIGH)" : "0 (LOW)"}
              </text>
            </g>
          </g>

          {/* =================================================================
              CÂBLAGE SCHÉMATIQUE ORTHOGONAL (Fils Logisim stricts)
              ================================================================= */}
          {/* Fil Horloge vers Unité Centrale */}
          <path
            d="M 68,78 V 110 H 95"
            fill="none"
            stroke={isRunning ? "#16A34A" : "#71717A"}
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <circle cx="95" cy="110" r="2" fill="#18181B" />

          {/* Fils A & B vers la porte logique */}
          <path
            d="M 151,78 V 104 H 195"
            fill="none"
            stroke={inA ? "#16A34A" : "#18181B"}
            strokeWidth={inA ? "1.75" : "1"}
            strokeLinecap="square"
          />
          <path
            d="M 197,78 V 116 H 195"
            fill="none"
            stroke={inB ? "#16A34A" : "#18181B"}
            strokeWidth={inB ? "1.75" : "1"}
            strokeLinecap="square"
          />

          {/* =================================================================
              PORTE LOGIQUE CENTRALE (Représentation ANSI stricte Logisim)
              ================================================================= */}
          <g transform="translate(195, 96)">
            {gateType === "XOR" ? (
              <g>
                <path d="M0 6 Q6 15 0 24" fill="none" stroke="#18181B" strokeWidth="1.3" />
                <path d="M4 6 Q18 8 26 15 Q18 22 4 24 Q10 15 4 6 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.3" />
                <text x="12" y="17" fontSize="5.5" fontWeight="bold" fill="#18181B">XOR</text>
              </g>
            ) : gateType === "AND" ? (
              <g>
                <path d="M0 6 H14 A9 9 0 0 1 14 24 H0 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.3" />
                <text x="11" y="17" fontSize="5.5" fontWeight="bold" fill="#18181B">AND</text>
              </g>
            ) : (
              <g>
                <path d="M0 6 Q6 15 0 24 Q14 24 24 15 Q14 6 0 6 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.3" />
                <text x="9" y="17" fontSize="5.5" fontWeight="bold" fill="#18181B">OR</text>
              </g>
            )}
          </g>

          {/* Fil de sortie de la porte logique vers l'ALU */}
          <path
            d="M 221,111 H 250 V 135 H 220"
            fill="none"
            stroke={outVal ? "#16A34A" : "#18181B"}
            strokeWidth={outVal ? "1.75" : "1"}
            strokeLinecap="square"
          />
          <circle cx="221" cy="111" r="2" fill="#18181B" />

          {/* =================================================================
              MODULE 3 : CŒUR PROCESSEUR RV32I / BLOC LOGISIM CENTRAL
              Bloc fonctionnel net, sharp, rectiligne
              ================================================================= */}
          <g transform="translate(18, 120)">
            <rect x="0" y="0" width="364" height="150" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />

            {/* Titre du module */}
            <rect x="0" y="0" width="364" height="18" fill="#F4F4F5" stroke="#18181B" strokeWidth="1" />
            <text x="8" y="12.5" fontSize="7.5" fontWeight="bold" fill="#18181B">
              CORE 0 :: RV32I RISC-V CPU (ISMIN ARCHITECTURE)
            </text>
            <text x="356" y="12.5" textAnchor="end" fontSize="7" fill="#71717A">
              32-BIT PIPELINED · SINGLE ISSUE
            </text>

            {/* BLOC : BANQUE DE REGISTRES (REG_FILE) */}
            <g transform="translate(12, 28)">
              <rect x="0" y="0" width="85" height="110" fill="#FAFAFA" stroke="#18181B" strokeWidth="1" />
              <text x="42.5" y="12" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#18181B">
                REGFILE x0..x31
              </text>
              <line x1="0" y1="17" x2="85" y2="17" stroke="#18181B" strokeWidth="0.8" />

              {/* Lignes de registres visualisées comme Logisim */}
              {[
                { r: "x1 (ra)", val: "0x00400120" },
                { r: "x2 (sp)", val: "0x7FFFF000" },
                { r: "x10 (a0)", val: inA ? "0x00000001" : "0x00000000" },
                { r: "x11 (a1)", val: inB ? "0x00000001" : "0x00000000" },
                { r: "x12 (a2)", val: outVal ? "0x00000001" : "0x00000000" },
                { r: "x13 (t0)", val: `0x000000${aluOut.toString(16).padStart(2, "0")}` },
              ].map((reg, i) => (
                <g key={reg.r} transform={`translate(4, ${26 + i * 14})`}>
                  <rect x="0" y="0" width="77" height="11" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="0.75" />
                  <text x="3" y="8" fontSize="5.5" fontWeight="600" fill="#3F3F46">{reg.r}</text>
                  <text x="74" y="8" textAnchor="end" fontSize="5.5" fontFamily="monospace" fill="#15803D">{reg.val}</text>
                </g>
              ))}
            </g>

            {/* BUS DE CONNEXION INTERNE VERT */}
            <path d="M 97,55 H 125" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="square" />
            <path d="M 97,95 H 125" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="square" />

            {/* BLOC : ALU (ARITHMETIC LOGIC UNIT - VÉRITABLE FORME TRAPÉZOÏDALE CAO) */}
            <g transform="translate(125, 36)">
              {/* Forme classique de l'ALU en CAO */}
              <polygon
                points="0,0 52,18 52,56 0,74 0,44 14,37 0,30"
                fill="#FAFAFA"
                stroke="#18181B"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <text x="26" y="40" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#18181B">
                ALU
              </text>
              <text x="26" y="48" textAnchor="middle" fontSize="5.5" fill="#52525B">
                {gateType} / ADD
              </text>

              {/* Pins d'entrées ALU */}
              <text x="4" y="16" fontSize="5.5" fill="#71717A">A</text>
              <text x="4" y="66" fontSize="5.5" fill="#71717A">B</text>
              <text x="46" y="39" fontSize="5.5" fill="#15803D" fontWeight="bold">Y</text>
            </g>

            {/* Ligne de sortie ALU vers bus de données */}
            <path d="M 177,73 H 205" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="square" />
            <circle cx="177" cy="73" r="2" fill="#18181B" />

            {/* BLOC : MÉMOIRE D'INSTRUCTIONS & ROM (INSTRUCTION FETCH / DECODE) */}
            <g transform="translate(205, 28)">
              <rect x="0" y="0" width="145" height="110" fill="#FAFAFA" stroke="#18181B" strokeWidth="1" />
              <text x="72.5" y="12" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#18181B">
                PROGRAM COUNTER & INSTRUCTION DECODE
              </text>
              <line x1="0" y1="17" x2="145" y2="17" stroke="#18181B" strokeWidth="0.8" />

              {/* 7-Segment Display / Code hexadécimal */}
              <g transform="translate(8, 24)">
                <rect x="0" y="0" width="60" height="22" fill="#18181B" />
                <text x="30" y="15" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#22C55E" fontWeight="bold" letterSpacing="1.5">
                  0x0{aluOut.toString(16).toUpperCase()}
                </text>
                <text x="0" y="30" fontSize="5.5" fill="#52525B">HEX_ALU_OUT</text>
              </g>

              {/* Instruction ASM courante */}
              <g transform="translate(74, 24)">
                <rect x="0" y="0" width="63" height="22" fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="0.8" />
                <text x="5" y="10" fontSize="5.5" fontWeight="bold" fill="#09090B">ASM INSTRUCTION:</text>
                <text x="5" y="18" fontSize="6" fontFamily="monospace" fill="#15803D" fontWeight="bold">
                  {gateType.toLowerCase()} a2, a0, a1
                </text>
              </g>

              {/* Microcode / Status flags */}
              <g transform="translate(8, 62)">
                <text x="0" y="0" fontSize="6" fontWeight="bold" fill="#18181B">FLAGS / HARZARD UNIT:</text>
                <g transform="translate(0, 6)">
                  <rect x="0" y="0" width="28" height="12" fill={outVal ? "#DCFCE7" : "#F4F4F5"} stroke="#18181B" strokeWidth="0.6" />
                  <text x="14" y="8.5" textAnchor="middle" fontSize="5.5" fill={outVal ? "#15803D" : "#71717A"} fontWeight="bold">
                    ZERO: {outVal ? "0" : "1"}
                  </text>
                </g>
                <g transform="translate(34, 6)">
                  <rect x="0" y="0" width="28" height="12" fill="#F4F4F5" stroke="#18181B" strokeWidth="0.6" />
                  <text x="14" y="8.5" textAnchor="middle" fontSize="5.5" fill="#71717A">
                    CARRY: 0
                  </text>
                </g>
                <g transform="translate(68, 6)">
                  <rect x="0" y="0" width="28" height="12" fill="#F4F4F5" stroke="#18181B" strokeWidth="0.6" />
                  <text x="14" y="8.5" textAnchor="middle" fontSize="5.5" fill="#71717A">
                    SIGN: 0
                  </text>
                </g>
                <g transform="translate(102, 6)">
                  <rect x="0" y="0" width="28" height="12" fill="#DCFCE7" stroke="#18181B" strokeWidth="0.6" />
                  <text x="14" y="8.5" textAnchor="middle" fontSize="5.5" fill="#15803D" fontWeight="bold">
                    FWD: OK
                  </text>
                </g>
              </g>

              {/* Bus de contrôle */}
              <text x="8" y="96" fontSize="5.5" fill="#71717A">
                BUS: WB=1 · MEM=0 · EX=1 · REG_WRITE=1
              </text>
            </g>
          </g>

          {/* =================================================================
              MODULE 4 : PÉRIPHÉRIQUES & TARGET CHIPS (Bas de schéma)
              Mention des architectures étudiées & expérimentées (STM32 / Infineon / RISC-V)
              ================================================================= */}
          <g transform="translate(18, 282)">
            <rect x="0" y="0" width="364" height="74" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
            <rect x="0" y="0" width="364" height="16" fill="#F3F2EB" stroke="#18181B" strokeWidth="0.8" />
            <text x="8" y="11" fontSize="7" fontWeight="bold" fill="#18181B">
              TARGET PLATFORMS & EMBEDDED INTEGRATION
            </text>
            <text x="356" y="11" textAnchor="end" fontSize="6.5" fill="#52525B">
              ISMIN × POLIMI EXPERTISE
            </text>

            {/* 3 Blocs cibles sharp */}
            {/* 1. RISC-V Custom Core */}
            <g transform="translate(8, 22)">
              <rect x="0" y="0" width="112" height="44" fill="#FAFAFA" stroke="#18181B" strokeWidth="0.8" />
              <text x="6" y="12" fontSize="6.5" fontWeight="bold" fill="#18181B">RISC-V RV32I</text>
              <text x="6" y="22" fontSize="5.5" fill="#52525B">Pipelined Core · Logisim</text>
              <text x="6" y="32" fontSize="5" fill="#71717A">SystemVerilog RTL</text>
              <circle cx="102" cy="12" r="3" fill="#16A34A" />
            </g>

            {/* 2. STM32 Embedded HW */}
            <g transform="translate(126, 22)">
              <rect x="0" y="0" width="112" height="44" fill="#FAFAFA" stroke="#18181B" strokeWidth="0.8" />
              <text x="6" y="12" fontSize="6.5" fontWeight="bold" fill="#18181B">STM32 Microcontrollers</text>
              <text x="6" y="22" fontSize="5.5" fill="#52525B">ARM Cortex-M · C / RTOS</text>
              <text x="6" y="32" fontSize="5" fill="#71717A">Capacitive Sensing & IoT</text>
              <circle cx="102" cy="12" r="3" fill="#16A34A" />
            </g>

            {/* 3. Automotive / Industrial Powertrain (Phinia context) */}
            <g transform="translate(244, 22)">
              <rect x="0" y="0" width="112" height="44" fill="#FAFAFA" stroke="#18181B" strokeWidth="0.8" />
              <text x="6" y="12" fontSize="6.5" fontWeight="bold" fill="#18181B">Automotive & Power</text>
              <text x="6" y="22" fontSize="5.5" fill="#52525B">AURIX / Industrial HW</text>
              <text x="6" y="32" fontSize="5" fill="#71717A">Bancs de test & Électronique</text>
              <circle cx="102" cy="12" r="3" fill="#16A34A" />
            </g>
          </g>

          {/* Connecteurs de bus en peigne (Style Logisim Wire Probe en bas) */}
          <g transform="translate(18, 362)">
            {Array.from({ length: 18 }).map((_, i) => (
              <g key={`pin-${i}`} transform={`translate(${i * 20.5}, 0)`}>
                <line x1="8" y1="0" x2="8" y2="12" stroke="#18181B" strokeWidth="1" />
                <rect x="6" y="12" width="4" height="6" fill={i % 3 === 0 ? "#16A34A" : "#18181B"} />
              </g>
            ))}
          </g>
        </svg>
      </motion.div>

      {/* Légende bas discrète et technique */}
      <div className="mt-3 flex items-center justify-between px-1 font-mono text-[10px] text-mute uppercase">
        <span>fig. 01 — processeur rv32i & schéma logisim</span>
        <span className="text-signal font-semibold">
          {isRunning ? `RUNNING (OP: ${gateType})` : "CLK HALTED"}
        </span>
      </div>
    </div>
  );
}
