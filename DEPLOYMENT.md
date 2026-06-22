# LinkedRank Deployment Guide - Railway

This guide walks you through deploying LinkedRank to [Railway](https://railway.app), a Platform-as-a-Service optimized for full-stack applications.

## Why Railway?

- **Fast setup** (~30 minutes)
- **Low complexity** - no Docker/infrastructure knowledge required
- **Persistent volumes** - needed for locally-stored generated images
- **Supports background workers** - auto-publish and agent scheduler run as in-process timers, which need an always-on process (rules out serverless platforms)
- **Git-based deploys** - push to deploy
- **Cost-effective** - ~$10-25/month for small-medium traffic

The database is **Supabase Postgres** (the same Supabase project already used for Auth) — no separate database add-on is needed on Railway. This has been migrated and verified end-to-end (schema pushed, seed data loaded, auth/session flow confirmed against the live Postgres DB).

---

## Prerequisites

Before starting, ensure you have:

- [ ] [Railway account](https://railway.app) (sign up with GitHub recommended)
- [ ] GitHub repository with your LinkedRank code
- [ ] A Supabase project (used for both Auth and the Postgres database)
- [ ] Required API credentials:
  - Stripe: secret key, publishable key, webhook secret
  - LinkedIn Developer app: client ID, client secret
  - LLM API key (OpenAI and/or Gemini)

---

## Step 1: Database (already migrated — verify, don't recreate)

The schema has already been pushed to Supabase Postgres and reseeded. To verify or redo from scratch:

1. From the Supabase dashboard: **Project Settings → Database → Connection string**. The current `.env` uses the **session pooler** connection (`aws-0-<region>.pooler.supabase.com:5432`), which is correct for an always-on app like this one (as opposed to the transaction pooler on port 6543, which doesn't support prepared statements well — `server/db.ts` already passes `{ prepare: false }` to the `postgres` client to stay compatible either way).
2. Schema: `pnpm db:push` (`drizzle-kit generate && drizzle-kit migrate`) against that `DATABASE_URL`.
3. Seed data: `node scripts/seed-influencers.mjs` and `node scripts/seed-posts.mjs` — both have been ported from the old `mysql2` driver to the `postgres` package and verified to insert correctly (29 influencers, 51 posts on the last run). No real user data needed migrating; this is reproducible seed content only.

**Known gap:** `scripts/remove-duplicates.mjs` and `scripts/update-influencers-db.mjs` are still on the old `mysql2` driver and will fail if run as-is. They're maintenance scripts, not part of the deploy path, so they weren't ported — fix them the same way (swap `mysql2` for the `postgres` package, see the diff in `seed-influencers.mjs`/`seed-posts.mjs` for the pattern) before relying on them again.

---

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if prompted
4. Select your LinkedRank repository
5. Railway auto-detects Node.js and begins initial setup

---

## Step 3: Attach a persistent volume

Generated images are written to local disk (`uploads/generated/`, served via `express.static`). Without a persistent volume, every redeploy/restart wipes them.

1. Click your app service → **"Settings"** → **"Volumes"**
2. Add a volume mounted at `/app/uploads` (the container's working directory is `/app`)

`@aws-sdk/client-s3` is a dependency in `package.json` but is never imported anywhere in `server/` — it's unused. No AWS credentials are needed.

---

## Step 4: Configure Environment Variables

Click on your app service → **"Variables"** tab → **"New Variable"**

### Core Configuration
```
NODE_ENV=production
PORT=3000
APP_URL=<your Railway domain, set after Step 6>
VITE_APP_URL=<same as APP_URL>
JWT_SECRET=<generate with: openssl rand -hex 32 — use a fresh value, don't reuse dev>
```

### Database
```
DATABASE_URL=<the Supabase Postgres connection string from Step 1>
```

### Supabase Auth
```
SUPABASE_URL=<from Supabase Project Settings → API>
SUPABASE_ANON_KEY=<from Supabase Project Settings → API>
VITE_SUPABASE_URL=<same as SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<same as SUPABASE_ANON_KEY>
```

### LinkedIn
```
LINKEDIN_CLIENT_ID=<your LinkedIn app client ID>
LINKEDIN_CLIENT_SECRET=<your LinkedIn app client secret>
LINKEDIN_REDIRECT_URI=https://<your-railway-domain>/api/linkedin/callback
```
Add this exact redirect URI to the LinkedIn Developer Portal's authorized redirect URLs.

### Stripe (Payments)
```
STRIPE_SECRET_KEY=<sk_live_... or sk_test_...>
VITE_STRIPE_PUBLISHABLE_KEY=<pk_live_... or pk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_... — set after Step 7>
```

### LLM API Keys
```
OPENAI_API_KEY=<your OpenAI key>
OPENAI_MODEL=gpt-4o
OPENAI_IMAGE_MODEL=dall-e-3
# and/or
GEMINI_API_KEY=<your Gemini key>
GEMINI_MODEL=gemini-2.5-flash
```

---

## Step 5: Configure Build & Start Commands

Click on your app service → **"Settings"** tab:

| Setting | Value |
|---------|-------|
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `node dist/index.js` |
| **Root Directory** | `/` (leave default) |

Keep replica count at **1**. The auto-publish worker and agent scheduler run as in-process timers with no cross-instance locking — running 2+ replicas would double-process scheduled publishes and agent tasks.

---

## Step 6: Generate Domain

1. Click on your app service → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Railway assigns a URL like `your-app-name.railway.app`
5. Go back to Step 4 and set `APP_URL`/`VITE_APP_URL`/`LINKEDIN_REDIRECT_URI` to this domain

### Custom Domain (Optional)
1. Click **"Custom Domain"**
2. Enter your domain (e.g., `app.linkedrank.com`)
3. Add the provided CNAME record to your DNS provider
4. Wait for DNS propagation (usually 5-30 minutes)

---

## Step 7: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.railway.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret to Railway's `STRIPE_WEBHOOK_SECRET` variable

---

## Step 8: Deploy

Railway automatically deploys when you:
- Push to your main branch
- Manually trigger via **"Deploy"** button in dashboard

### Monitor Deployment
1. Click **"Deployments"** tab
2. Watch build logs in real-time
3. Check for any errors

---

## Post-Deployment Checklist

### Verify Core Functionality
- [ ] Homepage loads at your Railway URL
- [ ] User registration/login works (Supabase `signInWithPassword`)
- [ ] Logging out actually clears the session (no 500) — this exercises a Node-WebSocket-vs-Supabase-Realtime fix in `server/_core/supabase.ts` (the `ws` package as transport, needed because Railway's Node runtime may be <22); confirm it's present in the deployed build
- [ ] Session persists across a page refresh
- [ ] LinkedIn OAuth connection succeeds
- [ ] Dashboard displays data (database connected — confirmed working: `posts.list` and `influencers.list` return seeded rows in dev)
- [ ] Content generation produces results (LLM connected)
- [ ] Generated images persist across a redeploy (volume mounted correctly)
- [ ] Stripe checkout works in test mode and the webhook updates the subscription

### Verify Background Services
- [ ] Auto-publish worker runs scheduled posts
- [ ] AI agents execute scheduled tasks
- [ ] Check logs for any worker errors

---

## Monitoring & Logs

### View Logs
- Click your service → **"Logs"** tab
- Filter by deployment or view live logs

### Metrics
- Railway shows CPU, memory, and network usage
- Set up alerts in **"Settings"** → **"Alerts"**

---

## Scaling

### Vertical Scaling
- Adjust memory/CPU in **"Settings"** → **"Resources"**

### Horizontal Scaling
- Not supported as-is — see the replica-count note in Step 5. Decoupling the background workers into a separate process with locking/queueing would be required first.

---

## Estimated Costs

| Resource | Monthly Cost |
|----------|-------------|
| App Service | $5-15 (usage-based) |
| Supabase | Free tier covers small projects; paid tiers start ~$25/month |
| **Total** | **~$10-25 + Supabase** |

> Railway Hobby plan includes $5 free credit monthly.

---

## Troubleshooting

### Build Fails
- Check build logs for specific errors
- Ensure `pnpm-lock.yaml` is committed
- Verify Node.js version compatibility

### Database Connection Error
- Verify `DATABASE_URL` is set to a valid Supabase Postgres connection string (session pooler or direct, not the transaction pooler unless you also adjust prepared-statement handling)
- Check the Supabase project is active (not paused on the free tier)

### App Crashes on Start
- Check start command is `node dist/index.js`
- Verify all required env variables are set
- Check logs for missing dependencies

### Generated images disappear after deploy
- Confirm the persistent volume from Step 3 is mounted at `/app/uploads`

### Puppeteer/Infographic Issues
- Railway supports Puppeteer, but may need additional config
- Add to environment: `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- Install Chromium via nixpacks: create `nixpacks.toml`:
  ```toml
  [phases.setup]
  nixPkgs = ["chromium"]

  [variables]
  PUPPETEER_EXECUTABLE_PATH = "/nix/store/chromium/bin/chromium"
  ```

---

## Rollback

If a deployment causes issues:

1. Go to **"Deployments"** tab
2. Find the last working deployment
3. Click **"..."** → **"Rollback"**

---

## Local Development with Docker (Optional)

For local development matching production:

### Dockerfile
```dockerfile
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

> Node 22+ has native `WebSocket` support, avoiding the Supabase Realtime workaround needed on Node 20. If you must run Node 20, the `ws`-package fallback in `server/_core/supabase.ts` handles it.

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=<your Supabase Postgres connection string>
      - JWT_SECRET=dev-secret-change-in-production
    volumes:
      - uploads_data:/app/uploads

volumes:
  uploads_data:
```

### Run Locally
```bash
docker-compose up --build
```

---

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Supabase Documentation](https://supabase.com/docs)
- [LinkedRank Issues](https://github.com/your-repo/issues)
