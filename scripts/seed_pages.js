const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const defaultPages = [
  {
    title: 'About Us',
    slug: 'about',
    seoTitle: 'About LEADJEN MEDIA | Independent Digital Journalism',
    seoDescription: 'Learn about LEADJEN MEDIA, our editorial mission, newsroom standards, leadership, and commitment to independent journalism.',
    content: `<h2>Our Mission</h2><p>LEADJEN MEDIA is a forward-looking, independent digital news portal dedicated to providing accurate, fearless, and non-partisan news coverage across India, global geopolitics, technology innovation, business developments, and societal shifts.</p><h3>Editorial Principles</h3><ul><li><strong>Independence:</strong> Free from corporate, commercial, or partisan interests.</li><li><strong>Accuracy:</strong> Multi-source verification before dissemination.</li><li><strong>Speed with Integrity:</strong> Rapid real-time reporting without sacrificing factuality.</li></ul>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Editorial Policy',
    slug: 'editorial-policy',
    seoTitle: 'Editorial Policy & Standards | LEADJEN MEDIA',
    seoDescription: 'Our commitment to journalistic integrity, fact-checking methodology, source protection, and independence.',
    content: `<h2>Editorial Standards & Code of Ethics</h2><p>All reporters and correspondents at LEADJEN MEDIA adhere to the highest standards of journalistic verification, transparency, and accountability.</p><h3>Verification & Anonymous Sourcing</h3><p>We do not publish unverified allegations or single-source claims of significance without independent corroboration.</p>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Corrections Policy',
    slug: 'corrections-policy',
    seoTitle: 'Corrections & Clarifications Policy | LEADJEN MEDIA',
    seoDescription: 'How LEADJEN MEDIA handles factual corrections, editorial clarifications, and retraction notices promptly and transparently.',
    content: `<h2>Commitment to Transparency</h2><p>When an error occurs in our reporting, our policy is to correct it promptly, clearly, and visibly. We do not stealth-edit articles with factual errors without appending a formal correction notice at the foot of the dispatch.</p>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    seoTitle: 'Privacy Policy | LEADJEN MEDIA',
    seoDescription: 'How we respect visitor privacy, handle data, and ensure a cookie-compliant, reader-account-free experience.',
    content: `<h2>Privacy & Data Protection</h2><p>LEADJEN MEDIA does not mandate reader account registrations or profile logins to access public news dispatches. We operate an open, privacy-conscious platform.</p><h3>Information We Collect</h3><p>We only collect non-personal analytics and voluntary newsletter subscriptions.</p>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Terms of Service',
    slug: 'terms',
    seoTitle: 'Terms of Service | LEADJEN MEDIA',
    seoDescription: 'Terms and conditions governing the access and use of the LEADJEN MEDIA website and published content.',
    content: `<h2>Terms of Service</h2><p>By accessing LEADJEN MEDIA, you agree to comply with our acceptable use standards, copyright terms, and intellectual property rights.</p>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    seoTitle: 'Cookie Policy | LEADJEN MEDIA',
    seoDescription: 'Information about how cookies and session storage are utilized strictly for core portal functionality.',
    content: `<h2>Use of Cookies</h2><p>We use essential cookies strictly for site operations, theme preference storage (dark/light mode), and editorial session verification.</p>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    seoTitle: 'Contact Newsroom & Editorial Bureau | LEADJEN MEDIA',
    seoDescription: 'Get in touch with LEADJEN MEDIA editors, news bureaus, press tip lines, and corporate communications.',
    content: `<h2>Get In Touch</h2><p>For news tips, press releases, or editorial inquiries:</p><p><strong>Email:</strong> editorial@leadjenmedia.com</p><p><strong>News Desk Phone:</strong> +91 (0) 11 4982 3000</p><p><strong>Bureau Address:</strong> LEADJEN MEDIA Editorial Tower, Connaught Place, New Delhi, India 110001</p>`,
    status: 'PUBLISHED',
  },
  {
    title: 'Advertise With Us',
    slug: 'advertise',
    seoTitle: 'Advertise With LEADJEN MEDIA | High-Impact Digital Campaigns',
    seoDescription: 'Reach decision-makers, executives, and engaged news readers through targeted display and video placements.',
    content: `<h2>Partner With Leadjen Media</h2><p>LEADJEN MEDIA delivers premium digital brand exposure across desktop, tablet, and mobile platforms for discerning audiences across industry, politics, and technology.</p><p>For rate cards and sponsorship opportunities, contact: <strong>advertising@leadjenmedia.com</strong></p>`,
    status: 'PUBLISHED',
  },
];

async function seedToDb(client, label) {
  console.log(`Seeding standard static pages to ${label}...`);
  for (const page of defaultPages) {
    await client.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`✓ Standard static pages seeded to ${label}!`);
}

async function run() {
  // 1. Seed Local DB
  const localPrisma = new PrismaClient();
  await seedToDb(localPrisma, 'Local Database');
  await localPrisma.$disconnect();

  // 2. Seed Remote DB if .env.vercel exists
  if (fs.existsSync('.env.vercel')) {
    const envContent = fs.readFileSync('.env.vercel', 'utf8');
    let remoteUrl = '';
    for (const line of envContent.split('\n')) {
      if (line.startsWith('DATABASE_URL=')) {
        remoteUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
      }
    }
    if (remoteUrl) {
      const remotePrisma = new PrismaClient({ datasources: { db: { url: remoteUrl } } });
      await seedToDb(remotePrisma, 'Remote Cloud Database');
      await remotePrisma.$disconnect();
    }
  }
}

run().catch(console.error);
