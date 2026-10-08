import { motion } from "motion/react";
import { X } from "lucide-react";
import { loc, useLang, type Loc } from "../i18n";

const ease = [0.22, 1, 0.36, 1] as const;

const BLOCKS: Loc<{ t: string; p: string[] }>[] = [
  { t: "Éditeur", p: ["Arthur Doradoux — contact@arthurdx.com", "Directeur de la publication : Arthur Doradoux"], en: { t: "Publisher", p: ["Arthur Doradoux — contact@arthurdx.com", "Publication director: Arthur Doradoux"] } },
  { t: "Hébergement", p: ["Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com"], en: { t: "Hosting" } },
  { t: "Propriété intellectuelle", p: ["L'ensemble des contenus du site (mise en page, code source, textes, graphismes, identité visuelle, livrables de projets) sont des œuvres originales protégées par le droit français et international de la propriété intellectuelle. Toute reproduction, adaptation ou diffusion, totale ou partielle, sans autorisation écrite préalable d'Arthur Doradoux est interdite."], en: { t: "Intellectual property", p: ["All content on this site (layout, source code, text, graphics, visual identity, project deliverables) consists of original works protected by French and international intellectual property law. Any reproduction, adaptation or distribution, in whole or in part, without the prior written consent of Arthur Doradoux is prohibited."] } },
  { t: "Photographies", p: ["Les photographies présentées (portraits, carnets de voyage, architecture, reportage) sont des créations originales d'Arthur Doradoux, diffusées sous licence « Tous droits réservés ». Toute réutilisation, modification, recadrage ou redistribution sans accord préalable et mention de paternité est interdite."], en: { t: "Photographs", p: ["The photographs shown (portraits, travel journals, architecture, reportage) are original works by Arthur Doradoux, published under an “All rights reserved” license. Any reuse, modification, cropping or redistribution without prior consent and attribution is prohibited."] } },
  { t: "Marques & logos", p: ["Les marques, dénominations et logos des entreprises (PHINIA, Advantest…), écoles et universités (Mines Saint-Étienne, Politecnico di Milano, emlyon…) et organisations mentionnées restent la propriété de leurs titulaires. Leur affichage est strictement informatif et référentiel, pour illustrer le parcours de l'auteur (art. L. 713-6 du Code de la propriété intellectuelle), et n'implique aucune affiliation ni cautionnement."], en: { t: "Trademarks & logos", p: ["The trademarks, names and logos of the companies (PHINIA, Advantest…), schools and universities (Mines Saint-Étienne, Politecnico di Milano, emlyon…) and organizations mentioned remain the property of their respective owners. They are displayed for purely informational and referential purposes, to illustrate the author's background (art. L. 713-6 of the French Intellectual Property Code), and imply no affiliation or endorsement."] } },
  { t: "Données personnelles", p: ["Le site ne comporte pas de formulaire : un contact par e-mail ou WhatsApp n'est utilisé que pour répondre à votre demande (échanges professionnels, propositions de stage ou d'emploi) et conservé au maximum 2 ans après le dernier échange. Aucune donnée n'est cédée ni vendue.", "Conformément au RGPD et à la loi « Informatique et Libertés », vous disposez d'un droit d'accès, de rectification, de limitation et de suppression, exerçable à contact@arthurdx.com. Vous pouvez aussi saisir la CNIL (cnil.fr)."], en: { t: "Personal data", p: ["This site has no forms: any contact by email or WhatsApp is used solely to respond to your request (professional exchanges, internship or job offers) and kept for no longer than 2 years after the last exchange. No data is shared or sold.", "In accordance with the GDPR and the French Data Protection Act, you have the right to access, rectify, restrict and delete your data, which you can exercise at contact@arthurdx.com. You may also lodge a complaint with the CNIL (cnil.fr)."] } },
  { t: "Cookies & stockage", p: ["Aucun cookie publicitaire, traceur tiers ou pixel marketing.", "Seules vos préférences d'affichage (couleur d'accent, langue, records des mini-jeux) sont mémorisées localement dans votre navigateur ; elles ne quittent jamais votre appareil et ne nécessitent pas de consentement.", "Mesure d'audience éventuelle via Vercel Web Analytics, sans cookie et anonymisée."], en: { t: "Cookies & storage", p: ["No advertising cookies, third-party trackers or marketing pixels.", "Only your display preferences (accent color, language, mini-game high scores) are stored locally in your browser; they never leave your device and require no consent.", "Possible audience measurement via Vercel Web Analytics, cookieless and anonymized."] } },
];

export default function Legal({ onClose }: { onClose: () => void }) {
  const { lang, tr } = useLang();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-paper" role="dialog" aria-modal aria-label={tr("Mentions légales", "Legal notice")}>
      <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] tracking-[0.14em] text-signal uppercase">{tr("§ Légal · mis à jour 2026", "§ Legal · updated 2026")}</span>
            <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease }} className="mt-4 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]">
              {tr("Mentions ", "Legal ")}<span className="font-serif font-normal italic">{tr("légales.", "notice.")}</span>
            </motion.h1>
          </div>
          <button onClick={onClose} aria-label={tr("Fermer", "Close")} className="grid size-11 shrink-0 place-items-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper"><X className="size-4" /></button>
        </div>
        <div className="mt-16 border-t border-ink">
          {BLOCKS.map((raw) => loc(raw, lang)).map((b, i) => (
            <motion.section key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.05 }}
              className="grid gap-4 border-b border-line py-8 md:grid-cols-[80px_240px_1fr]">
              <span className="font-mono text-[11px] text-mute">0{i + 1}</span>
              <h2 className="text-lg font-semibold tracking-tight">{b.t}</h2>
              <div className="space-y-3 leading-relaxed text-ink/80">{b.p.map((x) => <p key={x}>{x}</p>)}</div>
            </motion.section>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
