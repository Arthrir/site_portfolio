import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { Cpu, Layout, Users, Activity, Volume2 } from "lucide-react";

interface TeenageConsoleProps {
  onColorChange?: (color: string) => void;
}

type TabType = "hardware" | "product" | "execution";

export default function TeenageConsole({ onColorChange }: TeenageConsoleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 150, damping: 20 });
  const { tr } = useLang();

  const [activeTab, setActiveTab] = useState<TabType>("hardware");
  const [knobAngle, setKnobAngle] = useState(45);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 100), 250);
    return () => clearInterval(id);
  }, []);

  const handleSelectTab = (t: TabType, color: string) => {
    setActiveTab(t);
    setKnobAngle((prev) => (prev + 90) % 360);
    if (onColorChange) onColorChange(color);
  };

  const tabsData = {
    hardware: {
      title: "01 // EMBEDDED & FPGA",
      color: "#FF4D00",
      specs: [
        { k: "CORE", v: "RV32I RISC-V RTL" },
        { k: "HDL", v: "VHDL · VERILOG" },
        { k: "LANG", v: "C · C++ · PYTHON" },
        { k: "HW", v: "STM32 · XILINX FPGA" },
      ],
      signal: [12, 28, 45, 80, 45, 90, 30, 60, 20, 85, 40, 10],
      status: "FREQ: 120 MHz · SYNTH: OK",
    },
    product: {
      title: "02 // PRODUCT DESIGN",
      color: "#2340F0",
      specs: [
        { k: "SCHOOL", v: "POLIMI × MINES" },
        { k: "DISCIPLINE", v: "PRODUCT OWNER" },
        { k: "SKILLS", v: "ERGONOMIE · ROADMAP" },
        { k: "TOOLS", v: "FIGMA · JIRA · NOTION" },
      ],
      signal: [30, 40, 60, 50, 70, 65, 80, 85, 90, 75, 85, 95],
      status: "SPRINT 14 · VELOCITY: HIGH",
    },
    execution: {
      title: "03 // LEADERSHIP & PROJETS",
      color: "#10B981",
      specs: [
        { k: "ROLES", v: "10 MANDATS ASSOCIATIFS" },
        { k: "BUDGET", v: "GÉRÉ > 100K€ TOTAL" },
        { k: "TEAMS", v: "PILOTAGE 5 À 20 PERS" },
        { k: "STAGE", v: "RECHERCHE 5+ MOIS (2027)" },
      ],
      signal: [20, 35, 50, 45, 60, 70, 65, 80, 85, 90, 95, 100],
      status: "DISPO: AVRIL 2027 · SFE",
    },
  };

  const current = tabsData[activeTab];

  return (
    <div className="relative w-full max-w-[420px] select-none [perspective:1200px]">
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative aspect-[4/4.2] w-full rounded-3xl bg-[#F1F3F5] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.08)] border border-black/10 [transform-style:preserve-3d]"
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
        {/* Vis Torx aux 4 coins façon Teenage Engineering usiné CNC */}
        {[
          "top-3 left-3",
          "top-3 right-3",
          "bottom-3 left-3",
          "bottom-3 right-3",
        ].map((pos, i) => (
          <div key={i} className={`absolute ${pos} size-2 rounded-full border border-black/20 bg-black/10 flex items-center justify-center`}>
            <span className="h-1 w-px bg-black/30 rotate-45" />
          </div>
        ))}

        {/* Barre supérieure : potentiomètre rotatif et grille haut-parleur perforée */}
        <div className="flex items-center justify-between px-3 pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            {/* Bouton rotatif moleté */}
            <div
              onClick={() => setKnobAngle((a) => (a + 45) % 360)}
              className="relative size-7 rounded-full bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] shadow-sm border border-black/20 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <div
                style={{ transform: `rotate(${knobAngle}deg)` }}
                className="size-full flex items-start justify-center pt-0.5"
              >
                <span className="size-1 rounded-full bg-black/80" />
              </div>
            </div>
            <div className="font-mono text-[9px] text-black/60 leading-tight">
              <span className="font-bold">TE-AD26</span><br />
              SYS.CTRL
            </div>
          </div>

          {/* Grille de micro-perforations CNC */}
          <div className="grid grid-cols-6 gap-1 opacity-40">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="size-1 rounded-full bg-black" />
            ))}
          </div>

          {/* LED de synchro clignotante */}
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-black/60">
            <span
              className="size-2 rounded-full transition-colors duration-300 shadow-sm"
              style={{ backgroundColor: current.color }}
            />
            <span>SYNC</span>
          </div>
        </div>

        {/* ÉCRAN LCD MONOCHROME RÉTRO-ÉCLAIRÉ */}
        <div className="mt-3.5 rounded-2xl bg-[#0F172A] p-4 text-[#F8FAFC] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] border border-black/40">
          {/* Ligne d'en-tête LCD */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[10px]">
            <span className="font-bold tracking-wider" style={{ color: current.color }}>
              {current.title}
            </span>
            <span className="text-white/40">MODE :: RUN</span>
          </div>

          {/* Corps de l'écran avec waveform synthétiseur + specs clés */}
          <div className="my-3 grid grid-cols-2 gap-3 font-mono text-[10px]">
            {current.specs.map((s) => (
              <div key={s.k} className="border-l border-white/20 pl-2">
                <span className="text-[8px] text-white/40 block">{s.k}</span>
                <span className="font-semibold text-white/95 text-[11px] truncate block">{s.v}</span>
              </div>
            ))}
          </div>

          {/* Mini analyseur d'ondes / signal temps réel */}
          <div className="mt-2 flex items-end gap-1.5 h-7 pt-1 border-t border-white/10">
            {current.signal.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${Math.min(100, (h + ((tick + i * 7) % 25)))}%`,
                  backgroundColor: current.color,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>

          {/* Pied d'écran LCD */}
          <div className="mt-2 flex items-center justify-between font-mono text-[8px] text-white/50 pt-1">
            <span>{current.status}</span>
            <span className="animate-pulse">● REC</span>
          </div>
        </div>

        {/* TOUCHES PHYSIQUES USINÉES (3 SWITCHS TACTILES INTERACTIFS) */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { id: "hardware" as const, label: "HARDWARE", icon: Cpu, color: "#FF4D00", num: "01" },
            { id: "product" as const, label: "PRODUCT", icon: Layout, color: "#2340F0", num: "02" },
            { id: "execution" as const, label: "LEADERSHIP", icon: Users, color: "#10B981", num: "03" },
          ].map((btn) => {
            const isSel = activeTab === btn.id;
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => handleSelectTab(btn.id, btn.color)}
                className={`relative flex flex-col items-center justify-center rounded-xl py-3 px-2 transition-all cursor-pointer font-mono ${
                  isSel
                    ? "bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1)] translate-y-0.5 border border-black/20"
                    : "bg-[#E2E8F0] text-black/70 hover:bg-[#EAEFF5] hover:text-black shadow-[0_2px_4px_rgba(0,0,0,0.06)] active:translate-y-1 border border-black/10"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="size-3.5" style={{ color: isSel ? btn.color : undefined }} />
                  <span className="text-[10px] font-bold tracking-wider">{btn.label}</span>
                </div>
                <span className="text-[8px] text-black/40 mt-0.5">KEY #{btn.num}</span>
              </button>
            );
          })}
        </div>

        {/* Légende bas de boîte */}
        <div className="mt-3 flex items-center justify-between px-2 font-mono text-[9px] text-black/50">
          <span>MINES ST-ÉTIENNE × POLIMI</span>
          <span>CLICK KEYS TO SWITCH VIEW</span>
        </div>
      </motion.div>
    </div>
  );
}
