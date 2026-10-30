import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface HeroWaferDuoProps {
  onColorChange?: (color: string) => void;
}

export default function HeroWaferDuo({ onColorChange }: HeroWaferDuoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Parallaxe 3D douce et interactive
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 140, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 140, damping: 22 });

  // Flottements en profondeur distincts entre le wafer en arrière-plan et la photo en avant-plan
  const photoX = useSpring(useTransform(mx, [-1, 1], [-8, 6]), { stiffness: 120, damping: 20 });
  const photoY = useSpring(useTransform(my, [-1, 1], [-6, 6]), { stiffness: 120, damping: 20 });
  const waferX = useSpring(useTransform(mx, [-1, 1], [6, -8]), { stiffness: 100, damping: 24 });
  const waferY = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 100, damping: 24 });

  // Reflet irisé chromatique en temps réel qui suit le curseur sur le wafer
  const specX = useSpring(useTransform(mx, [-1, 1], [15, 85]), { stiffness: 150, damping: 22 });
  const specY = useSpring(useTransform(my, [-1, 1], [15, 85]), { stiffness: 150, damping: 22 });
  const iridAngle = useTransform(mx, [-1, 1], [-45, 135]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(x);
    my.set(y);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  return (
    <div className="relative w-full select-none flex items-center justify-center">
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[580px] h-[480px] sm:h-[540px] md:h-[580px] flex items-center justify-center cursor-pointer"
      >
        {/* ========================================================== */}
        {/* 1. DERRIÈRE : LE GRAND WAFER SILICIUM 300mm                 */}
        {/*    Taille calibrée, dépassant UNIQUEMENT à droite          */}
        {/*    Zéro débordement en bas ni à gauche                     */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: waferX, y: waferY }}
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute z-10 w-[270px] sm:w-[320px] md:w-[370px] lg:w-[410px] aspect-square translate-x-14 sm:translate-x-18 md:translate-x-24 lg:translate-x-28 top-1/2 -translate-y-[58%] pointer-events-none"
        >
          {/* Wafer photoréaliste découpé net, sans contour ni débordement en bas */}
          <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
            <img
              src="/assets/silicon-wafer.png"
              alt="Wafer Silicium 300mm SEMI Photorealiste"
              className="size-full object-cover object-center pointer-events-none"
              draggable={false}
            />

            {/* Couche d'irisation chromatique optique réactive à la souris */}
            <motion.div
              style={{
                background: useTransform(
                  [specX, specY],
                  ([sx, sy]) =>
                    `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.42) 0%, rgba(56,189,248,0.26) 25%, rgba(236,72,153,0.2) 50%, rgba(245,158,11,0.16) 70%, transparent 85%)`
                ),
              }}
              className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-300"
            />

            {/* Balayage spéculaire linéaire dynamique */}
            <motion.div
              style={{
                rotate: iridAngle,
                opacity: isHovered ? 0.35 : 0.15,
              }}
              className="absolute -inset-full pointer-events-none bg-gradient-to-r from-transparent via-white to-transparent mix-blend-overlay transition-opacity duration-500"
            />
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* 2. DEVANT : LA GRANDE PHOTO D'ARTHUR UN PEU TOURNÉE        */}
        {/*    Coins arrondis, légèrement pivotée (-4.5°), en grand   */}
        {/* ========================================================== */}
        <motion.div
          style={{ x: photoX, y: photoY }}
          initial={{ opacity: 0, scale: 0.92, y: 25, rotate: -4.5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: -4.5 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          whileHover={{ scale: 1.025, rotate: -2.5, zIndex: 30 }}
          className="relative z-20 w-[250px] sm:w-[290px] md:w-[330px] lg:w-[360px] aspect-[4/5] -translate-x-8 sm:-translate-x-12 md:-translate-x-16 lg:-translate-x-20 cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_25px_65px_-12px_rgba(0,0,0,0.45)] transition-shadow duration-300 hover:shadow-[0_32px_80px_-10px_rgba(0,0,0,0.55)]"
        >
          <div className="size-full overflow-hidden bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center pointer-events-none"
              draggable={false}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
