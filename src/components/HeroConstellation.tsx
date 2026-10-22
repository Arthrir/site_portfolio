import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import F1Wheel from "./F1Wheel";
import WatercoolingBlock from "./WatercoolingBlock";
import IndustrialModule from "./IndustrialModule";
import SiliconDie from "./SiliconDie";

interface HeroConstellationProps {
  onColorChange?: (color: string) => void;
  cornerStyle?: "rounded" | "sharp";
}

export default function HeroConstellation({
  onColorChange,
  cornerStyle = "rounded",
}: HeroConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe 3D d'ensemble
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [5, -5]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-5, 5]), { stiffness: 140, damping: 22 });

  // Flottements en profondeur distincts selon les strates d'éléments
  const f1X = useSpring(useTransform(mx, [-1, 1], [-12, 6]), { stiffness: 120, damping: 20 });
  const waferX = useSpring(useTransform(mx, [-1, 1], [-6, 12]), { stiffness: 120, damping: 20 });
  const topY = useSpring(useTransform(my, [-1, 1], [-8, 6]), { stiffness: 110, damping: 22 });
  const bottomY = useSpring(useTransform(my, [-1, 1], [-4, 8]), { stiffness: 110, damping: 22 });

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
    <div className="relative w-full select-none flex items-center justify-center py-6">
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[520px] sm:h-[560px] w-full max-w-[680px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* HAUT-GAUCHE : MODULE AUDIO / DESIGN INDUSTRIEL ALU MILANO  */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: topY }}
          initial={{ opacity: 0, y: -25, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          whileHover={{ scale: 1.08, rotateZ: -4, zIndex: 40 }}
          className="absolute -top-4 left-0 sm:-top-8 sm:left-4 z-10 w-[170px] sm:w-[210px] -rotate-6 cursor-pointer drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
        >
          <IndustrialModule />
        </motion.div>

        {/* ========================================================== */}
        {/* HAUT-DROITE : WATERCOOLING CNC EN CUIVRE MASSIF & PLEXI    */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: topY }}
          initial={{ opacity: 0, y: -25, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          whileHover={{ scale: 1.08, rotateZ: 5, zIndex: 40 }}
          className="absolute -top-6 right-0 sm:-top-10 sm:right-4 z-10 w-[180px] sm:w-[220px] rotate-6 cursor-pointer drop-shadow-[0_18px_35px_rgba(180,83,9,0.3)]"
        >
          <WatercoolingBlock />
        </motion.div>

        {/* ========================================================== */}
        {/* CENTRE-GAUCHE : LE VOLANT F1 CARBONE PHOTORÉALISTE        */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: f1X }}
          initial={{ opacity: 0, x: -35, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.06, rotateZ: -4, zIndex: 40 }}
          className="absolute -left-6 sm:-left-10 md:-left-12 z-20 w-[215px] sm:w-[260px] md:w-[285px] -rotate-6 cursor-pointer"
        >
          <F1Wheel />
        </motion.div>

        {/* ========================================================== */}
        {/* CENTRE-DROITE : LE GRAND WAFER SILICIUM 300mm PUR          */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX }}
          initial={{ opacity: 0, x: 35, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          whileHover={{ scale: 1.06, zIndex: 40 }}
          className="absolute -right-6 sm:-right-10 md:-right-12 z-20 w-[220px] sm:w-[260px] md:w-[285px] aspect-square flex items-center justify-center cursor-pointer drop-shadow-[0_25px_55px_rgba(0,0,0,0.35)]"
        >
          <SiliconWafer onColorChange={onColorChange} standalone={true} />
        </motion.div>

        {/* ========================================================== */}
        {/* BAS-GAUCHE : LE PROCESSEUR / DIE SILICIUM MIROIR OR        */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: bottomY }}
          initial={{ opacity: 0, y: 25, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          whileHover={{ scale: 1.1, rotateZ: -3, zIndex: 45 }}
          className="absolute -bottom-4 left-6 sm:-bottom-8 sm:left-14 z-25 w-[110px] sm:w-[135px] -rotate-3 cursor-pointer drop-shadow-[0_18px_30px_rgba(212,175,55,0.35)]"
        >
          <SiliconDie />
        </motion.div>

        {/* ========================================================== */}
        {/* PREMIER PLAN CENTRAL : LA PHOTO D'ARTHUR EN GRAND         */}
        {/* ========================================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.03, zIndex: 50 }}
          className={`relative z-30 w-[230px] sm:w-[275px] md:w-[305px] cursor-pointer overflow-hidden shadow-[0_28px_65px_rgba(0,0,0,0.38)] transition-shadow duration-300 hover:shadow-[0_35px_80px_rgba(0,0,0,0.5)] ${
            cornerStyle === "rounded" ? "rounded-2xl sm:rounded-3xl" : "rounded-none"
          }`}
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

