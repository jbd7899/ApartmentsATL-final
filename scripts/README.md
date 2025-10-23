# Property Seed Script

This directory contains the comprehensive database seed script for populating the property rental application with real property data.

## Scripts

### `seed-properties.ts`

Seeds the database with all 23 properties (7 single-family homes and 16 multifamily buildings) across Atlanta and Dallas locations.

**Features:**
- Creates all 23 properties with realistic descriptions
- Generates 92 total units with varied configurations
- Uploads property and unit images to object storage with proper ACLs
- Sets featured properties
- Uses existing stock images from `attached_assets/stock_images`

**To Run:**
```bash
tsx scripts/seed-properties.ts
```

**What it does:**
1. Clears existing property, unit, and image data
2. Uploads stock images to object storage (6 property exteriors, 6 unit interiors)
3. Creates 23 properties:
   - **Atlanta:** 11 multifamily + 1 single-family
   - **Dallas:** 5 multifamily + 6 single-family
4. Generates units for each property:
   - Multifamily properties: 1-23 units per building
   - Single-family properties: 1 unit per home
5. Associates images with all properties and units

**Results:**
- 23 properties
- 92 units
- 57 property images
- 284 unit images
- 3 featured properties

## Property List

All properties are seeded with the following addresses:

1. 1015 Cameron Ave, Dallas, TX 75223 - Multi-Family, 4 units
2. 1031 Lanier Blvd, Atlanta, GA 30306 - Multi-Family, 4 units
3. 1900 Lucille St, Dallas, TX 75204 - Multi-Family, 3 units
4. 253 14th St NE, Atlanta, GA 30309 - Multi-Family, 23 units
5. 290 8th St NE, Atlanta, GA 30309 - Multi-Family, 5 units
6. 4806 Live Oak St, Dallas, TX 75204 - Multi-Family, 4 units
7. 5501 Winton St, Dallas, TX 75206 - Single-Family, 1 unit
8. 5503 Winton St, Dallas, TX 75206 - Single-Family, 1 unit
9. 615 Parkview Ave, Dallas, TX 75223 - Multi-Family, 3 units
10. 6212 Martel Ave, Dallas, TX 75214 - Single-Family, 1 unit
11. 6236 Winton St, Dallas, TX 75214 - Single-Family, 1 unit
12. 6463 Trammel Drive, Dallas, TX 75214 - Single-Family, 1 unit
13. 717 Argonne Ave, Atlanta, GA 30308 - Multi-Family, 5 units
14. 718 Argonne Ave, Atlanta, GA 30308 - Multi-Family, 4 units
15. 721 Argonne Ave, Atlanta, GA 30308 - Multi-Family, 7 units
16. 769 Argonne Ave, Atlanta, GA 30308 - Multi-Family, 4 units
17. 823 Greenwood Ave, Atlanta, GA 30306 - Multi-Family, 1 unit
18. 823 Greenwood Ave 1/2, Atlanta, GA 30306 - Single-Family, 1 unit
19. 869 St Charles Ave, Atlanta, GA 30306 - Multi-Family, 4 units
20. 903 Myrtle St, Atlanta, GA 30309 - Multi-Family, 6 units
21. 915 Grigsby Ave, Dallas, TX 75204 - Multi-Family, 4 units
22. 965 Myrtle St, Atlanta, GA 30309 - Multi-Family, 4 units
23. 4417 Sycamore St, Dallas, TX 75204 - Single-Family, 1 unit

## Technical Details

- **Database:** Uses Drizzle ORM with PostgreSQL
- **Object Storage:** Replit Object Storage with ACL policies
- **Images:** Reuses existing stock images from `attached_assets/stock_images`
- **Error Handling:** Comprehensive logging and error messages
- **Performance:** Smart image reuse to minimize uploads
