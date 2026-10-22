import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import VaporChamber from "./VaporChamber";

interface HeroOrbitalProps {
  onColorChange?: (color: string) => void;
}

export default function HeroOrbital({ onColorChange }: HeroOrbitalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="relative w-full select-none flex items-center justify-center">
      {/* ZONE DE COMPOSITION ORBITALE LIBRE : AUCUN CADRE, AUCUN TEXTE AUTOUR */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[440px] sm:h-[480px] w-full max-w-[520px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* 1. PIÈCE MAÎTRESSE CENTRALE : LE GRAND WAFER ROND 300mm     */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX, y: waferY }}
          className="relative z-10 w-[300px] sm:w-[350px] aspect-square flex items-center justify-center drop-shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
        >
          <SiliconWafer onColorChange={onColorChange} standalone={true} />
        </motion.div>

        {/* ========================================================== */}
        {/* 2. SATELLITE HAUT-DROIT : LA VAPOR CHAMBER EN CUIVRE       */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: vaporX, y: vaporY }}
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          whileHover={{ scale: 1.08, rotateZ: 5, zIndex: 40 }}
          className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 z-20 w-[180px] sm:w-[220px] cursor-pointer drop-shadow-[0_20px_40px_rgba(217,119,6,0.35)]"
        >
          <VaporChamber showBadge={false} />
        </motion.div>

        {/* ========================================================== */}
        {/* 3. SATELLITE BAS-GAUCHE : LA PHOTO COULEUR NATURELLE       */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: photoX, y: photoY }}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          whileHover={{ scale: 1.08, rotateZ: -4, zIndex: 40 }}
          className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-4 z-20 w-[125px] sm:w-[150px] cursor-pointer rounded-2xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
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
