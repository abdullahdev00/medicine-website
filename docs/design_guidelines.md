# MediSwift Pakistan - Design Guidelines

## Design Approach
**Selected Approach:** Reference-Based (Healthcare E-commerce)
Drawing inspiration from modern health/pharmacy apps like 1mg, PharmEasy, and Netmeds, combined with the clean aesthetic of the MediSwift mobile app. This approach prioritizes trust, clarity, and ease of navigation for medical product purchases.

## Core Design Principles
- **Trust & Clarity:** Clean, professional interface that instills confidence in medical product purchases
- **Spacious & Breathable:** Generous padding and whitespace for comfortable browsing
- **Soft & Approachable:** Rounded corners and gentle shadows create a friendly, non-clinical feel
- **Teal-Blue Identity:** Consistent use of calming healthcare colors throughout

---

## Color Palette

### Primary Colors
- **Primary Teal:** 183 100% 33% (`#009CA6`) - Main brand color for buttons, headers, active states
- **Light Teal Background:** 183 65% 95% (`#E6F7F9`) - Soft backgrounds, cards, sections
- **Pure White:** 0 0% 100% (`#FFFFFF`) - Card backgrounds, primary surfaces
- **Dark Text:** 0 0% 12% (`#1E1E1E`) - Body text, headings

### Supporting Colors
- **Success Green:** 142 71% 45% - Order confirmations, success states
- **Warning Orange:** 38 92% 50% - Promotions, discount badges
- **Error Red:** 0 84% 60% - Validation errors, out of stock
- **Gray Scale:** 0 0% 96% (backgrounds), 0 0% 60% (secondary text), 0 0% 80% (borders)

---

## Typography

### Font Families
- **Primary:** Inter (body text, UI elements)
- **Secondary:** Poppins (headings, emphasis)

### Type Scale
- **Hero/H1:** text-4xl md:text-5xl font-bold (Poppins)
- **Section Headers/H2:** text-3xl md:text-4xl font-semibold (Poppins)
- **Card Titles/H3:** text-xl font-semibold (Inter)
- **Body Text:** text-base leading-relaxed (Inter)
- **Small Text:** text-sm (Inter)
- **Price:** text-2xl font-bold (Poppins)

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16, 20** for consistent rhythm
- **Component Padding:** p-4 to p-8
- **Section Spacing:** py-12 to py-20
- **Card Gaps:** gap-4 to gap-6
- **Button Padding:** px-6 py-3 to px-8 py-4

### Container Widths
- **Full-width sections:** w-full with max-w-7xl mx-auto px-4
- **Content areas:** max-w-6xl
- **Product grids:** grid-cols-2 md:grid-cols-3 lg:grid-cols-4

---

## Component Library

### Cards
- **Medicine Cards:** bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4
- **Category Cards:** rounded-xl border-2 border-gray-100 p-6 hover:border-teal-500
- **Order Cards:** bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-500

### Buttons
- **Primary CTA:** bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl px-8 py-3 font-semibold hover:from-teal-600 hover:to-teal-700
- **Secondary:** bg-white text-teal-600 border-2 border-teal-500 rounded-xl px-6 py-3 hover:bg-teal-50
- **Icon Buttons:** w-10 h-10 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200

### Forms
- **Input Fields:** rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-100
- **Search Bar:** Large rounded-full with icon, shadow-md, prominent on home page
- **Selectors:** Quantity controls with rounded borders, +/- buttons in teal

### Navigation
- **Bottom Nav:** Fixed bottom-0, bg-white shadow-lg, 4 icons (Home, Favorites, Cart, Profile) with teal active state
- **Top Header:** Sticky with logo, search, and cart icon

### Product Display
- **Product Images:** Clean white/light gray backgrounds, rounded-xl, aspect-square
- **Price Tags:** Large bold text in dark gray with PKR prefix
- **Rating Stars:** Gold stars (text-yellow-400) with count in gray
- **Package Options:** Pill-shaped toggles, border-2, selected state in teal

### Promotional Elements
- **Banner:** rounded-2xl bg-gradient-to-r from-teal-400 to-teal-600 text-white p-8 with discount badge
- **Discount Badge:** absolute top-2 right-2 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full

---

## Page-Specific Layouts

### Welcome/Splash Page
- Full-height centered layout (min-h-screen flex items-center justify-center)
- Large logo at top
- Hero illustration/3D medicine basket centered
- Slogan in text-2xl beneath
- Single prominent "Get Started" button
- Soft teal gradient background

### Home Page
- Search bar: Prominent at top, rounded-full with shadow
- Banner: Full-width rounded-2xl card with gradient, "Up to 25% OFF"
- Categories: Horizontal scroll with icon cards, gap-4
- Best Selling: Horizontal scroll product cards with "View All" link
- Bottom navigation fixed

### Category/Product Grid
- Grid: 2 columns mobile, 3-4 desktop
- Filter/Sort: Sticky top bar with dropdown pills
- Product cards: Image top, content below, add to cart button at bottom

### Product Detail
- Large image carousel at top
- Title and tagline below
- Rating and price section
- Package size toggle buttons
- Expandable description ("Read More" link)
- Quantity selector (centered, large +/- buttons)
- Full-width "Add to Cart" button at bottom
- Floating wishlist heart icon

### Cart
- Item cards: Horizontal layout with image left, details right, qty controls, remove icon
- Sticky summary at bottom with subtotal, delivery, total
- Full-width checkout button

### Checkout
- Multi-step or single page with sections
- Address section auto-filled, editable
- Payment method: Radio buttons with icons (COD, EasyPaisa, JazzCash)
- Order summary card on right (desktop) or top (mobile)
- Prominent "Confirm Order" button

### Order Success
- Centered layout with success animation (checkmark pulse)
- Large order ID display
- Expected delivery in highlighted card
- "View Orders" and "Continue Shopping" buttons

### Profile
- Avatar/initials at top
- Tabbed sections: Info, Orders, Addresses
- Editable fields with save button
- Order history cards with status badges
- Logout button at bottom in red

---

## Images & Illustrations

### Product Images
Clean pharmaceutical product photos on white/light gray backgrounds, consistently sized, high resolution

### Hero/Marketing Images
- Welcome page: 3D illustration of medicine basket/healthcare items
- Category icons: Simple, flat, teal-colored medical symbols
- Empty states: Friendly illustrations for empty cart/wishlist

### Placement
- **Welcome:** Full-screen hero illustration
- **Home banner:** Background pattern or health-themed graphic
- **Categories:** Icon-based, no photos
- **Products:** Clean product shots, white backgrounds

---

## Animation & Interactions

### Transitions
- Card hover: shadow-md → shadow-xl (300ms ease)
- Button hover: Subtle scale (scale-105) or color shift
- Page transitions: Smooth fade (200ms)
- Add to cart: Brief scale pulse on icon

### Micro-interactions
- Quantity buttons: Number change with subtle slide animation
- Wishlist heart: Fill animation on click
- Success checkmark: Scale-in with bounce
- Bottom nav icons: Active state with teal fill and small upward shift

**Note:** Keep animations minimal and purposeful - prioritize performance and accessibility over decorative effects

---

## Responsive Behavior

- **Mobile-first approach:** Design for 375px and scale up
- **Breakpoints:** sm:640px, md:768px, lg:1024px, xl:1280px
- **Product grid:** 2 cols → 3 cols (md) → 4 cols (lg)
- **Navigation:** Bottom nav on mobile, consider top nav on desktop
- **Typography:** Scale up 1-2 sizes on desktop
- **Padding:** Increase from p-4 (mobile) to p-8 (desktop)