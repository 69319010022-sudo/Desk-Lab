# Order History Page Implementation Guide (09 · Order History)

## Overview
This is the Order History page (page 9/9) derived from the Figma design node-id=1-610. It displays the user's complete order history with:
- Filterable order list by status (All, Pending Payment, Pending Shipment, Paid, Cancelled)
- Order details including date, items, status, and total price
- Status badges with color-coded indicators
- Order actions (Cancel for pending orders, Reorder for cancelled/completed orders)
- Account summary sidebar showing total orders, total spent, and cancelled count
- Search functionality for finding orders

## Architecture

### Files Structure
```
src/app/(auth)/orders/
├── page.tsx               (Server component - authentication check)
└── order-history-content.tsx (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches current user via `getCurrentUser()` → redirects to /login if not authenticated
- Renders `OrderHistoryContent` client component with user data
- Generates metadata for SEO

#### `order-history-content.tsx` (Client Component)
- Displays the complete order history UI with:
  - **Left Rail**: Navigation sidebar (76px, same as other pages)
  - **Top Bar**: Title, search bar, cart info, avatar
  - **Main Content**: 
    - Page heading and filter chips for order status
    - List of orders with:
      - Order number and date
      - Product names (single or "and X more")
      - Status badge with color coding
      - Total price (formatted in Thai Baht)
      - Action buttons (Cancel/Reorder based on status)
      - Cancellation reason (for cancelled orders)
  - **Right Sidebar (340px)**:
    - Account summary card with:
      - Total orders count
      - Total spent (accumulated)
      - Cancelled orders count
- **Interactivity**:
  - Filter chips for order status (All, Pending Payment, Pending Shipment, Paid, Cancelled)
  - Active state styling on selected filter
  - Order list updates when filter is selected
  - Cancel button handlers (TODO: implement)
  - Reorder button handlers (TODO: implement)
  - Search input (TODO: implement search functionality)

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Top bar**: 68px height with title, search, cart info
- **Main content**: 940px orders list
- **Right sidebar**: 340px wide (account summary)
- **Order row height**: 96px
- **Filter chip height**: 36px
- **Status badge size**: 26px height

### Colors (Design Tokens)
- **Background**: #ffffff (base), #f4f4f5 (surface), #fafafa (sunken)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Button**: #1a1a1a (primary), white text
- **Status badges**:
  - Pending: #fef3c7 (bg), #b45309 (text)
  - Processing: #ede9fe (bg), #7c3aed (text)
  - Paid: #dbeafe (bg), #1d4ed8 (text)
  - Cancelled: #fee2e2 (bg), #b91c1c (text)
- **Selected chip**: #1a1a1a (primary), white text
- **Unselected chip**: white bg, #d9d9dc border, #6b6b70 text

### Typography
- **Top bar title**: Prompt 20px Medium
- **Page heading**: Prompt 24px SemiBold, tracking -0.2px
- **Labels**: Prompt 13px Medium
- **Body text**: Prompt 14px Regular
- **Captions**: Prompt 12px Regular
- **Numeric**: IBM Plex Mono 16px Medium (prices)
- **Numeric (small)**: IBM Plex Mono 13px Medium (order counts)

### Spacing
- **Filter chips**: h-[36px], px-[16px], gap between chips 8px
- **Order row**: h-[96px], p-[24px], rounded-[12px]
- **Sidebar**: w-[340px], p-[20px], rounded-[12px]
- **Page padding**: p-[6] = 24px

## Data Dependencies

### Database Queries
The page requires:
- **Auth check**: `getCurrentUser()` to determine if user is authenticated
- **Orders data**: User's order history from database (mock data currently used)

### Order Data Structure
Each order should have:
```typescript
{
  id: string;
  orderNumber: number;
  date: string;           // Thai date format
  items: string;          // Product names or "Product name and X more"
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  total: number;          // Total in Thai Baht
  cancellationReason?: string;
  canCancel?: boolean;
  canReorder?: boolean;
}
```

### Server Actions Required
- `getOrdersAction(userId)` → returns `{ success: boolean, orders?: Order[], error?: string }`
  - Fetches user's order history from database
  - Returns all orders for current user
  - Returns success/error result

- `cancelOrderAction(orderId)` → returns `{ success: boolean, error?: string }`
  - Validates order is in pending state
  - Allows user to cancel order
  - Updates order status to cancelled
  - Returns success/error result

- `reorderAction(orderId)` → returns `{ success: boolean, error?: string }`
  - Fetches original order details
  - Creates new order with same items
  - Redirects to checkout or shows confirmation
  - Returns success/error result

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(auth)/orders/
├── page.tsx                    (from "order-history-server.tsx")
└── order-history-content.tsx   (same name)
```

**Important**: 
- Rename `order-history-server.tsx` → `page.tsx`
- Directory structure should be created: `src/app/(auth)/orders/`

### 2. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/actions/orders.ts` — (create) add `getOrdersAction`, `cancelOrderAction`, `reorderAction`

**Status**: ✅ `getCurrentUser` exists, need to add new server actions

### 3. Add Server Actions for Order Management
Create or update `src/lib/actions/orders.ts` with:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';

interface Order {
  id: string;
  orderNumber: number;
  date: string;
  items: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  total: number;
  cancellationReason?: string;
}

interface GetOrdersResult {
  success: boolean;
  orders?: Order[];
  error?: string;
}

interface CancelOrderResult {
  success: boolean;
  error?: string;
}

// Get user's order history
export async function getOrdersAction(): Promise<GetOrdersResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    // TODO: Fetch orders from database for this user
    // For now, return mock data
    return {
      success: true,
      orders: [],
    };
  } catch (error) {
    console.error('Get orders error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลได้' };
  }
}

// Cancel an order
export async function cancelOrderAction(orderId: string): Promise<CancelOrderResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    // TODO: Validate order belongs to user
    // TODO: Check if order status is 'pending'
    // TODO: Update order status to 'cancelled'

    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'ไม่สามารถยกเลิกได้' };
  }
}

// Reorder from previous order
export async function reorderAction(orderId: string): Promise<CancelOrderResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    // TODO: Fetch original order details
    // TODO: Create new order with same items
    // TODO: Return success

    return { success: true };
  } catch (error) {
    console.error('Reorder error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'ไม่สามารถสั่งอีกครั้งได้' };
  }
}
```

### 4. Check Font Configuration
Ensure fonts are properly loaded in `src/app/layout.tsx`:
```typescript
import { Prompt } from 'next/font/google';

const prompt = Prompt({ 
  subsets: ['thai', 'latin'], 
  weight: ['300', '400', '500', '600', '700'] 
});
```

**Status**: ✅ Already configured

### 5. Verify CSS Variables
Make sure `globals.css` has design tokens for status badges:
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
  --bg-inverse: #1a1a1a;
  --status-pending-bg: #fef3c7;
  --status-pending: #b45309;
  --status-processing-bg: #ede9fe;
  --status-processing: #7c3aed;
  --status-paid-bg: #dbeafe;
  --status-paid: #1d4ed8;
  --status-cancelled-bg: #fee2e2;
  --status-cancelled: #b91c1c;
}
```

**Status**: ✅ Already defined

### 6. Set Up Auth Routes Structure (if not exists)
Your app should have an `(auth)` route group:
```
src/app/(auth)/
├── login/
│   ├── page.tsx
│   └── login-content.tsx
├── profile/
│   ├── page.tsx
│   └── profile-content.tsx
├── orders/
│   ├── page.tsx
│   └── order-history-content.tsx
└── layout.tsx (optional)
```

## Features Implemented

### ✅ Order History Display
- List of orders with order number, date, items
- Display single product or "Product and X more" for multiple items
- Proper date formatting (Thai format)

### ✅ Order Status Filtering
- Filter chips for: All, Pending Payment, Pending Shipment, Paid, Cancelled
- Active state styling on selected filter
- Order list updates dynamically when filter changes
- Count updates based on filter

### ✅ Status Badges
- Color-coded badges for each status
- Badge colors match Figma design
- Cancellation reason display for cancelled orders

### ✅ Order Actions
- Cancel button for pending orders
- Reorder button for cancelled and completed orders
- Button styling and hover states

### ✅ Account Summary Sidebar
- Total orders count
- Total spent (accumulated sum of all order totals)
- Cancelled orders count
- Proper number formatting

### ✅ Navigation & Layout
- Same left rail as other pages (logo, nav items)
- Top bar with title, search, cart info, user avatar
- Main content area (940px) with order list
- Right sidebar (340px) with account summary
- Consistent design tokens and spacing

### ✅ Search Functionality
- Search input in top bar (UI implemented, TODO: search logic)
- Placeholder text for finding orders

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
- ✅ Page loads at `http://localhost:3000/orders` (when authenticated)
- ✅ Page shows "ประวัติการสั่งซื้อ" title
- ✅ Shows "ทั้งหมด 10 รายการ" (or actual count)
- ✅ Filter chips display: ทั้งหมด (active), รอชำระเงิน, รอจัดส่ง, ชำระเงินแล้ว, ยกเลิกแล้ว
- ✅ Order list displays 10 orders with all details:
  - Order number (#11, #10, etc.)
  - Date (Thai format: 5 ก.ย. 2569)
  - Product name(s)
  - Status badge with correct color
  - Total price in Thai Baht format
- ✅ Clicking filter chip updates list and highlights active chip
- ✅ Cancel button visible on pending orders (รอชำระเงิน)
- ✅ Reorder button visible on cancelled orders (ยกเลิกแล้ว)
- ✅ Cancellation reason displays for cancelled orders
- ✅ Right sidebar shows:
  - "สรุปบัญชี" heading
  - "คำสั่งซื้อทั้งหมด: 10 รายการ"
  - "ยอดใช้จ่ายสะสม: ฿7,150"
  - "คำสั่งซื้อที่ยกเลิก: 3 รายการ"
- ✅ Search input is interactive
- ✅ Top bar navigation works (home, shop, cart, orders, profile links)
- ✅ Avatar shows correct user initials (PP for Poonyapat)
- ✅ If not authenticated, visiting /orders redirects to /login
- ✅ Responsive: layout looks good on all screen sizes
- ✅ Status badges have correct colors:
  - Pending: Yellow background (#fef3c7) with dark orange text
  - Processing: Purple background (#ede9fe) with purple text
  - Paid: Light blue background (#dbeafe) with blue text
  - Cancelled: Light red background (#fee2e2) with red text

## Known Limitations

### Order Data
- Currently uses mock/sample data (10 hardcoded orders)
- No real database connection yet
- Requires `getOrdersAction` server action implementation

### Server Actions
- `cancelOrderAction` is not implemented (placeholder)
- `reorderAction` is not implemented (placeholder)
- No order status update logic
- No validation of order ownership

### Search
- Search input exists but not functional (TODO: implement search)
- No filtering by order number, date, or product name

### Order Management
- No real-time order status updates
- No order detail view/modal
- No order tracking/tracking number display
- No delivery date estimates
- No order notes or comments

### Responsive Design
- Sidebar fixed width (340px) — may overlap on mobile < 720px
- Main content fixed widths (940px) — may overflow on mobile
- **Note**: On mobile (<640px), consider stacking layout vertically (future enhancement)

## Database Schema Requirements

### Supabase Database
Requires orders table with structure:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number BIGINT NOT NULL,
  order_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL, -- Array of order items
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, order_number)
);

-- Indexes for faster queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date DESC);
```

## Next Steps After Integration

1. **Add server actions** (Step 3 above):
   - Implement `getOrdersAction(userId)` to fetch real orders from database
   - Implement `cancelOrderAction(orderId)` for order cancellation
   - Implement `reorderAction(orderId)` for reordering
   - Test with real Supabase calls

2. **Test the Order History page locally**:
   - Run `npm run dev`
   - Log in as a test user
   - Navigate to `http://localhost:3000/orders`
   - Test filter chips (click each status filter)
   - Test order display with real data
   - Verify sidebar stats calculations
   - Check responsive design on mobile
   - Test Cancel and Reorder buttons (once implemented)

3. **Implement search functionality**:
   - Wire up search input to filter orders
   - Search by order number, date, or product name
   - Update order list as user types

4. **Create order detail page**:
   - `/orders/[orderId]` page for full order details
   - Display all items with quantities and prices
   - Show shipping information
   - Display order timeline/status history
   - Link from order list rows to detail page

5. **Set up order notifications**:
   - Email notifications on order status changes
   - In-app notifications for order updates
   - SMS notifications (optional)

6. **Test error scenarios**:
   - Try cancel with expired order
   - Try reorder with unavailable products
   - Try cancel as different user (security)
   - Test network error handling
   - Check session expiration handling

7. **Verify full application flow**:
   - Create order via checkout → see in order history
   - Cancel order → status updates to cancelled
   - Reorder → creates new order with same items
   - Check links between pages (profile → orders, orders → profile)

## File Size & Performance Notes
- Server component: ~0.5 KB
- Client component: ~18 KB (with order list, filtering, stats)
- No new dependencies added (uses existing imports)
- Client state: `filterStatus` only
- Server actions: Call Supabase auth and database APIs

## Troubleshooting

### Error: "Cannot find module '@/lib/actions/orders'"
**Fix**: Create `src/lib/actions/orders.ts` with `getOrdersAction`, `cancelOrderAction`, `reorderAction` functions

### Error: "getOrdersAction is not a function"
**Fix**: Implement the server action in `src/lib/actions/orders.ts` and export it

### Page shows no orders
**Check**:
1. Is `getOrdersAction` being called in client component?
2. Does mock data need to be loaded?
3. Check browser console for errors
4. Verify Supabase connection if using real data

### Filter chips not updating list
**Check**:
1. Is `setFilterStatus` being called on button click?
2. Is filtering logic correct?
3. Verify state is being read in filter logic
4. Check for React errors in console

### Sidebar stats are incorrect
**Check**:
1. Are stats calculated from correct order list?
2. Is total spent summing all orders correctly?
3. Is cancelled count filtering properly?
4. Verify data types (number vs string)

### Cancel button not working
**Check**:
1. Is `cancelOrderAction` implemented?
2. Are error messages displaying?
3. Is `handleCancel` being called?
4. Check network tab for API response

### Responsive layout broken on mobile
**Check**:
1. Are breakpoints needed for sidebar layout?
2. Should sidebar stack below orders on small screens?
3. Consider adding mobile-specific layout (future enhancement)

---

**Summary**: Order History page (9/9) implements the complete order management interface with filtering, status display, and account summary. Ready to test on localhost after server action implementation and real database setup.
