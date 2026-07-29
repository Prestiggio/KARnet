import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Extracted directly from the KaRNet badge artwork
        cream: {
          DEFAULT: "#F2EEDC",
          soft: "#FAF8EF",
        },
        burgundy: {
          DEFAULT: "#670E2E",
          deep: "#4A0A21",
          light: "#7E1938",
        },
        gold: {
          DEFAULT: "#CC9926",
          bright: "#E0B94A",
        },
        ochre: {
          DEFAULT: "#B38524",
          dark: "#8C6A1D",
        },
        ink: "#241608",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(36,22,8,0.06) 1px, transparent 0)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
