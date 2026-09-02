import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        leadjen: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#cc0000", // Leadjen Editorial Red accent
          700: "#990000", // Deep Red
          800: "#730000",
          900: "#18181b", // Solid Neutral Black
          950: "#09090b", // Pure Dark Black
          red: "#cc0000",
          darkRed: "#990000",
          charcoal: "#121212",
          dark: "#0a0a0a",
        },
        editorial: {
          bg: "#ffffff",
          paper: "#f8f9fa",
          text: "#0a0a0a",
          muted: "#52525b",
          border: "#e4e4e7",
          darkBg: "#0a0a0a",
          darkCard: "#141414",
          darkBorder: "#262626",
        },
        breaking: {
          red: "#cc0000",
          darkRed: "#990000",
          amber: "#cc0000",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["Consolas", "Monaco", "'Courier New'", "monospace"],
      },
      screens: {
        xs: "414px",
      },
    },
  },
  plugins: [],
};
export default config;
