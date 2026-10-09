const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

/**
 * LEADJEN MEDIA — PRODUCTION DATABASE ROLLBACK PROCEDURE
 * 
 * DESIGN PRINCIPLES:
 * 1. Restores Deleted/Modified Records: Uses Prisma upsert on snapshot records to restore
 *    any modified or missing entries to their exact pre-migration state.
 * 2. Protects Newer Production Changes: Does NOT drop or truncate tables, meaning user comments,
 *    bookmarks, audit logs, and reader activity generated after the snapshot remain intact.
 * 3. Targeted Rollback of New Batches: Can specifically delete the newly imported migration batch
 *    without touching pre-existing production articles or editorial work.
 */
async function rollbackProductionDatabase(backupFilePath, options = {}) {
  const {
    customDbUrl = null,
    removeImportedBatchSlugs = []
  } = options;

  const dbUrl = customDbUrl || process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('No DATABASE_URL or PRODUCTION_DATABASE_URL provided for rollback.');
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  console.log('================================================================');
  console.log('LEADJEN MEDIA — PRODUCTION DATABASE SAFE ROLLBACK PROCEDURE');
  console.log('================================================================');

  if (!backupFilePath || !fs.existsSync(backupFilePath)) {
    throw new Error(`Specified backup snapshot file not found: ${backupFilePath}`);
  }

  console.log(`Loading production snapshot: ${path.basename(backupFilePath)}`);
  const backup = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
  const { data } = backup;

  try {
    // 1. Optional Cleanup of newly imported migration batch
    if (removeImportedBatchSlugs && removeImportedBatchSlugs.length > 0) {
      console.log(`Cleaning up ${removeImportedBatchSlugs.length} newly imported batch records...`);
      await prisma.article.deleteMany({
        where: {
          slug: { in: removeImportedBatchSlugs }
        }
      });
      console.log('  ✔ Newly imported batch successfully removed.');
    }

    // 2. Restore Pre-existing Authors
    if (data.authors && data.authors.length > 0) {
      console.log(`Restoring ${data.authors.length} authors to pre-migration state...`);
      for (const author of data.authors) {
        await prisma.author.upsert({
          where: { id: author.id },
          update: author,
          create: author
        });
      }
    }

    // 3. Restore Pre-existing Categories
    if (data.categories && data.categories.length > 0) {
      console.log(`Restoring ${data.categories.length} categories...`);
      for (const cat of data.categories) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: cat,
          create: cat
        });
      }
    }

    // 4. Restore Pre-existing Articles (restores previous statuses, excerpts, content)
    if (data.articles && data.articles.length > 0) {
      console.log(`Restoring ${data.articles.length} pre-existing articles...`);
      for (const art of data.articles) {
        await prisma.article.upsert({
          where: { id: art.id },
          update: art,
          create: art
        });
      }
    }

    // 5. Restore Pre-existing Site Settings
    if (data.siteSettings && data.siteSettings.length > 0) {
      console.log(`Restoring site settings...`);
      for (const set of data.siteSettings) {
        await prisma.siteSettings.upsert({
          where: { id: set.id },
          update: set,
          create: set
        });
      }
    }

    console.log(`\n✔ Rollback procedure executed successfully from: ${path.basename(backupFilePath)}`);
    return { success: true };
  } catch (err) {
    console.error('Rollback procedure failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { rollbackProductionDatabase };
