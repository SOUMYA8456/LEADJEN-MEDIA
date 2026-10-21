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
          50: "#FFFCF5",
          100: "#F7EEDB",
          200: "#E8DCCB",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#665858",
          600: "#B42332", // Breaking Red
          700: "#6B1024", // Maroon accent
          800: "#4A0B1C", // Deep maroon
          900: "#241A1A", // Primary text
          950: "#09090b",
          cream: "#FFF8E7",
          creamSecondary: "#F7EEDB",
          creamCard: "#FFFCF5",
          creamBorder: "#E8DCCB",
          creamText: "#241A1A",
          creamMuted: "#665858",
          maroon: "#6B1024",
          deepMaroon: "#4A0B1C",
          sidebarSecondary: "#60152B",
          sidebarActive: "#7A2038",
          sidebarTextSecondary: "#F4DDE3",
          red: "#B42332",
          darkRed: "#6B1024",
          charcoal: "#241A1A",
          dark: "#0a0a0a",
        },
        editorial: {
          bg: "#FFF8E7",
          paper: "#F7EEDB",
          card: "#FFFCF5",
          text: "#241A1A",
          muted: "#665858",
          border: "#E8DCCB",
          maroon: "#6B1024",
          deepMaroon: "#4A0B1C",
          darkBg: "#0a0a0a",
          darkCard: "#141414",
          darkBorder: "#262626",
        },
        breaking: {
          red: "#B42332",
          darkRed: "#6B1024",
          amber: "#B42332",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        sans: ["LINESeedJP", "'LINE Seed JP'", "var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
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
