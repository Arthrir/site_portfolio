import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { Crosshair, CheckSquare, Square, Layers, Cpu, FileText, Compass, Sparkles } from "lucide-react";

interface HeroDeckProps {
  onColorChange?: (color: string) => void;
}

export default function HeroDeck({ onColorChange }: HeroDeckProps) {
  const { tr } = useLang();
  const [activeCard, setActiveCard] = useState<"wafer" | "product" | "design">("wafer");
  const [isHovered, setIsHovered] = useState(false);

  // --- CARTE 1 : WAFER SILICIUM 200mm ---
  const [selectedDie, setSelectedDie] = useState<{ x: number; y: number }>({ x: 8, y: 8 });
  const [iridAngle, setIridAngle] = useState(135);
  const waferRef = useRef<HTMLDivElement>(null);

  // --- CARTE 2 : PRODUCT OWNER CHECKLIST ---
  const [tasks, setTasks] = useState([
    { id: "align", text: tr("Aligner vision business & faisabilité technique", "Align business vision & technical feasibility"), done: true },
    { id: "backlog", text: tr("Rédiger les User Stories & critères d'acceptation", "Author User Stories & acceptance criteria"), done: true },
    { id: "prioritize", text: tr("Priorisation RICE & arbitrages ROI / sprint", "RICE prioritization & ROI sprint trade-offs"), done: true },
    { id: "kpi", text: tr("Mesurer l'impact réel & métriques d'adoption (OKR)", "Track real user impact & adoption metrics (OKRs)"), done: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const colors = ["#2340F0", "#E10600", "#10B981", "#D4AF37", "#8B5CF6"];

  const handleDieClick = (gx: number, gy: number) => {
    setSelectedDie({ x: gx, y: gy });
    const col = colors[(gx + gy) % colors.length];
    if (onColorChange) onColorChange(col);
  };

  // 3 cartes de l'éventail
  const cards = [
    { id: "wafer", label: tr("01 · Silicium / Hardware", "01 · Silicon / Hardware"), icon: Cpu },
    { id: "product", label: tr("02 · Product Management", "02 · Product Management"), icon: FileText },
    { id: "design", label: tr("03 · Design & CMF (PoliMi)", "03 · Design & CMF (PoliMi)"), icon: Compass },
  ] as const;

  return (
    <div className="relative w-full max-w-[430px] select-none [perspective:1400px]">
      {/* Conteneur principal de l'éventail */}
      <div
        className="relative h-[480px] w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ============================================================== */}
        {/* CARTE 1 : WAFER SILICIUM 200mm (Microélectronique Mines)      */}
        {/* ============================================================== */}
        <motion.div
          onClick={() => setActiveCard("wafer")}
          animate={{
            rotateZ: activeCard === "wafer" ? 0 : isHovered ? -16 : -7,
            x: activeCard === "wafer" ? 0 : isHovered ? -42 : -18,
            y: activeCard === "wafer" ? 0 : isHovered ? 16 : 8,
            scale: activeCard === "wafer" ? 1 : 0.94,
            zIndex: activeCard === "wafer" ? 30 : 10,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={`absolute inset-0 cursor-pointer rounded-2xl border bg-white p-5 shadow-2xl transition-colors ${
            activeCard === "wafer"
              ? "border-ink/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)]"
              : "border-ink/10 opacity-80 hover:opacity-100"
          }`}
        >
          {/* Header de la carte */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-3 font-mono text-[10.5px]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-signal" />
              <span className="font-semibold uppercase tracking-wider text-ink">
                WAFER 200mm · SILICON ⟨100⟩
              </span>
            </div>
            <span className="text-mute">MINES ST-ÉTIENNE</span>
          </div>

          {/* VRAI DISQUE PARFAITEMENT ROND DE SILICIUM (Aspect 1:1, centré, sans déformation) */}
          <div className="relative my-4 flex items-center justify-center">
            <div
              ref={waferRef}
              onPointerMove={(e) => {
                if (!waferRef.current) return;
                const r = waferRef.current.getBoundingClientRect();
                const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
                const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
                setIridAngle(Math.round(Math.atan2(ny, nx) * (180 / Math.PI) + 180));
              }}
              className="relative aspect-square w-[280px] sm:w-[300px] rounded-full bg-gradient-to-tr from-[#0B0F19] via-[#1E293B] to-[#0A0D14] shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-4px_10px_rgba(0,0,0,0.9),0_12px_30px_-6px_rgba(0,0,0,0.35)] border border-white/20 overflow-hidden flex items-center justify-center cursor-crosshair"
            >
              {/* Encoche d'orientation SEMI (Notch à 270° au bas du disque) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-1.5 bg-white/40 rounded-t-full z-20 pointer-events-none" />

              {/* Anneaux concentriques de lithographie */}
              <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-3 rounded-full border border-dashed border-white/15 pointer-events-none" />

              {/* Couche d'interférence optique iridescente */}
              <div
                style={{
                  background: `linear-gradient(${iridAngle}deg, rgba(236,72,153,0.22) 0%, rgba(59,130,246,0.28) 25%, rgba(16,185,129,0.25) 50%, rgba(245,158,11,0.28) 75%, rgba(139,92,246,0.22) 100%)`,
                }}
                className="pointer-events-none absolute inset-0 mix-blend-screen transition-all duration-150"
              />

              {/* Réticules d'axes de scribe X / Y */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full h-px bg-white/10" />
                <div className="absolute h-full w-px bg-white/10" />
                <div className="absolute size-24 rounded-full border border-white/15" />
              </div>

              {/* MATRICE DENSE DE DIES FINES (15x15 = 225 micro-dies, cases minuscules et réalistes) */}
              <div className="relative z-10 grid grid-cols-15 grid-rows-15 gap-[2px] size-[82%] p-1">
                {Array.from({ length: 15 }).map((_, gy) =>
                  Array.from({ length: 15 }).map((_, gx) => {
                    const dx = gx - 7;
                    const dy = gy - 7;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 7.1) return <div key={`${gx}-${gy}`} className="size-full opacity-0 pointer-events-none" />;

                    const isSelected = selectedDie.x === gx && selectedDie.y === gy;
                    const isCenter = gx === 7 && gy === 7;

                    return (
                      <button
                        key={`${gx}-${gy}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDieClick(gx, gy);
                        }}
                        title={`Die [${gx}, ${gy}]`}
                        className={`relative size-full rounded-[1px] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,1)] scale-125 z-20 border border-white"
                            : isCenter
                            ? "bg-[#D4AF37]/60 border border-[#D4AF37] hover:bg-[#D4AF37]"
                            : "bg-white/[0.09] hover:bg-white/[0.3] border border-white/10"
                        }`}
                      />
                    );
                  })
                )}
              </div>

              {/* Sérigraphie interne fonderie ASML */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[6.5px] tracking-[0.2em] text-white/50 uppercase pointer-events-none">
                ASML TWINSCAN · DUV LITHOGRAPHY
              </div>
            </div>
          </div>

          {/* Télémétrie en pied de carte */}
          <div className="flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-[10.5px]">
            <div className="flex items-center gap-1.5">
              <Crosshair className="size-3.5 text-signal" />
              <span className="font-semibold text-ink">DIE [{selectedDie.x}, {selectedDie.y}]</span>
              <span className="text-mute/70">· YIELD 99.4%</span>
            </div>
            <span className="font-semibold text-signal">RV32I TAPE-OUT</span>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* CARTE 2 : PRODUCT OWNER / SPEC (Métier & Management)          */}
        {/* ============================================================== */}
        <motion.div
          onClick={() => setActiveCard("product")}
          animate={{
            rotateZ: activeCard === "product" ? 0 : isHovered ? 0 : 0,
            x: activeCard === "product" ? 0 : 0,
            y: activeCard === "product" ? 0 : isHovered ? -8 : -4,
            scale: activeCard === "product" ? 1 : 0.96,
            zIndex: activeCard === "product" ? 30 : 20,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={`absolute inset-0 cursor-pointer rounded-2xl border bg-white p-5 shadow-2xl transition-colors ${
            activeCard === "product"
              ? "border-ink/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)]"
              : "border-ink/10 opacity-80 hover:opacity-100"
          }`}
        >
          {/* Header de la carte Product */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-3 font-mono text-[10.5px]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-ink">
                PRODUCT SPEC · PO ROADMAP
              </span>
            </div>
            <span className="rounded bg-signal/10 px-2 py-0.5 font-semibold text-signal border border-signal/20">
              SPRINT 14
            </span>
          </div>

          <div className="my-3 space-y-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-mute">
                {tr("Mission visée", "Target Role")}
              </div>
              <h4 className="text-base font-semibold text-ink">
                {tr("Stage Fin d'Études · Product Owner / PM", "Internship · Product Owner / PM")}
              </h4>
              <p className="text-xs text-mute mt-0.5">
                {tr("Disponibilité : Avril 2027 · Durée : 5 à 6 mois", "Available: April 2027 · 5-6 months")}
              </p>
            </div>

            {/* OKR & Impact Metrics */}
            <div className="grid grid-cols-3 gap-2 border-y border-ink/10 py-2.5 font-mono">
              <div className="rounded-lg bg-ink/5 p-2 text-center">
                <div className="text-[9px] uppercase text-mute">{tr("Time-to-Value", "Time-to-Value")}</div>
                <div className="text-sm font-bold text-signal">-42%</div>
              </div>
              <div className="rounded-lg bg-ink/5 p-2 text-center">
                <div className="text-[9px] uppercase text-mute">NPS User</div>
                <div className="text-sm font-bold text-ink">+74</div>
              </div>
              <div className="rounded-lg bg-ink/5 p-2 text-center">
                <div className="text-[9px] uppercase text-mute">{tr("Vélocité", "Velocity")}</div>
                <div className="text-sm font-bold text-emerald-600">96%</div>
              </div>
            </div>

            {/* Checklist interactive des responsabilités PO */}
            <div className="space-y-1.5 pt-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mute">
                {tr("Critères d'acceptation & Rôle PO", "Acceptance Criteria & PO Scope")}
              </div>
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                  className="flex w-full items-start gap-2 rounded-md p-1.5 text-left text-xs transition-colors hover:bg-ink/5"
                >
                  {task.done ? (
                    <CheckSquare className="mt-0.5 size-3.5 shrink-0 text-signal" />
                  ) : (
                    <Square className="mt-0.5 size-3.5 shrink-0 text-mute" />
                  )}
                  <span className={task.done ? "text-ink font-medium" : "text-mute"}>
                    {task.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer de la carte */}
          <div className="flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-[10.5px]">
            <span className="text-mute">{tr("Méthode", "Method")}: Scrum / Agile</span>
            <span className="font-semibold text-ink">MoSCoW : MUST HAVE</span>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* CARTE 3 : DESIGN INDUSTRIEL & ARCHITECTURE (PoliMi Milan)     */}
        {/* ============================================================== */}
        <motion.div
          onClick={() => setActiveCard("design")}
          animate={{
            rotateZ: activeCard === "design" ? 0 : isHovered ? 16 : 7,
            x: activeCard === "design" ? 0 : isHovered ? 42 : 18,
            y: activeCard === "design" ? 0 : isHovered ? 16 : 8,
            scale: activeCard === "design" ? 1 : 0.94,
            zIndex: activeCard === "design" ? 30 : 10,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={`absolute inset-0 cursor-pointer rounded-2xl border bg-white p-5 shadow-2xl transition-colors ${
            activeCard === "design"
              ? "border-ink/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)]"
              : "border-ink/10 opacity-80 hover:opacity-100"
          }`}
        >
          {/* Header de la carte PoliMi */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-3 font-mono text-[10.5px]">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#D4AF37]" />
              <span className="font-semibold uppercase tracking-wider text-ink">
                POLITECNICO DI MILANO
              </span>
            </div>
            <span className="text-mute">SCUOLA DEL DESIGN</span>
          </div>

          <div className="my-4 space-y-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-mute">
                {tr("Double Diplôme International", "International Double Degree")}
              </div>
              <h4 className="text-base font-semibold text-ink">
                {tr("Design Industriel, Ergonomie & Matériaux", "Industrial Design, Ergonomics & Materials")}
              </h4>
              <p className="text-xs text-mute mt-0.5">
                Milano, Italia · 2026–2027
              </p>
            </div>

            {/* Spécification CMF (Color, Material, Finish) */}
            <div className="rounded-xl border border-ink/15 bg-ink/[0.02] p-3 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-ink/10 pb-1.5">
                <span className="text-mute">MATÉRIAU 01</span>
                <span className="font-semibold text-ink">Aluminium 6061-T6 Anodisé</span>
              </div>
              <div className="flex items-center justify-between border-b border-ink/10 pb-1.5">
                <span className="text-mute">MATÉRIAU 02</span>
                <span className="font-semibold text-ink">Verre Saphir & Silicium monocristallin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mute">FINITION</span>
                <span className="font-semibold text-signal">Micro-billage 220 mesh</span>
              </div>
            </div>

            {/* Citation design italien */}
            <div className="rounded-xl border border-dashed border-ink/20 p-3 text-center">
              <p className="font-serif italic text-sm text-ink/80">
                « Ogni dettaglio, ogni raggio di curvatura deve avere una ragione d'essere al servizio dell'uso. »
              </p>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-mute">
                Mines Saint-Étienne × Politecnico di Milano
              </div>
            </div>
          </div>

          {/* Footer de la carte */}
          <div className="flex items-center justify-between border-t border-ink/10 pt-3 font-mono text-[10.5px]">
            <span className="text-mute">PROPORTION D'OR : Φ 1.618</span>
            <span className="font-semibold text-ink">INGÉNIEUR × DESIGNER</span>
          </div>
        </motion.div>
      </div>

      {/* ============================================================== */}
      {/* SÉLECTEUR RAPIDE EN BAS DE L'ÉVENTAIL                          */}
      {/* ============================================================== */}
      <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-white/90 p-1.5 shadow-sm backdrop-blur">
        {cards.map((c) => {
          const active = activeCard === c.id;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCard(c.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] font-medium transition-all ${
                active
                  ? "bg-ink text-paper shadow-sm"
                  : "text-ink/65 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <Icon className="size-3" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

