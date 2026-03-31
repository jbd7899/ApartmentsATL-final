import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { requireAdmin, jsonResponse } from "../../lib/auth";
import { insertHeroImageSchema } from "../../shared/schema";

export default async (req: Request, context: Context) => {
  const admin = requireAdmin(req);
  if (admin instanceof Response) return admin;

  const url = new URL(req.url);
  const method = req.method;

  try {
    // POST /api/hero-images — create
    if (method === "POST" && url.pathname === "/api/hero-images") {
      const currentImages = await storage.getAllHeroImages();
      if (currentImages.length >= 4) {
        return jsonResponse({ error: "Maximum of 4 hero images allowed" }, 400);
      }

      const body = await req.json();
      const validation = insertHeroImageSchema.safeParse(body);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid hero image data", details: validation.error }, 400);
      }

      const image = await storage.createHeroImage(validation.data);
      return jsonResponse(image, 201);
    }

    // DELETE /api/hero-images/:id
    const deleteMatch = url.pathname.match(/^\/api\/hero-images\/([^/]+)$/);
    if (method === "DELETE" && deleteMatch) {
      await storage.deleteHeroImage(deleteMatch[1]);
      return new Response(null, { status: 204 });
    }

    // PATCH /api/hero-images/reorder
    if (method === "PATCH" && url.pathname === "/api/hero-images/reorder") {
      const body = await req.json();
      const { imageIds } = body;
      if (!Array.isArray(imageIds)) {
        return jsonResponse({ error: "imageIds must be an array" }, 400);
      }
      await storage.reorderHeroImages(imageIds);
      return jsonResponse({ success: true });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in hero-images-admin function:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config: Config = {
  path: ["/api/hero-images", "/api/hero-images/:id", "/api/hero-images/reorder"],
  method: ["POST", "DELETE", "PATCH"],
};
