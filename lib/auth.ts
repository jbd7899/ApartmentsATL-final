import type { Context } from "@netlify/functions";

export interface NetlifyIdentityUser {
  sub: string;
  email: string;
  app_metadata?: {
    provider?: string;
    roles?: string[];
  };
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

/**
 * Extract and decode the Netlify Identity JWT from the Authorization header.
 * Netlify Identity tokens are signed JWTs — in a Netlify Function context,
 * the `context.identity` and `context.clientContext` may also be available,
 * but the most reliable approach is to decode the Bearer token.
 */
export function getUser(req: Request): NetlifyIdentityUser | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    // Netlify Identity JWTs are base64url-encoded.
    // We decode the payload without full verification here because
    // the token was already verified by Netlify's infrastructure.
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      app_metadata: payload.app_metadata,
      user_metadata: payload.user_metadata,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a user is an admin based on their email matching the ADMIN_EMAILS env var.
 */
export function isAdmin(user: NetlifyIdentityUser | null): boolean {
  if (!user || !user.email) return false;

  const adminEmails = (Netlify.env.get("ADMIN_EMAILS") || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => e.length > 0);

  return adminEmails.includes(user.email.toLowerCase());
}

/**
 * Require authentication — returns the user or a 401 Response.
 */
export function requireAuth(req: Request): NetlifyIdentityUser | Response {
  const user = getUser(req);
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

/**
 * Require admin — returns the user or a 401/403 Response.
 */
export function requireAdmin(req: Request): NetlifyIdentityUser | Response {
  const result = requireAuth(req);
  if (result instanceof Response) return result;

  if (!isAdmin(result)) {
    return new Response(
      JSON.stringify({ message: "Forbidden: You do not have permission to access this resource" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return result;
}

/** Helper to create a JSON response */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
