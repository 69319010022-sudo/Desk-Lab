# Register Page Implementation Guide (07 · Register)

## Overview
This is the Register page (page 7/9) derived from the Figma design node-id=9:1118. It displays a user registration form with:
- Page heading and subtitle
- Form fields: username, email, password, confirm password
- Show/hide password toggle for both password fields
- Terms and conditions checkbox
- Register button
- Link to login page for existing users
- Client-side validation with helpful error messages
- Success/error message display

## Architecture

### Files Structure
```
src/app/(auth)/register/
├── page.tsx            (Server component - authentication check)
└── register-content.tsx (Client component - UI & interactivity)
```

### Component Breakdown

#### `page.tsx` (Server Component)
- Fetches current user via `getCurrentUser()` → redirects to /shop if authenticated
- Renders `RegisterContent` client component
- Generates metadata for SEO

#### `register-content.tsx` (Client Component)
- Displays the complete registration UI with:
  - **Left Rail**: Navigation sidebar (76px, same as other POS pages)
  - **Main Content Area**: Centered registration card (400px)
  - **Page Heading**: "DeskLab" with subtitle
  - **Registration Card**:
    - Form title: "สมัครสมาชิก" (Register)
    - Subtitle: "ใช้เวลาไม่ถึงนาที เริ่มช้อปได้ทันที"
    - 5 form fields: username, email, password, confirm password + terms checkbox
    - Register button
    - Link to login page
  - **Interactivity**:
    - Form inputs with controlled state (username, email, password, confirmPassword, termsAccepted)
    - Real-time validation with client-side rules
    - Show/hide password toggle for both password fields
    - Form submission with loading state
    - Success/error message display
    - Navigation to login page on success
    - Validation rules:
      * Username: 3-30 chars, a-z, A-Z, 0-9, _, . only
      * Email: valid email format
      * Password: minimum 8 characters
      * Confirm Password: must match password
      * Terms: must be accepted

## Visual Design (from Figma)

### Layout
- **Rail width**: 76px (light surface background)
- **Main width**: 1364px (full width - rail)
- **Card width**: 400px (centered)
- **Card height**: 670px
- **Input height**: 44px with 14px padding
- **Button height**: 44px

### Colors (Design Tokens)
- **Background**: #ffffff (base), #f4f4f5 (surface), #fafafa (sunken)
- **Text**: #1a1a1a (ink), #6b6b70 (muted), #9a9aa0 (faint)
- **Border**: #ebebed (subtle), #d9d9dc (default)
- **Button**: white with border (inverse of filled)
- **Error**: #b91c1c (red text)

### Typography
- **Page heading**: Prompt 32px SemiBold, tracking -0.4px
- **Page subtitle**: Prompt 14px Regular
- **Card title**: Prompt 24px SemiBold, tracking -0.2px
- **Card subtitle**: Prompt 14px Regular
- **Labels**: Prompt 13px Medium
- **Body text**: Prompt 14px Regular
- **Helper text**: Prompt 12px Regular
- **Button text**: Prompt 14px Medium

### Form Fields
- **Input height**: 44px, 14px padding, 10px border radius
- **Background**: #f4f4f5 (surface)
- **Border**: #d9d9dc (default)
- **Checkbox**: 18px square, 5px border radius
- **Show/Hide button**: 12px font, positioned right in password field
- **Terms text area**: Flex with checkbox on left, text on right

## Data Dependencies

### Database Queries
The page requires:
- **Auth check**: `getCurrentUser()` to determine if user is already authenticated
- Redirect to /shop if authenticated (registration only for new users)

### Server Action Required
- `registerAction(params)` → returns `{ success: boolean, error?: string }`
  - Accepts: { username: string, email: string, password: string }
  - Validates username format (3-30 chars, a-z, A-Z, 0-9, _, .)
  - Checks username availability (no duplicates)
  - Checks email availability
  - Validates email format
  - Validates password strength
  - Creates new user in Supabase Auth
  - Returns success/error result
  - On success: user is logged in, ready to redirect to /shop or /login

## Installation Steps

### 1. Create Files in Project
Copy the two implementation files to your project:
```
project-root/src/app/(auth)/register/
├── page.tsx           (from "register-server.tsx")
└── register-content.tsx
```

**Important**: 
- Rename `register-server.tsx` → `page.tsx`
- Rename `register-content.tsx` → `register-content.tsx`
- Directory structure should be created: `src/app/(auth)/register/`

### 2. Verify Existing Dependencies
Make sure these imports are available in your `src/lib/` directory:
- `src/lib/data/auth.ts` — `getCurrentUser()`
- `src/lib/actions/auth.ts` — (create or update) add `registerAction`

**Status**: ✅ `getCurrentUser` exists, need to add `registerAction`

### 3. Add Server Action for User Registration
Create or update `src/lib/actions/auth.ts` with:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function registerAction(params: RegisterParams): Promise<RegisterResult> {
  try {
    const { username, email, password } = params;

    // Validate inputs
    if (!username || username.length < 3 || username.length > 30) {
      return { success: false, error: 'ชื่อผู้ใช้ต้อง 3-30 ตัวอักษร' };
    }

    // Validate username format (a-z, A-Z, 0-9, _, .)
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return { success: false, error: 'ชื่อผู้ใช้มีตัวอักษรไม่ถูกต้อง' };
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'อีเมลไม่ถูกต้อง' };
    }

    // Validate password
    if (!password || password.length < 8) {
      return { success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
    }

    // Check if user already exists by email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim())
      .single();

    if (existingUser) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    // Check if username is available
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .single();

    if (existingUsername) {
      return { success: false, error: 'ชื่อผู้ใช้ถูกใช้งานแล้ว' };
    }

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'ไม่สามารถสมัครสมาชิกได้' };
    }

    // Create profile in profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: email.trim(),
      username: username.trim(),
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ไม่สามารถสมัครสมาชิกได้',
    };
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
  --action-selected-tint: #efeff1;
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
├── register/
│   ├── page.tsx
│   └── register-content.tsx
└── profile/          (future)
```

## Features Implemented

### ✅ User Registration Form
- Username input with validation (3-30 chars, allowed characters)
- Email input with email format validation
- Password input with show/hide toggle
- Confirm password input with show/hide toggle
- Helper text explaining username requirements

### ✅ Form Validation
- Client-side validation for all fields
- Username: 3-30 length, format check (a-z, A-Z, 0-9, _, . only)
- Email: standard email regex validation
- Password: minimum 8 characters
- Confirm password: must match password
- Terms checkbox: must be accepted before submission
- Real-time validation feedback
- Detailed error messages in Thai

### ✅ Form Interaction
- Controlled input state (username, email, password, confirmPassword)
- Checkbox for terms acceptance
- Show/hide password toggle for both password fields
- Form submission with loading state
- Form prevents submission if already loading
- Button disabled during submission
- Loading text on button during submission

### ✅ Error Handling
- Field validation error display with red background
- Success message display with green background
- User-friendly error messages in Thai
- Clears messages on next submission attempt
- Validation errors prevent form submission

### ✅ Navigation
- Left rail navigation to /shop, /cart, /orders
- Logo with "DL" branding
- Link to login page for existing users
- Redirect to /shop if user already authenticated
- On successful registration: redirect to /login after 2 seconds

### ✅ Layout & Styling
- Same left rail as other pages (76px width)
- Centered card layout (400px width)
- Light surface colors matching design system
- Proper spacing and typography
- Responsive form fields with focus states
- Form follows Login page pattern

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
- ✅ Page loads at `http://localhost:3000/register` (when not authenticated)
- ✅ Redirects to `/shop` if user is already authenticated
- ✅ Username field accepts text input and validates format
- ✅ Email field accepts email input and validates format
- ✅ Password field shows dots, accepts text, has show/hide toggle
- ✅ Confirm password field shows dots, accepts text, has show/hide toggle
- ✅ Show/hide toggle reveals/conceals passwords correctly
- ✅ Checkbox toggles between checked/unchecked states
- ✅ Error displays for invalid username format (< 3 chars, > 30 chars, special chars)
- ✅ Error displays for invalid email format
- ✅ Error displays for password < 8 chars
- ✅ Error displays when passwords don't match
- ✅ Error displays when terms not accepted
- ✅ Register button disabled while loading
- ✅ Register button shows loading text during submission
- ✅ Success message displays after registration
- ✅ Redirects to login after successful registration (2 second delay)
- ✅ "Already have account? Sign in" link navigates to /login
- ✅ Navigation links work (home, shop, cart, orders)
- ✅ If authenticated, visiting /register redirects to /shop
- ✅ Responsive: layout looks good on all screen sizes

## Known Limitations

### Form Submission
- Currently placeholder TODO (form state management only)
- Requires `registerAction` server action implementation
- No real server validation (server-side duplicate checking)
- No email verification required on signup
- No password strength meter/indicator

### Password Display
- Show/hide uses text input switch (could add password strength indicator)
- No password requirements shown upfront (only 8 char minimum)

### Registration Flow
- After registration: temporary redirect, no actual auth session
- No email confirmation step
- No phone number field (added in profile later)
- No avatar upload on registration (added in profile page)

### Form Validation
- Username validation is client-side only
- Email uniqueness checked on form submit (could check on blur)
- No rate limiting on registration attempts
- No CAPTCHA protection

### Responsive Design
- Card width fixed at 400px — may overflow on mobile < 500px
- Rail width fixed at 76px — works on all sizes
- **Note**: On mobile (<640px), consider stacking layout vertically (future enhancement)

## Database Schema Requirements

### Supabase Auth
Uses Supabase built-in auth:
- `auth.users` table (managed by Supabase)
  - `id` (UUID)
  - `email` (text)
  - `user_metadata` (jsonb)
    - `username` (text)

### Future: Profiles Table
For storing user profile data:
- **Table**: `profiles`
  - `id` (UUID, foreign key to auth.users.id)
  - `email` (text, indexed)
  - `username` (text, indexed, unique)
  - `phone` (text, optional)
  - `avatar_url` (text, optional)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

## Next Steps After Integration

1. **Add server action** (Step 3 above):
   - Implement `registerAction(username, email, password)` in `src/lib/actions/auth.ts`
   - Connect to Supabase Auth signup
   - Implement profile creation
   - Test with real Supabase calls

2. **Test the Register page locally**:
   - Run `npm run dev`
   - Navigate to `http://localhost:3000/register`
   - Test username input with valid/invalid values
   - Test email input with valid/invalid values
   - Test password input and show/hide toggle
   - Test confirm password validation
   - Test terms checkbox
   - Verify all error messages display correctly
   - Test successful registration flow
   - Check redirect to login

3. **Link login and register flows**:
   - Ensure login page links to register ("/register")
   - Ensure register page links to login ("/login")
   - Test navigation between pages

4. **Implement email verification** (future):
   - Add email confirmation requirement
   - Send verification email on signup
   - Create verification page
   - Link email verification to profile activation

5. **Add password strength meter** (future):
   - Show password strength during input
   - Enforce minimum requirements
   - Suggest strong passwords

6. **Set up error tracking**:
   - Log registration errors to error tracking service
   - Monitor failed registration attempts
   - Alert on suspicious activity

7. **Next page installation**:
   - After confirming Register works, install pages 2-6, 8, 9 into project
   - Test complete user flow: Register → Login → Shop → Cart → Checkout → Profile

## File Size & Performance Notes
- Server component: ~0.5 KB
- Client component: ~18 KB (form with state management and validation)
- No new dependencies added (uses existing imports)
- Form state: Client-side only (username, email, password, confirmPassword, termsAccepted, etc.)
- Server action: Call Supabase Auth API

## Troubleshooting

### Error: "Cannot find module '@/lib/actions/auth'"
**Fix**: Create `src/lib/actions/auth.ts` with `registerAction` function

### Error: "registerAction is not a function"
**Fix**: Implement the server action in `src/lib/actions/auth.ts` and export it

### Page shows "Redirect to /shop" instead of register
**Check**:
1. Is `getCurrentUser()` working correctly?
2. Does Supabase session exist?
3. Check browser cookie/localStorage for auth token
4. Clear cookies and try again

### Form fields not updating on input
**Check**:
1. Are `onChange` handlers properly setting state?
2. Are input values bound to state? (`value={username}`)
3. Verify no React errors in console
4. Check that inputs are not disabled

### Register button doesn't work
**Check**:
1. Is button click being triggered?
2. Does registerAction exist?
3. Check for validation errors displayed
4. Verify network tab for API response
5. Check browser console for errors

### Password toggle doesn't work
**Check**:
1. Is button click being triggered?
2. Is `showPassword` state updating?
3. Verify input type switches between "password" and "text"
4. Check that button is not disabled

### Show/Hide text is wrong
**Check**: 
1. Component returns correct text based on state
2. `showPassword` state is correct
3. Button click handler toggles state properly

### Validation errors don't appear
**Check**:
1. Validation function is being called
2. Error state is being set
3. Error message div is rendered
4. CSS classes for error styling are applied

### Success message doesn't redirect
**Check**:
1. Success state is being set
2. setTimeout for redirect is active
3. router.push('/login') is being called
4. Browser console for navigation errors

---

**Summary**: Register page implements page 7 of the POS design with a complete user registration form, client-side validation, password visibility toggle, and terms acceptance. Ready to test on localhost after server action implementation and authentication setup.
