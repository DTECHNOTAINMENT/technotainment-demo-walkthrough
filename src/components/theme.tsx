"use client";

import { useEffect, useState } from "react";
import { branding } from "@/lib/config";

const KEY = "metascape-theme";
type Theme = "dark" | "light";

/**
 * Inline script that applies the persisted theme to <html data-theme> before first
 * paint, so there is no light/dark flash. Mirrors the prototype's data-theme model.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    KEY,
  )})||${JSON.stringify(branding.defaultTheme)};document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

/** Round gradient-ringed theme toggle (sun/moon), matching the prototype's `.theme-toggle`. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(branding.defaultTheme);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || branding.defaultTheme;
    setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={`switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "☾" : "☀"}
    </button>
  );
}
