import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { MapPin, Calendar, Award, CheckCircle2 } from "lucide-react";

interface HeroPortraitProps {
  onColorChange?: (color: string) => void;
}

export default function HeroPortrait({ onColorChange }: HeroPortraitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 140, damping: 20 });
  const { tr } = useLang();

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[420px] select-none [perspective:1200px] mx-auto">
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry }}
        className="group relative w-full [transform-style:preserve-3d]"
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
        {/* Masking-tape d'ingénieur semi-translucide au sommet */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-amber-100/70 border border-amber-300/40 backdrop-blur-xs shadow-xs rotate-[-1.5deg] z-30 pointer-events-none" />

        {/* CADRE PHOTO POLAROID BARYTÉ EN MAJESTÉ */}
        <motion.div
          initial={{ rotate: -2.5 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative rounded-2xl bg-[#FFFFFF] p-4 pb-5 shadow-[0_25px_60px_-15px_rgba(18,18,17,0.22),0_10px_20px_-5px_rgba(18,18,17,0.1)] border border-black/10 ring-1 ring-black/5"
        >
          {/* Surface de la photo argentique */}
          <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-xl bg-ink/5 shadow-inner">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="h-full w-full object-cover object-top grayscale contrast-[1.05] transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105"
              loading="eager"
            />
            {/* Liseré d'ombre interne photo */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.15)] rounded-xl" />

            {/* Pastille Live d'état */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/75 px-3 py-1 font-mono text-[10px] text-white backdrop-blur-md border border-white/20">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{tr("En recherche active", "Actively seeking")}</span>
            </div>
          </div>

          {/* Légende du Polaroid */}
          <div className="mt-3.5 px-1">
            <div className="flex items-baseline justify-between">
              <h3 className="font-serif text-2xl font-normal tracking-tight text-ink">
                Arthur Doradoux
              </h3>
              <span className="font-mono text-[11px] text-signal font-semibold tracking-wider">
                2026—2027
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-mute leading-snug">
              {tr(
                "Mines Saint-Étienne × Politecnico di Milano",
                "Mines Saint-Étienne × Politecnico di Milano"
              )}
            </p>
          </div>

          {/* 2 Cartouches techniques d'excellence sous la photo */}
          <div className="mt-3.5 pt-3 border-t border-ink/10 grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 rounded-lg bg-ink/[0.03] p-2 border border-ink/5">
              <Award className="size-3.5 text-signal shrink-0" />
              <div className="leading-tight">
                <span className="text-[9px] text-mute block">CURSUS</span>
                <span className="font-semibold text-ink">Double Diplôme</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-ink/[0.03] p-2 border border-ink/5">
              <Calendar className="size-3.5 text-emerald-600 shrink-0" />
              <div className="leading-tight">
                <span className="text-[9px] text-mute block">DISPONIBILITÉ</span>
                <span className="font-semibold text-ink">Avril 2027 (5+ m)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Note sous le cadre */}
        <div className="mt-3 text-center font-mono text-[10px] text-mute">
          <span>{tr("Photo authentique · Survoler pour la couleur", "Authentic photo · Hover for color")}</span>
        </div>
      </motion.div>
    </div>
  );
}
