import { useState, useEffect } from "react";
import App from "../App";
import PreviewBar from "./PreviewBar";
import { type ThemeOptionId } from "./themeConfig";
import "./options.css";

// Helper pour déterminer le thème demandé depuis l'URL (pathname, query param ou hash)
export function detectThemeFromUrl(): { theme: ThemeOptionId; isPreview: boolean } {
  if (typeof window === "undefined") {
    return { theme: "original", isPreview: false };
  }

  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  const search = new URLSearchParams(window.location.search);
  const themeParam = (search.get("theme") || search.get("preview") || search.get("option") || "").toLowerCase();
  const hash = window.location.hash.toLowerCase().replace("#", "");

  // Détection par chemin direct (/optionA, /optionB, /optionC, etc.)
  if (path === "/optiona" || path === "/option-a" || themeParam === "optiona" || themeParam === "option-a" || themeParam === "a" || hash === "optiona" || hash === "option-a") {
    return { theme: "option-a", isPreview: true };
  }
  if (path === "/optionb" || path === "/option-b" || themeParam === "optionb" || themeParam === "option-b" || themeParam === "b" || hash === "optionb" || hash === "option-b") {
    return { theme: "option-b", isPreview: true };
  }
  if (path === "/optionc" || path === "/option-c" || themeParam === "optionc" || themeParam === "option-c" || themeParam === "c" || hash === "optionc" || hash === "option-c") {
    return { theme: "option-c", isPreview: true };
  }

  // Détection du mode preview explicite
  if (search.get("preview") === "true") {
    return { theme: "original", isPreview: true };
  }

  return { theme: "original", isPreview: false };
}

export default function OptionRouter() {
  const initial = detectThemeFromUrl();
  const [currentTheme, setCurrentTheme] = useState<ThemeOptionId>(initial.theme);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(initial.isPreview);

  // Écoute les changements d'historique (boutons Précédent / Suivant du navigateur)
  useEffect(() => {
    const onPopState = () => {
      const current = detectThemeFromUrl();
      setCurrentTheme(current.theme);
      setIsPreviewMode(current.isPreview);
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, []);

  // Gestion du changement de thème depuis la barre d'aperçu
  const handleSelectTheme = (themeId: ThemeOptionId) => {
    setCurrentTheme(themeId);
    setIsPreviewMode(true);

    let targetPath = "/";
    if (themeId === "option-a") targetPath = "/optionA";
    else if (themeId === "option-b") targetPath = "/optionB";
    else if (themeId === "option-c") targetPath = "/optionC";
    else if (themeId === "original") targetPath = "/?preview=true";

    window.history.pushState({ theme: themeId }, "", targetPath);
  };

  return (
    <div className="relative">
      <App theme={currentTheme} />
      {isPreviewMode && (
        <PreviewBar
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
        />
      )}
    </div>
  );
}
