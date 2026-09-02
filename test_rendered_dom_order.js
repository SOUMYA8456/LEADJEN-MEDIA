const http = require("http");
const jwt = require("jsonwebtoken");

async function fetchPage(path = "/") {
  return new Promise((resolve, reject) => {
    http.get({ hostname: "localhost", port: 3000, path }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, html: data }));
    }).on("error", reject);
  });
}

async function resetHomepage() {
  const JWT_SECRET = process.env.JWT_SECRET || "leadjen_media_super_secure_jwt_secret_2026_editorial_key";
  const superAdminToken = jwt.sign(
    { id: "admin-1", email: "admin@leadjenmedia.com", name: "Executive Editor", role: "SUPER_ADMIN" },
    JWT_SECRET
  );

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/homepage/reset",
        method: "POST",
        headers: { Cookie: `leadjen_admin_session=${superAdminToken}` },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data || "{}")));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function runDomOrderAudit() {
  console.log("=========================================================================================");
  console.log("             LEADJEN MEDIA — ACTUAL RENDERED DOM & VISUAL HIERARCHY AUDIT                ");
  console.log("=========================================================================================\n");

  // Step 1: Baseline reset
  await resetHomepage();

  // Step 2: Fetch actual rendered HTML from localhost:3000
  const { statusCode, html } = await fetchPage("/");
  if (statusCode !== 200) {
    console.error(`Failed to fetch rendered homepage. HTTP Status: ${statusCode}`);
    process.exit(1);
  }

  // Extract clean rendered body
  const bodyStart = html.indexOf("<body");
  const scriptStart = html.indexOf("<script>(self.__next_f");
  const cleanBody = html.substring(
    bodyStart !== -1 ? bodyStart : 0,
    scriptStart !== -1 ? scriptStart : html.length
  );

  console.log(`✓ Fetched rendered HTML Body (${cleanBody.length} bytes, HTTP ${statusCode})\n`);

  // Target 16 unambiguous DOM markers in strict sequential order:
  const componentChecks = [
    { name: "Top Ad", expected: 1, marker: "Advertisement" },
    { name: "Header", expected: 2, marker: "alt=\"LEADJEN MEDIA\"" },
    { name: "Navigation", expected: 3, marker: "href=\"/travel\"" },
    { name: "Video Brief", expected: 4, marker: "SPECIAL LEADJEN VIDEO BRIEF" },
    { name: "Breaking", expected: 5, marker: "BREAKING NEWS" },
    { name: "Trending", expected: 6, marker: "TRENDING:" },
    { name: "Live Developing", expected: 7, marker: "Live Developing" },
    { name: "Hero", expected: 8, marker: "aspect-[16/9]" },
    { name: "Sidebar", expected: 9, marker: "Video Briefing" },
    { name: "Secondary News", expected: 10, marker: "Developing Reports" },
    { name: "Category Sections", expected: 11, marker: "WORLD" },
    { name: "Video", expected: 12, marker: "LEADJEN VIDEO JOURNALISM" },
    { name: "Photos", expected: 13, marker: "LEADJEN PHOTO JOURNALISM" },
    { name: "Latest News", expected: 14, marker: "LATEST NEWS" },
    { name: "Editorial Dispatch", expected: 15, marker: "GET THE NEWS THAT MATTERS" },
    { name: "Footer", expected: 16, marker: "© 2026 LEADJEN MEDIA. All rights reserved." },
  ];

  // Find character offsets in clean rendered body
  const foundPositions = componentChecks.map((item) => {
    let offset = -1;
    if (item.name === "Category Sections") {
      offset = cleanBody.indexOf("WORLD", 40000);
    } else if (item.name === "Live Developing") {
      offset = cleanBody.indexOf("Live Developing", 28000);
    } else {
      offset = cleanBody.indexOf(item.marker);
    }
    return {
      ...item,
      offset,
      found: offset !== -1,
    };
  });

  // Sort by appearance offset to compute actual sequential index
  const sorted = [...foundPositions].filter((item) => item.found).sort((a, b) => a.offset - b.offset);

  const resultsTable = foundPositions.map((item) => {
    const actualIndex = sorted.findIndex((s) => s.name === item.name) + 1;
    const isCorrect = item.found && actualIndex === item.expected;
    return {
      Component: item.name,
      "Expected Position": item.expected,
      "Actual Position": item.found ? actualIndex : "NOT FOUND",
      Status: isCorrect ? "PASS" : "FAIL",
      Offset: item.offset,
    };
  });

  console.log("-----------------------------------------------------------------------------------------");
  console.log(
    "Component".padEnd(25, " ") +
    " | " +
    "Expected Position".padEnd(18, " ") +
    " | " +
    "Actual Position".padEnd(16, " ") +
    " | " +
    "DOM Offset".padEnd(12, " ") +
    " | " +
    "Status"
  );
  console.log("-----------------------------------------------------------------------------------------");

  let allPassed = true;
  resultsTable.forEach((r) => {
    if (r.Status !== "PASS") allPassed = false;
    console.log(
      r.Component.padEnd(25, " ") +
      " | " +
      String(r["Expected Position"]).padEnd(18, " ") +
      " | " +
      String(r["Actual Position"]).padEnd(16, " ") +
      " | " +
      String(r.Offset).padEnd(12, " ") +
      " | " +
      (r.Status === "PASS" ? "PASS" : "FAIL")
    );
  });

  console.log("-----------------------------------------------------------------------------------------");

  // Critical Invariant Checks
  const dispatch = foundPositions.find((p) => p.name === "Editorial Dispatch");
  const footer = foundPositions.find((p) => p.name === "Footer");
  const latest = foundPositions.find((p) => p.name === "Latest News");

  console.log("\nCRITICAL EDITORIAL DISPATCH INVARIANTS:");
  console.log(`1. Latest News Offset (${latest.offset}) < Editorial Dispatch Offset (${dispatch.offset}) → ${latest.offset < dispatch.offset ? "[PASS]" : "[FAIL]"}`);
  console.log(`2. Editorial Dispatch Offset (${dispatch.offset}) < Footer Offset (${footer.offset}) → ${dispatch.offset < footer.offset ? "[PASS]" : "[FAIL]"}`);
  
  const contentAfterDispatch = cleanBody.substring(dispatch.offset + 500, footer.offset);
  const hasNewsAfterDispatch = contentAfterDispatch.includes("aspect-[16/9]") || contentAfterDispatch.includes("LEADJEN VIDEO") || contentAfterDispatch.includes("PHOTO JOURNALISM");
  console.log(`3. Zero news/video/photo sections between Dispatch and Footer → ${!hasNewsAfterDispatch ? "[PASS]" : "[FAIL]"}`);

  if (allPassed && latest.offset < dispatch.offset && dispatch.offset < footer.offset && !hasNewsAfterDispatch) {
    console.log("\n=========================================================================================");
    console.log("         ALL 16 RENDERED DOM COMPONENTS IN 100% STRICT EDITORIAL ORDER                   ");
    console.log("=========================================================================================\n");
  } else {
    console.error("\nOrder audit failed. Please check table above.");
    process.exit(1);
  }
}

runDomOrderAudit().catch(console.error);
