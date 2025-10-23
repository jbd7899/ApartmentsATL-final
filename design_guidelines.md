# Design Guidelines: Property Portfolio Website

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Airbnb's property showcase aesthetics combined with modern real estate platforms like Zillow and professional property management sites. The design emphasizes visual storytelling through photography while maintaining professional credibility for a family-owned rental business.

## Core Design Principles
1. **Image-First Philosophy**: Properties sell themselves through quality photography
2. **Trust & Professionalism**: Clean, organized layouts that inspire confidence
3. **Location Clarity**: Clear distinction between Atlanta and Dallas markets
4. **Accessibility**: Easy navigation to resident portal and AppFolio listings

## Color Palette

**Light Mode:**
- Primary: 220 15% 25% (Deep Navy - trust, professionalism)
- Secondary: 25 85% 55% (Warm Terracotta - approachable, inviting)
- Background: 0 0% 98% (Soft White)
- Surface: 0 0% 100% (Pure White cards)
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 45%

**Dark Mode:**
- Primary: 220 15% 85%
- Secondary: 25 75% 65%
- Background: 220 15% 10%
- Surface: 220 15% 15%
- Text Primary: 220 15% 95%
- Text Secondary: 220 10% 70%

**Accent Colors:**
- Success (Available): 140 60% 45%
- Warning (Pending): 40 95% 55%

## Typography
- **Primary Font**: Inter (via Google Fonts CDN) - modern, professional, excellent readability
- **Headings**: Inter 600-700 weight
  - H1: 3xl-4xl (landing hero)
  - H2: 2xl-3xl (section headers)
  - H3: xl-2xl (property titles)
- **Body**: Inter 400-500 weight, text-base to lg
- **Captions**: Inter 400 weight, text-sm

## Layout System
**Spacing Units**: Use Tailwind spacing of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Max content width: max-w-7xl with mx-auto

## Component Library

### Navigation
- **Sticky header** with logo, location navigation (Atlanta/Dallas), Resident Portal link
- Clean horizontal menu with hover underline effects
- Mobile: Hamburger menu with slide-in drawer

### Property Cards
- **Large image thumbnail** (aspect-ratio-4/3)
- Property title, type badge (Multifamily/Single Family), location
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Hover state: subtle scale transform and shadow elevation
- "View Details" CTA button

### Property Detail Pages
- **Hero image carousel** (full-width, h-96 to h-[500px])
- YouTube video embed section (16:9 aspect ratio)
- Property information grid (bedrooms, bathrooms, sq ft, amenities)
- Image gallery grid below hero
- Strategic CTA: "Check Availability" linking to AppFolio iframe section

### AppFolio Integration Section
- Dedicated section with clear heading "Available Properties"
- Iframe embedded with proper styling (rounded corners, shadow)
- Context text: "View current availability and submit inquiries"

### About Us Section
- **Two-column layout**: Left = family business story, Right = mission/values or team photo placeholder
- Warm, personal tone with professional credibility
- Trust indicators: "Family Owned Since [YEAR]", "Serving Atlanta & Dallas"

### Resident Portal CTA
- **Prominent placement** in header AND footer
- Styled as primary button with distinct treatment
- Icon: User or Home icon from Heroicons

## Images

**Hero Section (Homepage):**
- Large hero image showcasing an attractive property exterior or interior
- Dimensions: Full-width, h-[500px] to h-[600px]
- Overlay: Subtle dark gradient (from bottom) for text readability
- Hero text: "Quality Rental Properties in Atlanta & Dallas"

**Property Images:**
- Minimum 4-6 high-quality images per property
- Mix of exterior, interior, amenities shots
- Aspect ratio: 4:3 for consistency in grids
- Image descriptions: Professional real estate photography style

**About Us:**
- Optional team photo or property management in action
- Warm, authentic imagery reinforcing family-owned narrative

## Layout Patterns

### Homepage Structure
1. Hero with CTA overlay and blurred background buttons
2. Location selector (Atlanta/Dallas prominent cards)
3. Featured properties grid (6-9 properties)
4. AppFolio availability section
5. About Us snapshot
6. Footer with Resident Portal and contact info

### Location Pages (Atlanta/Dallas)
1. Location hero (neighborhood imagery)
2. Property type tabs/filters (Multifamily/Single Family)
3. Property grid with filtering
4. Neighborhood highlights
5. AppFolio section

### Property Detail Page
1. Image carousel hero
2. Property details sidebar/section
3. YouTube video (embedded player)
4. Amenities list
5. Location map placeholder
6. CTA to check availability

## Interactive Elements
- **Minimal animations**: Subtle hover states on cards, smooth transitions
- Image carousel: Smooth slides with dot indicators
- Filter transitions: Fade in/out when switching property types
- Scroll animations: None (prioritize stability)

## Accessibility & Performance
- Maintain consistent dark mode across all form inputs
- Alt text for all property images
- Semantic HTML structure
- Lazy loading for images below fold
- AppFolio iframe loads on user interaction or scroll trigger

## Icons
Use **Heroicons** (outline style) via CDN:
- Home, MapPin (locations)
- User (resident portal)
- PlayCircle (video indicator)
- Building, HomeModern (property types)