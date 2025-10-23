import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertPropertySchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
