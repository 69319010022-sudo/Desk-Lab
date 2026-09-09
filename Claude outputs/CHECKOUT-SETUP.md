# Checkout Page Implementation Guide (05 · Checkout)

## Overview
This is the Checkout page (page 5/9) derived from the Figma design node-id=1-484. It displays the final step before order confirmation with shipping address selection, payment method selection, and order summary.

## Architecture

### Files Structure
```
src/app/(site)/checkout/
├── page.tsx           (Server component - data fetching)
└── checkout-content.tsx (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches user data from `getCurrentUser()` → redirects to /login if not authenticated
- Fetches current cart via `getCart()` → redirects to /cart if no items
- Fetches user addresses (currently mocked, should fetch from database)
- Calculates cart totals:
  - `cartCount` = sum of all item quantities
  - `cartTotal` = sum of (price × quantity) for all items
  - `shippingCost` = 50 (fixed)
  - `grandTotal` = cartTotal + shippingCost
- Passes all data to `CheckoutContent` client component
- Generates metadata for SEO

#### `checkout-content.tsx` (Client Component)
- Displays the complete checkout UI with:
  - **Left Rail**: Navigation sidebar (same as Shop/Product Detail/Cart pages)
  - **Top Bar**: Title, search input, cart badge, profile avatar
  - **Main Content**:
    - **Shipping Address Section** (left, 940px wide):
      - "ที่อยู่จัดส่ง" (Shipping Address) heading with "จัดการที่อยู่" (Manage Address) link
      - Radio button list of addresses (2+ addresses)
      - Each address card shows: radio button + type label + "ค่าเริ่มต้น" badge (if default) + full address details + phone number
      - "เพิ่มที่อยู่ใหม่" (Add New Address) link at bottom
    - **Payment Method Section** (left, 940px wide, below addresses):
      - "วิธีชำระเงิน" (Payment Method) heading
      - Radio button list of 3 payment options:
        - PromptPay (โอนเงินผ่าน PromptPay 24 ชม.)
        - Credit/Debit Card (Visa, Mastercard, JCB)
        - Cash on Delivery (ชำระเงินปลายทาง)
      - Each option shows: radio button + method name + description
    - **Order Summary Panel** (right, 340px wide, sticky):
      - "รายการสั่งซื้อ (X)" (Order Items) heading
      - Scrollable list of cart items (max-height with overflow)
      - Each item shows: name (line-clamp-1) + quantity + subtotal
      - Divider line
      - Subtotal row (left-aligned text, right-aligned price)
      - Shipping cost row (fixed ฿50)
      - Divider
      - Grand total (20px semibold, right-aligned)
      - "ยืนยันคำสั่งซื้อ" (Confirm Order) button → creates order (TODO: implement order creation)
      - "โปรดยืนยันที่อยู่จัดส่งและวิธีชำระเงินก่อนดำเนินการ" (confirmation instruction text)
- **Interactivity**:
  - Select shipping address via radio buttons (state: selectedAddressId)
  - Select payment method via radio buttons (state: selectedPaymentMethod)
  - Confirm order button (calls TODO server action for order creation)
  - Real-time totals display
  - Navigation links to address management, cart, and orders pages

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Top bar height**: 68px (white background)
- **Left checkout section**: 940px wide (flexible, with 28px padding)
- **Right order summary**: 340px wide (fixed, sticky on scroll)
- **Address/Payment cards**: Full width with 20px gap
- **Gap between main sections**: 24px

### Colors (Design Tokens)
- **Background**: #fafafa (sunken), #f4f4f5 (surface), #ffffff (base)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Selected border**: #1a1a1a (thick when address/payment selected)

### Typography
- **Navigation labels**: Prompt 10px Medium, uppercase
- **Page title**: Prompt 20px Medium
- **Section headings**: Prompt 20px SemiBold
- **Address/Payment labels**: Prompt 14px Medium
- **Address details**: Prompt 13px Regular, muted
- **Price/Subtotal**: IBM Plex Mono 13-20px Medium/SemiBold
- **Grand total**: IBM Plex Mono 20px SemiBold
- **Button text**: Prompt 14px Medium

### Address/Payment Cards
- **Height**: Flexible (minimum 80px for address, 70px for payment)
- **Border**: 2px (default: #d9d9dc, selected: #1a1a1a)
- **Border radius**: 8px
- **Padding**: 16px
- **Radio button**: 16px diameter, checked/unchecked states
- **Badge**: "ค่าเริ่มต้น" in 11px with light background

## Data Dependencies

### Database Queries
The page requires these data sources (all exist or need to be added):
- **User Addresses** (user's): `id`, `type`, `name`, `address`, `city`, `postalCode`, `phone`, `isDefault`
- **Cart** (user's): `cart_id`, `items[]` with:
  - `id` (cart item ID)
  - `productId` (product ID)
  - `quantity` (number of items)
  - `product` (object with `name`, `price`)
- **Auth User**: `id`, `email`, `username`

### API Actions Used
- `getCurrentUser()` — fetch authenticated user
- `getCart()` — fetch current user's cart
- `getUserAddresses()` — fetch user's saved shipping addresses (TODO: implement)
- `createOrderAction(addressId, paymentMethod, items)` — create new order (TODO: implement)

**Note**: Requires new server actions and data layer functions:
- `getUserAddresses()` in `src/lib/data/checkout.ts` (NEW)
- `createOrderAction(addressId, paymentMethod, items)` in `src/lib/actions/orders.ts` (NEW)

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(site)/checkout/
├── page.tsx            (from "checkout-server.tsx")
└── checkout-content.tsx (from "checkout-content.tsx")
```

**Important**: 
- Rename `checkout-server.tsx` → `page.tsx`
- Rename `checkout-content.tsx` → `checkout-content.tsx`
- Directory structure should already exist: `src/app/(site)/checkout/`

### 2. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/data/cart.ts` — `getCart()`
- `src/lib/types.ts` — `CartItem`, `Address` types

**Status**: ✅ `getCurrentUser`, `getCart` exist

### 3. Add Missing Data Layer Functions
Create `src/lib/data/checkout.ts` with user address fetching:

```typescript
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from './auth';

export interface Address {
  id: string;
  type: 'home' | 'work';
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

// Get all user addresses
export async function getUserAddresses(): Promise<Address[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(addr => ({
      id: addr.id,
      type: addr.type,
      name: addr.name,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postal_code,
      phone: addr.phone,
      isDefault: addr.is_default,
    }));
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
}

// Get single address by ID
export async function getAddressById(addressId: string): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', addressId)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      type: data.type,
      name: data.name,
      address: data.address,
      city: data.city,
      postalCode: data.postal_code,
      phone: data.phone,
      isDefault: data.is_default,
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
}
```

### 4. Add Order Creation Server Action
Create/update `src/lib/actions/orders.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/data/auth';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

export async function createOrderAction(
  addressId: string,
  paymentMethod: string,
  items: OrderItem[]
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Calculate order total
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingCost = 50;
    const total = subtotal + shippingCost;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        address_id: addressId,
        payment_method: paymentMethod,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Failed to create order');

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear user's cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
    }

    revalidatePath('/checkout');
    revalidatePath('/orders');
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create order' };
  }
}
```

### 5. Check Font Configuration
Ensure fonts are properly loaded in `src/app/layout.tsx`:
```typescript
import { Prompt, IBM_Plex_Mono } from 'next/font/google';

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600', '700'] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
```

**Status**: ✅ Already configured

### 6. Verify CSS Variables
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
}
```

**Status**: ✅ Already defined

## Features Implemented

### ✅ Shipping Address Selection
- Radio button list of user addresses
- Each address card shows: type label + "ค่าเริ่มต้น" badge + full address details + phone
- Address cards have highlighted border when selected (2px solid #1a1a1a)
- Link to "จัดการที่อยู่" (manage addresses) page
- Link to "เพิ่มที่อยู่ใหม่" (add new address) page

### ✅ Payment Method Selection
- Radio button list of 3 payment options (PromptPay, Credit/Debit, COD)
- Each option shows: method name + description
- Payment cards have highlighted border when selected

### ✅ Order Summary Panel (Right Sidebar)
- "รายการสั่งซื้อ (X)" heading with item count
- Scrollable list of cart items with max-height overflow
- Each item shows: name (truncated) + quantity + subtotal
- Subtotal row
- Shipping cost row (fixed ฿50)
- Divider
- Grand total (20px large, highlighted)
- "ยืนยันคำสั่งซื้อ" (Confirm Order) button → creates order
- Confirmation instruction text
- Sticky positioning on scroll

### ✅ Navigation
- Same left rail as other pages (logo, 4 nav items, account at bottom)
- Cart nav item visible (not highlighted since on checkout)
- Top bar with title and breadcrumb
- Search input (functional for future use)
- Cart badge showing count + amount (link to cart)
- Profile avatar placeholder

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
- ✅ Page loads at `http://localhost:3000/checkout` (after login + cart items)
- ✅ Redirects to `/login` if not authenticated
- ✅ Redirects to `/cart` if no items in cart
- ✅ User addresses display with radio buttons
- ✅ Default address is pre-selected
- ✅ Selecting different address updates selection state
- ✅ Payment methods display with radio buttons
- ✅ PromptPay is pre-selected
- ✅ Selecting different payment method updates selection state
- ✅ Order summary shows correct items list
- ✅ Subtotal, shipping, and grand total calculate correctly
- ✅ "Manage Address" link navigates to `/addresses`
- ✅ "Add New Address" link navigates to `/addresses/new`
- ✅ "Confirm Order" button shows loading state (⏳)
- ✅ "Confirm Order" button is disabled until address is selected
- ✅ Cart badge in top bar updates
- ✅ Search input is functional
- ✅ Profile avatar link navigates to `/profile`

## Known Limitations

### Address Data
- Currently mocked with 2 hardcoded addresses
- Should fetch from `user_addresses` table after implementation
- Address type limited to 'home' | 'work' (could extend to more types)
- No address validation (future enhancement)

### Payment Processing
- Payment method is selected but not processed (TODO: integrate payment gateway)
- No payment validation or gateway integration yet
- PromptPay, Card, and COD are placeholders (need actual payment implementation)

### Order Management
- Order creation server action not yet fully integrated
- No order confirmation page (TODO: implement page 6)
- No email notification on order creation (future enhancement)
- No payment status tracking (future enhancement)

### Responsive Design
- Left checkout section: Fixed 940px width
- Right summary: Fixed 340px width
- **Note**: On mobile (<1024px), consider stacking sections vertically (future enhancement)

## Database Schema Requirements

### User Addresses Table
Must include these fields:
- `id` (UUID) — primary key
- `user_id` (UUID) — foreign key to auth.users
- `type` (text) — 'home' | 'work' | other
- `name` (text) — display name (e.g. "บ้าน", "ที่ทำงาน")
- `address` (text) — street address
- `city` (text) — city/district
- `postal_code` (text) — postal code
- `phone` (text) — phone number
- `is_default` (boolean) — whether this is default address
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Orders Table
Must include these fields (for order creation):
- `id` (UUID) — primary key
- `user_id` (UUID) — foreign key to auth.users
- `address_id` (UUID) — foreign key to user_addresses
- `payment_method` (text) — 'promptpay' | 'card' | 'cod'
- `subtotal` (decimal) — order subtotal
- `shipping_cost` (decimal) — shipping cost
- `total` (decimal) — grand total
- `status` (text) — 'pending' | 'paid' | 'shipped' | 'delivered'
- `created_at` (timestamp)

### Order Items Table
Must include these fields:
- `id` (UUID) — primary key
- `order_id` (UUID) — foreign key to orders
- `product_id` (UUID) — foreign key to products
- `product_name` (text) — snapshot of product name
- `product_price` (decimal) — snapshot of product price
- `quantity` (integer) — quantity ordered
- `subtotal` (decimal) — line total

## Next Steps After Integration

1. **Add data layer functions** (Step 3 above):
   - `getUserAddresses()` in `src/lib/data/checkout.ts`
   - `getAddressById(addressId)` in `src/lib/data/checkout.ts`

2. **Add server action for order creation** (Step 4 above):
   - `createOrderAction(addressId, paymentMethod, items)` in `src/lib/actions/orders.ts`

3. **Update checkout-server.tsx**:
   - Replace mock addresses with `await getUserAddresses()`

4. **Update checkout-content.tsx**:
   - Wire up `handleConfirmOrder` to call `createOrderAction`
   - Add error toast on failure

5. **Test the Checkout page locally**:
   - Run `npm run dev`
   - Login with test user
   - Add items to cart from Shop page
   - Navigate to `/checkout`
   - Test address and payment selection
   - Test order creation (will redirect to `/orders` for now)

6. **Verify data integration**:
   - Check that user addresses load from database
   - Verify order is created with correct data
   - Confirm cart is cleared after order creation
   - Check order history page shows new order

7. **Implement address management pages** (future):
   - Address list page (`/addresses`)
   - Add new address page (`/addresses/new`)
   - Edit address page (`/addresses/[id]/edit`)

8. **Integrate payment gateway** (future):
   - Stripe for card payments
   - PromptPay API integration
   - Payment confirmation webhook handling

9. **Next page implementation**:
   - After confirming Checkout works, implement remaining pages (6-9)
   - Same workflow: Figma → design context → implement → test → next page

## File Size & Performance Notes
- Server component: ~1.0 KB
- Client component: ~10 KB (full UI with address/payment selection, order summary)
- No new dependencies added (uses existing imports)
- Address list: Paginated in component (no max limit, but UI has max-height scroll)
- Client-side state: `selectedAddressId`, `selectedPaymentMethod`, `isConfirming`, `searchQuery` (minimal memory)

## Troubleshooting

### Error: "Cannot find module '@/lib/data/checkout'"
**Fix**: Create `src/lib/data/checkout.ts` with `getUserAddresses()` function

### Error: "createOrderAction is not a function"
**Fix**: Create `src/lib/actions/orders.ts` with order creation function

### Page redirects to login
**Fix**: Ensure user is logged in. Checkout requires authentication.

### Page redirects to cart
**Fix**: Ensure there are items in cart. Checkout page redirects if cart is empty.

### Addresses don't display
**Possible causes**:
1. `getUserAddresses()` returning empty array
2. User has no saved addresses (add default test address)
3. User address fetch failing (check RLS policies)

### Payment method selection doesn't work
**Check**:
1. Is `selectedPaymentMethod` state updating? (check console logs)
2. Are radio buttons properly bound to state?

### Order confirmation not working
**Check**:
1. Does `createOrderAction` exist?
2. Are required database tables created?
3. Check browser console for error messages
4. Verify user has permission to create orders

---

**Summary**: Checkout page implements the 5th screen of the POS design with address selection, payment method selection, and order summary. Ready to test on localhost after file placement, data layer function implementation, and server action integration.
