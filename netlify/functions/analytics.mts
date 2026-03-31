import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { requireAdmin, jsonResponse } from "../../lib/auth";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const method = req.method;

  try {
    // POST /api/analytics/track-view/:propertyId — public
    const trackMatch = url.pathname.match(/^\/api\/analytics\/track-view\/([^/]+)$/);
    if (method === "POST" && trackMatch) {
      const ipAddress = req.headers.get("x-forwarded-for") || undefined;
      const userAgent = req.headers.get("user-agent") || undefined;
      await storage.trackPropertyView(trackMatch[1], ipAddress, userAgent);
      return jsonResponse({ success: true });
    }

    // GET /api/analytics/views/:propertyId — public
    const viewMatch = url.pathname.match(/^\/api\/analytics\/views\/([^/]+)$/);
    if (method === "GET" && viewMatch) {
      const count = await storage.getPropertyViewCount(viewMatch[1]);
      return jsonResponse({ count });
    }

    // GET /api/analytics/views — admin only
    if (method === "GET" && url.pathname === "/api/analytics/views") {
      const admin = requireAdmin(req);
      if (admin instanceof Response) return admin;

      const viewCounts = await storage.getAllPropertyViewCounts();
      return jsonResponse(viewCounts);
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in analytics function:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config: Config = {
  path: ["/api/analytics/track-view/:propertyId", "/api/analytics/views", "/api/analytics/views/:propertyId"],
};
