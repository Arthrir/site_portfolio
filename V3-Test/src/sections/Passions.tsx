import { useEffect, useMemo, useRef, useState } from "react";
import createGlobe from "cobe";
import { motion, AnimatePresence } from "motion/react";
import { loc, useLang, type Loc } from "../i18n";

const ease = [0.22, 1, 0.36, 1] as const;

const PASSIONS: Loc<{ k: string; t: string; d: string }>[] = [
  {
    k: "Motorsport",
    t: "Formule 1",
    d: "La F1 combine tout ce que j'aime : innovation technique, aérodynamique, ingénierie extrême. Mais aussi la stratégie, la dimension médiatique et la politique entre écuries. Un écosystème ultra-compétitif où chaque détail compte.",
    en: {
      t: "Formula 1",
      d: "F1 combines everything I love: technical innovation, aerodynamics, extreme engineering. But also strategy, the media side and the politics between teams. An ultra-competitive ecosystem where every detail matters."
    }
  },
  {
    k: "Esport",
    t: "Scène compétitive & Vitality",
    d: "Plus qu'un loisir : une culture de la performance mentale sous tension, de la communication d'équipe et du clutch. Grand supporter de Team Vitality, j'ai aussi organisé des tournois LAN pour MINITEL pour faire vivre la dimension événementielle et technique de l'intérieur.",
    en: {
      t: "Competitive Esport & Vitality",
      d: "More than gaming: high-pressure mental resilience, team communication and clutch decision-making. A dedicated Team Vitality fan, I also organized grassroots LAN tournaments for MINITEL to experience esports event operations firsthand."
    }
  },
  {
    k: "Sport",
    t: "Discipline & dépassement",
    d: "Cyclisme, running, sports de combat, judo. L'effort physique exigeant est mon équilibre indispensable : il forge la persévérance, la lucidité face à la fatigue et la volonté constante de repousser mes propres limites.",
    en: {
      t: "Discipline & Grit",
      d: "Cycling, running, combat sports, judo. Demanding physical exertion is my daily anchor: it builds resilience, mental clarity under fatigue, and an ongoing drive to push personal boundaries."
    }
  },
  {
    k: "Innovation",
    t: "Tech, marchés & finance",
    d: "Passionné par l'actualité technologique, les semi-conducteurs, l'IA et les marchés financiers. Je scrute en continu comment l'innovation matérielle et logicielle bouleverse les dynamiques industrielles, les valorisations et les modèles économiques mondiaux.",
    en: {
      t: "Tech, Markets & Finance",
      d: "Deeply interested in tech news, semiconductors, AI breakthroughs and financial markets. Constantly tracking how hardware and software disruption reshapes industrial value chains, company valuations and global economics."
    }
  },
];

type Dest = { key: string; name: string; cities: string; theme: string; title: string; text: string; pts: [number, number][] };
const DESTS: Loc<Dest>[] = [
  { key: "france", name: "France", cities: "Paris · Lyon · Provence", theme: "Savoir-faire & microélectronique", title: "L'excellence industrielle et les terroirs d'innovation", text: "Des Mines Saint-Étienne en Provence aux pôles technologiques de Lyon et Paris, la France m'a forgé le sens de la rigueur scientifique et du détail bien pensé.", pts: [[48.8566, 2.3522], [45.764, 4.8357], [43.455, 5.47]], en: { theme: "Craftsmanship & microelectronics", title: "Industrial excellence and homegrown innovation", text: "From Mines Saint-Étienne in Provence to the tech hubs of Lyon and Paris, France shaped my sense of scientific rigor and well-considered detail." } },
  { key: "italy", name: "Italie", cities: "Milan", theme: "Design & matériaux", title: "Le temple du design industriel", text: "Mon semestre au Politecnico di Milano : chaque matériau, chaque rayon de courbure, chaque texture a une raison d'être, au service de l'émotion et de l'usage.", pts: [[45.4642, 9.19]], en: { name: "Italy", theme: "Design & materials", title: "The temple of industrial design", text: "My semester at Politecnico di Milano: every material, every curve radius, every texture has a reason to exist, in service of emotion and use." } },
  { key: "uk", name: "Royaume-Uni", cities: "Londres", theme: "Design de services", title: "L'avant-garde du design de services", text: "Tradition institutionnelle, modernité architecturale, effervescence internationale : un terrain unique pour penser l'accessibilité et l'expérience.", pts: [[51.5074, -0.1278]], en: { name: "United Kingdom", cities: "London", theme: "Service design", title: "The vanguard of service design", text: "Institutional tradition, architectural modernity, international energy: a unique ground for thinking about accessibility and experience." } },
  { key: "spain", name: "Espagne", cities: "Barcelone · Madrid", theme: "Architecture organique", title: "L'audace des formes organiques", text: "De Gaudí aux places madrilènes, l'Espagne conçoit des espaces qui invitent au partage. La technologie doit rassembler.", pts: [[41.3851, 2.1734], [40.4168, -3.7038]], en: { name: "Spain", cities: "Barcelona · Madrid", theme: "Organic architecture", title: "The boldness of organic forms", text: "From Gaudí to Madrid's plazas, Spain designs spaces that invite sharing. Technology should bring people together." } },
  { key: "nyc", name: "États-Unis", cities: "New York", theme: "Consumer tech & flux", title: "La verticalité et le flux urbain", text: "Une masterclass sur la densité et l'adoption technologique au quotidien, dans un environnement ultra-rapide.", pts: [[40.7128, -74.006]], en: { name: "United States", theme: "Consumer tech & flow", title: "Verticality and urban flow", text: "A masterclass in density and everyday technology adoption, in an ultra-fast environment." } },
  { key: "egypt", name: "Égypte", cities: "Le Caire · Louxor", theme: "Architecture & proportions", title: "La monumentalité millénaire", text: "Gizeh et Louxor rappellent que les plus grands accomplissements d'ingénierie allient rigueur géométrique, pérennité et intention.", pts: [[30.0444, 31.2357], [25.6872, 32.6396]], en: { name: "Egypt", cities: "Cairo · Luxor", theme: "Architecture & proportion", title: "Millennia-old monumentality", text: "Giza and Luxor are a reminder that the greatest engineering feats combine geometric rigor, durability and intent." } },
];

const toRad = (d: number) => (d * Math.PI) / 180;
const hexToRgb = (h: string): [number, number, number] => {
  const m = h.trim().replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function Globe({ activeKey }: { activeKey: string }) {
  const active = DESTS.find((d) => d.key === activeKey)!;
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef<{ phi: number; theta: number } | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = canvas.current!;
    let phi = 0, theta = 0.25, width = 0, raf = 0, last = performance.now();
    const accent = () => hexToRgb(getComputedStyle(document.documentElement).getPropertyValue("--color-signal") || "#FF4D00");
    const markers = () => DESTS.flatMap((d) => d.pts.map((p) => ({ location: p, size: d.key === activeRef.current.key ? 0.09 : 0.045, color: d.key === activeRef.current.key ? accent() : ([0.07, 0.07, 0.07] as [number, number, number]) })));
    const resize = () => { width = el.offsetWidth; };
    resize();
    window.addEventListener("resize", resize);

    const globe = createGlobe(el, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2), width: width * 2, height: width * 2,
      phi, theta, dark: 0, diffuse: 1.1, mapSamples: 18000, mapBrightness: 5, mapBaseBrightness: 0.05,
      baseColor: [0.94, 0.93, 0.9], markerColor: accent(), glowColor: [0.94, 0.93, 0.9], markers: markers(), opacity: 0.95,
    });

    // cobe v2 n'a plus de onRender : on pilote nous-mêmes la rotation
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      if (target.current) {
        phi += (target.current.phi - phi) * 0.06;
        theta += (target.current.theta - theta) * 0.06;
        if (Math.abs(target.current.phi - phi) < 0.002) target.current = null;
      } else if (!drag.current) phi += dt * 0.25;
      globe.update({ phi, theta, width: width * 2, height: width * 2, markers: markers() });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    requestAnimationFrame(() => (el.style.opacity = "1"));

    (el as HTMLCanvasElement & { _focus?: (lat: number, lng: number) => void })._focus = (lat, lng) => {
      const goal = -Math.PI / 2 - toRad(lng);
      const k = Math.round((phi - goal) / (2 * Math.PI));
      target.current = { phi: goal + k * 2 * Math.PI, theta: toRad(lat) * 0.8 };
    };
    // glisser : écouteurs sur window pour ne jamais perdre le geste, + inertie au relâché
    let vel = 0;
    const down = (e: PointerEvent) => { e.preventDefault(); drag.current = { x: e.clientX, y: e.clientY }; target.current = null; vel = 0; };
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = (e.clientX - drag.current.x) / 160;
      phi += dx; vel = dx;
      theta = Math.max(-0.6, Math.min(0.9, theta + (e.clientY - drag.current.y) / 300));
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      const glide = () => { if (drag.current || Math.abs(vel) < 0.0005) return; phi += vel; vel *= 0.92; requestAnimationFrame(glide); };
      glide();
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    return () => { cancelAnimationFrame(raf); globe.destroy(); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, []);

  useEffect(() => {
    const el = canvas.current as (HTMLCanvasElement & { _focus?: (a: number, b: number) => void }) | null;
    el?._focus?.(active.pts[0][0], active.pts[0][1]);
  }, [activeKey]);

  return <canvas ref={canvas} className="aspect-square w-full cursor-grab touch-none select-none opacity-0 transition-opacity duration-1000 active:cursor-grabbing" />;
}

export default function Passions({ Label }: { Label: (p: { children: React.ReactNode; className?: string }) => React.ReactElement }) {
  const { lang, tr } = useLang();
  const [destKey, setDest] = useState(DESTS[1].key);
  const dests = useMemo(() => DESTS.map((d) => loc(d, lang)), [lang]);
  const dest = dests.find((d) => d.key === destKey)!;
  return (
    <>
      <div className="grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
        {PASSIONS.map((raw) => loc(raw, lang)).map((p, i) => (
          <motion.article key={p.k} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: i * 0.08 }} className="group bg-paper p-8 flex flex-col justify-between">
            <div>
              <Label className="text-signal">0{i + 1} · {p.k}</Label>
              <h3 className="mt-6 font-serif text-3xl italic">{p.t}</h3>
              <p className="mt-4 leading-relaxed text-mute text-sm">{p.d}</p>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Séparation éditoriale et introduction aux voyages */}
      <div className="mt-20 border-t border-ink/15 pt-14">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-signal" />
            <Label className="text-signal">{tr("06.B · Mobilités & Cultures", "06.B · Mobility & Cultures")}</Label>
          </div>
          <h3 className="mt-4 font-serif text-3xl italic tracking-tight sm:text-4xl text-ink">
            {tr("Voyager, s'ouvrir aux cultures & observer le monde.", "Traveling, exploring cultures & observing the world.")}
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-mute sm:text-base">
            {tr(
              "J'ai eu l'opportunité de voyager dès le plus jeune âge, que ce soit en famille ou en autonomie pour mes études, stages et mobilités internationales (comme mon semestre académique à Milan). Découvrir d'autres cultures, comprendre comment d'autres sociétés pensent leurs villes, leurs objets du quotidien et leur technologie est une source d'inspiration permanente. La carte interactive ci-dessous retrace ces escales marquantes et permettra bientôt de découvrir mes photos personnelles et résumés de terrain.",
              "I have been fortunate to travel from an early age—both with family and independently for academic exchanges (such as my semester at Politecnico di Milano) and internships. Exploring new cultures, understanding how different societies design their cities, everyday products and technologies is a constant source of inspiration. The interactive map below retraces these key journeys and will soon feature personal photography and field notes."
            )}
          </p>
        </div>
      </div>

      <div className="mt-10 grid items-center gap-10 bg-paper pt-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-[520px]">
          <Globe activeKey={dest.key} />
          <div className="glass absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-signal" />{dest.name} · {dest.cities}
          </div>
          <Label className="absolute right-0 bottom-0">{tr("Glisser pour tourner", "Drag to rotate")} · {DESTS.length} {tr("pays", "countries")}</Label>
        </div>
        <div>
          <Label>{tr("04 · Voyages — Carnet de route", "04 · Travel — Field notes")}</Label>
          <div className="mt-6 flex flex-wrap gap-1" role="tablist">
            {dests.map((d) => (
              <button key={d.key} role="tab" aria-selected={dest.key === d.key} onClick={() => setDest(d.key)} className="relative px-3 py-1.5 text-sm font-medium">
                {dest.key === d.key && <motion.span layoutId="dest" className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className={`relative ${dest.key === d.key ? "text-paper" : ""}`}>{d.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-ink/30 bg-ink/[0.02] p-7 md:p-8">
            <span className="font-mono text-[10px] uppercase tracking-wider text-signal bg-signal/10 px-2 py-0.5 rounded border border-signal/20">
              {tr("Section en construction", "Under construction")}
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              {dest.name} · {dest.cities}
            </h3>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-mute">
              {tr(
                "Cette partie du site est en cours de finalisation ! Je vais très bientôt la mettre à jour avec mes propres photographies, carnets de route et inspirations glanées au fil de mes voyages.",
                "This section is currently under construction! I will soon be updating it with my own photography, travel journals and design insights gathered across the globe."
              )}
            </p>
            <div className="mt-6 flex items-center gap-2 font-mono text-[11px] text-mute">
              <span className="size-2 rounded-full bg-signal animate-ping" />
              <span>{tr("Mise à jour prochaine avec galerie photo", "Upcoming update with photo gallery")}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
