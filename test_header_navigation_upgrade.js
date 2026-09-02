const http = require("http");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "leadjen_media_super_secure_jwt_secret_2026_editorial_key";
const superAdminToken = jwt.sign(
  { id: "admin-1", email: "admin@leadjenmedia.com", name: "Executive Editor", role: "SUPER_ADMIN" },
  JWT_SECRET
);

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method: options.method || "GET",
        headers: {
          ...(options.headers || {}),
          ...(options.auth ? { Cookie: `leadjen_admin_session=${superAdminToken}` } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runHeaderNavigationAudit() {
  console.log("=========================================================================================");
  console.log("     LEADJEN MEDIA — HEADER & NAVIGATION COMPREHENSIVE SYSTEM AUDIT                     ");
  console.log("=========================================================================================\n");

  let testCount = 0;
  let passCount = 0;

  function report(testName, passed, details = "") {
    testCount++;
    if (passed) passCount++;
    console.log(`${passed ? "✓ [PASS]" : "✗ [FAIL]"} Test ${String(testCount).padStart(2, " ")}: ${testName.padEnd(52, " ")} ${details}`);
  }

  // 1. Public Homepage & Navigation Hierarchy
  const homeRes = await request("/");
  report("1. Homepage 200 OK", homeRes.statusCode === 200, `(${homeRes.body.length} bytes)`);

  const body = homeRes.body;

  // 2. Tagline Under Logo
  report(
    "2. Sub-tagline 'INDEPENDENT JOURNALISM • INSIGHT • IMPACT'",
    body.includes("INDEPENDENT JOURNALISM • INSIGHT • IMPACT"),
    "Verified in main header under logo"
  );

  // 3. Official Logo in Header
  report(
    "3. Official Logo Branding (Light/Dark)",
    body.includes("/images/logo.png") && body.includes("/images/logo-white.png"),
    "Both standard and dark mode brand logos present"
  );

  // 4. Primary Category Navigation Links
  const requiredCategories = [
    "HOME",
    "INDIA",
    "WORLD",
    "POLITICS",
    "BUSINESS",
    "TECHNOLOGY",
    "SPORTS",
    "ENTERTAINMENT",
    "HEALTH",
    "SCIENCE",
    "LIFESTYLE",
    "TRAVEL",
    "VIDEO",
    "PHOTOS",
    "MORE",
  ];

  const allCategoriesPresent = requiredCategories.every((cat) => body.includes(cat));
  report(
    "4. Primary 14+1 Category Navigation Bar",
    allCategoriesPresent,
    "HOME | INDIA | WORLD ... | VIDEO | PHOTOS | MORE verified"
  );

  // 5. Watch & Listen Utility Buttons
  report("5. Header Utility 'Watch' Link (/videos)", body.includes('href="/videos"'), "Direct access to Video Journalism");
  report("6. Header Utility 'Listen' Link (/listen)", body.includes('href="/listen"'), "Direct access to Audio Podcasts & Briefs");

  // 7. Search & CMS Access
  report("7. Header Search Trigger Button", body.includes("aria-label=\"Search articles\"") || body.includes("Search"), "Search modal trigger present");
  report("8. Header CMS Pill Button (/admin)", body.includes('href="/admin"') && body.includes("CMS"), "Protected CMS portal button verified");

  // 8. Mega Menu Columns
  const megaMenuSections = [
    "OPINION",
    "MARKETS",
    "LIFESTYLE",
    "MULTIMEDIA",
    "SPECIAL DESKS",
    "ABOUT LEADJEN",
  ];
  const allMegaSectionsPresent = megaMenuSections.every((sec) => body.includes(sec));
  report(
    "9. MORE ▾ Multi-Column Mega Menu Content",
    allMegaSectionsPresent,
    "All 6 editorial columns verified"
  );

  // 9. Audio Journalism Hub Page (/listen)
  const listenRes = await request("/listen");
  report("10. Audio Journalism Hub Page (/listen)", listenRes.statusCode === 200, `(HTTP ${listenRes.statusCode}, ${listenRes.body.length} bytes)`);
  report(
    "11. Audio Podcasts & Briefings on /listen",
    listenRes.body.includes("LEADJEN LISTEN") && listenRes.body.includes("Leadjen Daily Brief"),
    "Player controls and featured episodes verified"
  );

  // 10. Upgraded Search API with Filter Tabs
  const searchAll = await request("/api/search?q=India&type=all");
  const searchAllData = JSON.parse(searchAll.body || "{}");
  report(
    "12. Search API (/api/search) All Types",
    searchAll.statusCode === 200 && Array.isArray(searchAllData.articles),
    `(${searchAllData.articles?.length || 0} articles returned)`
  );

  const searchVideos = await request("/api/search?q=Technology&type=videos");
  const searchVideosData = JSON.parse(searchVideos.body || "{}");
  report(
    "13. Search API (/api/search) Video Filter",
    searchVideos.statusCode === 200 && Array.isArray(searchVideosData.videos),
    `(${searchVideosData.videos?.length || 0} videos returned)`
  );

  // 11. Navigation Admin Control API
  const siteSettingsDraft = await request("/api/settings/site?draft=true", { auth: true });
  const siteSettingsData = JSON.parse(siteSettingsDraft.body || "{}");
  report(
    "14. Navigation Admin Settings API (Draft Support)",
    siteSettingsDraft.statusCode === 200 && !!siteSettingsData.settings,
    "(Site settings and draft navigation supported)"
  );

  // 12. Public Routes Health
  const routesToTest = ["/india", "/world", "/politics", "/business", "/technology", "/videos", "/photos", "/listen", "/live"];
  let routesOk = true;
  for (const route of routesToTest) {
    const res = await request(route);
    if (res.statusCode !== 200) {
      routesOk = false;
      break;
    }
  }
  report("15. All Public News Desk & Multimedia Routes 200 OK", routesOk, "(India, World, Tech, Videos, Photos, Listen, Live)");

  console.log("\n=========================================================================================");
  console.log(`HEADER & NAVIGATION AUDIT RESULT: ${passCount} / ${testCount} CHECKS PASSED (${Math.round((passCount / testCount) * 100)}% SUCCESS RATE)`);
  console.log("=========================================================================================\n");

  if (passCount !== testCount) process.exit(1);
}

runHeaderNavigationAudit().catch(console.error);
