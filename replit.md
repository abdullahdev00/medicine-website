# MediSwift Pakistan - Healthcare E-commerce Platform

## Overview

MediSwift Pakistan is a modern healthcare e-commerce platform designed for selling medicines and health products in Pakistan. The application provides a trusted, user-friendly interface for browsing medical products, managing shopping carts, wishlists, and completing orders with multiple payment options. The platform emphasizes clean design, accessibility, and a seamless mobile-first experience inspired by leading healthcare apps.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 16, 2025)

### Profile Section Enhancements
- **New Features Added to Profile**:
  1. **My Wallet Page** (`/wallet`) - View balance, add money, and track transactions (credit/debit)
  2. **Affiliate Program Page** (`/affiliate`) - 6-digit referral code (MED789), earnings tracking, referral orders
  3. **Become a Partner Page** (`/become-partner`) - Wholesale application with status tracking and MOQ requirements
  4. **My Favorites Button** - Quick access to saved/wishlist items with red heart icon
- **Profile Page Design**: 7 total sections displayed as individual gradient cards with circular icons
- **Modern Theme**: All profile pages follow consistent design - circular/rounded elements, gradient cards, spacious layouts

### Filter System Redesign - Bottom Sheet
- **Removed Sidebar**: Replaced filter sidebar with modern bottom sheet design
- **Circular Category Buttons**: Categories displayed as rounded pill buttons for multi-selection
- **Enhanced Design**:
  - Bottom sheet slides up from bottom (85vh height)
  - Circular/rounded design throughout
  - Gradient buttons for selected categories (primary color)
  - Price range slider with gradient track and improved thumbs
  - Min/Max price displayed in gradient cards
  - Clean header with filter count
  - Clear All and Apply Filters buttons
- **User Experience**: Matches profile page theme - modern, clean, no emojis

### PWA (Progressive Web App) Implementation
- **App Installability**: MediSwift is now a fully-functional PWA that can be installed on mobile devices and desktops
- **Offline Support**: Implemented service worker with network-first caching strategy for offline functionality
- **App Icons**: Generated and configured app icons (192x192 and 512x512) with brand colors
- **Manifest Configuration**: Created PWA manifest with proper metadata, theme colors (#009CA6), and display settings
- **Mobile Optimization**: Added Apple-specific meta tags for iOS installation and standalone mode

### Products Page Header Redesign
- **Clean Header Layout**: Removed "14 medicines available" text and dropdown filters
- **Circular Button Components**: Created reusable CircularButton component for back and filter actions
- **Brand-Colored Favorites**: Updated FavoriteButton to use primary brand color (cyan #009CA6) instead of red

### Design System Updates
- **Global Scrollbar Hiding**: All scrollbars are now hidden throughout the application for a cleaner interface
- **Rounded Design System**: Increased border radius from 0.75rem to 1rem for all inputs, buttons, and UI elements
- **Category Cards Redesign**: Category cards are now smaller (110px min-width) with horizontal scrolling instead of grid layout

### Authentication Flow Redesign
The authentication page has been completely redesigned with a multi-step signup flow:
1. **Step 1**: Basic information (Full Name, Email, Password)
2. **Step 2**: Email verification with waiting dialog and verification check
3. **Step 3**: Phone numbers (Phone and WhatsApp)
4. **Step 4**: Address information (Address, City, Province)

Each step features spacious layouts, smooth animations, and proper back navigation.

### Database Population
- Successfully seeded database with 6 product categories (Pain Relief, Vitamins & Supplements, First Aid, Personal Care, Baby Care, Diabetes Care)
- Added 14 sample products with proper categorization, pricing, and package options
- All data properly connected to the frontend via API endpoints

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui components built on top of Radix UI following the "new-york" style
- Tailwind CSS for utility-first styling with custom design tokens
- Framer Motion for animations and transitions
- Custom design system based on healthcare aesthetics with teal-blue primary colors

**State Management:**
- React hooks for local component state
- TanStack Query for server state, caching, and data synchronization
- Mock user authentication (MOCK_USER_ID) for development purposes

**Form Handling:**
- React Hook Form with Zod resolvers for schema validation
- Integration with shadcn/ui form components

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- TypeScript for type safety across the stack
- RESTful API design pattern

**API Structure:**
- Route handlers in `server/routes.ts` exposing endpoints for:
  - Categories (`/api/categories`)
  - Products (`/api/products`, `/api/products/:id`)
  - Cart management (`/api/cart`)
  - Wishlist operations (`/api/wishlist`)
  - Order processing (`/api/orders`)
- Storage abstraction layer (`server/storage.ts`) implementing IStorage interface for database operations

**Development Environment:**
- Vite middleware mode for SSR and development
- Custom error handling and logging middleware
- Hot module replacement in development

### Database Architecture

**ORM & Schema:**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database (via Neon serverless)
- Schema definitions in `shared/schema.ts` using Drizzle's pg-core

**Database Tables:**
- `users` - User profiles with authentication and address information
- `categories` - Product categories with icons and descriptions
- `products` - Medicine/health product catalog with pricing, ratings, stock status
- `cart_items` - Shopping cart with quantity and package selection
- `wishlist_items` - User wishlists
- `orders` - Order history with status tracking

**Data Modeling Decisions:**
- UUID primary keys for all tables for distributed scalability
- JSONB fields for flexible data (package options, order items)
- Timestamps for audit trails
- Foreign key relationships for data integrity

### Authentication & Authorization

**Current Implementation:**
- Mock user system using hardcoded MOCK_USER_ID for development
- User schema includes fields for email/password authentication
- Profile fields: full name, email, phone, WhatsApp number, address details

**Designed For:**
- Email/password authentication
- Google OAuth integration
- Email verification workflow
- Session management (connect-pg-simple package included)

### Design System

**Color Palette:**
- Primary: Teal (#009CA6 - HSL 183 100% 33%)
- Secondary backgrounds: Light teal (#E6F7F9)
- Accent: Pure white for cards
- Semantic colors for success, warning, error states

**Typography:**
- Primary font: Inter for body text and UI
- Secondary font: Poppins for headings
- Responsive type scale from text-sm to text-5xl

**Layout Principles:**
- Mobile-first responsive design
- Generous spacing (2, 4, 6, 8, 12, 16, 20 unit scale)
- Rounded corners (rounded-2xl, rounded-xl, rounded-full)
- Soft shadows for card elevation
- Breathable whitespace for comfortable browsing

## External Dependencies

### Core Infrastructure

**Database:**
- Neon PostgreSQL serverless database
- Connection via @neondatabase/serverless package
- Drizzle Kit for schema migrations

**State Management:**
- TanStack Query v5 for server state
- React Hook Form for form state
- Zod for runtime schema validation

### UI & Styling

**Component Libraries:**
- Radix UI (20+ primitive components for accessibility)
- shadcn/ui component collection
- Lucide React for icons
- Embla Carousel for image carousels

**Styling:**
- Tailwind CSS v3 with custom configuration
- PostCSS with autoprefixer
- class-variance-authority for component variants
- clsx and tailwind-merge for className utilities

**Animation:**
- Framer Motion for page transitions and micro-interactions
- CSS transitions via Tailwind

### Development Tools

**Build & Dev:**
- Vite with React plugin
- esbuild for production builds
- tsx for TypeScript execution
- @replit/vite-plugin-* for Replit-specific features

**Type Safety:**
- TypeScript with strict mode
- Drizzle-Zod for schema-to-Zod conversion
- Shared types between client and server

### Payment & Delivery

**Current Implementation:**
- Cash on Delivery (COD)
- Manual payment info collection (EasyPaisa/JazzCash)
- PKR currency throughout

**Not Integrated:**
- Stripe or other payment gateways (intentionally excluded)
- Real-time payment processing

### Image Assets

- Generated product images stored in `attached_assets/generated_images/`
- Image references in product catalog
- Support for product photography with soft backgrounds