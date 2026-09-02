const http = require("http");

http.get({ hostname: "localhost", port: 3000, path: "/" }, (res) => {
  let data = "";
  res.on("data", (c) => (data += c));
  res.on("end", () => {
    const chunk = data.substring(26995, 74373);
    console.log("Chunk length:", chunk.length);
    const headings = chunk.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/g) || [];
    console.log("Headings between Secondary News and Video Journalism:");
    headings.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.replace(/<[^>]+>/g, "").trim()}`);
    });
  });
});
