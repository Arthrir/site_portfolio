import { useState } from "react";
import { Sparkles, ChevronUp, X, ExternalLink } from "lucide-react";

interface ThemeBadgeProps {
  currentOption: "a" | "b" | "c";
  optionName: string;
  tagline: string;
  palette: {
    paper: string;
    ink: string;
    signal: string;
    mute: string;
    line: string;
  };
  typography: {
    sans: string;
    serif: string;
    concept: string;
  };
}

const PREVIEW_LINKS = [
  { id: "a", label: "Option A", sub: "Titane & Tricolore", url: "https://site-portfolio-git-preview-option-a-arthrir.vercel.app/" },
  { id: "b", label: "Option B", sub: "Apple Blanc & Rouge F1", url: "https://site-portfolio-git-preview-option-b-arthrir.vercel.app/" },
  { id: "c", label: "Option C", sub: "Traits d'Architecte", url: "https://site-portfolio-git-preview-option-c-arthrir.vercel.app/" },
];

export default function ThemeBadge({ currentOption, optionName, tagline, palette, typography }: ThemeBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-ink/20 bg-paper/95 px-4 py-2 font-mono text-xs font-semibold text-ink shadow-2xl backdrop-blur-md transition-all hover:scale-105"
          style={{ borderColor: `${palette.signal}88` }}
        >
          <span className="size-2.5 rounded-full" style={{ backgroundColor: palette.signal }} />
          <span>{optionName}</span>
          <ChevronUp className="size-3.5 opacity-60" />
        </button>
      ) : (
        <div className="rounded-2xl border border-ink/20 bg-paper/98 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full text-white text-[11px]" style={{ backgroundColor: palette.signal }}>
                <Sparkles className="size-3" />
              </span>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-mute block">Banc d'essai UI</span>
                <p className="font-semibold text-xs text-ink">{optionName}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="grid size-6 place-items-center rounded-full text-mute hover:bg-ink/10">
              <X className="size-3.5" />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-mute leading-relaxed">{tagline}</p>

          {/* Quick switcher between options */}
          <div className="mt-3">
            <span className="font-mono text-[9px] uppercase tracking-wider text-mute block mb-1.5">Comparer les 3 options :</span>
            <div className="grid grid-cols-3 gap-1.5">
              {PREVIEW_LINKS.map((opt) => {
                const isActive = opt.id === currentOption;
                return (
                  <a
                    key={opt.id}
                    href={opt.url}
                    className={`rounded-lg border px-2 py-1.5 text-center transition-all ${
                      isActive
                        ? "border-signal bg-signal/10 font-semibold text-signal ring-1 ring-signal/30"
                        : "border-ink/15 hover:border-ink/40 text-ink/80 hover:bg-ink/5"
                    }`}
                  >
                    <span className="block text-[11px] leading-tight font-mono">{opt.label}</span>
                    <span className="block text-[8px] text-mute mt-0.5 truncate">{opt.sub}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded-lg border border-ink/10 p-2">
              <span className="font-mono text-[9px] text-mute uppercase block mb-1">Nuancier</span>
              <div className="flex gap-1.5 items-center">
                <span className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: palette.paper }} title="Fond" />
                <span className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: palette.ink }} title="Encre" />
                <span className="size-3.5 rounded-full" style={{ backgroundColor: palette.signal }} title="Accent" />
              </div>
              <span className="font-mono text-[9px] text-mute mt-1 block">Accent: {palette.signal}</span>
            </div>

            <div className="rounded-lg border border-ink/10 p-2">
              <span className="font-mono text-[9px] text-mute uppercase block mb-0.5">Typographie</span>
              <p className="font-semibold text-ink truncate">{typography.sans}</p>
              <p className="font-mono text-[9px] text-mute truncate">Ghost: {typography.serif}</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-ink/10 flex items-center justify-between text-[10px] text-mute">
            <span>Prod intacte :</span>
            <a href="https://arthurdx.com/" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-ink hover:underline">
              <span>arthurdx.com</span>
              <ExternalLink className="size-2.5 opacity-60" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
