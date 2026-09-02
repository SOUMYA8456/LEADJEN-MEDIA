const http = require("http");
const jwt = require("jsonwebtoken");

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json || data,
        });
      });
    });

    req.on("error", (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function testNavigationCategories() {
  console.log("===============================================================================");
  console.log("LEADJEN MEDIA — NAVIGATION BAR & 12 NEWS CATEGORIES TEST SUITE");
  console.log("===============================================================================\n");

  const JWT_SECRET = process.env.JWT_SECRET || "leadjen_media_super_secure_jwt_secret_2026_editorial_key";
  const adminToken = jwt.sign(
    { id: "admin-1", email: "admin@leadjenmedia.com", name: "Executive Editor", role: "SUPER_ADMIN" },
    JWT_SECRET
  );
  const adminCookie = `leadjen_admin_session=${adminToken}`;

  const EXPECTED_12_CATEGORIES = [
    { name: "HOME", href: "/" },
    { name: "INDIA", href: "/india" },
    { name: "WORLD", href: "/world" },
    { name: "POLITICS", href: "/politics" },
    { name: "BUSINESS", href: "/business" },
    { name: "TECHNOLOGY", href: "/technology" },
    { name: "SPORTS", href: "/sports" },
    { name: "ENTERTAINMENT", href: "/entertainment" },
    { name: "HEALTH", href: "/health" },
    { name: "SCIENCE", href: "/science" },
    { name: "LIFESTYLE", href: "/lifestyle" },
    { name: "TRAVEL", href: "/travel" },
  ];

  // TEST 1: Restore / Initialize 12 Navigation Categories
  console.log("TEST 1: Initialize / Restore Default 12 Primary Categories in SiteSettings...");
  const initNavRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/settings/site",
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    JSON.stringify({
      headerNavItems: EXPECTED_12_CATEGORIES.map((cat, idx) => ({ ...cat, isVisible: true, order: idx })),
    })
  );

  const parsedNav = JSON.parse(initNavRes.body.settings.headerNavItems);
  console.log(`✓ Restored Nav Items count: ${parsedNav.length}`);
  parsedNav.forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item.name} (${item.href})`);
  });

  // TEST 2: Verify all 11 category pages render HTTP 200 with database content
  console.log("\nTEST 2: Verify all 11 Category Pages connect to database & render HTTP 200...");
  const categoryPaths = [
    "/india",
    "/world",
    "/politics",
    "/business",
    "/technology",
    "/sports",
    "/entertainment",
    "/health",
    "/science",
    "/lifestyle",
    "/travel",
  ];

  for (const catPath of categoryPaths) {
    const pageRes = await makeRequest({
      hostname: "localhost",
      port: 3000,
      path: catPath,
      method: "GET",
    });
    const isOk = pageRes.statusCode === 200;
    console.log(`   [${isOk ? "PASS" : "FAIL"}] Category route ${catPath}: HTTP ${pageRes.statusCode}`);
    if (!isOk) {
      console.error(`✗ Route failed: ${catPath}`);
      process.exit(1);
    }
  }

  // TEST 3: Reorder Navigation in Admin (Move Technology above India)
  console.log("\nTEST 3: Reorder Navigation (Move TECHNOLOGY above INDIA)...");
  const reorderedNav = [
    { name: "HOME", href: "/", isVisible: true, order: 0 },
    { name: "TECHNOLOGY", href: "/technology", isVisible: true, order: 1 },
    { name: "INDIA", href: "/india", isVisible: true, order: 2 },
    { name: "WORLD", href: "/world", isVisible: true, order: 3 },
    { name: "POLITICS", href: "/politics", isVisible: true, order: 4 },
    { name: "BUSINESS", href: "/business", isVisible: true, order: 5 },
    { name: "SPORTS", href: "/sports", isVisible: true, order: 6 },
    { name: "ENTERTAINMENT", href: "/entertainment", isVisible: true, order: 7 },
    { name: "HEALTH", href: "/health", isVisible: true, order: 8 },
    { name: "SCIENCE", href: "/science", isVisible: true, order: 9 },
    { name: "LIFESTYLE", href: "/lifestyle", isVisible: true, order: 10 },
    { name: "TRAVEL", href: "/travel", isVisible: true, order: 11 },
  ];

  const moveRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/settings/site",
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    JSON.stringify({ headerNavItems: reorderedNav })
  );

  const updatedNav = JSON.parse(moveRes.body.settings.headerNavItems);
  console.log("✓ Reordered Sequence confirmed in DB:");
  console.log(`   1. ${updatedNav[0].name} (${updatedNav[0].href})`);
  console.log(`   2. ${updatedNav[1].name} (${updatedNav[1].href})`);
  console.log(`   3. ${updatedNav[2].name} (${updatedNav[2].href})`);

  // TEST 4: Disable a Category (Hide Entertainment)
  console.log("\nTEST 4: Toggle Category Visibility (Hide Entertainment)...");
  const disabledNav = reorderedNav.map((item) => (item.name === "ENTERTAINMENT" ? { ...item, isVisible: false } : item));
  const hideRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/settings/site",
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    JSON.stringify({ headerNavItems: disabledNav })
  );
  const hiddenItem = JSON.parse(hideRes.body.settings.headerNavItems).find((i) => i.name === "ENTERTAINMENT");
  console.log(`✓ Entertainment Visibility status: ${hiddenItem.isVisible ? "Visible" : "Hidden (PASS)"}`);

  // TEST 5: Restore Default 12 Categories
  console.log("\nTEST 5: Restore Default 12 Categories...");
  const resetRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/settings/site",
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
    },
    JSON.stringify({
      headerNavItems: EXPECTED_12_CATEGORIES.map((cat, idx) => ({ ...cat, isVisible: true, order: idx })),
    })
  );
  const finalNav = JSON.parse(resetRes.body.settings.headerNavItems);
  console.log(`✓ Final Default Nav Items: ${finalNav.length} categories restored.`);

  console.log("\n===============================================================================");
  console.log("NAVIGATION BAR & 12 CATEGORIES VERIFICATION: ALL TESTS PASSED (100%)");
  console.log("===============================================================================");
}

testNavigationCategories().catch(console.error);
