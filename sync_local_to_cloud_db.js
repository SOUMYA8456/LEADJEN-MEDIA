const { PrismaClient } = require('@prisma/client');

const localPrisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres:postgres@127.0.0.1:5435/leadjen_news?schema=public" },
  },
});

const cloudDbUrl = "postgres://1053933f1d5725c40eecc45d597c4d44a619b7e8593f6dfccde796cc0a4dc31a:sk_sKtRAEQkq-w7ZrIZHyLI2@db.prisma.io:5432/postgres?sslmode=require";
const cloudPrisma = new PrismaClient({
  datasources: { db: { url: cloudDbUrl } },
});

async function syncLocalToCloud() {
  console.log("=================================================");
  console.log("SYNCING COMPLETE LOCAL DATASET TO CLOUD DATABASE");
  console.log("=================================================");

  // 1. Users
  const localUsers = await localPrisma.user.findMany();
  console.log(`Syncing ${localUsers.length} Users...`);
  for (const u of localUsers) {
    await cloudPrisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
        avatar: u.avatar,
        status: u.status,
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
        avatar: u.avatar,
        status: u.status,
      },
    });
  }

  // 2. Authors
  const localAuthors = await localPrisma.author.findMany();
  console.log(`Syncing ${localAuthors.length} Authors...`);
  for (const a of localAuthors) {
    await cloudPrisma.author.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        designation: a.designation,
        bio: a.bio,
        avatar: a.avatar,
        email: a.email,
        twitter: a.twitter,
        linkedin: a.linkedin,
      },
      create: {
        id: a.id,
        name: a.name,
        slug: a.slug,
        designation: a.designation,
        bio: a.bio,
        avatar: a.avatar,
        email: a.email,
        twitter: a.twitter,
        linkedin: a.linkedin,
      },
    });
  }

  // 3. Categories
  const localCategories = await localPrisma.category.findMany();
  console.log(`Syncing ${localCategories.length} Categories...`);
  for (const c of localCategories) {
    await cloudPrisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        color: c.color,
        order: c.order,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        color: c.color,
        order: c.order,
      },
    });
  }

  // 4. Articles
  const cloudCategories = await cloudPrisma.category.findMany();
  const cloudCatMap = new Map(cloudCategories.map(c => [c.slug, c.id]));

  const cloudAuthors = await cloudPrisma.author.findMany();
  const cloudAuthorMap = new Map(cloudAuthors.map(a => [a.slug, a.id]));

  const localArticles = await localPrisma.article.findMany({
    include: { category: true, author: true },
  });
  console.log(`Syncing ${localArticles.length} Articles...`);
  for (const art of localArticles) {
    const targetCatId = (art.category ? cloudCatMap.get(art.category.slug) : null) || cloudCategories[0].id;
    const targetAuthorId = (art.author ? cloudAuthorMap.get(art.author.slug) : null) || cloudAuthors[0].id;

    await cloudPrisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: targetCatId,
        authorId: targetAuthorId,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking,
        isTrending: art.isTrending,
        isVideo: art.isVideo,
        videoUrl: art.videoUrl,
        readingTime: art.readingTime,
        status: art.status,
        viewCount: art.viewCount,
        publishedAt: art.publishedAt,
        scheduledAt: art.scheduledAt,
      },
      create: {
        title: art.title,
        slug: art.slug,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: targetCatId,
        authorId: targetAuthorId,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking,
        isTrending: art.isTrending,
        isVideo: art.isVideo,
        videoUrl: art.videoUrl,
        readingTime: art.readingTime,
        status: art.status,
        viewCount: art.viewCount,
        publishedAt: art.publishedAt,
        scheduledAt: art.scheduledAt,
      },
    });
  }

  // 5. Breaking News
  const localBreaking = await localPrisma.breakingNews.findMany();
  console.log(`Syncing ${localBreaking.length} Breaking Bulletins...`);
  for (const b of localBreaking) {
    await cloudPrisma.breakingNews.upsert({
      where: { id: b.id },
      update: {
        title: b.title,
        link: b.link,
        isActive: b.isActive,
        priority: b.priority,
        expiresAt: b.expiresAt,
      },
      create: {
        id: b.id,
        title: b.title,
        link: b.link,
        isActive: b.isActive,
        priority: b.priority,
        expiresAt: b.expiresAt,
      },
    });
  }

  // 6. Advertisements
  const localAds = await localPrisma.advertisement.findMany();
  console.log(`Syncing ${localAds.length} Advertisements...`);
  for (const ad of localAds) {
    await cloudPrisma.advertisement.upsert({
      where: { id: ad.id },
      update: {
        name: ad.name,
        advertiser: ad.advertiser,
        location: ad.location,
        imageUrl: ad.imageUrl,
        desktopImage: ad.desktopImage,
        tabletImage: ad.tabletImage,
        mobileImage: ad.mobileImage,
        destinationUrl: ad.destinationUrl,
        status: ad.status,
        isActive: ad.isActive,
        priority: ad.priority,
        rotationMode: ad.rotationMode,
        startDate: ad.startDate,
        endDate: ad.endDate,
      },
      create: {
        id: ad.id,
        name: ad.name,
        advertiser: ad.advertiser,
        location: ad.location,
        imageUrl: ad.imageUrl,
        desktopImage: ad.desktopImage,
        tabletImage: ad.tabletImage,
        mobileImage: ad.mobileImage,
        destinationUrl: ad.destinationUrl,
        status: ad.status,
        isActive: ad.isActive,
        priority: ad.priority,
        rotationMode: ad.rotationMode,
        startDate: ad.startDate,
        endDate: ad.endDate,
      },
    });
  }

  // 7. Video News & Photo Gallery
  await cloudPrisma.videoNews.deleteMany().catch(() => {});
  await cloudPrisma.photoGallery.deleteMany().catch(() => {});

  const localVideos = await localPrisma.videoNews.findMany();
  for (const v of localVideos) {
    const vSlug = v.slug || v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await cloudPrisma.videoNews.create({
      data: {
        title: v.title,
        slug: vSlug,
        description: v.description,
        thumbnail: v.thumbnail,
        videoUrl: v.videoUrl,
        duration: v.duration,
        publishedAt: v.publishedAt,
      },
    });
  }

  const localPhotos = await localPrisma.photoGallery.findMany();
  for (const p of localPhotos) {
    const pSlug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await cloudPrisma.photoGallery.create({
      data: {
        title: p.title,
        slug: pSlug,
        description: p.description,
        coverImage: p.coverImage,
        images: p.images,
        publishedAt: p.publishedAt,
      },
    });
  }

  // 8. Homepage Sections
  const localSections = await localPrisma.homepageSection.findMany({
    include: { manualArticles: true, category: true },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`Syncing ${localSections.length} Homepage Sections...`);

  // Clear existing cloud sections and sync fresh
  await cloudPrisma.homepageSectionArticle.deleteMany().catch(() => {});
  await cloudPrisma.homepageSection.deleteMany().catch(() => {});

  for (const s of localSections) {
    const targetSectionCatId = s.category ? cloudCatMap.get(s.category.slug) : null;

    const created = await cloudPrisma.homepageSection.create({
      data: {
        name: s.name,
        type: s.type,
        title: s.title,
        subtitle: s.subtitle,
        categoryId: targetSectionCatId,
        storyLimit: s.storyLimit,
        layout: s.layout,
        contentSource: s.contentSource,
        desktopCols: s.desktopCols,
        tabletCols: s.tabletCols,
        mobileCols: s.mobileCols,
        background: s.background,
        borders: s.borders,
        spacing: s.spacing,
        showImages: s.showImages,
        showExcerpt: s.showExcerpt,
        showAuthor: s.showAuthor,
        showDate: s.showDate,
        customSettings: s.customSettings,
        enabled: s.enabled,
        isDraft: false, // Ensure marked as published
        sortOrder: s.sortOrder,
      },
    });

    if (s.manualArticles && s.manualArticles.length > 0) {
      for (const ma of s.manualArticles) {
        // Find corresponding article in cloud
        const localArt = await localPrisma.article.findUnique({ where: { id: ma.articleId } });
        if (localArt) {
          const cloudArt = await cloudPrisma.article.findUnique({ where: { slug: localArt.slug } });
          if (cloudArt) {
            await cloudPrisma.homepageSectionArticle.create({
              data: {
                sectionId: created.id,
                articleId: cloudArt.id,
                sortOrder: ma.sortOrder,
              },
            }).catch(() => {});
          }
        }
      }
    }
  }

  // 9. Site Settings & Initial Homepage Version Snapshot
  const localSettings = await localPrisma.siteSettings.findFirst();
  if (localSettings) {
    await cloudPrisma.siteSettings.upsert({
      where: { id: localSettings.id },
      update: {
        siteName: localSettings.siteName,
        tagline: localSettings.tagline,
        logoText: localSettings.logoText,
        headerNavItems: localSettings.headerNavItems,
        footerColumns: localSettings.footerColumns,
        breakingNewsSpeed: localSettings.breakingNewsSpeed,
        showLiveButton: localSettings.showLiveButton,
        showSearchButton: localSettings.showSearchButton,
      },
      create: {
        id: localSettings.id,
        siteName: localSettings.siteName,
        tagline: localSettings.tagline,
        logoText: localSettings.logoText,
        headerNavItems: localSettings.headerNavItems,
        footerColumns: localSettings.footerColumns,
        breakingNewsSpeed: localSettings.breakingNewsSpeed,
        showLiveButton: localSettings.showLiveButton,
        showSearchButton: localSettings.showSearchButton,
      },
    });
  }

  // Fetch all created sections in cloud with relations for snapshot
  const syncedCloudSections = await cloudPrisma.homepageSection.findMany({
    include: {
      category: true,
      manualArticles: {
        include: {
          article: {
            include: { category: true, author: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  await cloudPrisma.homepageVersion.create({
    data: {
      name: "Production Live Release Snapshot",
      snapshot: JSON.stringify(syncedCloudSections),
      publishedBy: "Leadjen Executive Editor",
      publishedAt: new Date(),
    },
  });

  console.log("✓ Created Initial Published HomepageVersion snapshot in Cloud DB.");
  console.log("=================================================");
  console.log("ALL LOCAL DATASETS SUCCESSFULLY SYNCED TO CLOUD!");
  console.log("=================================================");

  await localPrisma.$disconnect();
  await cloudPrisma.$disconnect();
}

syncLocalToCloud().catch(err => {
  console.error("Sync error:", err);
  process.exit(1);
});
