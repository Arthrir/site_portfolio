import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Cpu, CheckCircle2 } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
  standalone?: boolean;
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

export default function SiliconWafer({ onColorChange, standalone = false }: SiliconWaferProps) {
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
  const [iridAngle, setIridAngle] = useState(135);

  const mousePosRef = useRef({ x: CX, y: CY, active: false });
  const probeWavesRef = useRef<ProbeWave[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // 1. PRÉ-CALCUL HORS-ÉCRAN DU FOND SILICIUM MÉTALLIQUE ARDOISE & DIES EN ESCALIER
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // A. Disque de Silicium pur
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Dégradé miroir du substrat silicium brut CZ P-type <100> (couleur originale ardoise/bleu nuit appréciée)
    const bgGrad = ctx.createRadialGradient(CX - 100, CY - 100, 30, CX, CY, WAFER_RADIUS);
    bgGrad.addColorStop(0.0, "#24334D");  // Ardoise lumineux CZ silicon
    bgGrad.addColorStop(0.40, "#16233B"); // Bleu ardoise profond
    bgGrad.addColorStop(0.80, "#0F192C"); // Fond subtil
    bgGrad.addColorStop(1.0, "#0B1424");  // Périphérie ardoise propre (aucun noir opaque)
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // B. Biseau extérieur ultra fin du wafer (chanfrein cristallin poli, sans contour noir)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS - 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS - 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // C. Construction de la matrice de dies avec découpe en escalier (stepped edge)
    const dies: DieCell[] = [];
    const accents: ("gold" | "cyan" | "indigo" | "steel")[] = ["gold", "cyan", "indigo", "steel"];

    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_COLS; r++) {
        const x = ORIGIN_X + c * DIE_PITCH;
        const y = ORIGIN_Y + r * DIE_PITCH;

        // Vérification des 4 coins du die pour l'exclusion en escalier
        const corners = [
          Math.hypot(x - CX, y - CY),
          Math.hypot(x + DIE_SIZE - CX, y - CY),
          Math.hypot(x - CX, y + DIE_SIZE - CY),
          Math.hypot(x + DIE_SIZE - CX, y + DIE_SIZE - CY),
        ];

        if (corners.every((d) => d <= DIE_GRID_RADIUS)) {
          const isCenter = Math.hypot(x + DIE_SIZE / 2 - CX, y + DIE_SIZE / 2 - CY) < 130;
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

    // D. Gravure des micro-circuits à l'intérieur de chaque die
    for (const die of dies) {
      // 1. Fond du die en silicium actif bleuté
      ctx.fillStyle = die.isCore ? "rgba(30, 41, 59, 0.88)" : "rgba(15, 23, 42, 0.82)";
      ctx.fillRect(die.x, die.y, die.w, die.h);

      // 2. Pad ring périphérique (cadre fin de plots)
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(die.x, die.y, die.w, 0.8);
      ctx.fillRect(die.x, die.y + die.h - 0.8, die.w, 0.8);
      ctx.fillRect(die.x, die.y, 0.8, die.h);
      ctx.fillRect(die.x + die.w - 0.8, die.y, 0.8, die.h);

      // 3. Blocs fonctionnels internes (cœur RISC-V, SRAM, bus)
      const hw = (die.w - 3.2) / 2;
      const hh = (die.h - 3.2) / 2;

      // Cœur logique (coin haut-gauche)
      if (die.accent === "gold") {
        ctx.fillStyle = "rgba(212, 175, 55, 0.22)"; // Reflet or 18k
      } else if (die.accent === "cyan") {
        ctx.fillStyle = "rgba(56, 189, 248, 0.20)"; // Silicium n-type
      } else if (die.accent === "indigo") {
        ctx.fillStyle = "rgba(129, 140, 248, 0.18)"; // Métallisation M2
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)"; // Titane passivé
      }
      ctx.fillRect(die.x + 1.6, die.y + 1.6, hw, hh);

      // Bloc SRAM haute densité (coin haut-droit)
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.fillRect(die.x + 2.2 + hw, die.y + 1.6, hw, hh);

      // Bus de données (partie inférieure)
      ctx.fillStyle = "rgba(212, 175, 55, 0.10)";
      ctx.fillRect(die.x + 1.6, die.y + 2.2 + hh, die.w - 3.2, hh);
    }

    // E. Rues de découpe orthogonales très nettes (scribe lines)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 0.9;
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
    ctx.strokeStyle = "rgba(212, 175, 55, 0.32)";
    ctx.lineWidth = 1.1;
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

    // F. Biseau poli périphérique & encoche SEMI à 270°
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS - 1.2, 0, Math.PI * 2);
    ctx.stroke();

    // Encoche SEMI en V au bas du wafer
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(CX - 8, CANVAS_SIZE);
    ctx.lineTo(CX, CANVAS_SIZE - 12);
    ctx.lineTo(CX + 8, CANVAS_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
    bgCanvasRef.current = offscreen;
  }, []);

  // 2. RENDU EN TEMPS RÉEL : INTERFÉRENCE OPTIQUE IRIDESCENTE & REFLET SPÉCULAIRE
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

    // COUCHE 1 : INTERFÉRENCE CHROMATIQUE OPTIQUE (L'EFFET IRISÉ DE LA PREMIÈRE VERSION)
    const radAngle = (iridAngle * Math.PI) / 180;
    const cosA = Math.cos(radAngle);
    const sinA = Math.sin(radAngle);

    const iridGrad = ctx.createLinearGradient(
      CX - cosA * WAFER_RADIUS,
      CY - sinA * WAFER_RADIUS,
      CX + cosA * WAFER_RADIUS,
      CY + sinA * WAFER_RADIUS
    );
    iridGrad.addColorStop(0.00, "rgba(236, 72, 153, 0.20)"); // Rose / Magenta
    iridGrad.addColorStop(0.25, "rgba(59, 130, 246, 0.25)"); // Bleu saphir
    iridGrad.addColorStop(0.50, "rgba(16, 185, 129, 0.20)"); // Vert émeraude
    iridGrad.addColorStop(0.75, "rgba(245, 158, 11, 0.24)"); // Or chaud
    iridGrad.addColorStop(1.00, "rgba(139, 92, 246, 0.20)"); // Violet améthyste

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = iridGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 2 : REFLET SPÉCULAIRE BLANC DE SALLE BLANCHE QUI SUIT LE CURSEUR
    const lx = mousePosRef.current.x;
    const ly = mousePosRef.current.y;

    const specGrad = ctx.createRadialGradient(lx, ly, 20, lx, ly, 320);
    specGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.40)");
    specGrad.addColorStop(0.25, "rgba(255, 255, 255, 0.15)");
    specGrad.addColorStop(0.65, "rgba(59, 130, 246, 0.08)");
    specGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 3 : ÉCLAT ANAMORPHIQUE SUBTIL LE LONG DES LIGNES
    if (mousePosRef.current.active) {
      const hBeam = ctx.createLinearGradient(0, ly - 3, 0, ly + 3);
      hBeam.addColorStop(0, "rgba(255, 255, 255, 0)");
      hBeam.addColorStop(0.5, "rgba(255, 255, 255, 0.32)");
      hBeam.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = hBeam;
      ctx.fillRect(0, ly - 3, CANVAS_SIZE, 6);

      const vBeam = ctx.createLinearGradient(lx - 3, 0, lx + 3, 0);
      vBeam.addColorStop(0, "rgba(255, 255, 255, 0)");
      vBeam.addColorStop(0.5, "rgba(255, 255, 255, 0.32)");
      vBeam.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = vBeam;
      ctx.fillRect(lx - 3, 0, 6, CANVAS_SIZE);
    }

    // COUCHE 4 : ONDES ÉLECTRIQUES DE TEST PROBE
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

    // COUCHE 5 : RÉTICULE LASER SUR LE DIE SURVOLÉ
    if (hoveredDie) {
      ctx.save();
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 8;
      ctx.strokeRect(hoveredDie.x, hoveredDie.y, DIE_SIZE, DIE_SIZE);

      ctx.fillStyle = "rgba(212, 175, 55, 0.32)";
      ctx.fillRect(hoveredDie.x, hoveredDie.y, DIE_SIZE, DIE_SIZE);
      ctx.restore();
    }

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(render);
  }, [hoveredDie, iridAngle]);

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

    // Faire pivoter l'angle d'iridescence avec la position de la souris
    const angle = Math.round(Math.atan2(normY, normX) * (180 / Math.PI) + 180);
    setIridAngle(angle);

    const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;
    mousePosRef.current = { x: canvasX, y: canvasY, active: true };

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
      {!standalone && (
        <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 font-mono text-[10px] text-mute uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-ink">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SEMI 300mm · CZ SILICON P-TYPE ⟨100⟩</span>
          </span>
          <span className="text-right">
            {hoveredDie ? (
              <span className="text-amber-500 font-semibold">DIE [{hoveredDie.col}, {hoveredDie.row}] · PROBE READY</span>
            ) : (
              <span>{totalDiesCount || 1080} DIES · 100% YIELD</span>
            )}
          </span>
        </div>
      )}

      {/* Disque de Silicium 3D Flottant avec biseau métallique poli */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleWaferClick}
        className={`relative aspect-square w-full select-none flex items-center justify-center transition-shadow duration-500 ${
          standalone
            ? "max-w-none p-0 bg-transparent border-none shadow-none cursor-pointer"
            : "max-w-[420px] cursor-crosshair rounded-full bg-gradient-to-tr from-[#080C14] via-[#131C2D] to-[#0A0E18] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5),0_10px_30px_-10px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-4px_12px_rgba(0,0,0,0.95)] border border-white/20 p-1"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="h-full w-full rounded-full transition-transform duration-300 hover:scale-[1.01]"
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

      {/* Fiche de télémétrie industrielle sous le wafer */}
      {!standalone && (
        <div className="mt-3.5 flex items-center justify-between w-full max-w-[420px] font-mono text-[10.5px] text-mute px-2">
          <div className="flex items-center gap-1.5">
            <Crosshair className="size-3.5 text-signal" />
            <span className="font-semibold text-ink">
              {hoveredDie ? `DIE [${hoveredDie.col}, ${hoveredDie.row}]` : `WAFER 300mm`}
            </span>
            <span className="text-mute/60 hidden sm:inline">
              · {totalDiesCount || 1080} DIES · ASML DUV 193nm
            </span>
          </div>
          <div className="flex items-center gap-1 text-signal font-semibold">
            <Cpu className="size-3" />
            <span>RV32I TAPE-OUT</span>
          </div>
        </div>
      )}
    </div>
  );
}
