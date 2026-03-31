import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const method = req.method;

  try {
    // GET /api/properties — list all
    if (method === "GET" && url.pathname === "/api/properties") {
      const properties = await storage.getAllProperties();
      return new Response(JSON.stringify(properties), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/properties/:id — get one
    if (method === "GET") {
      const match = url.pathname.match(/^\/api\/properties\/([^/]+)$/);
      if (match) {
        const property = await storage.getProperty(match[1]);
        if (!property) {
          return new Response(JSON.stringify({ error: "Property not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(property), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in properties function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: ["/api/properties", "/api/properties/:id"],
};
