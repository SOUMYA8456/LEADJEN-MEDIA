const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with PostgreSQL...");

  // Clean existing data
  await prisma.articleTag.deleteMany();
  await prisma.articleView.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.breakingNews.deleteMany();
  await prisma.liveUpdate.deleteMany();
  await prisma.photoGallery.deleteMany();
  await prisma.videoNews.deleteMany();
  await prisma.media.deleteMany();

  // 1. Create Users
  const superAdminPassword = await bcrypt.hash("adminpassword123", 10);
  const editorPassword = await bcrypt.hash("editorpassword123", 10);
  const reporterPassword = await bcrypt.hash("reporterpassword123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@leadjenmedia.com",
      passwordHash: superAdminPassword,
      name: "Leadjen Executive Editor",
      role: "SUPER_ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: "editor@leadjenmedia.com",
      passwordHash: editorPassword,
      name: "Priya Sengupta",
      role: "EDITOR",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    },
  });

  const reporterUser = await prisma.user.create({
    data: {
      email: "reporter@leadjenmedia.com",
      passwordHash: reporterPassword,
      name: "Karan Varma",
      role: "REPORTER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
  });

  // 2. Create Authors
  const author1 = await prisma.author.create({
    data: {
      name: "Leadjen Editorial Desk",
      slug: "leadjen-editorial-desk",
      designation: "Leadjen Special Investigations Unit",
      bio: "The core editorial team of Leadjen Media, reporting on verified global developments, strategic policy changes, and breaking events with editorial independence.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      email: "desk@leadjenmedia.com",
      twitter: "https://x.com/leadjenmedia",
      linkedin: "https://linkedin.com/company/leadjenmedia",
    },
  });

  const author2 = await prisma.author.create({
    data: {
      name: "Rajesh Sharma",
      slug: "rajesh-sharma",
      designation: "Senior Technology & Economy Editor",
      bio: "Veteran journalist covering India's digital transformation, semiconductor policies, AI governance, and macroeconomic shifts for over 15 years.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      email: "r.sharma@leadjenmedia.com",
      twitter: "https://x.com/rajesh_leadjen",
    },
  });

  const author3 = await prisma.author.create({
    data: {
      name: "Ananya Deshmukh",
      slug: "ananya-deshmukh",
      designation: "Chief Diplomatic & World Affairs Correspondent",
      bio: "Covering multilateral summits, geopolitics, trade pacts, and international relations across Asia, Europe, and the Middle East.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      email: "a.deshmukh@leadjenmedia.com",
      twitter: "https://x.com/ananya_leadjen",
    },
  });

  const author4 = await prisma.author.create({
    data: {
      name: "Vikramaditya Roy",
      slug: "vikramaditya-roy",
      designation: "National Politics & Governance Lead",
      bio: "Parliamentary analyst and governance tracker focused on electoral reforms, policy implementation, and federal developments.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
      email: "v.roy@leadjenmedia.com",
    },
  });

  // 3. Create Categories
  const categoriesData = [
    { name: "India", slug: "india", description: "National news, public policy, governance, and regional developments across India.", color: "#0B192C", order: 1 },
    { name: "World", slug: "world", description: "Global geopolitics, international diplomacy, conflicts, treaties, and major world events.", color: "#1E3E62", order: 2 },
    { name: "Politics", slug: "politics", description: "In-depth parliamentary coverage, political dynamics, elections, and civic affairs.", color: "#800020", order: 3 },
    { name: "Business", slug: "business", description: "Markets, corporate developments, startups, banking, investment, and macroeconomic indicators.", color: "#004080", order: 4 },
    { name: "Technology", slug: "technology", description: "Artificial Intelligence, semiconductors, cybersecurity, mobile innovation, and science-tech frontiers.", color: "#006699", order: 5 },
    { name: "Sports", slug: "sports", description: "Cricket, football, Olympics, motorsports, tournaments, player profiles, and tactical analyses.", color: "#008040", order: 6 },
    { name: "Entertainment", slug: "entertainment", description: "Cinema, streaming platforms, literature, arts, reviews, and cultural commentary.", color: "#993366", order: 7 },
    { name: "Health", slug: "health", description: "Medical research, public healthcare systems, wellness insights, nutrition, and longevity science.", color: "#2E8B57", order: 8 },
    { name: "Science", slug: "science", description: "Space exploration, renewable energy, biotechnology, climate science, and fundamental physics.", color: "#4B0082", order: 9 },
    { name: "Lifestyle", slug: "lifestyle", description: "Modern living, architecture, culinary traditions, design, fashion, and contemporary society.", color: "#A0522D", order: 10 },
    { name: "Travel", slug: "travel", description: "Destination guides, aviation updates, sustainable tourism, heritage routes, and travel culture.", color: "#2F4F4F", order: 11 },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 4. Create Tags
  const tagsData = ["AI & Automation", "Semiconductors", "Global Economy", "Digital India", "Space Mission", "Renewable Energy", "Elections 2026", "Cricket Cup", "Biotech", "Geopolitics"];
  const tags = {};
  for (const tagName of tagsData) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    tags[slug] = await prisma.tag.create({
      data: { name: tagName, slug },
    });
  }

  // 5. Create Sample Articles
  const articlesData = [
    {
      title: "India's High-Tech Manufacturing Surges as Global Semiconductor Hubs Expand Operations",
      slug: "indias-high-tech-manufacturing-surges-semiconductor-hubs-expand",
      subtitle: "New fabrication units in Gujarat and Karnataka begin initial phase production with major international technology partnerships.",
      excerpt: "India's push to become an indispensable global semiconductor powerhouse achieves a landmark milestone as state-of-the-art packaging and wafer facilities commence commercial trials.",
      content: `<p class="lead"><strong>NEW DELHI —</strong> In what industry observers describe as a pivotal shift for the global technology supply chain, India's high-tech manufacturing sector recorded a 34% year-on-year surge as major commercial semiconductor fabrication and packaging units commenced operational testing across key industrial corridors.</p>
      
      <p>The multibillion-dollar projects, established under the India Semiconductor Mission in partnership with leading global consortiums, are poised to supply mission-critical microchips for automotive, aerospace, telecom infrastructure, and high-performance computing systems.</p>
      
      <h3>Strategic Self-Reliance in Strategic Components</h3>
      <p>Speaking at the inaugural industrial summit, the Minister of Electronics and IT emphasized that resilience in microelectronics design and manufacturing is fundamental to modern economic sovereignty.</p>
      
      <blockquote>"Modern sovereignty begins with computing capability and resilient silicon supply chains. Our rapid expansion from design power to manufacturing capability establishes India as a trusted cornerstone of the global electronics ecosystem."</blockquote>
      
      <p>Over 12,000 highly specialized engineering jobs have been created across engineering campuses in Bengaluru, Hyderabad, and Noida, signaling a comprehensive talent pipeline integration with academic institutions.</p>
      
      <h3>Global Market Implications</h3>
      <p>International tech firms have welcomed the diversified manufacturing footprint, noting that geographic resilience prevents single-point failure bottlenecks that disrupted worldwide electronics production in previous years. As full-scale commercial volume scales by late 2026, export projections anticipate substantial contributions to national manufacturing output.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["technology"].id,
      authorId: author2.id,
      status: "PUBLISHED",
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      readingTime: 4,
      viewCount: 14250,
      likeCount: 890,
      publishedAt: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
      seoTitle: "India Semiconductor Manufacturing Surge 2026 | Leadjen Media",
      seoDescription: "Exclusive report on how India's semiconductor manufacturing corridor is reshaping the global high-tech supply chain.",
      ogImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Global Central Banks Signal Coordinated Shifts Amid Evolving Inflation Dynamics",
      slug: "global-central-banks-signal-coordinated-shifts-inflation-dynamics",
      subtitle: "Federal Reserve, European Central Bank, and Reserve Bank of India evaluate synchronized monetary policy adjustments.",
      excerpt: "Monetary policymakers gathered in Zurich announce nuanced adjustments in interest rate frameworks to balance robust employment figures with stable long-term price targets.",
      content: `<p class="lead"><strong>ZURICH —</strong> Central bank governors and senior economic advisors concluded a three-day closed-door symposium today, indicating a shared commitment toward calibrated monetary easing while maintaining vigilance over energy volatility.</p>
      
      <p>The joint communiqué highlighted that core inflation indicators across major emerging and developed economies have stabilized within historical target corridors, opening the runway for strategic capital investment in green energy and physical infrastructure.</p>
      
      <h3>Equities and Foreign Exchange Response</h3>
      <p>Global markets rallied in morning trading, with Asian benchmark indices gaining 1.4% and European indices edging upward. Investors responded positively to clear forward guidance and institutional stability.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["business"].id,
      authorId: author1.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: true,
      isTrending: true,
      readingTime: 3,
      viewCount: 9800,
      likeCount: 412,
      publishedAt: new Date(Date.now() - 1000 * 60 * 75), // 1 hour 15 mins ago
      seoTitle: "Global Central Banks Coordinate Monetary Shifts | Leadjen Media",
      seoDescription: "Comprehensive analysis of global interest rate outlooks and central bank strategies.",
    },
    {
      title: "New Diplomatic Accords Signed in Geneva to Accelerate Cross-Border Clean Energy Corridors",
      slug: "diplomatic-accords-geneva-cross-border-clean-energy-corridors",
      subtitle: "A coalition of 24 nations commits $180 billion in unified grid modernization and green hydrogen pipelines.",
      excerpt: "Diplomats and energy ministers finalize an ambitious international treaty to connect regional solar, offshore wind, and hydrogen networks across Eurasia.",
      content: `<p class="lead"><strong>GENEVA —</strong> After eighteen months of intensive technical negotiations, delegates representing 24 sovereign nations ratified the International Clean Energy Grid Accord at the Palais des Nations this morning.</p>
      
      <p>The landmark pact establishes shared regulatory standards, tariff harmonizations, and joint security protocols for high-voltage direct current (HVDC) power lines spanning from South Asia to Western Europe.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["world"].id,
      authorId: author3.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: true,
      readingTime: 5,
      viewCount: 8120,
      likeCount: 340,
      publishedAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      title: "Parliamentary Panel Recommends Comprehensive Digital Governance and Data Protection Framework",
      slug: "parliamentary-panel-recommends-digital-governance-data-protection",
      subtitle: "Bipartisan committee presents statutory guidelines on citizen algorithmic transparency and AI accountability.",
      excerpt: "A landmark parliamentary report outlines new statutory guardrails ensuring citizen data sovereignty while accelerating research access for public welfare applications.",
      content: `<p class="lead"><strong>NEW DELHI —</strong> In a unanimous parliamentary committee report tabled in the Lok Sabha, lawmakers recommended a modern statutory architecture for algorithmic audits, public registry transparency, and citizen consent enforcement.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["politics"].id,
      authorId: author4.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      readingTime: 4,
      viewCount: 6500,
      likeCount: 290,
      publishedAt: new Date(Date.now() - 1000 * 60 * 180),
    },
    {
      title: "Breakthrough in Deep-Space Optical Communications Achieves Record Data Transmission",
      slug: "breakthrough-deep-space-optical-communications-record-transmission",
      subtitle: "Space research agency successfully beams 4K ultra-high-definition scientific data across 220 million kilometers.",
      excerpt: "Engineers achieve a laser communications milestone that will enable real-time scientific telemetry and high-resolution imaging for future crewed interplanetary expeditions.",
      content: `<p class="lead"><strong>BENGALURU / PASADENA —</strong> Deep space laser communication has reached a transformative milestone with the successful downlink of continuous high-bandwidth laser packets over planetary distances.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["science"].id,
      authorId: author2.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: true,
      readingTime: 3,
      viewCount: 11200,
      likeCount: 780,
      publishedAt: new Date(Date.now() - 1000 * 60 * 240),
    },
    {
      title: "World Cricket Championship: Tactical Overhaul and Youth Influx Shape Squad Announcements",
      slug: "world-cricket-championship-tactical-overhaul-youth-influx",
      subtitle: "National selectors unveil dynamic lineup prioritizing versatile all-rounders and express pace depth.",
      excerpt: "With the marquee tournament just weeks away, selectors finalize a dynamic 15-member contingent blending battle-tested veterans with explosive young domestic performers.",
      content: `<p class="lead"><strong>MUMBAI —</strong> The national selection committee announced an athletic, high-tempo squad designed to maximize middle-overs run rates and fielding efficiency for the upcoming world tournament.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["sports"].id,
      authorId: author1.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: true,
      readingTime: 3,
      viewCount: 15400,
      likeCount: 1200,
      publishedAt: new Date(Date.now() - 1000 * 60 * 300),
    },
    {
      title: "Clinical Trials Confirm Next-Generation mRNA Therapeutics for Cardiovascular Inflammation",
      slug: "clinical-trials-confirm-mrna-therapeutics-cardiovascular-inflammation",
      subtitle: "Phase III multi-center trials reveal 48% reduction in recurrent arterial plaque formation.",
      excerpt: "Cardiology researchers present clinical findings showing targeted molecular interventions successfully reverse arterial stiffness with zero severe adverse events.",
      content: `<p class="lead"><strong>BOSTON / NEW DELHI —</strong> In what medical experts are calling the most significant preventive cardiology breakthrough in decades, Phase III trial data revealed remarkable therapeutic outcomes for chronic arterial inflammation.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["health"].id,
      authorId: author2.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      readingTime: 4,
      viewCount: 7300,
      likeCount: 420,
      publishedAt: new Date(Date.now() - 1000 * 60 * 360),
    },
    {
      title: "The Architectural Renaissance: How Biophilic Urban Design Is Reshaping Metropolises",
      slug: "architectural-renaissance-biophilic-urban-design-reshaping-metropolises",
      subtitle: "From vertical forests to microclimate cooling corridors, architects reimagine livable sustainable cities.",
      excerpt: "Leading urban planners integrate indigenous flora, natural airflow thermodynamics, and carbon-negative timber into modern civic infrastructure.",
      content: `<p class="lead"><strong>SINGAPORE / HYDERABAD —</strong> As global cities face rising temperatures and urban density challenges, a new wave of civic architecture is proving that high-density urbanism can coexist harmoniously with vibrant natural ecology.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["lifestyle"].id,
      authorId: author3.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      readingTime: 4,
      viewCount: 5200,
      likeCount: 310,
      publishedAt: new Date(Date.now() - 1000 * 60 * 420),
    },
    {
      title: "Remote Himalayas to Coastal Peninsulas: The Rise of Regenerative Cultural Travel",
      slug: "himalayas-coastal-peninsulas-rise-regenerative-cultural-travel",
      subtitle: "Discerning global travelers embrace community-owned homestays and heritage restoration journeys.",
      excerpt: "The tourism landscape witnesses a profound shift toward low-impact, high-enrichment voyages that directly empower indigenous artisans and ecological preserves.",
      content: `<p class="lead"><strong>LEH / KOCHI —</strong> Moving far beyond conventional tourism, a growing movement of conscious voyagers is choosing immersive stays that directly fund local heritage conservation and ecological restoration.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["travel"].id,
      authorId: author1.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      readingTime: 5,
      viewCount: 6800,
      likeCount: 450,
      publishedAt: new Date(Date.now() - 1000 * 60 * 480),
    },
    {
      title: "Independent Cinema and Digital Streaming: The Changing Economics of Storytelling",
      slug: "independent-cinema-digital-streaming-changing-economics-storytelling",
      subtitle: "Writers and independent filmmakers navigate evolving distribution models and AI production tools.",
      excerpt: "An in-depth look at how independent screenwriters, regional cinema directors, and international streaming platforms are forging sustainable creative ecosystems.",
      content: `<p class="lead"><strong>MUMBAI / LOS ANGELES —</strong> Creative storytelling is undergoing a structural paradigm shift as regional narratives find unprecedented global audiences via decentralized distribution networks.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
      categoryId: categories["entertainment"].id,
      authorId: author3.id,
      status: "PUBLISHED",
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      readingTime: 4,
      viewCount: 8900,
      likeCount: 520,
      publishedAt: new Date(Date.now() - 1000 * 60 * 540),
    },
  ];

  for (const article of articlesData) {
    await prisma.article.create({
      data: article,
    });
  }

  // 6. Breaking News Ticker Items
  const breakingItems = [
    { title: "India High-Tech Silicon Corridors Open Initial Commercial Trials in Bengaluru and Dholera", isLive: true, priority: 1, isActive: true },
    { title: "Global Central Banks Announce Synchronized Macroeconomic Policy Framework at Zurich Summit", isLive: false, priority: 2, isActive: true },
    { title: "24 Nations Ratify Geneva Clean Energy Grid Accord with $180 Billion Investment", isLive: false, priority: 3, isActive: true },
    { title: "Deep Space Optical Communications Beams 4K Scientific Telemetry Over 220M Kilometers", isLive: false, priority: 4, isActive: true },
  ];

  for (const item of breakingItems) {
    await prisma.breakingNews.create({ data: item });
  }

  // 7. Dynamic Advertisements
  const adsData = [
    {
      name: "Leadjen Executive Summit 2026",
      location: "TOP_LEADERBOARD",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=200&q=80",
      destinationUrl: "https://leadjenmedia.com/events/summit-2026",
      isActive: true,
    },
    {
      name: "Cloud Enterprise Solutions",
      location: "SIDEBAR_AD",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=500&q=80",
      destinationUrl: "https://leadjenmedia.com/cloud-solutions",
      isActive: true,
    },
    {
      name: "Global Wealth & Investment Journal",
      location: "IN_ARTICLE_AD",
      imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&h=250&q=80",
      destinationUrl: "https://leadjenmedia.com/wealth-management",
      isActive: true,
    },
    {
      name: "Sustainable Aviation Partner",
      location: "FOOTER_AD",
      imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&h=180&q=80",
      destinationUrl: "https://leadjenmedia.com/aviation",
      isActive: true,
    },
  ];

  for (const ad of adsData) {
    await prisma.advertisement.create({ data: ad });
  }

  // 8. Live Updates
  const liveUpdatesData = [
    {
      title: "Commercial Semiconductor Wafers Roll Out in Gujarat Fabrication Plant",
      content: "Official certification teams have verified the purity parameters for 28nm test silicon batches, paving the path for volume customer qualification.",
      authorName: "Rajesh Sharma",
      isUrgent: true,
      timestamp: "11:45 AM IST",
    },
    {
      title: "Ministry of Commerce Releases Quarterly Export Statistics",
      content: "High-technology electronics exports register 28.4% growth compared to the corresponding period last fiscal year.",
      authorName: "Leadjen Economic Desk",
      isUrgent: false,
      timestamp: "11:20 AM IST",
    },
    {
      title: "Zurich Financial Forum Concludes High-Level Deliberations",
      content: "Central bank representatives reaffirm liquidity assistance mechanisms to maintain smooth sovereign debt market operations.",
      authorName: "Ananya Deshmukh",
      isUrgent: false,
      timestamp: "10:55 AM IST",
    },
  ];

  for (const update of liveUpdatesData) {
    await prisma.liveUpdate.create({ data: update });
  }

  // 9. Video News
  const videoNewsData = [
    {
      title: "Inside India's State-of-the-Art Cleanroom Facilities: The Silicon Story",
      slug: "inside-indias-cleanroom-facilities-silicon-story",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "04:18",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
      category: "Technology",
    },
    {
      title: "Diplomatic Roundtable: How Trade Corridors Are Being Redefined in 2026",
      slug: "diplomatic-roundtable-trade-corridors-redefined",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "06:45",
      thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
      category: "World",
    },
    {
      title: "Future of Urban Architecture: Biophilic Skylines and Sustainable Living",
      slug: "future-of-urban-architecture-biophilic-skylines",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "03:30",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      category: "Lifestyle",
    },
  ];

  for (const video of videoNewsData) {
    await prisma.videoNews.create({ data: video });
  }

  // 10. Photo Galleries
  const photoGalleriesData = [
    {
      title: "High-Speed Rail and Megaprojects: Transforming National Transit",
      slug: "high-speed-rail-megaprojects-transforming-transit",
      description: "Visual documentation of new viaducts, automated tunneling systems, and ultra-modern passenger terminals across the country.",
      coverImage: "https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80",
      photographer: "Arjun Nambiar / Leadjen Visuals",
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80", caption: "High-speed rail corridor viaduct traversing western agricultural valleys.", photographer: "Arjun Nambiar" },
        { url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80", caption: "High-altitude engineering in northern mountain spans.", photographer: "Arjun Nambiar" },
        { url: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80", caption: "Modern multimodal transit terminal at dusk.", photographer: "Pooja Hegde" },
      ]),
    },
  ];

  for (const gallery of photoGalleriesData) {
    await prisma.photoGallery.create({ data: gallery });
  }

  console.log("Database seeded successfully with PostgreSQL data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
