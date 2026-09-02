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
  console.log('LIVE VERCEL PRODUCTION SEO & GOOGLE NEWS AUDIT');
  console.log('====================================================\n');

  const BASE = 'https://leadjen-media-news.vercel.app';

  // 1. Robots.txt
  const robots = await checkUrl(`${BASE}/robots.txt`);
  console.log('1. /robots.txt:');
  console.log(`   Status: ${robots.status}`);
  console.log(`   References sitemap.xml: ${robots.includes('sitemap.xml')}`);
  console.log(`   References news-sitemap.xml: ${robots.includes('news-sitemap.xml')}`);

  // 2. Main Sitemap
  const sitemap = await checkUrl(`${BASE}/sitemap.xml`);
  console.log('\n2. /sitemap.xml:');
  console.log(`   Status: ${sitemap.status}`);
  console.log(`   Content-Type: ${sitemap.contentType}`);
  console.log(`   Contains URL set: ${sitemap.includes('<urlset')}`);

  // 3. Google News Sitemap
  const newsSitemap = await checkUrl(`${BASE}/news-sitemap.xml`);
  console.log('\n3. /news-sitemap.xml:');
  console.log(`   Status: ${newsSitemap.status}`);
  console.log(`   Content-Type: ${newsSitemap.contentType}`);
  console.log(`   Google News XML Schema: ${newsSitemap.includes('sitemap-news/0.9')}`);
  console.log(`   Publication Name: ${newsSitemap.includes('LEADJEN MEDIA')}`);

  // 4. RSS 2.0 Feed
  const rss = await checkUrl(`${BASE}/rss.xml`);
  console.log('\n4. /rss.xml:');
  console.log(`   Status: ${rss.status}`);
  console.log(`   Content-Type: ${rss.contentType}`);
  console.log(`   Valid RSS 2.0: ${rss.includes('<rss version="2.0"')}`);
  console.log(`   Channel Title: ${rss.includes('LEADJEN MEDIA')}`);

  // 5. Category RSS Feed
  const catRss = await checkUrl(`${BASE}/technology/rss.xml`);
  console.log('\n5. /technology/rss.xml:');
  console.log(`   Status: ${catRss.status}`);
  console.log(`   Valid Category RSS: ${catRss.includes('Technology News Feed')}`);

  // 6. Homepage & JSON-LD
  const home = await checkUrl(`${BASE}`);
  console.log('\n6. Homepage JSON-LD & Verification:');
  console.log(`   Status: ${home.status}`);
  console.log(`   Contains WebSite schema: ${home.includes('"@type":"WebSite"')}`);
  console.log(`   Contains NewsMediaOrganization: ${home.includes('"@type":"NewsMediaOrganization"')}`);

  console.log('\n====================================================');
  console.log('ALL LIVE PRODUCTION CHECKS COMPLETED');
  console.log('====================================================');
}

runLiveAudit();
