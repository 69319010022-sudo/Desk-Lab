# Cart Page Implementation Guide (04 · Cart)

## Overview
This is the Cart page (page 4/9) derived from the Figma design node-id=1-443. It displays the user's shopping cart with item management, quantity controls, and order summary with checkout functionality.

## Architecture

### Files Structure
```
src/app/(site)/cart/
├── page.tsx          (Server component - data fetching)
└── cart-content.tsx  (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches user data from `getCurrentUser()` → redirects to /login if not authenticated
- Fetches current cart via `getCart()`
- Calculates cart totals:
  - `cartCount` = sum of all item quantities
  - `cartTotal` = sum of (price × quantity) for all items
  - `shippingCost` = 50 (fixed)
  - `grandTotal` = cartTotal + shippingCost
- Passes all data to `CartContent` client component
- Generates metadata for SEO

#### `cart-content.tsx` (Client Component)
- Displays the complete cart UI with:
  - **Left Rail**: Navigation sidebar (same as Shop/Product Detail pages)
  - **Top Bar**: Title, search input, cart badge, profile avatar
  - **Main Content**:
    - **Empty State**: Message and link to shop if no items
    - **Cart Items Section** (left, 940px wide):
      - "ตะกร้าสินค้า" (Shopping Cart) heading (24px semibold)
      - Item count summary ("รวมสินค้า X ชิ้น จาก Y รายการ")
      - "ล้างตะกร้า" (Clear Cart) button
      - Divider line
      - Cart item rows (repeating):
        - Product image (64×64px, light gray background)
        - Product name (16px medium)
        - SKU (13px muted)
        - Quantity stepper (−/input/+ with min=1 bounds)
        - Unit price (13px muted, right-aligned)
        - Subtotal (20px semibold, right-aligned)
        - Delete button (ลบ)
      - "← เลือกซื้อสินค้าต่อ" (Continue Shopping) link to /shop
    - **Order Summary Panel** (right, 340px wide, white bordered card):
      - "สรุปคำสั่งซื้อ" (Order Summary) heading
      - Subtotal row
      - Shipping cost row (฿50)
      - Divider
      - Grand total (28px large)
      - "ดำเนินการชำระเงิน" (Checkout) button → /checkout
      - "จัดส่งด่วน 1–3 วันทำการ ทั่วประเทศ" (Shipping info)
- **Interactivity**:
  - Update quantity for each item (calls `updateCartItemQuantityAction`)
  - Delete individual items (calls `removeFromCartAction`)
  - Clear entire cart with confirmation (calls `clearCartAction`)
  - Real-time calculation of totals as items are modified
  - Link to shop to continue shopping
  - Link to checkout page

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Top bar height**: 68px (white background)
- **Left cart section**: 940px wide (flexible, with 28px padding)
- **Right order summary**: 340px wide (fixed)
- **Cart item rows**: 96px tall (64px image + 16px padding)
- **Gap between sections**: 24px

### Colors (Design Tokens)
- **Background**: #fafafa (sunken), #f4f4f5 (surface), #ffffff (base)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)

### Typography
- **Navigation labels**: Prompt 10px Medium, uppercase
- **Cart heading**: Prompt 24px SemiBold, tracking -0.2px
- **Item name**: Prompt 16px Medium
- **SKU**: Prompt 13px Medium, muted
- **Price/Subtotal**: IBM Plex Mono 13-20px Medium/SemiBold
- **Order summary total**: IBM Plex Mono 28px SemiBold, tracking -0.4px
- **Button text**: Prompt 14px Medium

### Product Card / Cart Row
- **Image**: 64×64px, light gray background #fafafa, rounded 10px
- **Name**: 16px medium, line-clamp-1 (truncate)
- **SKU**: 13px muted gray
- **Quantity stepper**: 36px height, bordered box, −/input/+ buttons
- **Unit price**: 13px muted, right-aligned
- **Subtotal**: 20px semibold, right-aligned

## Data Dependencies

### Database Queries
The page requires these data sources (all exist in current Supabase schema):
- **Cart** (user's): `cart_id`, `items[]` with:
  - `id` (cart item ID)
  - `productId` (product ID)
  - `quantity` (number of items)
  - `product` (object with `name`, `price`, `images` array)
- **Auth User**: `id`, `email`, `username`

### API Actions Used
- `getCurrentUser()` — fetch authenticated user
- `getCart()` — fetch current user's cart
- `updateCartItemQuantityAction(itemId, quantity)` — update item quantity
- `removeFromCartAction(itemId)` — delete item from cart
- `clearCartAction()` — delete all items from cart

**Note**: Requires three new server actions (if not already implemented):
- `updateCartItemQuantityAction` in `src/lib/actions/cart.ts`
- `removeFromCartAction` in `src/lib/actions/cart.ts`
- `clearCartAction` in `src/lib/actions/cart.ts`

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(site)/cart/
├── page.tsx          (from "cart-server.tsx")
└── cart-content.tsx  (from "cart-content.tsx")
```

**Important**: 
- Rename `cart-server.tsx` → `page.tsx`
- Rename `cart-content.tsx` → `cart-content.tsx`
- Directory structure should already exist: `src/app/(site)/cart/`

### 2. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/data/cart.ts` — `getCart()`
- `src/lib/actions/cart.ts` — `addToCartAction()` (already exists)
- `src/lib/types.ts` — `CartItem` type

**Status**: ✅ `getCurrentUser`, `getCart`, `addToCartAction` exist

### 3. Add Missing Server Actions
Update `src/lib/actions/cart.ts` to add three new functions:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/data/auth';

// Update quantity of an item in cart
export async function updateCartItemQuantityAction(itemId: string, quantity: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('cart_id', (await supabase.from('carts').select('id').eq('user_id', user.id).single()).data?.id);

    if (error) throw error;

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update quantity' };
  }
}

// Remove an item from cart
export async function removeFromCartAction(itemId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove item' };
  }
}

// Clear entire cart
export async function clearCartAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cart) {
      return { success: false, error: 'Cart not found' };
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) throw error;

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to clear cart' };
  }
}
```

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
  --border-subtle: #ebebed;
  --border-default: #d9d9dc;
}
```

**Status**: ✅ Already defined

## Features Implemented

### ✅ Cart Items Display
- List of all items currently in cart
- Product image (64×64px placeholder, light gray background)
- Product name (16px medium)
- SKU label (13px muted)
- Quantity stepper (−/input/+ with min=1 validation)
- Unit price (13px muted, right-aligned)
- Item subtotal (20px semibold, right-aligned)
- Delete button per item (ลบ)
- Divider lines between items

### ✅ Cart Management
- **Update Quantity**: Increment/decrement buttons with disabled state during update
- **Remove Item**: Individual delete button per item with confirmation
- **Clear Cart**: Full cart clear with JavaScript confirmation
- **Item Count**: Shows total quantity and number of products
- Real-time total calculation as items are modified
- Loading states (⏳) on buttons during server actions

### ✅ Empty State
- Message when cart is empty ("ตะกร้าว่าง")
- Helper text ("เลือกสินค้าจากร้านเพื่อเพิ่มเข้าตะกร้า")
- Link to shop to browse products

### ✅ Order Summary Panel (Right Sidebar)
- "สรุปคำสั่งซื้อ" (Order Summary) heading
- Subtotal line (sum of all items × quantity)
- Shipping cost line (fixed ฿50)
- Divider
- Grand total (28px large, highlighted)
- "ดำเนินการชำระเงิน" (Checkout) button → /checkout
- "จัดส่งด่วน 1–3 วันทำการ ทั่วประเทศ" (Shipping info text)

### ✅ Navigation
- Same left rail as other pages (logo, 4 nav items, account at bottom)
- Cart nav item highlighted (active state)
- Top bar with title and breadcrumb
- Search input (functional for future use)
- Cart badge showing count + amount
- Profile avatar placeholder
- "← เลือกซื้อสินค้าต่อ" (Continue Shopping) button/link to /shop

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
- ✅ Page loads at `http://localhost:3000/cart` (after login)
- ✅ Cart items display with images, names, SKUs, quantities
- ✅ Quantity stepper works (increment/decrement)
- ✅ Unit price and subtotal calculate correctly
- ✅ Delete item removes from cart
- ✅ Clear cart empties entire cart (with confirmation)
- ✅ Order summary totals update in real-time
- ✅ Subtotal + shipping = grand total is correct
- ✅ Checkout button links to `/checkout`
- ✅ Continue shopping button links to `/shop`
- ✅ Empty state shows when no items
- ✅ Cart badge in top bar updates after changes
- ✅ Loading states show during server actions

## Known Limitations

### Cart Items
- Uses `product.images[0]` (first image from array)
- Falls back to 📷 emoji if no images available
- Product name uses line-clamp-1 (truncates long names)

### Quantity Management
- Minimum quantity: 1 (user can't set to 0)
- No maximum quantity limit (can order any amount)
- Quantity updates happen on each change (no batch updates)

### Server Actions
- Updates are immediate and optimistic (UI updates before server confirmation)
- Failed updates may not be properly reflected (should add error handling toast)
- No duplicate-prevention for rapid clicks (user could create race conditions)

### Responsive Design
- Left cart section: Fixed 940px width
- Right summary: Fixed 340px width
- **Note**: On mobile (<1024px), consider stacking sections vertically (future enhancement)

## Database Schema Requirements

### Cart & Cart Items Tables
Must include these fields (assumed to already exist):
- **carts** table:
  - `id` (UUID) — primary key
  - `user_id` (UUID) — foreign key to auth.users
  - `created_at` (timestamp)

- **cart_items** table:
  - `id` (UUID) — primary key
  - `cart_id` (UUID) — foreign key to carts
  - `product_id` (UUID) — foreign key to products
  - `quantity` (integer) — number of items

- **products** table (already exists):
  - `id`, `name`, `price`, `images` (used for cart item display)

## Next Steps After Integration

1. **Add missing server actions** (Step 3 above):
   - `updateCartItemQuantityAction(itemId, quantity)`
   - `removeFromCartAction(itemId)`
   - `clearCartAction()`

2. **Test the Cart page locally**:
   - Run `npm run dev`
   - Login with test user
   - Add items from Shop page
   - Navigate to `/cart`
   - Test quantity controls, item deletion
   - Verify order summary totals
   - Test continue shopping and checkout flows

3. **Verify data integration**:
   - Check that cart items load from database
   - Verify quantity updates persist
   - Confirm item deletion removes from cart
   - Test clear cart action
   - Verify totals recalculate after changes

4. **Test error scenarios**:
   - Try to update without authentication (should redirect)
   - Rapid quantity clicks (should handle gracefully)
   - Large quantity values
   - Delete while item is updating

5. **Next page implementation**:
   - After confirming Cart works, move to page 5 (Checkout)
   - Same workflow: Figma → `get_design_context` → implement → test → next page

## File Size & Performance Notes
- Server component: ~1.2 KB
- Client component: ~11 KB (full UI with quantity controls, totals)
- No new dependencies added (uses existing imports)
- Cart state updates: Client-side optimistic updates + server revalidation
- Client-side state: `cartItems`, `isUpdating`, `isClearing`, `searchQuery` (minimal memory)

## Troubleshooting

### Error: "Cannot find module '@/lib/actions/cart'"
**Fix**: Verify `src/lib/actions/cart.ts` exists and exports the actions

### Error: "updateCartItemQuantityAction is not a function"
**Fix**: Add the three new functions to `src/lib/actions/cart.ts` (see Step 3)

### Page redirects to login
**Fix**: Ensure user is logged in. Cart requires authentication.

### Cart items don't display
**Possible causes**:
1. Cart fetch failing (check `getCart()` function)
2. User ID mismatch (check RLS policies on cart_items)
3. Product data missing (check products table)

### Quantity updates don't work
**Check**:
1. Does `updateCartItemQuantityAction` exist?
2. Are cart_items table permissions correct?
3. Check browser console for errors
4. Verify server action return values

### Order summary totals incorrect
**Check**:
1. Are all items being fetched? (check cart.items length)
2. Are prices correct in products table?
3. Are quantities being read correctly?

### Delete doesn't work
**Check**:
1. Does `removeFromCartAction` exist?
2. Does user have permission to delete their own cart items?
3. Are cart_items IDs correct?

---

**Summary**: Cart page implements the 4th screen of the POS design with full cart management, real-time totals calculation, and checkout integration. Ready to test on localhost after file placement, server action implementation, and dependency verification.
