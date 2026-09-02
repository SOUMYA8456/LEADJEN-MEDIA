const { PrismaClient } = require('@prisma/client');

const cloudDbUrl = "postgres://1053933f1d5725c40eecc45d597c4d44a619b7e8593f6dfccde796cc0a4dc31a:sk_sKtRAEQkq-w7ZrIZHyLI2@db.prisma.io:5432/postgres?sslmode=require";
const prisma = new PrismaClient({
  datasources: { db: { url: cloudDbUrl } },
});

async function inspectCloud() {
  console.log("=== INSPECTING PRISMA POSTGRES CLOUD DB ===");
  const users = await prisma.user.count();
  const articles = await prisma.article.count();
  const categories = await prisma.category.count();
  const authors = await prisma.author.count();
  const sections = await prisma.homepageSection.count();
  const versions = await prisma.homepageVersion.count();
  const breaking = await prisma.breakingNews.count();
  const ads = await prisma.advertisement.count();
  const videos = await prisma.videoNews.count();
  const photos = await prisma.photoGallery.count();

  console.log(`Users: ${users}`);
  console.log(`Articles: ${articles}`);
  console.log(`Categories: ${categories}`);
  console.log(`Authors: ${authors}`);
  console.log(`Homepage Sections: ${sections}`);
  console.log(`Homepage Versions: ${versions}`);
  console.log(`Breaking News: ${breaking}`);
  console.log(`Ads: ${ads}`);
  console.log(`Videos: ${videos}`);
  console.log(`Photos: ${photos}`);

  const sampleArticles = await prisma.article.findMany({
    select: { title: true, status: true, category: { select: { slug: true } } },
  });
  console.log("Sample articles:", sampleArticles);

  const sampleSections = await prisma.homepageSection.findMany({
    select: { name: true, type: true, enabled: true, isDraft: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
  console.log("Sample sections:", sampleSections);

  await prisma.$disconnect();
}

inspectCloud().catch(console.error);
