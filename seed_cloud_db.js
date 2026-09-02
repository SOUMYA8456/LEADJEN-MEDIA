const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const cloudDbUrl = "postgres://1053933f1d5725c40eecc45d597c4d44a619b7e8593f6dfccde796cc0a4dc31a:sk_sKtRAEQkq-w7ZrIZHyLI2@db.prisma.io:5432/postgres?sslmode=require";
const prisma = new PrismaClient({
  datasources: { db: { url: cloudDbUrl } },
});

async function seedCloud() {
  console.log("Seeding Prisma Postgres Cloud Database...");

  const passwordHash = await bcrypt.hash("adminpassword123", 10);
  const editorHash = await bcrypt.hash("editorpassword123", 10);
  const reporterHash = await bcrypt.hash("reporterpassword123", 10);

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@leadjenmedia.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: {
      email: "admin@leadjenmedia.com",
      name: "Leadjen Executive Editor",
      passwordHash,
      role: "SUPER_ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
  });

  await prisma.user.upsert({
    where: { email: "editor@leadjenmedia.com" },
    update: { role: "EDITOR", passwordHash: editorHash },
    create: {
      email: "editor@leadjenmedia.com",
      name: "Priya Nair",
      passwordHash: editorHash,
      role: "EDITOR",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    },
  });

  await prisma.user.upsert({
    where: { email: "reporter@leadjenmedia.com" },
    update: { role: "REPORTER", passwordHash: reporterHash },
    create: {
      email: "reporter@leadjenmedia.com",
      name: "Aarav Sharma",
      passwordHash: reporterHash,
      role: "REPORTER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
  });

  // 2. Authors
  const authorsData = [
    {
      name: "Arjun Sen",
      slug: "arjun-sen",
      designation: "Senior Geopolitical Analyst",
      bio: "Covering diplomatic relations, international trade pacts, and South Asian defense strategies for over 15 years.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Meera Krishnan",
      slug: "meera-krishnan",
      designation: "Technology & AI Correspondent",
      bio: "Investigating silicon supply chains, semiconductor manufacturing, and transformative artificial intelligence infrastructure.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Rohan Mehta",
      slug: "rohan-mehta",
      designation: "Financial Markets & Policy Editor",
      bio: "Focusing on macroeconomic indicators, Reserve Bank monetary policy, and global sovereign debt markets.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    },
  ];

  const authors = [];
  for (const a of authorsData) {
    const author = await prisma.author.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
    authors.push(author);
  }

  // 3. Categories
  const categoriesData = [
    { name: "INDIA", slug: "india", order: 1 },
    { name: "WORLD", slug: "world", order: 2 },
    { name: "POLITICS", slug: "politics", order: 3 },
    { name: "BUSINESS", slug: "business", order: 4 },
    { name: "TECHNOLOGY", slug: "technology", order: 5 },
    { name: "SPORTS", slug: "sports", order: 6 },
    { name: "ENTERTAINMENT", slug: "entertainment", order: 7 },
    { name: "HEALTH", slug: "health", order: 8 },
    { name: "SCIENCE", slug: "science", order: 9 },
    { name: "LIFESTYLE", slug: "lifestyle", order: 10 },
    { name: "TRAVEL", slug: "travel", order: 11 },
  ];

  const categories = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    categories[c.slug] = cat;
  }

  // 4. Articles
  const articlesData = [
    {
      title: "India Expands High-Speed Strategic Rail Corridors Connecting Key Industrial Logistics Hubs",
      slug: "india-high-speed-rail-corridors-expansion",
      subtitle: "Cabinet approves ₹72,000-crore infrastructural corridor accelerating freight transit times by 40%.",
      excerpt: "The comprehensive rail infrastructure overhaul establishes four high-capacity freight arteries connecting western deep-water ports directly to central manufacturing zones.",
      content: `The Union Cabinet on Tuesday formally approved an ambitious ₹72,000-crore infrastructure package dedicated to constructing four dedicated high-speed freight corridors.\n\n### Strategic Industrial Alignment\n\nSpanning across five key states, the initiative integrates seamlessly with the national logistics framework to compress inter-state transit latency and curb reliance on diesel cargo transport.\n\n"This capital allocation reflects our structural commitment to modernising multi-modal logistics across peninsular India," stated senior infrastructure planners.\n\n### Environmental and Economic Impact\n\nPreliminary economic forecasts suggest the rail corridor network will curtail industrial shipping costs by up to 28% over the next decade while eliminating approximately 14 million metric tons of carbon emissions annually.`,
      featuredImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=700&q=80",
      categorySlug: "india",
      authorSlug: "arjun-sen",
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      status: "PUBLISHED",
      viewCount: 142850,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 2),
    },
    {
      title: "Global Central Banks Coordinate Liquidity Frameworks Amid Shifts in Sovereign Bond Yields",
      slug: "global-central-banks-sovereign-bond-yields",
      subtitle: "Multilateral fiscal authorities agree on precautionary currency swap buffers to preserve liquidity.",
      excerpt: "Coordinated monetary discussions conclude in Basel with central governors establishing contingent liquidity swap lines.",
      content: `Major central banks across Asia, Europe, and North America have formalized a framework for reciprocal currency stabilization.\n\nFinancial markets responded favorably to the announcement, with 10-year sovereign bond spreads contracting across benchmark global indices.\n\nSenior monetary analysts noted that proactive liquidity agreements significantly diminish tail-risk vulnerabilities across emerging market capital channels.`,
      featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&h=700&q=80",
      categorySlug: "business",
      authorSlug: "rohan-mehta",
      isFeatured: true,
      isTrending: true,
      status: "PUBLISHED",
      viewCount: 98400,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 4),
    },
    {
      title: "Next-Generation Photonic Computing Architecture Achieves Unprecedented Optical Efficiency",
      slug: "next-gen-photonic-computing-optical-efficiency",
      subtitle: "Breakthrough silicon-integrated photonic circuits demonstrate 100x lower energy consumption for complex AI inference.",
      excerpt: "Researchers demonstrate optical tensor processing units operating at near-zero thermal latency, paving the way for sustainable hyperscale AI supercomputing.",
      content: `A consortium of semiconductor research laboratories has announced a landmark achievement in integrated silicon photonics.\n\nBy routing data packets via phase-modulated laser waveforms directly on-chip, the optical computing array accomplishes matrix multiplication at fractions of traditional electrical dissipation.\n\nCommercial fabrication partnerships are slated to commence trial tape-outs by late 2026.`,
      featuredImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=700&q=80",
      categorySlug: "technology",
      authorSlug: "meera-krishnan",
      isFeatured: true,
      isTrending: true,
      status: "PUBLISHED",
      viewCount: 87300,
      publishedAt: new Date(Date.now() - 3600 * 1000 * 6),
    },
  ];

  for (const art of articlesData) {
    const author = authors.find(a => a.slug === art.authorSlug) || authors[0];
    const category = categories[art.categorySlug] || categories["india"];

    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: category.id,
        authorId: author.id,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking || false,
        isTrending: art.isTrending || false,
        status: art.status,
        viewCount: art.viewCount,
        publishedAt: art.publishedAt,
      },
      create: {
        title: art.title,
        slug: art.slug,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: category.id,
        authorId: author.id,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking || false,
        isTrending: art.isTrending || false,
        status: art.status,
        viewCount: art.viewCount,
        publishedAt: art.publishedAt,
      },
    });
  }

  // 5. Breaking News
  await prisma.breakingNews.upsert({
    where: { id: "seed-breaking-1" },
    update: {
      title: "Union Cabinet approves ₹72,000-crore National Rail Freight Logistics Master Plan.",
      isActive: true,
      priority: "HIGH",
    },
    create: {
      id: "seed-breaking-1",
      title: "Union Cabinet approves ₹72,000-crore National Rail Freight Logistics Master Plan.",
      isActive: true,
      priority: "HIGH",
    },
  });

  // 6. Top Leaderboard Advertisement
  await prisma.advertisement.upsert({
    where: { id: "seed-top-ad-1" },
    update: {
      name: "Global Technology & Financial Summit 2026",
      advertiser: "FinTech World",
      location: "TOP_LEADERBOARD",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
      desktopImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
      destinationUrl: "https://leadjenmedia.com",
      status: "ACTIVE",
      isActive: true,
      priority: 100,
    },
    create: {
      id: "seed-top-ad-1",
      name: "Global Technology & Financial Summit 2026",
      advertiser: "FinTech World",
      location: "TOP_LEADERBOARD",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
      desktopImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
      destinationUrl: "https://leadjenmedia.com",
      status: "ACTIVE",
      isActive: true,
      priority: 100,
    },
  });

  console.log("✓ Cloud database successfully seeded with Admin, Authors, Categories, Articles, Breaking Ticker, and Ads.");
  await prisma.$disconnect();
}

seedCloud().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
