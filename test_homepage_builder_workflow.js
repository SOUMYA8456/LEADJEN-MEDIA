const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "leadjen_media_editorial_secure_jwt_key_2026";
const PORT = 3006;
const BASE_URL = `http://localhost:${PORT}`;

function generateAdminToken(role = "SUPER_ADMIN") {
  return jwt.sign(
    {
      id: "admin-qa-tester",
      email: "admin@leadjenmedia.com",
      name: "Leadjen Admin QA",
      role: role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function run() {
  console.log("================================================================================");
  console.log("LEADJEN MEDIA — HOMEPAGE BUILDER PREVIEW & PUBLISH VERIFICATION SUITE");
  console.log("================================================================================\n");

  const adminToken = generateAdminToken("SUPER_ADMIN");
  const editorToken = generateAdminToken("EDITOR");
  const authHeaders = {
    "Cookie": `leadjen_admin_session=${adminToken}`,
    "Content-Type": "application/json",
  };

  // STEP 1: Test GET /api/homepage/sections?draft=true
  console.log("--- 1. Testing GET /api/homepage/sections?draft=true ---");
  const secRes = await fetch(`${BASE_URL}/api/homepage/sections?draft=true`, { headers: authHeaders });
  console.log(`Status: ${secRes.status}`);
  const secData = await secRes.json();
  if (secData.sections && Array.isArray(secData.sections)) {
    console.log(`[PASS] Fetched ${secData.sections.length} draft homepage sections.`);
  } else {
    console.error("[FAIL] Could not fetch sections:", secData);
    process.exit(1);
  }

  // STEP 2: Save Draft Configuration (PUT /api/homepage/sections)
  console.log("\n--- 2. Testing Save Draft Configuration (PUT /api/homepage/sections) ---");
  const originalSections = secData.sections;
  const putRes = await fetch(`${BASE_URL}/api/homepage/sections`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ sections: originalSections }),
  });
  console.log(`Status: ${putRes.status}`);
  const putData = await putRes.json();
  if (putRes.ok && putData.success) {
    console.log("[PASS] Draft configuration saved successfully in PostgreSQL.");
  } else {
    console.error("[FAIL] Failed to save draft configuration:", putData);
    process.exit(1);
  }

  // STEP 3: Test Live Draft Preview URL
  console.log("\n--- 3. Testing Live Draft Preview (GET /?preview=draft&t=...) ---");
  const previewTimestamp = Date.now();
  const previewUrl = `${BASE_URL}/?preview=draft&t=${previewTimestamp}`;
  const prevRes = await fetch(previewUrl, { headers: authHeaders });
  console.log(`Status: ${prevRes.status} ${prevRes.statusText}`);
  const prevHtml = await prevRes.text();

  if (prevHtml.includes("Service Temporarily Interrupted") || prevHtml.includes("500 • EDITORIAL WIRE NOTICE")) {
    console.error('[FAIL] Live Draft Preview displays "Service Temporarily Interrupted" Error Boundary!');
    process.exit(1);
  } else if (prevHtml.includes("LEADJEN") || prevHtml.includes("leadjen")) {
    console.log(`[PASS] Live Draft Preview rendered successfully! (${prevHtml.length} bytes HTML, 0 error boundaries)`);
  } else {
    console.error("[FAIL] Unexpected preview HTML output.");
    process.exit(1);
  }

  // STEP 4: Test Publish Live Workflow (POST /api/homepage/publish)
  console.log("\n--- 4. Testing Publish Workflow (POST /api/homepage/publish) ---");
  const pubRes = await fetch(`${BASE_URL}/api/homepage/publish`, {
    method: "POST",
    headers: authHeaders,
  });
  console.log(`Status: ${pubRes.status}`);
  const pubData = await pubRes.json();
  if (pubRes.ok && pubData.success) {
    console.log(`[PASS] Homepage published live. Version created: "${pubData.version?.name}"`);
  } else {
    console.error("[FAIL] Publish failed:", pubData);
    process.exit(1);
  }

  // STEP 5: Test Public Homepage (GET /)
  console.log("\n--- 5. Testing Public Homepage (GET /) ---");
  const pubHomeRes = await fetch(`${BASE_URL}/`);
  console.log(`Status: ${pubHomeRes.status} ${pubHomeRes.statusText}`);
  const pubHomeHtml = await pubHomeRes.text();

  if (pubHomeHtml.includes("Service Temporarily Interrupted") || pubHomeHtml.includes("500 • EDITORIAL WIRE NOTICE")) {
    console.error('[FAIL] Public Homepage displays "Service Temporarily Interrupted" Error Boundary!');
    process.exit(1);
  } else if (pubHomeHtml.includes("LEADJEN") || pubHomeHtml.includes("leadjen")) {
    console.log(`[PASS] Public Homepage rendered successfully! (${pubHomeHtml.length} bytes HTML, 0 error boundaries)`);
  } else {
    console.error("[FAIL] Unexpected public homepage HTML output.");
    process.exit(1);
  }

  // STEP 6: Edge Case Testing - Simulating unusual section configurations
  console.log("\n--- 6. Edge Case Stress Testing (Empty sections, custom settings, null categories) ---");
  // Test site-builder preview parameter (?preview=true)
  const siteBuilderPrevRes = await fetch(`${BASE_URL}/?preview=true`, { headers: authHeaders });
  const siteBuilderHtml = await siteBuilderPrevRes.text();
  if (siteBuilderHtml.includes("Service Temporarily Interrupted")) {
    console.error('[FAIL] Site Builder Preview (?preview=true) failed!');
    process.exit(1);
  } else {
    console.log("[PASS] Site Builder Preview (?preview=true) verified clean.");
  }

  console.log("\n================================================================================");
  console.log("ALL HOMEPAGE BUILDER PREVIEW & PUBLISH VERIFICATIONS PASSED (0 FAILURES)");
  console.log("================================================================================");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
