import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface PhotorealisticWaferProps {
  interactive?: boolean;
}

export default function PhotorealisticWafer({ interactive = true }: PhotorealisticWaferProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouvement 3D interactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 180, damping: 20 });

  // Reflet irisé chromatique en temps réel qui suit le curseur
  const specX = useSpring(useTransform(mx, [-1, 1], [15, 85]), { stiffness: 150, damping: 22 });
  const specY = useSpring(useTransform(my, [-1, 1], [15, 85]), { stiffness: 150, damping: 22 });
  const iridAngle = useTransform(mx, [-1, 1], [-45, 135]);

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
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="relative select-none aspect-square w-full flex items-center justify-center cursor-pointer group"
    >
      {/* OMBRE PORTÉE NATURELLE */}
      <div className="absolute inset-x-2 bottom-0 h-10 bg-black/35 blur-xl rounded-full transform scale-90 pointer-events-none" />

      {/* WAFER 300mm PHOTORÉALISTE SANS AUCUN CONTOUR BLANC (SANS ZOOM AU HOVER) */}
      <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.38)]">
        <img
          src="/assets/silicon-wafer.png"
          alt="Wafer Silicium 300mm SEMI Photorealiste"
          className="size-full object-cover object-center pointer-events-none"
          draggable={false}
        />

        {/* COUCHE 1 : INTERFÉRENCE OPTIQUE IRISÉE CHROMATIQUE RÉACTIVE À LA SOURIS */}
        <motion.div
          style={{
            background: useTransform(
              [specX, specY],
              ([sx, sy]) =>
                `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.4) 0%, rgba(56,189,248,0.25) 25%, rgba(236,72,153,0.2) 50%, rgba(245,158,11,0.15) 70%, transparent 85%)`
            ),
          }}
          className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-300"
        />

        {/* COUCHE 2 : BALAYAGE SPÉCULAIRE LINÉAIRE QUAND LE CURSEUR BOUGE */}
        <motion.div
          style={{
            rotate: iridAngle,
            opacity: isHovered ? 0.35 : 0.15,
          }}
          className="absolute -inset-full pointer-events-none bg-gradient-to-r from-transparent via-white to-transparent mix-blend-overlay transition-opacity duration-500"
        />
      </div>
    </motion.div>
  );
}

