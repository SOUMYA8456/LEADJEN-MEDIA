/**
 * LEADJEN MEDIA - BREAKING NEWS MANAGER & AUTO-EXPIRY TEST SUITE
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "leadjen_media_super_secure_jwt_secret_2026_editorial_key";
const BASE_URL = "http://localhost:3000";

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

async function main() {
  console.log("===============================================================");
  console.log("LEADJEN MEDIA - BREAKING NEWS MANAGER & LIFECYCLE TEST");
  console.log("===============================================================\n");

  const reporterEmail = "reporter.test@leadjenmedia.com";
  const editorEmail = "editor.test@leadjenmedia.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  let reporterUser = await prisma.user.upsert({
    where: { email: reporterEmail },
    update: { role: "REPORTER" },
    create: { email: reporterEmail, name: "Aarav Sharma", passwordHash, role: "REPORTER" },
  });

  let editorUser = await prisma.user.upsert({
    where: { email: editorEmail },
    update: { role: "EDITOR" },
    create: { email: editorEmail, name: "Priya Nair", passwordHash, role: "EDITOR" },
  });

  const reporterToken = await createToken(reporterUser);
  const editorToken = await createToken(editorUser);

  // TEST 1: Reporter attempts to create breaking news (Must be 403 Forbidden)
  console.log("Step 1: Testing Reporter restriction on Breaking News...");
  const reporterAttemptRes = await fetch(`${BASE_URL}/api/breaking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({
      title: "Unauthorized Reporter Breaking News",
      priority: "HIGH",
    }),
  });
  assert(reporterAttemptRes.status === 403, "Reporter is server-side FORBIDDEN (403) from creating breaking news");

  // TEST 2: Editor creates Active Breaking Bulletin
  console.log("\nStep 2: Editor creates Active Breaking Bulletin...");
  const futureExpiry = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
  const createRes = await fetch(`${BASE_URL}/api/breaking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
    body: JSON.stringify({
      title: "BREAKING: Global Central Banks Coordinate On Digital Trade Settlement",
      priority: "HIGH",
      isLive: true,
      isActive: true,
      expiresAt: futureExpiry,
    }),
  });
  const createData = await createRes.json();
  assert(createRes.ok && createData.item, "Editor successfully creates Breaking News item");
  assert(createData.item?.priority === "HIGH", "Breaking news priority set to HIGH");
  const activeItemId = createData.item?.id;

  // TEST 3: Public Ticker contains active item
  console.log("\nStep 3: Verifying Public Breaking Ticker stream...");
  const publicRes = await fetch(`${BASE_URL}/api/breaking`);
  const publicData = await publicRes.json();
  const foundInPublic = publicData.breaking?.some(b => b.id === activeItemId);
  assert(foundInPublic, "Active breaking bulletin appears on public ticker stream");

  // TEST 4: Expired item automatic removal
  console.log("\nStep 4: Testing Auto-Expiry Filtering...");
  const pastExpiry = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
  const expiredCreateRes = await fetch(`${BASE_URL}/api/breaking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
    body: JSON.stringify({
      title: "OLD EXPIRED BULLETIN FROM YESTERDAY",
      priority: "LOW",
      isActive: true,
      expiresAt: pastExpiry,
    }),
  });
  const expiredData = await expiredCreateRes.json();
  const expiredItemId = expiredData.item?.id;

  const publicAfterExpiryRes = await fetch(`${BASE_URL}/api/breaking`);
  const publicAfterData = await publicAfterExpiryRes.json();
  const expiredFoundInPublic = publicAfterData.breaking?.some(b => b.id === expiredItemId);
  assert(!expiredFoundInPublic, "Expired breaking news automatically excluded from public ticker stream");

  // Cleanup
  await prisma.breakingNews.deleteMany({
    where: { id: { in: [activeItemId, expiredItemId].filter(Boolean) } },
  });

  console.log("\n===============================================================");
  console.log(`BREAKING NEWS TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log("===============================================================");
}

main().catch(console.error);
