# Getting Started with Career Compass

## Quick Setup Guide (5 Minutes)

Follow these steps to get Career Compass running locally.

## Prerequisites

Ensure you have these installed:
- **Node.js 18+**: [Download here](https://nodejs.org/)
- **pnpm**: Install with `npm install -g pnpm`
- A **Supabase account**: [Sign up here](https://supabase.com)
- An **Anthropic API key**: [Get one here](https://console.anthropic.com/)

## Step-by-Step Setup

### 1. Install Dependencies (1 minute)

\`\`\`bash
cd career-compass
pnpm install
\`\`\`

### 2. Set Up Supabase (10-15 minutes)

**Follow the detailed guide**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick version**:
1. Create a new Supabase project
2. Copy your project URL and API keys
3. Enable Google OAuth in Authentication settings
4. Run the 3 SQL migration files in the SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_buckets.sql`

### 3. Configure Environment Variables (2 minutes)

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` and fill in your keys:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
ANTHROPIC_API_KEY=sk-ant-xxxxx...
RESEND_API_KEY=re_xxxxx...  # Optional for MVP
EMAIL_FROM=noreply@yourdomain.com  # Optional for MVP
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Start Development Server (30 seconds)

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### 5. Test Authentication (1 minute)

1. Click "Sign in with Google"
2. Authorize the app
3. You should land on the home page

## First Steps After Setup

### Upload Your First CV

1. Click **Studio** in the bottom navigation
2. Click **CV Studio**
3. Click **Upload Your CV**
4. Choose a DOCX or TXT file
5. Click **Upload CV**

### Tailor Your CV

1. After uploading, expand your CV card
2. Click **Tailor to Job**
3. Paste a job description
4. Click **Tailor CV**
5. Wait 10-30 seconds for AI processing

## Common Issues

### "Unauthorized" Error

**Cause**: Supabase keys are incorrect or RLS policies not applied

**Fix**:
1. Double-check `.env.local` has correct Supabase keys
2. Verify all 3 migration files ran successfully
3. Check RLS is enabled on all tables

### Google Sign-In Fails

**Cause**: OAuth redirect URI mismatch

**Fix**:
1. In Google Cloud Console, add `http://localhost:3000/auth/callback`
2. In Supabase dashboard, add the same to Redirect URLs
3. Clear browser cookies and try again

### CV Upload Fails

**Cause**: Storage buckets not created or policies missing

**Fix**:
1. Run `003_storage_buckets.sql` in Supabase SQL Editor
2. Verify buckets exist in Storage tab
3. Check that `cv-documents` bucket is private

### Tailoring Fails

**Cause**: Invalid Anthropic API key or rate limit

**Fix**:
1. Verify `ANTHROPIC_API_KEY` in `.env.local`
2. Test key at [console.anthropic.com](https://console.anthropic.com)
3. Check you have credits remaining

## Project Structure Overview

\`\`\`
career-compass/
├── app/                    # Pages and API routes
│   ├── api/cv/            # CV processing endpoints
│   ├── studio/cv/         # CV Studio page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── cv/               # CV-related components
│   └── navigation/       # Bottom nav
├── lib/                  # Utilities
│   ├── supabase/        # Database clients
│   └── redaction/       # PII protection
└── supabase/migrations/ # Database schema
\`\`\`

## What Works Now (MVP)

✅ **Authentication**
- Google sign-in
- Session management
- Automatic user profile creation

✅ **CV Studio**
- Upload DOCX/TXT files (PDF coming soon)
- Automatic text parsing
- Client-side PII redaction
- AI-powered CV tailoring
- Version history with job metadata

✅ **Privacy & Security**
- Row Level Security (RLS)
- Encrypted redaction maps
- PII tokenization
- Private storage buckets

## What's Coming Next

🚧 **Short-term** (Weeks 3-4)
- DOCX/PDF export
- Email-to-self feature
- Cover Letter Builder
- Path Finder (course evaluation)
- Settings page
- Data export

🔮 **Future**
- Journal Proposal Assistant
- Substack Creator
- Mindless Moments (drawing)
- Magic Prompt Helper
- Semantic search

## Development Commands

\`\`\`bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
\`\`\`

## Testing Checklist

Before deploying, test these flows:

- [ ] Sign in with Google
- [ ] Upload a CV (DOCX)
- [ ] View uploaded CV in "My CVs"
- [ ] Tailor CV to a job description
- [ ] View tailored version
- [ ] Sign out and sign back in
- [ ] Verify data persists

## Resources

- **Full README**: [README.md](./README.md)
- **Supabase Setup**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Build Status**: [BUILD_STATUS.md](./BUILD_STATUS.md)

## Need Help?

1. Check the troubleshooting section above
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify environment variables are correct

## Next Steps

After getting the basics working:

1. **Customize**: Update brand colors in `tailwind.config.ts`
2. **Add Features**: See PRD for additional tools
3. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Monitor**: Set up logging and alerts

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for Netlify deployment instructions.

**Questions about the architecture?** See [README.md](./README.md) for detailed documentation.

**Need help with Supabase?** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step instructions.
