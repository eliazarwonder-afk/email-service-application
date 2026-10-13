<p align="center">
  <img src="apps/web/public/branding/zegamail-dark-transparent.png" alt="ZegaMail" width="340" />
</p>

<h1 align="center">ZegaMail — Modern Business Email, AI Outreach & Web Host Cloud Platform</h1>

<p align="center">
  <strong>The open, self-hostable alternative to Google Workspace & Titan Mail, built for web hosts and agencies.</strong><br>
  Replace outdated, boring cPanel webmail (Roundcube / Horde) with an ultra-fast, AI-driven business email client backed by <strong>cPanel UAPI</strong>, <strong>WHM</strong>, and <strong>WHMCS</strong> billing automation.
</p>

<p align="center">
  <a href="https://cpanel.net"><img src="https://img.shields.io/badge/cPanel_API-UAPI_v2-FF6C2C?style=for-the-badge&logo=cpanel&logoColor=white" alt="cPanel" /></a>
  <a href="https://whmcs.com"><img src="https://img.shields.io/badge/WHMCS_Module-Server_Provisioning-51647a?style=for-the-badge&logo=whmcs&logoColor=white" alt="WHMCS" /></a>
  <a href="https://coolify.io"><img src="https://img.shields.io/badge/Coolify_v4-1--Click_Deploy-6B21A8?style=for-the-badge&logo=coolify&logoColor=white" alt="Coolify" /></a>
  <a href="https://docker.com"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js_15-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://fastify.dev"><img src="https://img.shields.io/badge/Fastify-Backend_API-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify" /></a>
  <a href="https://postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL_16-Relational-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis_7-BullMQ_Queues-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" /></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-Strict_v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

---

## 💡 Why ZegaMail?

Every web hosting provider and digital agency already pays for cPanel, Exim, and Dovecot mail servers. Yet, clients constantly defect to Google Workspace or Microsoft 365 (paying **\$6–\$18/user/month**) for one single reason:

> **cPanel’s bundled webmail (Roundcube / Horde) feels like software from 2005.**

ZegaMail transforms your existing cPanel server into a modern, revenue-generating email product:

* 🚀 **Gmail / Titan Mail User Experience**: Fast, responsive webmail interface with real-time push notifications and dark mode.
* 🤖 **Zega AI Outreach Studio**: Built-in AI proposal writer, cold email sequences, and high-converting smart replies.
* 👁️ **Client Read Receipts**: Real-time proposal and invoice tracking pixels that notify clients the second their email is opened.
* ⚡ **cPanel UAPI Provisioning**: Automatically creates mailboxes, assigns quotas, and manages DKIM/SPF DNS records.
* 💼 **WHMCS Server Module**: 1-click install into WHMCS with automated service provisioning, invoice billing, and tokenized client area Single Sign-On (SSO).
* 🔒 **AES-256-GCM Credential Vault**: User SaaS credentials are cryptographically decoupled from raw IMAP/SMTP passwords.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend & Client Layer"]
        Browser["Next.js 15 Webmail Client<br/>(Port 3000)"]
        Mobile["Mobile & Desktop Clients<br/>(iOS, Android, Outlook)"]
        WHMCSClient["WHMCS Client Portal<br/>(1-Click SSO Button)"]
    end

    subgraph ServiceLayer["Application & API Layer"]
        API["Fastify Modular Monolith<br/>(Port 4000)"]
        Worker["BullMQ Queue Worker<br/>(Background Jobs)"]
        DB[("PostgreSQL 16<br/>Multi-Tenant DB")]
        Redis[("Redis 7<br/>Async Job Broker")]
    end

    subgraph InfraLayer["Hosting & Mail Infrastructure"]
        cPanel["cPanel UAPI Engine<br/>(Email::add_pop, Quotas, DKIM)"]
        WHM["WHM JSON-API<br/>(Account Creation, Suspensions)"]
        EximDovecot["Exim (SMTP :465) &<br/>Dovecot (IMAP :993)"]
    end

    Browser -->|HTTP / Better Auth| API
    WHMCSClient -->|Signed SSO Token| API
    Mobile -->|SSL IMAP / SMTP| EximDovecot
    API -->|Read / Write| DB
    API -->|Enqueue Jobs| Redis
    Worker -->|Process Queues| Redis
    Worker -->|UAPI Calls| cPanel
    API -->|WHM Calls| WHM
    API -->|IMAP / SMTP Bridge| EximDovecot
```

---

## 📦 Monorepo Directory Structure

```text
email service application/
├── apps/
│   ├── api/                     # Fastify modular backend monolith (Port 4000)
│   ├── worker/                  # BullMQ background queue worker for async cPanel jobs
│   └── web/                     # Next.js 15 modern webmail & admin client (Port 3000)
├── packages/
│   ├── database/                # PostgreSQL schema & Drizzle ORM migrations
│   ├── mail-core/               # cPanel UAPI client, WHM client, AES-GCM crypto, IMAP/SMTP
│   └── shared/                  # Common TypeScript types, DTOs & validation schemas
├── coolify/
│   └── docker-compose.coolify.yml # Production 1-Click Deployable Stack for Coolify v4
├── whmcs-module/
│   └── modules/servers/zegabytezmail/ # Native WHMCS Server Provisioning Module
├── scripts/
│   ├── dev-mobile.js            # LAN discovery & public mobile tunnel generator
│   └── test-live-site.js        # Automated Playwright browser verification suite
├── CPANEL_WHMCS_INTEGRATION.md  # Detailed cPanel UAPI & WHMCS technical architecture guide
└── docker-compose.yml           # Local dev database and Redis stack
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/zegamail.git
cd zegamail

# Install monorepo dependencies with pnpm
pnpm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://zegabytez:zegabytez_password_local@localhost:5432/zegabytez_mail"
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="your_random_32_character_secret_key"
ENCRYPTION_MASTER_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# cPanel UAPI & WHM Credentials (uses built-in mock mode when set to localhost)
CPANEL_HOST="localhost"
CPANEL_USERNAME="cpanel_user"
CPANEL_API_TOKEN="your_cpanel_api_token"

WHMCS_INTERNAL_WEBHOOK_SECRET="your_whmcs_webhook_token"
```

### 3. Launch Local Database & Redis

```bash
docker compose up -d
```

### 4. Initialize Database Schema

```bash
pnpm db:generate
pnpm db:push
```

### 5. Start Development Servers

```bash
# Start all services concurrently
pnpm dev:web      # Next.js 15 Webmail (http://localhost:3000)
pnpm dev:api      # Fastify API (http://localhost:4000)
pnpm dev:worker   # BullMQ Worker
```

Or run with mobile LAN & public tunneling support:
```bash
pnpm dev:mobile
```

---

## 🚢 Deploying to Production (Coolify & PaaS)

ZegaMail includes a production-ready **Coolify v4 Stack Template** located at [`coolify/docker-compose.coolify.yml`](file:///coolify/docker-compose.coolify.yml).

### Deploy in Coolify:
1. Open your **Coolify Dashboard**.
2. Click **+ Create Resource** ➔ **Docker Compose**.
3. Select this repository or paste the content of [`coolify/docker-compose.coolify.yml`](file:///coolify/docker-compose.coolify.yml).
4. Define your production environment variables in the Coolify UI.
5. Click **Deploy**.

Coolify will provision:
* `mail-db`: PostgreSQL 16 with persistent volume `zegamail_pgdata`.
* `mail-redis`: Redis 7 with password-protected persistent volume `zegamail_redisdata`.
* `mail-api`: Fastify API with automatic Traefik SSL routing.
* `mail-worker`: Queue processor for background cPanel provisioning.
* `mail-web`: Next.js 15 SSR frontend with CDN caching.

---

## 🔌 cPanel & WHMCS Integration Guide

For the complete technical blueprint, API endpoint mappings, and WHMCS module configuration, see our dedicated guide:
👉 **[CPANEL_WHMCS_INTEGRATION.md](file:///CPANEL_WHMCS_INTEGRATION.md)**

### Quick WHMCS Module Setup:
1. Copy the module to your WHMCS server:
   ```bash
   cp -r whmcs-module/modules/servers/zegabytezmail /path/to/whmcs/modules/servers/
   ```
2. In WHMCS Admin, go to **Setup > Products/Services > Products/Services**.
3. Create or edit an Email product and select **Zegabytez Mail** as the Module Name.
4. Input your `API URL` and `Webhook Secret`.
5. Save. Upon payment, WHMCS automatically provisions the mailbox in cPanel and links the client account.

---

## 🧪 Automated Testing

Execute the automated test suites:

```bash
# Unit & integration tests
pnpm test

# Full-stack live browser automation (Playwright)
node scripts/test-live-site.js
```

---

## 📄 License & Roadmap

* **License**: MIT License — open, extensible, and white-label ready.
* **Roadmap**:
  * [x] Next.js 15 Webmail Interface with Read Receipts & AI Studio
  * [x] cPanel UAPI Mailbox Provisioning (`Email::add_pop`, Quotas, DKIM)
  * [x] WHM Hosting Account Automation (`createacct`, `suspendacct`)
  * [x] Native WHMCS Server Provisioning Module with 1-Click SSO
  * [x] Coolify v4 Docker Compose Production Stack
  * [x] Comprehensive Automated Playwright Browser Testing Suite
  * [ ] DirectAdmin & Plesk Provisioning Adapters
  * [ ] Mobile Push Notification Gateway (APNs / FCM)
