import {
  users,
  properties,
  propertyImages,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type PropertyImage,
  type InsertPropertyImage,
  type PropertyWithImages,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Property operations
  getAllProperties(): Promise<PropertyWithImages[]>;
  getProperty(id: string): Promise<PropertyWithImages | undefined>;
  getPropertiesByLocation(location: string): Promise<PropertyWithImages[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<void>;

  // Property image operations
  addPropertyImages(images: InsertPropertyImage[]): Promise<PropertyImage[]>;
  deletePropertyImages(propertyId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getAllProperties(): Promise<PropertyWithImages[]> {
    const allProperties = await db.query.properties.findMany({
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    return allProperties;
  }

  async getProperty(id: string): Promise<PropertyWithImages | undefined> {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
    });
    return property;
  }

  async getPropertiesByLocation(location: string): Promise<PropertyWithImages[]> {
    const locationProperties = await db.query.properties.findMany({
      where: eq(properties.location, location),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    return locationProperties;
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(propertyData)
      .returning();
    return property;
  }

  async updateProperty(id: string, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set({
        ...propertyData,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Property image operations
  async addPropertyImages(images: InsertPropertyImage[]): Promise<PropertyImage[]> {
    if (images.length === 0) return [];
    const inserted = await db
      .insert(propertyImages)
      .values(images)
      .returning();
    return inserted;
  }

  async deletePropertyImages(propertyId: string): Promise<void> {
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  }
}

export const storage = new DatabaseStorage();
