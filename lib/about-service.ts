import prisma from "@/lib/db";
import {
  DEFAULT_ABOUT_SETTINGS,
  DEFAULT_DEMO_EMPLOYEES,
  AboutSettingsData,
  DEFAULT_EDITORIAL_VALUES,
} from "./about-defaults";

export async function getAboutPageData(includeDrafts = false): Promise<{
  settings: AboutSettingsData;
  teamMembers: any[];
}> {
  try {
    // 1. Fetch or initialize settings
    let dbSettings = await prisma.aboutPageSettings.findUnique({
      where: { id: "default" },
    }).catch((err) => {
      console.warn("[About Service] Failed to find aboutPageSettings:", err?.message || err);
      return null;
    });

    if (!dbSettings) {
      try {
        dbSettings = await prisma.aboutPageSettings.upsert({
          where: { id: "default" },
          update: {},
          create: {
            id: "default",
            heroHeading: DEFAULT_ABOUT_SETTINGS.heroHeading,
            heroSubtitle: DEFAULT_ABOUT_SETTINGS.heroSubtitle,
            introduction: DEFAULT_ABOUT_SETTINGS.introduction,
            ceoName: DEFAULT_ABOUT_SETTINGS.ceoName,
            ceoDesignation: DEFAULT_ABOUT_SETTINGS.ceoDesignation,
            ceoBio: DEFAULT_ABOUT_SETTINGS.ceoBio,
            ceoMessage: DEFAULT_ABOUT_SETTINGS.ceoMessage,
            ceoPhoto: DEFAULT_ABOUT_SETTINGS.ceoPhoto,
            ceoTwitter: DEFAULT_ABOUT_SETTINGS.ceoTwitter,
            ceoLinkedin: DEFAULT_ABOUT_SETTINGS.ceoLinkedin,
            ceoEmail: DEFAULT_ABOUT_SETTINGS.ceoEmail,
            missionTitle: DEFAULT_ABOUT_SETTINGS.missionTitle,
            missionText: DEFAULT_ABOUT_SETTINGS.missionText,
            visionTitle: DEFAULT_ABOUT_SETTINGS.visionTitle,
            visionText: DEFAULT_ABOUT_SETTINGS.visionText,
            valuesTitle: DEFAULT_ABOUT_SETTINGS.valuesTitle,
            valuesJson: JSON.stringify(DEFAULT_EDITORIAL_VALUES),
            coverageTitle: DEFAULT_ABOUT_SETTINGS.coverageTitle,
            coverageText: DEFAULT_ABOUT_SETTINGS.coverageText,
          },
        });
      } catch (upsertErr) {
        console.warn("[About Service] Upsert fallback warning:", upsertErr);
      }
    }

    // 2. Fetch or initialize team members
    let teamMembers: any[] = await prisma.teamMember.findMany({
      where: includeDrafts ? {} : { status: "PUBLISHED" },
      orderBy: { order: "asc" },
    }).catch((err) => {
      console.warn("[About Service] Failed to find teamMembers:", err?.message || err);
      return [];
    });

    // If completely empty in database, initialize the 4 demo profiles
    if (!teamMembers || teamMembers.length === 0) {
      const totalCount = await prisma.teamMember.count().catch(() => 0);
      if (totalCount === 0) {
        try {
          await prisma.teamMember.createMany({
            data: DEFAULT_DEMO_EMPLOYEES.map((emp) => ({
              name: emp.name,
              designation: emp.designation,
              bio: emp.bio,
              photo: emp.photo,
              order: emp.order,
              status: emp.status,
              isDemo: emp.isDemo,
              twitter: emp.twitter,
              linkedin: emp.linkedin,
              email: emp.email,
            })),
          });

          teamMembers = await prisma.teamMember.findMany({
            where: includeDrafts ? {} : { status: "PUBLISHED" },
            orderBy: { order: "asc" },
          });
        } catch (seedErr) {
          console.warn("[About Service] Demo employee auto-init error:", seedErr);
        }
      }
    }

    // If still empty (e.g. database error), use fallback array
    if (!teamMembers || teamMembers.length === 0) {
      teamMembers = DEFAULT_DEMO_EMPLOYEES.map((d, idx) => ({
        id: `demo_${idx + 1}`,
        ...d,
      }));
    }

    let parsedValues = DEFAULT_EDITORIAL_VALUES;
    if (dbSettings?.valuesJson) {
      try {
        parsedValues = JSON.parse(dbSettings.valuesJson);
      } catch {}
    }

    const settings: AboutSettingsData = {
      id: dbSettings?.id || "default",
      heroHeading: dbSettings?.heroHeading || DEFAULT_ABOUT_SETTINGS.heroHeading,
      heroSubtitle: dbSettings?.heroSubtitle || DEFAULT_ABOUT_SETTINGS.heroSubtitle,
      introduction: dbSettings?.introduction || DEFAULT_ABOUT_SETTINGS.introduction,
      ceoName: dbSettings?.ceoName || DEFAULT_ABOUT_SETTINGS.ceoName,
      ceoDesignation: dbSettings?.ceoDesignation || DEFAULT_ABOUT_SETTINGS.ceoDesignation,
      ceoBio: dbSettings?.ceoBio || DEFAULT_ABOUT_SETTINGS.ceoBio,
      ceoMessage: dbSettings?.ceoMessage || DEFAULT_ABOUT_SETTINGS.ceoMessage,
      ceoPhoto: dbSettings?.ceoPhoto || DEFAULT_ABOUT_SETTINGS.ceoPhoto,
      ceoTwitter: dbSettings?.ceoTwitter || DEFAULT_ABOUT_SETTINGS.ceoTwitter,
      ceoLinkedin: dbSettings?.ceoLinkedin || DEFAULT_ABOUT_SETTINGS.ceoLinkedin,
      ceoEmail: dbSettings?.ceoEmail || DEFAULT_ABOUT_SETTINGS.ceoEmail,
      missionTitle: dbSettings?.missionTitle || DEFAULT_ABOUT_SETTINGS.missionTitle,
      missionText: dbSettings?.missionText || DEFAULT_ABOUT_SETTINGS.missionText,
      visionTitle: dbSettings?.visionTitle || DEFAULT_ABOUT_SETTINGS.visionTitle,
      visionText: dbSettings?.visionText || DEFAULT_ABOUT_SETTINGS.visionText,
      valuesTitle: dbSettings?.valuesTitle || DEFAULT_ABOUT_SETTINGS.valuesTitle,
      values: Array.isArray(parsedValues) && parsedValues.length > 0 ? parsedValues : DEFAULT_EDITORIAL_VALUES,
      coverageTitle: dbSettings?.coverageTitle || DEFAULT_ABOUT_SETTINGS.coverageTitle,
      coverageText: dbSettings?.coverageText || DEFAULT_ABOUT_SETTINGS.coverageText,
    };

    return { settings, teamMembers };
  } catch (error) {
    console.error("[About Service] Global error:", error);
    return {
      settings: DEFAULT_ABOUT_SETTINGS,
      teamMembers: DEFAULT_DEMO_EMPLOYEES.map((d, idx) => ({ id: `demo_${idx + 1}`, ...d })),
    };
  }
}
