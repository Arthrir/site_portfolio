import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Cpu, Flame, Compass, Sparkles, CheckCircle2, ChevronRight, Sliders, Shield } from "lucide-react";
import { useLang } from "../i18n";

interface HeroCompositeProps {
  onColorChange?: (color: string) => void;
}

export default function HeroComposite({ onColorChange }: HeroCompositeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tr } = useLang();

  // Mouvements 3D doux sur l'ensemble du composite
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 140, damping: 20 });

  // --- ÉLÉMENT 1 : LE WAFER (Silicium ardoise/bleu nuit CZ avec reflets irisés) ---
  const [waferIridAngle, setWaferIridAngle] = useState(135);
  const [waferPulse, setWaferPulse] = useState(false);

  // --- ÉLÉMENT 3 : LE MODE CHALEUR (Thermal Infrarouge & Hotspot) ---
  const [isOverclocked, setIsOverclocked] = useState(false);
  const [tempJunction, setTempJunction] = useState(48.2);

  useEffect(() => {
    const base = isOverclocked ? 64.5 : 48.2;
    const interval = setInterval(() => {
      setTempJunction(Number((base + (Math.random() * 0.8 - 0.4)).toFixed(1)));
    }, 800);
    return () => clearInterval(interval);
  }, [isOverclocked]);

  // --- ÉLÉMENT 4 : LE DESIGN & CMF (Politecnico di Milano) ---
  const [activeMaterial, setActiveMaterial] = useState<number>(0);
  const materials = [
    { code: "TI-64", name: "Titanium Gr.5", hex: "#94A3B8", border: "#CBD5E1" },
    { code: "SI-CZ", name: "Silicon ⟨100⟩", hex: "#1E293B", border: "#38BDF8" },
    { code: "AU-18K", name: "Gold Wirebond", hex: "#D4AF37", border: "#FDE047" },
    { code: "AL-BLK", name: "Anodized 6061", hex: "#0F172A", border: "#64748B" },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(nx);
    my.set(ny);

    // Fait tourner le reflet d'iridescence du wafer selon l'angle de la souris
    const angle = Math.round(Math.atan2(ny, nx) * (180 / Math.PI) + 180);
    setWaferIridAngle(angle);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const handleWaferClick = () => {
    setWaferPulse(true);
    setTimeout(() => setWaferPulse(false), 700);
    if (onColorChange) onColorChange("#38BDF8");
  };

  const handleHeatClick = () => {
    setIsOverclocked((o) => !o);
    if (onColorChange) onColorChange(isOverclocked ? "#D4AF37" : "#EF4444");
  };

  return (
    <div className="relative w-full select-none">
      {/* En-tête de composition Studio */}
      <div className="mb-3 flex items-center justify-between px-2 font-mono text-[10px] text-mute uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-ink font-semibold">
          <span className="size-2 rounded-full bg-signal animate-pulse" />
          <span>STUDIO D'INGÉNIERIE & DESIGN</span>
        </span>
        <span className="hidden sm:inline text-mute/70">
          MINES ST-ÉTIENNE · POLIMI
        </span>
      </div>

      {/* GRILLE BENTO 4 ÉLÉMENTS FLOTTANTE 3D */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="grid grid-cols-2 gap-3.5 sm:gap-4.5 p-3.5 sm:p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-ink/15 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.18),0_10px_30px_-10px_rgba(0,0,0,0.08)]"
      >
        {/* ============================================================== */}
        {/* 1. LE WAFER DE SILICIUM PUR (300mm, CZ, Réfraction Irisée)     */}
        {/* ============================================================== */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={handleWaferClick}
          className="group relative aspect-square cursor-pointer rounded-2xl overflow-hidden border border-ink/10 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#04070D] p-3 flex flex-col justify-between shadow-md transition-shadow hover:shadow-xl"
        >
          {/* Label de la carte */}
          <div className="relative z-20 flex items-center justify-between font-mono text-[9px] text-white/70">
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <span className="size-1.5 rounded-full bg-sky-400" />
              <span>01 · WAFER 300mm</span>
            </span>
            <span className="text-white/40">CZ ⟨100⟩</span>
          </div>

          {/* LE DISQUE DE SILICIUM MINIATURE AVEC EFFET IRISÉ ET DIES EN ESCALIER */}
          <div className="relative my-auto mx-auto size-[78%] rounded-full bg-gradient-to-tr from-[#080C14] via-[#131C2D] to-[#0A0E18] shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-3px_8px_rgba(0,0,0,0.9)] border border-white/20 flex items-center justify-center overflow-hidden">
            {/* L'EFFET D'IRIDESCENCE CHROMATIQUE QUI TOURNE AVEC LA SOURIS */}
            <div
              style={{
                background: `linear-gradient(${waferIridAngle}deg, rgba(236,72,153,0.30) 0%, rgba(59,130,246,0.35) 25%, rgba(16,185,129,0.30) 50%, rgba(245,158,11,0.32) 75%, rgba(139,92,246,0.30) 100%)`,
              }}
              className="pointer-events-none absolute inset-0 mix-blend-screen transition-all duration-150"
            />

            {/* Matrice des micro-dies avec rues de sciage de 1px */}
            <div className="relative z-10 grid grid-cols-8 grid-rows-8 gap-[1px] size-[82%] opacity-85">
              {Array.from({ length: 64 }).map((_, i) => {
                const gx = i % 8;
                const gy = Math.floor(i / 8);
                const dx = gx - 3.5;
                const dy = gy - 3.5;
                const isEdge = Math.sqrt(dx * dx + dy * dy) > 3.6;
                if (isEdge) return <div key={i} className="opacity-0 pointer-events-none" />;

                const isCore = Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
                return (
                  <div
                    key={i}
                    className={`rounded-[0.5px] transition-colors ${
                      isCore
                        ? "bg-amber-400/40 border border-amber-400/70"
                        : "bg-white/10 border border-white/15 group-hover:bg-white/20"
                    }`}
                  />
                );
              })}
            </div>

            {/* Encoche SEMI en V au bas */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-black rounded-t-sm border-t border-white/40" />

            {/* Onde de sonde lumineuse au clic */}
            {waferPulse && (
              <motion.div
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full border-2 border-sky-400 pointer-events-none"
              />
            )}
          </div>

          <div className="relative z-20 flex items-center justify-between font-mono text-[8.5px] text-white/60">
            <span>MICROÉLECTRONIQUE</span>
            <span className="text-emerald-400 font-semibold">100% YIELD</span>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* 2. LE PORTRAIT ARGENTIQUE BARYTÉ (Arthur Doradoux, fig. 01)    */}
        {/* ============================================================== */}
        <motion.div
          whileHover={{ scale: 1.02, rotateZ: 0.8 }}
          className="group relative aspect-square cursor-pointer rounded-2xl overflow-hidden border border-ink/15 bg-white p-2.5 flex flex-col justify-between shadow-md transition-shadow hover:shadow-xl"
        >
          {/* Header style tirage d'archive d'ingénieur */}
          <div className="flex items-center justify-between font-mono text-[9px] text-mute pb-1">
            <span className="font-semibold text-ink">fig. 01 · PORTRAIT</span>
            <span className="rounded bg-ink/5 px-1 py-0.2 text-[8px] font-bold text-ink">
              MINES
            </span>
          </div>

          {/* Cadrage photo argentique */}
          <div className="relative mx-auto my-auto w-full aspect-[4/3] rounded-lg overflow-hidden border border-ink/10 shadow-inner bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center filter grayscale contrast-[1.08] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
            />
            {/* Légende en surimpression discrète */}
            <div className="absolute bottom-1 right-1.5 rounded bg-black/60 backdrop-blur-sm px-1.5 py-0.5 font-mono text-[7.5px] text-white/90">
              A. Doradoux
            </div>
          </div>

          {/* Footer de la carte */}
          <div className="flex items-center justify-between font-mono text-[8.5px] text-mute pt-1 border-t border-ink/10">
            <span className="font-medium text-ink">Élève-Ingénieur</span>
            <span className="text-signal font-semibold">ISMIN 2027</span>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* 3. LE MODE CHALEUR (Thermal Infrarouge / FLIR Hotspot)        */}
        {/* ============================================================== */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={handleHeatClick}
          className="group relative aspect-square cursor-pointer rounded-2xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-[#0B0616] via-[#1A0B2E] to-[#040108] p-3 flex flex-col justify-between shadow-md transition-shadow hover:shadow-xl"
        >
          {/* En-tête thermique */}
          <div className="relative z-20 flex items-center justify-between font-mono text-[9px]">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Flame className={`size-3 text-amber-400 ${isOverclocked ? "animate-bounce" : ""}`} />
              <span>03 · THERMAL</span>
            </span>
            <span className={`font-mono text-[9px] font-bold ${isOverclocked ? "text-rose-400 animate-pulse" : "text-amber-400"}`}>
              {tempJunction}°C
            </span>
          </div>

          {/* CŒUR THERMIQUE INFRAROUGE AVEC ISOTHERMES CONCENTRIQUES */}
          <div className="relative my-auto mx-auto size-[78%] rounded-xl bg-gradient-to-br from-[#2D0A4E] via-[#5B1061] to-[#120324] border border-amber-500/30 flex items-center justify-center overflow-hidden p-2">
            {/* Gradient de rayonnement thermique */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                isOverclocked ? "opacity-95" : "opacity-80"
              }`}
              style={{
                background:
                  "radial-gradient(circle at 45% 45%, #FEF08A 0%, #F97316 28%, #DC2626 50%, #9333EA 75%, transparent 100%)",
              }}
            />

            {/* Isothermes concentriques en pointillés */}
            <div className="absolute inset-2 rounded-lg border border-dashed border-amber-200/50 pointer-events-none" />
            <div className="absolute inset-5 rounded-md border border-dashed border-rose-300/40 pointer-events-none" />

            {/* Cœur RV32I en surchauffe */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="font-mono text-[8px] font-bold text-ink bg-amber-300/90 rounded px-1.5 py-0.5 shadow-sm">
                ALU HOTSPOT
              </span>
              <span className="mt-1 font-mono text-[7.5px] text-white/90 drop-shadow">
                {isOverclocked ? "240 MHz (OC)" : "120 MHz (NOM)"}
              </span>
            </div>
          </div>

          {/* Télémétrie basse */}
          <div className="relative z-20 flex items-center justify-between font-mono text-[8px] text-white/70">
            <span>DISSIPATION</span>
            <span className="text-amber-300 font-semibold">
              {isOverclocked ? "3.2W LOAD" : "1.4W PASSIVE"}
            </span>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* 4. LE DESIGN INDUSTRIEL & CMF (Politecnico di Milano)         */}
        {/* ============================================================== */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="group relative aspect-square cursor-pointer rounded-2xl overflow-hidden border border-ink/15 bg-[#FAFAF9] p-3 flex flex-col justify-between shadow-md transition-shadow hover:shadow-xl"
        >
          {/* Header CMF */}
          <div className="flex items-center justify-between font-mono text-[9px] text-mute">
            <span className="flex items-center gap-1 text-ink font-semibold">
              <Compass className="size-2.5 text-signal" />
              <span>04 · DESIGN & CMF</span>
            </span>
            <span className="text-mute/80 font-bold">POLIMI</span>
          </div>

          {/* Grille de composition Suisse & Nuancier Matériaux */}
          <div className="my-auto space-y-2">
            <div className="flex items-center justify-between border-b border-ink/10 pb-1">
              <span className="font-mono text-[8px] uppercase tracking-wider text-mute">
                Matériaux d'ingénierie
              </span>
              <span className="font-mono text-[8.5px] font-semibold text-ink">
                Φ = 1.618
              </span>
            </div>

            {/* 4 Pastilles de matériaux cliquables */}
            <div className="grid grid-cols-2 gap-1.5">
              {materials.map((m, idx) => (
                <button
                  key={m.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMaterial(idx);
                    if (onColorChange) onColorChange(m.hex);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg p-1 text-left transition-all ${
                    activeMaterial === idx
                      ? "bg-white shadow-sm ring-1 ring-ink/20"
                      : "hover:bg-white/60"
                  }`}
                >
                  <span
                    className="size-3.5 rounded shrink-0 shadow-xs border"
                    style={{ backgroundColor: m.hex, borderColor: m.border }}
                  />
                  <div className="truncate">
                    <div className="font-mono text-[7.5px] font-bold text-ink leading-none">
                      {m.code}
                    </div>
                    <div className="text-[7px] text-mute truncate leading-tight">
                      {m.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Règle millimétrique vectorielle en bas */}
          <div className="flex items-center justify-between font-mono text-[7.5px] text-mute border-t border-ink/10 pt-1">
            <span>MILANO DESIGN LAB</span>
            <span className="font-semibold text-ink">PRECISE CMF</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Légende basse globale */}
      <div className="mt-3 flex items-center justify-between px-2 font-mono text-[9.5px] text-mute">
        <span>01 Silicium · 02 Portrait · 03 Chaleur · 04 Design</span>
        <span className="text-signal font-semibold">INTERACTIF</span>
      </div>
    </div>
  );
}
