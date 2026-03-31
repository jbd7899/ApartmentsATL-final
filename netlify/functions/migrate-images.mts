import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { neon } from "@neondatabase/serverless";

const REPLIT_BASE = "https://property-showcase-johndeansmu.replit.app";

export default async (req: Request, context: Context) => {
  // Simple secret check to prevent random invocations
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "migrate-517-images-2026") {
    return new Response("Unauthorized", { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return new Response("DATABASE_URL not set", { status: 500 });
  }

  const sql = neon(databaseUrl);
  const imageStore = getStore("images");

  // Collect all image URLs from the three tables
  const propertyImages = await sql`SELECT id, "imageUrl" FROM property_images WHERE "imageUrl" LIKE '/objects/%'`;
  const unitImages = await sql`SELECT id, "imageUrl" FROM unit_images WHERE "imageUrl" LIKE '/objects/%'`;
  const heroImages = await sql`SELECT id, "imageUrl" FROM hero_images WHERE "imageUrl" LIKE '/objects/%'`;

  const allImages = [
    ...propertyImages.map(r => ({ table: "property_images", id: r.id, url: r.imageUrl })),
    ...unitImages.map(r => ({ table: "unit_images", id: r.id, url: r.imageUrl })),
    ...heroImages.map(r => ({ table: "hero_images", id: r.id, url: r.imageUrl })),
  ];

  // Deduplicate by URL so we don't download the same image twice
  const uniqueUrls = [...new Set(allImages.map(i => i.url))];

  const results = {
    total: uniqueUrls.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
    dbUpdates: 0,
  };

  // Map old URL -> new URL
  const urlMap = new Map<string, string>();

  // Process in batches of 10
  for (let i = 0; i < uniqueUrls.length; i += 10) {
    const batch = uniqueUrls.slice(i, i + 10);

    await Promise.all(batch.map(async (oldUrl) => {
      try {
        // Extract the key from /objects/uploads/uuid
        const key = oldUrl.replace(/^\/objects\//, "");

        // Check if already migrated
        const existing = await imageStore.getMetadata(key);
        if (existing) {
          urlMap.set(oldUrl, `/api/images/${key}`);
          results.skipped++;
          return;
        }

        // Download from Replit
        const replitUrl = `${REPLIT_BASE}${oldUrl}`;
        const response = await fetch(replitUrl);

        if (!response.ok) {
          results.failed++;
          results.errors.push(`${oldUrl}: HTTP ${response.status}`);
          return;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const blob = await response.blob();

        // Upload to Netlify Blobs
        await imageStore.set(key, blob, {
          metadata: {
            contentType,
            migratedFrom: "replit",
            migratedAt: new Date().toISOString(),
          },
        });

        urlMap.set(oldUrl, `/api/images/${key}`);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${oldUrl}: ${error.message}`);
      }
    }));
  }

  // Update database URLs
  for (const img of allImages) {
    const newUrl = urlMap.get(img.url);
    if (!newUrl) continue;

    try {
      if (img.table === "property_images") {
        await sql`UPDATE property_images SET "imageUrl" = ${newUrl} WHERE id = ${img.id}`;
      } else if (img.table === "unit_images") {
        await sql`UPDATE unit_images SET "imageUrl" = ${newUrl} WHERE id = ${img.id}`;
      } else if (img.table === "hero_images") {
        await sql`UPDATE hero_images SET "imageUrl" = ${newUrl} WHERE id = ${img.id}`;
      }
      results.dbUpdates++;
    } catch (error: any) {
      results.errors.push(`DB update ${img.table}/${img.id}: ${error.message}`);
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/migrate-images",
};
