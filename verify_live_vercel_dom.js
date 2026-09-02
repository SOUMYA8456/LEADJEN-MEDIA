/**
 * VERIFY LIVE VERCEL DOM & CONTENT
 */

const VERCEL_URL = "https://leadjen-media-news.vercel.app";

async function verifyLiveDom() {
  console.log("=== FETCHING LIVE VERCEL HOMEPAGE HTML ===");
  const res = await fetch(VERCEL_URL);
  const html = await res.text();

  console.log(`HTTP Status: ${res.status}`);
  console.log(`HTML Length: ${html.length} bytes`);

  const checks = [
    { label: "Official Brand Logo", needle: "LEADJEN MEDIA" },
    { label: "Category Navigation Bar", needle: "INDIA" },
    { label: "Breaking News Ticker", needle: "BREAKING" },
    { label: "Main Editorial Hero Headlines", needle: "High-Speed Strategic Rail" },
    { label: "Secondary Headlines Grid", needle: "Photonic Computing" },
    { label: "Category Sections", needle: "WORLD" },
    { label: "Video Journalism Section", needle: "Cleanroom" },
    { label: "Photo Journalism Section", needle: "Varanasi" },
    { label: "Latest News Grid", needle: "Developing" },
    { label: "Leadjen Editorial Dispatch / Get The News That Matters", needle: "EDITORIAL DISPATCH" },
    { label: "5-Column Editorial Footer", needle: "LEADJEN NEWS DESKS" },
  ];

  let passed = 0;
  for (const c of checks) {
    if (html.includes(c.needle)) {
      console.log(`  ✓ [FOUND] ${c.label}`);
      passed++;
    } else {
      console.error(`  ❌ [MISSING] ${c.label} (Searched for '${c.needle}')`);
    }
  }

  console.log(`\nDOM VERIFICATION SUMMARY: ${passed} / ${checks.length} CHECKS PASSED`);
}

verifyLiveDom().catch(console.error);
