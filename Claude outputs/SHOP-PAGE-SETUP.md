# Shop Page Implementation Guide (02 · Shop - POS)

## Overview
This is the Shop page (page 2/9) derived from the Figma design node-id=1-240. It displays a product catalog with category filtering, search, and a cart summary panel.

## Architecture

### Files Structure
```
src/app/(site)/shop/
├── page.tsx                    (Server component - data fetching)
└── shop-content.tsx            (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches user data from `getCurrentUser()` → redirects to /login if not authenticated
- Fetches categories from Supabase via `getCategories()`
- Fetches products from Supabase via `getProducts()`
- Fetches current cart via `getCart()`
- Calculates cart totals (count, sum)
- Passes all data to `ShopPageContent` client component

#### `shop-content.tsx` (Client Component)
- Displays the complete UI with:
  - **Left Rail**: Navigation sidebar with brand logo + nav items (Home, Shop, Cart, Orders, Account)
  - **Top Bar**: Title, search input, cart badge, profile avatar
  - **Main Content**: 
    - Category filter chips (All + categories from DB)
    - Toolbar (product count, sort indicator)
    - Product grid (3 columns, responsive)
    - Each product card shows: image, category label, name, price, add-to-cart button
  - **Right Sidebar**: 
    - Current cart items (thumbnail, name, qty, subtotal)
    - Order summary (subtotal, shipping ฿50, total, checkout button)
- **Interactivity**:
  - Filter by category (click chip)
  - Search by product name/SKU (real-time)
  - Add to cart (calls `addToCartAction`, refreshes cart)
  - Navigate to product detail/cart/orders/account

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Top bar height**: 68px (white background)
- **Right sidebar width**: 340px
- **Main content**: Flexible (remaining space)
- **Padding**: 28px (main content area)
- **Grid**: 3 columns, 20px gap

### Colors (Design Tokens)
- **Background**: #fafafa (sunken), #f4f4f5 (surface), #ffffff (base)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Primary action**: #1a1a1a (dark background buttons)

### Typography
- **Navigation labels**: Prompt 10px Medium, uppercase
- **Section titles**: Prompt 14-20px Medium
- **Body text**: Prompt 12-14px Regular
- **Prices**: IBM Plex Mono 13-28px Medium/Semibold
- **Chip labels**: Prompt 13px Medium

### Product Card
- **Dimensions**: Auto-width, flexible grid columns
- **Image area**: 176px tall, 8px rounded, background #f4f4f5
- **Category label**: 11px uppercase, gray
- **Product name**: 14px, line-clamp-2
- **Price + Button**: 20px price + 36px add-to-cart button

## Data Dependencies

### Database Queries
The page requires these data sources (all exist in current Supabase schema):
- **Categories** (5-8 items): `id`, `name`, `description`
- **Products** (10 items): `id`, `slug`, `name`, `sku`, `price`, `stock_quantity`, `category_id`, `images` (array)
- **Cart** (user's): `cart_id`, `items[]` with product details
- **Auth User**: `id`, `email`, `username`

### API Actions Used
- `getCurrentUser()` — fetch authenticated user
- `getCategories()` — fetch all categories
- `getProducts()` — fetch all active products (with category names)
- `getCart()` — fetch current user's cart
- `addToCartAction(productId, quantity)` — add item to cart (server action)

**Note**: All existing data layer functions are already in the codebase. No new API calls needed.

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(site)/shop/
├── page.tsx                    (from "shop-page-server.tsx")
└── shop-content.tsx            (from "shop-page-implementation.tsx")
```

**Important**: 
- Rename `shop-page-server.tsx` → `page.tsx`
- Rename `shop-page-implementation.tsx` → `shop-content.tsx`
- Both files go in the same `src/app/(site)/shop/` folder

### 2. Verify Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/data/catalog.ts` — `getCategories()`, `getProducts()`
- `src/lib/data/cart.ts` — `getCart()`
- `src/lib/actions/cart.ts` — `addToCartAction()`
- `src/lib/types.ts` — `Category`, `Product`, `CartItem` types

**Status**: ✅ All files already exist in the codebase (verified from previous work)

### 3. Check Font Configuration
Ensure fonts are properly loaded in `src/app/layout.tsx`:
```typescript
import { Prompt, IBM_Plex_Mono } from 'next/font/google';

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
```

**Status**: ✅ Already configured (verified from previous session)

### 4. Verify CSS Variables
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

**Status**: ✅ Already defined (verified)

## Features Implemented

### ✅ Product Grid
- 3-column layout (auto-responsive with grid columns)
- Each card shows: image, category, name, price, add-to-cart button
- Card hover effect (shadow increase)
- Product images from `product.images[0]` with fallback placeholder

### ✅ Category Filtering
- "ทั้งหมด" (All) chip always visible
- Dynamic chips for each category from DB
- Active chip highlighted with dark background (#1a1a1a)
- Inactive chips with border
- Click to filter products in real-time

### ✅ Search
- Real-time search by product name or SKU
- Case-insensitive matching
- Searches in both `product.name` and `product.sku`
- Combines with category filter (AND logic)

### ✅ Add to Cart
- Button at bottom-right of each card (+)
- Shows loading state (⏳) while adding
- Calls `addToCartAction(productId, 1)` → refreshes page
- Disabled state during submission

### ✅ Cart Summary (Right Sidebar)
- Shows all items in current cart
- Item: thumbnail (gray box) + name + qty + unit price + subtotal
- Cart count at top ("N ชิ้น")
- "Empty cart" message if no items
- **When cart has items**:
  - Subtotal + Shipping (฿50) = Total
  - Large total display (28px)
  - "ดำเนินการชำระเงิน" (Checkout) button → links to `/checkout`

### ✅ Navigation
- Left rail with icon-label pairs (8 nav items)
- Home → /
- Shop (current, highlighted) → /shop
- Cart → /cart
- Orders → /orders
- Account → /account
- Profile circle at bottom → /account
- DL brand logo (white) at top → /shop

### ✅ Top Bar
- Left: Title ("เลือกสินค้า") + subtitle ("DeskLab · หน้าร้าน")
- Center: Search box (icon + input)
- Right: Cart badge (count + amount) + profile avatar

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
- ✅ Page loads at `http://localhost:3000/shop` (after login)
- ✅ All categories display from DB
- ✅ All 10 products appear in grid
- ✅ Filtering by category works
- ✅ Search by name/SKU works
- ✅ Add to cart updates sidebar
- ✅ Cart summary shows correct totals

## Known Limitations

### Product Images
- Uses `product.images[0]` (first image from array)
- Falls back to 📷 emoji if no image available
- Images are stored in `/public/products/*.svg` (from seed data)
- Images load via `<img>` tag (not Next.js Image component, to match project pattern)

### Search Performance
- Current implementation filters client-side (OK for ~10 products)
- If product count grows to 100+, consider server-side search/API endpoint

### Responsive Design
- Left rail: Fixed 76px (always visible)
- Right sidebar: Fixed 340px (always visible)
- Main content: Flexible
- **Note**: On mobile (<1024px), consider hiding right sidebar or making responsive (future enhancement)

### UI Elements
- Navigation items use emoji icons (⌂, ⊞, 🛒, 📋, 👤) for simplicity
- Product images are SVG illustrations (not photos)
- Avatar shows "PP" placeholder (from `getCurrentUser().username[0]`)

## Next Steps After Integration

1. **Test the Shop page locally**:
   - Run `npm run dev`
   - Login with test user
   - Navigate to /shop
   - Test filtering, search, add to cart

2. **Verify cart integration**:
   - Check that cart items appear in sidebar
   - Click "ดำเนินการชำระเงิน" → should navigate to /checkout
   - Add multiple products → cart count should increase

3. **Check responsive behavior**:
   - Resize browser window (though cart design assumes ~1440px width)
   - Test on different screen sizes (if needed)

4. **Review visual design**:
   - Compare with Figma screenshot
   - Check colors match design tokens
   - Verify typography (Prompt + IBM Plex Mono fonts)
   - Ensure product grid spacing looks right

5. **Next page implementation**:
   - After confirming Shop works, move to page 3 (Product Detail)
   - Same workflow: Figma → `get_design_context` → implement → test → next page

## File Size & Performance Notes
- Component sizes: ~6-7 KB each (uncompressed)
- No new dependencies added (uses existing imports)
- Renders ~13 DOM nodes per product card
- Grid CSS is native (no custom JS for layout)
- Client-side state: `selectedCategory`, `searchQuery`, `isAddingToCart` (minimal memory)

## Troubleshooting

### Error: "Cannot find module '@/lib/data/catalog'"
**Fix**: Verify `src/lib/data/catalog.ts` exists and exports `getCategories`, `getProducts`

### Error: "getCart is not a function"
**Fix**: Verify `src/lib/data/cart.ts` exists and exports `getCart`

### Error: "Cannot find module '@/lib/actions/cart'"
**Fix**: Verify `src/lib/actions/cart.ts` exists and exports `addToCartAction`

### Page shows no products
**Possible causes**:
1. No products in Supabase (check DB)
2. All products have `is_active=false` (update DB)
3. Cart fetch failing (check auth/RLS policies)

### Add to cart button doesn't work
**Check**:
1. Are you logged in? (redirects to /login if not)
2. Does `addToCartAction` exist and work? (test with curl)
3. Any console errors? (check browser DevTools)

### Styles don't match Figma
**Check**:
1. Are CSS variables defined in `globals.css`? (--text-ink, --bg-base, etc.)
2. Are fonts loaded? (Prompt + IBM Plex Mono via next/font/google)
3. Is Tailwind CSS properly configured? (tailwind.config.ts)

---

**Summary**: Shop page implements the 2nd screen of the POS design with real data integration, category filtering, search, and cart functionality. Ready to test on localhost after file placement and dependency verification.
