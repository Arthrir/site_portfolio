import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, MotionValue } from "motion/react";
import { ArrowUpRight, Command, Copy, Check, Download, Mail, Search, CornerDownLeft, Send } from "lucide-react";
import Logo from "./components/Logo";
import Legal from "./sections/Legal";
import CvViewer from "./sections/CvViewer";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "./components/Brand";
import Passions from "./sections/Passions";
import Circuit from "./sections/Circuit";
import { LangProvider, LangToggle, loc, useLang, type Lang, type Loc } from "./i18n";

const F1 = lazy(() => import("./games/F1"));
const AimLab = lazy(() => import("./games/AimLab"));
const Blackjack = lazy(() => import("./games/Blackjack"));
const Minitel = lazy(() => import("./games/Minitel"));
type Game = "minitel" | "f1" | "aim" | "blackjack";

const SOCIALS = [
  { I: LinkedInIcon, l: "LinkedIn", h: "https://linkedin.com/in/arthur-doradoux" },
  { I: GitHubIcon, l: "GitHub", h: "https://github.com/Arthrir" },
  { I: WhatsAppIcon, l: "WhatsApp", h: "https://wa.me/33627883483" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------------- Data ---------------- */
const NAV: Loc<{ id: string; label: string }>[] = [
  { id: "roadmap", label: "Parcours", en: { label: "Journey" } },
  { id: "projets", label: "Projets", en: { label: "Projects" } },
  { id: "engagements", label: "Engagements", en: { label: "Involvement" } },
  { id: "passions", label: "Passions" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

const EXPERIENCES: Loc<{ co: string; logo: string; role: string; place: string; date: string; idx: string; points: string[]; tags: string[] }>[] = [
  {
    co: "Advantest",
    logo: "/logo/advantest.png",
    role: "Stage Ingénieur R&D Test Cell Integration",
    place: "Böblingen, Allemagne",
    date: "Avr. 2026 — Juil. 2026",
    idx: "02",
    points: [
      "Tests de PCBs de calibration destinés au test de puces IA/GPU.",
      "Modélisation et impression 3D d'un boîtier d'interface entre le testeur et l'ordinateur.",
      "Mesures et analyses de précision sur des PCBs à l'aide de Microscope, VNA et TDR.",
    ],
    tags: ["Hardware Testing", "PCB Calibration", "3D Printing", "VNA / TDR"],
    en: {
      role: "R&D Test Cell Integration Engineering Intern",
      place: "Böblingen, Germany",
      date: "Apr. 2026 — Jul. 2026",
      points: [
        "Testing calibration PCBs intended for AI/GPU chip testing.",
        "3D modeling and printing of an interface enclosure between the tester and the computer.",
        "Precision measurements and analysis on PCBs using a microscope, VNA and TDR.",
      ],
    },
  },
  {
    co: "PHINIA Delphi",
    logo: "/logo/phinia.png",
    role: "Stage Ingénieur Systèmes Hardware",
    place: "Blois, France",
    date: "Janv. 2025",
    idx: "01",
    points: [
      "Configuration et tests de systèmes d'injection (plateforme ECU 24V).",
      "Découverte des bancs de tests industriels et des protocoles de validation hardware.",
      "Validation fonctionnelle d'ECU avec application Hydrogène (H2).",
      "Caractérisation thermique d'un ECU via communication CAN après adaptation de 12V à 24V.",
    ],
    tags: ["Embedded Systems", "CAN Communication", "Thermal Characterization", "Hardware Validation"],
    en: {
      role: "Hardware Systems Engineering Intern",
      place: "Blois, France",
      date: "Jan. 2025",
      points: [
        "Configured and tested hardware/software using a 24V ECU platform.",
        "Introduction to industrial test benches and hardware validation protocols.",
        "Functional validation of ECUs for hydrogen-related applications.",
        "Performed thermal characterization using CAN communication after adaptation from 12V to 24V.",
      ],
    },
  },
];

const STACK: Loc<{ layer: string; n: string; items: string[] }>[] = [
  { layer: "Outils", n: "06", en: { layer: "Tools", items: ["STM32CubeIDE", "Arduino IDE", "Vivado", "ModelSim", "MATLAB / Simulink", "LTSpice", "Logisim Evolution", "Vector CANalyzer", "KiCad", "Autodesk Inventor", "Wireshark", "Docker", "Oscilloscope", "Precision Microscope", "VNA / TDR", "Spectrum Analyzer", "Function Generator", "SMD Soldering", "VS Code", "Typst", "Figma", "Unity"] }, items: ["STM32CubeIDE", "Arduino IDE", "Vivado", "ModelSim", "MATLAB / Simulink", "LTSpice", "Logisim Evolution", "Vector CANalyzer", "KiCad", "Autodesk Inventor", "Wireshark", "Docker", "Oscilloscope", "Microscope de précision", "VNA / TDR", "Analyseur de spectre", "GBF", "Soudage & CMS", "VS Code", "Typst", "Figma", "Unity"] },
  { layer: "Produit", n: "05", en: { layer: "Product", items: ["Product Management", "Project management (V-model / Agile)", "Team leadership", "Technical communication", "Event management", "Budget management (€25k)", "Institutional communication", "Roadmap & Backlog", "Planning"] }, items: ["Product Management", "Gestion de projet (Cycle en V / Agile)", "Leadership d'équipe", "Communication technique", "Organisation d'événements", "Gestion de budget (25k€)", "Communication institutionnelle", "Roadmap & Backlog", "Planification"] },
  { layer: "Design", n: "04", en: { items: ["UX Design", "Product Design", "Industrial Design", "3D & physical prototyping", "User Research", "Figma", "Unity"] }, items: ["UX Design", "Design Produit", "Design Industriel", "Prototypage 3D & physique", "Recherche Utilisateur", "Figma", "Unity"] },
  { layer: "Data & IA", n: "03", en: { layer: "Data & AI", items: ["NumPy", "Pandas", "Matplotlib", "Seaborn", "SciPy", "scikit-learn", "TensorFlow", "Keras", "PyTorch", "Signal processing", "Embedded AI"] }, items: ["NumPy", "Pandas", "Matplotlib", "Seaborn", "SciPy", "scikit-learn", "TensorFlow", "Keras", "PyTorch", "Traitement du signal", "IA embarquée"] },
  { layer: "Software & Sécu", n: "02", en: { layer: "Software & Security", items: ["Python", "C / C++", "Rust", "OCaml", "SQL", "Linux / Bash", "Git", "CI/CD", "Networking (TCP/IP, Sockets)", "Multithreading", "Cybersecurity", "Cryptography (ASCON)", "Network security", "OSINT", "Social Engineering"] }, items: ["Python", "C / C++", "Rust", "OCaml", "SQL", "Linux / Bash", "Git", "CI/CD", "Réseau (TCP/IP, Sockets)", "Multithreading", "Cybersécurité", "Cryptographie (ASCON)", "Sécurité des réseaux", "OSINT", "Social Engineering"] },
  { layer: "Hardware & RF", n: "01", en: { items: ["Embedded C / C++", "Assembly", "Arduino", "STM32 (HAL / LL)", "ESP32", "FPGA", "SystemVerilog / VHDL", "RISC-V architecture", "PCB (KiCad)", "Hardware prototyping", "Analog & digital electronics", "Sensors & instrumentation", "I2C · SPI · UART · CAN", "IoT · RF · LoRa · BLE", "Impedance matching", "S-parameters", "VNA / TDR", "EMC"] }, items: ["C / C++ embarqué", "Assembleur", "Arduino", "STM32 (HAL / LL)", "ESP32", "FPGA", "SystemVerilog / VHDL", "Architecture RISC-V", "PCB (KiCad)", "Prototypage matériel", "Électronique analogique & numérique", "Capteurs & instrumentation", "I2C · SPI · UART · CAN", "IoT · RF · LoRa · BLE", "Adaptation d'impédance", "S-parameters", "VNA / TDR", "CEM"] },
];
const LANGS: Loc<{ l: string; v: string; p: number }>[] = [
  { l: "Français", v: "Natif", p: 100, en: { l: "French", v: "Native" } },
  { l: "Anglais", v: "C1 · TOEIC 955", p: 88, en: { l: "English" } },
  { l: "Allemand", v: "B1", p: 50, en: { l: "German" } },
];

type Cat = "Hardware" | "Software" | "IA" | "Produit";
type Project = Loc<ProjectBase>;
type ProjectBase = { t: string; d: string; date: string; cat: Cat[]; tags: string[]; desc: string; link?: string; with?: string; current?: boolean; points?: string[]; img?: string[] };
const PROJECTS: Project[] = [
  {
    t: "FPGA — ECG & communication sécurisée",
    date: "2026",
    d: "Fév – Mar 2026",
    cat: ["Hardware"],
    tags: ["FPGA", "SystemVerilog", "Python", "Vivado"],
    desc: "Sécurisation matérielle de flux biomédicaux sensibles face aux attaques physiques et logiques.",
    points: [
      "Conception d'une architecture FPGA dédiée au déchiffrement temps réel de signaux ECG.",
      "Implémentation matérielle de l'algorithme cryptographique ASCON-128 en SystemVerilog.",
      "Vérification et banc de test sous Vivado avec simulation des vecteurs d'attaque.",
      "Interface avec un dashboard Python pour la visualisation télémétrique des constantes vitales.",
    ],
    with: "Yasmin Hadj-Said",
    en: {
      t: "FPGA — ECG & secure communication",
      d: "Feb – Mar 2026",
      desc: "Hardware-level security for sensitive biomedical data streams against physical and logical threats.",
      points: [
        "Designed a dedicated FPGA architecture for real-time decryption of ECG signals.",
        "Hardware implementation of the ASCON-128 cryptographic algorithm in SystemVerilog.",
        "Simulation and testbench validation in Vivado with attack-vector simulations.",
        "Bridged to a Python telemetry dashboard for real-time vital signs visualization.",
      ],
    },
  },
  {
    t: "IA embarquée — détection de défauts",
    date: "2026",
    d: "Fév – Mar 2026",
    cat: ["IA", "Hardware"],
    tags: ["STM32", "C", "Python"],
    desc: "Maintenance prédictive industrielle exécutée localement sur microcontrôleur basse consommation.",
    points: [
      "Entraînement et quantification d'un modèle de classification sous Python à partir de signaux vibratoires.",
      "Portage et optimisation de l'inférence en langage C sur microcontrôleur STM32.",
      "Validation des temps de calcul et de l'empreinte mémoire RAM/Flash sur cible réelle.",
    ],
    link: "https://github.com/Arthrir/ISMIN-IA_Embarquee_Projet",
    with: "Yasmin Hadj-Said",
    en: {
      t: "Embedded AI — fault detection",
      d: "Feb – Mar 2026",
      desc: "Industrial predictive maintenance running locally on low-power microcontrollers.",
      points: [
        "Trained and quantized a Python classification model from vibration sensor datasets.",
        "Ported and optimized C inference routines directly onto an STM32 microcontroller.",
        "Benchmarked execution latency and RAM/Flash memory footprint on real hardware.",
      ],
    },
  },
  {
    t: "IA pour le Manufacturing",
    date: "2026",
    d: "Fév – Mar 2026",
    cat: ["IA"],
    tags: ["Python", "ML", "Deep Learning"],
    desc: "Optimisation des cadences d'usinage et détection précoce de rebuts en environnement Usine 4.0.",
    points: [
      "Nettoyage et ingénierie de variables sur des séries temporelles issues de capteurs d'atelier.",
      "Déploiement de modèles d'apprentissage supervisé et de réseaux profonds sous Python.",
      "Détection d'anomalies en temps quasi-réel pour prévenir les arrêts de ligne non planifiés.",
    ],
    with: "Yasmin Hadj-Said",
    en: {
      t: "AI for Manufacturing",
      d: "Feb – Mar 2026",
      desc: "Machining throughput optimization and early defect detection for Industry 4.0.",
      points: [
        "Data cleaning and feature engineering on time-series telemetry from factory floor sensors.",
        "Trained machine learning models and neural networks in Python.",
        "Near-real-time anomaly detection to prevent unplanned assembly line shutdowns.",
      ],
    },
  },
  {
    t: "Terrariot — IoT qualité de l'air",
    date: "2025",
    d: "Nov 2025 – Fév 2026",
    cat: ["Hardware", "Produit"],
    tags: ["STM32", "Capteurs", "Impression 3D", "Inventor"],
    desc: "Station environnementale autonome pour le bien-être animal et le suivi de microclimats en parcs zoologiques.",
    points: [
      "Sélection et interfaçage d'un réseau de capteurs (température, humidité, CO2, COV) sur STM32.",
      "Routage électronique et programmation du microcontrôleur pour transmission sans fil périodique.",
      "Modélisation CAO sous Autodesk Inventor et fabrication d'un boîtier étanche par impression 3D.",
    ],
    with: "Jade Diouri",
    en: {
      t: "Terrariot — air quality IoT",
      d: "Nov 2025 – Feb 2026",
      desc: "Autonomous environmental monitoring station for animal welfare and zoo microclimates.",
      points: [
        "Selected and interfaced environmental sensor suite (temperature, humidity, CO2, VOC) with STM32.",
        "Hardware schematic, routing and firmware development for scheduled wireless transmission.",
        "Parametric CAD design in Autodesk Inventor and rapid prototyping via 3D printing.",
      ],
      tags: ["STM32", "Sensors", "3D Printing", "Inventor"],
    },
  },
  {
    t: "Processeur RISC-V en SystemVerilog",
    date: "2025",
    d: "Oct 2025 – Jan 2026",
    cat: ["Hardware"],
    tags: ["RISC-V", "SystemVerilog"],
    desc: "Cœur de calcul 32 bits pipeliné conçu de zéro selon les spécifications du jeu d'instructions ouvert.",
    points: [
      "Conception du chemin de données (datapath) et de l'unité de contrôle en SystemVerilog.",
      "Implémentation du pipeline à étages avec gestion des aléas structurels, de données et de contrôle.",
      "Résolution optimisée des sauts et branchements conditionnels (jumps & branches).",
      "Simulation et validation rigoureuse des instructions RV32I via bancs de test dédiés.",
    ],
    with: "Yasmin Hadj-Said",
    en: {
      t: "RISC-V processor in SystemVerilog",
      d: "Oct 2025 – Jan 2026",
      desc: "Pipelined 32-bit computing core designed from scratch according to open instruction set specifications.",
      points: [
        "Designed the datapath and control unit logic from scratch in SystemVerilog.",
        "Implemented a multi-stage pipeline with hazard mitigation (structural, data, and control stalls).",
        "Optimized resolution mechanisms for conditional jumps and branches.",
        "Verified RV32I base instructions with custom testbenches.",
      ],
    },
  },
  {
    t: "CPU RV32I sur Logisim",
    img: ["/media/ismin-projets.png"],
    date: "2025",
    d: "Oct – Déc 2025",
    cat: ["Hardware"],
    tags: ["RISC-V", "Logisim"],
    desc: "Modélisation logique schématique et simulation cycle par cycle d'un microprocesseur.",
    points: [
      "Assemblage visuel de l'architecture RV32I sur la suite Logisim-evolution.",
      "Conception de l'ALU 32 bits, du banc de registres multi-ports et de l'unité de décodage d'instructions.",
      "Gestion des cycles d'horloge, de la mémoire programme et de la mémoire vive de données.",
    ],
    with: "Inès Lixi",
    en: {
      t: "RV32I CPU in Logisim",
      d: "Oct – Dec 2025",
      desc: "Schematic logic design and cycle-by-cycle simulation of a microprocessor architecture.",
      points: [
        "Constructed complete schematic RV32I architecture in Logisim-evolution.",
        "Engineered 32-bit ALU, multi-port register bank, and instruction decoding units.",
        "Managed clock cycles, program ROM, and data RAM interfaces.",
      ],
    },
  },
  {
    t: "Sécurité des réseaux",
    date: "2025",
    d: "Oct 2025 – Jan 2026",
    cat: ["Software"],
    tags: ["Python", "Linux", "OSINT"],
    desc: "Audit offensif d'infrastructures et banc d'outils automatisés pour l'analyse de vulnérabilités.",
    points: [
      "Cartographie et détection de vecteurs d'attaque sur environnement réseau virtualisé et cloisonné.",
      "Exploitation contrôlée de failles système (buffer overflows, injections, élévation de privilèges).",
      "Scripting en Python d'utilitaires sur-mesure d'automatisation des tests d'intrusion.",
    ],
    with: "Yasmin Hadj-Said",
    en: {
      t: "Network security",
      d: "Oct 2025 – Jan 2026",
      desc: "Offensive infrastructure audit and automated tooling for vulnerability assessment.",
      points: [
        "Network reconnaissance and attack surface mapping in an isolated virtualized environment.",
        "Controlled vulnerability exploitation (buffer overflows, injections, privilege escalation).",
        "Developed automated penetration testing and assessment scripts in Python.",
      ],
    },
  },
  {
    t: "Ventilateur à capteur capacitif",
    img: ["/media/ismin-projets2.png"],
    date: "2025",
    d: "Fév – Juin 2025",
    cat: ["Hardware", "Produit"],
    tags: ["STM32", "PCB", "KiCad", "C"],
    desc: "IHM tactile sans contact mécanique et contrôle d'actionneur à commande progressive.",
    points: [
      "Routage d'une carte électronique personnalisée sous KiCad intégrant les pistes capacitives.",
      "Algorithme d'acquisition différentielle sur STM32 pour interpréter la position du doigt.",
      "Asservissement PWM de la vitesse de rotation du ventilateur sans à-coups.",
    ],
    with: "Inès Lixi",
    en: {
      t: "Capacitive-sensor fan",
      d: "Feb – Jun 2025",
      desc: "Solid-state touch interface and stepless actuator control without mechanical wear.",
      points: [
        "Custom PCB layout in KiCad integrating copper touch electrodes and driver circuitry.",
        "Differential signal acquisition algorithm on STM32 to track sliding finger position.",
        "Smooth PWM duty cycle modulation for stepless fan speed control.",
      ],
    },
  },
  {
    t: "Robot autonome STM32",
    img: ["/media/ismin-projets.png"],
    date: "2025",
    d: "Fév – Juin 2025",
    cat: ["Hardware"],
    tags: ["STM32", "Robotique", "C"],
    desc: "Navigation autonome réactive et asservissement de distance en boucle fermée.",
    points: [
      "Développement bas-niveau en C sur microcontrôleur STM32 (timers, interruptions, PWM).",
      "Traitement des données de télémétrie pour un arrêt calibré à précisément 20 cm de l'obstacle.",
      "Boucle de rétroaction en temps réel pour le suivi dynamique des déplacements de la cible.",
    ],
    with: "Inès Lixi",
    en: {
      t: "Autonomous STM32 robot",
      d: "Feb – Jun 2025",
      desc: "Autonomous reactive navigation and closed-loop distance control.",
      points: [
        "Low-level C firmware development on STM32 (hardware timers, interrupts, PWM).",
        "Telemetry data processing enabling precision stopping at exactly 20 cm from obstacles.",
        "Real-time feedback loop for dynamic trajectory tracking of moving targets.",
      ],
      tags: ["STM32", "Robotics", "C"],
    },
  },
  {
    t: "🏆 Hackathon — 1er Prix",
    date: "2025",
    d: "2025",
    cat: ["Produit", "Hardware"],
    tags: ["Hackathon", "Prototypage", "Innovation"],
    desc: "Sprint d'innovation matériel et logiciel récompensé par la première place du jury.",
    points: [
      "Lauréat de la 1ère place parmi l'ensemble des équipes participantes de l'école.",
      "Itération éclair sous contrainte de 48h : architecture, assemblage et programmation fonctionnelle.",
      "Présentation synthétique et démonstration en direct du prototype opérationnel devant le jury.",
    ],
    en: {
      t: "🏆 Hackathon — 1st Place",
      d: "2025",
      desc: "Hardware & software innovation sprint awarded first place by the judging panel.",
      points: [
        "Awarded 1st place among all participating engineering teams.",
        "Fast-paced 48h iteration: architecture design, hardware assembly and functional coding.",
        "Live technical demonstration and executive pitch in front of the judging panel.",
      ],
      tags: ["Hackathon", "Prototyping", "Innovation"],
    },
  },
  {
    t: "Chiffrement ASCON128",
    date: "2025",
    d: "Fév – Mai 2025",
    cat: ["Hardware", "Software"],
    tags: ["SystemVerilog", "Crypto", "Typst"],
    desc: "Accélérateur matériel pour le standard de cryptographie légère sélectionné par le NIST.",
    points: [
      "Conception d'une machine d'états finis (FSM) optimisée pour le chiffrement/déchiffrement ASCON-128.",
      "Synthèse et simulation sous ModelSim/Vivado pour garantir l'intégrité des trames chiffrées.",
      "Documentation technique et benchmark de consommation de ressources rédigés sous Typst.",
    ],
    link: "https://github.com/Arthrir/ISMIN-ASCON-CSN",
    en: {
      t: "ASCON128 encryption",
      d: "Feb – May 2025",
      desc: "Hardware accelerator for the lightweight cryptography standard selected by NIST.",
      points: [
        "Designed an optimized finite-state machine (FSM) for ASCON-128 encryption and decryption.",
        "Synthesized and simulated in ModelSim/Vivado to guarantee payload integrity.",
        "Comprehensive technical documentation and resource footprint benchmark written in Typst.",
      ],
    },
  },
  {
    t: "Jeu State.io multijoueur",
    img: ["/media/ismin-projets2.png"],
    date: "2025",
    d: "Fév – Avr 2025",
    cat: ["Software"],
    tags: ["C", "Sockets", "Ncurses", "Dev Lead"],
    desc: "Jeu de stratégie réseau en temps réel développé en C avec affichage dans le terminal.",
    points: [
      "Direction technique du projet et découpage modulaire du code en binôme.",
      "Communication réseau asynchrone multijoueur via sockets TCP/IP sous Linux.",
      "Rendu graphique dynamique et réactif dans la console terminal via la bibliothèque Ncurses.",
    ],
    link: "https://github.com/Arthrir/ISMIN-Jeu_Stateio",
    with: "Inès Lixi",
    en: {
      t: "Multiplayer State.io game",
      d: "Feb – Apr 2025",
      desc: "Real-time network strategy game written in C with terminal rendering.",
      points: [
        "Technical lead role overseeing code architecture and task distribution.",
        "Multiplayer asynchronous network communication over Linux TCP/IP sockets.",
        "Dynamic terminal-based GUI and interactive gameplay loops using the Ncurses library.",
      ],
    },
  },
  {
    t: "Handi'Mines — sensibilisation",
    date: "2025",
    d: "Fév – Juin 2025",
    cat: ["Produit"],
    tags: ["Événementiel", "Communication"],
    desc: "Action d'inclusion étudiante et découverte des pratiques sportives adaptées.",
    points: [
      "Gestion logistique et coordination des intervenants associatifs sur le campus de l'école.",
      "Animation d'ateliers immersifs de cécifoot et showdown pour sensibiliser au handicap visuel.",
      "Campagne de communication interne mobilisant étudiants et personnels des Mines.",
    ],
    en: {
      t: "Handi'Mines — awareness",
      d: "Feb – Jun 2025",
      desc: "Campus student inclusion initiative exploring adapted sports practices.",
      points: [
        "Logistical management and partnership coordination with adaptive sports organizations.",
        "Facilitated immersive blind football and showdown workshops to raise visual impairment awareness.",
        "Campus-wide communication campaign engaging students and faculty staff.",
      ],
      tags: ["Events", "Communication"],
    },
  },
  {
    t: "Velisud — Programme Entrep'",
    date: "2024",
    d: "Oct 2024 – Mar 2025",
    cat: ["Produit", "Hardware"],
    tags: ["Entrepreneuriat", "Tech Lead", "Électronique"],
    desc: "Projet entrepreneurial de micro-mobilité durable et décarbonée pour territoires périurbains.",
    points: [
      "Rôle de Tech Lead : définition du cahier des charges système et de l'architecture électronique.",
      "Étude de faisabilité énergétique, motorisation électrique et instrumentation embarquée.",
      "Construction du business plan et soutenance finale devant le réseau d'entrepreneurs Les Entrep'.",
    ],
    link: "/assets/VELISUD.pdf",
    en: {
      t: "Velisud — Entrepreneurship program",
      d: "Oct 2024 – Mar 2025",
      desc: "Sustainable micro-mobility entrepreneurial venture for regional daily commuting.",
      points: [
        "Tech Lead role defining system specifications and onboard electronic architecture.",
        "Energy feasibility study, electric powertrain sizing, and embedded sensor instrumentation.",
        "Business plan formulation and final defense before the Les Entrep' jury panel.",
      ],
      tags: ["Entrepreneurship", "Tech Lead", "Electronics"],
    },
  },
  {
    t: "Portfolio arthurdx.com",
    date: "2024",
    d: "2024 – aujourd'hui",
    cat: ["Software", "Produit"],
    tags: ["Astro", "React", "Motion", "Figma"],
    desc: "Vitrine interactive personnelle pensée comme une pièce d'ingénierie logicielle.",
    current: true,
    points: [
      "Direction artistique sous Figma et architecture front-end moderne sous Astro & React.",
      "Animations fluides avec Framer Motion, typographie éditoriale suisse et soin du détail d'ingénieur.",
      "Module rétro Minitel interactif, mini-jeux embarqués et optimisation des Core Web Vitals.",
    ],
    en: {
      d: "2024 – present",
      desc: "Interactive personal showcase engineered with high-precision software craft.",
      points: [
        "Art direction in Figma and modern frontend architecture using Astro and React.",
        "Fluid Framer Motion physics, Swiss editorial typography, and engineered micro-interactions.",
        "Interactive Minitel retro module, embedded mini-games, and Core Web Vitals tuning.",
      ],
    },
  },
  {
    t: "TIPE — Simulation Blackjack",
    date: "2023",
    d: "Jan 2023 – Juil 2024",
    cat: ["Software"],
    tags: ["Python", "Simulation", "Matplotlib"],
    desc: "Modélisation stochastique et analyse comportementale de la théorie des jeux en CPGE.",
    points: [
      "Développement sous Python d'un moteur de jeu Monte-Carlo simulant des millions de parties.",
      "Modélisation mathématique du ressenti psychologique (fonction d'utilité et aversion au risque).",
      "Optimisation algorithmique de la politique de gains pour maximiser la rétention des joueurs.",
      "Tracés statistiques Matplotlib et soutenance officielle de concours aux grandes écoles.",
    ],
    en: {
      t: "TIPE — Blackjack simulation",
      d: "Jan 2023 – Jul 2024",
      desc: "Stochastic modeling and behavioral game theory research in preparatory classes.",
      points: [
        "Developed a Monte-Carlo simulation engine in Python processing millions of rounds.",
        "Mathematical formulation of psychological player utility and risk-aversion curves.",
        "Algorithmic optimization of casino payoff balance to maximize player retention.",
        "Matplotlib statistical graphics and competitive defense for engineering school entrance.",
      ],
      tags: ["Python", "Simulation", "Matplotlib"],
    },
  },
];

type School = Loc<{
  name: string;
  logo: string;
  degree: string;
  place: string;
  date: string;
  badge?: string;
  formation?: string;
  troncCommun?: string[];
  electifs?: string[];
  courses?: string[];
  goal: string;
  link?: string;
}>;

const SCHOOLS: School[] = [
  {
    name: "Politecnico di Milano",
    logo: "/logo/polimi.png",
    degree: "Master in Design & Engineering",
    place: "Milan, Italie",
    date: "Sep. 2026 — Fév. 2027",
    badge: "Semestre international",
    courses: [
      "Product Design Studio 1",
      "UX Design",
      "Design and Manufacturing",
      "Virtual and Physical Prototyping",
    ],
    goal: "Maîtriser l'ergonomie, le prototypage rapide et l'UX pour placer l'utilisateur au centre de la conception matérielle. Une compétence clé pour diriger des produits dans les entreprises technologiques innovantes.",
    link: "https://www.polimi.it/",
    en: {
      place: "Milan, Italy",
      date: "Sep. 2026 — Feb. 2027",
      badge: "International semester",
      courses: [
        "Product Design Studio 1",
        "UX Design",
        "Design and Manufacturing",
        "Virtual and Physical Prototyping",
      ],
      goal: "Master ergonomics, rapid prototyping, and UX to put the user at the center of hardware design—a key skill for leading products in innovative tech companies.",
    },
  },
  {
    name: "Mines de Saint-Étienne",
    logo: "/logo/emse.png",
    degree: "Diplôme d'ingénieur ISMIN",
    place: "Gardanne, France",
    date: "Sep. 2024 — Juin 2027",
    badge: "Grande École d'ingénieurs",
    formation: "Microélectronique et Informatique",
    troncCommun: [
      "Microcontrôleurs",
      "Traitement du Signal",
      "Architecture CPU",
      "Électronique Numérique/Analogique",
      "Cryptographie",
    ],
    electifs: [
      "IA pour la Production",
      "FPGA & Sécurité",
      "Entrepreneuriat",
    ],
    goal: "Formation d'ingénieur généraliste de haut niveau en systèmes embarqués, circuits intégrés et informatique, combinant rigueur scientifique, fabrication et gestion de projet.",
    link: "https://www.mines-stetienne.fr/",
    en: {
      name: "Mines Saint-Étienne",
      degree: "ISMIN Engineering Degree",
      place: "Gardanne, France",
      date: "Sep. 2024 — Jun. 2027",
      badge: "Top French Engineering School",
      formation: "Microelectronics and Computer Science",
      troncCommun: [
        "Microcontrollers",
        "Signal Processing",
        "CPU Architecture",
        "Digital/Analog Electronics",
        "Cryptography",
      ],
      electifs: [
        "AI for Production",
        "FPGA and Security",
        "Entrepreneurship",
      ],
      goal: "Top-tier engineering curriculum in embedded systems, integrated circuits, and computer science, bridging hardware, software and project management.",
    },
  },
  {
    name: "Lycée Pothier",
    logo: "/logo/pothier.png",
    degree: "Classes Préparatoires (MPSI / MP*)",
    place: "Orléans, France",
    date: "Sep. 2022 — Juin 2024",
    badge: "MPSI · MP*",
    courses: [
      "Mathématiques",
      "Physique",
      "Informatique",
    ],
    goal: "Deux années de formation scientifique intensive (CPGE) développant rigueur conceptuelle, modélisation mathématique et endurance de travail.",
    link: "https://lycee-pothier.fr/",
    en: {
      degree: "Intensive Preparatory Classes (CPGE)",
      place: "Orléans, France",
      date: "Sep. 2022 — Jun. 2024",
      badge: "MPSI · MP*",
      courses: [
        "Mathematics",
        "Physics",
        "Computer Science",
      ],
      goal: "Two years of intensive scientific preparatory training developing deep mathematical modeling, logical precision and high-performance problem solving.",
    },
  },
  {
    name: "Lycée Notre-Dame des Aydes",
    logo: "/logo/nda.png",
    degree: "Baccalauréat Mention Bien (Section Européenne)",
    place: "Blois, France",
    date: "Sep. 2019 — Juin 2022",
    badge: "Mention Bien",
    courses: [
      "Mathématiques",
      "Physique-Chimie",
      "HGGSP",
      "Option Maths Expertes",
      "Section Européenne Anglais",
    ],
    goal: "Baccalauréat scientifique mention Bien avec parcours bilingue en Section Européenne et renforcement en mathématiques expertes.",
    link: "https://aydes.fr/",
    en: {
      degree: "High School Diploma with Honors (European Track)",
      place: "Blois, France",
      date: "Sep. 2019 — Jun. 2022",
      badge: "Honors (Mention Bien)",
      courses: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Geopolitics",
        "Advanced Mathematics option",
        "European Track",
      ],
      goal: "Scientific Baccalaureate graduated with honors and bilingual European curriculum.",
    },
  },
];

type Eng = Loc<EngBase>;
type EngBase = { logo: string; org: string; role: string; date: string; desc: string[]; tags?: string[]; site?: string; with?: string; img?: string[]; action?: "minitel" };
type Feat = EngBase & { stats: string[][]; points: string[] };
const FEATURED: Loc<Feat>[] = [
  { logo: "/logo/minitel.png", org: "MINITEL", role: "Président", date: "Mar 2025 — Mar 2026", action: "minitel", stats: [["16", "membres"], ["150+", "logements connectés"], ["25k€", "budget"]], points: ["Réseau Wi-Fi & filaire du campus", "LAN avec Riot Games & Red Bull", "Membre d'honneur jusqu'en mars 2027"], site: "https://minitel.emse.fr/",
    en: { role: "President", date: "Mar 2025 — Mar 2026", stats: [["16", "members"], ["150+", "connected housing units"], ["€25k", "budget"]], points: ["Campus Wi-Fi & wired network", "LAN parties with Riot Games & Red Bull", "Honorary member through March 2027"],
      desc: ["Student association for computing, networking and gaming. Led the association (16 members) and drove its major projects.", "Managed and maintained the campus Wi-Fi and wired internet network serving 150+ student apartments.", "Organized events and LAN parties in partnership with Riot Games and Red Bull.", "Coordinated teams, planned events and managed a budget of over €25,000.", "Elected honorary member of the association at the end of my presidential term, continuing as honorary member through March 2027."],
      tags: ["Team management", "Network administration", "Budget", "Partnerships"] },
    desc: ["Association étudiante d'informatique, réseau et gaming. Direction de l'association (16 membres) et pilotage des projets majeurs.", "Gestion et maintenance du réseau internet Wi-Fi et filaire du campus : plus de 150 appartements étudiants.", "Organisation d'événements et de LAN en partenariat avec Riot Games et Red Bull.", "Coordination des équipes, planification d'événements et gestion d'un budget supérieur à 25 000 €.", "Élu membre d'honneur de l'association à la fin de mon mandat présidentiel, membre d'honneur actif jusqu'en mars 2027."],
    tags: ["Management d'équipe", "Administration réseau", "Budget", "Partenariats"], img: ["/media/lan_lol_minitel.jpeg", "/media/affiche_lan_lol.png", "/media/minitel-3d-vlad.png"] },
  { logo: "/logo/emse.png", org: "Mines Saint-Étienne", role: "Élu au comité de l'enseignement", date: "Fév 2026 — aujourd'hui", stats: [["3000", "élèves représentés"], ["ISMIN", "& ICM"]], points: ["Décisions sur les programmes pédagogiques", "Porte-parole des promotions", "Gestion des parties prenantes"], site: "https://www.mines-stetienne.fr/", with: "Laure Rivier",
    en: { role: "Elected member, Academic Committee", date: "Feb 2026 — present", stats: [["3000", "students represented"], ["ISMIN", "& ICM"]], points: ["Decisions on academic curricula", "Spokesperson for my cohorts", "Stakeholder management"],
      desc: ["Take part in Academic Committee meetings, where major changes to the school's curricula are discussed, decided and presented.", "Representative and spokesperson for the ISMIN and ICM cohorts."],
      tags: ["Institutional communication", "Mediation", "Stakeholders"] },
    desc: ["Participation aux réunions du comité de l'enseignement, où sont discutés, décidés et présentés les grands changements des programmes pédagogiques de l'école.", "Représentant et porte-parole des promotions ISMIN et ICM."],
    tags: ["Communication institutionnelle", "Médiation", "Parties prenantes"] },
];
const OTHERS: Eng[] = [
  { logo: "/logo/emse.png", org: "Mines Saint-Étienne", role: "Représentant de promotion", date: "2024 — auj.", with: "Laure Rivier", desc: ["Réunions mensuelles avec la direction du campus pour remonter les points clés de la promotion.", "Liaison active avec les professeurs pour des ajustements de cours ou d'évaluations.", "Création de questionnaires et centralisation des avis et ressentis."], en: { role: "Class representative", date: "2024 — present", desc: ["Monthly meetings with campus leadership to escalate the class's key concerns.", "Active liaison with faculty to adjust courses and assessments.", "Designed surveys and consolidated student feedback."] } },
  { logo: "/logo/emse.png", org: "Mines Saint-Étienne", role: "Ambassadeur communication", date: "2025 — auj.", desc: ["Refonte intégrale de la plaquette Alpha du cursus ISMIN pour les futurs élèves ingénieurs.", "Écriture de scripts pour des capsules vidéo destinées aux réseaux sociaux de l'école.", "Réalisation d'une vidéo de présentation de l'uniforme de Mines Saint-Étienne."], en: { role: "Communications ambassador", date: "2025 — present", desc: ["Complete redesign of the ISMIN program brochure for prospective engineering students.", "Wrote scripts for short videos on the school's social media.", "Produced a video presenting the Mines Saint-Étienne uniform."] } },
  { logo: "/logo/alumni.png", org: "Alumni Mines", role: "Relai de la promotion", date: "À vie", with: "Laure Rivier", desc: ["Représentation de la promotion auprès du réseau des anciens pour assurer la communication, organiser des événements de networking et faciliter la collaboration professionnelle."], site: "https://www.mines-saint-etienne.org/", en: { role: "Class liaison", date: "For life", desc: ["Represent my class within the alumni network: handling communication, organizing networking events and fostering professional collaboration."] } },
  { logo: "/logo/jmp.png", org: "Junior Mines Provence", role: "Responsable communication & marketing", date: "2025 — auj.", desc: ["Junior-Entreprise du campus Georges Charpak Provence de Mines Saint-Étienne.", "Responsable de la communication et du marketing : image de marque, réseaux sociaux et supports de prospection."], site: "https://www.junior-mines-provence.fr/", en: { role: "Head of communications & marketing", date: "2025 — present", desc: ["Junior Enterprise of the Mines Saint-Étienne Georges Charpak Provence campus.", "In charge of communications and marketing: brand image, social media and prospecting materials."] } },
  { logo: "/logo/bde.jpeg", org: "BDE", role: "Responsable uniformes & merch", date: "2025 — 2026", desc: ["Responsable uniformes et merchandising du Bureau des Élèves.", "Gestion des commandes et de la distribution des uniformes et produits dérivés."], site: "https://bde-emse.fr/", en: { role: "Uniforms & merch lead", desc: ["In charge of uniforms and merchandise for the Student Union.", "Managed orders and distribution of uniforms and branded products."] } },
  { logo: "/logo/fei.jpeg", org: "FEI", role: "Chargé logistique", date: "2025", desc: ["Accueil et guidage des entreprises.", "Bon déroulement des conférences et résolution des problèmes logistiques sur site."], site: "https://fei-aix.com/", en: { role: "Logistics officer", desc: ["Welcomed and guided partner companies.", "Ensured conferences ran smoothly and solved on-site logistics issues."] } },
  { logo: "/logo/solidar-ismin.jpg", org: "Solidar'ISMIN", role: "Pôle prévention HVSSD", date: "2025 — 2026", desc: ["Formation de tous les bureaux associatifs du campus aux enjeux de harcèlement et violences (HVSSD) via une formation en réalité virtuelle."], en: { role: "Harassment prevention team", desc: ["Trained every student association board on campus on harassment and sexual and gender-based violence through a virtual reality program."] } },
  { logo: "/logo/comif.jpeg", org: "COMIF", role: "Serveur au bar étudiant", date: "2025 — 2026", desc: ["Service quotidien pendant les pauses et soirées associatives, gestion des transactions et service client."], en: { role: "Student bar server", desc: ["Daily service during breaks and association evenings, handling transactions and customer service."] } },
];

/* ---------------- Primitives ---------------- */
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] uppercase tracking-[0.14em] text-mute ${className}`}>{children}</span>;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease, delay }}>
      {children}
    </motion.div>
  );
}

/* ---------------- Chip die (hero visual) ---------------- */
const TRACES = [
  // Differential pair top-left
  "M150 130 V90 H90 V40 H78",
  "M158 130 V95 H98 V40 H100",
  // High-speed serial bus top-right
  "M242 130 V80 H310 V40 H322",
  "M250 130 V72 H332 V40 H344",
  // Clock line & control left
  "M130 160 H80 V120 H40 V108",
  "M130 180 H70 V220 H40 V240",
  "M130 220 H90 V270 H40 V284",
  // SPI / I2C bus right
  "M270 165 H320 V110 H360 V98",
  "M270 185 H330 V210 H360 V220",
  "M270 235 H315 V300 H360 V306",
  // Power / Ground & Analog bottom
  "M160 270 V320 H110 V360 H100",
  "M180 270 V335 H155 V360 H144",
  "M220 270 V335 H245 V360 H254",
  "M240 270 V315 H290 V360 H298",
];

// Test points on PCB
const TEST_POINTS = [
  { x: 110, y: 150, label: "TP1_CLK" },
  { x: 290, y: 140, label: "TP2_TX" },
  { x: 105, y: 250, label: "TP3_RST" },
  { x: 295, y: 260, label: "TP4_VREF" },
];

// Surface mount decoupling capacitors (0402 / 0603 packages)
const SM_CAPS = [
  { x: 112, y: 110, vertical: false },
  { x: 278, y: 105, vertical: true },
  { x: 114, y: 285, vertical: true },
  { x: 276, y: 280, vertical: false },
];

function Die() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 120, damping: 18 });
  const [hot, setHot] = useState(false);
  const { tr } = useLang();

  return (
    <div
      ref={ref}
      className="relative aspect-square w-full pb-8 [perspective:1200px]"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => { mx.set(0); my.set(0); setHot(false); }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="absolute inset-0 [transform-style:preserve-3d]">
        <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
          {/* PCB Ground plane fiducials */}
          <circle cx="28" cy="28" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="28" cy="28" r="1.5" className="fill-ink/50" />
          <circle cx="372" cy="28" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="372" cy="28" r="1.5" className="fill-ink/50" />
          <circle cx="372" cy="372" r="4" className="fill-none stroke-ink/30" strokeWidth="1" />
          <circle cx="372" cy="372" r="1.5" className="fill-ink/50" />

          {/* Peripheral SMD Pads (QFP/BGA package perimeter) */}
          {Array.from({ length: 13 }).map((_, i) => (
            <g key={`pads-${i}`} className="fill-ink/80 transition-colors">
              <rect x={56 + i * 22} y={30} width={10} height={14} rx={1} />
              <rect x={56 + i * 22} y={356} width={10} height={14} rx={1} />
              <rect x={30} y={56 + i * 22} width={14} height={10} rx={1} />
              <rect x={356} y={56 + i * 22} width={14} height={10} rx={1} />
            </g>
          ))}

          {/* PCB Routing Traces */}
          {TRACES.map((d, i) => (
            <g key={d}>
              <path d={d} className="stroke-line/90" strokeWidth="1.25" strokeLinejoin="round" fill="none" />
              <motion.path
                d={d} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-signal"
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ pathLength: [0, 0.22, 0], pathOffset: [0, 0.65, 1] }}
                transition={{ duration: hot ? 1.0 : 2.5, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
              />
            </g>
          ))}

          {/* SMD Capacitors / Resistors */}
          {SM_CAPS.map((cap, i) => (
            <g key={`smd-${i}`} transform={`translate(${cap.x}, ${cap.y})`}>
              {cap.vertical ? (
                <>
                  <rect x="-4" y="-8" width="8" height="16" rx="1" className="fill-ink/20 stroke-ink/40" strokeWidth="0.75" />
                  <rect x="-4" y="-8" width="8" height="3" className="fill-ink/70" />
                  <rect x="-4" y="5" width="8" height="3" className="fill-ink/70" />
                </>
              ) : (
                <>
                  <rect x="-8" y="-4" width="16" height="8" rx="1" className="fill-ink/20 stroke-ink/40" strokeWidth="0.75" />
                  <rect x="-8" y="-4" width="3" height="8" className="fill-ink/70" />
                  <rect x="5" y="-4" width="3" height="8" className="fill-ink/70" />
                </>
              )}
            </g>
          ))}

          {/* Test Points with circular ring */}
          {TEST_POINTS.map((tp) => (
            <g key={tp.label}>
              <circle cx={tp.x} cy={tp.y} r="3" className="fill-signal/20 stroke-signal" strokeWidth="1" />
              <circle cx={tp.x} cy={tp.y} r="1" className="fill-signal" />
              <text x={tp.x + 5} y={tp.y - 4} fontSize="6" className="fill-mute font-mono tracking-tight">{tp.label}</text>
            </g>
          ))}

          {/* QFP / QFN IC Package Body */}
          <g>
            {/* Package Outline with Pin 1 chamfer / index corner */}
            <path
              d="M142 126 H270 V274 H126 V142 Z"
              className="fill-ink"
            />
            {/* Pin 1 dimple marker */}
            <circle cx="140" cy="140" r="4.5" className="fill-paper/20 stroke-paper/40" strokeWidth="0.75" />

            {/* Exposed Thermal Pad / Heat Slug */}
            <rect x="146" y="146" width="48" height="48" rx="2" className="fill-signal" />
            <g className="stroke-paper/20" strokeWidth="0.75">
              <line x1="146" y1="146" x2="194" y2="194" />
              <line x1="194" y1="146" x2="146" y2="194" />
            </g>

            {/* Laser Marking / Silkscreen on IC Package */}
            <g className="font-mono text-paper">
              <text x="146" y="218" fontSize="8" letterSpacing="0.8" className="fill-paper/50">STM32 / RISC-V ARCH</text>
              <text x="146" y="234" fontSize="12" fontWeight="600" letterSpacing="1.2" className="fill-paper">AD-27 / PM</text>
              <text x="146" y="249" fontSize="7.5" letterSpacing="1.2" className="fill-signal">MINES-EMSE × POLIMI</text>
              <text x="146" y="262" fontSize="6.5" letterSpacing="0.5" className="fill-paper/40">LOT: 2027-APR · HW/SW/PRD</text>
            </g>

            {/* Microelectronic Bus Tracks inside IC Package */}
            <g className="stroke-paper/10" strokeWidth="0.75">
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`sub-${i}`} x1={202 + i * 11} y1="146" x2={202 + i * 11} y2="200" />
              ))}
            </g>
          </g>
        </svg>
      </motion.div>

      {/* Caption bottom bar with safe vertical offset to prevent any overlapping */}
      <div className="pointer-events-none absolute -bottom-6 left-0 right-0 flex items-center justify-between px-1">
        <Label>{tr("fig. 01 — silicium → produit", "fig. 01 — silicon → product")}</Label>
        <span className="font-mono text-[10px] tracking-wider uppercase text-signal">
          {hot ? "clock ×2.4 (active)" : "32.768 khz (idle)"}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Scroll-scrubbed manifesto ---------------- */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const o = useTransform(progress, range, [0.12, 1]);
  const accent = children.startsWith("*");
  return (
    <motion.span style={{ opacity: o }} className={`mr-[0.25em] inline-block ${accent ? "text-signal italic" : ""}`}>
      {accent ? children.slice(1) : children}
    </motion.span>
  );
}

function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const { tr } = useLang();
  const text = tr("J'ai commencé par le *silicium : PCB, FPGA, ECU, bancs de test. Puis j'ai présidé une association, et compris que le plus dur n'est pas de construire la chose, mais de construire la *bonne chose. Aujourd'hui je relie l'ingénierie, le design et la stratégie pour concevoir des produits qui *comptent.", "I started with *silicon: PCBs, FPGAs, ECUs, test benches. Then I led a student association, and learned that the hardest part isn't building the thing, it's building the *right thing. Today I bridge engineering, design and strategy to build products that *matter.");
  const words = text.split(" ");
  return (
    <div ref={ref} className="text-[clamp(1.8rem,4.2vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.025em]">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
      ))}
    </div>
  );
}

/* ---------------- Collaborateurs ---------------- */
const PEOPLE: Record<string, string> = {
  "Yasmin Hadj-Said": "https://www.linkedin.com/in/yasmin-hadj-said",
  "Inès Lixi": "https://www.linkedin.com/in/in%C3%A8s-lixi-979654329",
  "Jade Diouri": "https://www.linkedin.com/in/jade-diouri-7a4688328",
  "Laure Rivier": "https://www.linkedin.com/in/laure-rivier-83060a328",
};
function Person({ name }: { name: string }) {
  const url = PEOPLE[name];
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink underline decoration-line underline-offset-4 transition-colors hover:text-signal hover:decoration-signal">
      {name}<LinkedInIcon className="size-3" />
    </a>
  ) : <span className="text-ink">{name}</span>;
}

/* ---------------- Surligneur : un aplat de couleur balaie le texte quand il entre à l'écran ---------------- */
function Hl({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      initial={{ backgroundSize: "0% 100%", color: "var(--color-ink)" }}
      whileInView={{ backgroundSize: "100% 100%", color: "var(--color-paper)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease, delay: 0.15 }}
      className={`bg-gradient-to-r from-signal to-signal bg-no-repeat px-[0.12em] [box-decoration-break:clone] ${className}`}
    >{children}</motion.span>
  );
}

/* ---------------- Stacked title: ta double écriture, qui glisse au scroll ---------------- */
function Stacked({ ghost, children, n, dark = false }: { ghost: string; children: React.ReactNode; n: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-16%"]);
  return (
    <div ref={ref} className="relative">
      <motion.div
        style={{ x }}
        aria-hidden
        className={`pointer-events-none font-serif text-[clamp(4.5rem,15vw,13rem)] leading-[0.8] whitespace-nowrap italic select-none ${dark ? "text-outline-paper opacity-30" : "text-outline opacity-25"}`}
      >
        {ghost}
      </motion.div>
      <div className="relative -mt-[0.32em] flex items-baseline gap-5 text-[clamp(2.4rem,6vw,5.2rem)] md:pl-2">
        <span className="font-mono text-[11px] tracking-[0.14em] text-signal">§{n}</span>
        <h2 className="leading-[0.95] font-semibold tracking-[-0.035em]">{children}</h2>
      </div>
    </div>
  );
}

/* ---------------- Detail sheet ---------------- */
type Detail = { kicker: string; title: string; meta?: string; logo?: string; lead?: string; points: string[]; tags?: string[]; img?: string[]; links?: { l: string; h: string }[]; with?: string };
function Sheet({ d, onClose }: { d: Detail | null; onClose: () => void }) {
  const { tr } = useLang();
  const closingRef = useRef(false);

  // Safe dismiss helper that handles history without double callback
  const dismiss = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (window.location.hash === "#detail") {
      window.history.back();
    }
    onClose();
  };

  // Support browser / mobile back gesture without resetting to site root
  useEffect(() => {
    if (!d) {
      closingRef.current = false;
      return;
    }
    closingRef.current = false;
    const currentHash = window.location.hash;
    const modalHash = "#detail";

    if (currentHash !== modalHash) {
      window.history.pushState({ modalOpen: true }, "", modalHash);
    }

    const onPopState = () => {
      closingRef.current = true;
      onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (window.location.hash === modalHash) {
        window.history.replaceState(null, "", currentHash || window.location.pathname);
      }
    };
  }, [d, onClose]);

  return (
    <AnimatePresence>
      {d && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={dismiss} />
          <motion.aside
            role="dialog" aria-modal aria-label={d.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            drag="x"
            dragConstraints={{ left: 0 }}
            dragElastic={{ left: 0, right: 0.8 }}
            onDragEnd={(_e, info) => {
              if (info.offset.x > 80 || info.velocity.x > 300) {
                dismiss();
              }
            }}
            className="relative h-full w-full max-w-2xl overflow-y-auto bg-paper touch-pan-y"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink bg-paper/90 px-6 py-4 backdrop-blur sm:px-8">
              <div className="flex items-center gap-3">
                {/* Mobile drag handle hint */}
                <span className="block h-5 w-1 rounded-full bg-ink/20 sm:hidden" />
                <Label>{d.kicker}</Label>
              </div>
              <button onClick={dismiss} className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase hover:text-signal">
                {tr("Fermer", "Close")} <kbd className="hidden sm:inline border border-line px-1.5 py-0.5 text-[9px]">ESC</kbd>
              </button>
            </div>
            <div className="px-8 py-12">
              {d.logo && <img src={d.logo} alt="" className="mb-8 size-14 rounded-lg bg-white object-contain p-2 ring-1 ring-line" />}
              <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6, ease }} className="text-4xl leading-[1] font-semibold tracking-[-0.035em] md:text-5xl">{d.title}</motion.h2>
              {d.meta && <p className="mt-4 font-mono text-[11px] tracking-wider text-mute uppercase">{d.meta}</p>}
              {d.lead && <p className="mt-8 text-xl leading-snug">{d.lead}</p>}
              {d.img && d.img.length > 0 && (
                <div className="mt-10 grid gap-2">
                  {d.img.map((src) => <img key={src} src={src} alt="" className="w-full border border-line object-cover" />)}
                </div>
              )}
              <div className="mt-10 border-t border-ink pt-6">
                <Label>{tr("Ce que j'ai fait", "What I did")}</Label>
                <ul className="mt-5 space-y-4">
                  {d.points.map((p, i) => (
                    <motion.li key={p} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className="grid grid-cols-[32px_1fr] text-[17px] leading-relaxed">
                      <span className="pt-1 font-mono text-[11px] text-signal">{String(i + 1).padStart(2, "0")}</span>{p}
                    </motion.li>
                  ))}
                </ul>
              </div>
              {d.tags && d.tags.length > 0 && (
                <div className="mt-10 border-t border-line pt-6">
                  <Label>{tr("Stack & compétences", "Stack & skills")}</Label>
                  <div className="mt-4 flex flex-wrap gap-1.5">{d.tags.map((t) => <span key={t} className="border border-ink/20 px-2 py-1 font-mono text-[11px]">{t}</span>)}</div>
                </div>
              )}
              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                {d.with && <span className="mr-auto text-sm text-mute">{tr("En binôme avec", "Teamed with")} <Person name={d.with} /></span>}
                {d.links?.map((l) => (
                  <a key={l.h} href={l.h} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-signal">{l.l} <ArrowUpRight className="size-4" /></a>
                ))}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tr } = useLang();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setFormData({ name: "", email: "", message: "" });
      return;
    }
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "87fde94b-7057-4663-9e22-63385526c25a",
          subject: "Nouveau message direct depuis le portfolio (V3) !",
          from_name: "Arthur Doradoux - Portfolio V3",
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg rounded-2xl border border-ink bg-paper p-7 shadow-2xl md:p-9"
          >
            <div className="flex items-center justify-between border-b border-ink/15 pb-4">
              <Label>{tr("Envoyer un email", "Send an email")}</Label>
              <button onClick={onClose} className="font-mono text-[11px] uppercase tracking-wider text-mute hover:text-signal">
                {tr("Fermer", "Close")} ✕
              </button>
            </div>

            {status === "success" ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-signal text-white">
                  <Check className="size-6" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{tr("Message envoyé !", "Message sent!")}</h3>
                <p className="mt-2 text-sm text-mute">
                  {tr("Merci ! Je vous réponds au plus vite sur votre adresse email.", "Thank you! I will reply to your email address as soon as possible.")}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal"
                >
                  {tr("Fermer", "Close")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/70">
                    {tr("Votre nom", "Your name")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={tr("Arthur Dupont", "John Doe")}
                    className="mt-1.5 w-full rounded-lg border border-ink/20 bg-white/70 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/70">
                    {tr("Votre adresse email", "Your email address")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nom@entreprise.com"
                    className="mt-1.5 w-full rounded-lg border border-ink/20 bg-white/70 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/70">
                    {tr("Message", "Message")} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={tr("Bonjour Arthur, nous serions ravis d'échanger à propos d'une opportunité...", "Hello Arthur, we would love to connect regarding an opportunity...")}
                    className="mt-1.5 w-full resize-none rounded-lg border border-ink/20 bg-white/70 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:bg-white"
                  />
                </div>

                {status === "error" && (
                  <p className="font-mono text-xs text-signal">
                    {tr("Une erreur est survenue lors de l'envoi. Veuillez utiliser contact@arthurdx.com.", "An error occurred while sending. Please use contact@arthurdx.com directly.")}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-[10px] text-mute">Web3Forms · direct inbox</span>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-signal disabled:opacity-60"
                  >
                    {status === "sending" ? tr("Envoi...", "Sending...") : tr("Envoyer", "Send")}
                    <Send className="size-3.5" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CAT_EN: Record<Cat, string> = { Hardware: "Hardware", Software: "Software", IA: "AI", Produit: "Product" };
const catLabel = (c: Cat | "Tous", lang: Lang) => (lang === "en" ? (c === "Tous" ? "All" : CAT_EN[c]) : c);
const projectDetail = (p: ProjectBase, lang: Lang): Detail => ({
  kicker: `${lang === "en" ? "Project" : "Projet"} · ${p.cat.map((c) => catLabel(c, lang)).join(" / ")}`, title: p.t, meta: p.d, lead: p.desc, points: p.points ?? [], tags: p.tags, img: p.img, with: p.with,
  links: p.link ? [{ l: p.link.endsWith(".pdf") ? (lang === "en" ? "PDF presentation" : "Présentation PDF") : (lang === "en" ? "View code" : "Voir le code"), h: p.link }] : undefined,
});
const engDetail = (e: EngBase, lang: Lang): Detail => ({
  kicker: `${lang === "en" ? "Involvement" : "Engagement"} · ${e.org}`, title: e.role, meta: `${e.org} · ${e.date}`, logo: e.logo, points: e.desc, tags: e.tags, img: e.img, with: e.with,
  links: e.site ? [{ l: lang === "en" ? "Official website" : "Site officiel", h: e.site }] : undefined,
});

const FEATURED_PROJECT_TITLES = [
  "FPGA — ECG & communication sécurisée",
  "Terrariot — IoT qualité de l'air",
  "Ventilateur à capteur capacitif",
  "Robot autonome STM32",
];

/* ---------------- Projects ---------------- */
const FILTERS: ("Tous" | Cat)[] = ["Tous", "Hardware", "Software", "IA", "Produit"];
function Projects() {
  const [f, setF] = useState<(typeof FILTERS)[number]>("Tous");
  const [open, setOpen] = useState<number | null>(null);
  const [expandedMobile, setExpandedMobile] = useState(false);
  const { lang, tr } = useLang();
  const all = useMemo(() => PROJECTS.map((p) => loc(p, lang)), [lang]);
  const list = all.filter((p) => f === "Tous" || p.cat.includes(f));
  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-1 border-b border-ink pb-4">
        {FILTERS.map((x) => {
          const count = x === "Tous" ? PROJECTS.length : PROJECTS.filter((p) => p.cat.includes(x)).length;
          return (
            <button key={x} onClick={() => { setF(x); setExpandedMobile(true); }} className="relative px-4 py-2 text-sm font-medium">
              {f === x && <motion.span layoutId="filter" className="absolute inset-0 bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className={`relative transition-colors ${f === x ? "text-paper" : ""}`}>{catLabel(x, lang)} <sup className="font-mono text-[9px] opacity-60">{count}</sup></span>
            </button>
          );
        })}
      </div>
      <motion.div layout className="grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => {
            const origTitle = PROJECTS[all.indexOf(p)].t;
            const isFeatured = FEATURED_PROJECT_TITLES.includes(origTitle);
            const hiddenOnMobile = f === "Tous" && !expandedMobile && !isFeatured;
            return (
              <motion.article
                layout key={origTitle}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease }}
                onClick={() => setOpen(all.indexOf(p))} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(all.indexOf(p))}
                className={`${hiddenOnMobile ? "hidden sm:flex" : "flex"} group relative min-h-[220px] cursor-pointer flex-col bg-paper p-7 transition-colors duration-500 hover:bg-ink hover:text-paper`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] text-mute group-hover:text-paper/50">{p.d}</span>
                  <div className="flex items-center gap-2">
                    {isFeatured && f === "Tous" && !expandedMobile && <span className="font-mono text-[9px] uppercase tracking-wider text-signal bg-signal/10 px-1.5 py-0.5 border border-signal/20 sm:hidden">Phare</span>}
                    {p.current && <span className="flex items-center gap-1.5 font-mono text-[10px] text-signal uppercase"><span className="size-1.5 animate-pulse rounded-full bg-signal" />Live</span>}
                  </div>
                </div>
                <h3 className="mt-8 text-xl leading-tight font-semibold tracking-tight">{p.t}</h3>
                <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-mute group-hover:text-paper/70">{p.desc}</p>
                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 3).map((t) => <span key={t} className="border border-current/20 px-1.5 py-0.5 font-mono text-[10px] uppercase opacity-70">{t}</span>)}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-mute group-hover:text-paper/50">{p.with ? `${tr("avec", "with")} ${p.with}` : "Solo"}</span>
                    <span className="flex items-center gap-1 font-medium text-signal">
                      {p.img ? tr("Cliquer · photos & détails", "Click · photos & details") : tr("Cliquer pour le détail", "Click for details")} <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45" />
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {f === "Tous" && (
        <div className="mt-6 flex justify-center sm:hidden">
          <button
            onClick={() => setExpandedMobile((e) => !e)}
            className="flex items-center gap-2 rounded-full border border-ink bg-paper px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink shadow-sm transition-colors hover:bg-ink hover:text-paper"
          >
            {expandedMobile
              ? tr("Réduire à la sélection phare ↑", "Collapse to featured projects ↑")
              : tr(`Voir tous les projets (${list.length}) ↓`, `View all projects (${list.length}) ↓`)}
          </button>
        </div>
      )}
      <Sheet d={open !== null ? projectDetail(all[open], lang) : null} onClose={() => setOpen(null)} />
    </>
  );
}

/* ---------------- Engagements ---------------- */
function Engagements({ onMinitel }: { onMinitel: () => void }) {
  const [open, setOpen] = useState<Eng | null>(null);
  const [expandedMobile, setExpandedMobile] = useState(false);
  const { lang, tr } = useLang();
  const featured = useMemo(() => FEATURED.map((e) => loc(e, lang)), [lang]);
  return (
    <>
      <div className="grid gap-px bg-ink lg:grid-cols-2">
        {featured.map((e, i) => (
          <Reveal key={e.logo} delay={i * 0.1} className="bg-paper">
            <article onClick={() => setOpen(FEATURED[i])} className="group flex h-full cursor-pointer flex-col p-8 transition-colors hover:bg-white/50 md:p-10">
              <div className="flex items-center gap-4">
                <img
                  src={e.logo} alt={e.org}
                  onClick={(ev) => { if (e.action === "minitel") { ev.stopPropagation(); onMinitel(); } }}
                  title={e.action === "minitel" ? "3615…" : undefined}
                  className="size-12 rounded-lg bg-white object-contain p-1.5 ring-1 ring-line transition-transform hover:scale-110"
                />
                <div>
                  <Label>{e.org} · {e.date}</Label>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{e.role}</h3>
                </div>
              </div>
              <div className="mt-10 flex gap-10">
                {e.stats.map(([v, l]) => (
                  <div key={l}>
                    <div className="text-4xl font-semibold tracking-tight text-signal md:text-5xl">{v}</div>
                    <Label className="mt-1 block">{l}</Label>
                  </div>
                ))}
              </div>
              <ul className="mt-8 space-y-2.5">
                {e.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2.5 h-px w-3 shrink-0 bg-signal" />{p}</li>)}
              </ul>
              <span className="mt-auto flex items-center gap-1 pt-8 text-sm font-medium">{tr("Lire en détail", "Read more")} <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" /></span>
            </article>
          </Reveal>
        ))}
      </div>
      <div className={`${expandedMobile ? "grid" : "hidden sm:grid"} mt-px gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4`}>
        {OTHERS.map((raw, i) => { const o = loc(raw, lang); return (
          <Reveal key={raw.role} delay={i * 0.04} className="bg-paper">
            <button onClick={() => setOpen(raw)} className="group flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-ink hover:text-paper">
              <img src={o.logo} alt={o.org} className="size-9 rounded-md object-contain grayscale transition group-hover:grayscale-0 group-hover:scale-105" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{o.role}</p>
                <p className="truncate font-mono text-[10px] text-mute uppercase group-hover:text-paper/50">{o.org} · {o.date}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 opacity-0 transition group-hover:opacity-100" />
            </button>
          </Reveal>
        ); })}
      </div>
      <div className="mt-6 flex justify-center sm:hidden">
        <button
          onClick={() => setExpandedMobile((e) => !e)}
          className="flex items-center gap-2 rounded-full border border-ink bg-paper px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink shadow-sm transition-colors hover:bg-ink hover:text-paper"
        >
          {expandedMobile
            ? tr("Réduire les engagements ↑", "Collapse involvements ↑")
            : tr(`Voir les autres rôles (${OTHERS.length}) ↓`, `View other roles (${OTHERS.length}) ↓`)}
        </button>
      </div>
      <Sheet d={open && engDetail(loc(open, lang), lang)} onClose={() => setOpen(null)} />
    </>
  );
}

/* ---------------- Command palette (glass) ---------------- */
function Palette({ open, onClose, onGame }: { open: boolean; onClose: () => void; onGame: (g: Game) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const { lang, tr } = useLang();
  const actions = [
    ...NAV.map((n) => ({ label: `${tr("Aller à", "Go to")} ${loc(n, lang).label}`, hint: "Navigation", run: () => document.getElementById(n.id)?.scrollIntoView() })),
    { label: tr("Copier l'email", "Copy email"), hint: "contact@arthurdx.com", run: () => navigator.clipboard.writeText("contact@arthurdx.com") },
    { label: tr("Ouvrir LinkedIn", "Open LinkedIn"), hint: tr("Externe", "External"), run: () => window.open("https://linkedin.com/in/arthur-doradoux") },
    { label: tr("Voir le CV", "View resume"), hint: "PDF", run: () => window.dispatchEvent(new Event("open-cv")) },
    { label: tr("Ouvrir GitHub", "Open GitHub"), hint: tr("Externe", "External"), run: () => window.open("https://github.com/Arthrir") },
    { label: "3615 MINITEL", hint: tr("Jeux", "Games"), run: () => onGame("minitel") },
    { label: "Grand Prix F1", hint: tr("Jeux", "Games"), run: () => onGame("f1") },
    { label: "Aim Lab — Team Vitality", hint: tr("Jeux", "Games"), run: () => onGame("aim") },
    { label: tr("Blackjack — modèle TIPE", "Blackjack — TIPE model"), hint: tr("Jeux", "Games"), run: () => onGame("blackjack") },
  ];
  const list = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { if (!open) setQ(""); }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 px-4 pt-[18vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -12, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="glass w-full max-w-lg overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3.5">
              <Search className="size-4 text-mute" />
              <input
                autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Tapez une commande…", "Type a command…")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
                  if (e.key === "Enter" && list[sel]) { list[sel].run(); onClose(); }
                }}
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute"
              />
              <kbd className="font-mono text-[10px] text-mute">ESC</kbd>
            </div>
            <ul className="max-h-72 overflow-auto p-1.5">
              {list.map((a, i) => (
                <li key={a.label}>
                  <button onMouseEnter={() => setSel(i)} onClick={() => { a.run(); onClose(); }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${sel === i ? "bg-ink text-paper" : ""}`}>
                    <span>{a.label}</span>
                    <span className={`flex items-center gap-2 font-mono text-[10px] ${sel === i ? "text-paper/60" : "text-mute"}`}>
                      {a.hint}{sel === i && <CornerDownLeft className="size-3" />}
                    </span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-mute">{tr("Aucun résultat", "No results")}</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Rail latéral : une mini F1 descend la piste au fil du scroll ---------------- */
function Rail() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const top = useTransform(p, (v) => `${v * 100}%`);
  const { lang } = useLang();
  const [marks, setMarks] = useState<{ id: string; at: number }[]>([]);
  useEffect(() => {
    const calc = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      setMarks(NAV.flatMap((n) => { const el = document.getElementById(n.id); return el ? [{ id: n.id, at: Math.min(1, (el.offsetTop - innerHeight * 0.3) / h) }] : []; }));
    };
    calc();
    const t = setTimeout(calc, 1500);
    addEventListener("resize", calc);
    return () => { clearTimeout(t); removeEventListener("resize", calc); };
  }, []);
  // la piste remplace la barre de défilement : clic ou glisser la F1 pour se déplacer
  const track = useRef<HTMLDivElement>(null);
  const seek = (y: number) => {
    const b = track.current!.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (y - b.top) / b.height));
    scrollTo({ top: v * (document.documentElement.scrollHeight - innerHeight) });
  };
  const down = (e: React.PointerEvent) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); seek(e.clientY); };
  const move = (e: React.PointerEvent) => { if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) seek(e.clientY); };
  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+12px)] right-0 bottom-3 z-40 hidden w-8 md:block">
      <div ref={track} onPointerDown={down} onPointerMove={move} className="group/rail relative mx-auto h-full w-6 cursor-grab touch-none active:cursor-grabbing">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/15" />
        <motion.div style={{ scaleY: p }} className="absolute inset-y-0 left-1/2 w-px origin-top -translate-x-1/2 bg-signal" />
        {marks.map((mk) => { const m = { ...mk, label: loc(NAV.find((n) => n.id === mk.id)!, lang).label }; return (
          <button key={m.id} onPointerDown={(e) => e.stopPropagation()} onClick={() => document.getElementById(m.id)?.scrollIntoView({ behavior: "smooth" })} aria-label={m.label} style={{ top: `${m.at * 100}%` }} className="group absolute left-1/2 block size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/40 bg-paper transition-colors hover:border-signal">
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 bg-paper/90 px-1 font-mono text-[10px] tracking-[0.12em] whitespace-nowrap text-ink uppercase opacity-0 transition-opacity group-hover:opacity-100 group-hover/rail:opacity-60">{m.label}</span>
          </button>
        ); })}
        <motion.div style={{ top }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform group-active/rail:scale-125">
          <svg width="12" height="26" viewBox="0 0 12 26" className="drop-shadow-sm">
            {/* Aileron arrière (en haut) */}
            <rect x="0" y="1" width="12" height="3" rx="0.8" className="fill-ink" />
            {/* Roues arrière */}
            <rect x="0" y="5" width="2.5" height="5" rx="1" className="fill-ink" />
            <rect x="9.5" y="5" width="2.5" height="5" rx="1" className="fill-ink" />
            {/* Roues avant */}
            <rect x="0" y="15" width="2.5" height="5" rx="1" className="fill-ink" />
            <rect x="9.5" y="15" width="2.5" height="5" rx="1" className="fill-ink" />
            {/* Châssis orange orienté vers le bas (nez à y=24) */}
            <path d="M6 3 L8.5 6 L8 19 L6 24 L4 19 L3.5 6 Z" className="fill-signal" />
            {/* Aileron avant (en bas) */}
            <rect x="0" y="22" width="12" height="3" rx="0.8" className="fill-ink" />
            {/* Cockpit / Halo */}
            <ellipse cx="6" cy="13" rx="1.6" ry="2.6" className="fill-ink" />
            {/* Casque jaune du pilote */}
            <circle cx="6" cy="13" r="1.3" fill="#FACC15" />
            {/* Visière orientée vers l'avant (vers le bas) */}
            <path d="M5.1 13.6 H6.9" stroke="#0A0A0A" strokeWidth="0.6" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- Nav (isolée : changer de section ne re-rend pas toute la page) ---------------- */
function Nav({ onLogo, onPalette }: { onLogo: (e: React.MouseEvent) => void; onPalette: () => void }) {
  const [section, setSection] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  const { lang, tr } = useLang();
  const nav = useMemo(() => NAV.map((n) => loc(n, lang)), [lang]);
  useEffect(() => { if (pick && pick === section) setPick(null); }, [section, pick]);
  // Glisser le doigt / la souris sur la barre : la lentille suit et grossit, on relâche pour y aller
  const tabAt = (x: number) => {
    const els = [...(tabs.current?.querySelectorAll<HTMLElement>("[data-tab]") ?? [])];
    return els.find((el) => { const b = el.getBoundingClientRect(); return x >= b.left && x <= b.right; })?.dataset.tab;
  };
  const dragStart = useRef<{ x: number; moved: boolean } | null>(null);
  const onTabsDown = (e: React.PointerEvent) => { dragStart.current = { x: e.clientX, moved: false }; };
  const onTabsMove = (e: React.PointerEvent) => {
    const d = dragStart.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.x) > 6) { d.moved = true; setDragging(true); tabs.current?.setPointerCapture(e.pointerId); }
    if (d.moved) { const id = tabAt(e.clientX); if (id) setPick(id); }
  };
  const onTabsUp = (e: React.PointerEvent) => {
    const d = dragStart.current; dragStart.current = null;
    if (!d?.moved) return;
    setDragging(false);
    const id = tabAt(e.clientX);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && setSection(en.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <>
      {/* Navigation principale et bulle sélecteur de langue détachée */}
      <div className="fixed top-3 left-4 right-4 z-40 flex items-center justify-between md:top-[calc(env(safe-area-inset-top)+16px)] md:left-1/2 md:right-auto md:-translate-x-1/2 md:gap-3">
        <motion.nav
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="liquid relative flex items-center gap-1 rounded-full p-1.5"
        >
          <a href="#top" onClick={onLogo} aria-label={tr("Accueil", "Home")} className="mr-1 ml-1.5 grid h-8 w-10 place-items-center rounded-full text-ink transition-colors hover:text-signal">
            <Logo className="h-[18px] w-auto" />
          </a>
          <div ref={tabs} className="hidden touch-none items-center select-none md:flex" onPointerDown={onTabsDown} onPointerMove={onTabsMove} onPointerUp={onTabsUp} onPointerCancel={onTabsUp}>
            {nav.map((n) => {
              const lit = (pick ?? section) === n.id;
              return (
                <a key={n.id} data-tab={n.id} href={`#${n.id}`} draggable={false} onClick={(e) => { if (dragging) e.preventDefault(); setPick(n.id); }} className="relative px-3.5 py-1.5 text-[13px] font-medium">
                  {lit && (
                    <motion.span
                      layoutId="lens"
                      className="lens absolute inset-0 rounded-full"
                      animate={{ scale: dragging ? 1.28 : 1 }}
                      transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.7 }}
                    >
                      <motion.span key={n.id} className="block size-full rounded-full" initial={{ scaleX: 1.18, scaleY: 0.82 }} animate={{ scaleX: 1, scaleY: 1 }} transition={{ type: "spring", stiffness: 300, damping: 12 }} />
                    </motion.span>
                  )}
                  <span className={`relative inline-block transition-all duration-200 ${lit ? "text-ink" : "text-ink/70"} ${lit && dragging ? "scale-110" : ""}`}>{n.label}</span>
                </a>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => window.dispatchEvent(new Event("open-cv"))}
              className="flex h-8 items-center rounded-full bg-ink px-3 font-mono text-[11px] font-semibold text-paper transition-colors hover:bg-signal active:scale-95"
            >
              CV
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              aria-label="Menu"
              aria-expanded={menu}
              className="flex h-8 items-center gap-1.5 rounded-full bg-ink/5 px-2.5 text-[12px] font-semibold text-ink transition-colors hover:bg-ink/10 active:scale-95"
            >
              <span className="max-w-[70px] truncate">{nav.find((n) => n.id === section)?.label ?? "Menu"}</span>
              <span className="flex w-3 flex-col gap-[3px]">
                <span className={`h-px bg-ink transition-transform duration-200 ${menu ? "translate-y-[2px] rotate-45" : ""}`} />
                <span className={`h-px bg-ink transition-transform duration-200 ${menu ? "-translate-y-[2px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
          <button onClick={() => window.dispatchEvent(new Event("open-cv"))} className="hidden rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-paper transition-colors hover:bg-signal md:block">CV</button>
          <AnimatePresence>
            {menu && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.25, ease }}
                className="absolute top-full left-0 right-0 mt-3 flex flex-col rounded-2xl p-2 bg-paper/98 border border-ink/20 shadow-2xl backdrop-blur-2xl md:hidden">
                {nav.map((n, i) => (
                  <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)} className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${section === n.id ? "bg-ink text-paper" : "text-ink hover:bg-ink/5"}`}>
                    {n.label}<span className="font-mono text-[10px] opacity-50">0{i + 2}</span>
                  </a>
                ))}
                <div className="mt-1 border-t border-ink/10 pt-2 px-1">
                  <button
                    onClick={() => { setMenu(false); window.dispatchEvent(new Event("open-cv")); }}
                    className="flex w-full items-center justify-between rounded-xl bg-ink/10 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-signal hover:text-white"
                  >
                    <span>{tr("Consulter mon CV", "View my resume")}</span>
                    <Download className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Bulle sélecteur de langue détachée (mini-barre indépendante) */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
          className="liquid rounded-full p-1.5"
        >
          <LangToggle />
        </motion.div>
      </div>
    </>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  return <LangProvider><Page /></LangProvider>;
}

function Page() {
  const { lang, tr } = useLang();
  const [palette, setPalette] = useState(false);
  const [copied, setCopied] = useState(false);
  const [legal, setLegal] = useState(() => location.hash === "#mentions-legales");
  useEffect(() => {
    const h = () => setLegal(location.hash === "#mentions-legales");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => { document.body.style.overflow = legal ? "hidden" : ""; }, [legal]);
  const [game, setGame] = useState<Game | null>(null);
  const [contactModal, setContactModal] = useState(false);
  const [viaMinitel, setViaMinitel] = useState(false);
  const [cv, setCv] = useState(false);
  useEffect(() => { const o = () => setCv(true); addEventListener("open-cv", o); return () => removeEventListener("open-cv", o); }, []);
  // un jeu lancé depuis le 3615 ramène au Minitel quand on le quitte
  const closeGame = () => { if (viaMinitel && game !== "minitel") setGame("minitel"); else { setGame(null); setViaMinitel(false); } };
  const taps = useRef({ n: 0, t: 0 as ReturnType<typeof setTimeout> | 0 });


  // Easter eggs : Konami → Aim Lab ; taper "minitel", "monza", "vitality", "blackjack"
  useEffect(() => {
    const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let keys: string[] = [], buf = "";
    const words: Record<string, Game> = { minitel: "minitel", "3615": "minitel", monza: "f1", vitality: "aim", blackjack: "blackjack" };
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      keys = [...keys, e.key].slice(-konami.length);
      if (keys.join() === konami.join()) setGame("aim");
      if (e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-12);
        const hit = Object.keys(words).find((w) => buf.endsWith(w));
        if (hit) { setGame(words[hit]); buf = ""; }
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  // Mobile : taps rapides sur le logo — 3 = F1, 5 = Aim Lab, 7 = Blackjack
  const tapLogo = (e: React.MouseEvent) => {
    const r = taps.current;
    r.n++;
    if (r.n > 1) e.preventDefault();
    if (r.t) clearTimeout(r.t);
    r.t = setTimeout(() => {
      if (r.n >= 7) setGame("blackjack"); else if (r.n >= 5) setGame("aim"); else if (r.n >= 3) setGame("f1");
      r.n = 0;
    }, 450);
  };
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroP, [0, 1], [0, 120]);
  const heroO = useTransform(heroP, [0, 0.8], [1, 0]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const copy = () => { navigator.clipboard.writeText("contact@arthurdx.com"); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatePresence>{cv && <CvViewer onClose={() => setCv(false)} />}</AnimatePresence>
      <AnimatePresence>{legal && <Legal onClose={() => { history.replaceState(null, "", " "); setLegal(false); }} />}</AnimatePresence>
      <motion.div style={{ scaleX: bar }} className="fixed top-0 right-0 left-0 z-50 h-[2px] origin-left bg-signal md:hidden" />
      <Rail />

      {/* Filtre de réfraction pour la lentille liquid glass */}
      <svg className="absolute size-0" aria-hidden>
        <filter id="lg-refract" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="7" result="n" />
          <feGaussianBlur in="n" stdDeviation="2" result="nb" />
          <feDisplacementMap in="SourceGraphic" in2="nb" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Bords réfractants façon Apple : carte de déplacement neutre au centre, qui tord les bords */}
        <filter id="lg-nav" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2050%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22r%22%20x1%3D%220%22%20x2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23f00%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23000%22/%3E%3C/linearGradient%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20x2%3D%220%22%20y1%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%230f0%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23000%22/%3E%3C/linearGradient%3E%3Cfilter%20id%3D%22b%22%3E%3CfeGaussianBlur%20stdDeviation%3D%225%22/%3E%3C/filter%3E%3C/defs%3E%3Crect%20width%3D%22200%22%20height%3D%2250%22%20fill%3D%22%23000%22/%3E%3Crect%20width%3D%22200%22%20height%3D%2250%22%20fill%3D%22url%28%23r%29%22/%3E%3Crect%20width%3D%22200%22%20height%3D%2250%22%20fill%3D%22url%28%23g%29%22%20style%3D%22mix-blend-mode%3Ascreen%22/%3E%3Crect%20x%3D%2214%22%20y%3D%2210%22%20width%3D%22172%22%20height%3D%2230%22%20rx%3D%2215%22%20fill%3D%22%23808000%22%20filter%3D%22url%28%23b%29%22/%3E%3C/svg%3E" preserveAspectRatio="none" x="0" y="0" width="100%" height="100%" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="-46" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.4" />
        </filter>
      </svg>

      <Nav onLogo={tapLogo} onPalette={() => setPalette(true)} />

      {/* HERO */}
      <header id="top" ref={heroRef} className="relative mx-auto grid min-h-[100svh] max-w-[1400px] items-center gap-12 px-6 pt-[calc(env(safe-area-inset-top)+84px)] pb-20 md:px-10 md:pt-28 md:pb-16 lg:grid-cols-[1.25fr_1fr]">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_45%,black,transparent_70%)]" />
        <motion.div style={{ y: heroY, opacity: heroO }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase">
              <span className="relative flex size-2 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              </span>
              <span className="text-ink font-medium">{tr("Disponible — avril 2027", "Available — April 2027")}</span>
            </span>
            <Label>Mines Saint-Étienne × Politecnico di Milano</Label>
          </motion.div>
          <h1 className="text-[clamp(3.4rem,10vw,9.5rem)] leading-[0.86] font-semibold tracking-[-0.05em]">
            {["Arthur", "Doradoux"].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.1 }}>
                  {w}{i === 1 && <span className="text-signal">.</span>}
                </motion.span>
              </span>
            ))}
          </h1>
          <Reveal delay={0.6} className="mt-8 max-w-xl">
            <p className="text-lg md:text-xl leading-relaxed text-ink/90 font-medium">
              {tr(
                "Élève-ingénieur en microélectronique et conception produit (Mines Saint-Étienne × Politecnico di Milano). À la recherche d'un stage de fin d'études de 5+ mois à partir d'avril 2027.",
                "Engineering student in microelectronics and product design (Mines Saint-Étienne × Politecnico di Milano). Seeking a 5+ month end-of-studies internship starting April 2027."
              )}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[15px] leading-normal text-ink/80">
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute">{tr("Rôles visés :", "Target roles:")}</span>
              <span className="font-semibold text-ink">Product Owner / Product Manager</span>
              <span className="text-mute/40">·</span>
              <span className="font-medium text-ink/85">{tr("Prototypage, Test & Innovation Produit", "Prototyping, Testing & Product Innovation")}</span>
            </div>
          </Reveal>
          <Reveal delay={0.75} className="mt-10 flex flex-wrap gap-3">
            <a href="#roadmap" className="group flex items-center gap-2 bg-ink px-5 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-signal">
              {tr("Voir mon parcours", "See my journey")} <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </a>
            <button onClick={() => setCv(true)} className="flex items-center gap-2 border border-ink px-5 py-3.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"><Download className="size-4" />{tr("Mon CV", "My resume")}</button>
          </Reveal>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease, delay: 0.3 }} className="relative mx-auto mt-6 w-full max-w-[360px] sm:max-w-[420px] md:mt-0 md:max-w-[460px]">
          <Die />
          <motion.figure
            initial={{ opacity: 0, y: 30, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: -4 }} transition={{ duration: 1.2, ease, delay: 0.9 }}
            whileHover={{ rotate: 0, scale: 1.04 }}
            className="group absolute -top-10 left-0 w-24 bg-paper p-1.5 shadow-[0_20px_40px_-15px_rgba(18,18,17,.4)] ring-1 ring-ink/10 sm:w-28 sm:-top-8 sm:-left-2 md:-top-10 md:-left-16 md:w-36"
          >
            <img src="/assets/arthur.jpeg" alt="Arthur Doradoux" className="aspect-[4/5] w-full object-cover" />
            <figcaption className="flex justify-between px-0.5 pt-1.5 font-mono text-[9px] text-mute uppercase"><span>fig. 02</span><span>A. Doradoux</span></figcaption>
          </motion.figure>
        </motion.div>
      </header>

      {/* KPI strip */}
      <section className="border-y border-ink">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
          {(lang === "en" ? [["15", "technical projects"], ["02", "industry internships"], ["10", "student roles"], ["03", "countries: FR · DE · IT"]] : [["15", "projets techniques"], ["02", "stages industriels"], ["10", "engagements étudiants"], ["03", "pays : FR · DE · IT"]]).map(([n, l], i) => (
            <Reveal key={i} delay={i * 0.08} className={`px-6 py-8 md:px-10 ${i > 0 ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""} border-ink`}>
              <div className="text-5xl font-semibold tracking-tight">{n}</div>
              <Label className="mt-2 block">{l}</Label>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VISION */}
      <section id="vision" className="mx-auto max-w-[1400px] px-6 py-32 md:px-10 md:py-44">
        <div className="grid gap-10 md:grid-cols-[200px_1fr]">
          <Label>§01 — Vision</Label>
          <Manifesto />
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" style={{ "--color-signal": "#2340F0" } as React.CSSProperties} className="mx-auto max-w-[1400px] px-6 pb-32 md:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Stacked ghost={tr("Parcours", "Journey")} n="02">{tr("Ma roadmap.", "My roadmap.")}</Stacked>
          <p className="max-w-sm text-mute">{tr("Un PM pense en jalons. Voici les miens — survolez un composant pour l'ouvrir.", "A PM thinks in milestones. Here are mine — hover over a component to open it.")}</p>
        </div>
        <Circuit onMinitel={() => setGame("minitel")} />

        {/* ÉCOLES & FORMATION */}
        <div className="mt-24 border-t border-ink pt-14">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Label>{tr("§02.b — Académique", "§02.b — Academics")}</Label>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{tr("Formation & Écoles.", "Education & Schools.")}</h3>
            </div>
            <p className="max-w-md text-sm text-mute">
              {tr("Une triple culture : la rigueur scientifique des prépas, la profondeur microélectronique & logicielle des Mines, et le design / ergonomie du Polimi.", "A triple foundation: scientific rigor from preparatory classes, microelectronics & software depth from Mines, and design / ergonomics from Polimi.")}
            </p>
          </div>
          <div className="grid gap-px border border-ink bg-ink md:grid-cols-2">
            {SCHOOLS.map((raw) => loc(raw, lang)).map((s, i) => (
              <Reveal key={s.name} delay={i * 0.08} className="bg-paper p-8 flex flex-col justify-between transition-colors hover:bg-white/40">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <img src={s.logo} alt={s.name} className="size-12 rounded-lg bg-white object-contain p-1.5 ring-1 ring-line" />
                    {s.badge && <span className="font-mono text-[10px] tracking-wider uppercase bg-ink/5 px-2 py-1 text-mute border border-ink/10">{s.badge}</span>}
                  </div>
                  <h4 className="mt-6 text-2xl font-semibold tracking-tight">{s.name}</h4>
                  <p className="mt-1 text-sm font-medium text-signal">{s.degree}</p>
                  <p className="mt-1 font-mono text-[11px] tracking-wider text-mute uppercase">{s.place} · {s.date}</p>
                  {s.formation && (
                    <div className="mt-4">
                      <span className="font-mono text-[10px] tracking-wider text-mute uppercase block">{tr("Formation :", "Major:")}</span>
                      <p className="mt-0.5 text-sm font-semibold text-ink">{s.formation}</p>
                    </div>
                  )}

                  {s.troncCommun && s.troncCommun.length > 0 && (
                    <div className="mt-4 border-t border-line/60 pt-3">
                      <span className="font-mono text-[10px] tracking-wider text-mute uppercase block mb-1.5">{tr("Tronc commun :", "Core curriculum:")}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {s.troncCommun.map((tc) => <span key={tc} className="border border-ink/20 bg-paper px-2 py-0.5 font-mono text-[10px] uppercase text-ink/80">{tc}</span>)}
                      </div>
                    </div>
                  )}

                  {s.electifs && s.electifs.length > 0 && (
                    <div className="mt-3">
                      <span className="font-mono text-[10px] tracking-wider text-mute uppercase block mb-1.5">{tr("Électifs :", "Electives:")}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {s.electifs.map((el) => <span key={el} className="border border-signal/30 bg-signal/5 px-2 py-0.5 font-mono text-[10px] uppercase text-signal">{el}</span>)}
                      </div>
                    </div>
                  )}

                  {s.courses && s.courses.length > 0 && (
                    <div className="mt-5 border-t border-line/60 pt-3">
                      <span className="font-mono text-[10px] tracking-wider text-mute uppercase block mb-1.5">{tr("Cours & spécialités :", "Courses & key subjects:")}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {s.courses.map((c) => <span key={c} className="border border-ink/20 bg-paper px-2 py-0.5 font-mono text-[10px] uppercase text-ink/80">{c}</span>)}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t border-line/60 pt-3">
                    <span className="font-mono text-[10px] tracking-wider text-mute uppercase block mb-1">{tr("Enjeu / Objectif :", "Goal & Takeaways:")}</span>
                    <p className="text-[14px] leading-relaxed text-ink/80">{s.goal}</p>
                  </div>
                </div>
                {s.link && (
                  <div className="mt-6 pt-4 border-t border-line/40">
                    <a href={s.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-signal">
                      {tr("Site officiel", "Official website")} <ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section id="experiences" style={{ "--color-signal": "#FF4D00" } as React.CSSProperties} className="overflow-hidden bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-6 py-28 md:px-10">
          <Stacked ghost={tr("Industrie", "Industry")} n="03" dark>{tr("Expériences.", "Experience.")}</Stacked>
          <div className="mt-14">
            {EXPERIENCES.map((raw) => loc(raw, lang)).map((x, i) => (
              <Reveal key={x.co} delay={i * 0.1}>
                <article className="group grid gap-8 border-t border-paper/15 py-12 md:grid-cols-[80px_1.1fr_1fr]">
                  <img src={x.logo} alt={x.co} className={`size-14 rounded-lg object-contain p-2 ${x.co.startsWith("PHINIA") ? "bg-ink ring-1 ring-paper/20" : "bg-white"}`} />
                  <div>
                    <h3 className="text-4xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-6xl">{x.co}</h3>
                    <p className="mt-3 text-paper/70">{x.role}</p>
                    <p className="mt-1 font-mono text-[11px] tracking-wider text-paper/40 uppercase">{x.place} · {x.date}</p>
                  </div>
                  <div>
                    <ul className="space-y-3">
                      {x.points.map((p) => <li key={p} className="flex gap-3 leading-snug"><span className="mt-2 h-px w-3 shrink-0 bg-signal" />{p}</li>)}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {x.tags.map((t) => <span key={t} className="border border-paper/20 px-2 py-1 font-mono text-[10px] tracking-wider uppercase text-paper/70">{t}</span>)}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projets" style={{ "--color-signal": "#FF4D00" } as React.CSSProperties} className="mx-auto max-w-[1400px] px-6 py-32 md:px-10">
        <div className="mb-14"><Stacked ghost={tr("Réalisations", "Work")} n="04">{tr("Projets.", "Projects.")}</Stacked></div>
        <Projects />
      </section>

      {/* ENGAGEMENTS */}
      <section id="engagements" style={{ "--color-signal": "#E10600" } as React.CSSProperties} className="mx-auto max-w-[1400px] px-6 pb-32 md:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Stacked ghost="Leadership" n="05">{tr("Engagements.", "Involvement.")}</Stacked>
          <p className="max-w-sm text-mute">{tr("Là où j'ai appris à aligner des gens, un budget et une deadline — le cœur du métier de PO.", "Where I learned to align people, a budget and a deadline — the core of a PO's job.")}</p>
        </div>
        <Engagements onMinitel={() => setGame("minitel")} />
      </section>

      {/* PASSIONS */}
      <section id="passions" style={{ "--color-signal": "#E10600" } as React.CSSProperties} className="mx-auto max-w-[1400px] px-6 pb-32 md:px-10">
        <div className="mb-14"><Stacked ghost={tr("Personnalité", "Personality")} n="06">Passions.</Stacked></div>
        <Passions Label={Label} />
      </section>

      {/* STACK */}
      <section id="stack" style={{ "--color-signal": "#2340F0" } as React.CSSProperties} className="mx-auto max-w-[1400px] px-6 py-32 md:px-10">
        <div className="mb-14"><Stacked ghost="Toolbox" n="07"><Hl>{tr("Du transistor au ", "From transistor to ")}<span className="font-serif font-normal italic">{tr("produit", "product")}</span>.</Hl></Stacked></div>
        <div className="border-t border-ink">
          {STACK.map((raw) => loc(raw, lang)).map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div className="group grid items-center gap-4 border-b border-ink py-6 transition-colors hover:bg-ink hover:text-paper md:grid-cols-[120px_220px_1fr] md:px-4">
                <span className="font-mono text-[11px] text-mute group-hover:text-signal">L{s.n}</span>
                <span className="text-3xl font-semibold tracking-tight">{s.layer}</span>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {s.items.map((it) => <span key={it} className="text-mute group-hover:text-paper/80">{it}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <Label>{tr("Langues", "Languages")}</Label>
            <div className="mt-5 space-y-5">
              {LANGS.map((raw) => loc(raw, lang)).map((l, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm"><span className="font-medium">{l.l}</span><span className="font-mono text-[11px] text-mute">{l.v}</span></div>
                  <div className="mt-2 h-[3px] bg-line">
                    <motion.div className="h-full origin-left bg-ink" style={{ width: `${l.p}%` }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease, delay: i * 0.12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Certifications</Label>
            <ul className="mt-5 space-y-2.5">
              {["Label HandiManagement", tr("PSC1 — Premiers secours", "PSC1 — First aid certification"), "TOEIC 955 / 990 · TOEFL · Cambridge"].map((c) => <li key={c} className="flex gap-3"><span className="mt-2.5 h-px w-3 shrink-0 bg-signal" />{c}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ "--color-signal": "#FF4D00" } as React.CSSProperties} className="relative overflow-hidden border-t border-ink pb-10 md:pb-14">
        <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-8 md:px-10 md:pt-28 md:pb-12">
          <Label>§08 — Contact</Label>
          <h2 className="mt-6 text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] font-semibold tracking-[-0.05em]">{tr("Travaillons", "Let's work")}<br />{tr("ensemble", "together")}<span className="text-signal">.</span></h2>
          <p className="mt-8 max-w-xl text-lg text-mute leading-relaxed">
            {tr(
              "À la recherche d'un stage de fin d'études (5+ mois) à partir d'avril 2027 — Product Owner, Product Manager, Prototypage & Innovation Produit.",
              "Seeking a 5+ month end-of-studies internship starting April 2027 — Product Owner, Product Manager, Prototyping & Product Innovation."
            )}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <button onClick={copy} className="group flex items-center gap-4 border-b-2 border-ink pb-2 text-2xl font-medium md:text-4xl">
              contact@arthurdx.com
              <span className="grid size-10 place-items-center rounded-full bg-ink text-paper transition-colors group-hover:bg-signal">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </span>
            </button>
            <button
              onClick={() => setContactModal(true)}
              className="flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-sm font-semibold tracking-wide text-paper transition-all hover:bg-signal hover:border-signal"
            >
              <Send className="size-4" />
              <span>{tr("Envoyer un email", "Send an email")}</span>
            </button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-px border border-ink bg-ink lg:grid-cols-4">
            {SOCIALS.map(({ I, l, h }) => (
              <a key={l} href={h} target="_blank" rel="noreferrer" className="group flex items-center justify-between bg-paper p-6 transition-colors hover:bg-ink hover:text-paper">
                <span className="flex items-center gap-4"><I className="size-7" /><span className="text-xl font-medium">{l}</span></span>
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
              </a>
            ))}
            <button onClick={() => setCv(true)} className="group flex items-center justify-between bg-paper p-6 text-left transition-colors hover:bg-ink hover:text-paper">
              <span className="flex items-center gap-4"><Download className="size-7" /><span className="text-xl font-medium">{tr("CV", "Resume")}</span></span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-mute uppercase group-hover:text-paper/60">FR · EN</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-ink text-paper">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-5 md:px-10">
          <a href="#top" onClick={tapLogo} aria-label={tr("Accueil", "Home")} className="transition-opacity hover:opacity-80">
            <Logo className="h-6 w-auto text-paper" />
          </a>
          <div className="flex items-center gap-2">
            <a
              href="https://linkedin.com/in/arthur-doradoux"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="grid size-9 place-items-center border border-paper/20 text-paper transition-all hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
            >
              <LinkedInIcon className="size-4" />
            </a>
            <a
              href="https://github.com/Arthrir"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid size-9 place-items-center border border-paper/20 text-paper transition-all hover:border-white hover:bg-white hover:text-[#121211]"
            >
              <GitHubIcon className="size-4" />
            </a>
            <a
              href="https://wa.me/33627883483"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-9 place-items-center border border-paper/20 text-paper transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
            >
              <WhatsAppIcon className="size-4" />
            </a>
            <a
              href="mailto:contact@arthurdx.com"
              aria-label="Email"
              className="grid size-9 place-items-center border border-paper/20 text-paper transition-all hover:border-signal hover:bg-signal hover:text-white"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-paper/10">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-3 md:px-10">
            <span className="font-mono text-[11px] tracking-[0.14em] text-paper/40 uppercase">© 2026 Arthur Doradoux · <a href="#mentions-legales" className="hover:text-paper">{tr("Mentions légales", "Legal notice")}</a></span>
            <span className="hidden font-mono text-[11px] tracking-[0.14em] text-paper/30 uppercase md:inline">{tr("Easter eggs cachés dans la page", "Easter eggs hidden in the page")}</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {copied && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="glass fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium">
            {tr("Email copié", "Email copied")}
          </motion.div>
        )}
      </AnimatePresence>
      <Suspense fallback={null}>
        <AnimatePresence>
          {game === "minitel" && <Minitel key="m" onClose={() => { setGame(null); setViaMinitel(false); }} onLaunch={(g) => { setViaMinitel(true); setGame(g); }} />}
          {game === "f1" && <F1 key="f" onClose={closeGame} />}
          {game === "aim" && <AimLab key="a" onClose={closeGame} />}
          {game === "blackjack" && <Blackjack key="b" onClose={closeGame} />}
        </AnimatePresence>
      </Suspense>
      <Palette open={palette} onClose={() => setPalette(false)} onGame={setGame} />
      <ContactModal open={contactModal} onClose={() => setContactModal(false)} />
    </div>
  );
}
