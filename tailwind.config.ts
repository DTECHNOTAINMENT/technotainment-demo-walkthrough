import type { Config } from "tailwindcss";

// Tailwind is additive. The source of truth for design tokens is src/app/globals.css
// (ported verbatim from the prototype's theme.css). We expose those CSS variables to
// Tailwind so utilities and bespoke components share one palette. Dark-first via
// the `data-theme` attribute on <html>. See CLAUDE.md §5 / docs/DECISIONS.md.
const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        "ink-1": "var(--ink-1)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        hairline: "var(--hairline)",
        "hairline-2": "var(--hairline-2)",
      },
      fontFamily: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      backgroundImage: {
        "brand-gradient": "var(--brand-gradient)",
        "live-gradient": "var(--live-gradient)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
    },
  },
  plugins: [],
};

export default config;
