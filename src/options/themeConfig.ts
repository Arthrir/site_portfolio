export type ThemeOptionId = "original" | "option-a" | "option-b" | "option-c";

export interface ThemeOptionConfig {
  id: ThemeOptionId;
  route: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  palette: {
    paper: string;
    ink: string;
    mute: string;
    line: string;
    signal: string;
  };
  typography: {
    sans: string;
    serif: string;
    mono: string;
    concept: string;
  };
  highlights: string[];
}

export const THEME_OPTIONS: Record<ThemeOptionId, ThemeOptionConfig> = {
  original: {
    id: "original",
    route: "/",
    name: "Original (V3 Actuel)",
    category: "Base",
    tagline: "Style éditorial warm paper & accent orange",
    description: "La version actuelle avec fond crème (#EFEDE7), noir encre (#121211), accent orange (#FF4D00) et Instrument Serif.",
    palette: {
      paper: "#EFEDE7",
      ink: "#121211",
      mute: "#6E6C66",
      line: "#D6D3CB",
      signal: "#FF4D00",
    },
    typography: {
      sans: "Schibsted Grotesk",
      serif: "Instrument Serif",
      mono: "IBM Plex Mono",
      concept: "Style éditorial & littéraire classique",
    },
    highlights: ["Fond papier texturé", "Accent orange Anthropic", "Instrument Serif italique"],
  },
  "option-a": {
    id: "option-a",
    route: "/optionA",
    name: "Option A : Précision Hardware",
    category: "Axe 1",
    tagline: "Blanc titane épuré & Bleu cobalt électrique",
    description: "Inspiré des laboratoires de semi-conducteurs et d'instrumentation de pointe. Élimine le jaunissement pour une clarté maximale.",
    palette: {
      paper: "#F8F9FA",
      ink: "#0B0F19",
      mute: "#526071",
      line: "#E2E8F0",
      signal: "#2563EB",
    },
    typography: {
      sans: "Plus Jakarta Sans",
      serif: "Space Grotesk",
      mono: "IBM Plex Mono",
      concept: "Néo-grotesque géométrique & outline architectural pour le texte fantôme",
    },
    highlights: [
      "Fond blanc titane ultra-frais (#F8F9FA)",
      "Bleu cobalt technique (#2563EB)",
      "Typo Plus Jakarta Sans + Space Grotesk pour les gros titres",
      "Suppression du côté 'IA/Claude' sans rien perdre en élégance",
    ],
  },
  "option-b": {
    id: "option-b",
    route: "/optionB",
    name: "Option B : Design Industriel Suisse",
    category: "Axe 1",
    tagline: "Style Dieter Rams (Braun) & Teenage Engineering",
    description: "Axé sur le design produit physique, l'ergonomie et le prototypage. Fond minéral mat chaud et rouge signalétique pur.",
    palette: {
      paper: "#F4F4F0",
      ink: "#18181B",
      mute: "#71717A",
      line: "#D4D4D8",
      signal: "#E11D48",
    },
    typography: {
      sans: "Geist",
      serif: "Geist",
      mono: "IBM Plex Mono",
      concept: "Grotesque suisse universelle, épurée et chirurgicale",
    },
    highlights: [
      "Blanc cassé mat minéral (#F4F4F0)",
      "Rouge signalétique industriel (#E11D48)",
      "Typographie Geist (pureté géométrique)",
      "Parfait pour appuyer le double profil Ingénieur × Product Design",
    ],
  },
  "option-c": {
    id: "option-c",
    route: "/optionC",
    name: "Option C : Labo Sombre Microélectronique",
    category: "Axe 1",
    tagline: "Mode sombre salle blanche & Cyan laser FPGA",
    description: "Ambiance workstation de CAO électronique, oscilloscope et banc de mesure sous pénombre. Met en valeur les pistes lumineuses du Die.",
    palette: {
      paper: "#0B0E14",
      ink: "#F1F5F9",
      mute: "#94A3B8",
      line: "#1E293B",
      signal: "#06B6D4",
    },
    typography: {
      sans: "Plus Jakarta Sans",
      serif: "Space Grotesk",
      mono: "IBM Plex Mono",
      concept: "Haute lisibilité sur fond sombre et contrastes phosphorescents",
    },
    highlights: [
      "Fond sombre ardoise profond (#0B0E14)",
      "Cyan laser / trace d'oscilloscope (#06B6D4)",
      "Ressorti spectaculaire du Die interactif et du chronogramme",
      "Élégance nocturne haut de gamme",
    ],
  },
};
