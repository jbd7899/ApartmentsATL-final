import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { neon } from "@neondatabase/serverless";

const REPLIT_BASE = "https://property-showcase-johndeansmu.replit.app";

export default async (req: Request, context: Context) => {
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
  const batchSize = parseInt(url.searchParams.get("batch") || "10");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  // Get unmigrated images (still have /objects/ prefix)
  const unmigrated = await sql`
    SELECT 'property_images' as table_name, id, image_url as url FROM property_images WHERE image_url LIKE '/objects/%'
    UNION ALL
    SELECT 'unit_images', id, image_url as url FROM unit_images WHERE image_url LIKE '/objects/%'
    UNION ALL
    SELECT 'hero_images', id, image_url as url FROM hero_images WHERE image_url LIKE '/objects/%'
    LIMIT ${batchSize} OFFSET ${offset}
  `;

  // Count total remaining
  const countResult = await sql`
    SELECT (
      (SELECT count(*) FROM property_images WHERE image_url LIKE '/objects/%') +
      (SELECT count(*) FROM unit_images WHERE image_url LIKE '/objects/%') +
      (SELECT count(*) FROM hero_images WHERE image_url LIKE '/objects/%')
    ) as remaining
  `;
  const totalRemaining = Number(countResult[0]?.remaining || 0);

  const results = {
    batchSize,
    offset,
    totalRemaining,
    processed: 0,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const row of unmigrated) {
    try {
      const oldUrl = row.url;
      const key = oldUrl.replace(/^\/objects\//, "");
      const newUrl = `/api/images/${key}`;

      // Check if blob already exists
      const existing = await imageStore.getMetadata(key);
      if (!existing) {
        // Download from Replit
        const response = await fetch(`${REPLIT_BASE}${oldUrl}`, {
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          results.failed++;
          results.errors.push(`${oldUrl}: HTTP ${response.status}`);
          continue;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await response.arrayBuffer();

        await imageStore.set(key, new Blob([arrayBuffer]), {
          metadata: { contentType },
        });
      }

      // Update DB
      if (row.table_name === "property_images") {
        await sql`UPDATE property_images SET image_url = ${newUrl} WHERE id = ${row.id}`;
      } else if (row.table_name === "unit_images") {
        await sql`UPDATE unit_images SET image_url = ${newUrl} WHERE id = ${row.id}`;
      } else if (row.table_name === "hero_images") {
        await sql`UPDATE hero_images SET image_url = ${newUrl} WHERE id = ${row.id}`;
      }

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${row.url}: ${error.message}`);
    }
    results.processed++;
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/migrate-images",
};
