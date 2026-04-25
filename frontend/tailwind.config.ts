import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        panel: "0 28px 80px rgba(3, 12, 24, 0.45)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.16), transparent 32%), radial-gradient(circle at 100% 0%, rgba(45, 212, 191, 0.14), transparent 26%), linear-gradient(135deg, rgba(2, 8, 23, 0.98), rgba(8, 20, 38, 0.98))",
      },
      fontFamily: {
        display: ["Avenir Next", "Sora", "Segoe UI", "sans-serif"],
        body: ["IBM Plex Sans", "Avenir Next", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
