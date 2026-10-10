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

export interface ServiceItemConfig {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  icon?: string;
  image?: string;
  url: string;
  badge?: string;
  features?: string[];
  isVisible: boolean;
  order: number;
}

export interface AdvertisingSectionConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  specs?: string;
  placementTag?: string;
  features: string[];
  benefits?: string[];
  pricingNote?: string;
  icon?: string;
  isVisible: boolean;
  order: number;
}

export interface AdvertisingPageConfig {
  heroHeading: string;
  heroSubheading: string;
  heroDescription: string;
  ctaText: string;
  ctaDestination: string;
  contactEmail: string;
  contactPhone: string;
  downloadKitUrl?: string;
  sections: AdvertisingSectionConfig[];
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
  services: {
    items: ServiceItemConfig[];
  };
  advertising: AdvertisingPageConfig;
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
    bodyFont: "'LINESeedJP', 'LINE Seed JP', var(--font-sans), sans-serif",
    uiFont: "'LINESeedJP', 'LINE Seed JP', var(--font-sans), sans-serif",
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

export const DEFAULT_SERVICES: ServiceItemConfig[] = [
  {
    id: "service_1",
    title: "About Leadjen Media",
    slug: "about",
    url: "/about",
    description: "The premier independent digital newsroom delivering investigative journalism, policy breakdowns, and global analysis.",
    longDescription: "Leadjen Media Daily operates as an independent, non-partisan digital news organization dedicated to investigative rigour, high-fidelity financial dispatches, geopolitical analysis, and multimedia broadcasting. We serve an engaged community of policymakers, corporate executives, innovators, and readers across India and the global diaspora.",
    badge: "Flagship Media",
    icon: "Globe",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Independent & Non-Partisan Newsroom",
      "Investigative Deep Dives & Policy Briefs",
      "24/7 Live Desk & Breaking News Wire",
      "National & International Bureau Network",
    ],
    isVisible: true,
    order: 1,
  },
  {
    id: "service_2",
    title: "Digital Marketing Agency",
    slug: "digital-marketing-agency",
    url: "/services/digital-marketing-agency",
    description: "Performance-driven digital marketing, audience acquisition, programmatic ad campaigns, and full-funnel brand growth.",
    longDescription: "Leadjen Media Digital Marketing Agency fuses editorial authority with precision growth marketing. We engineer bespoke programmatic campaigns, search engine domination strategies, and conversion funnels that position brands directly in front of high-intent executive and consumer audiences.",
    badge: "Growth & Media",
    icon: "TrendingUp",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Data-Backed Programmatic Advertising",
      "High-Intent Executive Audience Targeting",
      "Editorial SEO & Search Engine Dominance",
      "Full-Funnel Performance & Conversion Strategy",
    ],
    isVisible: true,
    order: 2,
  },
  {
    id: "service_3",
    title: "Media House",
    slug: "media-house",
    url: "/services/media-house",
    description: "End-to-end multimedia publishing, 24/7 broadcasting capabilities, newsroom syndication, and digital distribution.",
    longDescription: "As a full-stack contemporary Media House, Leadjen Media powers turnkey journalistic production, digital asset creation, news wire syndication, and broadcast infrastructure. We deliver end-to-end media operations for corporate giants, institutional bodies, and publishing networks.",
    badge: "Broadcasting Hub",
    icon: "Layers",
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80",
    features: [
      "24/7 Live Newsroom Operations",
      "Turnkey Broadcast & Studio Production",
      "Cross-Platform Global Syndication",
      "Institutional Media Management",
    ],
    isVisible: true,
    order: 3,
  },
  {
    id: "service_4",
    title: "Podcasting Venture",
    slug: "podcasting-venture",
    url: "/services/podcasting-venture",
    description: "Studio-grade audio journalism, narrative storytelling podcasts, executive interviews, and global distribution across Apple & Spotify.",
    longDescription: "The Leadjen Media Audio Network crafts narrative documentary audio, weekly policy debates, business insights, and executive spotlight podcasts. From sound engineering and acoustic recording to distribution across Apple Podcasts, Spotify, and YouTube Audio, we produce premier audio journalism.",
    badge: "Audio Studio",
    icon: "Headphones",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Acoustically Treated Studio Recording",
      "Narrative & Investigative Audio Scripting",
      "Host Curation & Executive Guest Booking",
      "Worldwide Syndication on Apple & Spotify",
    ],
    isVisible: true,
    order: 4,
  },
  {
    id: "service_5",
    title: "News Blog",
    slug: "news-blog",
    url: "/services/news-blog",
    description: "Rapid editorial commentary, verified industry blogs, niche vertical analysis, and real-time thought leadership.",
    longDescription: "Our News Blog vertical delivers high-velocity, analytical blog posts that deconstruct breaking headlines, economic developments, tech breakthroughs, and cultural trends in real time with journalistic integrity and crisp, readable prose.",
    badge: "Fast Editorial",
    icon: "BookOpen",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Rapid Real-Time Editorial Turnaround",
      "Search-Optimized Topical Analysis",
      "Authoritative Industry Insights",
      "High-Engagement Reader Commentary",
    ],
    isVisible: true,
    order: 5,
  },
  {
    id: "service_6",
    title: "News Article",
    slug: "news-article",
    url: "/services/news-article",
    description: "Journalistic investigative reports, deep-dive features, press dispatches, and peer-reviewed news articles.",
    longDescription: "Leadjen Media produces award-caliber news reporting, on-the-ground investigations, data-driven feature articles, and verified dispatches. Every article is rigorously fact-checked, sourced, and formatted to international journalistic standards.",
    badge: "Investigative",
    icon: "FileText",
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
    features: [
      "On-the-Ground Investigative Journalism",
      "Multi-Source Fact Verification",
      "Structured NewsArticle Schema & SEO",
      "Google News & RSS Feed Syndication",
    ],
    isVisible: true,
    order: 6,
  },
  {
    id: "service_7",
    title: "Celebrity Interview",
    slug: "celebrity-interview",
    url: "/services/celebrity-interview",
    description: "Exclusive one-on-one video and longform editorial dialogues with industry titans, celebrities, policymakers, and cultural icons.",
    longDescription: "We host high-impact, candid conversations with visionary leaders, film and sports personalities, startup unicorn founders, and senior cabinet ministers. Our interview formats span high-definition multi-camera studio shoots and longform editorial features.",
    badge: "Exclusive Spotlight",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Exclusive High-Profile Access & Booking",
      "Multi-Camera 4K Studio Interview Setups",
      "Dual Video & Print Longform Formats",
      "Viral Cutdowns for Social Channels",
    ],
    isVisible: true,
    order: 7,
  },
  {
    id: "service_8",
    title: "Photoshoot",
    slug: "photoshoot",
    url: "/services/photoshoot",
    description: "Commercial, editorial, and portrait photography sessions executed by award-winning photojournalists and creative directors.",
    longDescription: "From executive boardroom portraits and high-fashion spreads to documentary field photo essays, our photography desk delivers high-resolution imagery with masterful lighting, composition, and post-production color grading.",
    badge: "Visual Excellence",
    icon: "Camera",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Editorial & Executive Portraiture",
      "Commercial Brand Visual Campaigns",
      "On-Location Field & Studio Setups",
      "Master Color Grading & High-Res Retouching",
    ],
    isVisible: true,
    order: 8,
  },
  {
    id: "service_9",
    title: "Videography",
    slug: "videography",
    url: "/services/videography",
    description: "Cinematic 4K brand documentaries, broadcast commercial video, news reels, event cinematography, and post-production.",
    longDescription: "The Leadjen Media Visual Production unit creates cinematic 4K documentaries, brand stories, commercial reels, and event coverage. Our directors, cinematographers, and editors handle everything from scriptwriting to final master delivery.",
    badge: "4K Production",
    icon: "Video",
    image: "https://images.unsplash.com/photo-1579632652988-6f9bc84050e5?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Cinema-Grade 4K Field Production",
      "Documentary Storyboarding & Scripting",
      "Sound Design, Foley & Motion Graphics",
      "Fast-Turnaround Multi-Format Delivery",
    ],
    isVisible: true,
    order: 9,
  },
  {
    id: "service_10",
    title: "Personal Branding",
    slug: "personal-branding",
    url: "/services/personal-branding",
    description: "Strategic reputation sculpting, executive digital positioning, press profiling, and thought leadership for CXOs and founders.",
    longDescription: "We build and amplify the personal authority of founders, industry leaders, and public figures. Through strategic editorial op-eds, social executive presence, podcast appearances, and keynote profiling, we turn leaders into recognized industry authorities.",
    badge: "Executive Profile",
    icon: "Users",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Executive Digital Positioning Strategy",
      "High-Profile Op-Ed & Article Authoring",
      "Press Interview & Keynote Placements",
      "Search & Knowledge Graph Optimization",
    ],
    isVisible: true,
    order: 10,
  },
  {
    id: "service_11",
    title: "Personal Relationship Management",
    slug: "personal-relationship-management",
    url: "/services/personal-relationship-management",
    description: "Confidential high-stakes public relations, crisis management, stakeholder communications, and high-network media relations.",
    longDescription: "Our Personal Relationship Management desk provides discreet, white-glove public relations advisory, reputation defense, stakeholder messaging, and strategic media alignment for high-profile individuals, family offices, and enterprise leaders.",
    badge: "Strategic PR & Comms",
    icon: "Shield",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Confidential White-Glove PR Advisory",
      "Crisis Communications & Narrative Defense",
      "High-Stakes Stakeholder Relations",
      "Direct Senior Editor & Media Alignment",
    ],
    isVisible: true,
    order: 11,
  },
];

export const DEFAULT_ADVERTISING_CONFIG: AdvertisingPageConfig = {
  heroHeading: "ADVERTISE WITH LEADJEN MEDIA DAILY",
  heroSubheading: "Partner with India's Premier Digital News & Intelligence Platform",
  heroDescription: "Connect your brand directly with over 420,000 monthly verified business leaders, policymakers, investors, technology pioneers, and engaged readers across high-impact digital placements.",
  ctaText: "Request Media Kit & Consultation",
  ctaDestination: "#inquiry-form",
  contactEmail: "advertise@leadjenmedia.com",
  contactPhone: "+91 (0) 11 4982 3000",
  downloadKitUrl: "/media-kit-2026.pdf",
  sections: [
    {
      id: "ad_homepage",
      title: "Homepage Advertising",
      subtitle: "Prime Digital Real Estate Above the Fold",
      description: "Secure the most prominent front-page positions across Leadjen Media Daily. Deliver your brand message immediately above the fold to executive and institutional readers.",
      specs: "728x90 Desktop Leaderboard, 320x100 Mobile Banner, 1200x250 Masthead Interstitial",
      placementTag: "FRONT PAGE HERO & MASTHEAD",
      features: [
        "Unrivaled front-page visibility",
        "Exclusive 100% Share-of-Voice (SOV) options",
        "Dynamic device targeting (Desktop/Mobile)",
        "Real-time audited impression metrics",
      ],
      isVisible: true,
      order: 1,
    },
    {
      id: "ad_banner",
      title: "Banner Ads",
      subtitle: "High-Impact Responsive Display Units Across All Desks",
      description: "Standardized IAB-compliant banner placements across all category indices, article sidebars, and sticky footer units.",
      specs: "300x250 MPU, 300x600 Half-Page, 728x90 Leaderboard, 320x50 Mobile Sticky",
      placementTag: "NETWORK DISPLAY",
      features: [
        "IAB-standard high-impact formats",
        "Full desktop, tablet, and mobile responsiveness",
        "Targeting by editorial section and geography",
        "Verified human traffic with 0 click fraud",
      ],
      isVisible: true,
      order: 2,
    },
    {
      id: "ad_article",
      title: "Article Page Advertising",
      subtitle: "Contextual Mid-Story & In-Reading Insertion",
      description: "Reach readers at peak engagement as they consume longform investigative journalism, market breakdowns, and breaking policy dispatches.",
      specs: "Mid-Article Content Insertion (728x90 or 300x250), Sticky Sidebar Unit",
      placementTag: "IN-READING CONTEXTUAL",
      features: [
        "Maximum dwell time & reader immersion",
        "Contextual topic alignment with stories",
        "Non-intrusive editorial aesthetic",
        "High click-through engagement rates",
      ],
      isVisible: true,
      order: 3,
    },
    {
      id: "ad_category",
      title: "Category Page Advertising",
      subtitle: "Vertical-Specific Desk Sponsorships",
      description: "Sponsor specific editorial desks (e.g. Technology & AI, Business & Economy, Politics & Policy, World Affairs, Sports) to hyper-target specific industry professionals.",
      specs: "Category Header Leaderboard, Category Sidebar Sponsor Box",
      placementTag: "VERTICAL SPONSORSHIP",
      features: [
        "Industry-specific audience concentration",
        "Category masthead co-branding",
        "Exclusive category sponsor badge",
        "Category newsletter inclusion bundle",
      ],
      isVisible: true,
      order: 4,
    },
    {
      id: "ad_sponsored",
      title: "Sponsored Content",
      subtitle: "Authoritative Brand Journalism & Native Storytelling",
      description: "Tell your brand story with the craft, credibility, and authority of Leadjen Media's editorial voice. Published in-stream alongside daily news dispatches.",
      specs: "Full Article Feature (1,000–2,500 words), Custom Photography, DoFollow SEO Links",
      placementTag: "NATIVE JOURNALISM",
      features: [
        "Authored by experienced journalists",
        "Permanent digital index & Google News inclusion",
        "Social media amplification across Leadjen networks",
        "Brand storytelling aligned with news standards",
      ],
      isVisible: true,
      order: 5,
    },
    {
      id: "ad_video",
      title: "Video Advertising",
      subtitle: "Pre-Roll, Mid-Roll & Video Hub Sponsorships",
      description: "High-definition video advertising embedded across Leadjen Video Journalism broadcasts, executive video briefs, and documentary releases.",
      specs: "15s / 30s Non-Skippable Pre-Roll, Full Video Broadcast Sponsorship",
      placementTag: "HD BROADCAST",
      features: [
        "1080p / 4K Player Integration",
        "Audio-on default engagement",
        "Companion banner overlay with direct link",
        "Custom video reporting analytics",
      ],
      isVisible: true,
      order: 6,
    },
    {
      id: "ad_newsletter",
      title: "Newsletter Advertising",
      subtitle: "Direct-to-Inbox Leadjen Editorial Dispatch",
      description: "Direct access to our verified subscriber base of CXOs, founders, diplomats, and investors delivered daily at 07:00 AM IST.",
      specs: "Exclusive Top Header Banner (600x120), Sponsored Feature Paragraph + CTA",
      placementTag: "DIRECT EMAIL DISPATCH",
      features: [
        "48%+ Verified Open Rate",
        "Direct inbox placement with zero spam filtering",
        "Exclusive single-sponsor per daily edition",
        "High-intent decision-maker readership",
      ],
      isVisible: true,
      order: 7,
    },
    {
      id: "ad_partnerships",
      title: "Brand Partnerships",
      subtitle: "Strategic Multi-Month Brand Collaborations",
      description: "Comprehensive co-branded initiatives, custom survey reports, special editorial series sponsorships, and executive roundtables.",
      specs: "Multi-Channel 3–12 Month Campaign with Dedicated Landing Hubs",
      placementTag: "ENTERPRISE ALLIANCE",
      features: [
        "Dedicated custom co-branded landing hub",
        "Omnichannel multimedia syndication",
        "Executive podcast guest spot integration",
        "Exclusive category lock-out options",
      ],
      isVisible: true,
      order: 8,
    },
    {
      id: "ad_custom",
      title: "Custom Campaigns",
      subtitle: "Bespoke High-Impact Media Strategies",
      description: "Tailor-made promotional campaigns combining digital takeovers, podcast sponsorships, video documentary co-production, and PR syndication.",
      specs: "Custom Scope & Milestone-Based Deliverables",
      placementTag: "BESPOKE MEDIA",
      features: [
        "Dedicated senior campaign director",
        "Custom visual, video & editorial asset creation",
        "Real-time campaign performance dashboard",
        "Global multi-channel distribution",
      ],
      isVisible: true,
      order: 9,
    },
  ],
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
    copyrightText: `© ${new Date().getFullYear()} LEADJEN MEDIA. All rights reserved. Registered Digital News Publisher.`,
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
    copyrightText: `© ${new Date().getFullYear()} LEADJEN MEDIA. All rights reserved. Registered Digital News Publisher.`,
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
        title: "About Leadjen Media",
        links: [
          { label: "About Leadjen Media", url: "/about" },
          { label: "Digital Marketing Agency", url: "/services/digital-marketing-agency" },
          { label: "Media House", url: "/services/media-house" },
          { label: "Podcasting Venture", url: "/services/podcasting-venture" },
          { label: "Celebrity Interview", url: "/services/celebrity-interview" },
          { label: "Personal Branding", url: "/services/personal-branding" },
        ],
      },
      {
        title: "Legal & Advertising",
        links: [
          { label: "Advertise With Us", url: "/advertise" },
          { label: "Editorial Policy", url: "/editorial-policy" },
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Contact Bureau", url: "/contact" },
        ],
      },
    ],
  },
  services: {
    items: DEFAULT_SERVICES,
  },
  advertising: DEFAULT_ADVERTISING_CONFIG,
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
  --font-sans: ${typo.bodyFont || "'LINESeedJP', 'LINE Seed JP', sans-serif"};
  --font-body: ${typo.bodyFont || "'LINESeedJP', 'LINE Seed JP', sans-serif"};
  --font-ui: ${typo.uiFont || "'LINESeedJP', 'LINE Seed JP', sans-serif"};

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
