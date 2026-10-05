import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLang } from "../i18n";

type Game = "f1" | "aim" | "blackjack";
type Line = { id: number; text: string; choice?: string; dim?: boolean };

const AMBER = "#FFB547";
const GLOW = "0 0 6px rgba(255,181,71,0.55)";

// 5-row block-pixel glyphs for the MINITEL wordmark
const GLYPHS: Record<string, string[]> = {
  M: ["10001", "11011", "10101", "10001", "10001"],
  I: ["111", "010", "010", "010", "111"],
  N: ["10001", "11001", "10101", "10011", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100"],
  E: ["1111", "1000", "1110", "1000", "1111"],
  L: ["1000", "1000", "1000", "1000", "1111"],
};

function Wordmark() {
  const word = "MINITEL";
  return (
    <div className="flex gap-[6px]" aria-label="MINITEL">
      {word.split("").map((ch, ci) => {
        const g = GLYPHS[ch];
        return (
          <div key={ci} className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${g[0].length}, 1fr)` }}>
            {g.flatMap((row, ri) =>
              row.split("").map((c, x) => (
                <span
                  key={`${ri}-${x}`}
                  className="h-[6px] w-[6px] md:h-[8px] md:w-[8px]"
                  style={{ background: c === "1" ? AMBER : "transparent", boxShadow: c === "1" ? GLOW : "none" }}
                />
              )),
            )}
          </div>
        );
      })}
    </div>
  );
}

const MENU: { key: string; choice: string; label: string; en?: string }[] = [
  { key: "1", choice: "F1", label: "GRAND PRIX F1" },
  { key: "2", choice: "AIM", label: "AIM LAB / REFLEXES", en: "AIM LAB / REFLEXES" },
  { key: "3", choice: "BLACKJACK", label: "BLACKJACK / TIPE 21" },
  { key: "4", choice: "QUITTER", label: "QUITTER LE TERMINAL", en: "EXIT TERMINAL" },
];

export default function Minitel({ onClose, onLaunch }: { onClose: () => void; onLaunch: (game: Game) => void }) {
  const { lang, tr } = useLang();
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const idRef = useRef(0);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const script = (items: Omit<Line, "id">[], step: number, done?: () => void) => {
    setReady(false);
    items.forEach((it, i) => later(() => setLines((l) => [...l, { ...it, id: idRef.current++ }]), step * (i + 1)));
    later(() => {
      setReady(true);
      done?.();
    }, step * (items.length + 1));
  };

  const menuLines = (): Omit<Line, "id">[] => MENU.map((m) => ({ text: `${m.key}  ${lang === "en" ? (m.en ?? m.label) : m.label}`, choice: m.choice }));

  useEffect(() => {
    script(
      [
        { text: tr("CONNEXION...", "CONNECTING...") },
        { text: tr("3615 MINITEL EST EN LIGNE.", "3615 MINITEL IS ONLINE.") },
        { text: tr("BIENVENUE SUR LE RESEAU ARTHUR DORADOUX.", "WELCOME TO THE ARTHUR DORADOUX NETWORK.") },
        { text: tr("TAPEZ UN NUMERO OU CLIQUEZ :", "TYPE A NUMBER OR CLICK:"), dim: true },
        ...menuLines(),
      ],
      220,
    );
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      timers.current.forEach(clearTimeout);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
  }, [lines, ready]);

  useEffect(() => {
    if (ready && !window.matchMedia("(max-width: 640px)").matches) inputRef.current?.focus();
  }, [ready]);

  const launch = (label: string, g: Game) => {
    busy.current = true;
    script([{ text: `${tr("LANCEMENT", "LAUNCHING")} ${label}...` }], 160, () => later(() => onLaunch(g), 350));
  };

  const run = (raw: string) => {
    if (busy.current) return;
    const cmd = raw.trim().toUpperCase();
    setLines((l) => [...l, { id: idRef.current++, text: "> " + cmd, dim: true }]);
    if (cmd === "1" || cmd === "F1") launch("GRAND PRIX F1", "f1");
    else if (cmd === "2" || cmd === "AIM" || cmd === "VITALITY") launch("AIM LAB", "aim");
    else if (cmd === "3" || cmd === "BLACKJACK" || cmd === "BJ") launch("BLACKJACK", "blackjack");
    else if (["4", "QUITTER", "QUIT", "EXIT"].includes(cmd)) {
      busy.current = true;
      script([{ text: tr("DECONNEXION DU SERVEUR...", "DISCONNECTING FROM SERVER...") }], 150, () => later(onClose, 300));
    } else if (["AIDE", "HELP", "?"].includes(cmd)) script([{ text: tr("SOMMAIRE :", "MENU:") }, ...menuLines()], 60);
    else if (cmd) script([{ text: tr("COMMANDE NON RECONNUE. TAPEZ 1, 2, 3, 4 OU AIDE.", "UNKNOWN COMMAND. TYPE 1, 2, 3, 4 OR HELP.") }], 120);
  };

  // Global keys: ESC closes; single digit 1-4 launches when input empty
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (ready && input === "" && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        run(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-3 backdrop-blur-sm md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Terminal 3615 Minitel"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[min(80vh,620px)] w-full max-w-[860px] flex-col rounded-[14px] bg-[#D9D4C7] p-3 shadow-2xl md:p-4"
      >
        <div className="flex items-center justify-between px-1 pb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/60">
          <span>Minitel 1B</span>
          <button type="button" onClick={onClose} className="transition-colors hover:text-signal">
            {tr("Fermer", "Close")}&nbsp;&nbsp;ESC
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[10px] border-[6px] border-[#1a1a18] bg-[#0d0b08]">
          {/* Logo watermark: the author's A, tinted amber and dot-matrixed */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
            style={{
              background: `radial-gradient(circle, ${AMBER} 55%, transparent 60%) 0 0 / 7px 7px`,
              WebkitMask: "url(/logo/logo-white.svg) center / contain no-repeat",
              mask: "url(/logo/logo-white.svg) center / contain no-repeat",
            }}
          />
          {/* Scanlines + vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.28) 50%) 0 0 / 100% 3px, radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          <div
            ref={screenRef}
            onClick={() => inputRef.current?.focus()}
            className="relative z-[5] h-full overflow-y-auto px-5 py-5 font-mono text-[13px] leading-relaxed md:px-8 md:py-7 md:text-[15px] [scrollbar-width:none]"
            style={{ color: AMBER, textShadow: GLOW }}
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <Wordmark />
              <span className="font-mono text-[11px] tracking-[0.2em] opacity-70">3615</span>
            </div>
            <div className="mb-4 h-px" style={{ background: AMBER, opacity: 0.35 }} />

            {lines.map((l) =>
              l.choice ? (
                <button
                  key={l.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    run(l.choice!);
                  }}
                  className="block w-full px-2 py-0.5 text-left tracking-wide transition-colors hover:bg-[#FFB547] hover:text-[#0d0b08] hover:[text-shadow:none]"
                >
                  {l.text}
                </button>
              ) : (
                <div key={l.id} className={`py-0.5 tracking-wide ${l.dim ? "opacity-60" : ""}`}>
                  {l.text}
                </div>
              ),
            )}

            {ready ? (
              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = input;
                  setInput("");
                  run(v);
                }}
              >
                <span className="font-bold">&gt;</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={tr("Commande", "Command")}
                  className="flex-1 border-none bg-transparent p-0 font-mono uppercase outline-none"
                  style={{ color: AMBER, caretColor: AMBER, textShadow: GLOW }}
                />
              </form>
            ) : (
              <span className="mt-3 inline-block h-[1em] w-[0.6em] animate-pulse" style={{ background: AMBER }} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
