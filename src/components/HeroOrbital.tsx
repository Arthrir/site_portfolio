import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import VaporChamber from "./VaporChamber";
import { Sparkles, Flame, User } from "lucide-react";
import { useLang } from "../i18n";

interface HeroOrbitalProps {
  onColorChange?: (color: string) => void;
}

export default function HeroOrbital({ onColorChange }: HeroOrbitalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tr } = useLang();

  // Mouvements 3D parallax fluides
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 140, damping: 20 });

  // Parallax différencié pour chaque élément de l'orbite
  const waferX = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 180, damping: 22 });
  const waferY = useSpring(useTransform(my, [-1, 1], [-8, 8]), { stiffness: 180, damping: 22 });

  const vaporX = useSpring(useTransform(mx, [-1, 1], [18, -18]), { stiffness: 160, damping: 20 });
  const vaporY = useSpring(useTransform(my, [-1, 1], [14, -14]), { stiffness: 160, damping: 20 });

  const photoX = useSpring(useTransform(mx, [-1, 1], [-22, 22]), { stiffness: 160, damping: 20 });
  const photoY = useSpring(useTransform(my, [-1, 1], [-18, 18]), { stiffness: 160, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="relative w-full select-none flex flex-col items-center">
      {/* En-tête discret */}
      <div className="mb-2 flex items-center justify-between w-full max-w-[460px] px-3 font-mono text-[10px] text-mute uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-ink font-semibold">
          <span className="size-2 rounded-full bg-signal animate-pulse" />
          <span>COMPOSITION ORBITALE (SILICIUM · CUIVRE · PORTRAIT)</span>
        </span>
      </div>

      {/* ZONE DE COMPOSITION ORBITALE LIBRE (SANS AUCUN CADRE RESTRICTIF) */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[480px] sm:h-[520px] w-full max-w-[480px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. PIÈCE MAÎTRESSE CENTRALE : LE GRAND WAFER ROND 300mm     */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX, y: waferY }}
          className="relative z-10 w-[330px] sm:w-[380px] aspect-square flex items-center justify-center drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]"
        >
          <SiliconWafer onColorChange={onColorChange} />
        </motion.div>

        {/* ========================================================== */}
        {/* 2. SATELLITE HAUT-DROIT : LA VAPOR CHAMBER EN CUIVRE       */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: vaporX, y: vaporY }}
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          whileHover={{ scale: 1.06, rotateZ: 4, zIndex: 40 }}
          className="absolute -top-6 -right-4 sm:-top-8 sm:-right-8 z-20 w-[190px] sm:w-[230px] cursor-pointer"
        >
          <div className="rounded-2xl p-1 bg-ink/75 backdrop-blur-md shadow-[0_20px_40px_rgba(217,119,6,0.35)] border border-amber-500/40">
            <VaporChamber />
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* 3. SATELLITE BAS-GAUCHE : LA PHOTO COULEUR D'ARTHUR        */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: photoX, y: photoY }}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          whileHover={{ scale: 1.06, rotateZ: -3, zIndex: 40 }}
          className="absolute -bottom-6 -left-3 sm:-bottom-8 sm:-left-6 z-20 w-[125px] sm:w-[145px] cursor-pointer rounded-2xl bg-white p-2 shadow-[0_25px_50px_rgba(0,0,0,0.35)] border border-ink/20 transition-shadow hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        >
          <div className="aspect-[4/5] w-full rounded-xl overflow-hidden shadow-inner bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="mt-1.5 px-0.5 flex justify-between items-center font-mono text-[8px] text-mute uppercase">
            <span className="font-semibold text-ink">A. Doradoux</span>
            <span className="text-signal font-bold">ISMIN</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Légende basse */}
      <p className="mt-2 font-mono text-[9.5px] text-mute text-center">
        Composition libre en orbite 3D · Survolez et cliquez pour interagir avec les éléments
      </p>
    </div>
  );
}
