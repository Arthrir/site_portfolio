import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import VaporChamber from "./VaporChamber";

interface HeroFanProps {
  onColorChange?: (color: string) => void;
}

// 3 cartes d'ingénierie physique
type CardType = "photo" | "wafer" | "vapor";

export default function HeroFan({ onColorChange }: HeroFanProps) {
  // Index actif : 0 = Photo, 1 = Wafer (Centre), 2 = Vapor Chamber
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouvement 3D interactif subtil avec la souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [5, -5]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-5, 5]), { stiffness: 140, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const selectCard = (index: number) => {
    setActiveIndex(index);
    if (onColorChange) {
      if (index === 1) onColorChange("#38BDF8"); // Wafer cyan
      if (index === 2) onColorChange("#D97706"); // Vapor cuivre/ambre
      if (index === 0) onColorChange("#2340F0"); // Photo bleu cobalt
    }
  };

  // Configuration géométrique de l'éventail ouvert pour que TOUTES les 3 cartes soient parfaitement visibles dès le départ !
  // Chaque slot a sa position x, sa rotation, son échelle et son z-index selon quel élément est actif
  const getCardTransform = (cardIndex: number) => {
    // Calcul de l'écart relatif par rapport à la carte active (-1, 0, +1)
    let diff = cardIndex - activeIndex;
    if (diff === 2) diff = -1;
    if (diff === -2) diff = 1;

    if (diff === 0) {
      // CARTE CENTRALE ACTIVE (Au premier plan, droite, agrandie)
      return {
        x: 0,
        y: 0,
        rotateZ: 0,
        scale: 1,
        zIndex: 30,
        opacity: 1,
      };
    } else if (diff === -1) {
      // CARTE GAUCHE (Bien visible et déployée sur la gauche)
      return {
        x: -140,
        y: 10,
        rotateZ: -12,
        scale: 0.88,
        zIndex: 20,
        opacity: 0.95,
      };
    } else {
      // CARTE DROITE (Bien visible et déployée sur la droite)
      return {
        x: 140,
        y: 10,
        rotateZ: 12,
        scale: 0.88,
        zIndex: 20,
        opacity: 0.95,
      };
    }
  };

  return (
    <div className="relative w-full select-none flex flex-col items-center">
      {/* ZONE D'ÉVENTAIL 3D OUVERT : AUCUN TEXTE AUTOUR, AUCUN CONTOUR */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[420px] sm:h-[460px] w-full max-w-[560px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* CARTE 0 : LA PHOTO COULEUR NATURELLE D'ARTHUR              */}
        {/* ========================================================== */}
        <motion.div
          onClick={() => selectCard(0)}
          animate={getCardTransform(0)}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          whileHover={{ scale: activeIndex === 0 ? 1.03 : 0.92, y: -8 }}
          className="absolute cursor-pointer w-[200px] sm:w-[230px] rounded-2xl bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-ink/10 transition-shadow hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
        >
          <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center"
            />
          </div>
          <div className="pt-1.5 px-0.5 flex items-center justify-between font-mono text-[8.5px] text-mute uppercase">
            <span className="font-semibold text-ink">A. Doradoux</span>
            <span className="text-signal font-bold">ISMIN</span>
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* CARTE 1 : LE GRAND WAFER SILICIUM 300mm ROND PUR           */}
        {/* ========================================================== */}
        <motion.div
          onClick={() => selectCard(1)}
          animate={getCardTransform(1)}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          whileHover={{ scale: activeIndex === 1 ? 1.03 : 0.92, y: -8 }}
          className="absolute cursor-pointer w-[300px] sm:w-[350px] aspect-square flex items-center justify-center drop-shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
        >
          <SiliconWafer onColorChange={onColorChange} standalone={true} />
        </motion.div>

        {/* ========================================================== */}
        {/* CARTE 2 : LA VAPOR CHAMBER EN CUIVRE CHAUD                 */}
        {/* ========================================================== */}
        <motion.div
          onClick={() => selectCard(2)}
          animate={getCardTransform(2)}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          whileHover={{ scale: activeIndex === 2 ? 1.03 : 0.92, y: -8 }}
          className="absolute cursor-pointer w-[240px] sm:w-[280px] drop-shadow-[0_25px_50px_rgba(217,119,6,0.3)]"
        >
          <VaporChamber interactive={activeIndex === 2} showBadge={false} />
        </motion.div>
      </motion.div>

      {/* DISCRÈTE BARRE DE SLIDE / NAVIGATION CIRCULAIRE (3 POINTS ÉLÉGANTS) */}
      <div className="mt-4 flex items-center gap-2">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => selectCard(idx)}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === idx
                ? "w-7 h-2 bg-ink"
                : "size-2 bg-ink/20 hover:bg-ink/40"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
