const http = require("http");

http.get({ hostname: "localhost", port: 3000, path: "/" }, (res) => {
  let data = "";
  res.on("data", (c) => (data += c));
  res.on("end", () => {
    console.log("HTML length:", data.length);

    const landmarks = [
      { name: "Top Leaderboard Ad", tag: "<div class=\"w-full bg-gray-50", text: "LeaderboardAd" },
      { name: "Header Logo", tag: "<header", text: "alt=\"LEADJEN MEDIA\"" },
      { name: "Navigation", tag: "<nav", text: "INDIA" },
      { name: "Video Brief", tag: "SPECIAL LEADJEN VIDEO BRIEF" },
      { name: "Breaking News Bar", tag: "BREAKING NEWS" },
      { name: "Trending Bar", tag: "TRENDING:" },
      { name: "Live Developing", tag: "Live Developing" },
      { name: "Hero Article Title", tag: "heroHref" },
      { name: "Developing Reports (Secondary News)", tag: "Developing Reports" },
      { name: "Sidebar Video Briefing", tag: "Video Briefing" },
      { name: "Category: India", tag: "INDIA Section" },
      { name: "Video Journalism", tag: "LEADJEN VIDEO JOURNALISM" },
      { name: "Photo Journalism", tag: "LEADJEN PHOTO JOURNALISM" },
      { name: "Latest News", tag: "LATEST NEWS" },
      { name: "Editorial Dispatch", tag: "LEADJEN EDITORIAL DISPATCH" },
      { name: "Footer", tag: "<footer" },
    ];

    landmarks.forEach((l) => {
      const idx = data.indexOf(l.tag);
      console.log(`${l.name.padEnd(35, " ")}: Offset ${idx}`);
    });
  });
});
