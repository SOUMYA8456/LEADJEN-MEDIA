const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDelete() {
  console.log("=== TESTING ARTICLE DELETION CAPABILITY ===");

  const cat = await prisma.category.findFirst();
  const aut = await prisma.author.findFirst();

  const testArticle = await prisma.article.create({
    data: {
      title: "Temporary Test Story for Deletion",
      slug: `temp-delete-test-${Date.now()}`,
      excerpt: "Testing permanent deletion.",
      content: "<p>This is temporary content.</p>",
      featuredImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
      categoryId: cat.id,
      authorId: aut.id,
      status: "DRAFT",
    },
  });

  console.log(`✓ Test article created with ID: ${testArticle.id}`);

  // Attach sample view record
  await prisma.articleView.create({
    data: {
      articleId: testArticle.id,
      userAgent: "Mozilla/5.0 Test",
    },
  });
  console.log(`✓ Attached dependent ArticleView record`);

  // Delete related and article in transaction
  await prisma.$transaction([
    prisma.homepageSectionArticle.deleteMany({ where: { articleId: testArticle.id } }),
    prisma.articleTag.deleteMany({ where: { articleId: testArticle.id } }),
    prisma.articleView.deleteMany({ where: { articleId: testArticle.id } }),
    prisma.comment.deleteMany({ where: { articleId: testArticle.id } }),
    prisma.bookmark.deleteMany({ where: { articleId: testArticle.id } }),
    prisma.editorialNotification.deleteMany({ where: { articleId: testArticle.id } }),
    prisma.article.delete({ where: { id: testArticle.id } }),
  ]);

  console.log(`✓ Successfully executed transactional cascade deletion`);

  // Verify record is gone
  const check = await prisma.article.findUnique({ where: { id: testArticle.id } });
  if (!check) {
    console.log(`✓ Verified: Article is permanently deleted from database.`);
  } else {
    console.error(`❌ Article still exists!`);
  }

  // Clean up any remaining temporary test articles
  await prisma.article.deleteMany({
    where: { slug: { startsWith: "temp-delete-test" } },
  });

  await prisma.$disconnect();
}

testDelete().catch(console.error);
