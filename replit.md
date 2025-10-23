# Property Portfolio Website

## Overview

This is a family-owned property management website showcasing rental properties in Intown Atlanta and East Dallas. The application allows visitors to browse multifamily and single-family properties, view detailed property information with images, and access the resident portal via AppFolio integration. An admin panel enables authenticated property managers to create, edit, and manage property listings with image uploads.

The site emphasizes an image-first, trust-building design philosophy inspired by modern real estate platforms like Airbnb and Zillow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for utility-first styling with custom design tokens

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library configured in "new-york" style
- Custom design system defined in `design_guidelines.md` with specific color palettes for light/dark modes
- Inter font family via Google Fonts CDN for typography

**State Management:**
- React Query handles all server state, caching, and synchronization
- Local component state with React hooks
- Authentication state managed through custom `useAuth` hook
- No global state management library needed due to React Query

**Key Design Decisions:**
- Image-first philosophy: Properties showcase through quality photography
- Responsive design with mobile-first approach using Tailwind breakpoints
- Dark mode support built into the theming system
- Accessibility-focused using Radix UI primitives

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- Modular route registration pattern in `server/routes.ts`

**Authentication & Session Management:**
- Replit OpenID Connect (OIDC) integration via Passport.js
- Session-based authentication with PostgreSQL session store (`connect-pg-simple`)
- Middleware-based route protection with `isAuthenticated` guard
- Session cookies with 7-day TTL, httpOnly and secure flags

**API Structure:**
- RESTful endpoints for properties CRUD operations
- Authentication endpoints (`/api/auth/user`)
- Object storage endpoints for image upload/download (`/objects/*`, `/api/objects/upload`)
- Consistent error handling with status codes and JSON responses

**File Upload System:**
- Uppy dashboard for client-side file management
- Google Cloud Storage backend for object storage
- Custom ACL (Access Control List) system for object-level permissions
- Pre-signed URL generation for secure uploads
- Support for multiple images per property with primary image designation

### Data Storage

**Database:**
- PostgreSQL via Neon serverless connection
- Drizzle ORM for type-safe database operations
- WebSocket-based connection pooling for serverless compatibility

**Schema Design:**
- `users` table: Stores user profiles from Replit Auth (id, email, name, profile image)
- `sessions` table: Manages authentication sessions
- `properties` table: Core property data (title, description, location, type, bedrooms, bathrooms, etc.)
- `property_images` table: Property photos with captions and primary flag
- One-to-many relationship between properties and images

**Data Access Layer:**
- Repository pattern implemented in `server/storage.ts`
- IStorage interface defines all data operations
- DatabaseStorage class implements PostgreSQL-specific logic
- Property queries return joined data (`PropertyWithImages` type)
- Automatic timestamp management (createdAt, updatedAt)

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Schema definitions in `shared/schema.ts` for client-server sharing

### External Dependencies

**Third-Party Services:**
- **Replit Infrastructure:**
  - Replit Auth (OpenID Connect) for user authentication
  - Replit Object Storage via Google Cloud Storage API
  - Replit sidecar endpoint for credential management
  
- **Neon Database:**
  - Serverless PostgreSQL hosting
  - WebSocket-based connection protocol
  - Connection string via `DATABASE_URL` environment variable

- **AppFolio Integration:**
  - Embedded listing widget for resident portal access
  - Dynamic script injection in `AppfolioSection` component
  - Third-party iframe for property listings

**Build & Development Tools:**
- Vite plugins for development experience (runtime errors, cartographer, dev banner)
- ESBuild for server-side bundling
- TypeScript compiler for type checking
- Drizzle Kit for database migrations

**Frontend Libraries:**
- @tanstack/react-query: Server state management
- @uppy/core, @uppy/dashboard, @uppy/aws-s3: File upload UI and logic
- Radix UI components: Accessible primitives
- class-variance-authority & clsx: Dynamic className generation
- Zod: Runtime schema validation for forms and API data

**Key Architectural Patterns:**
- Monorepo structure with shared types between client/server
- Path aliases for clean imports (@/, @shared/, @assets/)
- Environment-based configuration (development vs production)
- Separation of concerns: UI components, business logic, data access
- Type sharing via `shared/schema.ts` for end-to-end type safety