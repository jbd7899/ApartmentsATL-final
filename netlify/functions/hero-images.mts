import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";

export default async (req: Request, context: Context) => {
  try {
    const images = await storage.getAllHeroImages();
    return new Response(JSON.stringify(images), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch hero images" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/hero-images",
  method: ["GET"],
};
