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
  const rx = useSpring(useTransform(my, [-1, 1], [3, -3]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-3, 3]), { stiffness: 140, damping: 22 });

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
    <div className="relative w-full select-none flex items-center justify-center translate-x-4 sm:translate-x-8 md:translate-x-12 lg:translate-x-16">
      {/* CONTENEUR DU TRIO (DÉCALÉ VERS LA DROITE) */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[450px] sm:h-[500px] md:h-[540px] w-full max-w-[620px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. GAUCHE : LE VOLANT F1 CARBONE (TAILLE RÉDUITE COMPACTE) */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: f1X }}
          initial={{ opacity: 0, x: -25, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.04, rotateZ: -3, zIndex: 40 }}
          className="absolute -left-8 sm:-left-14 md:-left-20 bottom-4 sm:bottom-8 z-20 w-[130px] sm:w-[155px] md:w-[175px] -rotate-6 cursor-pointer"
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
          className="absolute -right-8 sm:-right-14 md:-right-20 top-4 sm:top-8 z-15 w-[130px] sm:w-[155px] md:w-[175px] aspect-square flex items-center justify-center cursor-pointer"
        >
          {useRealisticWafer ? (
            <PhotorealisticWafer />
          ) : (
            <SiliconWafer onColorChange={onColorChange} standalone={true} />
          )}
        </motion.div>

        {/* ========================================================== */}
        {/* 3. PREMIER PLAN CENTRAL : LA PHOTO D'ARTHUR EN GRAND       */}
        {/*    (COINS ARRONDIS SOIGNÉS, ENVERGURE MAXIMALE)            */}
        {/* ========================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.02, zIndex: 50 }}
          className="relative z-30 w-[260px] sm:w-[310px] md:w-[350px] lg:w-[380px] cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_25px_65px_rgba(0,0,0,0.36)] transition-shadow duration-300 hover:shadow-[0_35px_80px_rgba(0,0,0,0.5)]"
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
