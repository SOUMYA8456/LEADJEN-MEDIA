"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SITE_BUILDER_CONFIG, generateThemeCss, SiteBuilderConfig } from "@/lib/site-builder-defaults";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  siteConfig: SiteBuilderConfig;
  updateLiveConfig?: (newConfig: SiteBuilderConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: SiteBuilderConfig;
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteBuilderConfig>(
    initialConfig || DEFAULT_SITE_BUILDER_CONFIG
  );

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("leadjen_theme") as Theme | null;
    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeState(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    }

    // Check if in preview mode (?preview=true)
    if (typeof window !== "undefined" && window.location.search.includes("preview=true")) {
      fetch("/api/site-builder?draft=true")
        .then((r) => r.json())
        .then((data) => {
          if (data.config) {
            setSiteConfig(data.config);
            const styleTag = document.getElementById("leadjen-theme-vars");
            if (styleTag) {
              styleTag.innerHTML = generateThemeCss(data.config);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("leadjen_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  const updateLiveConfig = (newConfig: SiteBuilderConfig) => {
    setSiteConfig(newConfig);
    const styleTag = document.getElementById("leadjen-theme-vars");
    if (styleTag) {
      styleTag.innerHTML = generateThemeCss(newConfig);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, siteConfig, updateLiveConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "light" as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      siteConfig: DEFAULT_SITE_BUILDER_CONFIG,
      updateLiveConfig: () => {},
    };
  }
  return context;
}
