import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
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
  {
    id: "bac",
    row: "FORMATION",
    label: "BAC EURO",
    place: "Lycée Notre-Dame des Aydes, Blois",
    from: "2019-09",
    to: "2022-06",
    details: [
      "Baccalauréat Mention Bien (Section Européenne)",
      "Spécialités : Mathématiques, Physique-Chimie, HGGSP. Option Maths Expertes.",
    ],
    en: {
      label: "EUROPEAN BAC",
      place: "Lycée Notre-Dame des Aydes, Blois",
      details: [
        "High School Diploma with Honors (European Track)",
        "Specialties: Mathematics, Physics, Chemistry, Geopolitics, Advanced Mathematics option.",
      ],
    },
  },
  {
    id: "prepa",
    row: "FORMATION",
    label: "PRÉPA MPSI-MP*",
    place: "Lycée Pothier, Orléans",
    from: "2022-09",
    to: "2024-06",
    details: [
      "Classes Préparatoires aux Grandes Écoles (MPSI puis MP*)",
      "Spécialités : Mathématiques, Physique, Informatique.",
      "Deux ans de formation intensive développant rigueur et endurance.",
    ],
    en: {
      label: "PREP MPSI - MP*",
      place: "Lycée Pothier, Orléans",
      details: [
        "Intensive Preparatory Classes (MPSI then MP*)",
        "Curriculum: Mathematics, Physics, Computer Science.",
        "Two years of high-intensity scientific problem-solving training.",
      ],
    },
  },
  {
    id: "mines",
    row: "FORMATION",
    label: "Mines Saint-Étienne · ISMIN",
    place: "Mines de Saint-Étienne, Gardanne",
    from: "2024-09",
    to: "2027-09",
    details: [
      "Diplôme d'ingénieur ISMIN — Microélectronique et Informatique.",
      "Tronc commun : Microcontrôleurs, Traitement du Signal, Architecture CPU, Électronique Numérique/Analogique, Cryptographie.",
      "Électifs : IA pour la Production, FPGA & Sécurité, Entrepreneuriat.",
    ],
    en: {
      place: "Mines Saint-Étienne, Gardanne",
      details: [
        "ISMIN Engineering Degree — Microelectronics and Computer Science.",
        "Core: Microcontrollers, Signal Processing, CPU Architecture, Digital/Analog Electronics, Cryptography.",
        "Electives: AI for Production, FPGA and Security, Entrepreneurship.",
      ],
    },
  },
  // --- Stages ---
  {
    id: "phinia",
    row: "STAGE",
    label: "PHINIA",
    place: "PHINIA Delphi, Blois",
    from: "2025-01",
    to: "2025-01",
    details: [
      "Stage Ingénieur Systèmes Hardware : plateforme ECU 24V.",
      "Configuration et tests de systèmes d'injection et bancs de tests industriels.",
      "Validation fonctionnelle d'ECU avec application Hydrogène (H2).",
      "Caractérisation thermique d'un ECU via communication CAN (12V → 24V).",
    ],
    en: {
      place: "PHINIA Delphi, Blois",
      details: [
        "Hardware Systems Engineering Intern: 24V ECU platform.",
        "Configured and tested hardware/software and industrial test benches.",
        "Functional validation of ECUs for hydrogen applications (H2).",
        "Thermal characterization over CAN communication (12V → 24V adaptation).",
      ],
    },
  },
  {
    id: "advantest",
    row: "STAGE",
    label: "Advantest",
    place: "Advantest, Böblingen, Allemagne",
    from: "2026-04",
    to: "2026-07",
    details: [
      "Stage Ingénieur R&D Test Cell Integration.",
      "Tests de PCBs de calibration destinés au test de puces IA/GPU.",
      "Modélisation et impression 3D d'un boîtier d'interface testeur ↔ PC.",
      "Mesures et analyses de précision sur PCBs (Microscope, VNA, TDR).",
    ],
    en: {
      place: "Advantest, Böblingen, Germany",
      details: [
        "R&D Test Cell Integration Engineering Intern.",
        "Testing calibration PCBs intended for AI/GPU chip testing.",
        "3D modeling and printing of tester ↔ PC interface enclosure.",
        "Precision measurements and analysis on PCBs (Microscope, VNA, TDR).",
      ],
    },
  },
  // --- Associations ---
  {
    id: "minitel",
    row: "ASSO",
    label: "Président MINITEL",
    place: "Association étudiante, Gardanne",
    from: "2025-03",
    to: "2026-02",
    details: [
      "Direction de l'association (16 membres) et gestion d'un budget de plus de 25 000 €.",
      "Maintenance du réseau Wi-Fi/filaire de 150+ logements étudiants du campus.",
      "Organisation d'événements majeurs et LAN e-sport avec Riot Games et Red Bull.",
      "Élu membre d'honneur à la fin de mon mandat présidentiel.",
    ],
    en: {
      label: "MINITEL President",
      place: "Student association, Gardanne",
      details: [
        "Led student association (16 members) and managed €25k+ budget.",
        "Campus Wi-Fi/wired network maintenance for 150+ student apartments.",
        "Organized major LAN events partnered with Riot Games & Red Bull.",
        "Elected honorary member at the end of presidential term.",
      ],
    },
  },
  {
    id: "minitel-honneur",
    row: "ASSO",
    label: "Membre d'honneur",
    place: "Association étudiante, Gardanne",
    from: "2026-03",
    to: "2027-03",
    details: [
      "Élu membre d'honneur de l'association à l'issue de mon mandat de Président.",
      "Accompagnement, conseil et transmission auprès du nouveau bureau de l'association.",
      "Statut honorifique actif au sein de MINITEL jusqu'en mars 2027.",
    ],
    en: {
      label: "Honorary Member",
      place: "Student association, Gardanne",
      details: [
        "Elected honorary member of the association at the end of my presidential term.",
        "Mentorship, advisory support and handover to the newly elected board.",
        "Active honorary tenure within MINITEL through March 2027.",
      ],
    },
  },
  // --- International ---
  {
    id: "polimi",
    row: "INTL",
    label: "Politecnico di Milano",
    place: "Politecnico di Milano, Milan, Italie",
    from: "2026-09",
    to: "2027-02",
    details: [
      "Semestre international Erasmus — Master in Design & Engineering.",
      "Cours : Product Design Studio 1, UX Design, Design and Manufacturing, Virtual & Physical Prototyping.",
      "Enjeu : Maîtriser l'ergonomie, le prototypage rapide et l'UX pour placer l'utilisateur au centre de la conception matérielle.",
    ],
    en: {
      label: "Politecnico di Milano",
      place: "Politecnico di Milano, Milan, Italy",
      details: [
        "Erasmus international semester — Master in Design & Engineering.",
        "Courses: Product Design Studio 1, UX Design, Design and Manufacturing, Virtual & Physical Prototyping.",
        "Goal: Master ergonomics, rapid prototyping, and UX to put the user at the center of hardware design.",
      ],
    },
  },
  // --- Objectif ---
  {
    id: "target",
    row: "TARGET",
    label: "Stage PO / PM",
    place: "5+ mois, à partir d'avril 2027",
    from: "2027-04",
    to: "2027-09",
    details: [
      "À la recherche d'un stage de fin d'études (5+ mois) dès avril 2027.",
      "Rôles cibles : Product Owner, Product Manager, Prototypage & Innovation Produit.",
      "Passerelle naturelle entre excellence hardware/système et vision produit orientée utilisateur.",
    ],
    en: {
      label: "PO / PM Internship",
      place: "5+ months, starting April 2027",
      details: [
        "Seeking an end-of-studies internship (5+ months) starting April 2027.",
        "Target roles: Product Owner, Product Manager, Prototyping & Product Innovation.",
        "Natural bridge connecting hardware engineering, prototyping and user-centric product vision.",
      ],
    },
  },
];

const ROWS: { key: Row; name: string; bus?: boolean }[] = [
  { key: "FORMATION", name: "FORMATION[2:0]", bus: true },
  { key: "STAGE", name: "STAGE" },
  { key: "ASSO", name: "ASSO" },
  { key: "INTL", name: "ERASMUS" },
  { key: "TARGET", name: "TARGET" },
];

// Date du jour calculée dynamiquement (ex: 2026-10, ou 2027-04 selon la date système réelle)
const now = new Date();
const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

export default function Circuit({ onMinitel }: { onMinitel?: () => void }) {
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

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSel(customEvent.detail);
      }
    };
    window.addEventListener("circuit-select", handleSelect);
    return () => window.removeEventListener("circuit-select", handleSelect);
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

  const handleAction = (it: Item) => {
    if (it.row === "STAGE") {
      document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" });
    } else if (it.id === "minitel" || it.row === "ASSO") {
      document.getElementById("engagements")?.scrollIntoView({ behavior: "smooth" });
    } else if (it.row === "FORMATION" || it.row === "INTL") {
      window.dispatchEvent(new CustomEvent("school-open", { detail: it.id }));
      const el = document.getElementById("ecoles-formation");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Sur mobile : sélecteur compact rapide en cartes horizontales au lieu du grand SVG de 1000px */}
      <div className="sm:hidden mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-mute mb-3">
          {tr("Jalons du parcours · sélectionner", "Journey milestones · select")}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {items.map((it) => {
            const active = it.id === sel;
            return (
              <button
                key={it.id}
                onClick={() => setSel(it.id)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${
                  active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink"
                }`}
              >
                <span className="block font-mono text-[9px] uppercase tracking-wider opacity-70">
                  {ROWS.find((r) => r.key === it.row)?.name}
                </span>
                <span className="block text-xs font-semibold">{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sur Desktop (sm:) : grand chronogramme interactif */}
      <div className="hidden sm:block">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
          <span>{tr("Chronogramme · clic pour afficher, double-clic pour ouvrir", "Timing diagram · click to view, double-click to open")}</span>
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
                  // Ligne logique : état bas LO au repos, passage à HI lors d'une période active.
                  // Entre deux mandats consécutifs (ex: Président -> Membre d'honneur), on réalise une coupure / transition franche (glitch/handover)
                  d = `M${x(T0)} ${lo}`;
                  let curX = x(T0);
                  seg.forEach(({ a, b }, idx) => {
                    if (a > curX) {
                      d += ` L${a} ${lo} L${a} ${hi}`;
                    } else if (a <= curX) {
                      d += ` L${a} ${hi}`;
                    }
                    d += ` L${b} ${hi}`;
                    const next = seg[idx + 1];
                    if (!next || next.a > b) {
                      d += ` L${b} ${lo}`;
                      curX = b;
                    } else {
                      // Transition immédiate entre mandats consécutifs : encoche d'impulsion de synchronisation propre
                      d += ` L${b} ${mid} L${next.a} ${mid} L${next.a} ${hi}`;
                      curX = next.a;
                    }
                  });
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
                    
                    {/* Marqueur de frontière de transition entre deux mandats */}
                    {!r.bus && seg.map(({ b }, idx) => {
                      const next = seg[idx + 1];
                      if (next && Math.abs(next.a - b) <= 4) {
                        return (
                          <g key={`trans-${idx}`} className="stroke-ink">
                            <line x1={b} y1={hi - 4} x2={b} y2={lo + 4} strokeDasharray="2 2" strokeWidth={1} />
                          </g>
                        );
                      }
                      return null;
                    })}

                    {seg.map(({ i, a, b }) => {
                      const on = i.id === sel;
                      const textWidth = i.label.length * 7.5 + 14;
                      const inside = b - a > textWidth;
                      return (
                        <g key={i.id} role="button" tabIndex={0} aria-pressed={on} aria-label={`${i.label}, ${fmtRange(i)}`}
                          className="cursor-pointer outline-none"
                          onClick={() => {
                            setSel(i.id);
                            handleAction(i);
                          }}
                          onDoubleClick={() => handleAction(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSel(i.id);
                              handleAction(i);
                            }
                          }}>
                          <rect x={a} y={top + 4} width={inside ? b - a : b - a + textWidth} height={ROW_H - 8} fill="transparent" />
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
      </div>
    </div>
  );
}
