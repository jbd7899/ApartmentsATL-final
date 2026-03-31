import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { requireAdmin, jsonResponse } from "../../lib/auth";
import { getStore } from "@netlify/blobs";
import { insertPropertySchema } from "../../shared/schema";
import { z } from "zod";

const bulkPropertyImageSchema = z.object({
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
    // POST /api/properties — create
    if (method === "POST" && url.pathname === "/api/properties") {
      const body = await req.json();
      const validation = insertPropertySchema.safeParse(body.property);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid property data", details: validation.error }, 400);
      }

      const property = await storage.createProperty(validation.data);

      // Handle images — store URLs directly (already uploaded to Blobs)
      const imageData = body.images || [];
      const imageInserts = imageData.map((image: any, i: number) => ({
        propertyId: property.id,
        imageUrl: image.url,
        caption: image.caption || null,
        isPrimary: image.isPrimary || false,
        displayOrder: i,
      }));

      if (imageInserts.length > 0) {
        await storage.addPropertyImages(imageInserts);
      }

      const savedProperty = await storage.getProperty(property.id);
      return jsonResponse(savedProperty, 201);
    }

    // PUT /api/properties/:id — update
    const putMatch = url.pathname.match(/^\/api\/properties\/([^/]+)$/);
    if (method === "PUT" && putMatch) {
      const body = await req.json();
      const partialSchema = insertPropertySchema.deepPartial();
      const validation = partialSchema.safeParse(body.property);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid property data", details: validation.error }, 400);
      }

      const property = await storage.updateProperty(putMatch[1], validation.data);
      if (!property) {
        return jsonResponse({ error: "Property not found" }, 404);
      }

      // Handle image updates
      await storage.deletePropertyImages(property.id);
      const imageData = body.images || [];
      const imageInserts = imageData.map((image: any, i: number) => ({
        propertyId: property.id,
        imageUrl: image.url,
        caption: image.caption || null,
        isPrimary: image.isPrimary || false,
        displayOrder: i,
      }));

      if (imageInserts.length > 0) {
        await storage.addPropertyImages(imageInserts);
      }

      const updatedProperty = await storage.getProperty(property.id);
      return jsonResponse(updatedProperty);
    }

    // DELETE /api/properties/:id — delete
    const deleteMatch = url.pathname.match(/^\/api\/properties\/([^/]+)$/);
    if (method === "DELETE" && deleteMatch) {
      const property = await storage.getProperty(deleteMatch[1]);
      if (!property) {
        return jsonResponse({ error: "Property not found" }, 404);
      }
      await storage.deleteProperty(deleteMatch[1]);
      return new Response(null, { status: 204 });
    }

    // POST /api/properties/:id/bulk-images
    const bulkMatch = url.pathname.match(/^\/api\/properties\/([^/]+)\/bulk-images$/);
    if (method === "POST" && bulkMatch) {
      const property = await storage.getProperty(bulkMatch[1]);
      if (!property) {
        return jsonResponse({ error: "Property not found" }, 404);
      }

      const body = await req.json();
      const validation = bulkPropertyImageSchema.safeParse(body);
      if (!validation.success) {
        return jsonResponse({ error: "Invalid image data", details: validation.error }, 400);
      }

      const imageData = validation.data.images;
      if (imageData.length === 0) {
        return jsonResponse({ error: "At least one image is required" }, 400);
      }

      await storage.deletePropertyImages(property.id);
      const imageInserts = imageData.map((image, i) => ({
        propertyId: property.id,
        imageUrl: image.url,
        caption: image.caption || null,
        isPrimary: image.isPrimary || false,
        displayOrder: i,
      }));

      if (imageInserts.length > 0) {
        await storage.addPropertyImages(imageInserts);
      }

      const updatedProperty = await storage.getProperty(property.id);
      return jsonResponse(updatedProperty);
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error in properties-admin function:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config: Config = {
  path: ["/api/properties", "/api/properties/:id", "/api/properties/:id/bulk-images"],
  method: ["POST", "PUT", "DELETE"],
};
