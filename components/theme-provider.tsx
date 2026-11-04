"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem("nova-theme");
    const initial: Theme = stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

    if (!stored) localStorage.setItem("nova-theme", initial);
    applyTheme(initial);
    // Keep the home-page external-store subscriber in sync with the same theme source.
    window.dispatchEvent(new Event("nova-preferences-change"));

    const syncTheme = (event: StorageEvent) => {
      if (event.key === "nova-theme" && (event.newValue === "light" || event.newValue === "dark")) {
        applyTheme(event.newValue);
        window.dispatchEvent(new Event("nova-preferences-change"));
      }
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  return <>{children}</>;
}
