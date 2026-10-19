import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { THEME_OPTIONS, type ThemeOptionId } from "./themeConfig";
import { Sparkles, X, ChevronUp, ChevronDown, Check, ExternalLink } from "lucide-react";

interface PreviewBarProps {
  currentTheme: ThemeOptionId;
  onSelectTheme: (themeId: ThemeOptionId) => void;
}

export default function PreviewBar({ currentTheme, onSelectTheme }: PreviewBarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const activeConfig = THEME_OPTIONS[currentTheme];

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-ink/20 bg-paper/95 px-4 py-2 font-mono text-xs font-semibold text-ink shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:border-signal"
        aria-label="Ouvrir le sélecteur de thèmes"
      >
        <span className="size-2 rounded-full" style={{ backgroundColor: activeConfig.palette.signal }} />
        <span>Aperçu : {activeConfig.name.split(":")[0]}</span>
        <ChevronUp className="size-3.5 opacity-60" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative overflow-hidden rounded-2xl border border-ink/20 bg-paper/95 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4"
        style={{
          boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px ${activeConfig.palette.signal}22`,
        }}
      >
        {/* En-tête de la barre */}
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="grid size-6 place-items-center rounded-full text-white text-[11px]"
              style={{ backgroundColor: activeConfig.palette.signal }}
            >
              <Sparkles className="size-3" />
            </span>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-mute block leading-none">
                Banc d'essai UI · Axe 1
              </span>
              <p className="font-semibold text-xs truncate text-ink">
                {activeConfig.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDetails((d) => !d)}
              className="flex items-center gap-1 rounded-full border border-ink/15 bg-ink/5 px-2.5 py-1 font-mono text-[10px] text-ink transition-colors hover:bg-ink/10"
            >
              <span>{showDetails ? "Masquer détails" : "Fiche technique"}</span>
              {showDetails ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
            </button>
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Réduire"
              className="grid size-7 place-items-center rounded-full text-mute transition-colors hover:bg-ink/10 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Boutons de sélection d'options */}
        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {(Object.keys(THEME_OPTIONS) as ThemeOptionId[]).map((id) => {
            const opt = THEME_OPTIONS[id];
            const isLit = currentTheme === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTheme(id)}
                className={`relative flex flex-col items-start rounded-xl p-2.5 text-left transition-all ${
                  isLit
                    ? "border-2 bg-white/70 shadow-sm"
                    : "border border-ink/10 hover:bg-white/40"
                }`}
                style={{
                  borderColor: isLit ? opt.palette.signal : undefined,
                }}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-mute">
                    {opt.category}
                  </span>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: opt.palette.signal }}
                  />
                </div>
                <span className="mt-1 font-semibold text-xs text-ink leading-tight">
                  {id === "original" ? "Original" : opt.name.split(":")[0]}
                </span>
                <span className="text-[10px] text-mute line-clamp-1 mt-0.5">
                  {opt.tagline.split("&")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Détails techniques dépliables */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 border-t border-ink/10 pt-3 text-xs text-ink/90 overflow-hidden"
            >
              <p className="text-[11px] leading-relaxed text-mute mb-2">
                {activeConfig.description}
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* Nuancier */}
                <div className="rounded-lg border border-ink/10 p-2">
                  <span className="font-mono text-[9px] text-mute uppercase block mb-1.5">Nuancier</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="size-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: activeConfig.palette.paper }} title="Fond papier" />
                    <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: activeConfig.palette.ink }} title="Encre texte" />
                    <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: activeConfig.palette.line }} title="Ligne / bordure" />
                    <span className="size-4 rounded-full shadow-sm" style={{ backgroundColor: activeConfig.palette.signal }} title="Accent signal" />
                  </div>
                  <span className="font-mono text-[9px] text-mute mt-1.5 block">
                    Accent : {activeConfig.palette.signal}
                  </span>
                </div>

                {/* Typographie */}
                <div className="rounded-lg border border-ink/10 p-2">
                  <span className="font-mono text-[9px] text-mute uppercase block mb-1">Typographie testée</span>
                  <p className="font-semibold text-[11px] text-ink">{activeConfig.typography.sans}</p>
                  <p className="font-mono text-[9px] text-mute">Ghost: {activeConfig.typography.serif}</p>
                </div>

                {/* Points forts */}
                <div className="col-span-2 sm:col-span-1 rounded-lg border border-ink/10 p-2">
                  <span className="font-mono text-[9px] text-mute uppercase block mb-1">Intention</span>
                  <ul className="space-y-0.5 text-[10px] text-mute">
                    {activeConfig.highlights.slice(0, 2).map((h, i) => (
                      <li key={i} className="truncate">• {h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
