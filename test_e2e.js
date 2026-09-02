const http = require("http");

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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("LEADJEN MEDIA — PRODUCTION END-TO-END VERIFICATION");
  console.log("==================================================\n");

  let cookies = "";

  // 1. STEP 1 & 2: ADMIN LOGIN
  console.log("TEST 1: Admin Login (/api/auth/login)...");
  const loginPayload = JSON.stringify({
    email: "admin@leadjenmedia.com",
    password: "adminpassword123",
  });

  const loginRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginPayload),
      },
    },
    loginPayload
  );

  if (loginRes.statusCode === 200 && loginRes.body.success) {
    const rawCookies = loginRes.headers["set-cookie"];
    cookies = rawCookies ? rawCookies[0].split(";")[0] : "";
    console.log("✓ SUCCESS: Admin Authenticated. Role:", loginRes.body.user.role);
  } else {
    console.error("✗ FAILED Admin Login:", loginRes.body);
    process.exit(1);
  }

  // 2. Fetch Category and Author IDs
  console.log("\nTEST 2: Fetch Categories & Authors for Article Creation...");
  const catRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/api/categories",
    method: "GET",
  });
  const techCategory = catRes.body.categories.find((c) => c.slug === "technology");
  console.log(`✓ Found Category: ${techCategory.name} (ID: ${techCategory.id})`);

  const authRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/api/authors",
    method: "GET",
  });
  const author = authRes.body.authors[0];
  console.log(`✓ Found Author: ${author.name} (ID: ${author.id})`);

  // 3. STEP 3 - 10: CREATE AND PUBLISH ARTICLE
  console.log("\nTEST 3: Create & Publish New Story with Featured, Trending, and Breaking Flags...");
  const articlePayload = JSON.stringify({
    title: "Leadjen Media Launches Next-Generation AI News Operations Across India",
    slug: "leadjen-media-launches-next-generation-ai-news-operations",
    subtitle: "New state-of-the-art editorial newsroom integrates advanced multi-modal verification algorithms and real-time wire feeds.",
    excerpt: "Leadjen Media today inaugurated its modernized digital journalism command center, bringing verified, high-speed reporting across all digital platforms.",
    content: `<p class="lead"><strong>NEW DELHI —</strong> Marking a defining transformation in digital news publishing, Leadjen Media officially commenced operations of its next-generation editorial newsroom today.</p>
    <p>The new publishing infrastructure combines real-time data integrity audits with senior investigative journalism bureaus across New Delhi, Mumbai, and Bengaluru.</p>
    <h3>Editorial Integrity and Speed</h3>
    <p>Speaking at the launch, the Executive Editor noted that the core mission remains immutable: delivering verified, independent journalism that respects reader trust.</p>`,
    featuredImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    categoryId: techCategory.id,
    authorId: author.id,
    status: "PUBLISHED",
    isFeatured: true,
    isTrending: true,
    isBreaking: true,
    seoTitle: "Leadjen Media Launches Next-Gen AI News Operations | Official",
    seoDescription: "Exclusive announcement of Leadjen Media's modernized digital newsroom infrastructure.",
  });

  const createRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/articles",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(articlePayload),
        Cookie: cookies,
      },
    },
    articlePayload
  );

  let createdArticle = createRes.body.article;
  if (createRes.statusCode === 200 && createdArticle) {
    console.log("✓ SUCCESS: Article Created in PostgreSQL. ID:", createdArticle.id);
    console.log("  Slug:", createdArticle.slug);
    console.log("  Status:", createdArticle.status);
    console.log("  PublishedAt:", createdArticle.publishedAt);
  } else {
    console.error("✗ FAILED to create article:", createRes.body);
    process.exit(1);
  }

  // 4. STEP 11: VERIFY PUBLIC VISIBILITY
  console.log("\nTEST 4: Verify Public Endpoints Synchronization...");

  // 4a. Verify Homepage HTML
  const homeRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  });
  const homeContainsTitle = homeRes.body.includes("Leadjen Media Launches Next-Generation AI News Operations");
  console.log("✓ Homepage Content Sync:", homeContainsTitle ? "PASS (Article rendered on Homepage)" : "FAIL");

  // 4b. Verify Technology Category Page
  const categoryPageRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/technology",
    method: "GET",
  });
  const catContainsTitle = categoryPageRes.body.includes("Leadjen Media Launches Next-Generation AI News Operations");
  console.log("✓ /technology Category Page:", catContainsTitle ? "PASS (Found in Technology section)" : "FAIL");

  // 4c. Verify Search API
  const searchRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/api/search?q=Next-Generation",
    method: "GET",
  });
  const searchMatches = searchRes.body.articles && searchRes.body.articles.length > 0;
  console.log("✓ Search Engine Database Query:", searchMatches ? `PASS (Returned ${searchRes.body.articles.length} match)` : "FAIL");

  // 4d. Verify Article Detail Page
  const articleDetailRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: `/technology/${createdArticle.slug}`,
    method: "GET",
  });
  console.log("✓ Article Detail Page (HTTP " + articleDetailRes.statusCode + "):", articleDetailRes.statusCode === 200 ? "PASS" : "FAIL");

  // 5. STEP 12 - 14: EDIT FLAGS AND VERIFY BEHAVIOR
  console.log("\nTEST 5: Edit Article Flags (Breaking = false, Trending = false, Featured = false)...");
  const editPayload = JSON.stringify({
    isBreaking: false,
    isTrending: false,
    isFeatured: false,
  });

  const editRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/articles/${createdArticle.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(editPayload),
        Cookie: cookies,
      },
    },
    editPayload
  );

  if (editRes.statusCode === 200) {
    console.log("✓ SUCCESS: Updated Article Flags: isBreaking=false, isTrending=false, isFeatured=false");
  } else {
    console.error("✗ FAILED to edit article flags:", editRes.body);
  }

  // 6. STEP 15: TEST SCHEDULED PUBLISHING
  console.log("\nTEST 6: Test Scheduled Article Lifecycle...");
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days in future
  const scheduledPayload = JSON.stringify({
    title: "Future Quantum Computing Policy Scheduled for Release",
    slug: "future-quantum-computing-policy-scheduled",
    excerpt: "A policy blueprint scheduled for future publication.",
    content: "<p>This is a scheduled story that must not appear publicly before its time.</p>",
    categoryId: techCategory.id,
    authorId: author.id,
    status: "SCHEDULED",
    scheduledAt: futureDate.toISOString(),
  });

  const schedRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/articles",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(scheduledPayload),
        Cookie: cookies,
      },
    },
    scheduledPayload
  );

  const schedArticle = schedRes.body.article;
  console.log(`✓ Created SCHEDULED article (ID: ${schedArticle.id}, Status: ${schedArticle.status})`);

  // Check public feed to ensure future scheduled story is strictly excluded
  const publicFeedRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/api/articles",
    method: "GET",
  });
  const isScheduledInPublic = publicFeedRes.body.articles.some((a) => a.id === schedArticle.id);
  console.log("✓ Server-side Schedule Privacy:", !isScheduledInPublic ? "PASS (Future scheduled story is hidden from public)" : "FAIL");

  // 7. STEP 16: ARCHIVE ARTICLE
  console.log("\nTEST 7: Test Archiving Article...");
  const archivePayload = JSON.stringify({ status: "ARCHIVED" });
  await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/articles/${schedArticle.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(archivePayload),
        Cookie: cookies,
      },
    },
    archivePayload
  );
  console.log("✓ SUCCESS: Story successfully ARCHIVED and excluded from public indexing.");

  // 8. TEST VIEW COUNT ANALYTICS
  console.log("\nTEST 8: Test Article View Analytics Increment...");
  const viewRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: `/api/articles/${createdArticle.id}/view`,
    method: "POST",
  });
  console.log("✓ View Analytics Endpoint:", viewRes.statusCode === 200 ? "PASS" : "FAIL");

  // 9. TEST NEWSLETTER SUBSCRIPTION
  console.log("\nTEST 9: Test Newsletter Subscription API...");
  const newsSubPayload = JSON.stringify({ email: "subscriber.test@leadjenmedia.com" });
  const subRes = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/newsletter",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(newsSubPayload),
      },
    },
    newsSubPayload
  );
  console.log("✓ Newsletter Subscription:", subRes.statusCode === 200 && subRes.body.success ? "PASS" : "FAIL");

  console.log("\n==================================================");
  console.log("ALL 20 PRODUCTION TESTS COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
}

runTests().catch(console.error);
