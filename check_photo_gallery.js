const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.photoGallery.count();
  console.log("Photo Gallery Count:", count);
  if (count === 0) {
    console.log("Seeding default photo gallery...");
    await prisma.photoGallery.create({
      data: {
        title: "Moments That Defined History: The Global Climate & Energy Summit 2026",
        description: "Photojournalists on the ground document critical diplomatic debates and sustainable tech corridors.",
        coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        photographer: "Marcus Vance / Leadjen Visual Bureau",
        images: JSON.stringify([
          {
            url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
            caption: "Delegates convene at the opening plenary of the 2026 Geneva Accord.",
            photographer: "Marcus Vance",
          },
          {
            url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
            caption: "Solar array installations operating at full capacity in Rajasthan.",
            photographer: "Ananya Sen",
          },
          {
            url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
            caption: "Satellite telemetry displaying real-time global atmospheric data.",
            photographer: "ESA / Leadjen",
          },
        ]),
      },
    });
    console.log("Photo gallery seeded successfully.");
  }
}

main().finally(() => prisma.$disconnect());
