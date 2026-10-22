import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import PhotorealisticWafer from "./PhotorealisticWafer";
import F1Wheel from "./F1Wheel";
import VaporChamber from "./VaporChamber";
import SiliconDie from "./SiliconDie";

interface HeroConstellationProps {
  onColorChange?: (color: string) => void;
  useRealisticWafer?: boolean; // false = canvas wafer interactif, true = wafer studio photoréaliste avec shimmer
}

export default function HeroConstellation({
  onColorChange,
  useRealisticWafer = false,
}: HeroConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe 3D d'ensemble
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 140, damping: 22 });

  // Flottements en profondeur distincts selon les strates d'éléments
  const f1X = useSpring(useTransform(mx, [-1, 1], [-10, 5]), { stiffness: 120, damping: 20 });
  const waferX = useSpring(useTransform(mx, [-1, 1], [-5, 10]), { stiffness: 120, damping: 20 });
  const topY = useSpring(useTransform(my, [-1, 1], [-6, 5]), { stiffness: 110, damping: 22 });
  const bottomY = useSpring(useTransform(my, [-1, 1], [-3, 6]), { stiffness: 110, damping: 22 });

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
      {/* CONTENEUR COMPACT DE LA CONSTELLATION D'INGÉNIERIE (ÉCHELLE RÉDUITE) */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[410px] sm:h-[450px] md:h-[470px] w-full max-w-[560px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. HAUT-DROITE : VAPOR CHAMBER CUIVRE MASSIF PHOTORÉALISTE  */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: topY }}
          initial={{ opacity: 0, y: -20, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          whileHover={{ scale: 1.08, rotateZ: 5, zIndex: 40 }}
          className="absolute -top-4 right-2 sm:-top-6 sm:right-6 z-10 w-[145px] sm:w-[170px] md:w-[190px] rotate-6 cursor-pointer drop-shadow-[0_15px_30px_rgba(180,83,9,0.35)]"
        >
          <VaporChamber />
        </motion.div>

        {/* ========================================================== */}
        {/* 2. CENTRE-GAUCHE : LE VOLANT F1 CARBONE PHOTORÉALISTE      */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: f1X }}
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.06, rotateZ: -4, zIndex: 40 }}
          className="absolute -left-4 sm:-left-8 md:-left-10 z-20 w-[175px] sm:w-[210px] md:w-[230px] -rotate-6 cursor-pointer"
        >
          <F1Wheel />
        </motion.div>

        {/* ========================================================== */}
        {/* 3. CENTRE-DROITE : LE GRAND WAFER SILICIUM 300mm           */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX }}
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          whileHover={{ scale: 1.06, zIndex: 40 }}
          className="absolute -right-4 sm:-right-8 md:-right-10 z-20 w-[180px] sm:w-[215px] md:w-[235px] aspect-square flex items-center justify-center cursor-pointer drop-shadow-[0_22px_45px_rgba(0,0,0,0.35)]"
        >
          {useRealisticWafer ? (
            <PhotorealisticWafer />
          ) : (
            <SiliconWafer onColorChange={onColorChange} standalone={true} />
          )}
        </motion.div>

        {/* ========================================================== */}
        {/* 4. BAS-GAUCHE : LE MICROPROCESSEUR / DIE SILICIUM MIROIR OR*/}
        {/* ========================================================== */}
        <motion.div
          style={{ y: bottomY }}
          initial={{ opacity: 0, y: 20, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          whileHover={{ scale: 1.1, rotateZ: -3, zIndex: 45 }}
          className="absolute -bottom-3 left-8 sm:-bottom-5 sm:left-14 z-25 w-[90px] sm:w-[110px] md:w-[120px] -rotate-3 cursor-pointer drop-shadow-[0_16px_28px_rgba(212,175,55,0.35)]"
        >
          <SiliconDie />
        </motion.div>

        {/* ========================================================== */}
        {/* 5. PREMIER PLAN CENTRAL : LA PHOTO D'ARTHUR (COINS ARRONDIS)*/}
        {/* ========================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.03, zIndex: 50 }}
          className="relative z-30 w-[190px] sm:w-[220px] md:w-[245px] cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.38)] transition-shadow duration-300 hover:shadow-[0_32px_75px_rgba(0,0,0,0.5)]"
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

