async function testRedirects() {
  const routes = [
    { url: "https://leadjen-media-news.vercel.app/signup", expectedStatus: [307, 308, 200] },
    { url: "https://leadjen-media-news.vercel.app/login", expectedStatus: [307, 308, 200] },
    { url: "https://leadjen-media-news.vercel.app/account", expectedStatus: [307, 308, 200] },
    { url: "https://leadjen-media-news.vercel.app/", expectedStatus: [200] },
  ];

  for (const r of routes) {
    const res = await fetch(r.url, { redirect: "manual" });
    const location = res.headers.get("location");
    console.log(`[${res.status}] ${r.url} -> Location: ${location || "Direct"}`);
  }
}
testRedirects();
