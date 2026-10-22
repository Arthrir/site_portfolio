import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface WatercoolingBlockProps {
  interactive?: boolean;
}

export default function WatercoolingBlock({ interactive = true }: WatercoolingBlockProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouvement 3D subtil au survol
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
      className="relative select-none w-full max-w-[340px] aspect-[4/3] flex items-center justify-center filter drop-shadow-[0_25px_40px_rgba(180,83,9,0.35)]"
    >
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dégradé cuivre pur massif (CU-ETP usiné CNC) */}
          <linearGradient id="copperBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="20%" stopColor="#B45309" />
            <stop offset="40%" stopColor="#D97706" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="85%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Chanfrein cuivre biseauté */}
          <linearGradient id="copperBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
            <stop offset="10%" stopColor="#D97706" stopOpacity="0.4" />
            <stop offset="90%" stopColor="#78350F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Dégradé micro-ailettes cuivre en profondeur */}
          <linearGradient id="finShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Dégradé plexiglas acrylique transparent (PMMA poli miroir) */}
          <linearGradient id="acrylicGlass" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#E2E8F0" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#0F172A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.35" />
          </linearGradient>

          {/* Dégradé Jet Plate inox / nickel brossé */}
          <linearGradient id="nickelPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="40%" stopColor="#94A3B8" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="80%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Raccords G1/4 en titane / chrome noir */}
          <linearGradient id="fittingChrome" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="30%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="70%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Liquide de refroidissement fluide dynamique */}
          <radialGradient id="coolantGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#0284C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
          </radialGradient>

          {/* Vis inox hexagonales */}
          <pattern id="hexScrew" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="7" fill="#64748B" stroke="#334155" strokeWidth="1" />
            <polygon points="10,5 14,7.5 14,12.5 10,15 6,12.5 6,7.5" fill="#0F172A" />
          </pattern>
        </defs>

        {/* ======================================================== */}
        {/* 1. PLAQUE DE BASE EN CUIVRE MASSIF CU-ETP AVEC OREILLES  */}
        {/* ======================================================== */}
        {/* Corps principal en cuivre */}
        <rect
          x="30"
          y="25"
          width="340"
          height="250"
          rx="26"
          ry="26"
          fill="url(#copperBase)"
          stroke="#92400E"
          strokeWidth="2"
        />

        {/* 4 oreilles de fixation socket (angles) */}
        <g fill="#B45309" stroke="#78350F" strokeWidth="1.5">
          {/* Top-Left */}
          <rect x="18" y="15" width="40" height="40" rx="10" fill="url(#copperBase)" />
          <circle cx="34" cy="31" r="7.5" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="34" cy="31" r="4" fill="#0F172A" />

          {/* Top-Right */}
          <rect x="342" y="15" width="40" height="40" rx="10" fill="url(#copperBase)" />
          <circle cx="366" cy="31" r="7.5" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="366" cy="31" r="4" fill="#0F172A" />

          {/* Bottom-Left */}
          <rect x="18" y="245" width="40" height="40" rx="10" fill="url(#copperBase)" />
          <circle cx="34" cy="269" r="7.5" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="34" cy="269" r="4" fill="#0F172A" />

          {/* Bottom-Right */}
          <rect x="342" y="245" width="40" height="40" rx="10" fill="url(#copperBase)" />
          <circle cx="366" cy="269" r="7.5" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="366" cy="269" r="4" fill="#0F172A" />
        </g>

        {/* Chanfrein cuivre poli réfléchissant */}
        <rect
          x="33"
          y="28"
          width="334"
          height="244"
          rx="24"
          ry="24"
          fill="none"
          stroke="url(#copperBevel)"
          strokeWidth="2.5"
        />

        {/* ======================================================== */}
        {/* 2. JOINT TORIQUE D'ÉTANCHÉITÉ NOIR NITRILE (O-RING)      */}
        {/* ======================================================== */}
        <rect
          x="55"
          y="45"
          width="290"
          height="210"
          rx="18"
          ry="18"
          fill="none"
          stroke="#0F172A"
          strokeWidth="4"
          strokeOpacity="0.9"
        />

        {/* ======================================================== */}
        {/* 3. MATRICE DE MICRO-AILETTES EN CUIVRE (COLD PLATE 0.15mm)*/}
        {/* ======================================================== */}
        <g id="microFins">
          {/* Cavité usinée CNC centrale */}
          <rect
            x="110"
            y="70"
            width="180"
            height="160"
            rx="10"
            ry="10"
            fill="#451A03"
            stroke="#78350F"
            strokeWidth="2"
          />

          {/* ~42 micro-ailettes en cuivre très haute densité */}
          {Array.from({ length: 44 }).map((_, i) => {
            const xPos = 114 + i * 3.9;
            return (
              <g key={i}>
                {/* Rainure d'ombre */}
                <line
                  x1={xPos}
                  y1={74}
                  x2={xPos}
                  y2={226}
                  stroke="#1C0A00"
                  strokeWidth="1.2"
                />
                {/* Crête brillante de l'ailette */}
                <line
                  x1={xPos + 1.4}
                  y1={74}
                  x2={xPos + 1.4}
                  y2={226}
                  stroke="url(#finShine)"
                  strokeWidth="1.6"
                />
              </g>
            );
          })}

          {/* Lueur fluide du liquide de refroidissement qui circule */}
          <rect
            x="112"
            y="72"
            width="176"
            height="156"
            rx="8"
            ry="8"
            fill="url(#coolantGlow)"
            className="transition-opacity duration-700"
            style={{ opacity: isHovered ? 0.9 : 0.6 }}
          />
        </g>

        {/* ======================================================== */}
        {/* 4. PLAQUE D'INJECTION JET-PLATE EN NICKEL CHROMÉ         */}
        {/* ======================================================== */}
        <g id="jetPlate">
          {/* Barre transversale en nickel brossé */}
          <rect
            x="192"
            y="65"
            width="16"
            height="170"
            rx="4"
            ry="4"
            fill="url(#nickelPlate)"
            stroke="#475569"
            strokeWidth="1"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
          />
          {/* Fente d'injection laminaire ultra-fine */}
          <rect
            x="198.5"
            y="78"
            width="3"
            height="144"
            rx="1.5"
            ry="1.5"
            fill="#0284C7"
          />
          {/* Reflets métalliques jet-plate */}
          <line x1="194" y1="67" x2="194" y2="233" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.7" />
        </g>

        {/* ======================================================== */}
        {/* 5. TOP ACRYLIQUE / PLEXIGLAS PMMA ULTRA CLAIR (CNC TOP)  */}
        {/* ======================================================== */}
        <rect
          x="50"
          y="40"
          width="300"
          height="220"
          rx="18"
          ry="18"
          fill="url(#acrylicGlass)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Réfraction interne du bloc plexiglas (lignes de fraisage CNC) */}
        <rect
          x="70"
          y="56"
          width="260"
          height="188"
          rx="12"
          ry="12"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.25"
        />

        {/* Reflet de lumière oblique sur le verre acrylique */}
        <path
          d="M 60 50 L 160 50 L 90 250 L 60 250 Z"
          fill="#FFFFFF"
          fillOpacity="0.08"
        />
        <path
          d="M 180 50 L 220 50 L 120 250 L 95 250 Z"
          fill="#FFFFFF"
          fillOpacity="0.04"
        />

        {/* ======================================================== */}
        {/* 6. LES 2 RACCORDS G1/4" LIQUIDE (INLET / OUTLET)         */}
        {/* ======================================================== */}
        {/* Port d'Entrée G1/4 (Inlet gauche) */}
        <g id="portInlet">
          {/* Base hexagonale taraudée */}
          <circle cx="150" cy="115" r="22" fill="url(#fittingChrome)" stroke="#0F172A" strokeWidth="2" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.6))" />
          {/* Bague moletée usinée (grip diamant) */}
          <circle cx="150" cy="115" r="18" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Alésage interne du port de liquide */}
          <circle cx="150" cy="115" r="13" fill="#0B132B" stroke="#0284C7" strokeWidth="2" />
          {/* Centre fluide cyan */}
          <circle cx="150" cy="115" r="9" fill="#0284C7" fillOpacity="0.75" />
          <circle cx="147" cy="112" r="3" fill="#FFFFFF" fillOpacity="0.7" />
        </g>

        {/* Port de Sortie G1/4 (Outlet droite) */}
        <g id="portOutlet">
          {/* Base hexagonale taraudée */}
          <circle cx="250" cy="115" r="22" fill="url(#fittingChrome)" stroke="#0F172A" strokeWidth="2" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.6))" />
          {/* Bague moletée usinée */}
          <circle cx="250" cy="115" r="18" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Alésage interne */}
          <circle cx="250" cy="115" r="13" fill="#0B132B" stroke="#0284C7" strokeWidth="2" />
          {/* Centre fluide cyan */}
          <circle cx="250" cy="115" r="9" fill="#0284C7" fillOpacity="0.75" />
          <circle cx="247" cy="112" r="3" fill="#FFFFFF" fillOpacity="0.7" />
        </g>

        {/* ======================================================== */}
        {/* 7. VIS INOX M4 À EMPREINTE HEXAGONALE / ALLEN CNC        */}
        {/* ======================================================== */}
        {[
          { cx: 70, cy: 60 },
          { cx: 200, cy: 52 },
          { cx: 330, cy: 60 },
          { cx: 70, cy: 150 },
          { cx: 330, cy: 150 },
          { cx: 70, cy: 240 },
          { cx: 200, cy: 248 },
          { cx: 330, cy: 240 },
        ].map((screw, idx) => (
          <g key={idx} filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))">
            {/* Tête de vis fraisée en acier inox */}
            <circle cx={screw.cx} cy={screw.cy} r="6.5" fill="url(#nickelPlate)" stroke="#334155" strokeWidth="1" />
            {/* Empreinte hexagonale creuse Allen */}
            <polygon
              points={`
                ${screw.cx},${screw.cy - 3.2}
                ${screw.cx + 2.8},${screw.cy - 1.6}
                ${screw.cx + 2.8},${screw.cy + 1.6}
                ${screw.cx},${screw.cy + 3.2}
                ${screw.cx - 2.8},${screw.cy + 1.6}
                ${screw.cx - 2.8},${screw.cy - 1.6}
              `}
              fill="#0F172A"
            />
            {/* Éclat spéculaire */}
            <circle cx={screw.cx - 2} cy={screw.cy - 2} r="1" fill="#FFFFFF" fillOpacity="0.8" />
          </g>
        ))}

        {/* ======================================================== */}
        {/* 8. GRAVURE LASER INDUSTRIELLE DISCRÈTE SUR LE CUIVRE     */}
        {/* ======================================================== */}
        <text
          x="75"
          y="273"
          fill="#451A03"
          fillOpacity="0.85"
          fontSize="7.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1.8"
        >
          CU-ETP 99.9% · 0.15mm FIN MATRIX · CNC MILLED · WB-300
        </text>
      </svg>
    </motion.div>
  );
}

