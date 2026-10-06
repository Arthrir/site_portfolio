import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "fr" | "en";
export type Loc<T> = T & { en?: Partial<T> };
type Ctx = { lang: Lang; setLang: (l: Lang) => void; tr: <T>(fr: T, en: T) => T };

const META: Record<Lang, { title: string; desc: string }> = {
  fr: {
    title: "Arthur Doradoux — Ingénieur microélectronique · Product Manager",
    desc: "Portfolio d'Arthur Doradoux, ingénieur Mines Saint-Étienne (ISMIN) × Politecnico di Milano, à la recherche d'un stage de fin d'études Product Owner / Product Manager à partir d'avril 2027.",
  },
  en: {
    title: "Arthur Doradoux — Microelectronics Engineer · Product Manager",
    desc: "Portfolio of Arthur Doradoux, engineering student at Mines Saint-Étienne (ISMIN) × Politecnico di Milano, seeking a 5+ month Product Owner / Product Manager internship starting April 2027.",
  },
};

const initial = (): Lang => {
  try {
    const s = localStorage.getItem("lang");
    if (s === "fr" || s === "en") return s;
  } catch { /* stockage indisponible */ }
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
};

const LangContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, tr: (fr) => fr });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, set] = useState<Lang>(initial);
  const setLang = useCallback((l: Lang) => {
    set(l);
    try { localStorage.setItem("lang", l); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = META[lang].title;
    let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
    m.content = META[lang].desc;
  }, [lang]);
  const value = useMemo<Ctx>(() => ({ lang, setLang, tr: (fr, en) => (lang === "en" ? en : fr) }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Fusionne les surcharges anglaises `en` d'une entrée de données. */
export function loc<T extends object>(o: Loc<T>, lang: Lang): T {
  return lang === "en" && o.en ? { ...o, ...o.en } : o;
}

/** Sélecteur segmented FR / EN avec pill tactile. */
export function LangToggle({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full p-0.5 ${
        dark ? "bg-paper/10" : "bg-ink/5"
      } ${className}`}
    >
      {(["fr", "en"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            lang={l}
            className={`relative rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-wider uppercase transition-all duration-200 ${
              active
                ? dark
                  ? "bg-paper text-ink shadow-sm"
                  : "bg-ink text-paper shadow-sm"
                : dark
                ? "text-paper/60 hover:text-paper"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
