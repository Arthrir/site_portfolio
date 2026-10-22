import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface SiliconDieProps {
  interactive?: boolean;
}

export default function SiliconDie({ interactive = true }: SiliconDieProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouvement 3D réactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 180, damping: 20 });

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
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="relative select-none w-full max-w-[200px] aspect-square flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(212,175,55,0.3)] cursor-pointer"
    >
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Substrat BGA organique vert foncé / noir stealth */}
          <linearGradient id="dieSubstrate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="40%" stopColor="#022C22" />
            <stop offset="100%" stopColor="#0B132B" />
          </linearGradient>

          {/* Miroir silicium avec reflet or & cuivre champagne */}
          <linearGradient id="siliconMirror" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="75%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>

          {/* Pistes de routage en or pur ENIG */}
          <pattern id="goldTraces" width="16" height="16" patternUnits="userSpaceOnUse">
            <line x1="0" y1="8" x2="16" y2="8" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="8" y1="0" x2="8" y2="16" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4" />
            <circle cx="8" cy="8" r="1.2" fill="#FDE68A" />
          </pattern>
        </defs>

        {/* 1. Substrat céramique / BGA */}
        <rect
          x="15"
          y="15"
          width="210"
          height="210"
          rx="14"
          ry="14"
          fill="url(#dieSubstrate)"
          stroke="#D4AF37"
          strokeWidth="1.2"
        />

        {/* Trame de routage dorée périphérique */}
        <rect x="22" y="22" width="196" height="196" rx="10" fill="url(#goldTraces)" />

        {/* Découpe centrale pour le Die Silicium nu */}
        <rect
          x="55"
          y="55"
          width="130"
          height="130"
          rx="6"
          ry="6"
          fill="#0B0F19"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />

        {/* 2. Cœur Silicium (Die nu miroir poli) */}
        <rect
          x="60"
          y="60"
          width="120"
          height="120"
          rx="4"
          ry="4"
          fill="url(#siliconMirror)"
        />

        {/* Gravure laser industrielle sur le silicium */}
        <text
          x="120"
          y="115"
          fill="#451A03"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="900"
          letterSpacing="1"
          textAnchor="middle"
        >
          AD-SILICON
        </text>
        <text
          x="120"
          y="128"
          fill="#78350F"
          fontSize="7"
          fontFamily="monospace"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          3nm · ISMIN · 2026
        </text>

        {/* Reflet spéculaire blanc en diagonale */}
        <path
          d="M 60 60 L 110 60 L 60 110 Z"
          fill="#FFFFFF"
          fillOpacity="0.35"
        />

        {/* Condensateurs CMS 0201 autour du die */}
        {[
          { x: 34, y: 70 },
          { x: 34, y: 110 },
          { x: 34, y: 150 },
          { x: 198, y: 70 },
          { x: 198, y: 110 },
          { x: 198, y: 150 },
          { x: 70, y: 34 },
          { x: 120, y: 34 },
          { x: 160, y: 34 },
          { x: 70, y: 198 },
          { x: 120, y: 198 },
          { x: 160, y: 198 },
        ].map((cap, i) => (
          <rect
            key={i}
            x={cap.x}
            y={cap.y}
            width="8"
            height="14"
            rx="1.5"
            fill="#B45309"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
        ))}

        {/* Point détrompeur pin 1 en or */}
        <circle cx="32" cy="32" r="4" fill="#FDE68A" stroke="#D4AF37" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}

