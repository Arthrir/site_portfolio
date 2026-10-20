import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Cpu } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
}

// Paramètres géométriques calibrés d'après les vrais wafers de laboratoire
const CANVAS_SIZE = 960; // Résolution haute définition Retina
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
const WAFER_RADIUS = 472; // Rayon du disque de silicium pur
const STEPPED_RADIUS = WAFER_RADIUS - 16; // Frontière d'exclusion en escalier (stepped edge)

// Grille de 44x44 dies : ~88 lignes orthogonales nettement visibles, comme sur les vrais wafers
const GRID_COLS = 44;
const DIE_PITCH = (STEPPED_RADIUS * 2) / GRID_COLS; // ~20.7px par die
const DIE_INNER_SIZE = DIE_PITCH - 1.4; // Rue de découpe (scribe lane) de 1.4px
const ORIGIN_X = CX - STEPPED_RADIUS;
const ORIGIN_Y = CY - STEPPED_RADIUS;

interface DieInfo {
  c: number;
  r: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tint: string;
}

interface SelectedDie {
  col: number;
  row: number;
  screenX: number;
  screenY: number;
}

interface ProbeRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function SiliconWafer({ onColorChange }: SiliconWaferProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const diesMapRef = useRef<DieInfo[]>([]);

  // Valeurs de mouvement 3D interactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 180, damping: 24 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-7, 7]), { stiffness: 180, damping: 24 });

  // Télémétrie d'inspection
  const [hoveredDie, setHoveredDie] = useState<SelectedDie | null>(null);
  const [selectedDie, setSelectedDie] = useState<SelectedDie>({
    col: 22,
    row: 22,
    screenX: CX,
    screenY: CY,
  });
  const [totalDiesCount, setTotalDiesCount] = useState(1528);
  const [iridAngle, setIridAngle] = useState(135);

  const colors = ["#D4AF37", "#2340F0", "#10B981", "#E10600", "#8B5CF6", "#06B6D4"];
  const ripplesRef = useRef<ProbeRipple[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: CX, y: CY, active: false });

  // 1. GÉNÉRATION DU FOND DU WAFER : SUBSTRAT SILICIUM, LIGNES DE DÉCOUPE NETTES & DIES MULTI-SECTIONS
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // Découpe circulaire stricte du disque de silicium (aucun cadre ni contour artificiel)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // A. Substrat miroir poli en silicium brut CZ P-type <100> (teinte obsidienne / bleu nuit profond)
    const bgGrad = ctx.createRadialGradient(CX - 120, CY - 120, 40, CX, CY, WAFER_RADIUS);
    bgGrad.addColorStop(0.0, "#131C30");
    bgGrad.addColorStop(0.4, "#0A1122");
    bgGrad.addColorStop(0.85, "#050914");
    bgGrad.addColorStop(1.0, "#020409");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // B. Détection et dessin des dies avec contour en escalier (stepped die layout)
    const dies: DieInfo[] = [];
    const r2 = STEPPED_RADIUS * STEPPED_RADIUS;

    // Nuances d'interférence réalistes par die (comme sur les vrais wafers du labo)
    const dieTints = [
      "#131E35", "#16233E", "#111B30", "#182744", "#121C32",
      "#15213B", "#10192D", "#1A2B4A", "#142038"
    ];

    for (let r = 0; r < GRID_COLS; r++) {
      const dy = CY - STEPPED_RADIUS + (r + 0.5) * DIE_PITCH - CY;
      const dy2 = dy * dy;

      for (let c = 0; c < GRID_COLS; c++) {
        const dx = CX - STEPPED_RADIUS + (c + 0.5) * DIE_PITCH - CX;
        if (dx * dx + dy2 <= r2) {
          const x = ORIGIN_X + c * DIE_PITCH + 0.7;
          const y = ORIGIN_Y + r * DIE_PITCH + 0.7;
          const tintIdx = (c * 7 + r * 13 + ((c >> 2) ^ (r >> 2))) % dieTints.length;

          dies.push({
            c,
            r,
            x,
            y,
            w: DIE_INNER_SIZE,
            h: DIE_INNER_SIZE,
            tint: dieTints[tintIdx],
          });
        }
      }
    }

    diesMapRef.current = dies;
    setTotalDiesCount(dies.length);

    // C. Rendu des micro-circuits à l'intérieur de chaque die
    for (const die of dies) {
      // 1. Fond du die en silicium actif
      ctx.fillStyle = die.tint;
      ctx.fillRect(die.x, die.y, die.w, die.h);

      // 2. Anneau de plots de contact I/O périphériques (pad ring)
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(die.x, die.y, die.w, 1.2);
      ctx.fillRect(die.x, die.y + die.h - 1.2, die.w, 1.2);
      ctx.fillRect(die.x, die.y, 1.2, die.h);
      ctx.fillRect(die.x + die.w - 1.2, die.y, 1.2, die.h);

      // 3. Sous-blocs fonctionnels internes (cœur RISC-V, mémoire SRAM, matrice de bus)
      const subW = (die.w - 3.6) / 2;
      const subH = (die.h - 3.6) / 2;

      // Cœur logique CPU (en haut à gauche)
      ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
      ctx.fillRect(die.x + 1.8, die.y + 1.8, subW, subH);

      // Banc de mémoire cache SRAM (en haut à droite, densité de métaux M1-M3)
      ctx.fillStyle = "rgba(212, 175, 55, 0.14)";
      ctx.fillRect(die.x + 2.4 + subW, die.y + 1.8, subW, subH);

      // Micro-lignes de gravure internes (fines interconnexions)
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillRect(die.x + 1.8, die.y + 2.4 + subH, die.w - 3.6, subH);
    }

    // D. RUES DE DÉCOUPE ORTHOGONALES TRÈS NETTES (LES LIGNES DU WAFER)
    // Lignes verticales de découpe (dicing streets)
    ctx.strokeStyle = "#04070F";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c++) {
      const x = ORIGIN_X + c * DIE_PITCH;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_SIZE);
    }
    // Lignes horizontales de découpe
    for (let r = 0; r <= GRID_COLS; r++) {
      const y = ORIGIN_Y + r * DIE_PITCH;
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_SIZE, y);
    }
    ctx.stroke();

    // Rues principales de réticules d'exposition ASML (toutes les 8 cases)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c += 8) {
      const x = ORIGIN_X + c * DIE_PITCH;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_SIZE);
    }
    for (let r = 0; r <= GRID_COLS; r += 8) {
      const y = ORIGIN_Y + r * DIE_PITCH;
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_SIZE, y);
    }
    ctx.stroke();

    // E. Fin biseau poli en périphérie du disque (EBR) & encoche SEMI à 270°
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Encoche SEMI en V au bas du wafer (repère mécanique pour robot)
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(CX - 6, CANVAS_SIZE);
    ctx.lineTo(CX, CANVAS_SIZE - 9);
    ctx.lineTo(CX + 6, CANVAS_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
    offscreenRef.current = offscreen;
  }, []);

  // 2. BOUCLE DE RENDU DYNAMIQUE : CROIX DE DIFFRACTION LUMINEUSE (COMME SUR LA PHOTO) & PROBE
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dessin du fond pré-calculé contenant la grille géométrique du wafer
    if (offscreenRef.current) {
      ctx.drawImage(offscreenRef.current, 0, 0);
    }

    // Masque circulaire du wafer
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // COUCHE 1 : SPECTRE HOLOGRAPHIQUE DE DIFFRACTION DE BRAGG DANS LES DIES
    const radAngle = (iridAngle * Math.PI) / 180;
    const cosA = Math.cos(radAngle);
    const sinA = Math.sin(radAngle);

    const iridGrad = ctx.createLinearGradient(
      CX - cosA * WAFER_RADIUS,
      CY - sinA * WAFER_RADIUS,
      CX + cosA * WAFER_RADIUS,
      CY + sinA * WAFER_RADIUS
    );
    iridGrad.addColorStop(0.0, "rgba(147, 51, 234, 0.35)"); // Violet néon
    iridGrad.addColorStop(0.2, "rgba(59, 130, 246, 0.42)");  // Bleu électrique
    iridGrad.addColorStop(0.4, "rgba(6, 182, 212, 0.45)");   // Cyan laser
    iridGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.40)");  // Vert émeraude
    iridGrad.addColorStop(0.78, "rgba(245, 158, 11, 0.44)"); // Or chaud
    iridGrad.addColorStop(0.9, "rgba(239, 68, 68, 0.35)");   // Rouge rubis
    iridGrad.addColorStop(1.0, "rgba(236, 72, 153, 0.35)");  // Magenta

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = iridGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 2 : L'ÉCLAT DE LUMIÈRE EN CROIX CRUCIFORME (IDENTIQUE À LA PHOTO DU WAFER)
    // Les micro-sillons orthogonaux diffractent la lumière blanche en une immense croix brillante
    const lx = mousePosRef.current.x;
    const ly = mousePosRef.current.y;

    // Faisceau horizontal de lumière laser le long de la ligne
    const hFlare = ctx.createLinearGradient(0, ly - 14, 0, ly + 14);
    hFlare.addColorStop(0, "rgba(255, 255, 255, 0)");
    hFlare.addColorStop(0.5, "rgba(255, 255, 255, 0.65)");
    hFlare.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = hFlare;
    ctx.fillRect(0, ly - 14, CANVAS_SIZE, 28);

    // Faisceau vertical de lumière laser le long de la colonne
    const vFlare = ctx.createLinearGradient(lx - 14, 0, lx + 14, 0);
    vFlare.addColorStop(0, "rgba(255, 255, 255, 0)");
    vFlare.addColorStop(0.5, "rgba(255, 255, 255, 0.65)");
    vFlare.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = vFlare;
    ctx.fillRect(lx - 14, 0, 28, CANVAS_SIZE);

    // Point spéculaire central brillant de la lampe de salle blanche
    const spotGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 180);
    spotGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.85)");
    spotGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.40)");
    spotGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.12)");
    spotGrad.addColorStop(1.0, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 3 : ONDES ÉLECTRIQUES DE TEST PROBE (RIPPLES AU CLIC)
    ctx.globalCompositeOperation = "source-over";
    ripplesRef.current = ripplesRef.current.filter((rp) => {
      rp.radius += 6;
      rp.alpha *= 0.94;
      if (rp.alpha < 0.02 || rp.radius > rp.maxRadius) return false;

      ctx.save();
      ctx.strokeStyle = rp.color;
      ctx.globalAlpha = rp.alpha;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.stroke();

      if (rp.radius > 20) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    });

    // COUCHE 4 : RÉTICULE D'INSPECTION LORS DU SURVOL
    if (mousePosRef.current.active && hoveredDie) {
      const dieX = ORIGIN_X + hoveredDie.col * DIE_PITCH;
      const dieY = ORIGIN_Y + hoveredDie.row * DIE_PITCH;

      ctx.save();
      // Reticule laser autour du die sélectionné
      ctx.strokeStyle = "#06B6D4";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "#06B6D4";
      ctx.shadowBlur = 10;
      ctx.strokeRect(dieX - 1, dieY - 1, DIE_PITCH + 2, DIE_PITCH + 2);

      // Remplissage laser éclatant
      ctx.fillStyle = "rgba(6, 182, 212, 0.35)";
      ctx.fillRect(dieX, dieY, DIE_PITCH, DIE_PITCH);

      ctx.restore();
    }

    // COUCHE 5 : DIE SÉLECTIONNÉ PERMANENT (POINT D'ALIMENTATION PROBE ACTIF)
    if (selectedDie) {
      const sX = ORIGIN_X + selectedDie.col * DIE_PITCH;
      const sY = ORIGIN_Y + selectedDie.row * DIE_PITCH;

      ctx.save();
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 12;
      ctx.strokeRect(sX - 1.5, sY - 1.5, DIE_PITCH + 3, DIE_PITCH + 3);

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(sX + 1, sY + 1, DIE_PITCH - 2, DIE_PITCH - 2);
      ctx.restore();
    }

    ctx.restore();

    if (ripplesRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [iridAngle, selectedDie, hoveredDie]);

  useEffect(() => {
    render();
  }, [render]);

  // INTERACTIONS SOURIS
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(nx);
    my.set(ny);

    const angle = Math.round(Math.atan2(ny, nx) * (180 / Math.PI) + 180);
    setIridAngle(angle);

    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const dx = canvasX - CX;
    const dy = canvasY - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= STEPPED_RADIUS) {
      mousePosRef.current = { x: canvasX, y: canvasY, active: true };
      const col = Math.floor((canvasX - ORIGIN_X) / DIE_PITCH);
      const row = Math.floor((canvasY - ORIGIN_Y) / DIE_PITCH);

      if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_COLS) {
        setHoveredDie({ col, row, screenX: canvasX, screenY: canvasY });
      }
    } else {
      mousePosRef.current = { x: canvasX, y: canvasY, active: false };
      setHoveredDie(null);
    }

    render();
  };

  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
    mousePosRef.current = { x: CX, y: CY, active: false };
    setHoveredDie(null);
    render();
  };

  const handleWaferClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const dx = canvasX - CX;
    const dy = canvasY - CY;
    if (Math.sqrt(dx * dx + dy * dy) > STEPPED_RADIUS) return;

    const col = Math.floor((canvasX - ORIGIN_X) / DIE_PITCH);
    const row = Math.floor((canvasY - ORIGIN_Y) / DIE_PITCH);

    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_COLS) {
      setSelectedDie({ col, row, screenX: canvasX, screenY: canvasY });

      const chosenColor = colors[(col + row) % colors.length];
      ripplesRef.current.push({
        x: canvasX,
        y: canvasY,
        radius: 2,
        maxRadius: 400,
        alpha: 1.0,
        color: chosenColor,
      });

      if (onColorChange) {
        onColorChange(chosenColor);
      }

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(render);
    }
  };

  const currentDie = hoveredDie || selectedDie;

  return (
    <div className="relative w-full max-w-[440px] select-none [perspective:1200px]">
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry }}
        className="group relative aspect-square w-full rounded-full [transform-style:preserve-3d] cursor-crosshair drop-shadow-[0_25px_45px_rgba(0,0,0,0.35)]"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleWaferClick}
      >
        {/* LE VRAI DISQUE DE SILICIUM BRUT : AUCUN CADRE, AUCUNE BORDURE ARTIFICIELLE */}
        <div className="relative size-full rounded-full overflow-hidden flex items-center justify-center bg-[#02050B]">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="size-full rounded-full object-cover pointer-events-none"
          />
        </div>
      </motion.div>

      {/* Télémétrie d'inspection sous le wafer */}
      <div className="mt-4 flex items-center justify-between font-mono text-[10.5px] text-mute px-2">
        <div className="flex items-center gap-1.5">
          <Crosshair className="size-3.5 text-signal" />
          <span className="font-semibold text-ink">
            DIE [{currentDie.col}, {currentDie.row}]
          </span>
          <span className="text-mute/60 hidden sm:inline">
            · {totalDiesCount.toLocaleString()} DIES · YIELD 99.85%
          </span>
          <span className="text-mute/60 sm:hidden">
            · {totalDiesCount} DIES
          </span>
        </div>
        <div className="flex items-center gap-1 text-signal font-semibold">
          <Cpu className="size-3" />
          <span>RV32I 200mm</span>
        </div>
      </div>
    </div>
  );
}
