# Supabase Setup Instructions for Career Compass

This guide will walk you through setting up Supabase for Career Compass, including authentication, database tables, Row Level Security (RLS), and storage buckets.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign in (or create an account)
3. Click "New Project"
4. Fill in the details:
   - **Project name**: `career-compass` (or your preferred name)
   - **Database password**: Create a strong password and save it securely
   - **Region**: Choose the closest region to your users
   - **Pricing plan**: Free tier is sufficient for MVP
5. Click "Create new project"
6. Wait 1-2 minutes for the project to be provisioned

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (starts with `eyJ...`)
   - **service_role key**: Click "Reveal" and copy this (starts with `eyJ...`)

4. Create a `.env.local` file in your project root and add these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
```

⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 3: Enable Google Authentication

1. In your Supabase project, go to **Authentication** > **Providers**
2. Find **Google** in the list
3. Toggle it to **Enabled**
4. You'll need to set up a Google OAuth app:

### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the consent screen if prompted:
   - User Type: **External**
   - App name: **Career Compass**
   - User support email: Your email
   - Developer contact: Your email
6. Choose **Web application**
7. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
   - **Supabase callback**: `https://xxxxx.supabase.co/auth/v1/callback`
     (Replace `xxxxx` with your project reference)
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**
10. Go back to Supabase and paste these into the Google provider settings
11. Click **Save**

## Step 4: Run Database Migrations

You need to create all the database tables with proper Row Level Security policies.

### Option A: Using Supabase Dashboard (Easiest)

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `/supabase/migrations/001_initial_schema.sql` (we'll create this next)
4. Click **Run**
5. Repeat for `002_rls_policies.sql` and `003_storage_buckets.sql`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Step 5: Enable pgvector Extension

Career Compass uses pgvector for semantic search (embeddings).

1. Go to **Database** > **Extensions**
2. Search for **vector**
3. Enable the **vector** extension
4. Click **Confirm**

## Step 6: Create Storage Buckets

1. Go to **Storage** in the sidebar
2. Click **New bucket**
3. Create the following buckets:
   - **Name**: `cv-documents`
   - **Public**: ❌ (unchecked)
   - Click **Save**
4. Repeat for:
   - `cover-letters`
   - `exports`

### Configure Bucket Policies

For each bucket, you need to add RLS policies:

1. Click on the bucket name
2. Go to **Policies**
3. Click **New Policy**
4. Use **Template** > **Allow authenticated users to upload**
5. Repeat with **Allow users to read their own files**

Or use the SQL from `003_storage_buckets.sql` in the SQL Editor.

## Step 7: Verify Your Setup

1. Check that all tables exist:
   - Go to **Table Editor**
   - You should see: `users`, `profile`, `docs`, `embeddings`, `sessions`, `messages`, `letters`, `cv_versions`

2. Check RLS is enabled:
   - Each table should show a shield icon (RLS enabled)

3. Check storage buckets:
   - Go to **Storage**
   - You should see: `cv-documents`, `cover-letters`, `exports`

## Step 8: Configure CORS (if needed)

If you plan to call Supabase from a custom domain:

1. Go to **Settings** > **API**
2. Scroll to **CORS Settings**
3. Add your domain(s)

## Step 9: Test Authentication

1. Start your Next.js development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000`
3. Try to sign in with Google
4. Check that a user was created in **Authentication** > **Users**

## Troubleshooting

### Google OAuth not working
- Check that redirect URIs match exactly (including http vs https)
- Verify the OAuth consent screen is configured
- Make sure the Google OAuth app is in "Testing" or "Published" state

### "Invalid API key" error
- Double-check your `.env.local` file has correct values
- Restart your development server after changing `.env.local`
- Make sure there are no spaces around the `=` sign

### RLS blocking queries
- Check the policies in each table
- Verify the user is authenticated: `supabase.auth.getUser()`
- Check that `user_id` matches `auth.uid()`

### Can't upload files
- Verify storage buckets exist and are private
- Check bucket policies allow authenticated uploads
- File size limit is 50MB by default (can be increased in settings)

## Security Checklist

Before deploying to production:

- ✅ All tables have RLS enabled
- ✅ Service role key is NEVER exposed in browser code
- ✅ Google OAuth redirect URIs include production domain
- ✅ Storage buckets are private (not public)
- ✅ Anon key rate limiting is enabled (default)
- ✅ Database password is strong and stored securely

## Next Steps

After completing this setup:

1. Run the database migrations (Step 4)
2. Test authentication locally
3. Deploy to Netlify
4. Update OAuth redirect URIs for production
5. Update `.env` on Netlify with production values

## Useful Commands

```bash
# Generate TypeScript types from your Supabase schema
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.ts

# View local Supabase logs (if using local dev)
supabase start
supabase logs

# Reset local database
supabase db reset
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Buckets](https://supabase.com/docs/guides/storage)
