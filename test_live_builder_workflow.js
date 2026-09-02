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

async function runLiveBuilderWorkflowTest() {
  console.log("=========================================================================================");
  console.log("        LEADJEN MEDIA — LIVE HOMEPAGE PREVIEW & PUBLISH WORKFLOW VERIFICATION           ");
  console.log("=========================================================================================\n");

  let testCount = 0;
  let passCount = 0;

  function report(testName, passed, details = "") {
    testCount++;
    if (passed) passCount++;
    console.log(`${passed ? "✓ [PASS]" : "✗ [FAIL]"} Test ${testCount}: ${testName.padEnd(52, " ")} ${details}`);
  }

  // Step 1: Baseline Reset
  const resetRes = await request("/api/homepage/reset", { method: "POST", auth: true });
  report("1. Reset Homepage Draft to Standard Baseline", resetRes.statusCode === 200, `(HTTP ${resetRes.statusCode})`);

  // Step 2: Verify Initial Public Homepage
  const publicInitial = await request("/");
  report("2. Public Homepage Serves 200 OK", publicInitial.statusCode === 200, `(${publicInitial.body.length} bytes)`);
  report(
    "3. Public Homepage Contains Initial Title",
    publicInitial.body.includes("GET THE NEWS THAT MATTERS"),
    "('GET THE NEWS THAT MATTERS' present)"
  );

  // Step 3: Security Check - Public User Accessing /?preview=draft
  const publicDraftAttempt = await request("/?preview=draft");
  report(
    "4. Unauthenticated Visitor Accessing /?preview=draft Denied Draft Access",
    publicDraftAttempt.statusCode === 200 && !publicDraftAttempt.body.includes("START YOUR DAY INFORMED"),
    "(Falls back to published homepage, draft isolation enforced)"
  );

  // Step 4: Fetch Sections for Editing
  const secRes = await request("/api/homepage/sections?draft=true", { auth: true });
  const secData = JSON.parse(secRes.body || "{}");
  const sections = secData.sections || [];
  report("5. Admin Fetches Draft Sections from PostgreSQL", sections.length > 0, `(${sections.length} sections found)`);

  // Step 5: Edit Editorial Dispatch Title in Draft
  const dispatchIndex = sections.findIndex((s) => s.type === "EDITORIAL_DISPATCH" || s.type === "NEWSLETTER");
  if (dispatchIndex !== -1) {
    sections[dispatchIndex].title = "START YOUR DAY INFORMED";
  }

  // Step 6: Save Draft (Without Publishing)
  const saveDraftRes = await request("/api/homepage/sections", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sections }),
  });
  report("6. Save Draft Changes to Database (Unpublished)", saveDraftRes.statusCode === 200, `(HTTP ${saveDraftRes.statusCode})`);

  // Step 7: Authenticated Editor Views Live Preview /?preview=draft
  const authPreview = await request("/?preview=draft", { auth: true });
  report(
    "7. Authenticated Preview Canvas Renders New Draft Headline",
    authPreview.body.includes("START YOUR DAY INFORMED"),
    "('START YOUR DAY INFORMED' visible in draft preview)"
  );

  // Step 8: CRITICAL TEST - Public Homepage MUST STILL SHOW OLD TITLE
  const publicDuringDraft = await request("/");
  report(
    "8. Public Visitors STILL See Original Published Headline",
    publicDuringDraft.body.includes("GET THE NEWS THAT MATTERS") && !publicDuringDraft.body.includes("START YOUR DAY INFORMED"),
    "(Zero draft leakage to public visitors)"
  );

  // Step 9: Publish Live
  const publishRes = await request("/api/homepage/publish", { method: "POST", auth: true });
  const publishData = JSON.parse(publishRes.body || "{}");
  report(
    "9. Admin Publishes Draft Live with Version Snapshot",
    publishRes.statusCode === 200 && !!publishData.version,
    `(Version Snapshot ID: ${publishData.version?.id})`
  );

  // Step 10: Verify Public Homepage Now Reflects Published Changes
  const publicAfterPublish = await request("/");
  report(
    "10. Public Homepage Instantly Updates to Published Headline",
    publicAfterPublish.body.includes("START YOUR DAY INFORMED"),
    "('START YOUR DAY INFORMED' is now live on public homepage)"
  );

  // Step 11: Rollback to Initial Baseline Snapshot
  const rollbackRes = await request("/api/homepage/reset", { method: "POST", auth: true });
  report("11. Rollback Baseline Restores Initial Editorial Copy", rollbackRes.statusCode === 200, `(HTTP ${rollbackRes.statusCode})`);

  const publicAfterRollback = await request("/");
  report(
    "12. Final Public Verification Confirms Intact Baseline",
    publicAfterRollback.body.includes("GET THE NEWS THAT MATTERS"),
    "('GET THE NEWS THAT MATTERS' restored)"
  );

  console.log("\n=========================================================================================");
  console.log(`WORKFLOW AUDIT RESULT: ${passCount} / ${testCount} CHECKS PASSED (${Math.round((passCount / testCount) * 100)}% SUCCESS RATE)`);
  console.log("=========================================================================================\n");

  if (passCount !== testCount) process.exit(1);
}

runLiveBuilderWorkflowTest().catch(console.error);
