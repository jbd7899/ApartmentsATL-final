import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const progressStore = getStore("migration-progress");
  const status = await progressStore.get("migration-status", { type: "json" });

  if (!status) {
    return new Response(JSON.stringify({ status: "not started" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(status, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/api/migration-status",
};
