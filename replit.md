# MediSwift Pakistan - Healthcare E-commerce Platform

## Overview

MediSwift Pakistan is a modern healthcare e-commerce platform designed for selling medicines and health products in Pakistan. The application provides a trusted, user-friendly interface for browsing medical products, managing shopping carts, wishlists, and completing orders with multiple payment options. The platform emphasizes clean design, accessibility, and a seamless mobile-first experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 19, 2025)

### Complete Migration to Next.js 15 (October 19, 2025)
- **Migration Complete**: Successfully migrated from Vite/React/Wouter to Next.js 15 App Router
- **Zero Errors**: Application compiling successfully with no errors or bugs
- **Architecture Upgrade**:
  - Migrated all public pages (home, products, cart, checkout, welcome, become-buyer, not-found)
  - Migrated all protected pages (profile, wallet, affiliate, become-partner, wishlist, order-success)
  - Migrated all admin pages (dashboard, login, users, products, orders, payments, partners)
  - Consolidated all components from client/src/components to root components/
  - Removed old Vite/Express server files (routes.ts, vite.ts, middleware/)
  - Kept storage.ts and seed.ts for database operations
- **Route Groups**: Organized pages using Next.js route groups (marketing), (protected), (admin)
- **SEO Optimization**: Added metadata and viewport configuration to all pages
- **PWA**: Maintained PWA functionality with @ducanh2912/next-pwa

### Previous Changes (October 18, 2025)

#### Help System & Guidelines
- **Guideline Bottom Sheets with Filter-Style Header**:
  - Updated both Affiliate and Payment help buttons with professional headers
  - Header includes: "Guideline" title, language dropdown (left), close button (right)
  - Consistent with filter bottom sheet design
  - Language dropdown uses icon (🌐) with menu for English/Roman Urdu selection
  - Sticky header for easy access while scrolling
  
- **YouTube Video Tutorial Integration**:
  - Added YouTube video player to all guideline bottom sheets
  - Affiliate guidelines include video tutorial with brand-colored card
  - Payment guidelines include video tutorial with emerald-colored card
  - Embedded player with fullscreen support

- **PWA Install Prompt System**:
  - Comprehensive PWA install prompt component
  - Bilingual support (English/Roman Urdu) with language toggle
  - Smart timing: Shows after 5 seconds of user interaction
  - Beautiful animated bottom card with backdrop blur
  - Highlights 3 key benefits with icons
  - User choice memory in localStorage
  - Native browser install dialog integration

### Previous Changes (October 16, 2025)

#### Profile Section Enhancements
- **New Features Added to Profile**:
  1. **My Wallet Page** (`/wallet`) - View balance, add money, and track transactions
  2. **Affiliate Program Page** (`/affiliate`) - 6-digit referral code, earnings tracking
  3. **Become a Partner Page** (`/become-partner`) - Wholesale application with status tracking
  4. **My Favorites Button** - Quick access to saved/wishlist items
- **Profile Page Design**: 7 total sections displayed as individual gradient cards with circular icons

#### Filter System Redesign - Bottom Sheet
- **Removed Sidebar**: Replaced filter sidebar with modern bottom sheet design
- **Circular Category Buttons**: Categories displayed as rounded pill buttons for multi-selection
- **Enhanced Design**: Bottom sheet slides up from bottom, gradient buttons, price range slider

#### PWA (Progressive Web App) Implementation
- **App Installability**: MediSwift is a fully-functional PWA installable on mobile/desktop
- **Offline Support**: Service worker with network-first caching strategy
- **App Icons**: Generated and configured app icons (192x192 and 512x512)
- **Manifest Configuration**: PWA manifest with brand colors (#009CA6)

#### Products Page Header Redesign
- **Clean Header Layout**: Removed unnecessary filters and counts
- **Circular Button Components**: Reusable CircularButton component
- **Brand-Colored Favorites**: FavoriteButton uses primary brand color

#### Design System Updates
- **Global Scrollbar Hiding**: All scrollbars hidden for cleaner interface
- **Rounded Design System**: Increased border radius to 1rem throughout
- **Category Cards Redesign**: Smaller cards with horizontal scrolling

## System Architecture

### Framework
- **Next.js 15**: App Router with Server Components and Client Components
- **TypeScript**: Full type safety across the stack
- **React 18**: Latest React features with Server Components support

### Frontend Architecture

**Routing & Pages:**
- Next.js App Router with file-based routing
- Route groups for organization: (marketing), (protected), (admin)
- Layouts for shared UI (RootLayout, AdminLayout)
- Metadata API for SEO optimization

**UI Component System:**
- Radix UI primitives for accessible component foundations
- shadcn/ui components built on Radix UI
- Tailwind CSS for utility-first styling
- Framer Motion for animations and transitions
- Custom design system with teal-blue primary colors (#009CA6)

**State Management:**
- React hooks for local component state
- TanStack Query v5 for server state, caching, and data synchronization
- React Hook Form with Zod for form validation

### Backend Architecture

**API Routes:**
- Next.js API Routes in app/api/
- RESTful API design pattern
- Storage abstraction layer (server/storage.ts) implementing IStorage interface

**API Structure:**
- Categories (`/api/categories`)
- Products (`/api/products`, `/api/products/:id`)
- Cart management (`/api/cart`)
- Wishlist operations (`/api/wishlist`)
- Order processing (`/api/orders`)
- Admin routes (`/api/admin/*`)

### Database Architecture

**ORM & Schema:**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database (via Neon serverless)
- Schema definitions in `shared/schema.ts`

**Database Tables:**
- `users` - User profiles with authentication and address information
- `categories` - Product categories with icons and descriptions
- `products` - Medicine/health product catalog with pricing, ratings, stock status
- `cart_items` - Shopping cart with quantity and package selection
- `wishlist_items` - User wishlists
- `orders` - Order history with status tracking
- `admin_users` - Admin authentication and roles
- `partner_applications` - Wholesale partner requests

### Authentication & Authorization

**Current Implementation:**
- Mock user system using hardcoded MOCK_USER_ID for development
- Admin authentication with session management
- User schema includes fields for email/password authentication

**Designed For:**
- Email/password authentication
- Google OAuth integration
- Email verification workflow
- Session management

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
- Next.js 15 with App Router
- TypeScript with strict mode
- Drizzle-Zod for schema-to-Zod conversion

### PWA

**Progressive Web App:**
- @ducanh2912/next-pwa for service worker generation
- Manifest.json with brand colors and icons
- Offline support with caching strategies
- Installable on mobile and desktop

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

## Running the Project

The workflow "Start application" runs `npm run dev` which starts the Next.js development server on port 5000.

All pages are accessible via the Next.js App Router:
- Public pages: /, /products, /cart, /checkout, etc.
- Protected pages: /profile, /wallet, /affiliate, etc.
- Admin pages: /admin, /admin/users, /admin/products, etc.

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   ├── (protected)/              # User-only pages
│   ├── (admin)/                  # Admin pages
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── admin/                    # Admin components
├── lib/                          # Utilities
├── server/                       # Backend logic
│   ├── storage.ts                # Database operations
│   └── seed.ts                   # Database seeding
├── shared/                       # Shared types/schemas
│   └── schema.ts                 # Drizzle schemas
├── public/                       # Static files
└── next.config.js                # Next.js configuration
```
