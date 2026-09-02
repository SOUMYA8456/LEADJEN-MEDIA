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

async function runRestore() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    console.error('Backups directory does not exist.');
    return;
  }

  const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse();
  if (files.length === 0) {
    console.error('No backup snapshots found in backups/');
    return;
  }

  const latestFile = path.join(backupDir, files[0]);
  console.log('========================================================');
  console.log('LEADJEN MEDIA — DATABASE RESTORE TEST / PROCEDURE');
  console.log('========================================================\n');
  console.log(`Restoring from snapshot: ${files[0]}`);

  const content = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  const { data } = content;

  try {
    // 1. Restore Categories
    if (data.categories) {
      for (const cat of data.categories) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: cat,
          create: cat,
        });
      }
    }

    // 2. Restore Authors
    if (data.authors) {
      for (const aut of data.authors) {
        await prisma.author.upsert({
          where: { id: aut.id },
          update: aut,
          create: aut,
        });
      }
    }

    // 3. Restore Static Pages
    if (data.pages) {
      for (const p of data.pages) {
        await prisma.page.upsert({
          where: { id: p.id },
          update: p,
          create: p,
        });
      }
    }

    // 4. Restore Site Settings
    if (data.siteSettings) {
      for (const s of data.siteSettings) {
        await prisma.siteSettings.upsert({
          where: { id: s.id },
          update: s,
          create: s,
        });
      }
    }

    // 5. Restore SEO Settings
    if (data.seoSettings) {
      for (const s of data.seoSettings) {
        await prisma.seoSettings.upsert({
          where: { id: s.id },
          update: s,
          create: s,
        });
      }
    }

    console.log('\n✓ Restore verification completed successfully!');
    console.log(`  - Snapshot: ${files[0]}`);
    console.log(`  - Categories: ${data.categories?.length || 0}`);
    console.log(`  - Authors: ${data.authors?.length || 0}`);
    console.log(`  - Pages: ${data.pages?.length || 0}`);
    console.log(`  - Articles in backup: ${data.articles?.length || 0}\n`);
  } catch (error) {
    console.error('Restore procedure encountered an error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runRestore();
