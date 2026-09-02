/**
 * LEADJEN MEDIA - END-TO-END EDITORIAL NEWS DESK & RBAC WORKFLOW TEST
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
  console.log("LEADJEN MEDIA - PROFESSIONAL NEWS DESK & EDITORIAL WORKFLOW TEST");
  console.log("===============================================================\n");

  // 1. Setup Test Users
  const reporterEmail = "reporter.test@leadjenmedia.com";
  const editorEmail = "editor.test@leadjenmedia.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  let reporterUser = await prisma.user.upsert({
    where: { email: reporterEmail },
    update: { role: "REPORTER" },
    create: {
      email: reporterEmail,
      name: "Aarav Sharma",
      passwordHash,
      role: "REPORTER",
    },
  });

  let editorUser = await prisma.user.upsert({
    where: { email: editorEmail },
    update: { role: "EDITOR" },
    create: {
      email: editorEmail,
      name: "Priya Nair",
      passwordHash,
      role: "EDITOR",
    },
  });

  const reporterToken = await createToken(reporterUser);
  const editorToken = await createToken(editorUser);

  // Setup test Category & Author
  const category = await prisma.category.findFirst({ where: { slug: "india" } });
  const author = await prisma.author.upsert({
    where: { slug: "aarav-sharma" },
    update: {},
    create: {
      name: "Aarav Sharma",
      slug: "aarav-sharma",
      designation: "Staff Reporter",
    },
  });

  const testSlug = `editorial-workflow-test-${Date.now()}`;
  let testArticleId = null;

  // TEST 1: Reporter creates a Draft
  console.log("Step 1: Reporter creates a draft article...");
  const createRes = await fetch(`${BASE_URL}/api/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({
      title: "India Announces Revolutionary Clean Energy Grid Expansion",
      slug: testSlug,
      excerpt: "A landmark national project connecting five southern state grids to solar capacity.",
      content: "The Ministry of Power today unveiled a massive infrastructure initiative expanding transmission lines...",
      categoryId: category.id,
      authorId: author.id,
      status: "DRAFT",
    }),
  });

  const createData = await createRes.json();
  assert(createRes.ok && createData.article, "Reporter can successfully create a DRAFT article");
  assert(createData.article?.status === "DRAFT", "Article status is initialized as DRAFT");
  assert(createData.article?.createdById === reporterUser.id, "Article is bound to Reporter createdById");
  testArticleId = createData.article?.id;

  // TEST 2: Reporter attempts direct PUBLISH (Must be 403 Forbidden)
  console.log("\nStep 2: Server-side RBAC enforcement (Reporter blocked from publishing)...");
  const publishAttemptRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });
  assert(publishAttemptRes.status === 403, "Reporter is server-side FORBIDDEN (403) from directly publishing articles");

  // TEST 3: Reporter attempts direct APPROVE (Must be 403 Forbidden)
  const approveAttemptRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({ status: "APPROVED" }),
  });
  assert(approveAttemptRes.status === 403, "Reporter is server-side FORBIDDEN (403) from directly approving articles");

  // TEST 4: Reporter Submits for Review (DRAFT -> IN_REVIEW)
  console.log("\nStep 3: Reporter submits article for editorial review...");
  const submitRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({ status: "IN_REVIEW" }),
  });
  const submitData = await submitRes.json();
  assert(submitRes.ok && submitData.article?.status === "IN_REVIEW", "Article status transitioned to IN_REVIEW");
  assert(submitData.article?.submittedAt !== null, "Article submittedAt timestamp is recorded");

  // TEST 5: Editor sees article in News Desk review queue
  console.log("\nStep 4: Editor inspects News Desk review queue...");
  const queueRes = await fetch(`${BASE_URL}/api/articles?status=IN_REVIEW`, {
    headers: {
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
  });
  const queueData = await queueRes.json();
  const foundInQueue = queueData.articles?.some(a => a.id === testArticleId);
  assert(foundInQueue, "Article appears in News Desk IN_REVIEW queue for editors");

  // TEST 6: Editor requests changes with feedback (IN_REVIEW -> DRAFT)
  console.log("\nStep 5: Editor requests revisions with editorial feedback...");
  const feedbackNote = "Please add quotes from the Power Grid Corporation chairman.";
  const requestChangesRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
    body: JSON.stringify({
      status: "DRAFT",
      reviewFeedback: feedbackNote,
    }),
  });
  const changesData = await requestChangesRes.json();
  assert(requestChangesRes.ok && changesData.article?.status === "DRAFT", "Article returned to DRAFT status");
  assert(changesData.article?.reviewFeedback === feedbackNote, "Review feedback correctly attached to article");

  // TEST 7: Reporter resubmits corrected article (DRAFT -> IN_REVIEW)
  console.log("\nStep 6: Reporter addresses feedback and resubmits...");
  const resubmitRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({
      content: "The Ministry of Power today unveiled a massive infrastructure initiative. 'This grid modernization will power 40 million homes,' stated the Power Grid Chairman.",
      status: "IN_REVIEW",
    }),
  });
  const resubmitData = await resubmitRes.json();
  assert(resubmitRes.ok && resubmitData.article?.status === "IN_REVIEW", "Reporter successfully resubmitted revised story to IN_REVIEW");

  // TEST 8: Editor approves article (IN_REVIEW -> APPROVED)
  console.log("\nStep 7: Editor approves article...");
  const approveRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
    body: JSON.stringify({
      status: "APPROVED",
      reviewFeedback: null,
    }),
  });
  const approveData = await approveRes.json();
  assert(approveRes.ok && approveData.article?.status === "APPROVED", "Article status transitioned to APPROVED");
  assert(approveData.article?.reviewedById === editorUser.id, "Article reviewedById recorded as Editor ID");

  // TEST 9: Editor schedules article (APPROVED -> SCHEDULED)
  console.log("\nStep 8: Editor schedules and publishes article...");
  const pastScheduledTime = new Date(Date.now() - 5000).toISOString(); // 5 seconds in the past for auto-sync
  const scheduleRes = await fetch(`${BASE_URL}/api/articles/${testArticleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
    body: JSON.stringify({
      status: "SCHEDULED",
      scheduledAt: pastScheduledTime,
    }),
  });
  assert(scheduleRes.ok, "Article successfully scheduled");

  // TEST 10: Auto sync promotes to PUBLISHED & verifies public visibility
  const syncArticlesRes = await fetch(`${BASE_URL}/api/articles`);
  const publicData = await syncArticlesRes.json();
  const publishedStory = publicData.articles?.find(a => a.id === testArticleId);
  assert(publishedStory && publishedStory.status === "PUBLISHED", "Scheduled article automatically promoted to PUBLISHED status");

  // TEST 11: Audit Log validation
  console.log("\nStep 9: Verifying Audit Log trail...");
  const auditRes = await fetch(`${BASE_URL}/api/audit-logs?entityType=ARTICLE`, {
    headers: {
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
  });
  const auditData = await auditRes.json();
  const hasSubmittedLog = auditData.logs?.some(l => l.entityId === testArticleId && l.action === "ARTICLE_SUBMITTED");
  const hasChangesLog = auditData.logs?.some(l => l.entityId === testArticleId && l.action === "CHANGES_REQUESTED");
  const hasApprovedLog = auditData.logs?.some(l => l.entityId === testArticleId && l.action === "ARTICLE_APPROVED");

  assert(hasSubmittedLog, "Audit log records ARTICLE_SUBMITTED event");
  assert(hasChangesLog, "Audit log records CHANGES_REQUESTED event");
  assert(hasApprovedLog, "Audit log records ARTICLE_APPROVED event");

  // Clean up test article
  await prisma.article.delete({ where: { id: testArticleId } }).catch(() => {});

  console.log("\n===============================================================");
  console.log(`NEWS DESK WORKFLOW TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log("===============================================================");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main()
  .catch(err => {
    console.error("Test error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
