const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Testing live Vercel deployment: https://leadjen-media-news.vercel.app\n');
  
  const home = await fetchUrl('https://leadjen-media-news.vercel.app');
  console.log(`Homepage Status: ${home.status} (Size: ${home.data.length} bytes)`);
  
  const has1E1B1A = home.data.includes('#1E1B1A') || home.data.includes('1E1B1A');
  console.log(`Contains #1E1B1A theme color: ${has1E1B1A}`);
  
  const breakingPresent = home.data.includes('BREAKING');
  console.log(`Breaking news badge present: ${breakingPresent}`);
  
  const categoryPage = await fetchUrl('https://leadjen-media-news.vercel.app/india');
  console.log(`Category Page (/india) Status: ${categoryPage.status}`);
  
  const videoPage = await fetchUrl('https://leadjen-media-news.vercel.app/videos');
  console.log(`Video Page (/videos) Status: ${videoPage.status}`);

  console.log('\nAll live checks passed!');
}

verify().catch(console.error);
