# Product Detail Page Implementation Guide (03 · Product - Details)

## Overview
This is the Product Detail page (page 3/9) derived from the Figma design node-id=1-370. It displays comprehensive product information including image gallery, specifications, pricing, quantity selector, and related products.

## Architecture

### Files Structure
```
src/app/(site)/product/[slug]/
├── page.tsx                    (Server component - data fetching)
└── product-detail-content.tsx  (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches user data from `getCurrentUser()` → redirects to /login if not authenticated
- Fetches product by slug via `getProductBySlug(slug)`
- Fetches related products (4 items) via `getRelatedProducts(slug, 4)`
- Fetches current cart via `getCart()`
- Generates metadata for SEO (product name + description)
- Passes all data to `ProductDetailContent` client component

#### `product-detail-content.tsx` (Client Component)
- Displays the complete product detail UI with:
  - **Left Rail**: Navigation sidebar (same as Shop page)
  - **Top Bar**: Title, search input, cart badge, profile avatar
  - **Main Content**:
    - **Image Gallery Section** (left, 470px wide):
      - Main image display (470×470px, light gray background)
      - 4 thumbnail previews below (96×96px each)
      - Click thumbnail to switch main image
    - **Buy Panel** (right, 420px wide, white bordered card):
      - Category label
      - Product name (32px semibold)
      - SKU + stock badge (green if in stock, red if out)
      - Large price display (28px)
      - Quantity selector (minus/input/plus in bordered box)
      - "Add to Cart" button (full-width, dark)
      - "Buy Now" button (full-width, bordered)
      - Specifications (4 key-value pairs)
    - **Product Details Tabs** (below gallery):
      - "รายละเอียดสินค้า" (Description) - tab with product description text
      - "รีวิวจากลูกค้า (12)" (Reviews) - placeholder
      - "การจัดส่ง" (Shipping) - delivery info
    - **Related Products Carousel** (4 product cards in row)
- **Interactivity**:
  - Select main image from thumbnails
  - Quantity increment/decrement with min/max bounds
  - Add to cart (calls `addToCartAction`, refreshes page)
  - Buy Now (adds to cart then navigates to /checkout)
  - Tab navigation between product details sections
  - Navigate to related products on click

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Top bar height**: 68px (white background)
- **Main content area**: Flexible with 28px padding
- **Image gallery**: 470px wide, 470px tall
- **Buy panel**: 420px wide, positioned beside gallery
- **Thumbnails**: 4 × 96px squares with 12px gap
- **Tab section**: Full width below gallery
- **Related products grid**: 4 columns, 20px gap

### Colors (Design Tokens)
- **Background**: #fafafa (sunken), #f4f4f5 (surface), #ffffff (base)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Stock badges**: #e6f4e6 (bg) + #2d7a2d (text) for in-stock, #f4e6e6 + #7a2d2d for out-of-stock

### Typography
- **Navigation labels**: Prompt 10px Medium, uppercase
- **Page title**: Prompt 20px Medium
- **Product name**: Prompt 32px Semibold
- **Price**: IBM Plex Mono 28px Semibold
- **Body text**: Prompt 14px Regular
- **Specs labels**: Prompt 13px Regular
- **Tab labels**: Prompt 14px Medium
- **Category labels**: Prompt 11px Medium, uppercase

### Product Card (Related Products)
- **Same as Shop page**: 176px image, category label, name (line-clamp-2), price
- **4-column layout** in related products section

## Data Dependencies

### Database Queries
The page requires these data sources (all exist in current Supabase schema):
- **Product** (by slug): `id`, `slug`, `name`, `sku`, `price`, `stock_quantity`, `category_id`, `category_name`, `images` (array), `description`
- **Related Products** (4 items, same category): Same fields as Product
- **Cart** (user's): `cart_id`, `items[]` with product details
- **Auth User**: `id`, `email`, `username`

### API Actions Used
- `getCurrentUser()` — fetch authenticated user
- `getProductBySlug(slug)` — fetch single product by URL slug
- `getRelatedProducts(slug, limit)` — fetch related products from same category
- `getCart()` — fetch current user's cart
- `addToCartAction(productId, quantity)` — add item to cart (server action)

**Note**: Requires new data layer functions:
- `getProductBySlug(slug)` in `src/lib/data/catalog.ts`
- `getRelatedProducts(slug, limit)` in `src/lib/data/catalog.ts`

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(site)/product/[slug]/
├── page.tsx                    (from "product-detail-server.tsx")
└── product-detail-content.tsx  (from "product-detail-content.tsx")
```

**Important**: 
- Rename `product-detail-server.tsx` → `page.tsx`
- Rename `product-detail-content.tsx` → `product-detail-content.tsx`
- Create directory structure if it doesn't exist: `src/app/(site)/product/[slug]/`

### 2. Add Missing Data Layer Functions
Update `src/lib/data/catalog.ts` to add two new functions:

```typescript
// Get single product by slug
export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      name,
      sku,
      price,
      stock_quantity,
      category_id,
      description,
      images,
      categories(id, name)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    category_name: data.categories?.name || 'สินค้า',
  };
}

// Get related products from same category (excluding current product)
export async function getRelatedProducts(slug: string, limit: number = 4) {
  // First, get current product's category
  const currentProduct = await getProductBySlug(slug);
  
  // Then fetch related products from same category
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      name,
      price,
      images,
      category_id,
      categories(name)
    `)
    .eq('category_id', currentProduct.category_id)
    .neq('slug', slug)
    .eq('is_active', true)
    .limit(limit);

  if (error) throw error;
  
  return data.map(product => ({
    ...product,
    category_name: product.categories?.name || 'สินค้า',
  }));
}
```

### 3. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/data/catalog.ts` — `getCategories()`, `getProducts()`, `getProductBySlug()`, `getRelatedProducts()`
- `src/lib/data/cart.ts` — `getCart()`
- `src/lib/actions/cart.ts` — `addToCartAction()`
- `src/lib/types.ts` — `Category`, `Product`, `CartItem` types

**Status**: ✅ `getCurrentUser`, `getCategories`, `getProducts`, `getCart`, `addToCartAction` exist
**Status**: ❌ `getProductBySlug`, `getRelatedProducts` need to be added (see Step 2)

### 4. Check Font Configuration
Ensure fonts are properly loaded in `src/app/layout.tsx`:
```typescript
import { Prompt, IBM_Plex_Mono } from 'next/font/google';

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
```

**Status**: ✅ Already configured

### 5. Verify CSS Variables
Make sure `globals.css` has design tokens:
```css
:root {
  --text-ink: #1a1a1a;
  --text-muted: #6b6b70;
  --text-faint: #9a9aa0;
  --bg-base: #ffffff;
  --bg-surface: #f4f4f5;
  --bg-sunken: #fafafa;
  --bg-inverse: #1a1a1a;
  --border-subtle: #ebebed;
  --border-default: #d9d9dc;
  --action-primary: #1f1f1f;
}
```

**Status**: ✅ Already defined

## Features Implemented

### ✅ Image Gallery
- 470×470px main image display with light gray background
- Click-to-select thumbnail system (4 images max)
- Fallback emoji (📷) if image unavailable
- Product images from `product.images[0-3]` array

### ✅ Buy Panel (Right Sidebar)
- Category label (11px uppercase)
- Product name (32px semibold)
- SKU display with stock badge (color-coded: green in-stock, red out-of-stock)
- Large price display (28px IBM Plex Mono)
- Stock indicator with quantity available
- Quantity selector (−/input/+ with min=1, max=stock_quantity)
- Add to Cart button (full-width, dark, loading state)
- Buy Now button (full-width, bordered, direct to checkout)
- Specifications section (4 key-value pairs: switch type, connection, layout, shipping time)

### ✅ Product Details Tabs
- Three tabs: "รายละเอียดสินค้า" (Description), "รีวิวจากลูกค้า (12)" (Reviews), "การจัดส่ง" (Shipping)
- Description tab shows product description text
- Reviews tab placeholder (no reviews yet)
- Shipping tab shows delivery info, cost, packaging details
- Active tab highlighted with dark underline

### ✅ Related Products
- 4-product carousel in grid layout (4 columns)
- Same card design as Shop page (image, category, name, price)
- Clickable to navigate to related product detail pages
- Filters by same category, excludes current product

### ✅ Navigation & Header
- Same left rail as Shop page (logo, 4 nav items, account at bottom)
- Top bar with title "รายละเอียดสินค้า" + breadcrumb category
- Search input (functional for future use)
- Cart badge showing count + total amount
- Profile avatar placeholder

### ✅ Stock Management
- Shows stock quantity when in stock (green badge)
- Shows "หมดสินค้า" (Out of stock) when unavailable
- Quantity selector disabled when out of stock
- Buttons disabled when out of stock

### ✅ Add to Cart / Buy Now
- Add to Cart button shows loading state (⏳) while processing
- Buy Now button adds to cart then navigates to /checkout
- Both buttons disabled during submission and when out of stock

## Testing Checklist

Run these commands on your Windows machine:
```powershell
# Build
npm run build

# Lint
npm run lint

# Check for specific errors
npm run build 2>&1 | findstr "error"
npm run lint 2>&1 | findstr "error"
```

**Expected Results**:
- ✅ Build passes with no new errors
- ✅ Lint passes with no new errors
- ✅ Page loads at `http://localhost:3000/product/[product-slug]` (after login)
- ✅ Main image displays from product.images[0]
- ✅ Thumbnails load and switching works
- ✅ Product details (name, price, SKU, stock) display correctly
- ✅ Stock badge shows correct color and quantity
- ✅ Quantity selector min/max bounds work
- ✅ Add to cart updates cart badge and sidebar
- ✅ Buy Now adds to cart and navigates to checkout
- ✅ Tabs switch between description/reviews/shipping
- ✅ Related products display in 4-column grid
- ✅ Related product links navigate to correct pages
- ✅ Responsive layout adapts to window resize

## Known Limitations

### Product Images
- Uses `product.images[0-3]` (first 4 images from array)
- Falls back to 📷 emoji if no images available
- Images are stored in `/public/products/*.svg` (from seed data)
- Images load via `<img>` tag (not Next.js Image component, to match project pattern)

### Related Products
- Fetches from same category only
- Limited to 4 items
- Does not include reviews/ratings (hardcoded placeholder)

### Responsive Design
- Left rail: Fixed 76px (always visible)
- Top bar: Fixed 68px (always visible)
- Buy panel: Fixed 420px width
- Main image: Fixed 470px width
- **Note**: On mobile (<1024px), consider hiding/stacking buy panel and image gallery (future enhancement)

### Stock Badge Colors
- Currently hardcoded color classes for in-stock/out-of-stock
- Could be moved to CSS variables for consistency

## Database Schema Requirements

### Products Table
Must include these fields (assumed to already exist):
- `id` (UUID) — primary key
- `slug` (string) — URL-friendly product identifier
- `name` (string) — product name
- `sku` (string) — product SKU code
- `price` (decimal) — product price in baht
- `stock_quantity` (integer) — number in stock
- `category_id` (UUID) — foreign key to categories
- `description` (text) — product description
- `images` (JSON array) — array of image URLs
- `is_active` (boolean) — whether product is listed

### Categories Table
Must include:
- `id` (UUID) — primary key
- `name` (string) — category name

### Cart & Auth
Same as Shop page (no new schema needed)

## Next Steps After Integration

1. **Add missing data layer functions** (Step 2 above):
   - `getProductBySlug(slug)` in `src/lib/data/catalog.ts`
   - `getRelatedProducts(slug, limit)` in `src/lib/data/catalog.ts`

2. **Test the Product Detail page locally**:
   - Run `npm run dev`
   - Login with test user
   - Navigate to a product from Shop page
   - Test image switching, quantity selector, add to cart
   - Verify tabs work and related products display
   - Test Buy Now flow

3. **Verify data integration**:
   - Check that product data loads from database
   - Verify related products show correct category match
   - Confirm stock badge reflects actual inventory
   - Test quantity bounds (min=1, max=stock_quantity)

4. **Check responsive behavior**:
   - Resize browser window
   - Test on different screen sizes
   - Consider mobile layout for future implementation

5. **Next page implementation**:
   - After confirming Product Detail works, move to page 4 (Cart)
   - Same workflow: Figma → `get_design_context` → implement → test → next page

## File Size & Performance Notes
- Server component: ~1.5 KB
- Client component: ~13 KB (including full UI with tabs, gallery, specs)
- No new dependencies added (uses existing imports)
- Related products query adds minimal DB load (limited to 4 items)
- Client-side state: `selectedImageIndex`, `quantity`, `isAddingToCart`, `activeTab`, `searchQuery` (minimal memory)

## Troubleshooting

### Error: "Cannot find module '@/lib/data/catalog'"
**Fix**: Verify `src/lib/data/catalog.ts` exists and exports `getProductBySlug`, `getRelatedProducts`

### Error: "getProductBySlug is not a function"
**Fix**: Add the function to `src/lib/data/catalog.ts` (see Step 2)

### Page shows no product
**Possible causes**:
1. Product slug doesn't match database (check URL)
2. Product has `is_active=false` (update DB)
3. Product fetching failing (check auth/RLS policies)

### Add to cart button doesn't work
**Check**:
1. Are you logged in? (redirects to /login if not)
2. Does `addToCartAction` exist and work? (test with curl)
3. Any console errors? (check browser DevTools)

### Related products don't show
**Check**:
1. Does `getRelatedProducts` function exist?
2. Does the database have other products in same category?
3. Check console for query errors

### Images not loading
**Check**:
1. Are image URLs valid in product.images array?
2. Do images exist in `/public/products/`?
3. Check browser Network tab for 404 errors

### Stock badge color not showing
**Check**:
1. Are Tailwind color classes being generated? (check tailwind.config.ts)
2. Are bg-[#e6f4e6] and text-[#2d7a2d] in Tailwind config?
3. Try using standard Tailwind colors (green-100, green-700) instead of hex

---

**Summary**: Product Detail page implements the 3rd screen of the POS design with real data integration, image gallery, quantity selection, and related products carousel. Ready to test on localhost after file placement, data layer function addition, and dependency verification.
