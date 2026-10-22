import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";

interface ProductDeviceProps {
  interactive?: boolean;
  variant?: "hardware" | "chronometer";
  onToggleVariant?: () => void;
}

export default function ProductDevice({
  interactive = true,
  variant: controlledVariant,
}: ProductDeviceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalVariant, setInternalVariant] = useState<"hardware" | "chronometer">("hardware");
  const [isHovered, setIsHovered] = useState(false);

  const activeVariant = controlledVariant ?? internalVariant;

  // 3D Tilt interactif
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 180, damping: 20 });

  // Glint spéculaire sur l'aluminium anodisé ou le titane
  const glareX = useSpring(useTransform(mx, [-1, 1], [10, 90]), { stiffness: 150, damping: 22 });
  const glareY = useSpring(useTransform(my, [-1, 1], [10, 90]), { stiffness: 150, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
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

  const handleToggle = () => {
    if (!controlledVariant) {
      setInternalVariant((v) => (v === "hardware" ? "chronometer" : "hardware"));
    }
  };

  return (
    <motion.div
      ref={containerRef}
      onClick={handleToggle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="relative select-none aspect-square w-full flex items-center justify-center cursor-pointer group"
      title="Cliquer pour alterner : Contrôleur Prototypage Hardware / Chronomètre Titane"
    >
      {/* OMBRE PORTÉE VOLUMÉTRIQUE */}
      <div className="absolute inset-x-4 bottom-2 h-10 bg-black/35 blur-xl rounded-full transform scale-90 pointer-events-none" />

      {/* PRODUIT HARDWARE / CHRONOMÈTRE DE MANAGEMENT */}
      <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_18px_36px_rgba(0,0,0,0.4)]">
        <AnimatePresence mode="wait">
          {activeVariant === "hardware" ? (
            <motion.img
              key="hardware"
              src="/assets/hardware-device.png"
              alt="Device Prototypage & Product Management Aluminium CNC"
              initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.92, rotate: 4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <motion.img
              key="chronometer"
              src="/assets/titanium-chronometer.png"
              alt="Chronomètre d'Ingénierie & Product Delivery Titane Grade 5"
              initial={{ opacity: 0, scale: 0.92, rotate: 4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.92, rotate: -4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
          )}
        </AnimatePresence>

        {/* LUEUR SPÉCULAIRE LORS DU SURVOL */}
        <motion.div
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.4) 0%, transparent 65%)`
            ),
            opacity: isHovered ? 0.3 : 0,
          }}
          className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300 rounded-2xl"
        />
      </div>
    </motion.div>
  );
}
