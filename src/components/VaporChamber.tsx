import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Flame, Activity, Zap } from "lucide-react";

interface VaporChamberProps {
  className?: string;
  interactive?: boolean;
  showBadge?: boolean;
}

export default function VaporChamber({ className = "", interactive = true, showBadge = false }: VaporChamberProps) {
  const [isOverclocked, setIsOverclocked] = useState(false);
  const [temp, setTemp] = useState(48.2);

  useEffect(() => {
    const base = isOverclocked ? 68.4 : 48.2;
    const interval = setInterval(() => {
      setTemp(Number((base + (Math.random() * 0.6 - 0.3)).toFixed(1)));
    }, 700);
    return () => clearInterval(interval);
  }, [isOverclocked]);

  return (
    <div
      onClick={() => interactive && setIsOverclocked((o) => !o)}
      className={`relative select-none cursor-pointer group ${className}`}
    >
      <svg
        viewBox="0 0 280 180"
        className="w-full h-auto overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02]"
      >
        <defs>
          {/* Dégradé cuivre estampé réaliste */}
          <linearGradient id="vc-copper-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E28743" />
            <stop offset="30%" stopColor="#C86A2E" />
            <stop offset="70%" stopColor="#964316" />
            <stop offset="100%" stopColor="#6E2B08" />
          </linearGradient>

          {/* Biseau métallique brillant du bord en cuivre */}
          <linearGradient id="vc-bevel-edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C86A2E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#431407" stopOpacity="0.9" />
          </linearGradient>

          {/* Halo thermique incandescent du cœur de chauffe (évaporateur) */}
          <radialGradient id="vc-thermal-glow" cx="42%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity={isOverclocked ? 0.95 : 0.85} />
            <stop offset="25%" stopColor="#F97316" stopOpacity={isOverclocked ? 0.85 : 0.70} />
            <stop offset="55%" stopColor="#DC2626" stopOpacity={isOverclocked ? 0.70 : 0.50} />
            <stop offset="80%" stopColor="#7C2D12" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
          </radialGradient>

          {/* Canaux capillaires de condensation (zone froide) */}
          <linearGradient id="vc-cooling-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0)" />
            <stop offset="60%" stopColor="rgba(56, 189, 248, 0.15)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.35)" />
          </linearGradient>
        </defs>

        {/* 1. TUBE DE PINÇAGE & SCELLEMENT SOUS VIDE (Exhaust seal tip en haut à gauche) */}
        <path
          d="M 28 42 L 8 42 L 8 52 L 28 52 Z"
          fill="#C86A2E"
          stroke="#431407"
          strokeWidth="1.2"
        />
        {/* Pincement à froid mécanique */}
        <line x1="14" y1="40" x2="14" y2="54" stroke="#431407" strokeWidth="1.5" />
        <line x1="18" y1="41" x2="18" y2="53" stroke="#FED7AA" strokeWidth="1" />

        {/* 2. CORPS PRINCIPAL DE LA VAPOR CHAMBER EN CUIVRE ESTAMPÉ */}
        {/* Forme profilée avec renflements et congés caractéristiques */}
        <path
          d="M 44 24 
             L 246 24 
             A 18 18 0 0 1 264 42 
             L 264 138 
             A 18 18 0 0 1 246 156 
             L 44 156 
             A 18 18 0 0 1 26 138 
             L 26 42 
             A 18 18 0 0 1 44 24 Z"
          fill="url(#vc-copper-body)"
          stroke="url(#vc-bevel-edge)"
          strokeWidth="2"
        />

        {/* 3. NERVURES D'EMBOUTISSAGE STRUCTURELLES (STAMPED RIBS) */}
        <rect
          x="36"
          y="34"
          width="218"
          height="112"
          rx="10"
          fill="none"
          stroke="#7C2D12"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <rect
          x="38"
          y="36"
          width="214"
          height="108"
          rx="8"
          fill="none"
          stroke="#FED7AA"
          strokeWidth="0.8"
          opacity="0.35"
        />

        {/* Rainures de rigidité estampées au centre */}
        <line x1="160" y1="46" x2="236" y2="46" stroke="#5C1D06" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="160" y1="47.5" x2="236" y2="47.5" stroke="#FED7AA" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

        <line x1="160" y1="134" x2="236" y2="134" stroke="#5C1D06" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="160" y1="135.5" x2="236" y2="135.5" stroke="#FED7AA" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

        {/* 4. RAYONNEMENT THERMIQUE DU CŒUR DE CHALEUR (ZONE ÉVAPORATEUR) */}
        <rect
          x="36"
          y="34"
          width="218"
          height="112"
          rx="10"
          fill="url(#vc-thermal-glow)"
          className="transition-all duration-500"
        />

        {/* Flux de condensation vers la droite (zone froide) */}
        <rect
          x="140"
          y="34"
          width="114"
          height="112"
          rx="10"
          fill="url(#vc-cooling-flow)"
        />

        {/* 5. EMPREINTE D'ÉCHANGE THERMIQUE DU SOC / DIE AU CENTRE GAUCHE */}
        <rect
          x="80"
          y="60"
          width="62"
          height="62"
          rx="4"
          fill="#1C0A04"
          fillOpacity="0.75"
          stroke="#FEF08A"
          strokeWidth="1.2"
        />

        {/* Cœur incandescent avec isothermes */}
        <circle cx="111" cy="91" r="18" fill="#F97316" fillOpacity="0.4" />
        <circle cx="111" cy="91" r="9" fill="#FEF08A" fillOpacity="0.85" />
        <circle cx="111" cy="91" r="24" fill="none" stroke="#FDE047" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.7" />

        <text x="111" y="94" textAnchor="middle" fill="#451A03" fontSize="5" fontFamily="monospace" fontWeight="bold">
          CORE HOTSPOT
        </text>

        {/* 6. MARQUAGES LASER INDUSTRIELS SUR LE CUIVRE */}
        <g className="font-mono" opacity="0.85">
          <text x="160" y="70" fill="#FED7AA" fontSize="6.5" fontWeight="bold" letterSpacing="0.6">
            D-COPPER VAPOR CHAMBER
          </text>
          <text x="160" y="81" fill="#FEF08A" fontSize="5" letterSpacing="0.4">
            PHASE-CHANGE COOLING · 0.40mm
          </text>
          <text x="160" y="93" fill="#FDBA74" fontSize="5">
            T_EVAP: {temp}°C {isOverclocked ? "(OVERCLOCK)" : "(NOMINAL)"}
          </text>
          <text x="160" y="105" fill="#93C5FD" fontSize="4.8">
            CONDENSER: 28.4°C · Q_MAX: 45W
          </text>
          <text x="160" y="117" fill="#FED7AA" fontSize="4.2" opacity="0.7">
            CAPILLARY COPPER MESH WICK
          </text>
        </g>

        {/* Repère gravé laser d'orientation */}
        <circle cx="48" cy="46" r="3" fill="none" stroke="#FED7AA" strokeWidth="0.8" opacity="0.6" />
        <circle cx="48" cy="46" r="1.2" fill="#FED7AA" opacity="0.8" />
      </svg>

      {/* Badge télémétrie thermique flottant */}
      {showBadge && (
        <div className="mt-1 flex items-center justify-between px-2 font-mono text-[9px] text-mute">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Flame className={`size-3 ${isOverclocked ? "animate-bounce text-rose-500" : "text-amber-500"}`} />
            <span>CHAMBRE À VAPEUR · CUIVRE D-CU</span>
          </span>
          <span className={`font-semibold ${isOverclocked ? "text-rose-500 font-bold" : "text-amber-600"}`}>
            {temp}°C (Cliquez pour {isOverclocked ? "calmer" : "chauffer"})
          </span>
        </div>
      )}
    </div>
  );
}
