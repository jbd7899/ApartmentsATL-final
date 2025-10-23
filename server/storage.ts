import {
  users,
  properties,
  propertyImages,
  units,
  unitImages,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type PropertyImage,
  type InsertPropertyImage,
  type PropertyWithImages,
  type Unit,
  type InsertUnit,
  type UnitImage,
  type InsertUnitImage,
  type UnitWithImages,
  type PropertyWithUnitsAndImages,
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

  // Unit operations
  getUnitsByPropertyId(propertyId: string): Promise<UnitWithImages[]>;
  getUnit(unitId: string): Promise<UnitWithImages | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(unitId: string, unit: Partial<InsertUnit>): Promise<Unit | undefined>;
  deleteUnit(unitId: string): Promise<void>;

  // Unit image operations
  addUnitImages(images: InsertUnitImage[]): Promise<UnitImage[]>;
  deleteUnitImages(unitId: string): Promise<void>;

  // Combined operations
  getPropertyWithUnits(propertyId: string): Promise<PropertyWithUnitsAndImages | undefined>;

  // Analytics operations
  trackPropertyView(propertyId: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getPropertyViewCount(propertyId: string): Promise<number>;
  getAllPropertyViewCounts(): Promise<Array<{ propertyId: string; viewCount: number }>>;
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

  // Unit operations
  async getUnitsByPropertyId(propertyId: string): Promise<UnitWithImages[]> {
    const propertyUnits = await db.query.units.findMany({
      where: eq(units.propertyId, propertyId),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
      orderBy: (units, { asc }) => [asc(units.unitNumber)],
    });
    return propertyUnits;
  }

  async getUnit(unitId: string): Promise<UnitWithImages | undefined> {
    const unit = await db.query.units.findFirst({
      where: eq(units.id, unitId),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
    });
    return unit;
  }

  async createUnit(unitData: InsertUnit): Promise<Unit> {
    const [unit] = await db
      .insert(units)
      .values(unitData)
      .returning();
    return unit;
  }

  async updateUnit(unitId: string, unitData: Partial<InsertUnit>): Promise<Unit | undefined> {
    const [unit] = await db
      .update(units)
      .set({
        ...unitData,
        updatedAt: new Date(),
      })
      .where(eq(units.id, unitId))
      .returning();
    return unit;
  }

  async deleteUnit(unitId: string): Promise<void> {
    await db.delete(units).where(eq(units.id, unitId));
  }

  // Unit image operations
  async addUnitImages(images: InsertUnitImage[]): Promise<UnitImage[]> {
    if (images.length === 0) return [];
    const inserted = await db
      .insert(unitImages)
      .values(images)
      .returning();
    return inserted;
  }

  async deleteUnitImages(unitId: string): Promise<void> {
    await db.delete(unitImages).where(eq(unitImages.unitId, unitId));
  }

  // Combined operations
  async getPropertyWithUnits(propertyId: string): Promise<PropertyWithUnitsAndImages | undefined> {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
        units: {
          with: {
            images: {
              orderBy: (images, { asc }) => [asc(images.displayOrder)],
            },
          },
          orderBy: (units, { asc }) => [asc(units.unitNumber)],
        },
      },
    });
    return property;
  }

  // Analytics operations
  async trackPropertyView(propertyId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const { propertyViews } = await import("@shared/schema");
    await db.insert(propertyViews).values({
      propertyId,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }

  async getPropertyViewCount(propertyId: string): Promise<number> {
    const { propertyViews } = await import("@shared/schema");
    const { count } = await import("drizzle-orm");
    const result = await db
      .select({ count: count() })
      .from(propertyViews)
      .where(eq(propertyViews.propertyId, propertyId));
    return Number(result[0]?.count || 0);
  }

  async getAllPropertyViewCounts(): Promise<Array<{ propertyId: string; viewCount: number }>> {
    const { propertyViews } = await import("@shared/schema");
    const { count, sql } = await import("drizzle-orm");
    const result = await db
      .select({
        propertyId: propertyViews.propertyId,
        viewCount: count(),
      })
      .from(propertyViews)
      .groupBy(propertyViews.propertyId);
    return result.map(r => ({
      propertyId: r.propertyId,
      viewCount: Number(r.viewCount),
    }));
  }
}

export const storage = new DatabaseStorage();
