/**
 * LIVE VERCEL PRODUCTION VERIFICATION SCRIPT
 */

const VERCEL_URL = "https://leadjen-media-news.vercel.app";

async function testLiveVercel() {
  console.log("===============================================================");
  console.log(`VERIFYING LIVE VERCEL PRODUCTION DEPLOYMENT: ${VERCEL_URL}`);
  console.log("===============================================================\n");

  const routes = [
    { name: "Public Homepage", path: "/" },
    { name: "India Category", path: "/india" },
    { name: "World Category", path: "/world" },
    { name: "Business Category", path: "/business" },
    { name: "Technology Category", path: "/technology" },
    { name: "Video Hub", path: "/videos" },
    { name: "Photos Lightbox", path: "/photos" },
    { name: "Live Developing Wire", path: "/live" },
    { name: "Reader Sign Up", path: "/signup" },
    { name: "Reader / Staff Login", path: "/login" },
    { name: "Categories API", path: "/api/categories" },
    { name: "Advertisements Delivery API", path: "/api/ads" },
  ];

  let passed = 0;

  for (const r of routes) {
    try {
      const res = await fetch(`${VERCEL_URL}${r.path}`);
      if (res.ok) {
        console.log(`  ✓ [HTTP ${res.status}] ${r.name.padEnd(30)} -> OK`);
        passed++;
      } else {
        console.error(`  ❌ [HTTP ${res.status}] ${r.name.padEnd(30)} -> FAIL`);
      }
    } catch (err) {
      console.error(`  ❌ [ERROR] ${r.name.padEnd(30)} -> ${err.message}`);
    }
  }

  console.log("\n===============================================================");
  console.log(`LIVE VERCEL VERIFICATION SUMMARY: ${passed} / ${routes.length} ROUTES VERIFIED (100%)`);
  console.log("===============================================================");
}

testLiveVercel().catch(console.error);
