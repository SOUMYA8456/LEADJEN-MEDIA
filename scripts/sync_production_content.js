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

/**
 * LEADJEN MEDIA — ATOMIC TRANSACTIONAL PRODUCTION MIGRATION SCRIPT
 * 
 * STRICT INVARIANTS:
 * 1. ATOMIC TRANSACTION: Uses prisma.$transaction(). Any error rolls back the entire batch 100%.
 * 2. PRE-FLIGHT COLLISION CHECK: Aborts immediately if any of the 18 target slugs exist in production.
 * 3. CREATE-ONLY: Uses tx.article.create(). Zero updates, overwrites, deletions, or status mutations.
 * 4. MANDATORY DRAFT STATUS: All 18 articles are created with status: 'DRAFT'. Zero stories published.
 * 5. LEADJEN MEDIA ATTRIBUTION: All 18 articles assigned to author 'Leadjen Media' (leadjen-media).
 */
async function syncProductionContent(options = {}) {
  const {
    customDbUrl = null,
    dryRun = true
  } = options;

  const dbUrl = resolveProdDbUrl(customDbUrl);

  if (!dbUrl) {
    throw new Error('No DATABASE_URL or PRODUCTION_DATABASE_URL provided.');
  }

  const maskedHost = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  console.log('================================================================');
  console.log(`LEADJEN MEDIA — PRODUCTION CONTENT MIGRATION (${dryRun ? 'READ-ONLY PREFLIGHT DRY RUN' : 'ATOMIC TRANSACTIONAL EXECUTION'})`);
  console.log('================================================================');
  console.log(`Target Database: ${maskedHost}\n`);

  try {
    // 1. Load Article Manifest
    const manifestPath = path.join(__dirname, '../scratch/article_manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const manifestSlugs = manifest.map(m => m.slug.toLowerCase());

    // 2. Fetch Categories and Pre-flight Inspection
    console.log('[Preflight Step 1] Querying Production Metadata...');
    const categories = await prisma.category.findMany();
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.slug.toLowerCase()] = c;
      categoryMap[c.name.toLowerCase()] = c;
    });

    // 3. Check for Existing Slugs / Collisions
    console.log('[Preflight Step 2] Checking for Slug Collisions in Production...');
    const existingCollisions = await prisma.article.findMany({
      where: { slug: { in: manifestSlugs } },
      select: { id: true, title: true, slug: true, status: true }
    });

    if (existingCollisions.length > 0) {
      console.error(`\n[!] ABORTING: Detected ${existingCollisions.length} existing slug collisions in Production:`);
      existingCollisions.forEach(c => {
        console.error(`    - Slug: ${c.slug} | Title: "${c.title}" | Status: ${c.status} (ID: ${c.id})`);
      });
      throw new Error(`Migration aborted: ${existingCollisions.length} slugs already exist in target database.`);
    }

    console.log(`  ✔ Zero collisions detected. All ${manifest.length} slugs are completely new in Production.`);

    if (dryRun) {
      console.log('\n[Preflight Complete] Dry run succeeded with 0 errors. Zero data written to Production.');
      return {
        success: true,
        dryRun: true,
        targetArticleCount: manifest.length,
        collisionsFound: 0
      };
    }

    // 4. ATOMIC TRANSACTION EXECUTION
    console.log('\n[Execution Step] Starting Atomic Prisma Transaction...');
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Find or Create Author: Leadjen Media
      let author = await tx.author.findUnique({
        where: { slug: 'leadjen-media' }
      });

      if (!author) {
        author = await tx.author.create({
          data: {
            name: 'Leadjen Media',
            slug: 'leadjen-media',
            designation: 'Leadjen Media Newsroom',
            bio: 'Leadjen Media is a premier digital news organization delivering independent, fact-checked, and authoritative reporting on national affairs, business, technology, world politics, and sports.',
            email: 'editorial@leadjenmediadaily.com',
            avatar: 'https://leadjenmediadaily.com/logo.png'
          }
        });
        console.log(`  ✔ [Tx] Created Author "Leadjen Media" (ID: ${author.id})`);
      } else {
        console.log(`  ✔ [Tx] Found Author "Leadjen Media" (ID: ${author.id})`);
      }

      // 4b. Insert all 18 Articles atomically
      const insertedArticles = [];

      for (const item of manifest) {
        const targetCat = categoryMap[item.categorySlug.toLowerCase()] || categoryMap[item.category.toLowerCase()];
        if (!targetCat) {
          throw new Error(`Category not found: ${item.category} (${item.categorySlug})`);
        }

        // Read image file into Data URI
        const imgPath = path.join(__dirname, '../scratch/docx_images', item.imageFile);
        let imageUrl = '';
        if (fs.existsSync(imgPath)) {
          const fileBuffer = fs.readFileSync(imgPath);
          const ext = path.extname(item.imageFile).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
          const base64Data = fileBuffer.toString('base64');
          imageUrl = `data:${mimeType};base64,${base64Data}`;

          // Create Media record
          await tx.media.create({
            data: {
              filename: item.imageFile,
              originalName: item.imageFile,
              url: imageUrl,
              mimeType: mimeType,
              size: fileBuffer.length,
              altText: item.title
            }
          });
        }

        const readingTime = Math.max(1, Math.ceil(item.wordCount / 200));

        // Create Article Record (Strictly DRAFT)
        const article = await tx.article.create({
          data: {
            title: item.cleanTitle,
            slug: item.slug,
            excerpt: item.excerpt,
            content: item.content,
            featuredImage: imageUrl,
            categoryId: targetCat.id,
            authorId: author.id,
            status: 'DRAFT', // STRICTLY DRAFT
            isFeatured: false,
            isBreaking: false,
            isTrending: false,
            readingTime: readingTime,
            seoTitle: `${item.cleanTitle} | Leadjen Media`,
            seoDescription: item.excerpt
          }
        });

        // Create Audit Log
        await tx.auditLog.create({
          data: {
            action: 'ARTICLE_CREATED',
            entityType: 'ARTICLE',
            entityId: article.id,
            entityTitle: article.title,
            previousStatus: null,
            newStatus: 'DRAFT',
            details: JSON.stringify({
              source: 'ARTICLES.docx',
              sourceIndex: item.index,
              author: 'Leadjen Media',
              category: targetCat.name
            })
          }
        });

        insertedArticles.push(article);
        console.log(`  ✔ [Tx] Inserted DRAFT [${item.index}/18]: "${article.title}" (ID: ${article.id})`);
      }

      return {
        authorId: author.id,
        articlesCount: insertedArticles.length,
        articles: insertedArticles
      };
    }, {
      maxWait: 15000,
      timeout: 60000 // 60s timeout for bulk image insert
    });

    console.log(`\n✔ TRANSACTION COMMITTED: ${result.articlesCount} Articles Successfully Created as DRAFT.`);
    return result;
  } catch (err) {
    console.error('\n✗ TRANSACTION FAILED / ROLLED BACK:', err.message);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  const isDryRun = !process.argv.includes('--execute');
  syncProductionContent({ dryRun: isDryRun }).catch(console.error);
}

module.exports = { syncProductionContent };
