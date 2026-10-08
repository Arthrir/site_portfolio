# Arthur Doradoux — Portfolio V3

Bienvenue sur le dépôt de mon site personnel et portfolio interactif disponible sur [arthurdx.com](https://arthurdx.com).

Ce projet est à la fois ma vitrine professionnelle et mon laboratoire personnel : un espace où j'expérimente avec le design d'interaction, le front-end moderne, la typographie et des interfaces ludiques inspirées de l'ingénierie et des instruments de mesure.

---

## 🚀 À propos du projet

Après une V1 puis une V2 sous Astro, cette **V3** marque une refonte complète de l'architecture pour offrir une expérience ultra-fluide, réactive et riche en détails techniques :

- **Architecture Single Page Application (SPA)** : propulsée par **React 19**, **Vite** et **TypeScript**.
- **Design System sur-mesure & Micro-interactions** : stylisé avec **Tailwind CSS v4** et animé avec **Motion** (`framer-motion` / `motion/react`).
- **Banc de test interactif Soc / Die** : un composant SVG interactif modélisant un SoC silicium avec portes logiques (XOR, AND, OR), bus de communication (UART, I2C), mini-écran OLED émulé, sélection dynamique de thèmes et signaux animés.
- **Terminal rétro 3615 MINITEL & Easter Eggs** : un terminal rétro complet accessible au clavier ou à la souris, intégrant 3 mini-jeux jouables :
  - 🏎️ **Grand Prix F1** : jeu de course réactif en canvas avec sélection de circuits et gestion du chrono.
  - 🎯 **Aim Lab** : entraînement réflexe et clics de précision.
  - 🃏 **Blackjack** : simulation du jeu avec animations fluides de cartes.
- **Globe 3D interactif (Cobe)** : visualisation interactive des mobilités internationales, études et voyages.
- **Bilingue natif (FR / EN)** : bascule instantanée de langue avec persistance locale.
- **Dossier de candidature EMLYON** : conservé et directement accessible sur [`/candidature_emlyon`](https://arthurdx.com/candidature_emlyon).

---

## 🛠️ Stack Technique

- **Framework & Runtime** : [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Outillage** : [Vite 8](https://vitejs.dev/)
- **Styles & Utilitaires** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations** : [Motion](https://motion.dev/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Visualisation 3D** : [Cobe](https://github.com/shuding/cobe)
- **Hébergement & Déploiement** : [Vercel](https://vercel.com/)

---

## 💻 Développement local

### Prérequis
- **Node.js** >= 22.12.0
- **npm** (ou pnpm / yarn)

### Installation et lancement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement local
npm run dev

# Compiler pour la production
npm run build

# Prévisualiser le build de production localement
npm run preview
```

---

## 📄 Licence & Droits

Conçu et développé avec passion par **Arthur Doradoux** ([arthurdx.com](https://arthurdx.com)).  
Tous droits réservés sur les contenus personnels, visuels et projets présentés.