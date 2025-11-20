# HFC Dashboard - Supabase Authentication Guide

## 🎯 Overview

The HFC Dashboard now uses **Supabase Authentication** to secure access. The login page is at the root domain (`/`), and authenticated users are redirected to `/dashboard`.

---

## 🚀 Quick Start

### 1. **Access the Application**
- **Login Page:** `http://localhost:3000/`
- **Dashboard (protected):** `http://localhost:3000/dashboard`

### 2. **Create an Account**
1. Navigate to `http://localhost:3000/`
2. Click the **"Sign Up"** tab
3. Enter your email and password (minimum 6 characters)
4. Click **"Create Account"**
5. Check your email for verification (if email confirmation is enabled)
6. Switch to **"Sign In"** tab and log in

### 3. **Sign In**
1. Navigate to `http://localhost:3000/`
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to `/dashboard`

### 4. **Sign Out**
- **Option 1:** Click the "Sign out" button in the top navigation bar (visible in Light/Dark themes)
- **Option 2:** Click the "Sign out" button in the top-right corner (visible in HFC theme)

---

## 📁 File Structure

```
hfc-dashboard-mockup/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Root page - Login component
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           # Dashboard layout with auth protection
│   │   │   └── page.tsx             # Dashboard page content
│   ├── components/
│   │   ├── LoginPage.tsx            # Login/Signup UI component
│   │   └── TopNav.tsx               # Navigation with logout button
│   ├── lib/
│   │   └── supabase.ts              # Supabase client & auth helpers
│   └── middleware.ts                # Route protection middleware
├── .env.local                       # Environment variables (Supabase credentials)
├── SUPABASE-SETUP.md                # Complete Supabase documentation
└── SUPABASE-AUTH-GUIDE.md           # This file
```

---

## 🔐 Authentication Flow

### User Journey

```
┌─────────────┐
│   Visit /   │
└──────┬──────┘
       │
       ├─── Not Authenticated ──→ Show Login Page
       │                           ├─ Sign In ──→ Redirect to /dashboard
       │                           └─ Sign Up ──→ Create account → Login
       │
       └─── Already Authenticated ──→ Redirect to /dashboard
```

### Protected Routes

All routes except `/` require authentication:
- `/dashboard` - Main dashboard
- `/settings` - Settings page
- `/agent/*` - Agent pages
- Any other routes

If a user tries to access a protected route without being authenticated, they'll be redirected to `/` (login page).

---

## 🛠️ Technical Implementation

### 1. **Supabase Client** (`src/lib/supabase.ts`)

The Supabase client is configured with:
- **URL:** From `NEXT_PUBLIC_SUPABASE_URL` environment variable
- **Anon Key:** From `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable
- **Session Persistence:** Enabled (stores session in localStorage)
- **Auto Refresh:** Enabled (automatically refreshes expired tokens)

**Available Helper Functions:**
```typescript
import { signIn, signUp, signOut, getCurrentUser, getSession } from '@/lib/supabase';

// Sign in
const { data, error } = await signIn('user@example.com', 'password');

// Sign up
const { data, error } = await signUp('user@example.com', 'password');

// Sign out
await signOut();

// Get current user
const { user, error } = await getCurrentUser();

// Get session
const { session, error } = await getSession();
```

### 2. **Login Page** (`src/components/LoginPage.tsx`)

Features:
- ✅ Email/Password authentication
- ✅ Toggle between Sign In and Sign Up
- ✅ Password confirmation on signup
- ✅ Error handling and display
- ✅ Success messages
- ✅ Responsive design
- ✅ Theme-aware (adapts to Light/Dark/HFC themes)
- ✅ Auto-redirect if already logged in

### 3. **Dashboard Protection** (`src/app/dashboard/layout.tsx`)

The dashboard layout checks authentication on mount:
```typescript
useEffect(() => {
  const checkAuth = async () => {
    const { session } = await getSession();
    if (!session) {
      router.push('/'); // Redirect to login
    }
  };
  checkAuth();
}, []);
```

### 4. **Middleware** (`src/middleware.ts`)

Protects routes at the edge:
- Checks for authentication token in cookies
- Redirects unauthenticated users to login
- Redirects authenticated users away from login page
- Runs on all routes except static files

### 5. **Logout Implementation**

**In TopNav (Light/Dark themes):**
```typescript
const handleLogout = async () => {
  await signOut();
  router.push('/');
};
```

**In Dashboard (HFC theme):**
```typescript
<button onClick={async () => {
  const { signOut } = await import('@/lib/supabase');
  await signOut();
  router.push('/');
}}>
  Sign out
</button>
```

---

## 🔧 Configuration

### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://yncbcjaymepacfyjsoyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Notes:**
- ✅ `NEXT_PUBLIC_*` variables are safe to expose in the browser when using Row Level Security (RLS)
- ✅ Never commit `.env.local` to version control (already in `.gitignore`)
- ✅ The anon key only allows operations permitted by RLS policies

---

## 📊 Supabase Dashboard Access

### User Management
View all users, ban/delete users, and manage authentication:
👉 https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/auth/users

### Database Tables
Manage data, view logs, run SQL queries:
👉 https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/editor

### API Settings
View API keys, service role key, and connection strings:
👉 https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/settings/api

---

## 🧪 Testing Authentication

### Manual Testing Checklist

- [ ] **Navigate to `/`** - Should show login page
- [ ] **Click "Sign Up"** - Should switch to signup form
- [ ] **Create account** with email/password - Should show success message
- [ ] **Sign in** with created account - Should redirect to `/dashboard`
- [ ] **Try accessing `/dashboard`** directly while logged out - Should redirect to `/`
- [ ] **Click "Sign out"** button - Should log out and redirect to `/`
- [ ] **Refresh page** while logged in - Should maintain session
- [ ] **Close browser and reopen** - Session should persist (if not in incognito)

### Test Accounts

You can create test accounts directly in the Supabase dashboard:
1. Go to [Auth > Users](https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/auth/users)
2. Click "Add user"
3. Enter email and password
4. Click "Create user"

---

## 🎨 UI/UX Features

### Login Page
- 🎨 Gradient background with blur effects
- 🌙 Theme-aware (adapts to user's theme preference)
- 📱 Fully responsive (mobile-first design)
- ⚡ Smooth transitions and animations
- 🔒 Password visibility toggle (future enhancement)
- 📧 "Forgot password" link (future enhancement)

### Dashboard
- 🔐 Automatic session check on load
- ⏳ Loading state while checking authentication
- 🚪 Logout button in navigation
- 🎨 Consistent with existing HFC branding

---

## 🚨 Troubleshooting

### Issue: "Cannot find module '@/lib/supabase'"
**Solution:** Restart the development server (`npm run dev`)

### Issue: Redirect loop between `/` and `/dashboard`
**Solution:** Clear browser cookies and localStorage, then try again

### Issue: "Invalid login credentials"
**Solution:** 
- Verify email/password are correct
- Check if email confirmation is required (check Supabase Auth settings)
- Ensure user exists in Supabase dashboard

### Issue: Session not persisting
**Solution:**
- Check browser localStorage for `hfc-dashboard-auth-token`
- Verify Supabase URL and anon key in `.env.local`
- Check browser console for errors

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Password reset/forgot password flow
- [ ] Email verification requirement
- [ ] Social authentication (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] User profile management
- [ ] Role-based access control (RBAC)
- [ ] Session timeout and auto-logout
- [ ] Remember me / Stay signed in checkbox
- [ ] Password strength indicator
- [ ] Magic link authentication (passwordless)

### Optional Features
- [ ] User avatar upload
- [ ] Account settings page
- [ ] Activity/audit log
- [ ] Login history
- [ ] Device management

---

## 📚 Additional Resources

- **Supabase Setup Guide:** See `SUPABASE-SETUP.md` for complete documentation
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Next.js Auth Best Practices:** https://nextjs.org/docs/authentication
- **Supabase Examples:** https://github.com/supabase/supabase/tree/master/examples

---

## 🆘 Support

For issues or questions:
1. Check the [Supabase Dashboard](https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj)
2. Review the [Supabase Documentation](https://supabase.com/docs)
3. Check browser console for error messages
4. Verify environment variables are set correctly

---

**Last Updated:** November 14, 2025  
**Version:** 1.0.0
