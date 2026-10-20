import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Cpu, CheckCircle2 } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
}

// Paramètres géométriques étalonnés pour un wafer 300mm haute définition
const CANVAS_SIZE = 960; // Résolution Retina 2x
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
const WAFER_RADIUS = 464; // Rayon du disque de silicium
const DIE_GRID_RADIUS = WAFER_RADIUS - 18; // Zone active des dies

// Grille de 40 colonnes x 40 rangées : ~80 rues de découpe ultra nettes et lisibles
const GRID_COLS = 40;
const DIE_PITCH = (DIE_GRID_RADIUS * 2) / GRID_COLS; // ~22.3px par die
const DIE_GAP = 1.0; // Rue de découpe (scribe lane) fine et nette de 1px
const DIE_SIZE = DIE_PITCH - DIE_GAP;
const ORIGIN_X = CX - DIE_GRID_RADIUS;
const ORIGIN_Y = CY - DIE_GRID_RADIUS;

interface DieCell {
  c: number;
  r: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isCore: boolean;
  accent: "gold" | "cyan" | "indigo" | "steel";
}

interface SelectedDie {
  col: number;
  row: number;
  x: number;
  y: number;
}

interface ProbeWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export default function SiliconWafer({ onColorChange }: SiliconWaferProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const diesMapRef = useRef<DieCell[]>([]);

  // 3D Tilt interactif doux et naturel
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 150, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 150, damping: 22 });

  const [hoveredDie, setHoveredDie] = useState<SelectedDie | null>(null);
  const [activeDie, setActiveDie] = useState<SelectedDie | null>(null);
  const [totalDiesCount, setTotalDiesCount] = useState(0);
  const [isInspecting, setIsInspecting] = useState(false);

  const mousePosRef = useRef({ x: CX, y: CY, active: false });
  const probeWavesRef = useRef<ProbeWave[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // 1. PRÉ-CALCUL HORS-ÉCRAN DE LA GÉOMÉTRIE DU WAFER (HAUTE PERFORMANCE)
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // A. Disque de Silicium pur poli miroir
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Dégradé de fond : silicium monocristallin profond
    const bgGrad = ctx.createRadialGradient(CX - 80, CY - 80, 20, CX, CY, WAFER_RADIUS);
    bgGrad.addColorStop(0, "#0B111D");
    bgGrad.addColorStop(0.5, "#060A12");
    bgGrad.addColorStop(1, "#020408");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // B. Construction de la matrice de dies avec bordure en escalier
    const dies: DieCell[] = [];
    const accents: ("gold" | "cyan" | "indigo" | "steel")[] = ["gold", "cyan", "indigo", "steel"];

    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_COLS; r++) {
        const x = ORIGIN_X + c * DIE_PITCH;
        const y = ORIGIN_Y + r * DIE_PITCH;

        // Vérification des 4 coins du die pour l'exclusion en escalier (stepped edge)
        const corners = [
          Math.hypot(x - CX, y - CY),
          Math.hypot(x + DIE_SIZE - CX, y - CY),
          Math.hypot(x - CX, y + DIE_SIZE - CY),
          Math.hypot(x + DIE_SIZE - CX, y + DIE_SIZE - CY),
        ];

        if (corners.every((d) => d <= DIE_GRID_RADIUS)) {
          const isCenter = Math.hypot(x + DIE_SIZE / 2 - CX, y + DIE_SIZE / 2 - CY) < 140;
          const accent = accents[(c * 7 + r * 13) % accents.length];

          dies.push({
            c,
            r,
            x,
            y,
            w: DIE_SIZE,
            h: DIE_SIZE,
            isCore: isCenter,
            accent,
          });
        }
      }
    }

    diesMapRef.current = dies;
    setTotalDiesCount(dies.length);

    // C. Gravure des micro-circuits à l'intérieur de chaque die
    for (const die of dies) {
      // 1. Fond du die en silicium actif
      ctx.fillStyle = die.isCore ? "#0E1726" : "#090E18";
      ctx.fillRect(die.x, die.y, die.w, die.h);

      // 2. Pad ring périphérique (plots de connexion or/argent)
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.fillRect(die.x, die.y, die.w, 0.8);
      ctx.fillRect(die.x, die.y + die.h - 0.8, die.w, 0.8);
      ctx.fillRect(die.x, die.y, 0.8, die.h);
      ctx.fillRect(die.x + die.w - 0.8, die.y, 0.8, die.h);

      // 3. Blocs fonctionnels internes (cœur RISC-V & mémoire cache)
      const hw = (die.w - 3.2) / 2;
      const hh = (die.h - 3.2) / 2;

      // Cœur logique (coin haut-gauche)
      if (die.accent === "gold") {
        ctx.fillStyle = "rgba(212, 175, 55, 0.16)"; // Reflet or 18k
      } else if (die.accent === "cyan") {
        ctx.fillStyle = "rgba(56, 189, 248, 0.16)"; // Silicium dopé n-type
      } else if (die.accent === "indigo") {
        ctx.fillStyle = "rgba(129, 140, 248, 0.14)"; // Métallisation M2
      } else {
        ctx.fillStyle = "rgba(148, 163, 184, 0.10)"; // Titane passivé
      }
      ctx.fillRect(die.x + 1.6, die.y + 1.6, hw, hh);

      // Bloc SRAM haute densité (coin haut-droit)
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(die.x + 2.2 + hw, die.y + 1.6, hw, hh);

      // Bus de données (partie inférieure)
      ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
      ctx.fillRect(die.x + 1.6, die.y + 2.2 + hh, die.w - 3.2, hh);
    }

    // D. Rues de découpe orthogonales très nettes (scribe lines de 1px)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c++) {
      const x = ORIGIN_X + c * DIE_PITCH;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_SIZE);
    }
    for (let r = 0; r <= GRID_COLS; r++) {
      const y = ORIGIN_Y + r * DIE_PITCH;
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_SIZE, y);
    }
    ctx.stroke();

    // Rues maîtresses d'alignement lithographique ASML (toutes les 5 cases)
    ctx.strokeStyle = "rgba(212, 175, 55, 0.28)"; // Lignes de repère dorées
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c += 5) {
      const x = ORIGIN_X + c * DIE_PITCH;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_SIZE);
    }
    for (let r = 0; r <= GRID_COLS; r += 5) {
      const y = ORIGIN_Y + r * DIE_PITCH;
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_SIZE, y);
    }
    ctx.stroke();

    // E. Fin biseau poli en périphérie du disque (EBR)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.40)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS - 1.2, 0, Math.PI * 2);
    ctx.stroke();

    // Encoche SEMI en V au bas du wafer (repère mécanique officiel)
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(CX - 8, CANVAS_SIZE);
    ctx.lineTo(CX, CANVAS_SIZE - 12);
    ctx.lineTo(CX + 8, CANVAS_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
    bgCanvasRef.current = offscreen;
  }, []);

  // 2. RENDU EN TEMPS RÉEL : LUMIÈRE D'INTERFÉRENCE PHYSIQUE & SONDE PROBE
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dessin de la matrice de dies pré-calculée
    if (bgCanvasRef.current) {
      ctx.drawImage(bgCanvasRef.current, 0, 0);
    }

    // Masque circulaire
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    const lx = mousePosRef.current.x;
    const ly = mousePosRef.current.y;

    // REFLET 1 : Décomposition spectrale douce (brillance optique fine)
    const specGrad = ctx.createRadialGradient(lx, ly, 20, lx, ly, 380);
    specGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.45)"); // Point spéculaire central doux
    specGrad.addColorStop(0.2, "rgba(212, 175, 55, 0.20)");  // Doré 18k
    specGrad.addColorStop(0.45, "rgba(56, 189, 248, 0.15)"); // Cyan doux
    specGrad.addColorStop(0.7, "rgba(139, 92, 246, 0.10)");  // Améthyste
    specGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // REFLET 2 : Éclat anamorphique fin le long des lignes de sciage
    if (mousePosRef.current.active) {
      // Faisceau horizontal très fin (4px de halo)
      const hBeam = ctx.createLinearGradient(0, ly - 3, 0, ly + 3);
      hBeam.addColorStop(0, "rgba(255, 255, 255, 0)");
      hBeam.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
      hBeam.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = hBeam;
      ctx.fillRect(0, ly - 3, CANVAS_SIZE, 6);

      // Faisceau vertical très fin
      const vBeam = ctx.createLinearGradient(lx - 3, 0, lx + 3, 0);
      vBeam.addColorStop(0, "rgba(255, 255, 255, 0)");
      vBeam.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
      vBeam.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = vBeam;
      ctx.fillRect(lx - 3, 0, 6, CANVAS_SIZE);
    }

    // REFLET 3 : Ondes de sonde de test électrique au clic
    ctx.globalCompositeOperation = "source-over";
    probeWavesRef.current = probeWavesRef.current.filter((wave) => {
      wave.radius += 5;
      wave.opacity *= 0.93;
      if (wave.opacity < 0.02 || wave.radius > wave.maxRadius) return false;

      ctx.save();
      ctx.strokeStyle = "#38BDF8";
      ctx.globalAlpha = wave.opacity;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return true;
    });

    // REFLET 4 : Réticule laser sur le die survolé
    if (hoveredDie) {
      ctx.save();
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 8;
      ctx.strokeRect(hoveredDie.x, hoveredDie.y, DIE_SIZE, DIE_SIZE);

      ctx.fillStyle = "rgba(212, 175, 55, 0.28)";
      ctx.fillRect(hoveredDie.x, hoveredDie.y, DIE_SIZE, DIE_SIZE);
      ctx.restore();
    }

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(render);
  }, [hoveredDie]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  // GESTION DES INTERACTIONS SOURIS
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(normX);
    my.set(normY);

    const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;
    mousePosRef.current = { x: canvasX, y: canvasY, active: true };

    // Détection du die sous le curseur
    const col = Math.floor((canvasX - ORIGIN_X) / DIE_PITCH);
    const row = Math.floor((canvasY - ORIGIN_Y) / DIE_PITCH);

    const hit = diesMapRef.current.find((d) => d.c === col && d.r === row);
    if (hit) {
      setHoveredDie({ col, row, x: hit.x, y: hit.y });
    } else {
      setHoveredDie(null);
    }
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    mousePosRef.current.active = false;
    setHoveredDie(null);
    setIsInspecting(false);
  };

  const handleWaferClick = () => {
    if (!hoveredDie) return;
    setActiveDie(hoveredDie);
    setIsInspecting(true);

    // Déclencher une impulsion électrique probe
    probeWavesRef.current.push({
      x: hoveredDie.x + DIE_SIZE / 2,
      y: hoveredDie.y + DIE_SIZE / 2,
      radius: 4,
      maxRadius: 180,
      opacity: 0.9,
    });

    if (onColorChange) {
      onColorChange("#D4AF37");
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* HUD Microscope de Salle Blanche au-dessus */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 font-mono text-[10px] text-mute uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-ink">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SEMI 300mm · SILICON WAFER</span>
        </span>
        <span className="text-right">
          {hoveredDie ? (
            <span className="text-amber-500 font-semibold">DIE [{hoveredDie.col}, {hoveredDie.row}] · PROBE READY</span>
          ) : (
            <span>{totalDiesCount || 1080} DIES · 100% YIELD</span>
          )}
        </span>
      </div>

      {/* Disque de Silicium 3D Flottant */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleWaferClick}
        className="relative aspect-square w-full max-w-[420px] cursor-crosshair select-none transition-shadow duration-500 rounded-full"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="h-full w-full rounded-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.01]"
        />

        {/* Détail télémétrie die sélectionné en overlay flottant */}
        {isInspecting && activeDie && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 rounded-full border border-amber-500/40 bg-ink/90 backdrop-blur-md px-4 py-2 text-paper shadow-2xl"
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span className="font-mono text-[11px] tracking-tight">
              DIE #{activeDie.col * 40 + activeDie.row} : <span className="text-amber-400 font-semibold">PASS (3.2 GHz)</span>
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Légende minimaliste en bas */}
      <p className="mt-3 font-mono text-[10px] text-mute text-center">
        Survolez pour inspecter les coordonnées · Cliquez pour tester la sonde
      </p>
    </div>
  );
}
