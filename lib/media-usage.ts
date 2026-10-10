import prisma from "@/lib/db";

export interface MediaUsageReference {
  type: "article" | "photoGallery" | "video" | "podcast" | "branding" | "advertisement" | "author" | "user" | "page";
  id: string;
  title: string;
  slug?: string;
  status?: string;
  field: string;
}

/**
 * Checks all database models for active references to a given media asset.
 * Prevents broken images, broken video players, or deleted references.
 */
export async function getMediaUsages(
  mediaId: string,
  mediaUrl?: string | null,
  filename?: string | null
): Promise<MediaUsageReference[]> {
  const identifiers = [
    mediaId,
    `/api/media/${mediaId}/file`,
    mediaUrl && !mediaUrl.startsWith("data:") ? mediaUrl : null,
    filename || null,
  ].filter(Boolean) as string[];

  const usages: MediaUsageReference[] = [];

  try {
    // 1. Check Articles (featuredImage and gallery)
    const articleOrConditions = identifiers.flatMap((val) => [
      { featuredImage: { contains: val } },
      { gallery: { contains: val } },
    ]);

    if (articleOrConditions.length > 0) {
      const articles = await prisma.article.findMany({
        where: { OR: articleOrConditions },
        select: { id: true, title: true, slug: true, status: true, featuredImage: true },
        take: 10,
      });

      for (const a of articles) {
        usages.push({
          type: "article",
          id: a.id,
          title: `Article: "${a.title}"`,
          slug: a.slug,
          status: a.status,
          field: "featuredImage / gallery",
        });
      }
    }

    // 2. Check Photo Galleries (coverImage and images JSON)
    const photoOrConditions = identifiers.flatMap((val) => [
      { coverImage: { contains: val } },
      { images: { contains: val } },
    ]);

    if (photoOrConditions.length > 0) {
      const photos = await prisma.photoGallery.findMany({
        where: { OR: photoOrConditions },
        select: { id: true, title: true, slug: true },
        take: 5,
      });

      for (const p of photos) {
        usages.push({
          type: "photoGallery",
          id: p.id,
          title: `Photo Gallery: "${p.title}"`,
          slug: p.slug,
          field: "coverImage / essay photo",
        });
      }
    }

    // 3. Check Video News (thumbnail and videoUrl)
    const videoOrConditions = identifiers.flatMap((val) => [
      { thumbnail: { contains: val } },
      { videoUrl: { contains: val } },
    ]);

    if (videoOrConditions.length > 0) {
      const videos = await prisma.videoNews.findMany({
        where: { OR: videoOrConditions },
        select: { id: true, title: true, slug: true },
        take: 5,
      });

      for (const v of videos) {
        usages.push({
          type: "video",
          id: v.id,
          title: `Video Broadcast: "${v.title}"`,
          slug: v.slug,
          field: "thumbnail / video stream",
        });
      }
    }

    // 4. Check Advertisements (imageUrl)
    const adOrConditions = identifiers.map((val) => ({
      imageUrl: { contains: val },
    }));

    if (adOrConditions.length > 0) {
      const ads = await prisma.advertisement.findMany({
        where: { OR: adOrConditions },
        select: { id: true, name: true, location: true },
        take: 5,
      });

      for (const ad of ads) {
        usages.push({
          type: "advertisement",
          id: ad.id,
          title: `Advertisement Banner: "${ad.name}" (${ad.location})`,
          field: "imageUrl",
        });
      }
    }

    // 5. Check Site Settings (logoImage and siteConfigJson)
    const siteSettings = await prisma.siteSettings.findFirst({
      select: { id: true, logoImage: true, siteConfigJson: true },
    });

    if (siteSettings) {
      const logoMatches = identifiers.some((val) => siteSettings.logoImage?.includes(val));
      if (logoMatches) {
        usages.push({
          type: "branding",
          id: siteSettings.id,
          title: "Site Branding (Primary Publication Logo)",
          field: "logoImage",
        });
      }

      if (siteSettings.siteConfigJson) {
        const configMatches = identifiers.some((val) => siteSettings.siteConfigJson?.includes(val));
        if (configMatches) {
          usages.push({
            type: "podcast",
            id: siteSettings.id,
            title: "Podcast / Site Builder Configuration",
            field: "siteConfigJson",
          });
        }
      }
    }

    // 6. Check Static Pages (featuredImage)
    const pageOrConditions = identifiers.map((val) => ({
      featuredImage: { contains: val },
    }));

    if (pageOrConditions.length > 0) {
      const pages = await prisma.page.findMany({
        where: { OR: pageOrConditions },
        select: { id: true, title: true, slug: true },
        take: 5,
      });

      for (const pg of pages) {
        usages.push({
          type: "page",
          id: pg.id,
          title: `Static Page: "${pg.title}"`,
          slug: pg.slug,
          field: "featuredImage",
        });
      }
    }

    // 7. Check Author avatars
    const authorOrConditions = identifiers.map((val) => ({
      avatar: { contains: val },
    }));

    if (authorOrConditions.length > 0) {
      const authors = await prisma.author.findMany({
        where: { OR: authorOrConditions },
        select: { id: true, name: true, slug: true },
        take: 5,
      });

      for (const auth of authors) {
        usages.push({
          type: "author",
          id: auth.id,
          title: `Author Profile: "${auth.name}"`,
          slug: auth.slug,
          field: "avatar",
        });
      }
    }
  } catch (err: any) {
    console.warn("[Media Usages] Error checking usages:", err?.message || err);
  }

  return usages;
}
