export interface EditorialValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutSettingsData {
  id: string;
  heroHeading: string;
  heroSubtitle: string;
  introduction: string;

  // CEO Profile
  ceoName: string;
  ceoDesignation: string;
  ceoBio: string;
  ceoMessage: string;
  ceoPhoto: string;
  ceoTwitter: string;
  ceoLinkedin: string;
  ceoEmail: string;

  // Mission & Vision
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;

  // Values
  valuesTitle: string;
  values: EditorialValueItem[];

  // Coverage
  coverageTitle: string;
  coverageText: string;
}

export const DEFAULT_EDITORIAL_VALUES: EditorialValueItem[] = [
  {
    id: "val_1",
    title: "Accuracy",
    description: "Rigorous multi-source verification, independent corroboration, and transparent corrections on every news dispatch.",
    icon: "CheckCircle",
  },
  {
    id: "val_2",
    title: "Independence",
    description: "Uncompromising editorial autonomy free from political, corporate, or external pressures.",
    icon: "Shield",
  },
  {
    id: "val_3",
    title: "Transparency",
    description: "Clear attribution, open methodologies, and full accountability to our readers and the public.",
    icon: "Eye",
  },
  {
    id: "val_4",
    title: "Public Interest",
    description: "Reporting that illuminates issues critical to democracy, constitutional rights, governance, and community welfare.",
    icon: "Scale",
  },
];

export const DEFAULT_ABOUT_SETTINGS: AboutSettingsData = {
  id: "default",
  heroHeading: "ABOUT LEADJEN MEDIA",
  heroSubtitle: "Independent Journalism. Trusted Perspectives. Stories That Matter.",
  introduction:
    "Leadjen Media is an independent digital news publishing and media enterprise dedicated to authoritative journalism, investigative depth, cultural insight, and public-interest reporting. Our newsroom operates with unwavering commitment to accuracy, balance, and editorial integrity.",

  // CEO Profile
  ceoName: "CEO & Director",
  ceoDesignation: "Chief Executive Officer & Director",
  ceoBio:
    "Directs Leadjen Media Daily's strategic editorial mission, nationwide investigative bureau network, multi-format newsroom operations, and digital journalism innovation.",
  ceoMessage:
    "In an era of relentless information noise, our newsroom stands for unflinching independence, verified reporting, and stories that matter. We believe ethical journalism is not merely an industry—it is a vital pillar of a free and informed society.",
  ceoPhoto:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
  ceoTwitter: "https://x.com/leadjenmedia",
  ceoLinkedin: "https://linkedin.com/company/leadjenmedia",
  ceoEmail: "editorial@leadjenmedia.com",

  // Mission & Vision
  missionTitle: "OUR MISSION",
  missionText:
    "To provide verified, non-partisan, and impactful journalism that holds institutions accountable, illuminates complex national and international affairs, and serves the public good.",
  visionTitle: "OUR VISION",
  visionText:
    "To build India's most trusted and technologically advanced digital news ecosystem, combining journalistic integrity with cutting-edge multimedia storytelling.",

  // Values
  valuesTitle: "OUR EDITORIAL VALUES",
  values: DEFAULT_EDITORIAL_VALUES,

  // Coverage
  coverageTitle: "WHAT WE COVER",
  coverageText:
    "Authoritative dispatches, investigative deep dives, and real-time coverage across core national, regional, and international beats.",
};

export interface DemoEmployeeItem {
  name: string;
  designation: string;
  bio: string;
  photo: string;
  order: number;
  status: "PUBLISHED" | "DRAFT";
  isDemo: boolean;
  twitter?: string;
  linkedin?: string;
  email?: string;
}

export const DEFAULT_DEMO_EMPLOYEES: DemoEmployeeItem[] = [
  {
    name: "Employee 01",
    designation: "Editor-in-Chief",
    bio: "Oversees daily newsroom operations, investigative reporting standards, editorial board policies, and special coverage projects.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    order: 1,
    status: "PUBLISHED",
    isDemo: true,
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    email: "editor@leadjenmedia.com",
  },
  {
    name: "Employee 02",
    designation: "Senior News Correspondent",
    bio: "Specializes in national political developments, parliamentary coverage, governance analysis, and public policy dispatches.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    order: 2,
    status: "PUBLISHED",
    isDemo: true,
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    email: "correspondent@leadjenmedia.com",
  },
  {
    name: "Employee 03",
    designation: "Video & Multimedia Producer",
    bio: "Directs documentary features, on-ground broadcast journalism, daily video briefs, and special visual dispatches.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    order: 3,
    status: "PUBLISHED",
    isDemo: true,
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    email: "multimedia@leadjenmedia.com",
  },
  {
    name: "Employee 04",
    designation: "Digital Content Editor",
    bio: "Manages real-time news publishing, data journalism graphics, digital storytelling, and reader engagement initiatives.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    order: 4,
    status: "PUBLISHED",
    isDemo: true,
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    email: "digital@leadjenmedia.com",
  },
];
