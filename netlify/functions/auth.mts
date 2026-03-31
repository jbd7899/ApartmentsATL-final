import type { Context, Config } from "@netlify/functions";
import { getUser, isAdmin, jsonResponse } from "../../lib/auth";
import { storage } from "../../lib/storage";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);

  // GET /api/auth/user — get current user from JWT
  if (url.pathname === "/api/auth/user") {
    const user = getUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upsert user in database
    const dbUser = await storage.upsertUser({
      id: user.sub,
      email: user.email,
      firstName: user.user_metadata?.full_name?.split(" ")[0] || null,
      lastName: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
      profileImageUrl: user.user_metadata?.avatar_url || null,
    });

    return jsonResponse(dbUser);
  }

  // GET /api/auth/admin — check if current user is admin
  if (url.pathname === "/api/auth/admin") {
    const user = getUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return jsonResponse({ isAdmin: isAdmin(user) });
  }

  return new Response("Not Found", { status: 404 });
};

export const config: Config = {
  path: ["/api/auth/user", "/api/auth/admin"],
  method: ["GET"],
};
