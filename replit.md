# MediSwift Pakistan - Healthcare E-commerce Platform

## Overview

MediSwift Pakistan is a modern healthcare e-commerce platform built with Next.js 15, designed for selling medicines and health products across Pakistan. The application provides a complete marketplace experience with user authentication, product management, order processing, affiliate/partner programs, and comprehensive admin controls.

## Recent Changes

### October 24, 2025 - Replit Migration
- **Migrated from Vercel to Replit** - Complete platform migration with environment configuration
- **Fixed Database Connection** - Updated postgres client configuration for Supabase compatibility (added `prepare: false`, removed incompatible `connection.options`)
- **Fixed Products Query** - Implemented raw SQL with column aliasing to handle snake_case/camelCase conversion due to Drizzle ORM compatibility issue
- **Configured Workflows** - Set up development server workflow on port 5000 with proper host binding (0.0.0.0)
- **Deployment Settings** - Configured autoscale deployment with build and start commands

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Runtime**
- **Next.js 15 App Router** - Server-side rendering with React Server Components
- **React 19** - Latest React features with automatic batching
- **TypeScript** - Type-safe development throughout

**UI & Styling**
- **Tailwind CSS** - Utility-first styling with custom design system
- **Shadcn/ui Components** - Accessible, customizable UI components (New York style)
- **Framer Motion** - Smooth animations and transitions
- **Progressive Web App (PWA)** - Installable app experience with offline support

**State Management**
- **React Query (TanStack Query)** - Server state management with caching
- **React Context** - Auth state and global user data
- **localStorage** - Session persistence and offline data

**Route Organization**
- `(marketing)/*` - Public pages (home, products)
- `(protected)/*` - Authenticated user pages (profile, cart, orders, wishlist)
- `(admin)/*` - Admin dashboard and management
- `(auth)/*` - Authentication flows (login, signup, verification)

### Backend Architecture

**Database Layer**
- **PostgreSQL** - Primary relational database (Supabase-hosted)
- **Drizzle ORM** - Type-safe database queries and migrations
- **Schema Location** - `shared/schema.ts` (shared between client/server)
- **Connection Config** - Uses `prepare: false` for Supabase compatibility (required for connection pooling)

**API Routes**
- **Next.js API Routes** - RESTful endpoints under `/api/*`
- **Server Actions** - Direct server-side mutations for forms
- **Middleware** - CORS, rate limiting, caching headers, auth verification

**Caching Strategy**
- **In-Memory Cache** - Server-side caching for products/categories (5-10 min TTL)
- **IndexedDB** - Client-side image caching for performance
- **React Query** - Automatic request deduplication and stale-while-revalidate

**Authentication & Authorization**
- **Supabase Auth** - Email/password authentication with OTP verification
- **Cookie-based Sessions** - HTTP-only cookies for admin authentication
- **localStorage** - User session persistence
- **Role-based Access** - User, Admin, Partner, Buyer roles

### Data Storage Solutions

**Primary Database (PostgreSQL)**

Core Tables:
- `users` - Customer accounts with wallet, referrals, partner status
- `admins` - Admin accounts with roles and permissions
- `products` - Product catalog with variants and pricing
- `categories` - Product categorization
- `orders` - Order history with status tracking
- `wishlist_items` - User wishlists
- `addresses` - Delivery addresses
- `wallet_transactions` - Financial transaction history
- `partners` - Affiliate partner management
- `payment_accounts` - Available payment methods
- `user_payment_accounts` - User's saved payment methods
- `payment_requests` - Withdrawal requests
- `vouchers` - Discount codes
- `activity_logs` - Admin action auditing

**File Storage**
- **Supabase Storage** - Product images in `product-images` bucket
- **Public Access** - Direct URLs for image delivery
- **Auto-cleanup** - Orphaned images removed on product deletion

**Client-side Storage**
- **localStorage** - User session, auth tokens, preferences
- **IndexedDB** - Cached product images (50MB limit, 7-day expiry)
- **Service Worker** - Offline asset caching for PWA

### Authentication Flow

**User Registration**
1. Email validation (Gmail/Outlook only)
2. Supabase signup with OTP
3. Email verification code entry
4. Multi-step profile completion (contact info → address)
5. Auto-login and redirect to dashboard

**User Login**
1. Credentials validated against Supabase
2. User data synced to local database
3. Session stored in localStorage + auth context
4. Protected routes accessible

**Admin Authentication**
1. Separate admin login flow
2. Direct database credential check
3. Session via HTTP-only cookies (`admin-id`, `admin-email`)
4. Admin routes protected by middleware

### Payment & Wallet System

**Payment Methods**
- JazzCash (mobile wallet)
- EasyPaisa (mobile wallet)
- Raast (instant payment)
- Bank Transfer
- Cash on Delivery (COD)

**Wallet Features**
- Real-time balance tracking
- Transaction history
- Commission earnings (affiliate/partner)
- Withdrawal requests with admin approval

**Affiliate/Partner Program**
- Unique referral codes per user
- 10-15% commission on referred orders
- Multi-level tracking (referrer → referee → orders)
- Partner applications with approval workflow

### Performance Optimizations

**Image Optimization**
- Next.js Image component with WebP/AVIF
- IndexedDB caching with compression
- Lazy loading and progressive enhancement
- Device-specific sizing (640px to 1200px)

**Code Splitting**
- Dynamic imports for heavy components
- Route-based code splitting (automatic in Next.js)
- Package optimization for lucide-react, recharts

**Caching**
- Server-side: 5-minute TTL for products/categories
- Client-side: React Query with 5-min stale time
- CDN headers: `s-maxage=300, stale-while-revalidate=600`

**Build Performance**
- 4 CPU cores for compilation
- Webpack memory optimizations
- CSS optimization in production
- Tree-shaking for unused code

## External Dependencies

### Core Services

**Supabase** (Primary Backend)
- **Authentication** - Email/password with OTP verification
- **Database** - PostgreSQL hosting with connection pooling
- **Storage** - Product image hosting (public bucket)
- **Environment Variables Required:**
  - `DATABASE_URL` - PostgreSQL connection string
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key

### Third-party Libraries

**UI & Styling**
- `@radix-ui/*` - Accessible UI primitives (20+ packages)
- `tailwindcss` - Utility-first CSS framework
- `framer-motion` - Animation library
- `lucide-react` - Icon library

**Data Fetching & State**
- `@tanstack/react-query` - Server state management
- `drizzle-orm` - Database ORM
- `drizzle-kit` - Schema migrations

**Authentication**
- `@supabase/supabase-js` - Supabase client SDK
- `bcrypt` - Password hashing (admin auth)

**Forms & Validation**
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation

**PWA**
- `@ducanh2912/next-pwa` - Progressive Web App support
- `workbox-*` - Service worker libraries

**Developer Tools**
- `@next/bundle-analyzer` - Bundle size analysis
- `tsx` - TypeScript execution for scripts

### API Endpoints Structure

**Public APIs** (No authentication)
- `GET /api/products` - Product catalog
- `GET /api/products/:id` - Product details
- `GET /api/categories` - Category list

**User APIs** (Requires user authentication)
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/cart` - User's cart
- `POST /api/cart` - Add to cart
- `GET /api/wishlist` - User's wishlist
- `POST /api/wishlist` - Add to wishlist
- `GET /api/orders` - Order history
- `POST /api/orders` - Create order
- `GET /api/wallet/:userId` - Wallet balance
- `GET /api/addresses` - Saved addresses

**Admin APIs** (Requires admin authentication)
- `GET /api/admin/users` - User management
- `GET /api/admin/products` - Product management
- `GET /api/admin/orders` - Order management
- `GET /api/admin/partners` - Partner management
- `GET /api/admin/payments` - Payment requests
- `POST /api/admin/login` - Admin login
- `GET /api/admin/check` - Session verification

### Environment Configuration

**Required Variables**
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Optional Variables**
- `NODE_ENV` - Development/production mode
- Port runs on **5000** by default

### Database Setup Scripts

**Available Commands**
- `pnpm db:push` - Push schema to database
- `pnpm db:generate` - Generate migration files
- `pnpm db:seed` - Populate with demo data
- `pnpm db:studio` - Open Drizzle Studio GUI

**Demo Credentials** (after seeding)
- Admin: `admin@example.com` / `admin123`
- User: `test@example.com` / `test123`