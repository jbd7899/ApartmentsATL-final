import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertPropertySchema, insertUnitSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object storage routes
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validation = insertPropertySchema.safeParse(req.body.property);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid property data", details: validation.error });
      }

      const property = await storage.createProperty(validation.data);

      // Handle image uploads with ACL
      const objectStorageService = new ObjectStorageService();
      const imageData = req.body.images || [];
      const imageInserts = [];

      for (let i = 0; i < imageData.length; i++) {
        const image = imageData[i];
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          image.url,
          {
            owner: userId,
            visibility: "public",
          }
        );

        imageInserts.push({
          propertyId: property.id,
          imageUrl: normalizedPath,
          caption: image.caption || null,
          isPrimary: image.isPrimary || false,
          displayOrder: i,
        });
      }

      if (imageInserts.length > 0) {
        await storage.addPropertyImages(imageInserts);
      }

      const savedProperty = await storage.getProperty(property.id);
      res.status(201).json(savedProperty);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const partialSchema = insertPropertySchema.deepPartial();
      const validation = partialSchema.safeParse(req.body.property);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid property data", details: validation.error });
      }

      const property = await storage.updateProperty(req.params.id, validation.data);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // Handle image updates
      await storage.deletePropertyImages(property.id);

      const objectStorageService = new ObjectStorageService();
      const imageData = req.body.images || [];
      const imageInserts = [];

      for (let i = 0; i < imageData.length; i++) {
        const image = imageData[i];
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          image.url,
          {
            owner: userId,
            visibility: "public",
          }
        );

        imageInserts.push({
          propertyId: property.id,
          imageUrl: normalizedPath,
          caption: image.caption || null,
          isPrimary: image.isPrimary || false,
          displayOrder: i,
        });
      }

      if (imageInserts.length > 0) {
        await storage.addPropertyImages(imageInserts);
      }

      const updatedProperty = await storage.getProperty(property.id);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      await storage.deleteProperty(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // Unit routes
  app.get("/api/properties/:propertyId/units", async (req, res) => {
    try {
      const units = await storage.getUnitsByPropertyId(req.params.propertyId);
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error fetching unit:", error);
      res.status(500).json({ error: "Failed to fetch unit" });
    }
  });

  app.post("/api/units", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validation = insertUnitSchema.safeParse(req.body.unit);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid unit data", details: validation.error });
      }

      const unit = await storage.createUnit(validation.data);

      // Handle image uploads with ACL
      const objectStorageService = new ObjectStorageService();
      const imageData = req.body.images || [];
      const imageInserts = [];

      for (let i = 0; i < imageData.length; i++) {
        const image = imageData[i];
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          image.url,
          {
            owner: userId,
            visibility: "public",
          }
        );

        imageInserts.push({
          unitId: unit.id,
          imageUrl: normalizedPath,
          caption: image.caption || null,
          isPrimary: image.isPrimary || false,
          displayOrder: i,
        });
      }

      if (imageInserts.length > 0) {
        await storage.addUnitImages(imageInserts);
      }

      const savedUnit = await storage.getUnit(unit.id);
      res.status(201).json(savedUnit);
    } catch (error) {
      console.error("Error creating unit:", error);
      res.status(500).json({ error: "Failed to create unit" });
    }
  });

  app.patch("/api/units/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const partialSchema = insertUnitSchema.deepPartial();
      const validation = partialSchema.safeParse(req.body.unit);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid unit data", details: validation.error });
      }

      const unit = await storage.updateUnit(req.params.id, validation.data);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }

      // Handle image updates
      await storage.deleteUnitImages(unit.id);

      const objectStorageService = new ObjectStorageService();
      const imageData = req.body.images || [];
      const imageInserts = [];

      for (let i = 0; i < imageData.length; i++) {
        const image = imageData[i];
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          image.url,
          {
            owner: userId,
            visibility: "public",
          }
        );

        imageInserts.push({
          unitId: unit.id,
          imageUrl: normalizedPath,
          caption: image.caption || null,
          isPrimary: image.isPrimary || false,
          displayOrder: i,
        });
      }

      if (imageInserts.length > 0) {
        await storage.addUnitImages(imageInserts);
      }

      const updatedUnit = await storage.getUnit(unit.id);
      res.json(updatedUnit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ error: "Failed to update unit" });
    }
  });

  app.delete("/api/units/:id", isAuthenticated, async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }

      await storage.deleteUnit(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting unit:", error);
      res.status(500).json({ error: "Failed to delete unit" });
    }
  });

  // Analytics routes
  app.post("/api/analytics/track-view/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || undefined;
      const userAgent = req.headers['user-agent'];
      
      await storage.trackPropertyView(propertyId, ipAddress, userAgent);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking property view:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  app.get("/api/analytics/views/:propertyId", async (req, res) => {
    try {
      const count = await storage.getPropertyViewCount(req.params.propertyId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching view count:", error);
      res.status(500).json({ error: "Failed to fetch view count" });
    }
  });

  app.get("/api/analytics/views", isAuthenticated, async (req, res) => {
    try {
      const viewCounts = await storage.getAllPropertyViewCounts();
      res.json(viewCounts);
    } catch (error) {
      console.error("Error fetching all view counts:", error);
      res.status(500).json({ error: "Failed to fetch view counts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
