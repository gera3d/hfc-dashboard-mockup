# Supabase Authentication - Quick Reference

## 🎯 Login & Access

**Login Page:** http://localhost:3000/  
**Dashboard:** http://localhost:3000/dashboard  
**Supabase Dashboard:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj

---

## 🔑 Credentials

**Project URL:** `https://yncbcjaymepacfyjsoyj.supabase.co`  
**Anon Key:** Stored in `.env.local`

---

## 📝 Common Tasks

### Create a Test User
```typescript
// Option 1: Use the signup form at http://localhost:3000/
// Option 2: Use Supabase Dashboard
// Go to: Auth > Users > Add user
```

### Sign In
```typescript
import { signIn } from '@/lib/supabase';

const { data, error } = await signIn('user@example.com', 'password');
if (error) console.error(error.message);
```

### Sign Up
```typescript
import { signUp } from '@/lib/supabase';

const { data, error } = await signUp('user@example.com', 'password');
if (error) console.error(error.message);
```

### Sign Out
```typescript
import { signOut } from '@/lib/supabase';

await signOut();
router.push('/');
```

### Get Current User
```typescript
import { getCurrentUser } from '@/lib/supabase';

const { user, error } = await getCurrentUser();
console.log(user?.email);
```

### Check Session
```typescript
import { getSession } from '@/lib/supabase';

const { session, error } = await getSession();
if (session) {
  console.log('User is authenticated');
}
```

---

## 🛡️ Protected Routes

All routes are protected except:
- `/` (login page)
- `/_next/*` (Next.js internals)
- `/api/auth/*` (auth endpoints)

To access `/dashboard`, you must be logged in.

---

## 🎨 Theme Support

The login page adapts to three themes:
- **Light** - Clean, bright interface
- **Dark** - Dark mode with high contrast
- **HFC** - Health for California branding

---

## 🔧 Troubleshooting

**Redirect loop?** Clear cookies and localStorage  
**Can't login?** Check Supabase dashboard for user  
**Session not persisting?** Check `.env.local` variables  
**Server not starting?** Run `npm install` first  

---

## 📄 Documentation Files

- `SUPABASE-SETUP.md` - Complete Supabase setup guide
- `SUPABASE-AUTH-GUIDE.md` - Detailed authentication documentation
- `.env.local` - Environment variables (DO NOT COMMIT)

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# View at
http://localhost:3000
```

---

**Need Help?** Check browser console for errors or visit the Supabase Dashboard.
