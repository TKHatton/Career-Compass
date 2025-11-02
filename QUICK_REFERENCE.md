# Career Compass - Quick Reference Card

## Essential Commands

\`\`\`bash
# Development
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm type-check             # TypeScript validation
pnpm lint                   # Run ESLint

# Supabase (if using CLI)
supabase start             # Start local Supabase
supabase stop              # Stop local Supabase
supabase db reset          # Reset database
supabase gen types typescript --project-id YOUR_ID > types/database.ts
\`\`\`

## Environment Variables

\`\`\`bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# Anthropic (REQUIRED for CV tailoring)
ANTHROPIC_API_KEY=sk-ant-xxxxx...

# Resend (Optional for email features)
RESEND_API_KEY=re_xxxxx...
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
\`\`\`

## Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Supabase Dashboard | https://supabase.com/dashboard | Manage database, auth, storage |
| Anthropic Console | https://console.anthropic.com | Get API keys, check usage |
| Google Cloud Console | https://console.cloud.google.com | OAuth settings |
| Netlify Dashboard | https://app.netlify.com | Deployment, env vars |
| Resend Dashboard | https://resend.com/overview | Email delivery monitoring |

## Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts (extends auth.users) |
| profile | User goals, values, encrypted redaction map |
| docs | Uploaded document metadata |
| cv_versions | Tailored CV versions with job metadata |
| letters | Generated cover letters |
| sessions | Chat sessions (future use) |
| messages | Chat messages (future use) |
| embeddings | Vector embeddings (future use) |

## Storage Buckets

| Bucket | Purpose | Max Size |
|--------|---------|----------|
| cv-documents | Original CV uploads | 50MB |
| cover-letters | Generated letters | 10MB |
| exports | DOCX/PDF exports | 50MB |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/cv/parse | POST | Parse DOCX/TXT to text |
| /api/cv/tailor | POST | Tailor CV with AI |
| /api/cv/compare | GET | Generate diff (TODO) |
| /api/letter/generate | POST | Generate cover letter (TODO) |
| /api/email/send | POST | Email document (TODO) |

## File Structure Cheat Sheet

\`\`\`
career-compass/
├── app/                       # Pages & API
│   ├── api/cv/               # CV endpoints
│   ├── studio/cv/            # CV Studio UI
│   ├── auth/                 # Login/callback
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home
├── components/
│   ├── cv/                   # CV components
│   │   ├── CVUploader.tsx
│   │   ├── CVList.tsx
│   │   └── CVTailor.tsx
│   ├── navigation/
│   │   └── BottomNav.tsx
│   └── scripture/
│       └── ScriptureTile.tsx
├── lib/
│   ├── supabase/            # DB clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── redaction/           # Privacy
│   │   ├── pii-detector.ts
│   │   ├── redactor.ts
│   │   └── crypto.ts
│   └── export/              # TODO
├── types/
│   ├── database.ts          # Supabase types
│   └── index.ts             # App types
├── supabase/migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   └── 003_storage_buckets.sql
└── public/
    ├── manifest.json        # PWA config
    └── icons/              # App icons
\`\`\`

## Brand Colors

\`\`\`css
Sand Rose:  #dfcfc5  (primary background)
Mist Teal:  #c5d4d2  (accent, cards)
Sage Gray:  #adb9b1  (secondary text, borders)
Clay Rose:  #c4a092  (CTA buttons, active states)
White:      #ffffff
Black:      #000000
\`\`\`

Tailwind classes: `bg-sand-rose`, `text-clay-rose`, etc.

## Common Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| "Unauthorized" | Check .env.local Supabase keys |
| Google OAuth fails | Update redirect URIs in Google Console |
| RLS blocks query | Check user is authenticated |
| Build fails | Run `pnpm install`, delete .next/, rebuild |
| CV upload fails | Verify storage bucket exists & has policies |
| Tailor fails | Check Anthropic API key, credits |

## Testing Checklist

\`\`\`bash
# Quick smoke test
1. pnpm dev
2. Navigate to http://localhost:3000
3. Sign in with Google
4. Upload a CV (DOCX or TXT)
5. Tailor to a job description
6. Verify version appears in list
\`\`\`

## Deployment Steps (Netlify)

\`\`\`bash
1. Push code to GitHub
2. Link repo in Netlify
3. Set build command: pnpm build
4. Set publish dir: .next
5. Add all environment variables
6. Deploy!
7. Update OAuth redirect URIs with production URL
8. Redeploy
\`\`\`

## Important Notes

⚠️ **Never commit** `.env.local` to git
⚠️ **Never expose** `SUPABASE_SERVICE_ROLE_KEY` in browser code
⚠️ Always test authentication after changing OAuth settings
⚠️ Redeploy Netlify after changing environment variables
⚠️ Ensure RLS is enabled on ALL tables before deploying

## Support Resources

| Resource | Link |
|----------|------|
| Full Setup Guide | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| Supabase Setup | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) |
| Deployment Guide | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Architecture Docs | [README.md](./README.md) |
| Project Status | [BUILD_STATUS.md](./BUILD_STATUS.md) |
| Summary | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |

## Quick Debugging

\`\`\`bash
# Check logs
# Browser: F12 → Console
# Supabase: Dashboard → Logs → API/Database
# Netlify: Dashboard → Functions → Logs

# Common checks
- Is .env.local correct?
- Are all migrations applied?
- Is RLS enabled?
- Are storage buckets created?
- Is OAuth configured?
- Does user have API credits?
\`\`\`

## Version Info

- Next.js: 14.2.33
- React: 18.3.1
- TypeScript: 5.9.3
- Supabase JS: 2.78.0
- Anthropic SDK: 0.68.0
- Node: 18+ required

---

**Keep this handy!** Most common commands and fixes are here.
