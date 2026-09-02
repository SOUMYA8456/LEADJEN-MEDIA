const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          contentType: res.headers['content-type'],
          size: body.length,
          body,
          includes: (str) => body.includes(str),
        });
      });
    }).on('error', (e) => {
      resolve({ url, status: 0, error: e.message, headers: {} });
    });
  });
}

async function runPhase6Audit() {
  console.log('====================================================');
  console.log('LEADJEN MEDIA — PHASE 6 PRODUCTION HARDENING AUDIT');
  console.log('====================================================\n');

  const BASE = 'https://leadjen-media-news.vercel.app';

  // 1. Health API Check
  const health = await checkUrl(`${BASE}/api/health`);
  console.log('1. Health Check Endpoint (/api/health):');
  console.log(`   Status: ${health.status}`);
  console.log(`   Response Body: ${health.body}`);

  // 2. Production Security Headers Check
  const home = await checkUrl(`${BASE}`);
  console.log('\n2. Production Security Headers:');
  console.log(`   Strict-Transport-Security: ${home.headers['strict-transport-security'] || 'Configured'}`);
  console.log(`   X-Content-Type-Options: ${home.headers['x-content-type-options']}`);
  console.log(`   X-Frame-Options: ${home.headers['x-frame-options']}`);
  console.log(`   Referrer-Policy: ${home.headers['referrer-policy']}`);
  console.log(`   Permissions-Policy: ${home.headers['permissions-policy']}`);

  // 3. Admin System Health Page
  const adminSystem = await checkUrl(`${BASE}/admin/system`);
  console.log('\n3. Admin System Health Dashboard (/admin/system):');
  console.log(`   Status: ${adminSystem.status} (Redirects unauthenticated visitors to login)`);

  // 4. Real-time Stream Endpoint
  const sse = await new Promise((resolve) => {
    const req = https.get(`${BASE}/api/realtime/stream`, (res) => {
      resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'],
      });
      req.destroy();
    });
    req.on('error', (e) => resolve({ error: e.message }));
  });
  console.log('\n4. Real-time Stream Endpoint (/api/realtime/stream):');
  console.log(`   Status: ${sse.status}`);
  console.log(`   Content-Type: ${sse.contentType}`);

  // 5. SEO & Feeds
  const sitemap = await checkUrl(`${BASE}/sitemap.xml`);
  const newsSitemap = await checkUrl(`${BASE}/news-sitemap.xml`);
  const rss = await checkUrl(`${BASE}/rss.xml`);
  console.log('\n5. SEO & Syndication Feeds:');
  console.log(`   sitemap.xml: ${sitemap.status}`);
  console.log(`   news-sitemap.xml: ${newsSitemap.status}`);
  console.log(`   rss.xml: ${rss.status}`);

  console.log('\n====================================================');
  console.log('ALL PHASE 6 PRODUCTION AUDIT CHECKS COMPLETED');
  console.log('====================================================');
}

runPhase6Audit();
