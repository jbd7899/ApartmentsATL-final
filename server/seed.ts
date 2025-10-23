import { db } from "./db";
import { properties, propertyImages } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(propertyImages);
  await db.delete(properties);

  // Add sample Atlanta property
  const [atlantaProperty] = await db.insert(properties).values({
    title: "Modern Midtown Apartment",
    description: "Beautiful 2-bedroom apartment in the heart of Midtown Atlanta. Walking distance to Piedmont Park, restaurants, and shopping. Updated kitchen with stainless steel appliances, hardwood floors throughout, and in-unit washer/dryer. Building amenities include fitness center, rooftop deck, and secured parking.",
    location: "atlanta",
    propertyType: "multifamily",
    address: "10th Street, Midtown, Atlanta, GA",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    featured: true,
  }).returning();

  // Add sample Dallas property
  const [dallasProperty] = await db.insert(properties).values({
    title: "Charming East Dallas Bungalow",
    description: "Renovated 3-bedroom, 2-bathroom single-family home in highly sought-after East Dallas neighborhood. Features include original hardwood floors, updated kitchen and bathrooms, large fenced backyard perfect for entertaining, and a detached garage. Close to White Rock Lake, local shops, and restaurants.",
    location: "dallas",
    propertyType: "single-family",
    address: "Belmont Avenue, East Dallas, TX",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    featured: true,
  }).returning();

  // Add another Atlanta property
  const [atlanta2] = await db.insert(properties).values({
    title: "Virginia Highland Townhome",
    description: "Spacious 3-story townhome in the charming Virginia Highland neighborhood. Features 3 bedrooms, 3 bathrooms, private garage, and rooftop terrace with city views. Walking distance to trendy restaurants, boutiques, and the Atlanta BeltLine.",
    location: "atlanta",
    propertyType: "single-family",
    address: "Virginia Avenue, Virginia Highland, Atlanta, GA",
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2000,
    featured: false,
  }).returning();

  console.log(`✓ Seeded ${atlantaProperty.id}, ${dallasProperty.id}, ${atlanta2.id}`);
  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
