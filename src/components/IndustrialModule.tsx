import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface IndustrialModuleProps {
  interactive?: boolean;
}

export default function IndustrialModule({ interactive = true }: IndustrialModuleProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouvement 3D réactif à la souris
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
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="relative select-none w-full max-w-[340px] aspect-[16/11] flex items-center justify-center filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
    >
      <svg
        viewBox="0 0 400 270"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Aluminium brossé micro-sablé naturel (Unibody CNC) */}
          <linearGradient id="aluUnibody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Chanfrein biseauté poli miroir de l'aluminium */}
          <linearGradient id="aluBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.8" />
          </linearGradient>

          {/* Molette principale anodisée Bleu Cobalt / Signal */}
          <linearGradient id="anodizedBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="40%" stopColor="#2563EB" />
            <stop offset="70%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Écran OLED monochrome haute densité */}
          <radialGradient id="oledBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        {/* ======================================================== */}
        {/* 1. CHÂSSIS UNIBODY EN ALUMINIUM USINÉ CNC                */}
        {/* ======================================================== */}
        <rect
          x="20"
          y="15"
          width="360"
          height="240"
          rx="22"
          ry="22"
          fill="url(#aluUnibody)"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />

        {/* Biseau fraisé CNC périmétrique */}
        <rect
          x="23"
          y="18"
          width="354"
          height="234"
          rx="19"
          ry="19"
          fill="none"
          stroke="url(#aluBevel)"
          strokeWidth="2"
        />

        {/* ======================================================== */}
        {/* 2. ÉCRAN OLED MONOCHROME STYLE TEENAGE ENGINEERING / BRAUN */}
        {/* ======================================================== */}
        <g id="oledDisplay">
          {/* Cavité usinée pour la vitre d'écran */}
          <rect
            x="45"
            y="40"
            width="170"
            height="95"
            rx="10"
            ry="10"
            fill="#020617"
            stroke="#334155"
            strokeWidth="1.5"
            filter="drop-shadow(inset 0 2px 4px rgba(0,0,0,0.8))"
          />

          {/* En-tête OLED */}
          <text x="56" y="58" fill="#64748B" fontSize="8" fontFamily="monospace" fontWeight="bold">
            OSC 01 · 440.0 Hz
          </text>
          <text x="180" y="58" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            ACTIVE
          </text>

          {/* Onde sinusoïdale / forme d'onde synthétiseur vectorielle */}
          <path
            d="
              M 55 90 
              Q 70 65, 85 90 
              T 115 90 
              T 145 90 
              T 175 90 
              T 205 90
            "
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="drop-shadow(0 0 4px #38BDF8)"
          />

          {/* Pied d'écran OLED */}
          <text x="56" y="122" fill="#94A3B8" fontSize="7.5" fontFamily="monospace">
            AUDIO CORE · 96kHz/24b
          </text>
        </g>

        {/* ======================================================== */}
        {/* 3. GROSSE MOLETTE ROTATIVE ANODISÉE BLEU COBALT          */}
        {/* ======================================================== */}
        <g id="mainDial" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.35))">
          {/* Piste de graduation laser circulaire */}
          <circle cx="295" cy="85" r="46" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 4" />

          {/* Base molette */}
          <circle cx="295" cy="85" r="38" fill="url(#anodizedBlue)" stroke="#1E3A8A" strokeWidth="2" />

          {/* Bague de moletage texturée */}
          <circle cx="295" cy="85" r="32" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="4 2" />

          {/* Centre de la molette en aluminium usiné */}
          <circle cx="295" cy="85" r="22" fill="url(#aluUnibody)" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Point repère blanc gravé de réglage */}
          <circle cx="295" cy="69" r="2.8" fill="#FFFFFF" />
        </g>

        {/* ======================================================== */}
        {/* 4. TROIS MINI POTENTIOMÈTRES ALUMINIUM ROTATIFS          */}
        {/* ======================================================== */}
        {[
          { cx: 70, label: "FREQ" },
          { cx: 130, label: "RES" },
          { cx: 190, label: "DRIVE" },
        ].map((pot, idx) => (
          <g key={idx} id={`pot-${idx}`}>
            <circle cx={pot.cx} cy={165} r="16" fill="url(#aluUnibody)" stroke="#94A3B8" strokeWidth="1.2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))" />
            <circle cx={pot.cx} cy={165} r="11" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            <line
              x1={pot.cx}
              y1={165}
              x2={pot.cx - 6}
              y2={157}
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text x={pot.cx} y={192} fill="#64748B" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {pot.label}
            </text>
          </g>
        ))}

        {/* ======================================================== */}
        {/* 5. MATRICE DE 4 BOUTONS TOUCHES MÉCANIQUES BLANCHES      */}
        {/* ======================================================== */}
        {[
          { x: 235, y: 150, n: "1" },
          { x: 270, y: 150, n: "2" },
          { x: 305, y: 150, n: "3" },
          { x: 340, y: 150, n: "4" },
        ].map((btn, i) => (
          <g key={i} filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
            {/* Touche carrée mécanique avec relief plastique / céramique blanc */}
            <rect
              x={btn.x}
              y={btn.y}
              width="26"
              height="26"
              rx="6"
              ry="6"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.2"
            />
            <rect
              x={btn.x + 2}
              y={btn.y + 2}
              width="22"
              height="20"
              rx="4"
              ry="4"
              fill="#F8FAFC"
            />
            <text
              x={btn.x + 13}
              y={btn.y + 16}
              fill="#475569"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {btn.n}
            </text>
          </g>
        ))}

        {/* ======================================================== */}
        {/* 6. TYPOGRAPHIE GRAVÉE AU LASER SUR L'ALUMINIUM (MILANO)  */}
        {/* ======================================================== */}
        <text
          x="45"
          y="235"
          fill="#64748B"
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1.4"
        >
          AD-01 · INDUSTRIAL HARDWARE · MILANO 2026
        </text>

        {/* 4 Vis Torx aux coins */}
        {[
          { cx: 34, cy: 30 },
          { cx: 366, cy: 30 },
          { cx: 34, cy: 240 },
          { cx: 366, cy: 240 },
        ].map((screw, i) => (
          <g key={i}>
            <circle cx={screw.cx} cy={screw.cy} r="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
            <circle cx={screw.cx} cy={screw.cy} r="1.8" fill="#475569" />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

