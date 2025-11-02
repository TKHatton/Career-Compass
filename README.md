# Career Compass - Coddle Coddle

A private, secure career management workspace built with Next.js, Supabase, and Anthropic Claude.

## Features

- **CV Studio**: Upload, tailor, and manage CVs with AI assistance
- **Privacy-First**: Client-side PII redaction, encryption at rest, and Row Level Security
- **Google Authentication**: Secure single sign-on via Supabase Auth
- **AI-Powered Tailoring**: Uses Anthropic Claude to tailor CVs to job descriptions
- **Version History**: Track all CV iterations with metadata
- **Cross-Device**: Progressive Web App (PWA) support for mobile and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth (Google OAuth)
- **Storage**: Supabase Storage
- **AI**: Anthropic Claude (Sonnet 3.5)
- **Email**: Resend
- **Document Processing**: mammoth (DOCX parsing)

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Anthropic API key
- Resend account (for email features)
- Google Cloud Console (for OAuth)

## Quick Start

### 1. Clone and Install

\`\`\`bash
cd career-compass
pnpm install
\`\`\`

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md):

1. Create a Supabase project
2. Get your API keys
3. Enable Google OAuth
4. Run database migrations
5. Create storage buckets

### 3. Configure Environment Variables

Copy the example environment file and fill in your values:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` with your actual keys:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Resend
RESEND_API_KEY=re_your-api-key
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test Authentication

1. Click "Sign in with Google"
2. Complete the OAuth flow
3. You'll be redirected to the home page

## Project Structure

\`\`\`
career-compass/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── cv/
│   │       ├── parse/        # Document parsing
│   │       └── tailor/       # AI tailoring
│   ├── auth/                 # Authentication pages
│   ├── studio/               # Studio pages
│   │   └── cv/               # CV Studio
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── cv/                   # CV-specific components
│   ├── navigation/           # Navigation components
│   └── scripture/            # Scripture tile
├── lib/                      # Utility libraries
│   ├── supabase/             # Supabase clients
│   ├── redaction/            # PII detection & redaction
│   ├── model/                # AI model integrations
│   └── export/               # Document export utilities
├── types/                    # TypeScript types
├── supabase/                 # Supabase migrations
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_storage_buckets.sql
├── public/                   # Static assets
└── .env.local.example        # Environment template
\`\`\`

## Key Features Implementation

### CV Studio Flow

1. **Upload**: User uploads DOCX/PDF/TXT file
2. **Parse**: Server extracts text using mammoth
3. **Redact**: Client-side PII detection and tokenization
4. **Encrypt**: Redaction map encrypted with WebCrypto
5. **Store**: Encrypted data stored in Supabase with RLS
6. **Tailor**: User provides job description
7. **AI Processing**: Claude tailors CV with redacted text
8. **Rehydrate**: PII tokens replaced with original values
9. **Save**: Tailored version saved with metadata

### Privacy & Security

- **Client-Side Redaction**: PII never sent to AI in plaintext
- **Encryption**: Redaction maps encrypted with AES-256-GCM
- **Row Level Security**: Database policies ensure user isolation
- **Private Storage**: All buckets require authentication
- **No Logging**: AI provider configured for no training/minimal logging

## Database Schema

### Core Tables

- `users`: User accounts (extends auth.users)
- `profile`: User preferences, goals, encrypted redaction map
- `docs`: Uploaded documents with encrypted metadata
- `cv_versions`: Tailored CV versions with job metadata
- `letters`: Generated cover letters
- `sessions`: Chat sessions (for future features)
- `messages`: Chat messages (for future features)
- `embeddings`: Vector embeddings (for future semantic search)

### Storage Buckets

- `cv-documents`: Original CV files
- `cover-letters`: Generated cover letters
- `exports`: DOCX/PDF exports

## Development Commands

\`\`\`bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run type checking
pnpm type-check

# Run linter
pnpm lint
\`\`\`

## Deployment to Netlify

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push code to GitHub
2. Connect repository to Netlify
3. Configure environment variables
4. Deploy

## Environment Variables (Production)

When deploying, ensure these environment variables are set in Netlify:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Troubleshooting

### "Unauthorized" errors
- Check that Supabase environment variables are correct
- Verify RLS policies are enabled
- Ensure user is authenticated

### CV upload fails
- Check file type is supported (DOCX, DOC, TXT)
- Verify storage bucket exists and has correct policies
- Check file size is under 50MB

### Tailoring fails
- Verify Anthropic API key is set
- Check API rate limits
- Review server logs for errors

### Build errors
- Run `pnpm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (18+)

## Roadmap

### MVP (Weeks 1-2) ✅
- [x] Authentication
- [x] CV Studio upload
- [x] CV parsing
- [x] PII redaction
- [x] CV tailoring with AI
- [x] Version history

### Coming Soon (Weeks 3-4)
- [ ] DOCX/PDF export
- [ ] Email-to-self
- [ ] Cover Letter Builder
- [ ] Path Finder (course evaluation)
- [ ] Settings page
- [ ] Data export
- [ ] Delete account

### Future Features
- [ ] Journal Proposal Assistant
- [ ] Substack Creator
- [ ] Mindless Moments (drawing canvas)
- [ ] Magic Prompt Helper
- [ ] Semantic search with pgvector

## Contributing

This is a single-user private app. Contributions are not currently accepted.

## License

Private project. All rights reserved.

## Support

For issues or questions:
1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. Review [BUILD_STATUS.md](./BUILD_STATUS.md)
3. Check environment variables in `.env.local`

## Security

- Never commit `.env.local` to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-only)
- Rotate API keys regularly
- Monitor Supabase logs for suspicious activity

## Acknowledgments

- Built with Next.js, Supabase, and Anthropic Claude
- Brand colors provided by stakeholder
- Privacy-first design principles from PRD
