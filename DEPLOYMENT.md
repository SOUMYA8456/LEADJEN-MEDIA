# LEADJEN MEDIA — PRODUCTION & STAGING DEPLOYMENT MANUAL
**Release Version:** `v1.0.0` (Release Candidate)  
**Framework:** Next.js 14.2.35 (App Router)  
**Database:** PostgreSQL 15+ via Prisma ORM v5.22.0  

---

## 1. Prerequisites & System Architecture

- **Node.js**: v18.17.0+ or v20.x LTS
- **Package Manager**: npm v9+
- **Database**: PostgreSQL 15+ (Neon, Supabase, AWS RDS, Prisma Accelerate, or Managed PostgreSQL)
- **Deployment Platform**: Vercel, Node.js Container (Docker), or Standalone Node.js Server

---

## 2. Environment Variables Configuration

Copy `.env.example` to configure your environment:

```bash
cp .env.example .env.production
```

### Required Variables:
| Variable Name | Description | Example / Notes |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/leadjen_news?sslmode=require` |
| `DIRECT_URL` | Direct connection string for migrations | Required if using PgBouncer / Prisma Accelerate |
| `JWT_SECRET` | 32+ byte cryptographic secret for admin sessions | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Public production HTTPS origin | `https://leadjen-media-news.vercel.app` |
| `CRON_SECRET` | Token protecting `/api/cron/publish` | Secure random string |
| `NODE_ENV` | Runtime mode | `production` |

### Optional Media & Notification Services:
| Variable Name | Description | Fallback Behavior |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | Automatic PostgreSQL byte storage fallback |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Automatic PostgreSQL byte storage fallback |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Automatic PostgreSQL byte storage fallback |
| `SMTP_HOST` | SMTP Server Hostname | Local logging fallback |
| `SMTP_PORT` | SMTP Port (`587` / `465`) | Default `587` |
| `SMTP_USER` | SMTP Username | — |
| `SMTP_PASSWORD` | SMTP Password | — |
| `SMTP_FROM` | Outgoing editorial sender email | `editorial@leadjenmedia.com` |

---

## 3. Database Deployment & Migration Procedure

### Safe Production Migration (Non-Destructive):
```bash
# 1. Generate latest Prisma client
npx prisma generate

# 2. Deploy pending migrations safely without resetting data
npx prisma db push --skip-generate
```

### Initial Data Provisioning:
```bash
# Seed initial categories, authors, editorial taxonomies, and static pages
node prisma/seed.js
node scripts/seed_pages.js
```

---

## 4. Production Build & Execution

### Compile Production Build:
```bash
npm run build
```

### Start Production Server (Standalone Node):
```bash
npm run start
# Or with specific port:
npx next start -p 3000
```

### Deploy to Vercel Production:
```bash
npx vercel --prod
```

---

## 5. Scheduled Publishing Cron Configuration

Configure a recurring HTTP GET/POST job (e.g. Vercel Cron, GitHub Actions, AWS EventBridge, or Linux crontab) to trigger the publishing endpoint every minute:

```bash
# Crontab entry (every minute):
* * * * * curl -X POST https://your-domain.com/api/cron/publish -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 6. Real-Time Newsroom & SSE

- **Endpoint**: `/api/realtime/stream`
- **Protocol**: Server-Sent Events (SSE)
- **Features**: Automatic client reconnection with exponential backoff and fallback polling every 10 seconds.

---

## 7. Backup and Disaster Recovery

### Automated Backup Snapshot:
```bash
node scripts/backup_db.js
```
Generates a full JSON snapshot of all articles, categories, authors, advertisements, static pages, site builder versions, and settings into `backups/`.

### Emergency Restore Procedure:
```bash
node scripts/restore_db.js
```
Restores the latest verified snapshot into the target database without dropping unrelated tables.

---

## 8. Rollback Strategy

If a deployment fails:
1. **Application Layer**: Redeploy previous deployment commit or promote previous Vercel deployment instantly via dashboard.
2. **Site Builder Layouts**: Use the built-in 1-Click Version Restore at `/admin/site-builder` $\rightarrow$ `History` $\rightarrow$ `Restore`.
3. **Database**: Run `node scripts/restore_db.js` using the pre-deployment snapshot.
