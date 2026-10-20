import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Cpu } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
}

// Paramètres de géométrie pour ~80 000 micro-dies (wafer standard 300mm post-lithographie)
const CANVAS_SIZE = 960; // Haute résolution Retina
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
// Va 100% jusqu'au bord du disque de silicium (sans marge ni bordure artificielle)
const WAFER_RADIUS = CX - 1; // 479px de rayon
const DIE_PITCH = 3.0; // 3px par micro-die -> 319 dies de diamètre -> ~80 000 dies réels !
const DIES_PER_FIELD = 16; // Stepper lithographique ASML : 16x16 micro-dies par champ d'exposition
const FIELD_SIZE = DIES_PER_FIELD * DIE_PITCH; // 48px par champ de réticule

interface SelectedDie {
  col: number;
  row: number;
  fieldX: number;
  fieldY: number;
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

  // Valeurs de mouvement 3D interactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 180, damping: 24 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 180, damping: 24 });

  // Télémétrie d'inspection
  const [hoveredDie, setHoveredDie] = useState<SelectedDie | null>(null);
  const [selectedDie, setSelectedDie] = useState<SelectedDie>({
    col: 160,
    row: 160,
    fieldX: 10,
    fieldY: 10,
  });
  const [iridAngle, setIridAngle] = useState(135);

  const colors = ["#D4AF37", "#2340F0", "#10B981", "#E10600", "#8B5CF6", "#06B6D4"];
  const ripplesRef = useRef<ProbeRipple[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: CX, y: CY, active: false });

  // 1. GÉNÉRATION DU WAFER : PATTERN 100% RÉGULIER, JUSQU'AU BORD, SANS AUCUN CONTOUR ARTIFICIEL
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // Découpe circulaire stricte du disque de silicium (sans bordure ni cadre)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // A. Substrat silicium miroir pur monocristallin CZ P-type <100>
    const bgGrad = ctx.createRadialGradient(CX - 120, CY - 120, 30, CX, CY, WAFER_RADIUS);
    bgGrad.addColorStop(0.0, "#0E1729");
    bgGrad.addColorStop(0.45, "#080E1C");
    bgGrad.addColorStop(0.85, "#040812");
    bgGrad.addColorStop(1.0, "#020409");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // B. Création du carreau unitaire de micro-die (Texture GPU 100% régulière, laser-précise)
    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = DIE_PITCH * 2; // 6px x 6px (2x2 dies pour aligner sub-pixel et rues)
    tileCanvas.height = DIE_PITCH * 2;
    const tctx = tileCanvas.getContext("2d");
    if (tctx) {
      // Fond des rues de découpe sombres (dicing streets)
      tctx.fillStyle = "#03060E";
      tctx.fillRect(0, 0, DIE_PITCH * 2, DIE_PITCH * 2);

      // Dessin de 4 micro-dies strictement identiques et parfaitement réguliers
      for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
          const dx = tx * DIE_PITCH + 0.45;
          const dy = ty * DIE_PITCH + 0.45;
          const dw = DIE_PITCH - 0.7; // ~2.3px
          const dh = DIE_PITCH - 0.7;

          // Anneau de plots I/O métallique brillant
          tctx.fillStyle = "#18263E";
          tctx.fillRect(dx, dy, dw, dh);

          // Cœur logique CMOS haute densité
          tctx.fillStyle = "#0F1829";
          tctx.fillRect(dx + 0.4, dy + 0.4, dw - 0.8, dh - 0.8);

          // Micro-centre actif réfléchissant
          tctx.fillStyle = "#1C2E4D";
          tctx.fillRect(dx + 0.7, dy + 0.7, dw - 1.4, dh - 1.4);
        }
      }
    }

    // Répétition mathématiquement parfaite du pattern de micro-dies sur TOUTE la surface
    const pattern = ctx.createPattern(tileCanvas, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    // C. Grille d'exposition des champs de stepper ASML (16x16 dies = 48px x 48px)
    // Chaque champ a une subtile variation de phase d'oxyde régulière (effet damier authentique)
    const totalFields = Math.ceil(CANVAS_SIZE / FIELD_SIZE);
    for (let fy = 0; fy < totalFields; fy++) {
      for (let fx = 0; fx < totalFields; fx++) {
        const fieldX = fx * FIELD_SIZE;
        const fieldY = fy * FIELD_SIZE;

        // Nuance optique subtile et propre par champ d'exposition
        const isAlt = (fx + fy) % 2 === 0;
        const isSuper = (fx * 3 + fy * 5) % 7 === 0;

        ctx.fillStyle = isSuper
          ? "rgba(6, 182, 212, 0.04)"
          : isAlt
          ? "rgba(255, 255, 255, 0.03)"
          : "rgba(0, 0, 0, 0.06)";
        ctx.fillRect(fieldX, fieldY, FIELD_SIZE, FIELD_SIZE);

        // Lignes de rues principales du réticule
        ctx.strokeStyle = "rgba(4, 7, 15, 0.85)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(fieldX, fieldY, FIELD_SIZE, FIELD_SIZE);

        // Mire d'alignement PCM (Process Control Monitor) aux 4 coins du champ de stepper
        ctx.fillStyle = "rgba(212, 175, 55, 0.35)";
        ctx.fillRect(fieldX - 1, fieldY - 1, 2, 2);
      }
    }

    // D. Encoche d'orientation normalisée SEMI (Notch à 270° au bas du wafer)
    // Découpe authentique en V dans le disque de silicium
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(CX - 5, CANVAS_SIZE);
    ctx.lineTo(CX, CANVAS_SIZE - 7);
    ctx.lineTo(CX + 5, CANVAS_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // E. Fin biseau chanfreiné poli au bord extrême (1px, sans aucune bordure artificielle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    offscreenRef.current = offscreen;
  }, []);

  // 2. BOUCLE DE RENDU DYNAMIQUE : DIFFRACTION OPTIQUE MULTI-ORDRES & INSPECTION
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dessin du fond pré-calculé contenant les ~80 000 dies réguliers
    if (offscreenRef.current) {
      ctx.drawImage(offscreenRef.current, 0, 0);
    }

    // Masque circulaire parfait du disque de silicium
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // COUCHE 1 : SPECTRE DE DIFFRACTION DE BRAGG POST-LITHOGRAPHIE (ARC-EN-CIEL NATUREL DU SILICIUM)
    const radAngle = (iridAngle * Math.PI) / 180;
    const cosA = Math.cos(radAngle);
    const sinA = Math.sin(radAngle);

    const iridGrad = ctx.createLinearGradient(
      CX - cosA * WAFER_RADIUS,
      CY - sinA * WAFER_RADIUS,
      CX + cosA * WAFER_RADIUS,
      CY + sinA * WAFER_RADIUS
    );
    iridGrad.addColorStop(0.0, "rgba(139, 92, 246, 0.32)"); // Violet néon
    iridGrad.addColorStop(0.2, "rgba(59, 130, 246, 0.38)"); // Bleu électrique
    iridGrad.addColorStop(0.4, "rgba(6, 182, 212, 0.42)");  // Cyan laser
    iridGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.36)"); // Vert émeraude
    iridGrad.addColorStop(0.8, "rgba(245, 158, 11, 0.40)"); // Or chaud
    iridGrad.addColorStop(0.92, "rgba(239, 68, 68, 0.32)"); // Rouge rubis
    iridGrad.addColorStop(1.0, "rgba(236, 72, 153, 0.32)"); // Magenta

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = iridGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Anneaux concentriques d'interférences de lames minces
    const ringGrad = ctx.createRadialGradient(
      mousePosRef.current.x,
      mousePosRef.current.y,
      15,
      mousePosRef.current.x,
      mousePosRef.current.y,
      WAFER_RADIUS * 0.95
    );
    ringGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.40)");
    ringGrad.addColorStop(0.25, "rgba(59, 130, 246, 0.16)");
    ringGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.14)");
    ringGrad.addColorStop(0.75, "rgba(16, 185, 129, 0.15)");
    ringGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = ringGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 2 : REFLET SPÉCULAIRE DE SALLE BLANCHE QUI SUIT LA SOURIS
    const specGrad = ctx.createRadialGradient(
      mousePosRef.current.x,
      mousePosRef.current.y,
      0,
      mousePosRef.current.x,
      mousePosRef.current.y,
      260
    );
    specGrad.addColorStop(0, "rgba(255, 255, 255, 0.48)");
    specGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.12)");
    specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 3 : ONDES ÉLECTRIQUES DE TEST PROBE (RIPPLES AU CLIC)
    ctx.globalCompositeOperation = "source-over";
    ripplesRef.current = ripplesRef.current.filter((rp) => {
      rp.radius += 5.5;
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

    // COUCHE 4 : RÉTICULES D'INSPECTION LITHOGRAPHIQUE AU SURVOL
    if (mousePosRef.current.active) {
      const hx = mousePosRef.current.x;
      const hy = mousePosRef.current.y;

      const col = Math.floor(hx / DIE_PITCH);
      const row = Math.floor(hy / DIE_PITCH);
      const fieldX = Math.floor(col / DIES_PER_FIELD);
      const fieldY = Math.floor(row / DIES_PER_FIELD);

      const dieScreenX = col * DIE_PITCH + DIE_PITCH / 2;
      const dieScreenY = row * DIE_PITCH + DIE_PITCH / 2;

      // Délimitation du champ de réticule actif (16x16 dies)
      const fStartX = fieldX * FIELD_SIZE;
      const fStartY = fieldY * FIELD_SIZE;

      ctx.save();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(fStartX, fStartY, FIELD_SIZE, FIELD_SIZE);
      ctx.fillStyle = "rgba(6, 182, 212, 0.07)";
      ctx.fillRect(fStartX, fStartY, FIELD_SIZE, FIELD_SIZE);

      // Axes laser transversaux précis
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(0, dieScreenY);
      ctx.lineTo(CANVAS_SIZE, dieScreenY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(dieScreenX, 0);
      ctx.lineTo(dieScreenX, CANVAS_SIZE);
      ctx.stroke();

      // Micro-die ciblé (glow laser net)
      ctx.setLineDash([]);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#06B6D4";
      ctx.shadowBlur = 10;
      ctx.fillRect(col * DIE_PITCH - 0.5, row * DIE_PITCH - 0.5, DIE_PITCH + 1, DIE_PITCH + 1);

      ctx.restore();
    }

    // COUCHE 5 : DIE SÉLECTIONNÉ PERMANENT (POINT D'ALIMENTATION PROBE ACTIF)
    if (selectedDie) {
      ctx.save();
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(
        selectedDie.col * DIE_PITCH - 1,
        selectedDie.row * DIE_PITCH - 1,
        DIE_PITCH + 2,
        DIE_PITCH + 2
      );
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(
        selectedDie.col * DIE_PITCH - 2.5,
        selectedDie.row * DIE_PITCH - 2.5,
        DIE_PITCH + 5,
        DIE_PITCH + 5
      );
      ctx.restore();
    }

    ctx.restore();

    if (ripplesRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [iridAngle, selectedDie]);

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

    if (dist <= WAFER_RADIUS) {
      mousePosRef.current = { x: canvasX, y: canvasY, active: true };
      const col = Math.floor(canvasX / DIE_PITCH);
      const row = Math.floor(canvasY / DIE_PITCH);
      const fieldX = Math.floor(col / DIES_PER_FIELD);
      const fieldY = Math.floor(row / DIES_PER_FIELD);

      setHoveredDie({ col, row, fieldX, fieldY });
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
    if (Math.sqrt(dx * dx + dy * dy) > WAFER_RADIUS) return;

    const col = Math.floor(canvasX / DIE_PITCH);
    const row = Math.floor(canvasY / DIE_PITCH);
    const fieldX = Math.floor(col / DIES_PER_FIELD);
    const fieldY = Math.floor(row / DIES_PER_FIELD);

    setSelectedDie({ col, row, fieldX, fieldY });

    const chosenColor = colors[(col + row) % colors.length];
    ripplesRef.current.push({
      x: canvasX,
      y: canvasY,
      radius: 2,
      maxRadius: 380,
      alpha: 1.0,
      color: chosenColor,
    });

    if (onColorChange) {
      onColorChange(chosenColor);
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);
  };

  const currentDie = hoveredDie || selectedDie;

  return (
    <div className="relative w-full max-w-[440px] select-none [perspective:1200px]">
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry }}
        className="group relative aspect-square w-full rounded-full [transform-style:preserve-3d] cursor-crosshair drop-shadow-[0_25px_40px_rgba(0,0,0,0.3)]"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleWaferClick}
      >
        {/* LE VRAI DISQUE DE SILICIUM : PURE, SANS AUCUN CONTOUR NI BORDURE ARTIFICIELLE */}
        <div className="relative size-full rounded-full overflow-hidden flex items-center justify-center bg-[#02050B]">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="size-full rounded-full object-cover pointer-events-none"
          />
        </div>
      </motion.div>

      {/* Fiche de télémétrie industrielle sous le wafer */}
      <div className="mt-4 flex items-center justify-between font-mono text-[10.5px] text-mute px-2">
        <div className="flex items-center gap-1.5">
          <Crosshair className="size-3.5 text-signal" />
          <span className="font-semibold text-ink">
            DIE [{currentDie.col}, {currentDie.row}]
          </span>
          <span className="text-mute/60 hidden sm:inline">
            · ~80,000 DIES · YIELD 99.85%
          </span>
          <span className="text-mute/60 sm:hidden">
            · ~80K DIES
          </span>
        </div>
        <div className="flex items-center gap-1 text-signal font-semibold">
          <Cpu className="size-3" />
          <span>RV32I 300mm</span>
        </div>
      </div>
    </div>
  );
}
