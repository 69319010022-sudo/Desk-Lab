# Login Page Implementation Guide (06 · Login)

## Overview
This is the Login page (page 6/9) derived from the Figma design node-id=1-539. It displays the authentication form where users enter their email and password to access their DeskLab account with form validation, password visibility toggle, forgot password link, and sign-up option.

## Architecture

### Files Structure
```
src/app/(auth)/login/
├── page.tsx          (Server component - authentication check)
└── login-content.tsx (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches current user via `getCurrentUser()` → redirects to /shop if already authenticated
- Renders `LoginContent` client component for public access
- Generates metadata for SEO

#### `login-content.tsx` (Client Component)
- Displays the complete login UI with:
  - **Left Rail**: Navigation sidebar (same as Shop/Product Detail/Cart/Checkout pages)
  - **Main Content**: Centered login card with:
    - Brand name "DeskLab" and tagline
    - Email input field with placeholder
    - Password input field with show/hide toggle button
    - Forgot password link (→ /forgot-password)
    - Login button with loading state
    - Sign-up prompt with link (→ /register)
    - Error message display area
- **Interactivity**:
  - Email and password form inputs with controlled state
  - Show/hide password toggle
  - Form validation (email required, password required)
  - Login button disabled until both fields filled
  - Loading state during authentication (button shows "⏳ กำลังเข้าสู่ระบบ...")
  - Error handling display above form
  - Form submission calls `signInAction` server action (TODO)

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (dark background #1a1a1a)
- **Main content**: Centered on light background, width 400px for login card
- **Card**: 400px wide, rounded 14px, light gray surface background
- **Card padding**: 40px (10 in Tailwind units)
- **Form field height**: 44px (input boxes)
- **Button height**: 44px

### Colors (Design Tokens)
- **Background**: #ffffff (base), #f4f4f5 (surface), #fafafa (sunken)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Button**: #1a1a1a (primary), white text

### Typography
- **Brand name "DeskLab"**: Prompt 32px SemiBold, tracking -0.4px
- **Card heading "เข้าสู่ระบบ"**: Prompt 24px SemiBold, tracking -0.2px
- **Labels**: Prompt 13px Medium
- **Input placeholders**: Prompt 14px Regular, muted
- **Link text**: Prompt 13px/14px Medium
- **Button text**: Prompt 14px Medium

### Form Fields
- **Email input**: 44px height, 14px left/right padding, 10px border radius
- **Password input**: 44px height, 14px left/right padding, 10px border radius
- **Input focus state**: Border changes to ink color (#1a1a1a)
- **Show/Hide button**: Positioned right side of password field, clickable text

## Data Dependencies

### Database Queries
The page requires:
- **Auth check**: `getCurrentUser()` to determine if user already logged in
- No other database queries needed for UI rendering (form is static)

### Server Action Required
- `signInAction(email, password)` → returns `{ success: boolean, error?: string, userId?: string }`
  - Validates email/password against Supabase auth
  - Returns success/error result
  - Page redirects to /shop on success

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(auth)/login/
├── page.tsx          (from "login-server.tsx")
└── login-content.tsx (from "login-content.tsx")
```

**Important**: 
- Rename `login-server.tsx` → `page.tsx`
- Rename `login-content.tsx` → `login-content.tsx`
- Directory structure should be created: `src/app/(auth)/login/`

### 2. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/actions/auth.ts` — (new) for sign-in action

**Status**: ✅ `getCurrentUser` exists, need to add `signInAction`

### 3. Add Server Action for Authentication
Create or update `src/lib/actions/auth.ts` with:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';

interface SignInParams {
  email: string;
  password: string;
}

interface SignInResult {
  success: boolean;
  error?: string;
  userId?: string;
}

// Sign in user with email and password
export async function signInAction({ email, password }: SignInParams): Promise<SignInResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Handle specific error messages
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'กรุณายืนยันอีเมลของคุณก่อน' };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'เข้าสู่ระบบไม่สำเร็จ' };
    }

    // Set session cookie (Supabase handles this via middleware)
    revalidatePath('/');
    return { success: true, userId: data.user.id };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ' };
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
}
```

**Status**: ✅ Already defined

### 6. Set Up Auth Routes Structure (if not exists)
Your app should have an `(auth)` route group for public pages:
```
src/app/(auth)/
├── login/
│   ├── page.tsx
│   └── login-content.tsx
├── register/          (future)
├── forgot-password/   (future)
└── layout.tsx         (optional)
```

The `(auth)` group allows these pages to have a different layout from the main app if needed.

## Features Implemented

### ✅ Login Form
- Email input field with validation
- Password input field with masking
- Show/hide password toggle button (labeled "แสดง" / "ซ่อน")
- Form validation (both fields required before submit)
- Placeholder text ("you@example.com", "••••••••")

### ✅ Form Interaction
- Controlled input state with `useState` for email, password, showPassword
- Show/hide password toggles input type between "password" and "text"
- Login button disabled until both fields have values
- Loading state during form submission (button shows "⏳" spinner text)
- Form prevents submission if already loading

### ✅ Error Handling
- Error message display area above form (styled with light red background)
- Error cleared when form re-submitted
- Try/catch around server action call
- User-friendly error messages in Thai

### ✅ Links & Navigation
- "ลืมรหัสผ่าน?" (Forgot password) link → /forgot-password
- "สมัครสมาชิก" (Sign up) link → /register
- Left rail navigation to /shop, /cart, /orders, /profile

### ✅ Navigation
- Same left rail as other pages (logo, nav items, account link)
- Centered layout for login card
- Brand section with "DeskLab" title and tagline
- Light theme with surface-colored card against base background

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
- ✅ Page loads at `http://localhost:3000/login` (without authentication)
- ✅ Email input accepts text input
- ✅ Password input shows dots when hidden, plain text when shown
- ✅ Show/Hide button toggles password visibility
- ✅ Login button disabled until both fields filled
- ✅ Login button shows loading state during submission
- ✅ Error message displays on failed authentication
- ✅ Form clears error on re-submission attempt
- ✅ Clicking login with valid credentials redirects to /shop
- ✅ If already logged in, visiting /login redirects to /shop
- ✅ Forgot password link navigates to /forgot-password
- ✅ Sign up link navigates to /register
- ✅ Navigation links work (home, shop, cart, orders, profile)
- ✅ Responsive: form is centered and looks good on all sizes

## Known Limitations

### Form Submission
- Currently placeholder TODO (redirects to /shop without validation)
- Requires `signInAction` server action implementation
- No email verification flow yet

### Password Management
- Show/hide is client-side only (no real encryption/security considerations)
- No password strength indicator
- No "remember me" checkbox

### Error Handling
- Generic error messages (no specific field validation)
- No rate limiting on failed attempts
- No account lockout after multiple failed logins

### Responsive Design
- Login card fixed width (400px) — may overflow on mobile < 500px
- Left rail not hidden on mobile (consider media query hiding for small screens)
- **Note**: On mobile (<640px), consider stacking differently (future enhancement)

## Database Schema Requirements

### Supabase Auth
Uses Supabase built-in auth with:
- `auth.users` table (managed by Supabase)
  - `id` (UUID)
  - `email` (text)
  - `encrypted_password` (text, managed by Supabase)
  - `email_confirmed_at` (timestamp, null until verified)

No custom tables needed for login page itself.

### Future: User Profile Table
For storing user profile data after login:
- **users** table:
  - `id` (UUID, foreign key to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text, optional)
  - `created_at` (timestamp)

## Next Steps After Integration

1. **Add server action** (Step 3 above):
   - Implement `signInAction(email, password)` in `src/lib/actions/auth.ts`
   - Test with Supabase credentials

2. **Test the Login page locally**:
   - Run `npm run dev`
   - Navigate to `http://localhost:3000/login`
   - Test email input with valid/invalid emails
   - Test password visibility toggle
   - Test form submission with valid credentials
   - Verify error message on failed login
   - Check redirect to /shop on successful login

3. **Set up forgot password flow**:
   - Create `/forgot-password` page (page 7)
   - Create `/reset-password` page with token handling
   - Implement `forgotPasswordAction` and `resetPasswordAction`

4. **Set up sign-up flow**:
   - Create `/register` page (page 7 continuation)
   - Implement `signUpAction` server action
   - Handle email verification flow

5. **Implement auth middleware**:
   - Create `src/middleware.ts` to protect pages requiring authentication
   - Redirect unauthenticated users to /login
   - Redirect already-logged-in users from /login to /shop

6. **Test error scenarios**:
   - Try login with non-existent email
   - Try login with wrong password
   - Try multiple failed attempts
   - Test email not confirmed flow
   - Check network error handling

7. **Next page implementation**:
   - After confirming Login works, move to page 7 (Register)
   - Same workflow: Figma → `get_design_context` → implement → test → next page

## File Size & Performance Notes
- Server component: ~0.5 KB
- Client component: ~5 KB (login form with state management)
- No new dependencies added (uses existing imports)
- Form state: Client-side only (`email`, `password`, `showPassword`, `isLoading`, `error`)
- Server action: Calls Supabase auth API

## Troubleshooting

### Error: "Cannot find module '@/lib/actions/auth'"
**Fix**: Create `src/lib/actions/auth.ts` with `signInAction` function

### Error: "signInAction is not a function"
**Fix**: Implement the server action in `src/lib/actions/auth.ts` and export it

### Page doesn't redirect to /shop on login
**Check**:
1. Is `signInAction` actually being called? (uncomment TODO code)
2. Does Supabase auth return success?
3. Check server action return value
4. Verify Router push is working

### Password show/hide button doesn't work
**Check**:
1. Is `setShowPassword` updating state?
2. Is input `type` attribute changing between "password" and "text"?
3. Check browser console for errors

### Form validation not working
**Check**:
1. Are `email` and `password` state updating on input?
2. Is login button disabled check working? (`disabled={!email || !password}`)
3. Check form onChange handlers

### Email/password inputs not updating
**Check**:
1. Are `onChange` handlers properly setting state?
2. Are input values bound to state? (`value={email}`)
3. Verify no React errors in console

### Login always redirects to /shop regardless of credentials
**Check**:
1. TODO code is being executed instead of real server action
2. Need to uncomment signInAction call
3. Need actual authentication implementation

### User already logged in but can still access /login
**Check**:
1. Is `getCurrentUser()` working?
2. Is redirect happening? (check server logs)
3. Verify auth session is properly set

---

**Summary**: Login page implements the 6th screen of the POS design with email/password authentication form, password visibility toggle, error handling, and proper redirects. Ready to test on localhost after server action implementation and authentication setup.
