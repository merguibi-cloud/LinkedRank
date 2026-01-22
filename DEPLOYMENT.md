# LinkedRank Deployment Guide - Railway

This guide walks you through deploying LinkedRank to [Railway](https://railway.app), a Platform-as-a-Service optimized for full-stack applications.

## Why Railway?

- **Fast setup** (~30 minutes)
- **Low complexity** - no Docker/infrastructure knowledge required
- **Built-in MySQL** - one-click database provisioning
- **Supports background workers** - auto-publish and agent scheduler work out of the box
- **Git-based deploys** - push to deploy
- **Cost-effective** - ~$10-25/month for small-medium traffic

---

## Prerequisites

Before starting, ensure you have:

- [ ] [Railway account](https://railway.app) (sign up with GitHub recommended)
- [ ] GitHub repository with your LinkedRank code
- [ ] Required API credentials:
  - Manus OAuth: `VITE_APP_ID`, `OAUTH_SERVER_URL`
  - Stripe: secret key, publishable key, webhook secret
  - AWS S3: access key, secret key, bucket name, region
  - LLM API key (OpenAI or Anthropic)

---

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if prompted
4. Select your LinkedRank repository
5. Railway auto-detects Node.js and begins initial setup

---

## Step 2: Add MySQL Database

1. In your Railway project dashboard, click **"New"**
2. Select **"Database"** → **"MySQL"**
3. Railway provisions the database automatically
4. Click on the MySQL service → **"Variables"** tab
5. Copy the `DATABASE_URL` (you'll need this in Step 3)

---

## Step 3: Configure Environment Variables

Click on your app service → **"Variables"** tab → **"New Variable"**

Add the following variables:

### Core Configuration
```
NODE_ENV=production
PORT=3000
```

### Database
```
DATABASE_URL=<paste from MySQL service, or use Railway's variable reference: ${{MySQL.DATABASE_URL}}>
```

### Authentication
```
JWT_SECRET=<generate with: openssl rand -hex 32>
VITE_APP_ID=<your-manus-app-id>
OAUTH_SERVER_URL=<your-oauth-server-url>
```

### AWS S3 (Image Storage)
```
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_S3_BUCKET=<your-bucket-name>
AWS_REGION=<your-region, e.g., eu-west-1>
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=<sk_live_... or sk_test_...>
STRIPE_PUBLISHABLE_KEY=<pk_live_... or pk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>
```

### LLM API Keys
```
OPENAI_API_KEY=<your-openai-key>
# OR
ANTHROPIC_API_KEY=<your-anthropic-key>
```

> **Tip:** Use Railway's variable references to link services. For example, set `DATABASE_URL` to `${{MySQL.DATABASE_URL}}` to automatically use the MySQL connection string.

---

## Step 4: Configure Build & Start Commands

Click on your app service → **"Settings"** tab:

| Setting | Value |
|---------|-------|
| **Build Command** | `pnpm install && pnpm db:push && pnpm build` |
| **Start Command** | `node dist/index.js` |
| **Root Directory** | `/` (leave default) |

---

## Step 5: Generate Domain

1. Click on your app service → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Railway assigns a URL like `your-app-name.railway.app`

### Custom Domain (Optional)
1. Click **"Custom Domain"**
2. Enter your domain (e.g., `app.linkedrank.com`)
3. Add the provided CNAME record to your DNS provider
4. Wait for DNS propagation (usually 5-30 minutes)

---

## Step 6: Deploy

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
- [ ] User registration/login works
- [ ] LinkedIn OAuth connection succeeds
- [ ] Dashboard displays data (database connected)
- [ ] Content generation produces results (LLM connected)
- [ ] Image uploads work (S3 connected)
- [ ] Stripe checkout works in test mode

### Verify Background Services
- [ ] Auto-publish worker runs scheduled posts
- [ ] AI agents execute scheduled tasks
- [ ] Check logs for any worker errors

### Configure Stripe Webhook
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.railway.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret to Railway `STRIPE_WEBHOOK_SECRET` variable

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

### Horizontal Scaling (Pro Plan)
- Add replicas for high availability
- Configure load balancing

---

## Estimated Costs

| Resource | Monthly Cost |
|----------|-------------|
| App Service | $5-15 (usage-based) |
| MySQL Database | $5-10 |
| **Total** | **~$10-25** |

> Railway Hobby plan includes $5 free credit monthly.

---

## Troubleshooting

### Build Fails
- Check build logs for specific errors
- Ensure `pnpm-lock.yaml` is committed
- Verify Node.js version compatibility

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check MySQL service is running
- Try using variable reference: `${{MySQL.DATABASE_URL}}`

### App Crashes on Start
- Check start command is `node dist/index.js`
- Verify all required env variables are set
- Check logs for missing dependencies

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
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

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
      - DATABASE_URL=mysql://root:password@db:3306/linkedrank
      - JWT_SECRET=dev-secret-change-in-production
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: linkedrank
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### Run Locally
```bash
docker-compose up --build
```

---

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [LinkedRank Issues](https://github.com/your-repo/issues)
