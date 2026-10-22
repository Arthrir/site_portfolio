import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import PhotorealisticWafer from "./PhotorealisticWafer";
import F1Wheel from "./F1Wheel";
import ProductDevice from "./ProductDevice";

interface HeroConstellationProps {
  onColorChange?: (color: string) => void;
  useRealisticWafer?: boolean;
}

export default function HeroConstellation({
  onColorChange,
  useRealisticWafer = true,
}: HeroConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe 3D d'ensemble
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 140, damping: 22 });

  // Flottements en profondeur distincts selon les strates d'éléments
  const f1X = useSpring(useTransform(mx, [-1, 1], [-8, 4]), { stiffness: 120, damping: 20 });
  const waferX = useSpring(useTransform(mx, [-1, 1], [-4, 8]), { stiffness: 120, damping: 20 });
  const productY = useSpring(useTransform(my, [-1, 1], [-6, 6]), { stiffness: 110, damping: 22 });

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
      {/* CONTENEUR COMPACT DE LA CONSTELLATION D'INGÉNIERIE */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[380px] sm:h-[420px] md:h-[450px] w-full max-w-[520px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. HAUT-DROITE : OBJET PRODUIT / TECH MANAGER              */}
        {/*    (Device Prototypage CNC / Chronomètre Titane)           */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: productY }}
          initial={{ opacity: 0, y: -20, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          whileHover={{ scale: 1.08, rotateZ: 4, zIndex: 40 }}
          className="absolute -top-3 right-1 sm:-top-5 sm:right-4 z-20 w-[115px] sm:w-[135px] md:w-[150px] rotate-6 cursor-pointer"
        >
          <ProductDevice />
        </motion.div>

        {/* ========================================================== */}
        {/* 2. CENTRE-GAUCHE : LE VOLANT F1 CARBONE (TAILLE RÉDUITE)   */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: f1X }}
          initial={{ opacity: 0, x: -25, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.06, rotateZ: -3, zIndex: 40 }}
          className="absolute -left-3 sm:-left-6 md:-left-8 z-20 w-[135px] sm:w-[160px] md:w-[180px] -rotate-6 cursor-pointer"
        >
          <F1Wheel />
        </motion.div>

        {/* ========================================================== */}
        {/* 3. CENTRE-DROITE : LE GRAND WAFER SILICIUM (TAILLE RÉDUITE)*/}
        {/*    SANS AUCUN CONTOUR BLANC                                */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX }}
          initial={{ opacity: 0, x: 25, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          whileHover={{ scale: 1.06, zIndex: 40 }}
          className="absolute -right-3 sm:-right-6 md:-right-8 z-15 w-[135px] sm:w-[160px] md:w-[180px] aspect-square flex items-center justify-center cursor-pointer"
        >
          {useRealisticWafer ? (
            <PhotorealisticWafer />
          ) : (
            <SiliconWafer onColorChange={onColorChange} standalone={true} />
          )}
        </motion.div>

        {/* ========================================================== */}
        {/* 4. PREMIER PLAN CENTRAL : LA PHOTO D'ARTHUR (COINS ARRONDIS)*/}
        {/* ========================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.03, zIndex: 50 }}
          className="relative z-30 w-[185px] sm:w-[215px] md:w-[235px] cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.32)] transition-shadow duration-300 hover:shadow-[0_28px_65px_rgba(0,0,0,0.45)]"
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
