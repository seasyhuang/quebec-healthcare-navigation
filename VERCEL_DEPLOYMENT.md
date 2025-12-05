# Vercel Deployment Guide

This guide will walk you through deploying your Québec Healthcare Navigation app to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com) - free tier is fine)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Your Gemini API key ready (from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub/GitLab/Bitbucket

If you haven't already, initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

### Step 2: Import Project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

1. In the project import screen, expand **"Environment Variables"**
2. Add the following variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from Google AI Studio
   - **Environment**: Select all (Production, Preview, Development)
3. Click **"Add"**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

### Step 5: Update Domain (Optional)

- Go to your project settings → **Domains**
- Add a custom domain if you have one

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts. When asked about environment variables, you can:
- Add them now: Type `GEMINI_API_KEY` and paste your key
- Or add them later in the Vercel dashboard

For production deployment:

```bash
vercel --prod
```

### Step 4: Set Environment Variables (if not done during deploy)

```bash
vercel env add GEMINI_API_KEY
```

Select all environments when prompted, then paste your API key.

Redeploy to apply changes:

```bash
vercel --prod
```

## Environment Variables Setup

Make sure `GEMINI_API_KEY` is set in Vercel:

1. Go to your project on Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify `GEMINI_API_KEY` exists for all environments

## Automatic Deployments

Once connected to Git:
- **Every push to `main` branch** → Deploys to production
- **Every push to other branches** → Creates a preview deployment
- **Pull requests** → Creates a preview deployment with a unique URL

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

### API Route Not Working

- Check that `GEMINI_API_KEY` is set in Environment Variables
- Verify the variable name matches exactly (case-sensitive)
- Check function logs in Vercel dashboard: **Functions** tab

### Environment Variables Not Working

- Make sure you added them for the correct environment (Production/Preview/Development)
- Redeploy after adding/changing environment variables
- Check function logs for error messages

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Pull environment variables to local .env file
vercel env pull .env.local
```

## Project Configuration

The project is already configured for Vercel:
- ✅ Next.js 15 is fully supported
- ✅ TypeScript is configured
- ✅ Build script is set (`next build`)
- ✅ `.gitignore` excludes environment files
- ✅ Vercel Analytics and Speed Insights are installed (if you want to enable them)

## Next Steps

After deployment:
1. Test your API route to ensure Gemini integration works
2. Monitor function logs for any issues
3. Set up a custom domain (optional)
4. Enable Vercel Analytics if desired

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

