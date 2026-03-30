import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1c2d3a",
        navy2: "#243647",
        teal: "#2bb5c8",
        teal2: "#1fa8bb",
        lms: {
          teal: "#2bb5c8",
          teal2: "#1fa8bb",
          navy: "#1c2d3a",
          accent: "#f0a500",
          green: "#27ae60",
          red: "#e74c3c",
          text: "#2c3e50",
          muted: "#8a9bb0",
          border: "#e8eef4",
          bg: "#f0f4f8",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
