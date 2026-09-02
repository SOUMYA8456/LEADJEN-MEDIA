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

export interface SiteBuilderConfig {
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
    defaultHeroLimit: number;
    defaultGridColumns: number;
    showSidebar: boolean;
    showFeaturedStory: boolean;
    showMostRead: boolean;
    showAdBanner: boolean;
    showNewsletter: boolean;
    categoryOverrides?: Record<
      string,
      {
        heroLimit?: number;
        latestLimit?: number;
        showSidebar?: boolean;
        showAdBanner?: boolean;
        showMostRead?: boolean;
      }
    >;
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

export const DEFAULT_SITE_BUILDER_CONFIG: SiteBuilderConfig = {
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
    logoHeightDesktop: 32,
    logoHeightMobile: 26,
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
