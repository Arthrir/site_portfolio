import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface VaporChamberProps {
  interactive?: boolean;
}

export default function VaporChamber({ interactive = true }: VaporChamberProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouvement 3D réactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 180, damping: 20 });

  const glareX = useSpring(useTransform(mx, [-1, 1], [10, 90]), { stiffness: 150, damping: 22 });
  const glareY = useSpring(useTransform(my, [-1, 1], [10, 90]), { stiffness: 150, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = cardRef.current?.getBoundingClientRect();
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
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="relative select-none aspect-[16/10] w-full flex items-center justify-center cursor-pointer drop-shadow-[0_18px_35px_rgba(180,83,9,0.4)]"
    >
      <div className="relative size-full flex items-center justify-center">
        <img
          src="/assets/vapor-chamber.png"
          alt="Chambre à Vapeur Cuivre Photoréaliste"
          className="size-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105"
          draggable={false}
        />

        {/* Reflet spéculaire métallique cuivre chaud au survol */}
        <motion.div
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(254,215,170,0.35) 0%, rgba(217,119,6,0.18) 35%, transparent 65%)`
            ),
            opacity: isHovered ? 1 : 0,
          }}
          className="absolute inset-2 rounded-2xl pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
        />
      </div>
    </motion.div>
  );
}

