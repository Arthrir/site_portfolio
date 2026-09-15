// src/i18n/translations.ts
// Dictionnaire centralisé. Chaque page importe `t(lang)` et lit ses clés.
// La langue vient du cookie "lang" (posé par le toggle du Header) et est lue
// côté serveur par Astro.cookies, donc le HTML est déjà dans la bonne langue
// au premier rendu — pas de flash de langue, pas de dépendance JS.

export type Lang = 'fr' | 'en';

export const dict = {
  nav: {
    home: { fr: 'Accueil', en: 'Home' },
    projects: { fr: 'Projets', en: 'Projects' },
    skills: { fr: 'Compétences', en: 'Skills' },
    engagements: { fr: 'Engagements', en: 'Engagements' },
    about: { fr: 'À propos', en: 'About' },
  },
  common: {
    resume: { fr: 'CV', en: 'Resume' },
    resumeEn: { fr: 'Anglais (PDF)', en: 'English (PDF)' },
    resumeFr: { fr: 'Français (PDF)', en: 'French (PDF)' },
    getInTouch: { fr: 'Me contacter', en: 'Get in touch' },
    viewOnGithub: { fr: 'Voir sur GitHub', en: 'View on GitHub' },
    rights: { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
  },
  home: {
    heroKicker: { fr: 'Étudiant ingénieur — Microélectronique & Informatique', en: 'Engineering student — Microelectronics & Computer Science' },
    heroSubtitle: {
      fr: "Je construis une trajectoire entre hardware profond, systèmes embarqués et design produit, avec l'ambition de porter des produits tech à forte valeur d'usage.",
      en: 'Building a path across deep hardware, embedded systems and product design, with the ambition to lead technology products people actually want.'
    },
    ctaProjects: { fr: 'Explorer les projets', en: 'Explore Projects' },
    visionKicker: { fr: 'Vision' },
    visionTitle: { fr: 'Profil & Ambitions', en: 'Profile & Ambitions' },
    visionP1: {
      fr: "Actuellement étudiant ingénieur à <strong>Mines Saint-Étienne (ISMIN)</strong>, je construis un profil à l'intersection de l'ingénierie, du design et du management. Ma formation en microélectronique et informatique m'a donné des bases techniques solides à travers des projets en systèmes embarqués, hardware, architecture processeur et intelligence artificielle.",
      en: "Currently an engineering student at <strong>Mines Saint-Étienne (ISMIN)</strong>, I am building a profile at the intersection of engineering, design and management. My background in microelectronics and computer science has given me strong technical foundations through projects in embedded systems, hardware, processor architecture, and artificial intelligence."
    },
    visionP2: {
      fr: "Avec le temps, à travers mes projets académiques et mes expériences de leadership étudiant, j'ai compris que ce qui me motive le plus n'est pas seulement la conception technique d'un système. Je m'intéresse tout autant à pourquoi une technologie est développée, pour qui elle crée de la valeur, et comment elle peut devenir un produit cohérent et à fort impact.",
      en: 'Over time, through both academic projects and student leadership experiences, I realized that what drives me most is not only the technical design of a system. I am equally interested in understanding why a technology is developed, for whom it creates value, and how it can be turned into a relevant, coherent and impactful product.'
    },
    visionP3: {
      fr: 'À terme, mon objectif est d\'évoluer vers des rôles de <strong>Product Owner / Product Manager</strong> au cœur de l\'innovation technologique, en faisant le lien entre faisabilité technique, expérience utilisateur et stratégie.',
      en: 'In the long term, my dream is to grow into <strong>Product Owner / Product Manager</strong> roles at the heart of technological innovation, bridging technical feasibility, user experience, and strategy.'
    },
    visionQuote: {
      fr: "Mon objectif est de construire une véritable triple compétence en ingénierie, en design (via le Politecnico di Milano) et en management (via emlyon business school) pour porter des produits technologiques à fort impact.",
      en: 'My goal is to build a genuine triple competency across engineering, design (via Politecnico di Milano) and management (via emlyon business school) to lead high-impact technological products.'
    },
    careerKicker: { fr: 'Parcours' },
    careerTitle: { fr: 'Expérience', en: 'Experience' },
    educationKicker: { fr: 'Diplômes' },
    educationTitle: { fr: 'Formation', en: 'Education' },
    projectsKicker: { fr: 'Sélection' },
    projectsTitle: { fr: 'Projets à la une', en: 'Featured Projects' },
    projectsCta: { fr: 'Voir tous les projets', en: 'Browse Full Projects Hub' },
    viewInHub: { fr: 'Voir dans les projets', en: 'View in Projects Hub' },
  },
  about: {
    kicker: { fr: 'En dehors' },
    title: { fr: 'À propos', en: 'About' },
    intro: {
      fr: "Mon CV couvre ce que j'ai étudié et fait comme expériences. Cette page, c'est le reste — ce qui compte pour moi en dehors d'un rapport de labo ou d'une réunion de comité, et pourquoi je vise le produit plutôt que de rester purement technique.",
      en: "My CV covers what I've studied and worked on. This page is the rest of it — the things I care about outside a lab report or a committee meeting, and the reason I'm aiming at product rather than staying purely technical."
    },
  },
  engagements: {
    kicker: { fr: 'Leadership' },
    title: { fr: 'Engagements étudiants & Leadership', en: 'Student Engagements & Leadership' },
    subtitle: {
      fr: "Impliqué dans la vie de campus, la représentation étudiante et la gestion associative, j'y ai développé une expertise solide en leadership d'équipe, médiation institutionnelle et administration réseau.",
      en: 'Involved across campus life, student representation, and association management, developing strong expertise in team leadership, institutional mediation, and network administration.'
    },
    featuredLabel: { fr: 'Temps forts', en: 'Highlights' },
    othersLabel: { fr: 'Autres engagements', en: 'Other engagements' },
  },
  projects: {
    kicker: { fr: 'Hub' },
    title: { fr: 'Projets', en: 'Projects Hub' },
    subtitle: {
      fr: 'Réalisations techniques, prototypes hardware et architectures logicielles. Filtrez par tag ou triez par date.',
      en: 'Technical realizations, hardware prototypes, and software architectures. Filter by tag or sort by date.'
    },
    allProjects: { fr: 'Tous les projets', en: 'All Projects' },
    sortLabel: { fr: 'Trier :', en: 'Sort:' },
    sortRecent: { fr: 'Plus récents', en: 'Most recent' },
    sortOldest: { fr: 'Plus anciens', en: 'Oldest' },
    sortAz: { fr: 'A → Z', en: 'A → Z' },
    noResults: { fr: 'Aucun projet ne correspond à ce filtre.', en: 'No project matches this filter.' },
  },
  skills: {
    kicker: { fr: 'Boîte à outils' },
    title: { fr: 'Compétences', en: 'Skills' },
    subtitle: {
      fr: 'Un aperçu technique, transversal et linguistique — construit au fil des projets, stages et engagements présentés sur ce site.',
      en: 'A technical, cross-functional and language overview — built through the projects, internships and engagements shown across this site.'
    },
    technicalTitle: { fr: 'Compétences techniques', en: 'Technical skills' },
    transversalTitle: { fr: 'Compétences transversales', en: 'Cross-functional skills' },
    languagesTitle: { fr: 'Langues', en: 'Languages' },
    toolsTitle: { fr: 'Outils & logiciels', en: 'Tools & software' },
  },
} as const;

export function makeT(lang: Lang) {
  return function t(path: string): string {
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = dict;
    for (const p of parts) {
      node = node?.[p];
    }
    if (!node) return path;
    return node[lang] ?? node.fr ?? path;
  };
}

export function getLangFromCookie(cookieValue: string | undefined): Lang {
  return cookieValue === 'en' ? 'en' : 'fr';
}
