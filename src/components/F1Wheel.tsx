import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface F1WheelProps {
  interactive?: boolean;
}

export default function F1Wheel({ interactive = true }: F1WheelProps) {
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
      className="relative select-none w-full max-w-[340px] aspect-[16/11] flex items-center justify-center filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.45)]"
    >
      <svg
        viewBox="0 0 420 280"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Trame de fibre de carbone sergé 2x2 (Twill Carbon Weave) */}
          <pattern id="f1Carbon" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#14171F" />
            <path d="M0 0 L4 4 M4 0 L8 4 M0 4 L4 8 M4 4 L8 8" stroke="#222834" strokeWidth="1.2" />
            <path d="M0 4 L4 0 M4 8 L8 4" stroke="#0D0F14" strokeWidth="0.8" />
          </pattern>

          {/* Dégradé biseau carbone poli */}
          <linearGradient id="carbonBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#1E293B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
          </linearGradient>

          {/* Poignées ergonomiques en daim / polyuréthane haute adhérence */}
          <linearGradient id="gripTexture" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="30%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0B0F19" />
          </linearGradient>

          {/* Aluminium anodisé titane */}
          <linearGradient id="anodizedBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Rétroéclairage écran télémétrie LCD motorsport */}
          <radialGradient id="lcdBacklight" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#050811" />
          </radialGradient>
        </defs>

        {/* ======================================================== */}
        {/* 1. PALETTES DE CHANGEMENT DE VITESSE EN CARBONE ARRIÈRE  */}
        {/* ======================================================== */}
        {/* Palette Gauche (-) */}
        <path
          d="M 12 70 C 8 85 8 135 12 150 L 28 140 C 26 125 26 95 28 80 Z"
          fill="#0F172A"
          stroke="#334155"
          strokeWidth="1.2"
        />
        {/* Palette Droite (+) */}
        <path
          d="M 408 70 C 412 85 412 135 408 150 L 392 140 C 394 125 394 95 392 80 Z"
          fill="#0F172A"
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* ======================================================== */}
        {/* 2. CHÂSSIS MONOCOQUE EN CARBONE DU VOLANT F1             */}
        {/* ======================================================== */}
        {/* Corps papillon F1 usiné CNC */}
        <path
          d="
            M 60 40 
            C 120 28, 300 28, 360 40 
            C 385 45, 395 70, 390 100 
            C 385 130, 370 150, 375 190 
            C 380 230, 360 250, 330 248 
            C 290 245, 260 238, 210 238 
            C 160 238, 130 245, 90 248 
            C 60 250, 40 230, 45 190 
            C 50 150, 35 130, 30 100 
            C 25 70, 35 45, 60 40 Z
          "
          fill="url(#f1Carbon)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Chanfrein biseauté reflet 3D du châssis */}
        <path
          d="
            M 62 43 
            C 120 31, 300 31, 358 43 
            C 380 48, 390 70, 385 98 
            C 380 128, 366 148, 371 188 
            C 376 226, 356 245, 328 243 
            C 288 241, 260 234, 210 234 
            C 160 234, 132 241, 92 243 
            C 64 245, 44 226, 49 188 
            C 54 148, 40 128, 35 98 
            C 30 70, 40 48, 62 43 Z
          "
          fill="none"
          stroke="url(#carbonBevel)"
          strokeWidth="1.8"
        />

        {/* ======================================================== */}
        {/* 3. POIGNÉES ERGONOMIQUES LATÉRALES GRIP (GAUCHE & DROITE)*/}
        {/* ======================================================== */}
        {/* Poignée Gauche */}
        <path
          d="M 32 80 C 26 110, 26 160, 40 215 C 48 217, 56 205, 54 185 C 50 155, 46 125, 52 95 C 54 80, 44 76, 32 80 Z"
          fill="url(#gripTexture)"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
        {/* Poignée Droite */}
        <path
          d="M 388 80 C 394 110, 394 160, 380 215 C 372 217, 364 205, 366 185 C 370 155, 374 125, 368 95 C 366 80, 376 76, 388 80 Z"
          fill="url(#gripTexture)"
          stroke="#0F172A"
          strokeWidth="1.5"
        />

        {/* ======================================================== */}
        {/* 4. BANDEAU DE SHIFT LIGHTS LED (RÉGIME MOTEUR F1)        */}
        {/* ======================================================== */}
        <g id="shiftLights">
          {/* Support incurvé des LEDs */}
          <path
            d="M 130 54 Q 210 46 290 54"
            fill="none"
            stroke="#0B0F19"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* 5 Vertes (Bas régime) */}
          {[140, 152, 164, 176, 188].map((cx, i) => (
            <circle key={`green-${i}`} cx={cx} cy={53} r="3.2" fill="#22C55E" filter="drop-shadow(0 0 4px #22C55E)" />
          ))}

          {/* 5 Rouges (Mi-régime) */}
          {[200, 210, 220, 230, 240].map((cx, i) => (
            <circle key={`red-${i}`} cx={cx} cy={53} r="3.2" fill="#EF4444" filter="drop-shadow(0 0 4px #EF4444)" />
          ))}

          {/* 4 Bleues (Zone rupture de passage de rapport !) */}
          {[252, 264, 276].map((cx, i) => (
            <circle key={`blue-${i}`} cx={cx} cy={54} r="3.2" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)" />
          ))}
        </g>

        {/* ======================================================== */}
        {/* 5. ÉCRAN TÉLÉMÉTRIE LCD MOTORSPORT CENTRAL (4.3" F1 DASH) */}
        {/* ======================================================== */}
        <g id="telemetryDash">
          {/* Cadre en magnésium fraisé */}
          <rect
            x="125"
            y="70"
            width="170"
            height="115"
            rx="8"
            ry="8"
            fill="#050811"
            stroke="url(#anodizedBezel)"
            strokeWidth="2"
          />

          {/* Dalle LCD active */}
          <rect
            x="130"
            y="75"
            width="160"
            height="105"
            rx="5"
            ry="5"
            fill="url(#lcdBacklight)"
          />

          {/* Ligne d'en-tête télémétrie */}
          <text x="138" y="90" fill="#94A3B8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            LAP 44/57
          </text>
          <text x="238" y="90" fill="#10B981" fontSize="8" fontFamily="monospace" fontWeight="bold">
            -0.312 ▲
          </text>

          {/* Indicateur de Vitesse Enclenchée (GEAR [ 8 ]) */}
          <rect x="185" y="96" width="50" height="58" rx="6" fill="#0E1626" stroke="#2340F0" strokeWidth="1" />
          <text
            x="210"
            y="142"
            fill="#FFFFFF"
            fontSize="42"
            fontFamily="monospace"
            fontWeight="900"
            textAnchor="middle"
          >
            8
          </text>

          {/* Vitesse en km/h à gauche */}
          <text x="142" y="112" fill="#64748B" fontSize="7" fontFamily="monospace">
            SPEED
          </text>
          <text x="142" y="132" fill="#FFFFFF" fontSize="18" fontFamily="monospace" fontWeight="bold">
            314
          </text>
          <text x="142" y="142" fill="#64748B" fontSize="6.5" fontFamily="monospace">
            KM/H
          </text>

          {/* Télémétrie droite : ERS & Engine Mode */}
          <text x="245" y="112" fill="#64748B" fontSize="7" fontFamily="monospace">
            SOC
          </text>
          <text x="245" y="130" fill="#F59E0B" fontSize="15" fontFamily="monospace" fontWeight="bold">
            88%
          </text>
          <text x="245" y="142" fill="#38BDF8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
            HOTLAP
          </text>

          {/* Barre de déploiement ERS en bas */}
          <rect x="138" y="162" width="144" height="6" rx="3" fill="#1E293B" />
          <rect x="138" y="162" width="118" height="6" rx="3" fill="#10B981" />
          <text x="138" y="157" fill="#64748B" fontSize="6" fontFamily="monospace">
            ERS DEPLOYMENT
          </text>
          <text x="254" y="157" fill="#10B981" fontSize="6" fontFamily="monospace" fontWeight="bold">
            82%
          </text>
        </g>

        {/* ======================================================== */}
        {/* 6. BOUTONS POUSSOIRS TACTILES AVEC COLLIERS ANODISÉS      */}
        {/* ======================================================== */}
        {/* Bouton DRS (Bleu) */}
        <g id="btnDRS">
          <circle cx="95" cy="85" r="11" fill="url(#anodizedBezel)" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="95" cy="85" r="8" fill="#2563EB" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))" />
          <text x="95" y="88" fill="#FFFFFF" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            DRS
          </text>
        </g>

        {/* Bouton RADIO (Or/Jaune) */}
        <g id="btnRadio">
          <circle cx="325" cy="85" r="11" fill="url(#anodizedBezel)" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="325" cy="85" r="8" fill="#D97706" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))" />
          <text x="325" y="88" fill="#FFFFFF" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            RAD
          </text>
        </g>

        {/* Bouton OVERTAKE (Signal Orange) */}
        <g id="btnOT">
          <circle cx="85" cy="135" r="11" fill="url(#anodizedBezel)" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="85" cy="135" r="8" fill="#DC2626" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))" />
          <text x="85" y="138" fill="#FFFFFF" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            OT
          </text>
        </g>

        {/* Bouton PIT LIMITER (Blanc) */}
        <g id="btnPit">
          <circle cx="335" cy="135" r="11" fill="url(#anodizedBezel)" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="335" cy="135" r="8" fill="#E2E8F0" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))" />
          <text x="335" y="138" fill="#0F172A" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            PIT
          </text>
        </g>

        {/* ======================================================== */}
        {/* 7. COMMUTATEURS ROTATIFS MOLETÉS AU POUCE (DIFF / MAP)   */}
        {/* ======================================================== */}
        {/* Molette Différentiel Gauche */}
        <g id="rotaryDiff">
          <circle cx="160" cy="215" r="15" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="160" cy="215" r="11" fill="#334155" />
          <line x1="160" y1="205" x2="160" y2="212" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <text x="160" y="238" fill="#94A3B8" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
            DIFF
          </text>
        </g>

        {/* Molette Engine Map Droite */}
        <g id="rotaryMap">
          <circle cx="260" cy="215" r="15" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="260" cy="215" r="11" fill="#334155" />
          <line x1="260" y1="205" x2="260" y2="212" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <text x="260" y="238" fill="#94A3B8" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
            MAP
          </text>
        </g>

        {/* ======================================================== */}
        {/* 8. VIS TITANE DE FIXATION MOYEU DU VOLANT                */}
        {/* ======================================================== */}
        {[
          { cx: 195, cy: 202 },
          { cx: 225, cy: 202 },
          { cx: 210, cy: 220 },
        ].map((screw, i) => (
          <g key={i}>
            <circle cx={screw.cx} cy={screw.cy} r="3.5" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
            <polygon points={`${screw.cx},${screw.cy-1.5} ${screw.cx+1.3},${screw.cy-0.8} ${screw.cx+1.3},${screw.cy+0.8} ${screw.cx},${screw.cy+1.5} ${screw.cx-1.3},${screw.cy+0.8} ${screw.cx-1.3},${screw.cy-0.8}`} fill="#0F172A" />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

