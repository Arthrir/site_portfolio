import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import F1Wheel from "./F1Wheel";
import IndustrialModule from "./IndustrialModule";

interface HeroTrioProps {
  onColorChange?: (color: string) => void;
  cornerStyle?: "rounded" | "sharp"; // "rounded" = coins arrondis, "sharp" = coins droits
  leftItem?: "f1" | "industrial";    // "f1" = Volant F1 carbone, "industrial" = Contrôleur alu CNC
}

export default function HeroTrio({
  onColorChange,
  cornerStyle = "rounded",
  leftItem = "f1",
}: HeroTrioProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallaxe 3D subtile et réactive à la souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 140, damping: 22 });

  // Séparation physique en profondeur
  const leftX = useSpring(useTransform(mx, [-1, 1], [-10, 6]), { stiffness: 120, damping: 20 });
  const rightX = useSpring(useTransform(mx, [-1, 1], [-6, 10]), { stiffness: 120, damping: 20 });
  const photoY = useSpring(useTransform(my, [-1, 1], [-5, 5]), { stiffness: 120, damping: 20 });

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
      {/* CONTENEUR DE LA COMPOSITION TRIO FIXE */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[440px] sm:h-[480px] w-full max-w-[620px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. ÉLÉMENT GAUCHE : PRODUIT PASSION (F1 OU DESIGN MILANO)  */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: leftX }}
          initial={{ opacity: 0, x: -35, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          whileHover={{ scale: 1.05, rotateZ: -5, zIndex: 40 }}
          className="absolute -left-6 sm:-left-10 md:-left-12 z-10 w-[210px] sm:w-[250px] md:w-[275px] -rotate-6 cursor-pointer"
        >
          {leftItem === "f1" ? <F1Wheel /> : <IndustrialModule />}
        </motion.div>

        {/* ========================================================== */}
        {/* 2. ÉLÉMENT CENTRAL : PHOTO D'ARTHUR (AGRANDIE, SANS CADRE)  */}
        {/* ========================================================== */}
        <motion.div
          style={{ y: photoY }}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          whileHover={{ scale: 1.04, zIndex: 50 }}
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

        {/* ========================================================== */}
        {/* 3. ÉLÉMENT DROITE : WAFER 300mm ALLÉGÉ SANS BORD NOIR      */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: rightX }}
          initial={{ opacity: 0, x: 35, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          whileHover={{ scale: 1.05, zIndex: 40 }}
          className="absolute -right-6 sm:-right-10 md:-right-12 z-20 w-[220px] sm:w-[260px] md:w-[285px] aspect-square flex items-center justify-center cursor-pointer drop-shadow-[0_25px_55px_rgba(0,0,0,0.4)]"
        >
          <SiliconWafer onColorChange={onColorChange} standalone={true} />
        </motion.div>
      </motion.div>
    </div>
  );
}
