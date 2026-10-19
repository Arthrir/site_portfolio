import { useState } from "react";
import { Sparkles, ChevronUp, ChevronDown, X } from "lucide-react";

interface ThemeBadgeProps {
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

export default function ThemeBadge({ optionName, tagline, palette, typography }: ThemeBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-ink/20 bg-paper/95 px-4 py-2 font-mono text-xs font-semibold text-ink shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:border-signal"
          style={{ borderColor: `${palette.signal}66` }}
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
              <span className="font-mono text-[9px] text-mute uppercase block mb-0.5">Typo testée</span>
              <p className="font-semibold text-ink truncate">{typography.sans}</p>
              <p className="font-mono text-[9px] text-mute truncate">Ghost: {typography.serif}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
