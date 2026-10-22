import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import WatercoolingBlock from "./WatercoolingBlock";

interface HeroTrioProps {
  onColorChange?: (color: string) => void;
  hasFrame?: boolean; // true = avec contour épuré, false = sans contour (brut)
}

export default function HeroTrio({ onColorChange, hasFrame = false }: HeroTrioProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe 3D subtile et réactive à la souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 140, damping: 22 });

  // Séparation en profondeur (effet 3D physique)
  const leftX = useSpring(useTransform(mx, [-1, 1], [-12, 6]), { stiffness: 120, damping: 20 });
  const rightX = useSpring(useTransform(mx, [-1, 1], [-6, 12]), { stiffness: 120, damping: 20 });
  const photoY = useSpring(useTransform(my, [-1, 1], [-6, 6]), { stiffness: 120, damping: 20 });

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
    <div className="relative w-full select-none flex items-center justify-center">
      {/* CONTENEUR DE LA COMPOSITION TRIO FIXE (SANS CARROUSEL, SANS ROTATION) */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[440px] sm:h-[480px] w-full max-w-[620px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. ÉLÉMENT GAUCHE : WATERCOOLING CNC EN CUIVRE & ACRYLIQUE */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: leftX }}
          initial={{ opacity: 0, x: -40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          whileHover={{ scale: 1.05, rotateZ: -6, zIndex: 40 }}
          className="absolute -left-6 sm:-left-10 md:-left-12 z-10 w-[210px] sm:w-[250px] md:w-[270px] -rotate-6 cursor-pointer drop-shadow-[0_20px_45px_rgba(180,83,9,0.35)]"
        >
          <WatercoolingBlock />
        </motion.div>

        {/* ========================================================== */}
        {/* 2. ÉLÉMENT CENTRAL : LA PHOTO AGRANDIE D'ARTHUR (DEVANT)    */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: photoY }}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.04, zIndex: 50 }}
          className={`relative z-30 w-[210px] sm:w-[250px] md:w-[280px] cursor-pointer transition-shadow duration-300 ${
            hasFrame
              ? "rounded-2xl bg-white p-2.5 sm:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-ink/15 hover:shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
              : "rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.38)] hover:shadow-[0_32px_75px_rgba(0,0,0,0.5)]"
          }`}
        >
          <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center"
            />
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* 3. ÉLÉMENT DROITE : GRAND WAFER SILICIUM 300mm ROND BRUT   */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: rightX }}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.05, zIndex: 40 }}
          className="absolute -right-6 sm:-right-10 md:-right-12 z-20 w-[240px] sm:w-[290px] md:w-[320px] aspect-square flex items-center justify-center cursor-pointer drop-shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
        >
          <SiliconWafer onColorChange={onColorChange} standalone={true} />
        </motion.div>
      </motion.div>
    </div>
  );
}

