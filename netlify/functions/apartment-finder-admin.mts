import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { requireAdmin, jsonResponse } from "../../lib/auth";

export default async (req: Request, context: Context) => {
  const admin = requireAdmin(req);
  if (admin instanceof Response) return admin;

  const url = new URL(req.url);
  const method = req.method;

  try {
    // GET /api/apartment-finder — list all submissions
    if (method === "GET" && url.pathname === "/api/apartment-finder") {
      const submissions = await storage.getAllApartmentFinderSubmissions();
      return jsonResponse(submissions);
    }

    // PATCH /api/apartment-finder/:id/status — update status
    const statusMatch = url.pathname.match(/^\/api\/apartment-finder\/([^/]+)\/status$/);
    if (method === "PATCH" && statusMatch) {
      const body = await req.json();
      const { status } = body;
      if (!status || !["unread", "contacted"].includes(status)) {
        return jsonResponse({ error: "Invalid status. Must be 'unread' or 'contacted'" }, 400);
      }

      const submission = await storage.updateApartmentFinderSubmissionStatus(statusMatch[1], status);
      if (!submission) {
        return jsonResponse({ error: "Submission not found" }, 404);
      }

      return jsonResponse(submission);
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in apartment-finder-admin function:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config: Config = {
  path: ["/api/apartment-finder", "/api/apartment-finder/:id/status"],
  method: ["GET", "PATCH"],
};
