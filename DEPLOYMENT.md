# Deployment Guide for RL Thumbnail Optimizer

## Quick Start (5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas account (free tier available)
- Node.js 18+

---

## Step 1: Local Setup

```bash
# Clone or init your repository
git init rl-thumbnail-optimizer
cd rl-thumbnail-optimizer

# Initialize git
git add .
git commit -m "Initial commit: Production-ready RL thumbnail optimizer"
```

### Create `.env.local` for development

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rl-optimizer?retryWrites=true&w=majority
OPENAI_API_KEY=sk-your-key-here
REPLICATE_API_TOKEN=your-token-here
BASE_URL=http://localhost:3000
```

### Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Step 2: Create GitHub Repository

### Option A: GitHub CLI

```bash
# Install GitHub CLI: https://cli.github.com
gh repo create rl-thumbnail-optimizer --public --source=. --remote=origin --push
```

### Option B: GitHub Web UI

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `rl-thumbnail-optimizer`
3. Description: `Thompson Sampling A/B testing for thumbnail optimization`
4. Choose **Public** (required for free Vercel deployment)
5. Click "Create repository"
6. Follow the "push an existing repository from the command line" instructions

```bash
git remote add origin https://github.com/YOUR_USERNAME/rl-thumbnail-optimizer.git
git branch -M main
git push -u origin main
```

---

## Step 3: MongoDB Atlas Setup

### Create Cluster

1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Sign up or log in
3. Click "Create Deployment" → "Build a cluster"
4. Select **M0 (Free)** tier
5. Choose AWS region closest to you
6. Click "Create Deployment"
7. Wait 5-10 minutes for cluster creation

### Get Connection String

1. Click "Connect" button
2. Choose "Drivers" → "Node.js"
3. Copy the connection string (looks like: `mongodb+srv://...`)
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `rl-optimizer`

**Example:**
```
mongodb+srv://admin:mypassword@cluster0.mongodb.net/rl-optimizer?retryWrites=true&w=majority
```

### Create Database User

1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Create username: `admin`
4. Create password: (auto-generate a strong one)
5. Default Role: **read and write to any database**
6. Click "Add User"

### Whitelist IP

1. Click "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0)
4. Confirm

---

## Step 4: API Keys

### OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy and save (you won't see it again)
4. Add $5-$20 credit to your account

### Replicate API Token

1. Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Click "Create token"
3. Copy and save

---

## Step 5: Deploy to Vercel

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

During deployment:
- Link to your GitHub repository
- Set up environment variables (see below)

### Option B: Vercel Web Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Paste: `https://github.com/YOUR_USERNAME/rl-thumbnail-optimizer.git`
5. Click "Continue"

### Configure Environment Variables in Vercel

In the **Environment Variables** section, add:

| Key | Value | Type |
|-----|-------|------|
| `MONGODB_URI` | `mongodb+srv://admin:password@cluster.mongodb.net/rl-optimizer?retryWrites=true&w=majority` | Secret |
| `OPENAI_API_KEY` | `sk-...` | Secret |
| `REPLICATE_API_TOKEN` | Your token | Secret |
| `BASE_URL` | `https://your-project.vercel.app` | Plaintext |

### Deploy

1. Click "Deploy"
2. Wait 3-5 minutes for build to complete
3. Visit your deployment URL

**Your app is live!** 🚀

---

## Step 6: Test Deployment

### Home Page
- URL: `https://your-project.vercel.app`
- Click "Run RL Selection"
- Click "Click" or "Conversion" buttons

### Dashboard
- URL: `https://your-project.vercel.app/dashboard`
- Watch metrics update in real-time
- Toggle auto-refresh

### API Endpoints
```bash
# Generate variants
curl -X POST https://your-project.vercel.app/api/generate

# Select variant
curl -X POST https://your-project.vercel.app/api/select \
  -H "Content-Type: application/json" \
  -d '{"variants": ["thumb-vibrant", "thumb-minimal"]}'

# Get metrics
curl https://your-project.vercel.app/api/metrics

# Optimize (cron job)
curl https://your-project.vercel.app/api/optimize
```

---

## Step 7: Configure Cron Jobs

Vercel automatically reads `vercel.json` for cron configuration.

Current config runs optimization every 6 hours:
```json
"crons": [
  {
    "path": "/api/optimize",
    "schedule": "0 */6 * * *"
  }
]
```

To modify frequency:
- Edit `vercel.json` `"schedule"` field
- Examples:
  - `"0 * * * *"` = Every hour
  - `"0 0 * * *"` = Daily at midnight UTC
  - `"0 */12 * * *"` = Every 12 hours

Push changes to GitHub:
```bash
git add vercel.json
git commit -m "Update cron schedule"
git push
```

Vercel will automatically redeploy.

---

## Step 8: Monitor & Debug

### View Logs
```bash
vercel logs <deployment-url>
```

### Check MongoDB Connections
1. MongoDB Atlas → "Monitoring" tab
2. Check "Connections" metric
3. Ensure connection pool is working

### Test API Routes
```bash
# Check if generate endpoint works
curl -X POST https://your-project.vercel.app/api/generate

# Check if database is connected
curl https://your-project.vercel.app/api/metrics
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "MongoDB connection failed" | Verify IP whitelist in MongoDB Atlas, check credentials in env vars |
| "Cannot find module" | Run `npm install` locally, push to GitHub, redeploy |
| "Database error" | Check MongoDB URI format, ensure `rl-optimizer` database exists |
| "Cold starts slow" | This is normal on free tier; upgrade to Pro for faster performance |

---

## Step 9: Continuous Deployment

Every push to `main` automatically redeploys:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Wait 2-5 minutes for automatic deployment
```

View deployments:
1. Vercel Dashboard → Your Project → "Deployments"
2. Each commit shows build status and logs

---

## Production Checklist

- [x] MongoDB cluster created and configured
- [x] Environment variables set in Vercel
- [x] API keys configured (OpenAI, Replicate)
- [x] GitHub repository created and pushed
- [x] Deployed to Vercel
- [x] Cron jobs configured
- [x] Tested all API endpoints
- [x] Verified dashboard loads and updates
- [ ] Set up error monitoring (optional: Sentry, DataDog)
- [ ] Configure custom domain (optional)
- [ ] Set up backups for MongoDB (optional)

---

## Custom Domain (Optional)

1. Register domain (GoDaddy, Namecheap, etc.)
2. Vercel Dashboard → Your Project → Settings → Domains
3. Add your domain
4. Update DNS records (follow Vercel's instructions)
5. Wait 24-48 hours for DNS propagation

---

## Performance Optimization

### Database Indexing
Add these indexes in MongoDB Atlas:

```javascript
// In MongoDB shell
use rl-optimizer

// Index on armId for fast arm lookups
db.arms.createIndex({ armId: 1 })

// Index on variant and createdAt for efficient event queries
db.events.createIndex({ variant: 1, createdAt: -1 })

// TTL index: auto-delete events older than 30 days
db.events.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
)
```

### Scaling
- **Free tier**: ~100 requests/day
- **Pro tier ($20/month)**: ~10,000 requests/day
- **Scale Pro**: Custom pricing for high traffic

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel
vercel logs

# Test locally
npm run build
npm run start
```

### Deployment Timeout
- Increase build timeout in Vercel settings
- Reduce bundle size by removing unused dependencies

### Database Connection Errors
```bash
# Test connection locally
node -e "const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
console.log('Connected!')"
```

### Environment Variables Not Loading
1. Verify variables are set in Vercel Dashboard
2. Redeploy after adding variables
3. Check `.env.local` is in `.gitignore`

---

## Next Steps

1. **Customize variants**: Edit `lib/image.ts` to change thumbnail styles
2. **Integrate with your service**: Call `/api/select` and `/api/track` from your app
3. **Add more metrics**: Extend `/api/metrics` to track custom KPIs
4. **Set up alerts**: Use Vercel analytics or third-party monitoring

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Thompson Sampling](https://en.wikipedia.org/wiki/Thompson_sampling)

---

**Deployed with ❤️ using Vercel, MongoDB, and Thompson Sampling**
