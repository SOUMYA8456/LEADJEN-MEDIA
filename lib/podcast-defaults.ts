export interface AudioEpisode {
  id: string;
  title: string;
  series: string;
  duration: string;
  publishedAt: string;
  description: string;
  coverImage: string;
  category: string;
  host: string;
  audioUrl?: string;
}

export const DEFAULT_PODCAST_EPISODES: AudioEpisode[] = [
  {
    id: "ep-1",
    title: "Leadjen Daily Brief: Global Trade Policy Shifts, Semiconductor Corridors & Market Open",
    series: "Leadjen Daily Brief",
    duration: "08:45",
    publishedAt: "Today • 06:30 AM IST",
    description: "An executive morning briefing breaking down India's high-tech manufacturing push, energy security agreements, and key market indicators for the trading session ahead.",
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    category: "Daily Briefing",
    host: "Aarav Sharma & Editorial Desk",
    audioUrl: "",
  },
  {
    id: "ep-2",
    title: "Inside the AI Sovereign Compute Race: How Nations Are Building National Infrastructure",
    series: "Tech Dispatches",
    duration: "24:18",
    publishedAt: "Yesterday",
    description: "An investigative deep dive into the massive capital investments, silicon supply chains, and power grid bottlenecks shaping modern computing dominance.",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    category: "Technology",
    host: "Vikram Malhotra",
    audioUrl: "",
  },
  {
    id: "ep-3",
    title: "The Closing Bell: Central Bank Rate Trajectories and Asian Equity Momentum",
    series: "Business & Markets",
    duration: "14:20",
    publishedAt: "Aug 30, 2026",
    description: "Comprehensive market recap analyzing foreign institutional flows, currency valuations, and major earnings reports.",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    category: "Business",
    host: "Priya Nair",
    audioUrl: "",
  },
  {
    id: "ep-4",
    title: "Geopolitics Unfolded: Maritime Security Corridors and Southern Hemisphere Trade Routes",
    series: "World Brief",
    duration: "19:50",
    publishedAt: "Aug 29, 2026",
    description: "Foreign affairs editors analyze naval diplomacy, supply chain diversification, and newly signed multilateral infrastructure pacts.",
    coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    category: "World",
    host: "Global Bureau Team",
    audioUrl: "",
  },
  {
    id: "ep-5",
    title: "Clean Grid Transition: The Real Engineering Challenges of Round-the-Clock Renewables",
    series: "Special Investigations",
    duration: "28:10",
    publishedAt: "Aug 28, 2026",
    description: "A technical yet accessible discussion on pumped hydro storage, battery chemistry breakthroughs, and high-voltage direct current transmission lines.",
    coverImage: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
    category: "Science",
    host: "Rohan Sengupta",
    audioUrl: "",
  },
];
