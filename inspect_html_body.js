const http = require("http");

http.get({ hostname: "localhost", port: 3000, path: "/" }, (res) => {
  let data = "";
  res.on("data", (c) => (data += c));
  res.on("end", () => {
    // Cut off Next.js hydration scripts at the end of the body
    const scriptIndex = data.indexOf("<script>(self.__next_f");
    const cleanHtml = scriptIndex !== -1 ? data.substring(0, scriptIndex) : data;

    console.log("Clean HTML length (before hydration script):", cleanHtml.length);

    const landmarks = [
      { name: "Top Leaderboard Ad", match: "Advertisement" },
      { name: "Header Logo", match: "alt=\"LEADJEN MEDIA\"" },
      { name: "Category Navigation", match: "href=\"/travel\"" },
      { name: "Special Leadjen Video Brief", match: "SPECIAL LEADJEN VIDEO BRIEF" },
      { name: "Breaking News Bar", match: "BREAKING NEWS" },
      { name: "Trending Bar", match: "TRENDING:" },
      { name: "Live Developing", match: "Live Developing" },
      { name: "Main Hero Headline", match: "Lead Stories" },
      { name: "Secondary News Grid", match: "Developing Reports" },
      { name: "Sidebar Video Briefing", match: "Video Briefing" },
      { name: "Category: India Desk", match: "INDIA" },
      { name: "Leadjen Video Journalism", match: "LEADJEN VIDEO JOURNALISM" },
      { name: "Photo Journalism", match: "LEADJEN PHOTO JOURNALISM" },
      { name: "Latest News", match: "LATEST NEWS" },
      { name: "Leadjen Editorial Dispatch", match: "GET THE NEWS THAT MATTERS" },
      { name: "Footer", match: "© 2026 LEADJEN MEDIA. All rights reserved." },
    ];

    landmarks.forEach((l) => {
      const idx = cleanHtml.indexOf(l.match);
      console.log(`${l.name.padEnd(35, " ")}: Offset ${idx}`);
    });
  });
});
