import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { requireAdmin, jsonResponse } from "../../lib/auth";

export default async (req: Request, context: Context) => {
  const admin = requireAdmin(req);
  if (admin instanceof Response) return admin;

  const url = new URL(req.url);

  try {
    // DELETE /api/property-images/:imageId
    const propertyMatch = url.pathname.match(/^\/api\/property-images\/([^/]+)$/);
    if (propertyMatch) {
      const image = await storage.getPropertyImage(propertyMatch[1]);
      if (!image) {
        return jsonResponse({ error: "Image not found" }, 404);
      }
      await storage.deletePropertyImage(propertyMatch[1]);
      return new Response(null, { status: 204 });
    }

    // DELETE /api/unit-images/:imageId
    const unitMatch = url.pathname.match(/^\/api\/unit-images\/([^/]+)$/);
    if (unitMatch) {
      const image = await storage.getUnitImage(unitMatch[1]);
      if (!image) {
        return jsonResponse({ error: "Image not found" }, 404);
      }
      await storage.deleteUnitImage(unitMatch[1]);
      return new Response(null, { status: 204 });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error deleting image:", error);
    return jsonResponse({ error: "Failed to delete image" }, 500);
  }
};

export const config: Config = {
  path: ["/api/property-images/:imageId", "/api/unit-images/:imageId"],
  method: ["DELETE"],
};
