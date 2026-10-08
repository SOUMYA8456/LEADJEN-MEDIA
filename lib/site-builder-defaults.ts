/**
 * Leadjen Media — Comprehensive Site Builder Configuration & Defaults
 * Strict Black / White / Gray / Red visual system. ZERO BLUE.
 */

export interface NavItemConfig {
  id: string;
  name: string;
  href: string;
  categorySlug?: string;
  isVisible: boolean;
  order: number;
  isMegaMenu?: boolean;
  openInNewTab?: boolean;
}

export interface DesignColorsConfig {
  primary: string;
  secondary: string;
  accentRed: string;
  background: string;
  surface: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  mutedText: string;
  borderColor: string;
  darkBackground: string;
  darkSurface: string;
  darkCard: string;
  darkTextPrimary: string;
  darkTextSecondary: string;
  darkBorderColor: string;
}

export interface DesignTypographyConfig {
  headingFont: string;
  bodyFont: string;
  uiFont: string;
  h1Desktop: number;
  h1Tablet: number;
  h1Mobile: number;
  h1LineHeight: number;
  h2Desktop: number;
  h2Tablet: number;
  h2Mobile: number;
  h2LineHeight: number;
  h3Desktop: number;
  h3Tablet: number;
  h3Mobile: number;
  h3LineHeight: number;
  h4Desktop: number;
  h4Tablet: number;
  h4Mobile: number;
  h4LineHeight: number;
  bodyDesktop: number;
  bodyTablet: number;
  bodyMobile: number;
  bodyLineHeight: number;
  metaSize: number;
  dropCapEnabled: boolean;
}

export interface DesignSpacingConfig {
  containerMaxWidth: number;
  pagePaddingDesktop: number;
  pagePaddingTablet: number;
  pagePaddingMobile: number;
  sectionGapDesktop: number;
  sectionGapTablet: number;
  sectionGapMobile: number;
  cardGap: number;
}

export interface DesignBordersConfig {
  borderWidth: number;
  cardRadius: number;
  imageRadius: number;
  buttonRadius: number;
}

export interface DesignSystemConfig {
  colors: DesignColorsConfig;
  typography: DesignTypographyConfig;
  spacing: DesignSpacingConfig;
  borders: DesignBordersConfig;
}

export interface CategoryOverrideConfig {
  layoutStyle?: "split-hero" | "magazine-grid" | "editorial-list" | "compact-wire";
  heroLimit?: number;
  latestLimit?: number;
  gridColumns?: number;
  showSidebar?: boolean;
  showAdBanner?: boolean;
  showMostRead?: boolean;
}

export interface SiteBuilderConfig {
  design: DesignSystemConfig;
  global: {
    siteName: string;
    siteLogo: string;
    mobileLogo: string;
    favicon: string;
    tagline: string;
    siteDescription: string;
    defaultSocialImage: string;
    copyrightText: string;
    timezone: string;
    contactEmail: string;
    contactPhone: string;
    socialLinks: {
      twitter: string;
      linkedin: string;
      facebook: string;
      youtube: string;
    };
  };
  header: {
    logoHeightDesktop: number;
    logoHeightMobile: number;
    stickyHeader: boolean;
    showLiveButton: boolean;
    showSearchButton: boolean;
    showClock: boolean;
    clockFormat: "12h" | "24h";
    clockTimezone: string;
    clockLabel: string;
    headerAnnouncement: string;
    showAnnouncement: boolean;
    headerAdEnabled: boolean;
  };
  navigation: {
    items: NavItemConfig[];
  };
  categories: {
    layoutStyle: "split-hero" | "magazine-grid" | "editorial-list" | "compact-wire";
    defaultHeroLimit: number;
    defaultGridColumns: number;
    showSidebar: boolean;
    showFeaturedStory: boolean;
    showMostRead: boolean;
    showAdBanner: boolean;
    showNewsletter: boolean;
    categoryOverrides?: Record<string, CategoryOverrideConfig>;
  };
  article: {
    showBreadcrumbs: boolean;
    showReadingProgressBar: boolean;
    showAuthorBio: boolean;
    showUpdatedDate: boolean;
    showSocialShare: boolean;
    showComments: boolean;
    showRelatedStories: boolean;
    showMostReadSidebar: boolean;
    showNewsletterBox: boolean;
    showDropCap: boolean;
    showReadingTimeBadge: boolean;
    showCategoryTags: boolean;
    showAuthorAvatar: boolean;
    relatedStoriesLimit: number;
    enableStickySidebar: boolean;
    topAdEnabled: boolean;
    middleAdEnabled: boolean;
    bottomAdEnabled: boolean;
    sidebarAdEnabled: boolean;
  };
  live: {
    showLiveTicker: boolean;
    showLiveHeaderBanner: boolean;
    showSidebarAd: boolean;
    showRelatedLiveStories: boolean;
    timelineOrder: "newest_first" | "oldest_first";
  };
  videos: {
    featuredVideoEnabled: boolean;
    videosPerPage: number;
    gridColumns: number;
    showSidebar: boolean;
    showAdBanner: boolean;
  };
  photos: {
    featuredGalleryEnabled: boolean;
    galleriesPerPage: number;
    gridColumns: number;
    showCaptions: boolean;
    showPhotographerCredit: boolean;
    showAdBanner: boolean;
  };
  search: {
    resultsPerPage: number;
    showSidebar: boolean;
    showAdBanner: boolean;
  };
  authors: {
    showBio: boolean;
    showSocialLinks: boolean;
    articlesPerPage: number;
    showSidebarAd: boolean;
  };
  footer: {
    showWhiteLogo: boolean;
    description: string;
    showSocialLinks: boolean;
    showNewsletter: boolean;
    showBackToTop: boolean;
    copyrightText: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; url: string }>;
    }>;
  };
  error404: {
    heading: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    showLatestStories: boolean;
    showPopularStories: boolean;
    showSearchBox: boolean;
  };
}

export const DEFAULT_DESIGN_SYSTEM: DesignSystemConfig = {
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
  typography: {
    headingFont: "Georgia, Cambria, 'Times New Roman', Times, serif",
    bodyFont: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
    uiFont: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
    h1Desktop: 44,
    h1Tablet: 36,
    h1Mobile: 28,
    h1LineHeight: 1.15,
    h2Desktop: 32,
    h2Tablet: 26,
    h2Mobile: 22,
    h2LineHeight: 1.2,
    h3Desktop: 22,
    h3Tablet: 20,
    h3Mobile: 18,
    h3LineHeight: 1.3,
    h4Desktop: 18,
    h4Tablet: 16,
    h4Mobile: 15,
    h4LineHeight: 1.4,
    bodyDesktop: 16,
    bodyTablet: 15,
    bodyMobile: 14,
    bodyLineHeight: 1.6,
    metaSize: 12,
    dropCapEnabled: true,
  },
  spacing: {
    containerMaxWidth: 1280,
    pagePaddingDesktop: 24,
    pagePaddingTablet: 16,
    pagePaddingMobile: 12,
    sectionGapDesktop: 48,
    sectionGapTablet: 36,
    sectionGapMobile: 24,
    cardGap: 20,
  },
  borders: {
    borderWidth: 1,
    cardRadius: 12,
    imageRadius: 10,
    buttonRadius: 8,
  },
};

export const DEFAULT_SITE_BUILDER_CONFIG: SiteBuilderConfig = {
  design: DEFAULT_DESIGN_SYSTEM,
  global: {
    siteName: "LEADJEN MEDIA",
    siteLogo: "/images/logo-white.png",
    mobileLogo: "/images/logo-white.png",
    favicon: "/favicon.ico",
    tagline: "Independent journalism. Important stories.",
    siteDescription: "Leading digital news portal covering India, World Affairs, Politics, Business, Technology, Science, and Sports.",
    defaultSocialImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80",
    copyrightText: `© ${new Date().getFullYear()} LEADJEN MEDIA NEWS. All rights reserved.`,
    timezone: "Asia/Kolkata",
    contactEmail: "editorial@leadjenmedia.com",
    contactPhone: "+91 (0) 11 4982 3000",
    socialLinks: {
      twitter: "https://x.com/leadjenmedia",
      linkedin: "https://linkedin.com/company/leadjenmedia",
      facebook: "https://facebook.com/leadjenmedia",
      youtube: "https://youtube.com/leadjenmedia",
    },
  },
  header: {
    logoHeightDesktop: 36,
    logoHeightMobile: 28,
    stickyHeader: true,
    showLiveButton: true,
    showSearchButton: true,
    showClock: true,
    clockFormat: "12h",
    clockTimezone: "Asia/Kolkata",
    clockLabel: "IST",
    headerAnnouncement: "LIVE: Special Coverage from Leadjen Diplomatic Wire",
    showAnnouncement: false,
    headerAdEnabled: true,
  },
  navigation: {
    items: [
      { id: "nav_1", name: "HOME", href: "/", isVisible: true, order: 1 },
      { id: "nav_2", name: "INDIA", href: "/india", categorySlug: "india", isVisible: true, order: 2, isMegaMenu: true },
      { id: "nav_3", name: "WORLD", href: "/world", categorySlug: "world", isVisible: true, order: 3, isMegaMenu: true },
      { id: "nav_4", name: "POLITICS", href: "/politics", categorySlug: "politics", isVisible: true, order: 4 },
      { id: "nav_5", name: "BUSINESS", href: "/business", categorySlug: "business", isVisible: true, order: 5, isMegaMenu: true },
      { id: "nav_6", name: "TECHNOLOGY", href: "/technology", categorySlug: "technology", isVisible: true, order: 6, isMegaMenu: true },
      { id: "nav_7", name: "SPORTS", href: "/sports", categorySlug: "sports", isVisible: true, order: 7 },
      { id: "nav_8", name: "VIDEOS", href: "/videos", isVisible: true, order: 8 },
      { id: "nav_9", name: "PHOTOS", href: "/photos", isVisible: true, order: 9 },
      { id: "nav_10", name: "LIVE DESK", href: "/live", isVisible: true, order: 10 },
    ],
  },
  categories: {
    layoutStyle: "split-hero",
    defaultHeroLimit: 1,
    defaultGridColumns: 3,
    showSidebar: true,
    showFeaturedStory: true,
    showMostRead: true,
    showAdBanner: true,
    showNewsletter: true,
    categoryOverrides: {},
  },
  article: {
    showBreadcrumbs: true,
    showReadingProgressBar: true,
    showAuthorBio: true,
    showUpdatedDate: true,
    showSocialShare: true,
    showComments: true,
    showRelatedStories: true,
    showMostReadSidebar: true,
    showNewsletterBox: true,
    showDropCap: true,
    showReadingTimeBadge: true,
    showCategoryTags: true,
    showAuthorAvatar: true,
    relatedStoriesLimit: 3,
    enableStickySidebar: true,
    topAdEnabled: true,
    middleAdEnabled: true,
    bottomAdEnabled: true,
    sidebarAdEnabled: true,
  },
  live: {
    showLiveTicker: true,
    showLiveHeaderBanner: true,
    showSidebarAd: true,
    showRelatedLiveStories: true,
    timelineOrder: "newest_first",
  },
  videos: {
    featuredVideoEnabled: true,
    videosPerPage: 12,
    gridColumns: 3,
    showSidebar: true,
    showAdBanner: true,
  },
  photos: {
    featuredGalleryEnabled: true,
    galleriesPerPage: 12,
    gridColumns: 3,
    showCaptions: true,
    showPhotographerCredit: true,
    showAdBanner: true,
  },
  search: {
    resultsPerPage: 20,
    showSidebar: true,
    showAdBanner: true,
  },
  authors: {
    showBio: true,
    showSocialLinks: true,
    articlesPerPage: 15,
    showSidebarAd: true,
  },
  footer: {
    showWhiteLogo: true,
    description: "Independent journalism. Important stories. Providing authoritative coverage on national affairs, international relations, technology, and global markets.",
    showSocialLinks: true,
    showNewsletter: true,
    showBackToTop: true,
    copyrightText: `© ${new Date().getFullYear()} LEADJEN MEDIA NEWS. All rights reserved.`,
    columns: [
      {
        title: "News",
        links: [
          { label: "India", url: "/india" },
          { label: "World", url: "/world" },
          { label: "Politics", url: "/politics" },
          { label: "Business", url: "/business" },
          { label: "Technology", url: "/technology" },
          { label: "Sports", url: "/sports" },
        ],
      },
      {
        title: "Multimedia",
        links: [
          { label: "Live Desk", url: "/live" },
          { label: "Video Reports", url: "/videos" },
          { label: "Photo Galleries", url: "/photos" },
          { label: "Breaking Wire", url: "/breaking" },
        ],
      },
      {
        title: "Editorial",
        links: [
          { label: "About Us", url: "/about" },
          { label: "Editorial Policy", url: "/editorial-policy" },
          { label: "Corrections Policy", url: "/corrections-policy" },
          { label: "Contact Us", url: "/contact" },
        ],
      },
      {
        title: "Legal & Corporate",
        links: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Cookie Policy", url: "/cookie-policy" },
          { label: "Advertise With Us", url: "/advertise" },
        ],
      },
    ],
  },
  error404: {
    heading: "Story Not Found",
    description: "The news dispatch or editorial page you requested could not be located. It may have been relocated or updated by our editorial desk.",
    buttonText: "Return to Homepage",
    buttonUrl: "/",
    showLatestStories: true,
    showPopularStories: true,
    showSearchBox: true,
  },
};

/**
 * Generate dynamic CSS custom properties from the active SiteBuilderConfig
 */
export function generateThemeCss(config?: Partial<SiteBuilderConfig>): string {
  const d = config?.design || DEFAULT_DESIGN_SYSTEM;
  const colors = d.colors || DEFAULT_DESIGN_SYSTEM.colors;
  const typo = d.typography || DEFAULT_DESIGN_SYSTEM.typography;
  const spacing = d.spacing || DEFAULT_DESIGN_SYSTEM.spacing;
  const borders = d.borders || DEFAULT_DESIGN_SYSTEM.borders;

  return `
:root {
  --bg-primary: ${colors.background || "#ffffff"};
  --bg-secondary: ${colors.surface || "#f8f9fa"};
  --bg-card: ${colors.card || "#ffffff"};
  --text-primary: ${colors.textPrimary || "#0a0a0a"};
  --text-secondary: ${colors.textSecondary || "#52525b"};
  --text-muted: ${colors.mutedText || "#71717a"};
  --border-color: ${colors.borderColor || "#e4e4e7"};
  --leadjen-primary: ${colors.primary || "#1E1B1A"};
  --leadjen-secondary: ${colors.secondary || "#2d2726"};
  --leadjen-red: ${colors.accentRed || "#cc0000"};
  --leadjen-black: ${colors.textPrimary || "#0a0a0a"};

  --font-heading: ${typo.headingFont || "Georgia, serif"};
  --font-body: ${typo.bodyFont || "inherit"};
  --font-ui: ${typo.uiFont || "inherit"};

  --h1-size: ${typo.h1Desktop || 44}px;
  --h1-lh: ${typo.h1LineHeight || 1.15};
  --h2-size: ${typo.h2Desktop || 32}px;
  --h2-lh: ${typo.h2LineHeight || 1.2};
  --h3-size: ${typo.h3Desktop || 22}px;
  --h3-lh: ${typo.h3LineHeight || 1.3};
  --h4-size: ${typo.h4Desktop || 18}px;
  --h4-lh: ${typo.h4LineHeight || 1.4};
  --body-size: ${typo.bodyDesktop || 16}px;
  --body-lh: ${typo.bodyLineHeight || 1.6};
  --meta-size: ${typo.metaSize || 12}px;

  --container-max-width: ${spacing.containerMaxWidth || 1280}px;
  --page-padding: ${spacing.pagePaddingDesktop || 24}px;
  --section-gap: ${spacing.sectionGapDesktop || 48}px;
  --card-gap: ${spacing.cardGap || 20}px;

  --border-width: ${borders.borderWidth || 1}px;
  --radius-card: ${borders.cardRadius || 12}px;
  --radius-image: ${borders.imageRadius || 10}px;
  --radius-button: ${borders.buttonRadius || 8}px;
}

.dark {
  --bg-primary: ${colors.darkBackground || "#0a0a0a"};
  --bg-secondary: ${colors.darkSurface || "#141414"};
  --bg-card: ${colors.darkCard || "#18181b"};
  --text-primary: ${colors.darkTextPrimary || "#f4f4f5"};
  --text-secondary: ${colors.darkTextSecondary || "#a1a1aa"};
  --border-color: ${colors.darkBorderColor || "#27272a"};
  --leadjen-primary: #ffffff;
  --leadjen-black: #ffffff;
}

@media (max-width: 1024px) {
  :root {
    --h1-size: ${typo.h1Tablet || 36}px;
    --h2-size: ${typo.h2Tablet || 26}px;
    --h3-size: ${typo.h3Tablet || 20}px;
    --h4-size: ${typo.h4Tablet || 16}px;
    --body-size: ${typo.bodyTablet || 15}px;
    --page-padding: ${spacing.pagePaddingTablet || 16}px;
    --section-gap: ${spacing.sectionGapTablet || 36}px;
  }
}

@media (max-width: 640px) {
  :root {
    --h1-size: ${typo.h1Mobile || 28}px;
    --h2-size: ${typo.h2Mobile || 22}px;
    --h3-size: ${typo.h3Mobile || 18}px;
    --h4-size: ${typo.h4Mobile || 15}px;
    --body-size: ${typo.bodyMobile || 14}px;
    --page-padding: ${spacing.pagePaddingMobile || 12}px;
    --section-gap: ${spacing.sectionGapMobile || 24}px;
  }
}

h1, .font-heading-h1 {
  font-family: var(--font-heading) !important;
  font-size: var(--h1-size);
  line-height: var(--h1-lh);
}
h2, .font-heading-h2 {
  font-family: var(--font-heading) !important;
  font-size: var(--h2-size);
  line-height: var(--h2-lh);
}
h3, .font-heading-h3 {
  font-family: var(--font-heading) !important;
  font-size: var(--h3-size);
  line-height: var(--h3-lh);
}
h4, .font-heading-h4 {
  font-family: var(--font-heading) !important;
  font-size: var(--h4-size);
  line-height: var(--h4-lh);
}
${
  typo.dropCapEnabled !== false
    ? `
.article-content p:first-of-type::first-letter {
  font-size: 3.5rem;
  line-height: 0.8;
  float: left;
  margin-top: 0.15rem;
  margin-right: 0.75rem;
  font-family: var(--font-heading, Georgia, serif);
  font-weight: 700;
  color: var(--text-primary);
}
`
    : `
.article-content p:first-of-type::first-letter {
  font-size: inherit !important;
  line-height: inherit !important;
  float: none !important;
  margin: 0 !important;
  font-family: inherit !important;
  font-weight: inherit !important;
}
`
}
`;
}
