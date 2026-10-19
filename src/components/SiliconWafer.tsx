import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Cpu, Sparkles, Layers, Zap } from "lucide-react";

interface SiliconWaferProps {
  onColorChange?: (color: string) => void;
}

// Paramètres de géométrie pour ~50 000 micro-dies (wafer standard 300mm post-lithographie)
const CANVAS_SIZE = 840; // Résolution interne Retina haute définition
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
const WAFER_RADIUS = CANVAS_SIZE * 0.468; // ~393px
const EBR_RADIUS = WAFER_RADIUS - 9; // ~384px (Edge Bead Removal 2.5mm exclusion)
const DIE_PITCH = 3.12; // 384 * 2 / 3.12 = 246 dies across -> pi * 123^2 ~= 49 560 dies !
const ORIGIN_X = CX - EBR_RADIUS;
const ORIGIN_Y = CY - EBR_RADIUS;
const DIES_PER_FIELD = 14; // Stepper lithographique ASML : 14x14 dies par champ de reticule

interface SelectedDie {
  col: number;
  row: number;
  fieldX: number;
  fieldY: number;
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

  // Valeurs de mouvement 3D interactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 180, damping: 22 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-7, 7]), { stiffness: 180, damping: 22 });

  // Télémétrie d'inspection
  const [hoveredDie, setHoveredDie] = useState<SelectedDie | null>(null);
  const [selectedDie, setSelectedDie] = useState<SelectedDie>({
    col: 123,
    row: 123,
    fieldX: 8,
    fieldY: 8,
    screenX: CX,
    screenY: CY,
  });
  const [showLoupe, setShowLoupe] = useState(true);
  const [totalDiesCount, setTotalDiesCount] = useState(49560);
  const [iridAngle, setIridAngle] = useState(135);

  const colors = ["#2340F0", "#D4AF37", "#10B981", "#E10600", "#8B5CF6", "#06B6D4"];
  const ripplesRef = useRef<ProbeRipple[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: CX, y: CY, active: false });

  // 1. GÉNÉRATION HAUTE-PERFORMANCE DU FOND DU WAFER (50 000 DIES PRÉ-CALCULÉS EN IMAGE BUFFER)
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Dégradé miroir du substrat silicium brut CZ P-type <100>
    const bgGrad = ctx.createRadialGradient(CX - 80, CY - 80, 20, CX, CY, WAFER_RADIUS + 10);
    bgGrad.addColorStop(0, "#121A2B");
    bgGrad.addColorStop(0.5, "#0A0F1D");
    bgGrad.addColorStop(0.85, "#060913");
    bgGrad.addColorStop(1, "#020408");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dessin de l'anneau de biseau et d'exclusion (Edge Bead Removal 3mm)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Rendu pixel par pixel ultra-rapide des ~50 000 dies
    const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data32 = new Uint32Array(imgData.data.buffer);
    const rWafer2 = WAFER_RADIUS * WAFER_RADIUS;
    const rEbr2 = EBR_RADIUS * EBR_RADIUS;

    // Couleurs ABGR pour Uint32Array (Little-Endian)
    const COL_SCRIBE = 0xFF0B0703; // Rues de découpe inter-die sombres
    const COL_STEPPER_SCRIBE = 0xFF140D06; // Rues de reticule d'exposition
    const COL_BEVEL = 0xFF2A2218; // Biseau silicium poli
    const COL_EBR_LINE = 0xFF58452A; // Ligne de séparation EBR dorée/bronze
    const COL_NOTCH = 0xFF000000; // Encoche SEMI

    let validDies = 0;
    const countedKeys = new Set<number>();

    for (let y = 0; y < CANVAS_SIZE; y++) {
      const dy = y - CY;
      const dy2 = dy * dy;
      const rowIdx = y * CANVAS_SIZE;

      for (let x = 0; x < CANVAS_SIZE; x++) {
        const dx = x - CX;
        const dist2 = dx * dx + dy2;

        // Hors du disque silicium
        if (dist2 > rWafer2) {
          data32[rowIdx + x] = 0x00000000;
          continue;
        }

        // Encoche d'orientation SEMI (Notch à 270° au bas du wafer)
        if (Math.abs(dx) < 5 && dy > WAFER_RADIUS - 9 && dy < WAFER_RADIUS - 2) {
          data32[rowIdx + x] = COL_NOTCH;
          continue;
        }

        // Anneau extérieur poli d'exclusion de bordure (Edge Bead Removal)
        if (dist2 > rEbr2) {
          if (dist2 > (EBR_RADIUS + 1) * (EBR_RADIUS + 1) && dist2 < (EBR_RADIUS + 2.5) * (EBR_RADIUS + 2.5)) {
            data32[rowIdx + x] = COL_EBR_LINE;
          } else {
            // Nuance métallique de silicium poli brut
            const angle = Math.atan2(dy, dx);
            const sheen = Math.sin(angle * 4) * 12 + 25;
            data32[rowIdx + x] = 0xFF000000 | ((sheen + 10) << 16) | ((sheen + 8) << 8) | sheen;
          }
          continue;
        }

        // ZONE ACTIVE DU WAFER : DIES POST-LITHOGRAPHIE EDGE-TO-EDGE
        const relX = x - ORIGIN_X;
        const relY = y - ORIGIN_Y;
        const col = Math.floor(relX / DIE_PITCH);
        const row = Math.floor(relY / DIE_PITCH);

        // Comptage des micro-dies uniques
        const dieKey = (col << 16) | row;
        if (!countedKeys.has(dieKey)) {
          countedKeys.add(dieKey);
          validDies++;
        }

        // Coordonnées intra-die (sub-pixel)
        const subX = relX % DIE_PITCH;
        const subY = relY % DIE_PITCH;

        // Champ d'exposition du stepper lithographique (14x14 dies par reticule)
        const fieldX = Math.floor(col / DIES_PER_FIELD);
        const fieldY = Math.floor(row / DIES_PER_FIELD);
        const isFieldBorder = (col % DIES_PER_FIELD === 0 && subX < 0.8) || (row % DIES_PER_FIELD === 0 && subY < 0.8);
        const isDieScribe = subX < 0.55 || subY < 0.55;

        if (isFieldBorder) {
          // Rue de reticule principale avec structures de test PCM
          const isPcmPoint = (col % DIES_PER_FIELD === 0) && (row % DIES_PER_FIELD === 0) && subX > 0.3 && subY > 0.3;
          data32[rowIdx + x] = isPcmPoint ? 0xFF9E8445 : COL_STEPPER_SCRIBE;
        } else if (isDieScribe) {
          // Rues de découpe inter-die (dicing streets)
          data32[rowIdx + x] = COL_SCRIBE;
        } else {
          // CŒUR DU MICRO-DIE ACTIF (Circuiterie CMOS 193nm DUV)
          // Variation chromatique optique par champ de stepper (effet de damier holographique réel)
          const fieldHash = ((fieldX * 374761393 + fieldY * 668265263) ^ (fieldX << 3)) & 0xFF;
          const tintShift = (fieldHash % 7) - 3; // -3 à +3 de nuance

          // Sub-division fonctionnelle du die (Pad Ring vs Core Logic vs SRAM cache)
          const isPadRing = subX < 1.0 || subY < 1.0 || subX > DIE_PITCH - 1.0 || subY > DIE_PITCH - 1.0;
          const isCacheBlock = (subX > 1.2 && subX < 2.2) && (subY > 1.2 && subY < 2.0);

          let r = 16 + tintShift;
          let g = 26 + tintShift * 2;
          let b = 44 + tintShift * 3;

          if (isPadRing) {
            // Plot de contact I/O métallique brillant
            r += 14;
            g += 18;
            b += 28;
          } else if (isCacheBlock) {
            // Bloc SRAM haute densité (densité de vias métaux M1-M4)
            r += 8;
            g += 12;
            b += 22;
          }

          // Effet de micro-texture logique (lignes d'interconnexion horizontales)
          if ((y % 2) === 0) {
            r = Math.min(255, r + 4);
            g = Math.min(255, g + 6);
            b = Math.min(255, b + 10);
          }

          data32[rowIdx + x] = 0xFF000000 | (b << 16) | (g << 8) | r;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Marquages sérigraphie laser de fonderie sur le biseau (ASML Stepper Alignment / SEMI)
    ctx.restore();
    ctx.save();
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    ctx.fillText("WAFER 300MM · ⟨100⟩ CZ-Si · 49,560 DIES · ASML DUV 193nm", CX, CY - WAFER_RADIUS + 22);

    ctx.font = "8px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillText("MINES ST-ÉTIENNE CMP LAB · LOT AD-2026-X8", CX, CY + WAFER_RADIUS - 20);

    // Repères d'axes d'alignement lithographique (fines croix réticulaires aux 4 cardinaux)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - WAFER_RADIUS + 4, CY);
    ctx.lineTo(CX - WAFER_RADIUS + 16, CY);
    ctx.moveTo(CX + WAFER_RADIUS - 16, CY);
    ctx.lineTo(CX + WAFER_RADIUS - 4, CY);
    ctx.moveTo(CX, CY - WAFER_RADIUS + 4);
    ctx.lineTo(CX, CY - WAFER_RADIUS + 16);
    ctx.stroke();

    ctx.restore();

    offscreenRef.current = offscreen;
    setTotalDiesCount(validDies);
  }, []);

  // 2. BOUCLE DE RENDU DYNAMIQUE (INTERFÉRENCE OPTIQUE DIFFRACTANTE + PROBE INSPECTION)
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dessin du fond pré-calculé contenant les 50 000 dies
    if (offscreenRef.current) {
      ctx.drawImage(offscreenRef.current, 0, 0);
    }

    // Masque circulaire parfait pour toutes les couches optiques
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, WAFER_RADIUS - 2, 0, Math.PI * 2);
    ctx.clip();

    // COUCHE 1 : RÉSEAU DE DIFFRACTION OPTIQUE POST-LITHOGRAPHIE (ARC-EN-CIEL MULTI-ORDRES)
    // Les micro-structures périodiques agissent comme un réseau de Bragg qui disperse la lumière
    const radAngle = (iridAngle * Math.PI) / 180;
    const cosA = Math.cos(radAngle);
    const sinA = Math.sin(radAngle);

    // Gradient spectral multi-stops authentique
    const iridGrad = ctx.createLinearGradient(
      CX - cosA * WAFER_RADIUS,
      CY - sinA * WAFER_RADIUS,
      CX + cosA * WAFER_RADIUS,
      CY + sinA * WAFER_RADIUS
    );
    iridGrad.addColorStop(0.0, "rgba(139, 92, 246, 0.28)"); // Violet
    iridGrad.addColorStop(0.2, "rgba(59, 130, 246, 0.35)"); // Bleu électrique
    iridGrad.addColorStop(0.4, "rgba(6, 182, 212, 0.38)");  // Cyan laser
    iridGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.32)"); // Vert émeraude
    iridGrad.addColorStop(0.78, "rgba(245, 158, 11, 0.35)");// Ambre doré
    iridGrad.addColorStop(0.9, "rgba(239, 68, 68, 0.30)");  // Rouge vif
    iridGrad.addColorStop(1.0, "rgba(236, 72, 153, 0.28)"); // Magenta

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = iridGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Anneaux concentriques d'interférences de Bragg (lames minces d'oxyde SiO2)
    const ringGrad = ctx.createRadialGradient(
      mousePosRef.current.x,
      mousePosRef.current.y,
      20,
      mousePosRef.current.x,
      mousePosRef.current.y,
      WAFER_RADIUS * 0.9
    );
    ringGrad.addColorStop(0.0, "rgba(255, 255, 255, 0.35)");
    ringGrad.addColorStop(0.25, "rgba(59, 130, 246, 0.15)");
    ringGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.12)");
    ringGrad.addColorStop(0.75, "rgba(16, 185, 129, 0.14)");
    ringGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = ringGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 2 : REFLET MIROIR SPÉCULAIRE DE SALLE BLANCHE
    const specGrad = ctx.createRadialGradient(
      mousePosRef.current.x,
      mousePosRef.current.y,
      0,
      mousePosRef.current.x,
      mousePosRef.current.y,
      240
    );
    specGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    specGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.12)");
    specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // COUCHE 3 : ONDES DE TEST ÉLECTRIQUE DE PROBE (RIPPLES AU CLIC)
    ctx.globalCompositeOperation = "source-over";
    const now = performance.now();
    ripplesRef.current = ripplesRef.current.filter((rp) => {
      rp.radius += 5;
      rp.alpha *= 0.94;
      if (rp.alpha < 0.02 || rp.radius > rp.maxRadius) return false;

      ctx.save();
      ctx.strokeStyle = rp.color;
      ctx.globalAlpha = rp.alpha;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Onde secondaire
      if (rp.radius > 20) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    });

    // COUCHE 4 : RÉTICULES D'INSPECTION LITHOGRAPHIQUE & POSITION DU DIE
    if (mousePosRef.current.active) {
      const hx = mousePosRef.current.x;
      const hy = mousePosRef.current.y;

      // Détection du die sous le curseur
      const relX = hx - ORIGIN_X;
      const relY = hy - ORIGIN_Y;
      const col = Math.floor(relX / DIE_PITCH);
      const row = Math.floor(relY / DIE_PITCH);
      const fieldX = Math.floor(col / DIES_PER_FIELD);
      const fieldY = Math.floor(row / DIES_PER_FIELD);

      const dieScreenX = ORIGIN_X + col * DIE_PITCH + DIE_PITCH / 2;
      const dieScreenY = ORIGIN_Y + row * DIE_PITCH + DIE_PITCH / 2;

      // 1. Délimitation du champ de réticule actif (14x14 dies)
      const fStartX = ORIGIN_X + fieldX * DIES_PER_FIELD * DIE_PITCH;
      const fStartY = ORIGIN_Y + fieldY * DIES_PER_FIELD * DIE_PITCH;
      const fSize = DIES_PER_FIELD * DIE_PITCH;

      ctx.save();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(fStartX, fStartY, fSize, fSize);
      ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
      ctx.fillRect(fStartX, fStartY, fSize, fSize);

      // 2. Axes de visée laser transversaux
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([4, 4]);

      // Ligne horizontale
      ctx.beginPath();
      ctx.moveTo(0, dieScreenY);
      ctx.lineTo(CANVAS_SIZE, dieScreenY);
      ctx.stroke();

      // Ligne verticale
      ctx.beginPath();
      ctx.moveTo(dieScreenX, 0);
      ctx.lineTo(dieScreenX, CANVAS_SIZE);
      ctx.stroke();

      // 3. Highlight du micro-die ciblé (glow laser ultra-précis)
      ctx.setLineDash([]);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#06B6D4";
      ctx.shadowBlur = 12;
      ctx.fillRect(
        ORIGIN_X + col * DIE_PITCH - 1,
        ORIGIN_Y + row * DIE_PITCH - 1,
        DIE_PITCH + 2,
        DIE_PITCH + 2
      );

      ctx.restore();
    }

    // COUCHE 5 : DIE SÉLECTIONNÉ PERMANENT (POINT D'ALIMENTATION PROBE ACTIF)
    if (selectedDie) {
      ctx.save();
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(
        ORIGIN_X + selectedDie.col * DIE_PITCH - 1.5,
        ORIGIN_Y + selectedDie.row * DIE_PITCH - 1.5,
        DIE_PITCH + 3,
        DIE_PITCH + 3
      );
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        ORIGIN_X + selectedDie.col * DIE_PITCH - 3,
        ORIGIN_Y + selectedDie.row * DIE_PITCH - 3,
        DIE_PITCH + 6,
        DIE_PITCH + 6
      );
      ctx.restore();
    }

    ctx.restore();

    // Rendu en continu si des ondulations sont actives
    if (ripplesRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [iridAngle, selectedDie]);

  // Déclencheur du render quand les paramètres changent
  useEffect(() => {
    render();
  }, [render]);

  // GESTION DU MOUVEMENT DE SOURIS SUR LE WAFER
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(nx);
    my.set(ny);

    // Angle d'incidence optique
    const angle = Math.round(Math.atan2(ny, nx) * (180 / Math.PI) + 180);
    setIridAngle(angle);

    // Coordonnées en échelle interne Canvas (840x840)
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Vérification de présence sur le wafer
    const dx = canvasX - CX;
    const dy = canvasY - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= EBR_RADIUS) {
      mousePosRef.current = { x: canvasX, y: canvasY, active: true };
      const relX = canvasX - ORIGIN_X;
      const relY = canvasY - ORIGIN_Y;
      const col = Math.floor(relX / DIE_PITCH);
      const row = Math.floor(relY / DIE_PITCH);
      const fieldX = Math.floor(col / DIES_PER_FIELD);
      const fieldY = Math.floor(row / DIES_PER_FIELD);

      setHoveredDie({
        col,
        row,
        fieldX,
        fieldY,
        screenX: canvasX,
        screenY: canvasY,
      });
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

  // CLIC D'INSPECTION : PROBE ÉLECTRIQUE DU MICRO-DIE CIBLÉ
  const handleWaferClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const dx = canvasX - CX;
    const dy = canvasY - CY;
    if (Math.sqrt(dx * dx + dy * dy) > EBR_RADIUS) return;

    const relX = canvasX - ORIGIN_X;
    const relY = canvasY - ORIGIN_Y;
    const col = Math.floor(relX / DIE_PITCH);
    const row = Math.floor(relY / DIE_PITCH);
    const fieldX = Math.floor(col / DIES_PER_FIELD);
    const fieldY = Math.floor(row / DIES_PER_FIELD);

    const newSelected: SelectedDie = {
      col,
      row,
      fieldX,
      fieldY,
      screenX: canvasX,
      screenY: canvasY,
    };
    setSelectedDie(newSelected);

    // Onde électrique de test probe
    const chosenColor = colors[(col + row) % colors.length];
    ripplesRef.current.push({
      x: canvasX,
      y: canvasY,
      radius: 2,
      maxRadius: 360,
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
        className="group relative aspect-square w-full rounded-full [transform-style:preserve-3d] cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleWaferClick}
      >
        {/* OMBRE PORTÉE SOIGNEUSE & BISEAU CIRCULAIRE DU SILICIUM PUR */}
        <div className="relative size-full rounded-full shadow-[0_35px_80px_-20px_rgba(0,0,0,0.65),0_15px_35px_-10px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_16px_rgba(0,0,0,0.95)] border border-white/25 overflow-hidden flex items-center justify-center bg-[#03060C]">
          {/* LE CANVAS ULTRA-DENSE : 50 000 MICRO-DIES POST-LITHOGRAPHIE */}
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="size-full rounded-full object-cover pointer-events-none"
          />

          {/* Badge discret fonderie en filigrane */}
          <div className="pointer-events-none absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[7px] text-white/70 tracking-[0.16em] uppercase">
            <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
            <span>300mm · 50,000 DIES · DUV 193nm</span>
          </div>
        </div>

        {/* LOUPE D'INSPECTION MICROSCOPIQUE SEM (MICROSCOPE À BALAYAGE ÉLECTRONIQUE) */}
        {showLoupe && (
          <div className="pointer-events-none absolute -bottom-3 -right-2 sm:-right-4 z-30 w-40 sm:w-44 p-2 rounded-lg bg-[#070B13]/95 backdrop-blur-md border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.7)] text-white">
            <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[8.5px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <Crosshair className="size-2.5" />
                <span>SEM LOUPE 12×</span>
              </span>
              <span className="text-white/50">FIELD [{currentDie.fieldX}, {currentDie.fieldY}]</span>
            </div>

            {/* Vue macro-agrandie du die sous le faisceau laser */}
            <div className="my-1.5 relative aspect-video w-full rounded bg-gradient-to-br from-[#0c1322] via-[#101b30] to-[#070c17] border border-cyan-500/30 overflow-hidden flex flex-col justify-between p-1.5">
              {/* Circuit imprimé agrandi (micro-architecture Floorplan) */}
              <div className="flex justify-between items-start text-[7px] font-mono text-cyan-300/80">
                <span>RV32I CORE</span>
                <span>16KB L1$</span>
              </div>

              {/* Matrice de transistors / caches */}
              <div className="grid grid-cols-6 gap-0.5 my-0.5 opacity-60">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 rounded-[0.5px] ${
                      i % 3 === 0 ? "bg-cyan-400" : i % 2 === 0 ? "bg-amber-400" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-end text-[6.5px] font-mono text-white/50">
                <span>DIE #{((currentDie.col * 246 + currentDie.row) % 50000).toString().padStart(5, "0")}</span>
                <span className="text-emerald-400 font-semibold">PASS 99.8%</span>
              </div>

              {/* Réticule laser central */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-2.5 border border-cyan-400/80 rounded-full animate-ping opacity-75" />
              </div>
            </div>

            <div className="flex justify-between font-mono text-[7.5px] text-white/60">
              <span>COORD: [{currentDie.col}, {currentDie.row}]</span>
              <span className="text-signal font-semibold">TAPE-OUT 2026</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Fiche de télémétrie industrielle sous le wafer */}
      <div className="mt-4 flex items-center justify-between font-mono text-[10.5px] text-mute px-2">
        <div className="flex items-center gap-1.5">
          <Crosshair className="size-3.5 text-signal" />
          <span className="font-semibold text-ink">
            DIE [{selectedDie.col}, {selectedDie.row}]
          </span>
          <span className="text-mute/60 hidden sm:inline">
            · ~{totalDiesCount.toLocaleString()} DIES · YIELD 99.84%
          </span>
          <span className="text-mute/60 sm:hidden">
            · 50K DIES
          </span>
        </div>
        <div className="flex items-center gap-1 text-signal font-semibold">
          <Cpu className="size-3" />
          <span>RV32I ASML DUV</span>
        </div>
      </div>
    </div>
  );
}
