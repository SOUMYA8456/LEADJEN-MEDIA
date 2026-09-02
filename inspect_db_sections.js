const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  console.log("Database Sections Count:", sections.length);
  sections.forEach((s) => {
    console.log(`Order ${s.sortOrder.toString().padStart(2, " ")}: [${s.type.padEnd(16, " ")}] ${s.name} (enabled: ${s.enabled}, isDraft: ${s.isDraft})`);
  });
}

main().finally(() => prisma.$disconnect());
