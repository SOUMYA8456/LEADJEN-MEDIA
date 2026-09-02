const fs = require('fs');

async function checkDetails() {
  const res = await fetch("https://leadjen-media-news.vercel.app");
  const html = await res.text();
  console.log("Has 'Photo Journalism':", html.includes("Photo Journalism") || html.includes("PHOTO"));
  console.log("Has 'LEADJEN NETWORK':", html.includes("LEADJEN NETWORK"));
  console.log("Has 'Get The News That Matters':", html.includes("GET THE NEWS THAT MATTERS") || html.includes("Get The News That Matters") || html.includes("EDITORIAL DISPATCH"));
  console.log("Has 'India':", html.includes("India"));
  console.log("Has 'Technology':", html.includes("Technology"));
}
checkDetails();
