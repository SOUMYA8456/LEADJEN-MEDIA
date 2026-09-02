const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const envContent = fs.readFileSync('.env.vercel', 'utf8');
const lines = envContent.split('\n');
let dbUrl = '';

for (const line of lines) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

async function seed() {
  console.log('Seeding cloud PostgreSQL database...');

  // 1. Ensure Super Admin
  const adminEmail = 'admin@leadjenmedia.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('LeadjenAdminSecure2026!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: 'Chief Editor',
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✓ Created Super Admin');
  }

  // 2. Ensure Categories
  const categories = [
    { name: 'India', slug: 'india', description: 'National and regional news coverage' },
    { name: 'World', slug: 'world', description: 'Global geopolitics and foreign affairs' },
    { name: 'Politics', slug: 'politics', description: 'Policy, government and diplomacy' },
    { name: 'Business', slug: 'business', description: 'Markets, corporate economy and trade' },
    { name: 'Technology', slug: 'technology', description: 'AI, semiconductors and deep tech' },
    { name: 'Sports', slug: 'sports', description: 'Global athletics and championships' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✓ Categories ensured');

  // 3. Ensure Breaking News
  const existingBreaking = await prisma.breakingNews.findFirst({ where: { isActive: true } });
  if (!existingBreaking) {
    await prisma.breakingNews.create({
      data: {
        title: 'India Semiconductor Corridors Open Initial Commercial Trials in Bengaluru and Dholera',
        priority: 'URGENT',
        status: 'ACTIVE',
        isLive: true,
        isActive: true,
        linkUrl: '/technology',
      },
    });
    console.log('✓ Breaking news created');
  }

  // 4. Ensure Live Coverage
  const existingCoverage = await prisma.liveCoverage.findFirst({ where: { status: 'LIVE' } });
  if (!existingCoverage) {
    const coverage = await prisma.liveCoverage.create({
      data: {
        title: 'Global Geopolitical & Economic Security Summit 2026 Live',
        slug: 'global-security-summit-2026-live',
        summary: 'Minute-by-minute verified reporting from correspondents in Geneva and New Delhi.',
        status: 'LIVE',
        category: 'Geopolitics',
      },
    });

    await prisma.liveUpdate.create({
      data: {
        coverageId: coverage.id,
        title: 'Plenary Session Opens: Accord on International Trade Resilience',
        content: 'Chief delegates have formally ratified the multilateral trade framework focusing on semiconductor supply lines and critical minerals.',
        authorName: 'Leadjen Diplomatic Desk',
        isUrgent: true,
        timestamp: '17:30 IST',
      },
    });
    console.log('✓ Live coverage created');
  }

  console.log('✓ Seeding completed successfully!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
