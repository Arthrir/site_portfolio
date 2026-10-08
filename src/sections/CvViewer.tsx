import { useState } from "react";
import { motion } from "motion/react";
import { Download, X } from "lucide-react";
import { useLang } from "../i18n";

const CVS = { fr: { l: "Français", h: "/assets/CV-Arthur_DORADOUX-FR.pdf" }, en: { l: "English", h: "/assets/CV-Arthur_DORADOUX-ENG.pdf" } };

// Aperçu du CV dans le site (les nouveaux onglets sont parfois bloqués dans l'aperçu)
export default function CvViewer({ onClose }: { onClose: () => void }) {
  const { lang: siteLang, tr } = useLang();
  const [lang, setLang] = useState<keyof typeof CVS>(siteLang);
  const cv = CVS[lang];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-3 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-sm md:p-8">
      <motion.div initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label={tr("Curriculum vitæ", "Resume")}
        className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-paper shadow-2xl">
        <div className="flex items-center gap-3 border-b border-ink px-4 py-3">
          <span className="mr-auto font-mono text-[11px] tracking-[0.14em] uppercase">{tr("Curriculum vitæ", "Resume")}</span>
          <div className="flex border border-ink">
            {(Object.keys(CVS) as (keyof typeof CVS)[]).map((k) => (
              <button key={k} onClick={() => setLang(k)} className={`px-3 py-1.5 text-sm font-medium transition-colors ${lang === k ? "bg-ink text-paper" : "hover:bg-ink/5"}`}>{CVS[k].l}</button>
            ))}
          </div>
          <a href={cv.h} download className="flex items-center gap-2 bg-signal px-3 py-1.5 text-sm font-medium text-white"><Download className="size-4" /><span className="hidden sm:inline">{tr("Télécharger", "Download")}</span></a>
          <button onClick={onClose} aria-label={tr("Fermer", "Close")} className="grid size-8 place-items-center hover:text-signal"><X className="size-5" /></button>
        </div>
        <object key={cv.h} data={`${cv.h}#view=FitH`} type="application/pdf" className="w-full flex-1 bg-line">
          <div className="grid h-full place-items-center p-8 text-center">
            <p className="text-mute">{tr("L'aperçu PDF n'est pas disponible sur cet appareil.", "PDF preview is not available on this device.")}<br /><a href={cv.h} download className="mt-4 inline-block font-medium text-ink underline">{tr("Télécharger le CV", "Download resume")} ({cv.l})</a></p>
          </div>
        </object>
      </motion.div>
    </motion.div>
  );
}
