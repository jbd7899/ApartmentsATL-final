import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { neon } from "@neondatabase/serverless";

const REPLIT_BASE = "https://property-showcase-johndeansmu.replit.app";

export default async (req: Request, context: Context) => {
  // Simple secret check
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "migrate-517-images-2026") {
    console.log("Unauthorized migration attempt");
    return;
  }

  console.log("Starting image migration from Replit to Netlify Blobs...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    return;
  }

  const sql = neon(databaseUrl);
  const imageStore = getStore("images");
  const progressStore = getStore("migration-progress");

  // Collect all image URLs from the three tables
  const propertyImages = await sql`SELECT id, "imageUrl" FROM property_images WHERE "imageUrl" LIKE '/objects/%'`;
  const unitImages = await sql`SELECT id, "imageUrl" FROM unit_images WHERE "imageUrl" LIKE '/objects/%'`;
  const heroImages = await sql`SELECT id, "imageUrl" FROM hero_images WHERE "imageUrl" LIKE '/objects/%'`;

  const allImages = [
    ...propertyImages.map(r => ({ table: "property_images", id: r.id, url: r.imageUrl })),
    ...unitImages.map(r => ({ table: "unit_images", id: r.id, url: r.imageUrl })),
    ...heroImages.map(r => ({ table: "hero_images", id: r.id, url: r.imageUrl })),
  ];

  const uniqueUrls = [...new Set(allImages.map(i => i.url))];

  console.log(`Found ${allImages.length} total image records, ${uniqueUrls.length} unique URLs`);

  const results = {
    total: uniqueUrls.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
    dbUpdates: 0,
    startedAt: new Date().toISOString(),
    completedAt: "",
  };

  const urlMap = new Map<string, string>();

  // Process in batches of 5 (conservative for reliability)
  for (let i = 0; i < uniqueUrls.length; i += 5) {
    const batch = uniqueUrls.slice(i, i + 5);
    console.log(`Processing batch ${Math.floor(i/5) + 1}/${Math.ceil(uniqueUrls.length/5)} (images ${i+1}-${Math.min(i+5, uniqueUrls.length)})`);

    await Promise.all(batch.map(async (oldUrl) => {
      try {
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
        const response = await fetch(replitUrl, { signal: AbortSignal.timeout(30000) });

        if (!response.ok) {
          results.failed++;
          results.errors.push(`${oldUrl}: HTTP ${response.status}`);
          return;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await response.arrayBuffer();

        // Upload to Netlify Blobs
        await imageStore.set(key, new Blob([arrayBuffer]), {
          metadata: {
            contentType,
            migratedFrom: "replit",
            originalSize: String(arrayBuffer.byteLength),
          },
        });

        urlMap.set(oldUrl, `/api/images/${key}`);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${oldUrl}: ${error.message}`);
      }
    }));

    // Save progress periodically
    if (i % 25 === 0) {
      await progressStore.setJSON("migration-status", { ...results, urlMapSize: urlMap.size });
    }
  }

  console.log(`Image download complete: ${results.success} success, ${results.failed} failed, ${results.skipped} skipped`);

  // Update database URLs
  console.log(`Updating ${allImages.length} database records...`);
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

  results.completedAt = new Date().toISOString();
  console.log(`Migration complete! Results:`, JSON.stringify(results));

  // Save final results
  await progressStore.setJSON("migration-status", results);
};

export const config: Config = {
  path: "/api/migrate-images",
};
