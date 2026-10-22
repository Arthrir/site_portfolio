import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import PhotorealisticWafer from "./PhotorealisticWafer";
import F1Wheel from "./F1Wheel";

interface HeroConstellationProps {
  onColorChange?: (color: string) => void;
  useRealisticWafer?: boolean;
}

export default function HeroConstellation({
  onColorChange,
  useRealisticWafer = true,
}: HeroConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe 3D d'ensemble réactive à la souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [3.5, -3.5]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-3.5, 3.5]), { stiffness: 140, damping: 22 });

  // Flottements en profondeur distincts selon les strates d'éléments
  const f1X = useSpring(useTransform(mx, [-1, 1], [-8, 4]), { stiffness: 120, damping: 20 });
  const waferX = useSpring(useTransform(mx, [-1, 1], [-4, 8]), { stiffness: 120, damping: 20 });

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
    <div className="relative w-full select-none flex items-center justify-center translate-x-2 sm:translate-x-5 md:translate-x-8 lg:translate-x-12">
      {/* CONTENEUR COMPACT DE LA COMPOSITION (DÉCALÉ VERS LA DROITE) */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[410px] sm:h-[450px] md:h-[480px] w-full max-w-[540px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. GAUCHE : LE VOLANT F1 CARBONE (TAILLE RÉDUITE COMPACTE) */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: f1X }}
          initial={{ opacity: 0, x: -25, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.05, rotateZ: -3, zIndex: 40 }}
          className="absolute -left-6 sm:-left-12 md:-left-16 bottom-6 sm:bottom-10 z-20 w-[130px] sm:w-[155px] md:w-[175px] -rotate-6 cursor-pointer"
        >
          <F1Wheel />
        </motion.div>

        {/* ========================================================== */}
        {/* 2. DROITE : LE GRAND WAFER SILICIUM (AUCUN ZOOM AU HOVER)  */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX }}
          initial={{ opacity: 0, x: 25, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          whileHover={{ zIndex: 40 }}
          className="absolute -right-6 sm:-right-12 md:-right-16 top-6 sm:top-10 z-15 w-[130px] sm:w-[155px] md:w-[175px] aspect-square flex items-center justify-center cursor-pointer"
        >
          {useRealisticWafer ? (
            <PhotorealisticWafer />
          ) : (
            <SiliconWafer onColorChange={onColorChange} standalone={true} />
          )}
        </motion.div>

        {/* ========================================================== */}
        {/* 3. PREMIER PLAN CENTRAL : LA PHOTO D'ARTHUR EN PLUS GRAND   */}
        {/*    (COINS ARRONDIS SOIGNÉS, ENVERGURE AUGMENTÉE)           */}
        {/* ========================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.02, zIndex: 50 }}
          className="relative z-30 w-[220px] sm:w-[260px] md:w-[290px] lg:w-[310px] cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_22px_55px_rgba(0,0,0,0.34)] transition-shadow duration-300 hover:shadow-[0_30px_70px_rgba(0,0,0,0.48)]"
        >
          <div className="aspect-[4/5] w-full overflow-hidden bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
