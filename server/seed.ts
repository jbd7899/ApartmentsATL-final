import { db } from "./db";
import { properties, propertyImages, units, unitImages } from "@shared/schema";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Clear existing data in correct order (respecting foreign keys)
  console.log("🗑️  Clearing existing data...");
  await db.delete(unitImages);
  await db.delete(propertyImages);
  await db.delete(units);
  await db.delete(properties);
  console.log("✓ Existing data cleared");

  // ============================================
  // PROPERTY 1: The Historic Victorian Apartments (Atlanta)
  // ============================================
  console.log("Creating Property 1: The Historic Victorian Apartments...");
  const [victorianProperty] = await db.insert(properties).values({
    title: "The Historic Victorian Apartments",
    description: "Beautifully restored Victorian building in Old Fourth Ward. These stunning apartments feature original architectural details, high ceilings, and modern amenities. Located in one of Atlanta's most vibrant neighborhoods.",
    location: "atlanta",
    propertyType: "multifamily",
    address: "123 Boulevard NE, Atlanta, GA 30312",
    featured: true,
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: victorianProperty.id, imageUrl: "/attached_assets/stock_images/victorian_building_e_4a91322e.jpg", isPrimary: true, displayOrder: 0, caption: "Building Exterior" },
    { propertyId: victorianProperty.id, imageUrl: "/attached_assets/stock_images/victorian_building_e_19e3ebb4.jpg", isPrimary: false, displayOrder: 1, caption: "Street View" },
    { propertyId: victorianProperty.id, imageUrl: "/attached_assets/stock_images/victorian_building_e_5c84179b.jpg", isPrimary: false, displayOrder: 2, caption: "Architectural Detail" },
  ]);

  // Victorian Units
  const victorianUnits = [
    { unitNumber: "101", bedrooms: 1, bathrooms: 1, squareFeet: 650, features: "Hardwood floors, Updated kitchen, High ceilings" },
    { unitNumber: "102", bedrooms: 2, bathrooms: 1, squareFeet: 850, features: "Original moldings, Washer/dryer in unit, Bay windows", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "201", bedrooms: 1, bathrooms: 1, squareFeet: 700, features: "Exposed brick, Modern kitchen, Walk-in closet" },
    { unitNumber: "202", bedrooms: 2, bathrooms: 2, squareFeet: 950, features: "Fireplace, Updated bathrooms, Balcony" },
    { unitNumber: "301", bedrooms: 2, bathrooms: 1, squareFeet: 900, features: "City views, Hardwood floors, Updated appliances" },
    { unitNumber: "302", bedrooms: 3, bathrooms: 2, squareFeet: 1200, features: "Master suite, Two balconies, Premium finishes", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  ];

  for (const unitData of victorianUnits) {
    const [unit] = await db.insert(units).values({
      propertyId: victorianProperty.id,
      ...unitData,
    }).returning();

    // Add images for each unit
    const unitImageSets = [
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/victorian_apartment__eba3ffa1.jpg", isPrimary: true, displayOrder: 0, caption: "Living Room" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/apartment_bedroom_in_851bebf7.jpg", isPrimary: false, displayOrder: 1, caption: "Bedroom" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_cffb8eb0.jpg", isPrimary: false, displayOrder: 2, caption: "Kitchen" },
      ],
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/victorian_apartment__8c9cf84d.jpg", isPrimary: true, displayOrder: 0, caption: "Living Area" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/apartment_bedroom_in_7163a616.jpg", isPrimary: false, displayOrder: 1, caption: "Master Bedroom" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/luxury_apartment_bat_d683fee9.jpg", isPrimary: false, displayOrder: 2, caption: "Bathroom" },
      ],
    ];

    const imageSet = unitImageSets[Math.floor(Math.random() * unitImageSets.length)];
    await db.insert(unitImages).values(imageSet);
  }
  console.log("✓ Created Victorian Apartments with 6 units");

  // ============================================
  // PROPERTY 2: Beltline Lofts (Atlanta)
  // ============================================
  console.log("Creating Property 2: Beltline Lofts...");
  const [beltlineProperty] = await db.insert(properties).values({
    title: "Beltline Lofts",
    description: "Modern industrial lofts steps from the Atlanta Beltline. Features exposed brick, concrete floors, and floor-to-ceiling windows. Perfect for urban living with easy access to restaurants, parks, and entertainment.",
    location: "atlanta",
    propertyType: "multifamily",
    address: "456 Edgewood Ave SE, Atlanta, GA 30312",
    featured: false,
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: beltlineProperty.id, imageUrl: "/attached_assets/stock_images/modern_industrial_lo_784c6b97.jpg", isPrimary: true, displayOrder: 0, caption: "Building Exterior" },
    { propertyId: beltlineProperty.id, imageUrl: "/attached_assets/stock_images/modern_industrial_lo_763c2271.jpg", isPrimary: false, displayOrder: 1, caption: "Entrance" },
    { propertyId: beltlineProperty.id, imageUrl: "/attached_assets/stock_images/modern_industrial_lo_f7817420.jpg", isPrimary: false, displayOrder: 2, caption: "Night View" },
  ]);

  // Beltline Units
  const beltlineUnits = [
    { unitNumber: "A1", bedrooms: 1, bathrooms: 1, squareFeet: 750, features: "Exposed brick, Concrete floors, Industrial lighting" },
    { unitNumber: "A2", bedrooms: 1, bathrooms: 1, squareFeet: 800, features: "High ceilings, Large windows, Modern kitchen", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "B1", bedrooms: 2, bathrooms: 1, squareFeet: 950, features: "Open floor plan, Exposed ductwork, Washer/dryer" },
    { unitNumber: "B2", bedrooms: 2, bathrooms: 2, squareFeet: 1100, features: "Master suite, Walk-in closets, Premium appliances" },
    { unitNumber: "C1", bedrooms: 2, bathrooms: 1, squareFeet: 900, features: "Corner unit, Extra windows, Updated finishes" },
    { unitNumber: "C2", bedrooms: 1, bathrooms: 1, squareFeet: 700, features: "Efficient layout, Modern bathroom, Great storage" },
    { unitNumber: "D1", bedrooms: 3, bathrooms: 2, squareFeet: 1200, features: "Penthouse level, Private terrace, City views", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "D2", bedrooms: 2, bathrooms: 2, squareFeet: 1050, features: "Loft-style bedroom, Industrial charm, Updated kitchen" },
  ];

  for (const unitData of beltlineUnits) {
    const [unit] = await db.insert(units).values({
      propertyId: beltlineProperty.id,
      ...unitData,
    }).returning();

    const imageChoices = [
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/industrial_loft_inte_544a3160.jpg", isPrimary: true, displayOrder: 0, caption: "Living Space" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/apartment_bedroom_in_abccaf55.jpg", isPrimary: false, displayOrder: 1, caption: "Bedroom" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_ae99945e.jpg", isPrimary: false, displayOrder: 2, caption: "Kitchen" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/luxury_apartment_bat_7f235783.jpg", isPrimary: false, displayOrder: 3, caption: "Bathroom" },
      ],
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/industrial_loft_inte_052bbd7f.jpg", isPrimary: true, displayOrder: 0, caption: "Main Area" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_liv_3fd9338a.jpg", isPrimary: false, displayOrder: 1, caption: "Living Room" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_acceab33.jpg", isPrimary: false, displayOrder: 2, caption: "Kitchen" },
      ],
    ];

    const imageSet = imageChoices[Math.floor(Math.random() * imageChoices.length)];
    await db.insert(unitImages).values(imageSet);
  }
  console.log("✓ Created Beltline Lofts with 8 units");

  // ============================================
  // PROPERTY 3: East Dallas Courtyard Apartments (Dallas)
  // ============================================
  console.log("Creating Property 3: East Dallas Courtyard Apartments...");
  const [courtyardProperty] = await db.insert(properties).values({
    title: "East Dallas Courtyard Apartments",
    description: "Charming courtyard-style apartments in the heart of East Dallas. Beautifully landscaped grounds, resort-style pool, and convenient access to local shops and dining. Perfect blend of comfort and community.",
    location: "dallas",
    propertyType: "multifamily",
    address: "789 Gaston Ave, Dallas, TX 75214",
    featured: true,
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: courtyardProperty.id, imageUrl: "/attached_assets/stock_images/courtyard_apartment__b4f7d20d.jpg", isPrimary: true, displayOrder: 0, caption: "Courtyard View" },
    { propertyId: courtyardProperty.id, imageUrl: "/attached_assets/stock_images/courtyard_apartment__1bce9854.jpg", isPrimary: false, displayOrder: 1, caption: "Building Exterior" },
    { propertyId: courtyardProperty.id, imageUrl: "/attached_assets/stock_images/courtyard_apartment__e2801aac.jpg", isPrimary: false, displayOrder: 2, caption: "Pool Area" },
  ]);

  // Courtyard Units (22 units)
  const courtyardUnits = [
    { unitNumber: "101", bedrooms: 1, bathrooms: 1, squareFeet: 600, features: "Patio access, Wood-style flooring, Energy efficient" },
    { unitNumber: "102", bedrooms: 1, bathrooms: 1, squareFeet: 650, features: "Updated appliances, Walk-in closet, Ceiling fans" },
    { unitNumber: "103", bedrooms: 2, bathrooms: 1, squareFeet: 850, features: "Spacious layout, Breakfast bar, Extra storage", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "104", bedrooms: 2, bathrooms: 2, squareFeet: 950, features: "Corner unit, Private balcony, Washer/dryer hookups" },
    { unitNumber: "105", bedrooms: 1, bathrooms: 1, squareFeet: 625, features: "Courtyard views, Modern kitchen, Great natural light" },
    { unitNumber: "106", bedrooms: 2, bathrooms: 1, squareFeet: 900, features: "Open concept, Updated bathroom, Large windows" },
    { unitNumber: "201", bedrooms: 1, bathrooms: 1, squareFeet: 675, features: "Balcony, Vaulted ceilings, Modern finishes" },
    { unitNumber: "202", bedrooms: 2, bathrooms: 2, squareFeet: 1000, features: "Master suite, Dual sinks, Premium countertops" },
    { unitNumber: "203", bedrooms: 2, bathrooms: 1, squareFeet: 875, features: "Hardwood floors, Updated kitchen, Pool views", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "204", bedrooms: 1, bathrooms: 1, squareFeet: 700, features: "Corner unit, Extra windows, Modern appliances" },
    { unitNumber: "205", bedrooms: 2, bathrooms: 2, squareFeet: 950, features: "Split bedrooms, Walk-in closets, Washer/dryer included" },
    { unitNumber: "206", bedrooms: 1, bathrooms: 1, squareFeet: 650, features: "Efficient layout, Updated fixtures, Good storage" },
    { unitNumber: "301", bedrooms: 2, bathrooms: 2, squareFeet: 975, features: "Top floor, City views, Private balcony" },
    { unitNumber: "302", bedrooms: 1, bathrooms: 1, squareFeet: 625, features: "Cozy space, Modern kitchen, Great location" },
    { unitNumber: "303", bedrooms: 2, bathrooms: 1, squareFeet: 850, features: "Open floor plan, Breakfast nook, Ceiling fans", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "304", bedrooms: 3, bathrooms: 2, squareFeet: 1150, features: "Family-friendly, Extra bedroom, Lots of storage" },
    { unitNumber: "305", bedrooms: 2, bathrooms: 2, squareFeet: 925, features: "Updated throughout, Double vanity, Wood floors" },
    { unitNumber: "306", bedrooms: 1, bathrooms: 1, squareFeet: 675, features: "Balcony access, Modern finishes, Great views" },
    { unitNumber: "401", bedrooms: 2, bathrooms: 2, squareFeet: 1000, features: "Penthouse level, Premium finishes, Skyline views" },
    { unitNumber: "402", bedrooms: 2, bathrooms: 1, squareFeet: 900, features: "Corner unit, Natural light, Updated kitchen" },
    { unitNumber: "403", bedrooms: 1, bathrooms: 1, squareFeet: 700, features: "Top floor, Vaulted ceilings, Modern style", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "404", bedrooms: 3, bathrooms: 2, squareFeet: 1200, features: "Largest unit, Master suite, Two balconies" },
  ];

  for (const unitData of courtyardUnits) {
    const [unit] = await db.insert(units).values({
      propertyId: courtyardProperty.id,
      ...unitData,
    }).returning();

    const imageOptions = [
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_liv_92fc85c1.jpg", isPrimary: true, displayOrder: 0, caption: "Living Room" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/apartment_bedroom_in_6d45b16f.jpg", isPrimary: false, displayOrder: 1, caption: "Bedroom" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_771ab939.jpg", isPrimary: false, displayOrder: 2, caption: "Kitchen" },
      ],
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_liv_08eb125d.jpg", isPrimary: true, displayOrder: 0, caption: "Main Living Area" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/apartment_bedroom_in_f102aeb1.jpg", isPrimary: false, displayOrder: 1, caption: "Bedroom" },
      ],
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_liv_b25da69a.jpg", isPrimary: true, displayOrder: 0, caption: "Living Space" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_54c79aa7.jpg", isPrimary: false, displayOrder: 1, caption: "Kitchen" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/luxury_apartment_bat_5eedbe26.jpg", isPrimary: false, displayOrder: 2, caption: "Bathroom" },
      ],
    ];

    const imageSet = imageOptions[Math.floor(Math.random() * imageOptions.length)];
    await db.insert(unitImages).values(imageSet);
  }
  console.log("✓ Created East Dallas Courtyard Apartments with 22 units");

  // ============================================
  // PROPERTY 4: Deep Ellum Artist Studios (Dallas)
  // ============================================
  console.log("Creating Property 4: Deep Ellum Artist Studios...");
  const [deepEllumProperty] = await db.insert(properties).values({
    title: "Deep Ellum Artist Studios",
    description: "Converted warehouse with exposed brick and high ceilings in the heart of Dallas' creative district. These unique lofts offer an authentic urban living experience with character and charm. Walking distance to galleries, music venues, and restaurants.",
    location: "dallas",
    propertyType: "multifamily",
    address: "321 Elm St, Dallas, TX 75226",
    featured: false,
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: deepEllumProperty.id, imageUrl: "/attached_assets/stock_images/warehouse_artist_stu_9d99eb8f.jpg", isPrimary: true, displayOrder: 0, caption: "Building Exterior" },
    { propertyId: deepEllumProperty.id, imageUrl: "/attached_assets/stock_images/warehouse_artist_stu_43f85665.jpg", isPrimary: false, displayOrder: 1, caption: "Entrance" },
    { propertyId: deepEllumProperty.id, imageUrl: "/attached_assets/stock_images/warehouse_artist_stu_475bc8a7.jpg", isPrimary: false, displayOrder: 2, caption: "Street View" },
  ]);

  // Deep Ellum Units
  const deepEllumUnits = [
    { unitNumber: "Studio A", bedrooms: 1, bathrooms: 1, squareFeet: 900, features: "14ft ceilings, Exposed brick walls, Polished concrete floors, Skylight", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "Studio B", bedrooms: 2, bathrooms: 1, squareFeet: 1100, features: "Exposed ductwork, Industrial windows, Open layout, Art studio space" },
    { unitNumber: "Studio C", bedrooms: 2, bathrooms: 2, squareFeet: 1200, features: "Mezzanine loft, Warehouse windows, Modern kitchen, Artist workspace", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { unitNumber: "Studio D", bedrooms: 1, bathrooms: 1, squareFeet: 850, features: "Corner unit, Original brick, High ceilings, Vintage details" },
  ];

  for (const unitData of deepEllumUnits) {
    const [unit] = await db.insert(units).values({
      propertyId: deepEllumProperty.id,
      ...unitData,
    }).returning();

    const imageChoices = [
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/industrial_loft_inte_f9fedfb8.jpg", isPrimary: true, displayOrder: 0, caption: "Main Studio Space" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/industrial_loft_inte_42b93900.jpg", isPrimary: false, displayOrder: 1, caption: "Living Area" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_cffb8eb0.jpg", isPrimary: false, displayOrder: 2, caption: "Kitchen" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/apartment_bedroom_in_abccaf55.jpg", isPrimary: false, displayOrder: 3, caption: "Bedroom Loft" },
      ],
      [
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/industrial_loft_inte_544a3160.jpg", isPrimary: true, displayOrder: 0, caption: "Open Loft Space" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/industrial_loft_inte_052bbd7f.jpg", isPrimary: false, displayOrder: 1, caption: "Living Space" },
        { unitId: unit.id, imageUrl: "/attached_assets/stock_images/modern_apartment_kit_ae99945e.jpg", isPrimary: false, displayOrder: 2, caption: "Kitchen Area" },
      ],
    ];

    const imageSet = imageChoices[Math.floor(Math.random() * imageChoices.length)];
    await db.insert(unitImages).values(imageSet);
  }
  console.log("✓ Created Deep Ellum Artist Studios with 4 units");

  // ============================================
  // PROPERTY 5: Charming Craftsman Bungalow (Atlanta)
  // ============================================
  console.log("Creating Property 5: Charming Craftsman Bungalow...");
  const [craftsmanProperty] = await db.insert(properties).values({
    title: "Charming Craftsman Bungalow",
    description: "Beautiful 3-bedroom, 2-bathroom craftsman bungalow in a desirable Atlanta neighborhood. Features original hardwood floors, built-in cabinetry, covered front porch, and large backyard. Recently updated with modern amenities while preserving historic charm.",
    location: "atlanta",
    propertyType: "single-family",
    address: "234 Highland Ave NE, Atlanta, GA 30312",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    featured: false,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: craftsmanProperty.id, imageUrl: "/attached_assets/stock_images/craftsman_bungalow_e_b7b5367e.jpg", isPrimary: true, displayOrder: 0, caption: "Front Exterior" },
    { propertyId: craftsmanProperty.id, imageUrl: "/attached_assets/stock_images/craftsman_bungalow_e_522112ea.jpg", isPrimary: false, displayOrder: 1, caption: "Side View" },
    { propertyId: craftsmanProperty.id, imageUrl: "/attached_assets/stock_images/craftsman_bungalow_e_fd07cad3.jpg", isPrimary: false, displayOrder: 2, caption: "Front Porch" },
    { propertyId: craftsmanProperty.id, imageUrl: "/attached_assets/stock_images/craftsman_bungalow_e_e259c6c4.jpg", isPrimary: false, displayOrder: 3, caption: "Architectural Details" },
  ]);
  console.log("✓ Created Charming Craftsman Bungalow");

  // ============================================
  // PROPERTY 6: Modern Minimalist Home (Dallas)
  // ============================================
  console.log("Creating Property 6: Modern Minimalist Home...");
  const [modernProperty] = await db.insert(properties).values({
    title: "Modern Minimalist Home",
    description: "Stunning 4-bedroom, 3-bathroom contemporary home with clean lines and sophisticated design. Features open floor plan, floor-to-ceiling windows, chef's kitchen with premium appliances, and landscaped yard. Smart home technology throughout.",
    location: "dallas",
    propertyType: "single-family",
    address: "567 Knox St, Dallas, TX 75205",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2200,
    featured: false,
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: modernProperty.id, imageUrl: "/attached_assets/stock_images/modern_minimalist_ho_df649725.jpg", isPrimary: true, displayOrder: 0, caption: "Front Exterior" },
    { propertyId: modernProperty.id, imageUrl: "/attached_assets/stock_images/modern_minimalist_ho_fe9b1672.jpg", isPrimary: false, displayOrder: 1, caption: "Side View" },
    { propertyId: modernProperty.id, imageUrl: "/attached_assets/stock_images/modern_minimalist_ho_535d0a38.jpg", isPrimary: false, displayOrder: 2, caption: "Evening View" },
    { propertyId: modernProperty.id, imageUrl: "/attached_assets/stock_images/modern_minimalist_ho_d18fa5ad.jpg", isPrimary: false, displayOrder: 3, caption: "Entrance" },
    { propertyId: modernProperty.id, imageUrl: "/attached_assets/stock_images/modern_apartment_liv_093b3dda.jpg", isPrimary: false, displayOrder: 4, caption: "Interior Living Space" },
  ]);
  console.log("✓ Created Modern Minimalist Home");

  // ============================================
  // PROPERTY 7: Historic Cottage in Lakewood (Dallas)
  // ============================================
  console.log("Creating Property 7: Historic Cottage in Lakewood...");
  const [cottageProperty] = await db.insert(properties).values({
    title: "Historic Cottage in Lakewood",
    description: "Adorable 2-bedroom, 1-bathroom cottage in the charming Lakewood neighborhood. Full of character with original details, updated systems, and a lovely garden. Perfect starter home or investment property. Close to White Rock Lake and local shops.",
    location: "dallas",
    propertyType: "single-family",
    address: "890 Lakewood Blvd, Dallas, TX 75214",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 1200,
    featured: false,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  }).returning();

  await db.insert(propertyImages).values([
    { propertyId: cottageProperty.id, imageUrl: "/attached_assets/stock_images/historic_cottage_ext_ccdd2e87.jpg", isPrimary: true, displayOrder: 0, caption: "Front Exterior" },
    { propertyId: cottageProperty.id, imageUrl: "/attached_assets/stock_images/historic_cottage_ext_e261223e.jpg", isPrimary: false, displayOrder: 1, caption: "Garden View" },
    { propertyId: cottageProperty.id, imageUrl: "/attached_assets/stock_images/historic_cottage_ext_36754fd3.jpg", isPrimary: false, displayOrder: 2, caption: "Side View" },
    { propertyId: cottageProperty.id, imageUrl: "/attached_assets/stock_images/historic_cottage_ext_0bfba9bf.jpg", isPrimary: false, displayOrder: 3, caption: "Backyard" },
  ]);
  console.log("✓ Created Historic Cottage in Lakewood");

  console.log("\n✅ Database seeded successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - 7 properties created`);
  console.log(`   - 40 units created`);
  console.log(`   - Multiple images per property and unit`);
  console.log(`   - Featured properties marked`);
  console.log(`   - Sample YouTube videos added`);
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
