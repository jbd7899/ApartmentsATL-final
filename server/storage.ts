import {
  users,
  properties,
  propertyImages,
  units,
  unitImages,
  heroImages,
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
  type HeroImage,
  type InsertHeroImage,
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
  getPropertyImage(imageId: string): Promise<PropertyImage | undefined>;
  deletePropertyImage(imageId: string): Promise<void>;
  deletePropertyImages(propertyId: string): Promise<void>;

  // Unit operations
  getUnitsByPropertyId(propertyId: string): Promise<UnitWithImages[]>;
  getUnit(unitId: string): Promise<UnitWithImages | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(unitId: string, unit: Partial<InsertUnit>): Promise<Unit | undefined>;
  deleteUnit(unitId: string): Promise<void>;

  // Unit image operations
  addUnitImages(images: InsertUnitImage[]): Promise<UnitImage[]>;
  getUnitImage(imageId: string): Promise<UnitImage | undefined>;
  deleteUnitImage(imageId: string): Promise<void>;
  deleteUnitImages(unitId: string): Promise<void>;

  // Combined operations
  getPropertyWithUnits(propertyId: string): Promise<PropertyWithUnitsAndImages | undefined>;

  // Analytics operations
  trackPropertyView(propertyId: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getPropertyViewCount(propertyId: string): Promise<number>;
  getAllPropertyViewCounts(): Promise<Array<{ propertyId: string; viewCount: number }>>;

  // Hero images operations
  getAllHeroImages(): Promise<HeroImage[]>;
  createHeroImage(data: InsertHeroImage): Promise<HeroImage>;
  deleteHeroImage(id: string): Promise<void>;
  reorderHeroImages(imageIds: string[]): Promise<void>;
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
        units: true,
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    
    // Add unit count to each property and remove units array
    return allProperties.map(({ units, ...property }) => ({
      ...property,
      unitCount: units?.length || 0,
    }));
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

  async getPropertyImage(imageId: string): Promise<PropertyImage | undefined> {
    const [image] = await db.select().from(propertyImages).where(eq(propertyImages.id, imageId));
    return image;
  }

  async deletePropertyImage(imageId: string): Promise<void> {
    await db.delete(propertyImages).where(eq(propertyImages.id, imageId));
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
        property: true,
      },
      orderBy: (units, { asc }) => [asc(units.unitNumber)],
    });
    
    // Map to include propertyTitle while preserving images
    return propertyUnits.map(({ property, ...unitData }) => ({
      ...unitData,
      images: unitData.images,
      propertyTitle: property?.title,
    }));
  }

  async getUnit(unitId: string): Promise<UnitWithImages | undefined> {
    const unit = await db.query.units.findFirst({
      where: eq(units.id, unitId),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
        property: true,
      },
    });
    
    if (!unit) return undefined;
    
    // Extract property and map to include propertyTitle while preserving images
    const { property, ...unitData } = unit;
    return {
      ...unitData,
      images: unitData.images,
      propertyTitle: property?.title,
    };
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

  async getUnitImage(imageId: string): Promise<UnitImage | undefined> {
    const [image] = await db.select().from(unitImages).where(eq(unitImages.id, imageId));
    return image;
  }

  async deleteUnitImage(imageId: string): Promise<void> {
    await db.delete(unitImages).where(eq(unitImages.id, imageId));
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

  // Hero images operations
  async getAllHeroImages(): Promise<HeroImage[]> {
    const images = await db.query.heroImages.findMany({
      orderBy: (heroImages, { asc }) => [asc(heroImages.displayOrder)],
    });
    return images;
  }

  async createHeroImage(data: InsertHeroImage): Promise<HeroImage> {
    const [image] = await db
      .insert(heroImages)
      .values(data)
      .returning();
    return image;
  }

  async deleteHeroImage(id: string): Promise<void> {
    await db.delete(heroImages).where(eq(heroImages.id, id));
  }

  async reorderHeroImages(imageIds: string[]): Promise<void> {
    for (let i = 0; i < imageIds.length; i++) {
      await db
        .update(heroImages)
        .set({ displayOrder: i })
        .where(eq(heroImages.id, imageIds[i]));
    }
  }
}

export const storage = new DatabaseStorage();
