const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

let dbUrl = process.env.DATABASE_URL;

if (fs.existsSync('.env.vercel')) {
  const envContent = fs.readFileSync('.env.vercel', 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
    }
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

async function runBackup() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `leadjen_backup_${timestamp}.json`);

  console.log('========================================================');
  console.log('LEADJEN MEDIA — PRODUCTION DATABASE BACKUP UTILITY');
  console.log('========================================================\n');
  console.log(`Snapshot Target: ${backupFile}`);

  try {
    const [
      users,
      categories,
      authors,
      articles,
      advertisements,
      breakingNews,
      liveCoverages,
      liveUpdates,
      homepageSections,
      homepageVersions,
      seoSettings,
      siteSettings,
      pages,
      siteBuilderVersions,
      media,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } }),
      prisma.category.findMany(),
      prisma.author.findMany(),
      prisma.article.findMany(),
      prisma.advertisement.findMany(),
      prisma.breakingNews.findMany(),
      prisma.liveCoverage.findMany(),
      prisma.liveUpdate.findMany(),
      prisma.homepageSection.findMany(),
      prisma.homepageVersion.findMany(),
      prisma.seoSettings.findMany(),
      prisma.siteSettings.findMany(),
      prisma.page.findMany(),
      prisma.siteBuilderVersion.findMany(),
      prisma.media.findMany(),
    ]);

    const backupPayload = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        categories: categories.length,
        authors: authors.length,
        articles: articles.length,
        advertisements: advertisements.length,
        breakingNews: breakingNews.length,
        liveCoverages: liveCoverages.length,
        liveUpdates: liveUpdates.length,
        homepageSections: homepageSections.length,
        homepageVersions: homepageVersions.length,
        seoSettings: seoSettings.length,
        siteSettings: siteSettings.length,
        pages: pages.length,
        siteBuilderVersions: siteBuilderVersions.length,
        media: media.length,
      },
      data: {
        users,
        categories,
        authors,
        articles,
        advertisements,
        breakingNews,
        liveCoverages,
        liveUpdates,
        homepageSections,
        homepageVersions,
        seoSettings,
        siteSettings,
        pages,
        siteBuilderVersions,
        media,
      },
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupPayload, null, 2));

    console.log('\n✓ Database Snapshot successfully created!');
    console.log(`  - Total Articles: ${articles.length}`);
    console.log(`  - Total Categories: ${categories.length}`);
    console.log(`  - Total Authors: ${authors.length}`);
    console.log(`  - Total Advertisements: ${advertisements.length}`);
    console.log(`  - Total Static Pages: ${pages.length}`);
    console.log(`  - Total Site Builder Versions: ${siteBuilderVersions.length}`);
    console.log(`  - Total Media Items: ${media.length}`);
    console.log(`  - Destination: ${backupFile}\n`);
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
