# Profile Page Implementation Guide (08 · Profile)

## Overview
This is the Profile page (page 8/9) derived from the Figma design node-id=1-573. It displays the user account information with:
- User avatar and profile info in a sidebar
- Editable profile fields (username, phone)
- Avatar upload functionality
- Navigation to other account sections (Addresses, Order History)
- Logout button
- Save changes button with error/success handling

## Architecture

### Files Structure
```
src/app/(auth)/profile/
├── page.tsx          (Server component - authentication check)
└── profile-content.tsx (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches current user via `getCurrentUser()` → redirects to /login if not authenticated
- Renders `ProfileContent` client component with user data
- Generates metadata for SEO

#### `profile-content.tsx` (Client Component)
- Displays the complete profile UI with:
  - **Left Rail**: Navigation sidebar (76px, same as Shop/Product Detail/Cart/Checkout/Login pages)
  - **Top Bar**: Title, search bar, cart info, avatar
  - **Sidebar Content**:
    - User avatar (72px circular)
    - Username and email display
    - Menu items: Profile (active), Addresses, Order History, Logout
  - **Main Content**:
    - Avatar upload card with file input
    - Form card with:
      - Username input field with validation rules
      - Phone number input field
      - Email display (read-only)
      - Save button with loading state
    - Success/error message display
- **Interactivity**:
  - Form inputs with controlled state (username, phone, avatarUrl)
  - File upload with size validation (max 2MB)
  - File type validation (JPG, PNG only)
  - Form submission with loading state
  - Success/error message handling
  - Menu navigation with active state styling
  - Logout functionality

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Top bar**: 68px height with title, search, cart info
- **Sidebar width**: 280px (left menu with user info)
- **Main content**: 940px wide (form card, avatar card)
- **Avatar size**: Sidebar 72px, form 64px
- **Form fields**: 44px height, 14px padding
- **Buttons**: 44px height

### Colors (Design Tokens)
- **Background**: #ffffff (base), #f4f4f5 (surface), #fafafa (sunken)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Button**: #1a1a1a (primary), white text
- **Error**: #b91c1c (logout text)
- **Selected**: #efeff1 (menu item background)

### Typography
- **Top bar title**: Prompt 20px Medium
- **Section heading**: Prompt 24px SemiBold, tracking -0.2px
- **Labels**: Prompt 13px Medium
- **Body text**: Prompt 14px Regular
- **Captions**: Prompt 12px Regular
- **Placeholders**: Prompt 14px Regular, muted color

### Form Fields
- **Input height**: 44px, 14px padding, 10px border radius
- **Avatar button**: 40px height, white background
- **Save button**: 220px width, 44px height
- **Menu items**: 44px height, 20px left padding

## Data Dependencies

### Database Queries
The page requires:
- **Auth check**: `getCurrentUser()` to determine if user is authenticated
- **User data**: Current user object with email and user_metadata

### Server Action Required
- `updateProfileAction(username, phone)` → returns `{ success: boolean, error?: string }`
  - Validates username format (3-30 chars, a-z, A-Z, 0-9, _, .)
  - Checks username availability
  - Updates user profile in Supabase
  - Returns success/error result

- `uploadAvatarAction(file)` → returns `{ success: boolean, url?: string, error?: string }`
  - Validates file type (JPG, PNG only)
  - Validates file size (max 2MB)
  - Uploads to storage service
  - Returns signed URL

- `signOutAction()` → returns success/error
  - Clears session
  - Redirects to login page

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(auth)/profile/
├── page.tsx          (from "profile-server.tsx")
└── profile-content.tsx
```

**Important**: 
- Rename `profile-server.tsx` → `page.tsx`
- Rename `profile-content.tsx` → `profile-content.tsx`
- Directory structure should be created: `src/app/(auth)/profile/`

### 2. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/actions/auth.ts` — (update) add `updateProfileAction`, `uploadAvatarAction`, `signOutAction`

**Status**: ✅ `getCurrentUser` exists, need to add new server actions

### 3. Add Server Actions for Profile Management
Create or update `src/lib/actions/auth.ts` with:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';

interface UpdateProfileParams {
  username: string;
  phone: string;
}

interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

// Update user profile
export async function updateProfileAction(params: UpdateProfileParams): Promise<UpdateProfileResult> {
  try {
    const { username, phone } = params;

    // Validate inputs
    if (!username || username.length < 3 || username.length > 30) {
      return { success: false, error: 'ชื่อผู้ใช้ต้อง 3-30 ตัวอักษร' };
    }

    // Validate username format (a-z, A-Z, 0-9, _, .)
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return { success: false, error: 'ชื่อผู้ใช้มีตัวอักษรไม่ถูกต้อง' };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        username: username.trim(),
        phone: phone.trim(),
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้' };
  }
}

// Upload avatar
export async function uploadAvatarAction(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
      return { success: false, error: 'กรุณาเลือกไฟล์ JPG หรือ PNG' };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 2MB' };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้' };
    }

    // TODO: Implement file upload to Supabase storage
    // For now, return placeholder
    return { success: true, url: file.name };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'ไม่สามารถอัปโหลดรูปได้' };
  }
}

// Sign out user
export async function signOutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'ไม่สามารถออกจากระบบได้' };
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
  --bg-inverse: #1a1a1a;
  --action-selected-tint: #efeff1;
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
├── register/          (future)
└── layout.tsx         (optional)
```

## Features Implemented

### ✅ User Info Display
- Avatar with initials (PP for Poonyapat)
- Username and email display in sidebar
- Profile picture upload button

### ✅ Form Fields
- Username input with placeholder and validation rules
- Phone number input with placeholder
- Email display (read-only)
- Success/error message areas

### ✅ Form Interaction
- Controlled input state with `useState` for username, phone, avatarUrl
- File upload with validation (2MB max, JPG/PNG only)
- Form submission with loading state
- Form prevents submission if already loading
- Avatar upload file input (hidden)

### ✅ Error Handling
- File size validation error message
- File type validation error message
- Form submission error display with light red background
- Success message display with light green background
- User-friendly error messages in Thai

### ✅ Navigation
- Sidebar menu with active state styling
- Links to Addresses page (/profile/addresses)
- Link to Orders page (/orders)
- Logout button with error handling
- Left rail navigation to /shop, /cart, /orders, /profile

### ✅ Navigation & Layout
- Same left rail as other pages (logo, nav items)
- Top bar with title, search, cart info, user avatar
- Sidebar with user info and account menu
- Centered layout for profile content
- Light theme with surface-colored cards

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
- ✅ Page loads at `http://localhost:3000/profile` (when authenticated)
- ✅ User avatar shows correct initials (PP)
- ✅ Username field shows current username or placeholder
- ✅ Phone field shows current phone or placeholder
- ✅ Email field displays user email (read-only)
- ✅ Username input accepts text input
- ✅ Phone input accepts text input
- ✅ Avatar upload button opens file picker
- ✅ File picker only accepts JPG/PNG files
- ✅ Error message displays for files > 2MB
- ✅ Error message displays for non-image files
- ✅ Save button disabled while form is loading
- ✅ Save button shows loading state during submission
- ✅ Success message displays after save
- ✅ Error message displays on failed save
- ✅ Profile menu item has active styling (highlighted background)
- ✅ Clicking "ที่อยู่จัดส่ง" navigates to /profile/addresses
- ✅ Clicking "ประวัติการสั่งซื้อ" navigates to /orders
- ✅ Clicking logout button signs out user
- ✅ After logout, user redirected to /login
- ✅ If not authenticated, visiting /profile redirects to /login
- ✅ Navigation links work (home, shop, cart, orders)
- ✅ Responsive: layout looks good on all screen sizes

## Known Limitations

### Form Submission
- Currently placeholder TODO (saves locally without validation)
- Requires `updateProfileAction` server action implementation
- No duplicate username checking
- No real file upload to storage

### Avatar Upload
- File preview not shown before upload
- No progress indicator for upload
- No drag-and-drop support
- Real file upload to Supabase storage not implemented

### Profile Management
- Phone number format not validated
- No phone number masking
- Cannot change email through profile
- No password change functionality

### Responsive Design
- Sidebar fixed width (280px) — may overlap on mobile < 720px
- Main content fixed widths (940px) — may overflow on mobile
- **Note**: On mobile (<640px), consider stacking sidebar vertically (future enhancement)

## Database Schema Requirements

### Supabase Auth
Uses Supabase built-in auth with user metadata:
- `auth.users` table (managed by Supabase)
  - `id` (UUID)
  - `email` (text)
  - `user_metadata` (jsonb)
    - `username` (text, optional)
    - `phone` (text, optional)
    - `avatar_url` (text, optional)

### Future: Storage for Avatars
For storing uploaded avatar files:
- **Supabase Storage bucket**: `avatars/`
  - Path: `avatars/{userId}/profile.jpg`
  - Public accessible for display

## Next Steps After Integration

1. **Add server actions** (Step 3 above):
   - Implement `updateProfileAction(username, phone)` in `src/lib/actions/auth.ts`
   - Implement `uploadAvatarAction(file)` for file uploads
   - Implement `signOutAction()` for logout
   - Test with real Supabase calls

2. **Test the Profile page locally**:
   - Run `npm run dev`
   - Log in as a test user
   - Navigate to `http://localhost:3000/profile`
   - Test username input and save
   - Test phone input and save
   - Test file upload with valid/invalid files
   - Verify success/error messages
   - Test logout functionality
   - Check redirect to /login when not authenticated

3. **Set up address management flow**:
   - Create `/profile/addresses` page (future enhancement)
   - Implement address CRUD operations
   - Link addresses to user account

4. **Implement password change flow**:
   - Add password change section to profile (future)
   - Implement `changePasswordAction`
   - Add email verification flow

5. **Set up file upload to storage**:
   - Configure Supabase storage bucket for avatars
   - Implement file upload in `uploadAvatarAction`
   - Add signed URL generation for avatars

6. **Test error scenarios**:
   - Try save with empty username
   - Try save with invalid username format
   - Try upload with oversized file (>2MB)
   - Try upload with non-image file
   - Test network error handling
   - Check session expiration handling

7. **Next page implementation**:
   - After confirming Profile works, move to page 9 (Order History)
   - Same workflow: Figma → `get_design_context` → implement → test → complete

## File Size & Performance Notes
- Server component: ~0.5 KB
- Client component: ~12 KB (profile form with state management)
- No new dependencies added (uses existing imports)
- Form state: Client-side only (`username`, `phone`, `avatarUrl`, `isLoading`, `error`, `success`)
- Server actions: Call Supabase auth API

## Troubleshooting

### Error: "Cannot find module '@/lib/actions/auth'"
**Fix**: Create `src/lib/actions/auth.ts` with `updateProfileAction` and `uploadAvatarAction` functions

### Error: "updateProfileAction is not a function"
**Fix**: Implement the server action in `src/lib/actions/auth.ts` and export it

### Page shows "Redirect to /login" instead of profile
**Check**:
1. Is `getCurrentUser()` working correctly?
2. Does Supabase session exist?
3. Check browser cookie/localStorage for auth token
4. Verify Supabase configuration

### Avatar upload doesn't work
**Check**:
1. Is file input opening file picker?
2. Are file validations working?
3. Check error message displayed
4. Verify uploadAvatarAction is being called

### Form save doesn't work
**Check**:
1. Is save button being clicked?
2. Does loading state show?
3. Check for error message display
4. Verify updateProfileAction is being called
5. Check network tab for API response

### Logout button doesn't work
**Check**:
1. Is button click being triggered?
2. Does signOutAction exist?
3. Check for error message
4. Verify redirect to /login happens
5. Check browser console for errors

### Fields not updating on input
**Check**:
1. Are `onChange` handlers properly setting state?
2. Are input values bound to state? (`value={username}`)
3. Verify no React errors in console
4. Check that inputs are not disabled

### Success message doesn't disappear
**Check**:
1. Clear message on next form interaction
2. Implement auto-dismiss after 3-5 seconds (future enhancement)
3. Verify message state is being cleared

---

**Summary**: Profile page implements the 8th screen of the POS design with user information display, editable profile fields, avatar upload, and sidebar navigation. Ready to test on localhost after server action implementation and authentication setup.
