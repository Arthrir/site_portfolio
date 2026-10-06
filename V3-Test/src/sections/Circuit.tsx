import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { loc, useLang, type Lang, type Loc } from "../i18n";

/* ============================================================================
 *  DONNÉES — à éditer ici.
 *  row     : ligne du chronogramme (voir ROWS plus bas)
 *  label   : texte affiché sur le signal (court de préférence)
 *  place   : lieu / organisme
 *  from/to : "YYYY-MM" (to = mois de fin inclus)
 *  details : puces affichées dans le panneau de détail
 *  NB : les mois marqués "≈" sont des estimations, à corriger.
 * ========================================================================== */
type Row = "FORMATION" | "STAGE" | "ASSO" | "INTL" | "TARGET";
type Item = { id: string; row: Row; label: string; place: string; from: string; to: string; details: string[] };

const ITEMS: Loc<Item>[] = [
  // --- Formation (bus multi-bit) ---
  { id: "bac", row: "FORMATION", label: "BAC EURO", place: "Blois", from: "2019-09", to: "2022-06", details: ["Mention Bien", "Maths, physique-chimie, HGGSP, Maths Expertes"], en: { label: "EUROPEAN BAC", details: ["Graduated with honors (Mention Bien)", "Maths, physics-chemistry, geopolitics (HGGSP), advanced maths"] } },
  { id: "prepa", row: "FORMATION", label: "PRÉPA MPSI-MP*", place: "Lycée Pothier, Orléans", from: "2022-09", to: "2024-06", details: ["MPSI puis MP*", "Mathématiques, physique, informatique"], en: { label: "PREP MPSI - MP*", place: "Lycée Pothier, Orléans", details: ["MPSI then MP* (intensive preparatory classes)", "Mathematics, physics, computer science"] } },
  { id: "mines", row: "FORMATION", label: "Mines Saint-Étienne · ISMIN", place: "Mines Saint-Étienne, Gardanne", from: "2024-09", to: "2027-09", details: ["Microélectronique & informatique", "Microcontrôleurs, FPGA & sécurité", "IA pour la production, entrepreneuriat"], en: { details: ["Microelectronics & computer science", "Microcontrollers, FPGA & security", "AI for manufacturing, entrepreneurship"] } },
  // --- Stages ---
  { id: "phinia", row: "STAGE", label: "PHINIA", place: "Blois", from: "2025-01", to: "2025-02", details: ["ECU 24V, validation H2", "Caractérisation thermique via CAN"], en: { details: ["24V ECU, H2 validation", "Thermal characterization over CAN"] } },
  { id: "advantest", row: "STAGE", label: "Advantest", place: "Böblingen, Allemagne", from: "2026-04", to: "2026-07", details: ["Calibration de PCB pour test de puces IA/GPU", "VNA, TDR", "Enceinte imprimée 3D"], en: { place: "Böblingen, Germany", details: ["PCB calibration for AI/GPU chip testing", "VNA, TDR", "3D-printed enclosure"] } },
  // --- Associations ---
  { id: "minitel", row: "ASSO", label: "Président MINITEL", place: "Association étudiante", from: "2025-03", to: "2026-03", details: ["Fédérer, structurer, livrer", "Là où l'envie du produit est née"], en: { label: "MINITEL President", place: "Student association", details: ["Rally, structure, deliver", "Where my drive for product was born"] } },
  // --- International ---
  { id: "polimi", row: "INTL", label: "Politecnico di Milano", place: "Milan · Design & Engineering", from: "2026-09", to: "2027-02" /* ≈ */, details: ["Product Design Studio", "UX Design", "Virtual & Physical Prototyping"], en: { place: "Milan · Design & Engineering" } },
  // --- Objectif ---
  { id: "target", row: "TARGET", label: "Stage PO / PM", place: "5+ mois, à partir d'avril 2027", from: "2027-04", to: "2027-09", details: ["Product Owner / Product Manager", "ou ingénierie hard/soft"], en: { label: "PO / PM internship", place: "5+ months, starting April 2027", details: ["Product Owner / Product Manager", "or hardware/software engineering"] } },
];

const ROWS: { key: Row; name: string; bus?: boolean }[] = [
  { key: "FORMATION", name: "FORMATION[2:0]", bus: true },
  { key: "STAGE", name: "STAGE" },
  { key: "ASSO", name: "ASSO" },
  { key: "INTL", name: "INTL" },
  { key: "TARGET", name: "TARGET" },
];

const TODAY = "2026-10";
/* ======================================================================== */

const ease = [0.22, 1, 0.36, 1] as const;
const MONTHS: Record<Lang, string[]> = {
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// Temps en mois absolus
const m = (s: string) => { const [y, mo] = s.split("-").map(Number); return y * 12 + (mo - 1); };
const T0 = m("2019-01"), TB = m("2024-01"), T1 = m("2029-01");
const SPLIT = 0.24; // part de largeur pour 2019→2024 (échelle compressée)
const fmtL = (lang: Lang) => (t: number) => `${MONTHS[lang][((Math.round(t) % 12) + 12) % 12]} ${Math.floor(Math.round(t) / 12)}`;

const NAME_W = 150, ROW_H = 64, AXIS_H = 40, PAD = 12, SLOPE = 6;

export default function Circuit() {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { once: true, margin: "-15% 0px" });
  const [avail, setAvail] = useState(1000);
  const [sel, setSel] = useState("polimi");
  const [hover, setHover] = useState<number | null>(null);
  const { lang, tr } = useLang();
  const items = useMemo(() => ITEMS.map((i) => loc(i, lang)), [lang]);
  const fmt = fmtL(lang);
  const fmtRange = (i: Item) => `${fmt(m(i.from))} → ${fmt(m(i.to))}`;
  const mo = tr("mois", "mo");

  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth));
    ro.observe(el); setAvail(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(960, avail - NAME_W - 2);
  const iw = W - PAD * 2;
  const x = (t: number) => PAD + (t <= TB ? ((t - T0) / (TB - T0)) * SPLIT * iw : (SPLIT + ((t - TB) / (T1 - TB)) * (1 - SPLIT)) * iw);
  const inv = (px: number) => {
    const u = (px - PAD) / iw;
    return u <= SPLIT ? T0 + (u / SPLIT) * (TB - T0) : TB + ((u - SPLIT) / (1 - SPLIT)) * (T1 - TB);
  };
  const H = AXIS_H + ROWS.length * ROW_H;
  const item = items.find((i) => i.id === sel)!;
  const tToday = m(TODAY);

  // Graduations : années partout, trimestres dans la zone dilatée
  const ticks = useMemo(() => {
    const out: { t: number; major: boolean }[] = [];
    for (let t = T0; t <= T1; t += 3) if (t % 12 === 0 || t >= TB) out.push({ t, major: t % 12 === 0 });
    return out;
  }, []);

  const draw = (i: number) => ({
    initial: { pathLength: 0 },
    animate: { pathLength: inView ? 1 : 0 },
    transition: { duration: 1.6, delay: 0.15 * i, ease },
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
        <span>{tr("Chronogramme · cliquer sur un segment", "Timing diagram · click a segment")}</span>
        <span>
          {hover !== null ? <>Curseur B = <span className="text-ink">{fmt(hover)}</span> · Δ(A,B) = <span className="text-ink">{Math.round(hover - tToday) >= 0 ? "+" : ""}{Math.round(hover - tToday)} {mo}</span></> : tr("Survoler pour mesurer", "Hover to measure")}
        </span>
      </div>

      <div ref={wrap} className="relative overflow-x-auto border border-ink/80 bg-paper">
        <div className="flex" style={{ width: NAME_W + W }}>
          {/* Colonne des noms de signaux (sticky en scroll horizontal) */}
          <div className="sticky left-0 z-10 shrink-0 border-r border-ink/80 bg-paper" style={{ width: NAME_W }}>
            <div className="flex items-end px-3 pb-2 font-mono text-[11px] text-mute" style={{ height: AXIS_H }}>SIGNAL</div>
            {ROWS.map((r) => (
              <div key={r.key} className="flex items-center border-t border-line px-3 font-mono text-[13px] text-ink" style={{ height: ROW_H }}>{r.name}</div>
            ))}
          </div>

          <svg
            width={W} height={H} className="block shrink-0 select-none"
            onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const t = inv(e.clientX - r.left); setHover(t >= T0 && t <= T1 ? t : null); }}
            onPointerLeave={() => setHover(null)}
          >
            {/* Grille + axe */}
            {ticks.map(({ t, major }) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1={major ? AXIS_H - 12 : AXIS_H - 5} y2={H} stroke="var(--color-line)" strokeWidth={1} strokeDasharray={major ? undefined : "2 3"} />
                {major && t < T1 && <text x={x(t) + 4} y={AXIS_H - 16} className="fill-ink font-mono" fontSize={12}>{t / 12}</text>}
              </g>
            ))}
            <line x1={0} x2={W} y1={AXIS_H} y2={AXIS_H} stroke="var(--color-ink)" strokeWidth={1} />
            {/* Marque de rupture d'échelle */}
            <g transform={`translate(${x(TB) - 9}, ${AXIS_H})`}>
              <rect x={-3} y={-7} width={12} height={14} fill="var(--color-paper)" />
              <path d="M-3 6 L3 -6 M3 6 L9 -6" stroke="var(--color-ink)" strokeWidth={1} />
            </g>

            {/* Signaux */}
            {ROWS.map((r, ri) => {
              const top = AXIS_H + ri * ROW_H;
              const hi = top + 16, lo = top + ROW_H - 16, mid = (hi + lo) / 2;
              const rowItems = items.filter((i) => i.row === r.key).sort((a, b) => m(a.from) - m(b.from));
              const seg = rowItems.map((i) => ({ i, a: x(m(i.from)), b: x(m(i.to) + 1) }));
              const dashed = r.key === "TARGET";
              let d: string;
              if (r.bus) {
                // Bus : segments hexagonaux, état Z (ligne médiane) entre deux valeurs
                d = `M${x(T0)} ${mid}`;
                seg.forEach(({ a, b }) => {
                  d += ` L${a} ${mid} L${a + SLOPE} ${hi} L${b - SLOPE} ${hi} L${b} ${mid} L${b - SLOPE} ${lo} L${a + SLOPE} ${lo} L${a} ${mid} M${b} ${mid}`;
                });
                d += ` L${x(T1)} ${mid}`;
              } else {
                d = `M${x(T0)} ${lo}`;
                seg.forEach(({ a, b }) => { d += ` L${a} ${lo} L${a} ${hi} L${b} ${hi} L${b} ${lo}`; });
                d += ` L${x(T1)} ${lo}`;
              }
              return (
                <g key={r.key}>
                  {ri > 0 && <line x1={0} x2={W} y1={top} y2={top} stroke="var(--color-line)" strokeWidth={1} />}
                  {seg.map(({ i, a, b }) => i.id === sel && (
                    r.bus
                      ? <path key={`s${i.id}`} d={`M${a} ${mid} L${a + SLOPE} ${hi} L${b - SLOPE} ${hi} L${b} ${mid} L${b - SLOPE} ${lo} L${a + SLOPE} ${lo} Z`} fill="var(--color-signal)" opacity={0.12} />
                      : <rect key={`s${i.id}`} x={a} y={hi} width={b - a} height={lo - hi} fill="var(--color-signal)" opacity={0.12} />
                  ))}
                  <motion.path d={d} fill="none" stroke="var(--color-ink)" strokeWidth={1} strokeDasharray={dashed ? "4 3" : undefined} {...draw(ri)} />
                  {seg.map(({ i, a, b }) => {
                    const on = i.id === sel;
                    const inside = b - a > i.label.length * 7.6 + 16;
                    return (
                      <g key={i.id} role="button" tabIndex={0} aria-pressed={on} aria-label={`${i.label}, ${fmtRange(i)}`}
                        className="cursor-pointer outline-none"
                        onClick={() => setSel(i.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(i.id); } }}>
                        <rect x={a} y={top + 4} width={inside ? b - a : b - a + i.label.length * 7.6 + 16} height={ROW_H - 8} fill="transparent" />
                        <motion.text
                          x={inside ? a + (r.bus ? SLOPE + 6 : 8) : b + 6} y={mid + 4.5}
                          fontSize={13} className={`font-sans ${on ? "fill-signal" : "fill-ink"}`} fontWeight={on ? 600 : 500}
                          initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 0.15 * ri + 0.9, duration: 0.4 }}
                        >{i.label}</motion.text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Curseur A : aujourd'hui */}
            <line x1={x(tToday)} x2={x(tToday)} y1={AXIS_H - 8} y2={H} stroke="var(--color-signal)" strokeWidth={1} />
            <rect x={x(tToday) - 1} y={AXIS_H - 30} width={128} height={16} fill="var(--color-signal)" />
            <text x={x(tToday) + 4} y={AXIS_H - 18.5} fontSize={10.5} className="fill-paper font-mono">{tr("A · T = aujourd'hui", "A · T = today")}</text>

            {/* Curseur B : souris */}
            {hover !== null && (() => {
              const label = `B ${fmt(hover)}`;
              const badgeW = Math.max(76, label.length * 7.5 + 14);
              const badgeX = Math.min(W - badgeW - 4, Math.max(4, x(hover) + 4));
              return (
                <g pointerEvents="none">
                  <line x1={x(hover)} x2={x(hover)} y1={AXIS_H} y2={H} stroke="var(--color-ink)" strokeWidth={1} strokeDasharray="3 3" />
                  <rect x={badgeX} y={H - 22} width={badgeW} height={18} rx={2} fill="var(--color-ink)" />
                  <text x={badgeX + 6} y={H - 9.5} fontSize={10.5} className="fill-paper font-mono" dominantBaseline="middle">{label}</text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Panneau de détail */}
      <div className="mt-6 min-h-[170px] border-t border-ink pt-5" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}
            className="grid gap-4 md:grid-cols-[240px_1fr]">
            <div className="font-mono text-[12px] leading-6 text-mute">
              <div><span className="text-ink">{ROWS.find((r) => r.key === item.row)!.name}</span></div>
              <div>{fmtRange(item)}</div>
              <div>Δt = {m(item.to) - m(item.from) + 1} {mo}</div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{item.label}</h3>
              <p className="mt-1 text-[15px] text-mute">{item.place}</p>
              <ul className="mt-4 space-y-1.5 text-[15px] leading-relaxed">
                {item.details.map((d) => <li key={d} className="flex gap-3"><span className="mt-[0.7em] h-px w-3 shrink-0 bg-ink" />{d}</li>)}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
