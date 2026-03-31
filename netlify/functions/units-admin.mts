import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { requireAdmin, jsonResponse } from "../../lib/auth";
import { insertUnitSchema } from "@shared/schema";
import { z } from "zod";

const bulkImageSchema = z.object({
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().min(1, "Image URL is required"),
    caption: z.string().optional().default(""),
    isPrimary: z.boolean().optional().default(false),
  })),
});

export default async (req: Request, context: Context) => {
  const admin = requireAdmin(req);
  if (admin instanceof Response) return admin;

  const url = new URL(req.url);
  const method = req.method;

  try {
    // POST /api/units — create
    if (method === "POST" && url.pathname === "/api/units") {
      const body = await req.json();
      const validation = insertUnitSchema.safeParse(body.unit);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid unit data", details: validation.error }, 400);
      }

      const unit = await storage.createUnit(validation.data);

      const imageData = body.images || [];
      const imageInserts = imageData.map((image: any, i: number) => ({
        unitId: unit.id,
        imageUrl: image.url,
        caption: image.caption || null,
        isPrimary: image.isPrimary || false,
        displayOrder: i,
      }));

      if (imageInserts.length > 0) {
        await storage.addUnitImages(imageInserts);
      }

      const savedUnit = await storage.getUnit(unit.id);
      return jsonResponse(savedUnit, 201);
    }

    // PATCH /api/units/:id — update
    const patchMatch = url.pathname.match(/^\/api\/units\/([^/]+)$/);
    if (method === "PATCH" && patchMatch) {
      const body = await req.json();
      const partialSchema = insertUnitSchema.deepPartial();
      const validation = partialSchema.safeParse(body.unit);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid unit data", details: validation.error }, 400);
      }

      const unit = await storage.updateUnit(patchMatch[1], validation.data);
      if (!unit) {
        return jsonResponse({ error: "Unit not found" }, 404);
      }

      await storage.deleteUnitImages(unit.id);
      const imageData = body.images || [];
      const imageInserts = imageData.map((image: any, i: number) => ({
        unitId: unit.id,
        imageUrl: image.url,
        caption: image.caption || null,
        isPrimary: image.isPrimary || false,
        displayOrder: i,
      }));

      if (imageInserts.length > 0) {
        await storage.addUnitImages(imageInserts);
      }

      const updatedUnit = await storage.getUnit(unit.id);
      return jsonResponse(updatedUnit);
    }

    // DELETE /api/units/:id
    const deleteMatch = url.pathname.match(/^\/api\/units\/([^/]+)$/);
    if (method === "DELETE" && deleteMatch) {
      const unit = await storage.getUnit(deleteMatch[1]);
      if (!unit) {
        return jsonResponse({ error: "Unit not found" }, 404);
      }
      await storage.deleteUnit(deleteMatch[1]);
      return new Response(null, { status: 204 });
    }

    // POST /api/units/:id/bulk-images
    const bulkMatch = url.pathname.match(/^\/api\/units\/([^/]+)\/bulk-images$/);
    if (method === "POST" && bulkMatch) {
      const unit = await storage.getUnit(bulkMatch[1]);
      if (!unit) {
        return jsonResponse({ error: "Unit not found" }, 404);
      }

      const body = await req.json();
      const validation = bulkImageSchema.safeParse(body);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid image data", details: validation.error }, 400);
      }

      const imageData = validation.data.images;
      if (imageData.length === 0) {
        return jsonResponse({ error: "At least one image is required" }, 400);
      }

      await storage.deleteUnitImages(unit.id);
      const imageInserts = imageData.map((image, i) => ({
        unitId: unit.id,
        imageUrl: image.url,
        caption: image.caption || null,
        isPrimary: image.isPrimary || false,
        displayOrder: i,
      }));

      if (imageInserts.length > 0) {
        await storage.addUnitImages(imageInserts);
      }

      const updatedUnit = await storage.getUnit(unit.id);
      return jsonResponse(updatedUnit);
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in units-admin function:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config: Config = {
  path: ["/api/units", "/api/units/:id", "/api/units/:id/bulk-images"],
  method: ["POST", "PATCH", "DELETE"],
};
