import { db } from "../server/db";
import { properties, propertyImages, units, unitImages } from "@shared/schema";
import { ObjectStorageService } from "../server/objectStorage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const objectStorageService = new ObjectStorageService();

interface PropertyData {
  address: string;
  city: "atlanta" | "dallas";
  propertyType: "multifamily" | "single-family";
  unitCount: number;
  title: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
}

const PROPERTY_DATA: PropertyData[] = [
  {
    address: "1015 Cameron Ave, Dallas, TX 75223",
    city: "dallas",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Cameron Avenue Apartments",
    description: "Charming 4-unit multifamily property in the vibrant Lakewood neighborhood. These well-maintained apartments feature updated interiors, hardwood floors, and convenient access to local dining and shopping. Perfect investment opportunity with strong rental history.",
  },
  {
    address: "1031 Lanier Blvd, Atlanta, GA 30306",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Lanier Boulevard Residences",
    description: "Beautiful 4-unit building in the heart of Virginia-Highland. This property combines historic charm with modern updates, featuring spacious layouts and original architectural details. Walking distance to Ponce City Market and the BeltLine.",
  },
  {
    address: "1900 Lucille St, Dallas, TX 75204",
    city: "dallas",
    propertyType: "multifamily",
    unitCount: 3,
    title: "Lucille Street Flats",
    description: "Boutique 3-unit property in the trendy Uptown Dallas area. Each unit offers open floor plans, modern kitchens, and private outdoor space. Excellent walkability to restaurants, shops, and entertainment venues.",
  },
  {
    address: "253 14th St NE, Atlanta, GA 30309",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 23,
    title: "Midtown 14th Street Apartments",
    description: "Premium 23-unit apartment building in the heart of Midtown Atlanta. This professionally managed property features a mix of studio, one, and two-bedroom units with modern amenities, secured entry, and on-site laundry. Steps from Piedmont Park and the Fox Theatre.",
  },
  {
    address: "290 8th St NE, Atlanta, GA 30309",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 5,
    title: "8th Street Lofts",
    description: "Contemporary 5-unit building in Midtown's cultural district. These stylish lofts feature high ceilings, exposed brick, and modern finishes. Perfect for young professionals seeking urban living with easy access to MARTA and downtown.",
  },
  {
    address: "4806 Live Oak St, Dallas, TX 75204",
    city: "dallas",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Live Oak Apartments",
    description: "Classic 4-unit building in the desirable M Streets neighborhood. These charming apartments offer hardwood floors, updated kitchens, and private yards. Tree-lined street with excellent walkability to shops and cafes.",
  },
  {
    address: "5501 Winton St, Dallas, TX 75206",
    city: "dallas",
    propertyType: "single-family",
    unitCount: 1,
    title: "Winton Street Bungalow",
    description: "Adorable 3-bedroom, 2-bathroom bungalow in East Dallas. Features original hardwood floors, updated kitchen and bathrooms, covered front porch, and large backyard. Perfect family home in a quiet, established neighborhood.",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1450,
  },
  {
    address: "5503 Winton St, Dallas, TX 75206",
    city: "dallas",
    propertyType: "single-family",
    unitCount: 1,
    title: "Winton Street Cottage",
    description: "Cozy 2-bedroom, 1-bathroom cottage just steps from 5501 Winton. Recently renovated with modern amenities while maintaining vintage charm. Ideal starter home or investment property with strong rental demand.",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 950,
  },
  {
    address: "615 Parkview Ave, Dallas, TX 75223",
    city: "dallas",
    propertyType: "multifamily",
    unitCount: 3,
    title: "Parkview Avenue Triplex",
    description: "Well-maintained 3-unit property near Lakewood with excellent income potential. Each unit features updated appliances, central air, and private entries. Close to White Rock Lake and local amenities.",
  },
  {
    address: "6212 Martel Ave, Dallas, TX 75214",
    city: "dallas",
    propertyType: "single-family",
    unitCount: 1,
    title: "Martel Avenue Home",
    description: "Charming 3-bedroom, 2-bathroom home in the heart of Lakewood. Features include hardwood floors, updated kitchen with granite counters, spacious backyard, and detached garage. Walk to restaurants and shopping.",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1600,
  },
  {
    address: "6236 Winton St, Dallas, TX 75214",
    city: "dallas",
    propertyType: "single-family",
    unitCount: 1,
    title: "East Dallas Family Home",
    description: "Spacious 4-bedroom, 3-bathroom family home with recent updates throughout. Open floor plan, modern kitchen, master suite, and large yard. Great schools and family-friendly neighborhood.",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2100,
  },
  {
    address: "6463 Trammel Drive, Dallas, TX 75214",
    city: "dallas",
    propertyType: "single-family",
    unitCount: 1,
    title: "Trammel Drive Residence",
    description: "Beautiful 3-bedroom, 2-bathroom home in sought-after Lakewood area. Features include vaulted ceilings, fireplace, updated bathrooms, and covered patio. Mature trees and quiet street.",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1550,
  },
  {
    address: "717 Argonne Ave, Atlanta, GA 30308",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 5,
    title: "Argonne Avenue Apartments",
    description: "Attractive 5-unit building in Midtown's Virginia-Highland border. Mix of one and two-bedroom units with hardwood floors and updated kitchens. Strong rental history in a walkable neighborhood.",
  },
  {
    address: "718 Argonne Ave, Atlanta, GA 30308",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Argonne Place",
    description: "Well-maintained 4-unit property directly across from 717 Argonne. Charming units with original character, modern updates, and private outdoor spaces. Excellent location near restaurants and shops.",
  },
  {
    address: "721 Argonne Ave, Atlanta, GA 30308",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 7,
    title: "Argonne Manor",
    description: "Larger 7-unit building on Argonne Avenue featuring a variety of floor plans. Professional management, on-site laundry, and secure entry. Popular area with strong rental demand and appreciation.",
  },
  {
    address: "769 Argonne Ave, Atlanta, GA 30308",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Argonne Court Apartments",
    description: "Classic 4-unit building with timeless appeal. Updated interiors, hardwood floors, and modern appliances throughout. Prime Midtown location with easy access to Piedmont Park and entertainment.",
  },
  {
    address: "823 Greenwood Ave, Atlanta, GA 30306",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 1,
    title: "Greenwood Avenue Duplex",
    description: "Unique single-unit property on Greenwood Avenue with potential for conversion. Spacious layout with 2 bedrooms and 1.5 bathrooms. Virginia-Highland location with excellent walkability.",
  },
  {
    address: "823 Greenwood Ave 1/2, Atlanta, GA 30306",
    city: "atlanta",
    propertyType: "single-family",
    unitCount: 1,
    title: "Greenwood Carriage House",
    description: "Charming 2-bedroom, 1-bathroom carriage house behind 823 Greenwood. Private entrance, full kitchen, and cozy living space. Perfect for singles or couples in the heart of Virginia-Highland.",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
  },
  {
    address: "869 St Charles Ave, Atlanta, GA 30306",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 4,
    title: "St Charles Avenue Residences",
    description: "Beautiful 4-unit building in prestigious Virginia-Highland. Spacious apartments with hardwood floors, updated kitchens, and in-unit laundry. Tree-lined street in one of Atlanta's most desirable neighborhoods.",
  },
  {
    address: "903 Myrtle St, Atlanta, GA 30309",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 6,
    title: "Myrtle Street Apartments",
    description: "Solid 6-unit investment property in Midtown. Mix of one and two-bedroom apartments with recent updates. Excellent rental income and appreciation potential in growing area.",
  },
  {
    address: "915 Grigsby Ave, Dallas, TX 75204",
    city: "dallas",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Grigsby Avenue Fourplex",
    description: "Attractive 4-unit property in the M Streets area. Well-maintained with recent renovations including new HVAC systems and updated kitchens. Strong tenant base and consistent rental income.",
  },
  {
    address: "965 Myrtle St, Atlanta, GA 30309",
    city: "atlanta",
    propertyType: "multifamily",
    unitCount: 4,
    title: "Myrtle Street Flats",
    description: "Charming 4-unit building near 903 Myrtle. Features include hardwood floors, high ceilings, and modern amenities. Prime Midtown location with walkability to restaurants and nightlife.",
  },
  {
    address: "4417 Sycamore St, Dallas, TX 75204",
    city: "dallas",
    propertyType: "single-family",
    unitCount: 1,
    title: "Sycamore Street Home",
    description: "Lovely 3-bedroom, 2-bathroom home in the M Streets neighborhood. Features include updated kitchen, hardwood floors, fireplace, and spacious backyard. Ideal family home with excellent schools nearby.",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
  },
];

// Helper function to upload local image to object storage
async function uploadImageToStorage(localPath: string): Promise<string> {
  try {
    const imageBuffer = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);
    
    // Get upload URL
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    
    // Upload the image
    const response = await fetch(uploadURL, {
      method: "PUT",
      body: imageBuffer,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    // Get the object path from the upload URL
    const url = new URL(uploadURL);
    const objectPath = url.pathname;
    
    // Normalize the path to /objects/... format
    const normalizedPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    
    // Set ACL policy to public
    await objectStorageService.trySetObjectEntityAclPolicy(normalizedPath, {
      owner: "system",
      visibility: "public",
    });

    return normalizedPath;
  } catch (error) {
    console.error(`Error uploading image ${localPath}:`, error);
    throw error;
  }
}

// Helper function to get images for property type
function getPropertyImages(propertyType: "multifamily" | "single-family"): string[] {
  const basePath = path.join(__dirname, "../attached_assets/stock_images");
  
  if (propertyType === "multifamily") {
    return [
      path.join(basePath, "victorian_building_e_4a91322e.jpg"),
      path.join(basePath, "courtyard_apartment__b4f7d20d.jpg"),
      path.join(basePath, "modern_industrial_lo_784c6b97.jpg"),
    ];
  } else {
    return [
      path.join(basePath, "craftsman_bungalow_e_b7b5367e.jpg"),
      path.join(basePath, "modern_minimalist_ho_df649725.jpg"),
      path.join(basePath, "historic_cottage_ext_ccdd2e87.jpg"),
    ];
  }
}

// Helper function to get unit interior images
function getUnitImages(): string[] {
  const basePath = path.join(__dirname, "../attached_assets/stock_images");
  
  return [
    path.join(basePath, "modern_apartment_liv_92fc85c1.jpg"),
    path.join(basePath, "apartment_bedroom_in_851bebf7.jpg"),
    path.join(basePath, "modern_apartment_kit_cffb8eb0.jpg"),
    path.join(basePath, "luxury_apartment_bat_d683fee9.jpg"),
    path.join(basePath, "victorian_apartment__eba3ffa1.jpg"),
    path.join(basePath, "industrial_loft_inte_544a3160.jpg"),
  ];
}

// Generate unit configuration based on property
function generateUnits(propertyData: PropertyData, propertyId: string) {
  const units = [];
  const { unitCount, propertyType } = propertyData;
  
  if (propertyType === "single-family") {
    // Single family has one unit matching the property details
    units.push({
      propertyId,
      unitNumber: "Main",
      bedrooms: propertyData.bedrooms || 3,
      bathrooms: propertyData.bathrooms || 2,
      squareFeet: propertyData.squareFeet || 1500,
      features: "Full house, Private yard, Driveway parking",
    });
  } else {
    // Multi-family: generate varied units
    const bedroomOptions = [1, 1, 2, 2, 2, 3];
    const bathroomOptions = [1, 1, 2, 2];
    
    for (let i = 0; i < unitCount; i++) {
      const bedrooms = bedroomOptions[i % bedroomOptions.length];
      const bathrooms = bathroomOptions[i % bathroomOptions.length];
      const baseSquareFeet = bedrooms === 1 ? 650 : bedrooms === 2 ? 900 : 1200;
      const squareFeet = baseSquareFeet + Math.floor(Math.random() * 200);
      
      let unitNumber;
      if (unitCount <= 4) {
        // Small buildings use A, B, C, D
        unitNumber = String.fromCharCode(65 + i);
      } else {
        // Larger buildings use floor + unit (101, 102, 201, 202, etc.)
        const floor = Math.floor(i / Math.min(4, Math.ceil(unitCount / 3))) + 1;
        const unitOnFloor = (i % Math.min(4, Math.ceil(unitCount / 3))) + 1;
        unitNumber = `${floor}0${unitOnFloor}`;
      }
      
      const features = [
        bedrooms > 1 ? "Spacious layout" : "Efficient design",
        bathrooms > 1 ? "Dual sinks" : "Modern bathroom",
        i % 3 === 0 ? "Updated kitchen" : "Modern appliances",
        i % 4 === 0 ? "Hardwood floors" : "Tile and carpet",
        i % 5 === 0 ? "In-unit laundry" : "Shared laundry access",
      ].join(", ");
      
      units.push({
        propertyId,
        unitNumber,
        bedrooms,
        bathrooms,
        squareFeet,
        features,
      });
    }
  }
  
  return units;
}

async function seedProperties() {
  console.log("🌱 Starting comprehensive property seed...\n");
  
  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(unitImages);
  await db.delete(propertyImages);
  await db.delete(units);
  await db.delete(properties);
  console.log("✓ Existing data cleared\n");
  
  // Upload images to storage once (reuse them)
  console.log("📤 Uploading property exterior images to object storage...");
  const propertyImagePaths = {
    multifamily: await Promise.all(
      getPropertyImages("multifamily").map(img => uploadImageToStorage(img))
    ),
    singleFamily: await Promise.all(
      getPropertyImages("single-family").map(img => uploadImageToStorage(img))
    ),
  };
  console.log("✓ Property images uploaded\n");
  
  console.log("📤 Uploading unit interior images to object storage...");
  const unitImagePaths = await Promise.all(
    getUnitImages().map(img => uploadImageToStorage(img))
  );
  console.log("✓ Unit images uploaded\n");
  
  let totalProperties = 0;
  let totalUnits = 0;
  
  // Create each property
  for (const propertyData of PROPERTY_DATA) {
    console.log(`Creating: ${propertyData.title}...`);
    
    // Create property
    const [property] = await db.insert(properties).values({
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.city,
      propertyType: propertyData.propertyType,
      address: propertyData.address,
      bedrooms: propertyData.bedrooms || null,
      bathrooms: propertyData.bathrooms || null,
      squareFeet: propertyData.squareFeet || null,
      featured: totalProperties < 3, // First 3 are featured
    }).returning();
    
    totalProperties++;
    
    // Add property images (2-3 images per property)
    const propertyImagesPool = propertyData.propertyType === "multifamily" 
      ? propertyImagePaths.multifamily 
      : propertyImagePaths.singleFamily;
    
    const numPropertyImages = Math.min(2 + Math.floor(Math.random() * 2), propertyImagesPool.length);
    const selectedPropertyImages = [];
    
    for (let i = 0; i < numPropertyImages; i++) {
      selectedPropertyImages.push({
        propertyId: property.id,
        imageUrl: propertyImagesPool[i % propertyImagesPool.length],
        isPrimary: i === 0,
        displayOrder: i,
        caption: i === 0 ? "Building Exterior" : `View ${i + 1}`,
      });
    }
    
    await db.insert(propertyImages).values(selectedPropertyImages);
    
    // Generate and create units
    const unitData = generateUnits(propertyData, property.id);
    
    for (const unit of unitData) {
      const [createdUnit] = await db.insert(units).values(unit).returning();
      totalUnits++;
      
      // Add 2-4 images per unit
      const numUnitImages = 2 + Math.floor(Math.random() * 3);
      const selectedUnitImages = [];
      
      for (let i = 0; i < numUnitImages; i++) {
        const imageIndex = (totalUnits + i) % unitImagePaths.length;
        selectedUnitImages.push({
          unitId: createdUnit.id,
          imageUrl: unitImagePaths[imageIndex],
          isPrimary: i === 0,
          displayOrder: i,
          caption: i === 0 ? "Living Area" : i === 1 ? "Bedroom" : i === 2 ? "Kitchen" : "Bathroom",
        });
      }
      
      await db.insert(unitImages).values(selectedUnitImages);
    }
    
    console.log(`  ✓ Created with ${unitData.length} unit(s)`);
  }
  
  console.log("\n✅ Database seeded successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - ${totalProperties} properties created`);
  console.log(`   - ${totalUnits} units created`);
  console.log(`   - Images uploaded and associated`);
  console.log(`   - Featured properties marked`);
  
  process.exit(0);
}

seedProperties().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
