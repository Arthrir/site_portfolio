import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import SiliconWafer from "./SiliconWafer";
import VaporChamber from "./VaporChamber";
import { Layers, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLang } from "../i18n";

interface HeroFanProps {
  onColorChange?: (color: string) => void;
}

type CardId = "wafer" | "vapor" | "photo";

export default function HeroFan({ onColorChange }: HeroFanProps) {
  const { tr } = useLang();
  const [activeCard, setActiveCard] = useState<CardId>("wafer");
  const [isHovered, setIsHovered] = useState(false);

  // Mouvement 3D interactif doux
  const containerRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  const selectCard = (id: CardId) => {
    setActiveCard(id);
    if (onColorChange) {
      if (id === "wafer") onColorChange("#38BDF8");
      if (id === "vapor") onColorChange("#D97706");
      if (id === "photo") onColorChange("#2340F0");
    }
  };

  return (
    <div className="relative w-full select-none flex flex-col items-center">
      {/* Sélecteur de cartes supérieur */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[440px] px-2 font-mono text-[10px] text-mute uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-ink font-semibold">
          <Layers className="size-3 text-signal" />
          <span>ÉVENTAIL D'INGÉNIERIE (3 ÉLÉMENTS)</span>
        </span>
        <div className="flex items-center gap-1">
          {(["wafer", "vapor", "photo"] as const).map((id) => (
            <button
              key={id}
              onClick={() => selectCard(id)}
              className={`px-2 py-0.5 rounded-full transition-all text-[9.5px] ${
                activeCard === id
                  ? "bg-ink text-paper font-bold shadow-sm"
                  : "bg-line/60 text-mute hover:text-ink"
              }`}
            >
              {id === "wafer" ? "01 Wafer" : id === "vapor" ? "02 Heat" : "03 Photo"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENEUR DE L'ÉVENTAIL 3D (FANNED DECK) */}
      <motion.div
        ref={containerRef}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative h-[440px] sm:h-[470px] w-full max-w-[440px] flex items-center justify-center"
      >
        {/* ========================================================== */}
        {/* CARTE A : LA PHOTO D'ARTHUR EN COULEUR NATURELLE           */}
        {/* ========================================================== */}
        <motion.div
          onClick={() => selectCard("photo")}
          animate={{
            rotateZ: activeCard === "photo" ? 0 : isHovered ? -16 : -10,
            x: activeCard === "photo" ? 0 : isHovered ? -55 : -28,
            y: activeCard === "photo" ? 0 : isHovered ? -12 : -6,
            scale: activeCard === "photo" ? 1.02 : 0.92,
            zIndex: activeCard === "photo" ? 30 : 10,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`absolute w-[240px] sm:w-[260px] cursor-pointer rounded-2xl bg-white p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border transition-all duration-300 ${
            activeCard === "photo" ? "border-ink ring-2 ring-ink/20" : "border-ink/20 hover:border-ink/40"
          }`}
        >
          {/* Entête étiquette laboratoire */}
          <div className="flex items-center justify-between font-mono text-[9px] text-mute pb-2 border-b border-ink/10">
            <span className="font-semibold text-ink uppercase">fig. 01 · A. Doradoux</span>
            <span className="bg-signal/10 text-signal font-bold px-1.5 py-0.5 rounded text-[8px]">
              ISMIN 2027
            </span>
          </div>

          {/* Photo en VRAIES COULEURS NATURELLES */}
          <div className="my-2 aspect-[4/5] w-full rounded-xl overflow-hidden shadow-inner bg-ink/5">
            <img
              src="/assets/arthur.jpeg"
              alt="Arthur Doradoux"
              className="size-full object-cover object-center transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[8.5px] text-mute pt-1">
            <span>Mines Saint-Étienne</span>
            <span className="text-ink font-semibold">Élève-Ingénieur</span>
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* CARTE B : LA VAPOR CHAMBER EN CUIVRE (CHALEUR THERMIQUE)   */}
        {/* ========================================================== */}
        <motion.div
          onClick={() => selectCard("vapor")}
          animate={{
            rotateZ: activeCard === "vapor" ? 0 : isHovered ? 15 : 9,
            x: activeCard === "vapor" ? 0 : isHovered ? 55 : 28,
            y: activeCard === "vapor" ? 0 : isHovered ? 20 : 10,
            scale: activeCard === "vapor" ? 1.02 : 0.93,
            zIndex: activeCard === "vapor" ? 30 : 12,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`absolute w-[290px] sm:w-[320px] cursor-pointer rounded-2xl bg-[#160B06] p-3 shadow-[0_25px_60px_-15px_rgba(217,119,6,0.35)] border transition-all duration-300 ${
            activeCard === "vapor" ? "border-amber-500 ring-2 ring-amber-500/30" : "border-amber-900/40 hover:border-amber-600/60"
          }`}
        >
          <VaporChamber />
        </motion.div>

        {/* ========================================================== */}
        {/* CARTE C : LE WAFER SILICIUM 300mm ROND PURE (SANS CADRE)  */}
        {/* ========================================================== */}
        <motion.div
          onClick={() => selectCard("wafer")}
          animate={{
            rotateZ: activeCard === "wafer" ? 0 : isHovered ? -4 : 0,
            x: activeCard === "wafer" ? 0 : isHovered ? 0 : 0,
            y: activeCard === "wafer" ? 0 : isHovered ? -25 : 0,
            scale: activeCard === "wafer" ? 1 : 0.94,
            zIndex: activeCard === "wafer" ? 30 : 15,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute w-[340px] sm:w-[380px] aspect-square flex items-center justify-center cursor-pointer drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
        >
          <SiliconWafer onColorChange={onColorChange} />
        </motion.div>
      </motion.div>

      {/* Légende basse */}
      <p className="mt-3 font-mono text-[9.5px] text-mute text-center">
        Survolez pour déployer l'éventail · Cliquez sur un élément pour le mettre au premier plan
      </p>
    </div>
  );
}
