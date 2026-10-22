import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface F1WheelProps {
  interactive?: boolean;
}

export default function F1Wheel({ interactive = true }: F1WheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouvement 3D réactif et ultra-fluide à la souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 180, damping: 20 });

  // Reflet de lumière spéculaire qui glisse sur la fibre de carbone
  const glareX = useSpring(useTransform(mx, [-1, 1], [15, 85]), { stiffness: 150, damping: 22 });
  const glareY = useSpring(useTransform(my, [-1, 1], [15, 85]), { stiffness: 150, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="relative select-none w-full max-w-[340px] aspect-[16/14] flex items-center justify-center cursor-pointer"
    >
      {/* OMBRE PORTÉE ULTRA RÉALISTE */}
      <div className="absolute inset-x-6 bottom-2 h-14 bg-black/40 blur-2xl rounded-full transform scale-90 transition-opacity duration-300 pointer-events-none" />

      {/* VOLANT F1 PHOTORÉALISTE EN FIBRE DE CARBONE */}
      <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
        <img
          src="/assets/f1-wheel.png"
          alt="Volant Formule 1 Carbone & Télémétrie"
          className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />

        {/* REFLET SPÉCULAIRE SUR LA FIBRE DE CARBONE (LORS DU SURVOL) */}
        <motion.div
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(56,189,248,0.10) 30%, transparent 60%)`
            ),
            opacity: isHovered ? 1 : 0,
          }}
          className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-overlay transition-opacity duration-500"
        />
      </div>
    </motion.div>
  );
}

