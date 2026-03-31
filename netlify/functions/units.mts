import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);

  try {
    // GET /api/properties/:propertyId/units
    const unitsMatch = url.pathname.match(/^\/api\/properties\/([^/]+)\/units$/);
    if (unitsMatch) {
      const units = await storage.getUnitsByPropertyId(unitsMatch[1]);
      return new Response(JSON.stringify(units), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/units/:id
    const unitMatch = url.pathname.match(/^\/api\/units\/([^/]+)$/);
    if (unitMatch) {
      const unit = await storage.getUnit(unitMatch[1]);
      if (!unit) {
        return new Response(JSON.stringify({ error: "Unit not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(unit), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in units function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: ["/api/properties/:propertyId/units", "/api/units/:id"],
  method: ["GET"],
};
