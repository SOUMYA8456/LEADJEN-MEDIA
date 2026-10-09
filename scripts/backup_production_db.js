const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function resolveProdDbUrl(customDbUrl = null) {
  if (customDbUrl) return customDbUrl;
  if (process.env.PRODUCTION_DATABASE_URL) return process.env.PRODUCTION_DATABASE_URL;
  if (fs.existsSync('.env.vercel')) {
    const envContent = fs.readFileSync('.env.vercel', 'utf8');
    for (const line of envContent.split('\n')) {
      if (line.startsWith('DATABASE_URL=')) {
        return line.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
      }
    }
  }
  return process.env.DATABASE_URL;
}

async function backupProductionDatabase(customDbUrl = null) {
  const dbUrl = resolveProdDbUrl(customDbUrl);

  if (!dbUrl) {
    throw new Error('No DATABASE_URL or PRODUCTION_DATABASE_URL provided.');
  }

  const maskedHost = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `prod_backup_${timestamp}.json`);

  console.log('================================================================');
  console.log('LEADJEN MEDIA — PRODUCTION DATABASE PRE-MIGRATION BACKUP');
  console.log('================================================================');
  console.log(`Connecting to: ${maskedHost}`);

  try {
    const [
      users,
      authors,
      categories,
      tags,
      articles,
      articleTags,
      advertisements,
      breakingNews,
      liveCoverage,
      liveUpdates,
      auditLogs,
      homepageSections,
      homepageSectionArticles,
      siteSettings,
      seoSettings,
      comments,
      pages,
      media
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.author.findMany(),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.article.findMany(),
      prisma.articleTag.findMany(),
      prisma.advertisement.findMany(),
      prisma.breakingNews.findMany(),
      prisma.liveCoverage.findMany(),
      prisma.liveUpdate.findMany(),
      prisma.auditLog.findMany(),
      prisma.homepageSection.findMany(),
      prisma.homepageSectionArticle.findMany(),
      prisma.siteSettings.findMany(),
      prisma.seoSettings.findMany(),
      prisma.comment.findMany(),
      prisma.page.findMany(),
      prisma.media.findMany()
    ]);

    const backupData = {
      metadata: {
        environment: 'VERCEL_PRODUCTION',
        targetHost: maskedHost,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      },
      counts: {
        users: users.length,
        authors: authors.length,
        categories: categories.length,
        tags: tags.length,
        articles: articles.length,
        articleTags: articleTags.length,
        advertisements: advertisements.length,
        breakingNews: breakingNews.length,
        liveCoverage: liveCoverage.length,
        liveUpdates: liveUpdates.length,
        auditLogs: auditLogs.length,
        homepageSections: homepageSections.length,
        homepageSectionArticles: homepageSectionArticles.length,
        siteSettings: siteSettings.length,
        seoSettings: seoSettings.length,
        comments: comments.length,
        pages: pages.length,
        media: media.length
      },
      data: {
        users,
        authors,
        categories,
        tags,
        articles,
        articleTags,
        advertisements,
        breakingNews,
        liveCoverage,
        liveUpdates,
        auditLogs,
        homepageSections,
        homepageSectionArticles,
        siteSettings,
        seoSettings,
        comments,
        pages,
        media
      }
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
    const fileSizeKB = (fs.statSync(backupFile).size / 1024).toFixed(2);

    console.log(`✔ Production backup successfully created: ${path.basename(backupFile)} (${fileSizeKB} KB)`);
    console.log('Record Summary:', JSON.stringify(backupData.counts, null, 2));

    return { success: true, backupFile, counts: backupData.counts };
  } catch (err) {
    console.error('Production backup failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  backupProductionDatabase().catch(console.error);
}

module.exports = { backupProductionDatabase };
