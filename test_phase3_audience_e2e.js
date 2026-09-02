/**
 * LEADJEN MEDIA - PHASE 3: AUDIENCE & READER ENGAGEMENT SYSTEM END-TO-END TEST
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "leadjen_media_editorial_secure_jwt_key_2026";
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
    { expiresIn: "7d" }
  );
}

async function main() {
  console.log("===============================================================");
  console.log("LEADJEN MEDIA — PHASE 3: AUDIENCE & READER ENGAGEMENT TESTS");
  console.log("===============================================================\n");

  const testReaderEmail1 = "vikram.reader1@leadjenmedia.com";
  const testReaderEmail2 = "ananya.reader2@leadjenmedia.com";
  const reporterEmail = "reporter.test@leadjenmedia.com";
  const editorEmail = "editor.test@leadjenmedia.com";
  const adminEmail = "admin.test@leadjenmedia.com";

  // Clean up any existing test reader accounts first
  await prisma.user.deleteMany({
    where: { email: { in: [testReaderEmail1, testReaderEmail2] } },
  }).catch(() => {});

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

  // Get a published article and category for testing
  const sampleArticle = await prisma.article.findFirst({
    where: { status: "PUBLISHED" },
    include: { category: true },
  });

  const sampleCategory = await prisma.category.findFirst();

  let reader1Token = null;
  let reader1Id = null;
  let reader2Token = null;
  let reader2Id = null;
  let testCommentId = null;
  let spamCommentId = null;

  // TEST 1: Reader Registration
  console.log("TEST 1: Reader Registration & Session Initialization...");
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Vikram Malhotra",
      email: testReaderEmail1,
      password: "readerpassword123",
      confirmPassword: "readerpassword123",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    }),
  });

  const registerData = await registerRes.json();
  assert(registerRes.ok && registerData.user, "Reader account registered successfully");
  assert(registerData.user?.role === "READER", "Registered account is strictly assigned READER role");
  reader1Id = registerData.user?.id;
  reader1Token = await createToken(registerData.user);

  // Register Reader 2 (for permission testing)
  const reader2User = await prisma.user.create({
    data: {
      name: "Ananya Deshmukh",
      email: testReaderEmail2,
      passwordHash,
      role: "READER",
    },
  });
  reader2Id = reader2User.id;
  reader2Token = await createToken(reader2User);

  // TEST 2: Bookmarks / Save Article & Remove
  console.log("\nTEST 2: Bookmark / Save Story & Unsave Lifecycle...");
  const saveRes = await fetch(`${BASE_URL}/api/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reader1Token}`,
    },
    body: JSON.stringify({ articleId: sampleArticle.id }),
  });
  const saveData = await saveRes.json();
  assert(saveRes.ok && saveData.isSaved === true, "Reader successfully saved article");

  const checkBookmarkRes = await fetch(`${BASE_URL}/api/bookmarks/check?articleId=${sampleArticle.id}`, {
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  const checkBookmarkData = await checkBookmarkRes.json();
  assert(checkBookmarkData.isSaved === true, "Bookmark check confirmed saved status");

  const savedListRes = await fetch(`${BASE_URL}/api/bookmarks?sort=newest`, {
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  const savedListData = await savedListRes.json();
  assert(savedListData.bookmarks?.some(b => b.article?.id === sampleArticle.id), "Saved story appears in /api/bookmarks reader archive");

  const removeBookmarkRes = await fetch(`${BASE_URL}/api/bookmarks?articleId=${sampleArticle.id}`, {
    method: "DELETE",
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  const removeBookmarkData = await removeBookmarkRes.json();
  assert(removeBookmarkData.isSaved === false, "Reader successfully unsaved / removed bookmark");

  // TEST 3: Category Follow & Unfollow
  console.log("\nTEST 3: Category Following (Interests)...");
  const followRes = await fetch(`${BASE_URL}/api/categories/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reader1Token}`,
    },
    body: JSON.stringify({ categoryId: sampleCategory.id }),
  });
  const followData = await followRes.json();
  assert(followRes.ok && followData.isFollowing === true, "Reader followed news category");

  const followsListRes = await fetch(`${BASE_URL}/api/categories/follow`, {
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  const followsListData = await followsListRes.json();
  assert(followsListData.follows?.some(f => f.category?.id === sampleCategory.id), "Followed category appears in reader interests");

  const unfollowRes = await fetch(`${BASE_URL}/api/categories/follow?categoryId=${sampleCategory.id}`, {
    method: "DELETE",
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  const unfollowData = await unfollowRes.json();
  assert(unfollowData.isFollowing === false, "Reader unfollowed news category");

  // TEST 4: Comments Submission & Default PENDING Status + XSS Sanitization
  console.log("\nTEST 4: Comment Submission & XSS Sanitization...");
  const commentPostRes = await fetch(`${BASE_URL}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reader1Token}`,
    },
    body: JSON.stringify({
      articleId: sampleArticle.id,
      content: "<script>alert('xss')</script>This investigative dispatch reveals critical regulatory oversight.",
    }),
  });
  const commentPostData = await commentPostRes.json();
  assert(commentPostRes.ok && commentPostData.comment, "Reader posted comment");
  assert(commentPostData.comment?.status === "PENDING", "New comment defaults to PENDING status");
  assert(!commentPostData.comment?.content.includes("<script>"), "Dangerous script tags stripped from comment content");
  testCommentId = commentPostData.comment?.id;

  // Verify not visible on public unauthenticated fetch
  const publicCommentsRes = await fetch(`${BASE_URL}/api/comments?articleId=${sampleArticle.id}`);
  const publicCommentsData = await publicCommentsRes.json();
  const foundPendingPublicly = publicCommentsData.comments?.some(c => c.id === testCommentId);
  assert(!foundPendingPublicly, "Pending unmoderated comment is NOT visible to public anonymous readers");

  // TEST 5: Reader edits own comment
  console.log("\nTEST 5: Reader edits own comment...");
  const editCommentRes = await fetch(`${BASE_URL}/api/comments/${testCommentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reader1Token}`,
    },
    body: JSON.stringify({
      content: "This investigative dispatch reveals critical regulatory oversight. (Updated analysis)",
    }),
  });
  const editCommentData = await editCommentRes.json();
  assert(editCommentRes.ok && editCommentData.comment?.isEdited === true, "Reader successfully edited own comment");

  // TEST 6: Reader 2 attempts to edit Reader 1's comment (MUST FAIL 403)
  console.log("\nTEST 6: Cross-User Comment Edit Permission Defense...");
  const crossEditRes = await fetch(`${BASE_URL}/api/comments/${testCommentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reader2Token}`,
    },
    body: JSON.stringify({ content: "Malicious unauthorized override" }),
  });
  assert(crossEditRes.status === 403, "Reader 2 is server-side FORBIDDEN (403) from editing Reader 1's comment");

  // TEST 7: Reader attempts to access /admin/news-desk or admin comment API (MUST FAIL 403)
  console.log("\nTEST 7: Reader Blocked from Admin Routes & Endpoints...");
  const readerAdminAttempt = await fetch(`${BASE_URL}/api/comments/admin`, {
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  assert(readerAdminAttempt.status === 403, "Reader is FORBIDDEN (403) from accessing admin moderation API");

  // TEST 8: Reporter attempts to moderate comment (MUST FAIL 403)
  console.log("\nTEST 8: Reporter Blocked from Comment Moderation...");
  const reporterModAttempt = await fetch(`${BASE_URL}/api/comments/${testCommentId}/moderate`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reporterToken}`,
    },
    body: JSON.stringify({ status: "APPROVED" }),
  });
  assert(reporterModAttempt.status === 403, "Reporter is server-side FORBIDDEN (403) from moderating comments");

  // TEST 9: Editor approves comment
  console.log("\nTEST 9: Editor Approves Comment...");
  const editorModRes = await fetch(`${BASE_URL}/api/comments/${testCommentId}/moderate`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${editorToken}`,
    },
    body: JSON.stringify({ status: "APPROVED" }),
  });
  const editorModData = await editorModRes.json();
  assert(editorModRes.ok && editorModData.comment?.status === "APPROVED", "Editor successfully approved comment");

  const publicCommentsAfterApproval = await fetch(`${BASE_URL}/api/comments?articleId=${sampleArticle.id}`);
  const publicDataAfterApproval = await publicCommentsAfterApproval.json();
  const approvedFoundPublicly = publicDataAfterApproval.comments?.some(c => c.id === testCommentId);
  assert(approvedFoundPublicly, "Approved comment is now publicly visible on article page");

  // TEST 10: Spam Comment Moderation
  console.log("\nTEST 10: Mark Spam Comment & Verify Hidden Publicly...");
  const spamPost = await prisma.comment.create({
    data: {
      articleId: sampleArticle.id,
      authorName: "Spambot",
      authorEmail: "bot@spam.com",
      content: "Buy cheap crypto loans here http://spam.xyz",
      status: "PENDING",
    },
  });
  spamCommentId = spamPost.id;

  const markSpamRes = await fetch(`${BASE_URL}/api/comments/${spamCommentId}/moderate`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${adminToken}`,
    },
    body: JSON.stringify({ status: "SPAM" }),
  });
  assert(markSpamRes.ok, "Super Admin marked comment as SPAM");

  const publicCheckSpam = await fetch(`${BASE_URL}/api/comments?articleId=${sampleArticle.id}`);
  const publicSpamData = await publicCheckSpam.json();
  const spamFound = publicSpamData.comments?.some(c => c.id === spamCommentId);
  assert(!spamFound, "SPAM comment is strictly hidden from public article readers");

  // TEST 11: Reader In-App Notifications
  console.log("\nTEST 11: Reader Notifications & Read State...");
  const notifRes = await fetch(`${BASE_URL}/api/reader-notifications`, {
    headers: { "Cookie": `leadjen_admin_session=${reader1Token}` },
  });
  const notifData = await notifRes.json();
  assert(notifData.notifications?.length > 0, "Reader received welcome notification");

  const markReadRes = await fetch(`${BASE_URL}/api/reader-notifications`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${reader1Token}`,
    },
    body: JSON.stringify({ markAll: true }),
  });
  assert(markReadRes.ok, "Reader marked all notifications as read");

  // TEST 12: Admin Reader Management (Suspend & Reactivate)
  console.log("\nTEST 12: Admin Reader Directory & Suspension Enforcement...");
  const adminReadersRes = await fetch(`${BASE_URL}/api/admin/readers`, {
    headers: { "Cookie": `leadjen_admin_session=${adminToken}` },
  });
  const adminReadersData = await adminReadersRes.json();
  assert(adminReadersData.readers?.some(r => r.id === reader1Id), "Reader appears in Admin Reader Community Directory");

  const suspendRes = await fetch(`${BASE_URL}/api/admin/readers`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${adminToken}`,
    },
    body: JSON.stringify({ readerId: reader1Id, action: "SUSPEND" }),
  });
  assert(suspendRes.ok, "Super Admin suspended reader account");

  const suspendedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testReaderEmail1, password: "readerpassword123" }),
  });
  assert(suspendedLoginRes.status === 403, "Suspended reader is blocked (403) from logging in");

  const reactivateRes = await fetch(`${BASE_URL}/api/admin/readers`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `leadjen_admin_session=${adminToken}`,
    },
    body: JSON.stringify({ readerId: reader1Id, action: "REACTIVATE" }),
  });
  assert(reactivateRes.ok, "Super Admin reactivated reader account");

  // Cleanup
  await prisma.user.deleteMany({
    where: { email: { in: [testReaderEmail1, testReaderEmail2] } },
  }).catch(() => {});

  await prisma.comment.deleteMany({
    where: { id: { in: [testCommentId, spamCommentId].filter(Boolean) } },
  }).catch(() => {});

  console.log("\n===============================================================");
  console.log(`PHASE 3 AUDIENCE & READER TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log("===============================================================");
}

main().catch(console.error);
