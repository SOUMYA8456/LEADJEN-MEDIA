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
          contentType: res.headers['content-type'],
          size: body.length,
          snippet: body.slice(0, 300),
          includes: (str) => body.includes(str),
        });
      });
    }).on('error', (e) => {
      resolve({ url, status: 0, error: e.message });
    });
  });
}

async function runLiveAudit() {
  console.log('====================================================');
  console.log('LIVE VERCEL PRODUCTION REAL-TIME & EDITORIAL AUDIT');
  console.log('====================================================\n');

  const BASE = 'https://leadjen-media-news.vercel.app';

  // 1. SSE Stream
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
  console.log('1. /api/realtime/stream:');
  console.log(`   Status: ${sse.status}`);
  console.log(`   Content-Type: ${sse.contentType}`);

  // 2. Breaking News API
  const breaking = await checkUrl(`${BASE}/api/breaking`);
  console.log('\n2. /api/breaking:');
  console.log(`   Status: ${breaking.status}`);
  console.log(`   Returns Breaking Items: ${breaking.includes('breaking')}`);

  // 3. Live Desk API
  const liveApi = await checkUrl(`${BASE}/api/live`);
  console.log('\n3. /api/live:');
  console.log(`   Status: ${liveApi.status}`);
  console.log(`   Returns Live Updates: ${liveApi.includes('liveUpdates')}`);

  // 4. Public /live Page
  const livePage = await checkUrl(`${BASE}/live`);
  console.log('\n4. /live Public Page:');
  console.log(`   Status: ${livePage.status}`);
  console.log(`   Contains Live Stream Engine: ${livePage.includes('LIVE')}`);

  // 5. Public Homepage & Ticker
  const home = await checkUrl(`${BASE}`);
  console.log('\n5. Homepage & Ticker:');
  console.log(`   Status: ${home.status}`);
  console.log(`   Contains Breaking Ticker: ${home.includes('BREAKING NEWS')}`);

  // 6. Robots & Sitemaps
  const robots = await checkUrl(`${BASE}/robots.txt`);
  const newsSitemap = await checkUrl(`${BASE}/news-sitemap.xml`);
  const rss = await checkUrl(`${BASE}/rss.xml`);
  console.log('\n6. SEO & Syndication Integrity:');
  console.log(`   robots.txt: ${robots.status}`);
  console.log(`   news-sitemap.xml: ${newsSitemap.status}`);
  console.log(`   rss.xml: ${rss.status}`);

  console.log('\n====================================================');
  console.log('ALL LIVE PRODUCTION CHECKS COMPLETED');
  console.log('====================================================');
}

runLiveAudit();
