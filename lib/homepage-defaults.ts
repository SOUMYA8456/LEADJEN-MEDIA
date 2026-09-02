import prisma from "@/lib/db";

export async function ensureDefaultHomepageSections(): Promise<void> {
  const existingCount = await prisma.homepageSection.count();
  if (existingCount > 0) return;

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  const defaultSections = [
    {
      name: "Special Leadjen Video Brief",
      type: "VIDEO_BRIEF",
      title: "SPECIAL LEADJEN VIDEO BRIEF",
      subtitle: "Executive video dispatches and verified newsroom briefings",
      enabled: true,
      sortOrder: 0,
      layout: "video-brief",
      contentSource: "VIDEO",
      background: "warm-white",
      borders: "bottom",
    },
    {
      name: "Breaking News & Trending Ticker",
      type: "BREAKING_TICKER",
      title: "BREAKING",
      enabled: true,
      sortOrder: 1,
      layout: "ticker",
      contentSource: "BREAKING",
      customSettings: JSON.stringify({ speed: 35, showCategory: true }),
      background: "white",
      borders: "bottom",
    },
    {
      name: "Main Editorial Hero",
      type: "HERO",
      title: "Lead Stories",
      subtitle: "Top investigative reports and developing headlines",
      enabled: true,
      sortOrder: 2,
      layout: "hero-3col",
      contentSource: "FEATURED",
      storyLimit: 5,
      customSettings: JSON.stringify({
        leftArticlesCount: 3,
        showRightVideo: true,
        showSidebarAd: true,
      }),
      background: "white",
      borders: "bottom",
      showImages: true,
      showExcerpt: true,
      showAuthor: true,
      showDate: true,
    },
    {
      name: "Secondary Headlines Grid",
      type: "NEWS_GRID",
      title: "Developing Reports",
      subtitle: "Critical updates from national and international bureaus",
      enabled: true,
      sortOrder: 3,
      layout: "four-col",
      contentSource: "LATEST",
      storyLimit: 4,
      desktopCols: 4,
      tabletCols: 2,
      mobileCols: 1,
      background: "white",
      borders: "bottom",
      showImages: true,
      showExcerpt: false,
      showAuthor: true,
      showDate: true,
    },
  ];

  // Add category sections dynamically from database
  let currentSort = 4;
  const categoryConfigs = [
    { slug: "india", layout: "three-col", limit: 3 },
    { slug: "world", layout: "featured-split", limit: 4 },
    { slug: "politics", layout: "featured-split", limit: 4 },
    { slug: "business", layout: "three-col", limit: 3 },
    { slug: "technology", layout: "featured-split", limit: 4 },
    { slug: "sports", layout: "three-col", limit: 3 },
    { slug: "entertainment", layout: "three-col", limit: 3 },
    { slug: "health", layout: "three-col", limit: 3 },
    { slug: "science", layout: "featured-split", limit: 4 },
    { slug: "lifestyle", layout: "featured-split", limit: 4 },
    { slug: "travel", layout: "three-col", limit: 3 },
  ];

  for (const catConf of categoryConfigs) {
    const catId = categoryMap.get(catConf.slug);
    const catName = categories.find((c) => c.slug === catConf.slug)?.name || catConf.slug.toUpperCase();
    if (catId) {
      defaultSections.push({
        name: `${catName} Section`,
        type: "CATEGORY_SECTION",
        title: catName.toUpperCase(),
        subtitle: `In-depth reporting and continuous analysis on ${catName}`,
        enabled: true,
        sortOrder: currentSort++,
        layout: catConf.layout,
        contentSource: "CATEGORY",
        categoryId: catId,
        storyLimit: catConf.limit,
        background: "white",
        borders: "bottom",
        showImages: true,
        showExcerpt: true,
        showAuthor: true,
        showDate: true,
        showCategory: true,
        showViewAll: true,
        viewAllUrl: `/${catConf.slug}`,
      } as any);
    }
  }

  // Multimedia & Latest News & Newsletter in Exact Editorial Sequence
  defaultSections.push(
    {
      name: "Leadjen Video Journalism",
      type: "VIDEO",
      title: "LEADJEN VIDEO JOURNALISM",
      subtitle: "On-the-ground visual reports and special briefings",
      enabled: true,
      sortOrder: currentSort++,
      layout: "video-grid",
      contentSource: "VIDEO",
      storyLimit: 3,
      background: "warm-white",
      borders: "bottom",
      showImages: true,
      showExcerpt: true,
      showAuthor: true,
      showDate: true,
    } as any,
    {
      name: "Leadjen Photo Journalism",
      type: "PHOTO_GALLERY",
      title: "LEADJEN PHOTO JOURNALISM",
      subtitle: "Powerful photo essays capturing moments that define history",
      enabled: true,
      sortOrder: currentSort++,
      layout: "gallery-grid",
      contentSource: "PHOTO",
      storyLimit: 3,
      background: "white",
      borders: "bottom",
      showImages: true,
      showExcerpt: true,
      showAuthor: true,
      showDate: true,
    } as any,
    {
      name: "Latest News Timeline Wire",
      type: "LATEST_NEWS",
      title: "LATEST NEWS",
      subtitle: "Real-time timeline of verified news dispatches",
      enabled: true,
      sortOrder: currentSort++,
      layout: "latest-split",
      contentSource: "LATEST",
      storyLimit: 6,
      customSettings: JSON.stringify({
        showMostReadSidebar: true,
        mostReadLimit: 5,
      }),
      background: "white",
      borders: "bottom",
      showImages: true,
      showExcerpt: true,
      showAuthor: true,
      showDate: true,
    } as any,
    {
      name: "Leadjen Editorial Dispatch",
      type: "EDITORIAL_DISPATCH",
      title: "GET THE NEWS THAT MATTERS",
      subtitle: "Daily headlines, critical investigative stories, global markets, and policy insights delivered directly to your inbox every morning.",
      enabled: true,
      sortOrder: currentSort++,
      layout: "newsletter-box",
      contentSource: "LATEST",
      storyLimit: 0,
      customSettings: JSON.stringify({
        badge: "LEADJEN EDITORIAL DISPATCH",
        placeholder: "Enter your email address...",
        buttonText: "SUBSCRIBE",
        supportingText: "Zero spam. Unsubscribe anytime. Verified editorial dispatch.",
      }),
      background: "dark",
      borders: "none",
      showImages: false,
      showExcerpt: false,
      showAuthor: false,
      showDate: false,
    } as any
  );

  // Seed default sections in transaction
  await prisma.$transaction(
    defaultSections.map((sec) =>
      prisma.homepageSection.create({
        data: sec as any,
      })
    )
  );

  // Initialize SiteSettings if not exists
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    const navItems = [
      { name: "HOME", href: "/", isVisible: true, order: 0 },
      { name: "INDIA", href: "/india", isVisible: true, order: 1 },
      { name: "WORLD", href: "/world", isVisible: true, order: 2 },
      { name: "POLITICS", href: "/politics", isVisible: true, order: 3 },
      { name: "BUSINESS", href: "/business", isVisible: true, order: 4 },
      { name: "TECHNOLOGY", href: "/technology", isVisible: true, order: 5 },
      { name: "SPORTS", href: "/sports", isVisible: true, order: 6 },
      { name: "ENTERTAINMENT", href: "/entertainment", isVisible: true, order: 7 },
      { name: "HEALTH", href: "/health", isVisible: true, order: 8 },
      { name: "SCIENCE", href: "/science", isVisible: true, order: 9 },
      { name: "LIFESTYLE", href: "/lifestyle", isVisible: true, order: 10 },
      { name: "TRAVEL", href: "/travel", isVisible: true, order: 11 },
    ];

    const footerCols = [
      {
        title: "EDITORIAL SECTIONS",
        links: [
          { label: "India News", url: "/india" },
          { label: "World Affairs", url: "/world" },
          { label: "Politics & Policy", url: "/politics" },
          { label: "Business & Economy", url: "/business" },
          { label: "Technology & AI", url: "/technology" },
          { label: "Sports", url: "/sports" },
        ],
      },
      {
        title: "MULTIMEDIA & FEATURES",
        links: [
          { label: "Live Newsroom", url: "/live" },
          { label: "Video Broadcasts", url: "/videos" },
          { label: "Photo Galleries", url: "/photos" },
          { label: "Investigative Reports", url: "/politics" },
          { label: "Opinion & Analysis", url: "/technology" },
        ],
      },
      {
        title: "LEADJEN NETWORK",
        links: [
          { label: "About Leadjen Media", url: "/about" },
          { label: "Editorial Code of Ethics", url: "/ethics" },
          { label: "Leadership & Bureau", url: "/authors" },
          { label: "Press Dispatches", url: "/press" },
          { label: "Careers in Journalism", url: "/careers" },
        ],
      },
      {
        title: "LEGAL & STANDARDS",
        links: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Corrections Policy", url: "/corrections" },
          { label: "Advertise With Us", url: "/advertise" },
          { label: "Contact Bureau", url: "/contact" },
        ],
      },
    ];

    await prisma.siteSettings.create({
      data: {
        id: "default",
        siteName: "LEADJEN MEDIA",
        tagline: "Independent journalism. Important stories.",
        logoText: "LEADJEN MEDIA",
        headerNavItems: JSON.stringify(navItems),
        footerColumns: JSON.stringify(footerCols),
        breakingNewsSpeed: 35,
        showLiveButton: true,
        showSearchButton: true,
      },
    });
  }
}
