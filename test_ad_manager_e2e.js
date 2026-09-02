/**
 * LEADJEN MEDIA - PHASE 2: ADVERTISEMENT CMS, ANALYTICS & RBAC END-TO-END TEST
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
  console.log("LEADJEN MEDIA — PHASE 2: ADVERTISEMENT CMS & ANALYTICS TEST");
  console.log("===============================================================\n");

  const reporterEmail = "reporter.test@leadjenmedia.com";
  const editorEmail = "editor.test@leadjenmedia.com";
  const adminEmail = "admin.test@leadjenmedia.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  const reporterUser = await prisma.user.upsert({
    where: { email: reporterEmail },
    update: { role: "REPORTER" },
    create: { email: reporterEmail, name: "Aarav Sharma", passwordHash, role: "REPORTER" },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: editorEmail },
    update: { role: "EDITOR" },
    create: { email: editorEmail, name: "Priya Nair", passwordHash, role: "EDITOR" },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "SUPER_ADMIN" },
    create: { email: adminEmail, name: "Super Admin", passwordHash, role: "SUPER_ADMIN" },
  });

  const reporterToken = await createToken(reporterUser);
  const editorToken = await createToken(editorUser);
  const adminToken = await createToken(adminUser);

  let testAdId = null;

  // TEST 1: Reporter is FORBIDDEN from creating advertisements
  console.log("Step 1: Testing RBAC enforcement on Ad Management...");
  const reporterAdAttempt = await fetch(`${BASE_URL}/api/ads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({
      name: "Unauthorized Ad Attempt",
      destinationUrl: "https://example.com",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    }),
  });
  assert(reporterAdAttempt.status === 403, "Reporter is server-side FORBIDDEN (403) from creating advertisements");

  // TEST 2: Unsafe URL Scheme Rejection (Safety Test)
  console.log("\nStep 2: Testing Destination URL Security Validation...");
  const unsafeUrlAttempt = await fetch(`${BASE_URL}/api/ads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${adminToken}`,
    },
    body: JSON.stringify({
      name: "Unsafe Script Ad",
      destinationUrl: "javascript:alert(document.cookie)",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    }),
  });
  assert(unsafeUrlAttempt.status === 400, "Unsafe javascript: scheme URL is blocked with HTTP 400 Bad Request");

  // TEST 3: Admin Creates Active Advertisement with Responsive Creatives
  console.log("\nStep 3: Creating Active Advertisement with Responsive Creatives...");
  const futureEndDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const createAdRes = await fetch(`${BASE_URL}/api/ads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${adminToken}`,
    },
    body: JSON.stringify({
      name: "Global Financial Technology Forum 2026",
      advertiser: "FinTech International",
      campaignName: "Q3_GLOBAL_EXPANSION",
      location: "TOP_LEADERBOARD",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
      desktopImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=250&q=80",
      tabletImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=728&h=90&q=80",
      mobileImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=320&h=100&q=80",
      destinationUrl: "https://leadjenmedia.com/partner/fintech-forum",
      priority: 90,
      status: "ACTIVE",
      device: "ALL",
      rotationMode: "SINGLE",
      endDate: futureEndDate,
      isActive: true,
    }),
  });

  const createAdData = await createAdRes.json();
  assert(createAdRes.ok && createAdData.ad, "Super Admin successfully created responsive Advertisement campaign");
  assert(createAdData.ad?.priority === 90, "Ad priority correctly set to 90");
  assert(createAdData.ad?.desktopImage !== null, "Desktop responsive creative saved");
  assert(createAdData.ad?.tabletImage !== null, "Tablet responsive creative saved");
  assert(createAdData.ad?.mobileImage !== null, "Mobile responsive creative saved");
  testAdId = createAdData.ad?.id;

  // TEST 4: Public API returns active ad
  console.log("\nStep 4: Verifying Public Ad Delivery API...");
  const publicAdsRes = await fetch(`${BASE_URL}/api/ads?location=TOP_LEADERBOARD`);
  const publicAdsData = await publicAdsRes.json();
  const foundInPublic = publicAdsData.ads?.some(a => a.id === testAdId);
  assert(foundInPublic, "Active campaign delivered on public TOP_LEADERBOARD placement stream");

  // TEST 5: Impression Tracking
  console.log("\nStep 5: Verifying Impression Tracking...");
  const impressionTrackRes = await fetch(`${BASE_URL}/api/ads/${testAdId}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "IMPRESSION", device: "DESKTOP", location: "TOP_LEADERBOARD" }),
  });
  assert(impressionTrackRes.ok, "Impression tracking event recorded successfully");

  // TEST 6: Click Tracking & CTR Calculation
  console.log("\nStep 6: Verifying Click Tracking & CTR Computation...");
  const clickTrackRes = await fetch(`${BASE_URL}/api/ads/${testAdId}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "CLICK", device: "DESKTOP", location: "TOP_LEADERBOARD" }),
  });
  assert(clickTrackRes.ok, "Click tracking event recorded successfully");

  const adminAdDetails = await fetch(`${BASE_URL}/api/ads/${testAdId}`);
  const detailsData = await adminAdDetails.json();
  assert(detailsData.ad?.viewCount >= 1, "Ad viewCount incremented");
  assert(detailsData.ad?.clickCount >= 1, "Ad clickCount incremented");

  // TEST 7: Ad Analytics Endpoint
  console.log("\nStep 7: Verifying Ad Analytics API...");
  const adAnalyticsRes = await fetch(`${BASE_URL}/api/ads/analytics?days=30`, {
    headers: { "Cookie": `leadjen_admin_session=${adminToken}` },
  });
  const adAnalyticsData = await adAnalyticsRes.json();
  assert(adAnalyticsData.totalImpressions >= 1, "Ad Analytics returns aggregate impressions");
  assert(adAnalyticsData.totalClicks >= 1, "Ad Analytics returns aggregate clicks");
  assert(adAnalyticsData.byPosition?.length > 0, "Ad Analytics breaks down performance by Position");
  assert(adAnalyticsData.byDevice?.length > 0, "Ad Analytics breaks down performance by Device");

  // TEST 8: Auto-Expiry Filtering
  console.log("\nStep 8: Testing Ad Auto-Expiry Filtering...");
  const pastEndDate = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
  const expiredAdRes = await fetch(`${BASE_URL}/api/ads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${adminToken}`,
    },
    body: JSON.stringify({
      name: "Expired Flash Promo",
      location: "TOP_LEADERBOARD",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      destinationUrl: "https://example.com/expired",
      endDate: pastEndDate,
      status: "ACTIVE",
    }),
  });
  const expiredAdData = await expiredAdRes.json();
  const expiredAdId = expiredAdData.ad?.id;

  const publicAdsAfterExpiry = await fetch(`${BASE_URL}/api/ads?location=TOP_LEADERBOARD`);
  const publicDataAfterExpiry = await publicAdsAfterExpiry.json();
  const expiredFound = publicDataAfterExpiry.ads?.some(a => a.id === expiredAdId);
  assert(!expiredFound, "Expired advertisement is automatically filtered out from public serving");

  // TEST 9: Portal Analytics (Most Read vs Trending)
  console.log("\nStep 9: Verifying Portal Analytics & Most Read Ranking...");
  const portalAnalyticsRes = await fetch(`${BASE_URL}/api/analytics?range=today`, {
    headers: { "Cookie": `leadjen_admin_session=${adminToken}` },
  });
  const portalAnalyticsData = await portalAnalyticsRes.json();
  assert(portalAnalyticsData.overview?.totalViews !== undefined, "Portal Analytics returns verified Total Views");
  assert(portalAnalyticsData.mostRead?.length > 0, "Most Read section populated with verified view-ranked articles");
  assert(portalAnalyticsData.topCategories?.length > 0, "Top Categories aggregated successfully");

  // TEST 10: Audit Log Verification
  console.log("\nStep 10: Verifying Audit Log for Ad events...");
  const auditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
    headers: { "Cookie": `leadjen_admin_session=${adminToken}` },
  });
  const auditData = await auditRes.json();
  const hasAdLog = auditData.logs?.some(l => l.action === "ADVERTISEMENT_CREATED" && l.entityId === testAdId);
  assert(hasAdLog, "Audit log records ADVERTISEMENT_CREATED event");

  // Cleanup
  await prisma.advertisement.deleteMany({
    where: { id: { in: [testAdId, expiredAdId].filter(Boolean) } },
  }).catch(() => {});

  console.log("\n===============================================================");
  console.log(`PHASE 2 ADVERTISING & ANALYTICS TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log("===============================================================");
}

main().catch(console.error);
