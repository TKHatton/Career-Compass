# Deployment Guide - Career Compass

This guide covers deploying Career Compass to Netlify.

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed Supabase setup (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- ✅ Tested the app locally with `pnpm dev`
- ✅ Verified authentication works locally
- ✅ Obtained all required API keys (Anthropic, Resend)
- ✅ Pushed your code to a GitHub repository

## Step 1: Prepare for Deployment

### 1.1 Update OAuth Redirect URIs

In your Google Cloud Console OAuth app, add production redirect URIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   - `https://your-site-name.netlify.app/auth/callback`
   - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - (You'll know the exact Netlify URL after deployment)
4. Save

### 1.2 Verify Supabase Configuration

1. In Supabase dashboard → Authentication → URL Configuration
2. Add your production site URL to "Site URL"
3. Add your production callback URL to "Redirect URLs"

## Step 2: Deploy to Netlify

### Method 1: Netlify UI (Recommended for First Deploy)

1. **Sign in to Netlify**: Go to [app.netlify.com](https://app.netlify.com)

2. **Import Project**:
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub repos
   - Select the `career-compass` repository

3. **Configure Build Settings**:
   - **Build command**: `pnpm build`
   - **Publish directory**: `.next`
   - **Node version**: 18 or higher

4. **Add Environment Variables**:
   Click "Add environment variables" and add ALL of these:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ANTHROPIC_API_KEY=sk-ant-your-api-key
   RESEND_API_KEY=re_your-api-key
   EMAIL_FROM=noreply@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
   ```

   ⚠️ **Important**: Replace `your-site.netlify.app` with your actual Netlify URL (shown after first deploy)

5. **Deploy**: Click "Deploy site"

6. **Wait for Build**: First build takes 2-5 minutes

### Method 2: Netlify CLI (Advanced)

\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link your site (from project root)
netlify init

# Deploy
netlify deploy --prod
\`\`\`

## Step 3: Post-Deployment Configuration

### 3.1 Update OAuth Redirect URI

After your first deployment, Netlify assigns you a URL (e.g., `https://career-compass-abc123.netlify.app`).

1. Copy your Netlify URL
2. Go back to Google Cloud Console → OAuth settings
3. Update the redirect URI with your actual Netlify URL
4. Also update in Supabase Auth settings

### 3.2 Update Environment Variable

In Netlify:
1. Go to Site settings → Environment variables
2. Edit `NEXT_PUBLIC_APP_URL`
3. Set it to your Netlify URL
4. Click "Save"
5. Trigger a redeploy

### 3.3 Test Authentication

1. Visit your deployed site
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you're redirected to the home page

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain in Netlify

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow instructions to configure DNS

### 4.2 Update All Redirect URIs

Once your custom domain is active:

1. Update Google OAuth redirect URIs
2. Update Supabase Auth URLs
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Redeploy

## Step 5: Enable HTTPS

Netlify automatically provisions SSL certificates. Ensure:

1. Site settings → Domain management → HTTPS
2. "Force HTTPS" is enabled
3. Certificate status shows "Active"

## Step 6: Monitoring and Logs

### View Build Logs

1. Netlify dashboard → Deploys
2. Click on latest deploy
3. View build logs for errors

### View Function Logs

1. Netlify dashboard → Functions
2. Click on a function
3. View logs for API route errors

### Supabase Logs

1. Supabase dashboard → Logs
2. Check for authentication errors
3. Monitor RLS policy violations

## Troubleshooting

### Build fails with "Module not found"

**Solution**: Ensure all dependencies are in `package.json`

\`\`\`bash
pnpm install
git add package.json pnpm-lock.yaml
git commit -m "Update dependencies"
git push
\`\`\`

### OAuth redirect URI mismatch

**Symptoms**: Error during Google sign-in

**Solution**:
1. Check Google OAuth settings match Netlify URL exactly
2. Ensure Supabase Auth URLs are updated
3. Clear browser cookies and try again

### Environment variables not working

**Symptoms**: "Unauthorized" or API errors

**Solution**:
1. Verify all env vars are set in Netlify
2. Variables starting with `NEXT_PUBLIC_` are accessible in browser
3. Other variables are server-only
4. Redeploy after adding/changing variables

### Function timeout errors

**Symptoms**: CV tailoring fails

**Solution**:
1. Check Anthropic API key is valid
2. Verify API rate limits not exceeded
3. Check Netlify function timeout (default 10s, max 26s on Pro)

### RLS policy blocks requests

**Symptoms**: Database queries fail

**Solution**:
1. Check Supabase RLS policies
2. Verify user is authenticated
3. Test queries in Supabase SQL editor as authenticated user

## Continuous Deployment

Netlify automatically deploys when you push to your main branch.

\`\`\`bash
# Make changes
git add .
git commit -m "Update feature X"
git push

# Netlify deploys automatically
# Watch progress in Netlify dashboard
\`\`\`

## Rollback

If a deployment breaks something:

1. Go to Netlify dashboard → Deploys
2. Find the last working deploy
3. Click "⋯" → "Publish deploy"

## Performance Optimization

### Enable Analytics (Optional)

For performance monitoring, you can integrate analytics tools compatible with your hosting platform (Netlify Analytics, Google Analytics, etc.).

### Enable Caching

Netlify automatically caches static assets. For API routes:

1. Use appropriate cache headers
2. Consider Netlify Edge Functions for lowest latency

## Security Checklist

Before going live:

- [ ] All environment variables set in Netlify
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only (no NEXT_PUBLIC_ prefix)
- [ ] Google OAuth configured correctly
- [ ] Supabase RLS policies tested
- [ ] Storage buckets are private
- [ ] HTTPS enabled and forced
- [ ] Security headers configured (see netlify.toml)
- [ ] `.env.local` not committed to git

## Cost Estimates

### Netlify (Free Tier)
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Functions: 125k requests/month

### Supabase (Free Tier)
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50k monthly active users

### Anthropic
- Pay per token
- Sonnet 3.5: ~$3 per million input tokens
- Estimated: $0.01-0.05 per CV tailoring

### Resend (Free Tier)
- 100 emails/day
- 3,000 emails/month

**Total MVP Cost**: $0-5/month (assuming light usage)

## Monitoring

### Set Up Alerts

1. Netlify: Site → Notifications → Add notification
2. Supabase: Project Settings → Integrations
3. Monitor email delivery in Resend dashboard

### Analytics

For MVP, monitor:
- Netlify bandwidth usage
- Supabase database size
- Function execution count
- API errors

## Support

If deployment fails:

1. Check [Netlify Status](https://www.netlifystatus.com/)
2. Review build logs carefully
3. Test locally first: `pnpm build && pnpm start`
4. Check Supabase dashboard for errors
5. Verify all environment variables

## Next Steps After Deployment

1. Test all features in production
2. Monitor logs for first 24 hours
3. Set up error tracking (optional: Sentry)
4. Create regular database backups
5. Document any production-specific issues

---

Congratulations! Your Career Compass app is now live! 🎉
