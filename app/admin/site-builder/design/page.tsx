"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Type,
  Maximize2,
  Sliders,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { SiteBuilderNav } from "@/components/admin/SiteBuilderNav";
import {
  DEFAULT_DESIGN_SYSTEM,
  DEFAULT_SITE_BUILDER_CONFIG,
  SiteBuilderConfig,
  DesignColorsConfig,
  DesignTypographyConfig,
  DesignSpacingConfig,
  DesignBordersConfig,
} from "@/lib/site-builder-defaults";

const FONT_HEADING_OPTIONS = [
  { label: "Georgia & Times (Classic Editorial)", value: "Georgia, Cambria, 'Times New Roman', Times, serif" },
  { label: "Playfair Display & Georgia (High-Impact Broadside)", value: "'Playfair Display', Georgia, serif" },
  { label: "Merriweather & Serif (Modern Digital News)", value: "'Merriweather', Georgia, serif" },
  { label: "Garamond & Baskerville (Historic Press)", value: "'Garamond', 'Baskerville', serif" },
  { label: "System Sans-Serif (Modern Minimalist)", value: "var(--font-sans, -apple-system, sans-serif)" },
];

const FONT_BODY_OPTIONS = [
  { label: "Inter / System Sans (Optimized Newsroom)", value: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)" },
  { label: "Source Sans 3 (Editorial Sans)", value: "'Source Sans 3', -apple-system, sans-serif" },
  { label: "Georgia (Serif Long-Form Reading)", value: "Georgia, serif" },
];

const PRESET_PALETTES = [
  {
    name: "Leadjen Classic (#1E1B1A)",
    desc: "Authoritative deep charcoal & bold red wire accents",
    colors: {
      primary: "#1E1B1A",
      secondary: "#2d2726",
      accentRed: "#cc0000",
      background: "#ffffff",
      surface: "#f8f9fa",
      card: "#ffffff",
      textPrimary: "#0a0a0a",
      textSecondary: "#52525b",
      mutedText: "#71717a",
      borderColor: "#e4e4e7",
      darkBackground: "#0a0a0a",
      darkSurface: "#141414",
      darkCard: "#18181b",
      darkTextPrimary: "#f4f4f5",
      darkTextSecondary: "#a1a1aa",
      darkBorderColor: "#27272a",
    },
  },
  {
    name: "Monochrome Modern",
    desc: "Crisp black and slate tones with crimson focal badges",
    colors: {
      primary: "#0f0f0f",
      secondary: "#262626",
      accentRed: "#dc2626",
      background: "#ffffff",
      surface: "#f5f5f5",
      card: "#ffffff",
      textPrimary: "#171717",
      textSecondary: "#525252",
      mutedText: "#737373",
      borderColor: "#e5e5e5",
      darkBackground: "#050505",
      darkSurface: "#121212",
      darkCard: "#1a1a1a",
      darkTextPrimary: "#fafafa",
      darkTextSecondary: "#a3a3a3",
      darkBorderColor: "#262626",
    },
  },
  {
    name: "Warm Editorial News",
    desc: "Subtle warm-white canvas with dark espresso typography",
    colors: {
      primary: "#1c1917",
      secondary: "#292524",
      accentRed: "#b91c1c",
      background: "#ffffff",
      surface: "#fafaf9",
      card: "#ffffff",
      textPrimary: "#1c1917",
      textSecondary: "#57534e",
      mutedText: "#78716c",
      borderColor: "#e7e5e4",
      darkBackground: "#0c0a09",
      darkSurface: "#1c1917",
      darkCard: "#292524",
      darkTextPrimary: "#f5f5f4",
      darkTextSecondary: "#a8a29e",
      darkBorderColor: "#292524",
    },
  },
];

export default function DesignTypographyBuilder() {
  const [config, setConfig] = useState<SiteBuilderConfig>(DEFAULT_SITE_BUILDER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deviceTab, setDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    fetch("/api/site-builder?draft=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig({
            ...DEFAULT_SITE_BUILDER_CONFIG,
            ...data.config,
            design: {
              ...DEFAULT_DESIGN_SYSTEM,
              ...(data.config.design || {}),
              colors: {
                ...DEFAULT_DESIGN_SYSTEM.colors,
                ...(data.config.design?.colors || {}),
              },
              typography: {
                ...DEFAULT_DESIGN_SYSTEM.typography,
                ...(data.config.design?.typography || {}),
              },
              spacing: {
                ...DEFAULT_DESIGN_SYSTEM.spacing,
                ...(data.config.design?.spacing || {}),
              },
              borders: {
                ...DEFAULT_DESIGN_SYSTEM.borders,
                ...(data.config.design?.borders || {}),
              },
            },
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (isPublish = false) => {
    try {
      setSaving(true);
      const res = await fetch("/api/site-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, isPublish }),
      });
      if (res.ok) {
        setStatusMessage(
          isPublish
            ? "✓ Design system tokens published live across all public pages!"
            : "✓ Design system tokens saved as draft."
        );
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert("Failed to save design tokens.");
    } finally {
      setSaving(false);
    }
  };

  const updateColors = (field: keyof DesignColorsConfig, value: string) => {
    setConfig({
      ...config,
      design: {
        ...config.design,
        colors: {
          ...config.design.colors,
          [field]: value,
        },
      },
    });
  };

  const updateTypography = (field: keyof DesignTypographyConfig, value: any) => {
    setConfig({
      ...config,
      design: {
        ...config.design,
        typography: {
          ...config.design.typography,
          [field]: value,
        },
      },
    });
  };

  const updateSpacing = (field: keyof DesignSpacingConfig, value: number) => {
    setConfig({
      ...config,
      design: {
        ...config.design,
        spacing: {
          ...config.design.spacing,
          [field]: value,
        },
      },
    });
  };

  const updateBorders = (field: keyof DesignBordersConfig, value: number) => {
    setConfig({
      ...config,
      design: {
        ...config.design,
        borders: {
          ...config.design.borders,
          [field]: value,
        },
      },
    });
  };

  const applyPalette = (paletteColors: DesignColorsConfig) => {
    setConfig({
      ...config,
      design: {
        ...config.design,
        colors: { ...paletteColors },
      },
    });
  };

  const d = config.design || DEFAULT_DESIGN_SYSTEM;
  const colors = d.colors || DEFAULT_DESIGN_SYSTEM.colors;
  const typo = d.typography || DEFAULT_DESIGN_SYSTEM.typography;
  const spacing = d.spacing || DEFAULT_DESIGN_SYSTEM.spacing;
  const borders = d.borders || DEFAULT_DESIGN_SYSTEM.borders;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      <SiteBuilderNav />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-mono font-bold uppercase rounded">
              SITE BUILDER
            </span>
            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] font-mono font-bold uppercase rounded">
              DESIGN TOKENS &amp; TYPOGRAPHY
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-black dark:text-white mt-1">
            Global Design System &amp; Typography Engine
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Configure pixel-level colors, font scales, responsive breakpoints, container widths, and component borders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-black dark:text-white rounded-xl text-xs font-mono font-bold uppercase transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
          >
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-mono rounded-xl">
          {statusMessage}
        </div>
      )}

      {/* Preset Editorial Palettes */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-black dark:text-white" />
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            Editorial Color System Presets (Strict Zero-Blue)
          </h3>
        </div>
        <p className="text-xs text-neutral-500 font-sans">
          Select a pre-calibrated professional newsroom color scheme or customize individual tokens below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_PALETTES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPalette(preset.colors)}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50/50 dark:bg-neutral-950 text-left transition space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-black dark:text-white group-hover:underline">
                  {preset.name}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: preset.colors.primary }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: preset.colors.accentRed }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: preset.colors.background }} />
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                {preset.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Component Preview Card */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-black dark:text-white" />
            <h3 className="font-serif font-black text-lg text-black dark:text-white">
              Live Interactive Component Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewTheme("light")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition ${
                previewTheme === "light"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Light Mode
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("dark")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition ${
                previewTheme === "dark"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Dark Mode
            </button>
          </div>
        </div>

        {/* Rendered Preview Box */}
        <div
          className="p-6 rounded-2xl transition-all"
          style={{
            backgroundColor: previewTheme === "light" ? colors.background : colors.darkBackground,
            color: previewTheme === "light" ? colors.textPrimary : colors.darkTextPrimary,
            border: `${borders.borderWidth}px solid ${previewTheme === "light" ? colors.borderColor : colors.darkBorderColor}`,
          }}
        >
          <div className="max-w-2xl space-y-4">
            {/* Tag & Category */}
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white"
                style={{
                  backgroundColor: colors.accentRed,
                  borderRadius: `${borders.buttonRadius}px`,
                }}
              >
                SPECIAL REPORT
              </span>
              <span
                className="text-xs font-mono uppercase font-bold"
                style={{ color: previewTheme === "light" ? colors.textSecondary : colors.darkTextSecondary }}
              >
                INDIA &bull; GEOPOLITICS
              </span>
            </div>

            {/* H1 Headline */}
            <h1
              style={{
                fontFamily: typo.headingFont,
                fontSize: `${
                  deviceTab === "desktop"
                    ? typo.h1Desktop
                    : deviceTab === "tablet"
                    ? typo.h1Tablet
                    : typo.h1Mobile
                }px`,
                lineHeight: typo.h1LineHeight,
                fontWeight: 900,
              }}
            >
              Major Diplomatic &amp; Semiconductor Summit Sets Global Benchmark
            </h1>

            {/* Sub-headline / H2 */}
            <h2
              style={{
                fontFamily: typo.headingFont,
                fontSize: `${
                  deviceTab === "desktop"
                    ? typo.h2Desktop
                    : deviceTab === "tablet"
                    ? typo.h2Tablet
                    : typo.h2Mobile
                }px`,
                lineHeight: typo.h2LineHeight,
                fontWeight: 700,
                color: previewTheme === "light" ? colors.textSecondary : colors.darkTextSecondary,
              }}
            >
              Strategic investments in high-tech manufacturing and digital infrastructure announced.
            </h2>

            {/* Meta Bar */}
            <div
              className="py-2 flex items-center justify-between text-xs font-mono"
              style={{
                borderTop: `${borders.borderWidth}px solid ${
                  previewTheme === "light" ? colors.borderColor : colors.darkBorderColor
                }`,
                borderBottom: `${borders.borderWidth}px solid ${
                  previewTheme === "light" ? colors.borderColor : colors.darkBorderColor
                }`,
                color: previewTheme === "light" ? colors.mutedText : colors.darkTextSecondary,
              }}
            >
              <span>By Senior Editorial Correspondent &bull; 4 min read</span>
              <span>Updated 15 mins ago</span>
            </div>

            {/* Body Text */}
            <p
              style={{
                fontFamily: typo.bodyFont,
                fontSize: `${
                  deviceTab === "desktop"
                    ? typo.bodyDesktop
                    : deviceTab === "tablet"
                    ? typo.bodyTablet
                    : typo.bodyMobile
                }px`,
                lineHeight: typo.bodyLineHeight,
              }}
            >
              {typo.dropCapEnabled && (
                <span
                  style={{
                    fontFamily: typo.headingFont,
                    fontSize: "3rem",
                    lineHeight: 0.8,
                    float: "left",
                    marginRight: "0.5rem",
                    fontWeight: 900,
                  }}
                >
                  T
                </span>
              )}
              he strategic convergence of international policy frameworks and cutting-edge industrial expansion
              marks an unprecedented chapter in national news coverage. Editors and analysts across our desk
              continue to monitor developing wires in real-time.
            </p>

            {/* Sample Button & Card */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                style={{
                  backgroundColor: previewTheme === "light" ? colors.primary : "#ffffff",
                  color: previewTheme === "light" ? "#ffffff" : "#000000",
                  borderRadius: `${borders.buttonRadius}px`,
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontFamily: typo.uiFont,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Read Full Dispatch &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Configuration */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-black dark:text-white" />
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            Editorial Typography &amp; Font Families
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
              Headline Font Family (H1 - H4 &amp; Pull Quotes)
            </label>
            <select
              value={typo.headingFont}
              onChange={(e) => updateTypography("headingFont", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
            >
              {FONT_HEADING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
              Body &amp; Paragraph Font Family
            </label>
            <select
              value={typo.bodyFont}
              onChange={(e) => updateTypography("bodyFont", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-hidden"
            >
              {FONT_BODY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop Cap Toggle */}
        <label className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
          <div>
            <p className="font-bold text-xs text-black dark:text-white">Editorial Drop Cap</p>
            <p className="text-[11px] text-neutral-500">Render enlarged first letter at start of lead paragraph</p>
          </div>
          <input
            type="checkbox"
            checked={typo.dropCapEnabled}
            onChange={(e) => updateTypography("dropCapEnabled", e.target.checked)}
            className="w-4 h-4 accent-black dark:accent-white"
          />
        </label>
      </div>

      {/* Responsive Scale Inspector (Desktop / Tablet / Mobile) */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-serif font-black text-lg text-black dark:text-white">
              Responsive Typography Scale Inspector
            </h3>
            <p className="text-xs text-neutral-500 font-sans">
              Control font sizes per responsive viewport breakpoint
            </p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setDeviceTab("desktop")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                deviceTab === "desktop"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (1440px)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceTab("tablet")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                deviceTab === "tablet"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (768px)</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceTab("mobile")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                deviceTab === "mobile"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
          </div>
        </div>

        {/* Scale Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* H1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-black dark:text-white">H1 Headline Size</span>
              <span className="text-neutral-500">
                {deviceTab === "desktop"
                  ? `${typo.h1Desktop}px`
                  : deviceTab === "tablet"
                  ? `${typo.h1Tablet}px`
                  : `${typo.h1Mobile}px`}
              </span>
            </div>
            <input
              type="range"
              min={24}
              max={64}
              value={deviceTab === "desktop" ? typo.h1Desktop : deviceTab === "tablet" ? typo.h1Tablet : typo.h1Mobile}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (deviceTab === "desktop") updateTypography("h1Desktop", val);
                else if (deviceTab === "tablet") updateTypography("h1Tablet", val);
                else updateTypography("h1Mobile", val);
              }}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          {/* H2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-black dark:text-white">H2 Subtitle Size</span>
              <span className="text-neutral-500">
                {deviceTab === "desktop"
                  ? `${typo.h2Desktop}px`
                  : deviceTab === "tablet"
                  ? `${typo.h2Tablet}px`
                  : `${typo.h2Mobile}px`}
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={44}
              value={deviceTab === "desktop" ? typo.h2Desktop : deviceTab === "tablet" ? typo.h2Tablet : typo.h2Mobile}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (deviceTab === "desktop") updateTypography("h2Desktop", val);
                else if (deviceTab === "tablet") updateTypography("h2Tablet", val);
                else updateTypography("h2Mobile", val);
              }}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          {/* H3 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-black dark:text-white">H3 Card Headline Size</span>
              <span className="text-neutral-500">
                {deviceTab === "desktop"
                  ? `${typo.h3Desktop}px`
                  : deviceTab === "tablet"
                  ? `${typo.h3Tablet}px`
                  : `${typo.h3Mobile}px`}
              </span>
            </div>
            <input
              type="range"
              min={16}
              max={32}
              value={deviceTab === "desktop" ? typo.h3Desktop : deviceTab === "tablet" ? typo.h3Tablet : typo.h3Mobile}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (deviceTab === "desktop") updateTypography("h3Desktop", val);
                else if (deviceTab === "tablet") updateTypography("h3Tablet", val);
                else updateTypography("h3Mobile", val);
              }}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-black dark:text-white">Body Text Size</span>
              <span className="text-neutral-500">
                {deviceTab === "desktop"
                  ? `${typo.bodyDesktop}px`
                  : deviceTab === "tablet"
                  ? `${typo.bodyTablet}px`
                  : `${typo.bodyMobile}px`}
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={20}
              value={deviceTab === "desktop" ? typo.bodyDesktop : deviceTab === "tablet" ? typo.bodyTablet : typo.bodyMobile}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (deviceTab === "desktop") updateTypography("bodyDesktop", val);
                else if (deviceTab === "tablet") updateTypography("bodyTablet", val);
                else updateTypography("bodyMobile", val);
              }}
              className="w-full accent-black dark:accent-white"
            />
          </div>
        </div>
      </div>

      {/* Colors Inspector */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-black dark:text-white" />
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            Granular Color Tokens (Light &amp; Dark Theme)
          </h3>
        </div>

        {/* Light Theme Colors */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-neutral-500">Light Theme Tokens</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Primary Brand Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => updateColors("primary", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => updateColors("primary", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Accent Red (Live / Breaking)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.accentRed}
                  onChange={(e) => updateColors("accentRed", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.accentRed}
                  onChange={(e) => updateColors("accentRed", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Canvas Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) => updateColors("background", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.background}
                  onChange={(e) => updateColors("background", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.borderColor}
                  onChange={(e) => updateColors("borderColor", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.borderColor}
                  onChange={(e) => updateColors("borderColor", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dark Theme Colors */}
        <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-xs font-mono font-bold uppercase text-neutral-500">Dark Theme Tokens</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Dark Canvas Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.darkBackground}
                  onChange={(e) => updateColors("darkBackground", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.darkBackground}
                  onChange={(e) => updateColors("darkBackground", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Dark Surface Card</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.darkSurface}
                  onChange={(e) => updateColors("darkSurface", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.darkSurface}
                  onChange={(e) => updateColors("darkSurface", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Dark Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.darkBorderColor}
                  onChange={(e) => updateColors("darkBorderColor", e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.darkBorderColor}
                  onChange={(e) => updateColors("darkBorderColor", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing & Borders */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-black dark:text-white" />
          <h3 className="font-serif font-black text-lg text-black dark:text-white">
            Container Spacing &amp; Component Radii
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-500 mb-1">
              Container Max Width ({spacing.containerMaxWidth}px)
            </label>
            <select
              value={spacing.containerMaxWidth}
              onChange={(e) => updateSpacing("containerMaxWidth", Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono"
            >
              <option value={1140}>1140px (Compact)</option>
              <option value={1280}>1280px (Standard 7XL)</option>
              <option value={1440}>1440px (Wide Screen)</option>
              <option value={1600}>1600px (Ultra Wide)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-500 mb-1">
              Card Border Radius ({borders.cardRadius}px)
            </label>
            <select
              value={borders.cardRadius}
              onChange={(e) => updateBorders("cardRadius", Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono"
            >
              <option value={0}>0px (Sharp Newsprint)</option>
              <option value={6}>6px (Subtle)</option>
              <option value={12}>12px (Modern Card)</option>
              <option value={16}>16px (Rounded)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-500 mb-1">
              Image Radius ({borders.imageRadius}px)
            </label>
            <select
              value={borders.imageRadius}
              onChange={(e) => updateBorders("imageRadius", Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono"
            >
              <option value={0}>0px (Square Photo)</option>
              <option value={6}>6px (Soft)</option>
              <option value={10}>10px (Standard)</option>
              <option value={16}>16px (Large)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-500 mb-1">
              Button Radius ({borders.buttonRadius}px)
            </label>
            <select
              value={borders.buttonRadius}
              onChange={(e) => updateBorders("buttonRadius", Number(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono"
            >
              <option value={0}>0px (Sharp)</option>
              <option value={6}>6px (Compact)</option>
              <option value={8}>8px (Standard)</option>
              <option value={12}>12px (Smooth)</option>
              <option value={9999}>Pill (Full Round)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
