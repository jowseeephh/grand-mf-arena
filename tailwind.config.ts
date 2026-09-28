import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          black: "#0a0a0a",
          charcoal: "#141414",
          panel: "#1b1b1b",
          border: "#2a2a2a",
          gold: "#c9a44c",
          goldlight: "#e4c878",
          golddark: "#8a6d2f",
          cream: "#f3ead9",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,164,76,0.25), 0 8px 24px -8px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
