import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsyn: {
          void: "#030303",
          black: "#070707",
          surface: "#0e0e0e",
          elevated: "#161616",
          card: "#121212",
          border: "#222222",
          "border-light": "#333333",
          muted: "#888888",
          subtle: "#555555",
          white: "#F5F5F7",
          pure: "#FFFFFF",
          accent: "#D4FF00", // Subtle electric acid lime
          silver: "#E0E0E0",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        "tighter-hero": "-0.05em",
        "tight-headline": "-0.03em",
        "wide-meta": "0.15em",
        "widest-badge": "0.25em",
      },
      animation: {
        "pulse-subtle": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
