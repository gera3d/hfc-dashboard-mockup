# Supabase Configuration Guide

This document contains all the credentials and setup information for the HFC Dashboard Supabase integration.

## Project Overview

- **Organization:** gera3d's Org
- **Project Name:** dashbaord
- **Project ID:** yncbcjaymepacfyjsoyj
- **Project URL:** `https://yncbcjaymepacfyjsoyj.supabase.co`
- **Dashboard URL:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj

---

## API Credentials

### Project API URL
```
https://yncbcjaymepacfyjsoyj.supabase.co
```

### Public (Anon) API Key
**Use this for all frontend/browser applications with Row Level Security (RLS) enabled:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo
```

### Service/Admin Key
**For backend operations that bypass RLS - Access via:**
https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/settings/api

---

## Quick Start: Client Connection

### JavaScript/TypeScript (Next.js)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yncbcjaymepacfyjsoyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://yncbcjaymepacfyjsoyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo
```

---

## Features Available

### 1. Authentication & User Management
- **Purpose:** Built-in signup, login (email/password, social providers, magic links)
- **User Management:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/auth/users
- **Documentation:** https://supabase.com/docs/guides/auth

**Common Auth Operations:**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### 2. Database (PostgreSQL)
- **Table Editor:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/editor
- **SQL Editor:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new
- **Documentation:** https://supabase.com/docs/guides/database

**Example Table Structure (todos):**
- `id` (bigint, auto-increment, primary key)
- `task` (text)
- `status` (text, default: 'Not Started')
- `user_id` (UUID, references auth.users, required)
- `inserted_at` (timestamp)
- `updated_at` (timestamp)

**Database Operations:**
```typescript
// Insert
const { data, error } = await supabase
  .from('todos')
  .insert({ task: 'New task', user_id: user.id });

// Query
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', user.id);

// Update
const { data, error } = await supabase
  .from('todos')
  .update({ status: 'Completed' })
  .eq('id', taskId);

// Delete
const { data, error } = await supabase
  .from('todos')
  .delete()
  .eq('id', taskId);
```

### 3. Storage (File Buckets)
- **Purpose:** Upload, organize, and serve files (images, documents, etc.)
- **Bucket Management:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/storage/buckets
- **Documentation:** https://supabase.com/docs/guides/storage

**Storage Operations:**
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload('path/filename.jpg', file);

// Get public URL
const { data } = supabase.storage
  .from('bucket-name')
  .getPublicUrl('path/filename.jpg');

// Download file
const { data, error } = await supabase.storage
  .from('bucket-name')
  .download('path/filename.jpg');
```

### 4. Edge Functions
- **Purpose:** Deploy custom serverless API endpoints and workflows
- **Functions UI:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/functions
- **Documentation:** https://supabase.com/docs/guides/functions

### 5. Realtime Subscriptions
- **Purpose:** Listen to database changes via WebSockets
- **Realtime Inspector:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/realtime/inspector
- **Documentation:** https://supabase.com/docs/guides/realtime

**Realtime Example:**
```typescript
// Subscribe to changes
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Unsubscribe
channel.unsubscribe();
```

---

## Security: Row Level Security (RLS)

**IMPORTANT:** Always enable RLS on tables to ensure users can only access their own data.

### Example RLS Policy

```sql
-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own todos
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own todos
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own todos
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own todos
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Example Projects for Reference

### Next.js Examples
- **Todo List:** https://github.com/supabase/supabase/tree/master/examples/todo-list/nextjs-todo-list
- **SaaS Starter (Auth + Subscriptions):** https://github.com/nextjs/saas-starter
- **Slack Clone (Realtime):** https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone

### Other Frameworks
- **NestJS Auth:** https://github.com/hiro1107/nestjs-supabase-auth
- **React Realtime Chat:** https://github.com/shwosner/realtime-chat-supabase-react
- **Svelte Kanban:** https://github.com/joshnuss/supabase-kanban
- **Svelte Todos:** https://github.com/supabase/supabase/tree/master/examples/todo-list/sveltejs-todo-list

---

## Implementation Checklist

- [x] 1. Log into Supabase dashboard and verify project access
- [ ] 2. Set up environment variables in `.env.local`
- [ ] 3. Create Supabase client utility file
- [ ] 4. Implement authentication (login/signup)
- [ ] 5. Create/extend database tables and schema
- [ ] 6. Configure Row Level Security (RLS) policies
- [ ] 7. Set up storage buckets (if needed for file uploads)
- [ ] 8. Connect client app to Supabase
- [ ] 9. Test authentication flow
- [ ] 10. Implement realtime features (if needed)
- [ ] 11. Deploy edge functions (if needed)

---

## Supported Client Libraries

- **JavaScript/TypeScript:** `@supabase/supabase-js`
- **Flutter:** `supabase-flutter`
- **Python:** `supabase-py`
- **C#:** `supabase-csharp`
- **Swift:** `supabase-swift`
- **Kotlin:** `supabase-kt`

---

## Additional Resources

- **Main Documentation:** https://supabase.com/docs
- **API Reference:** https://supabase.com/docs/reference
- **API Settings:** https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/settings/api
- **GitHub Examples:** https://github.com/supabase/supabase/tree/master/examples

---

## Notes

- The public anon key is **safe to use in frontend code** when RLS is properly configured
- Use the service/admin key **only in backend/server environments** for admin operations
- Always test RLS policies to ensure proper data isolation between users
- Monitor usage and quotas in the Supabase dashboard

---

**Last Updated:** November 14, 2025
