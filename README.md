<p align="center">
  <img src="apps/web/public/branding/zegamail-dark-transparent.png#gh-dark-mode-only" alt="ZegaMail" width="340" />
  <img src="apps/web/public/branding/zegamail-light-transparent.png#gh-light-mode-only" alt="ZegaMail" width="340" />
</p>

<h1 align="center">ZegaMail — Modern Business Email, Outreach Campaigns & Cloud Mail Platform</h1>

<p align="center">
  <strong>The modern, flat-rate alternative to Google Workspace & Microsoft 365, built for businesses, web hosts, and agencies.</strong><br>
  Deliver ultra-fast business email backed by high-performance <strong>Cloud Mail Clusters</strong>, <strong>Global Anycast DNS</strong>, and <strong>ZegaCloud Client Portal</strong> billing automation.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Cloud_Mail-Cluster_Engine-0066FF?style=for-the-badge&logoColor=white" alt="Cloud Mail" />
  <img src="https://img.shields.io/badge/ZegaCloud_Portal-Billing_&_SSO-00C49F?style=for-the-badge&logoColor=white" alt="Portal Billing" />
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

Businesses and digital agencies constantly overpay Google Workspace or Microsoft 365 (**\$6–\$18/user/month** per seat) because legacy webmail interfaces feel outdated and unbranded.

ZegaMail transforms standard cloud servers into a modern, revenue-generating enterprise email product:

* 🚀 **Fast, Modern Webmail Experience**: Responsive, keyboard-first webmail interface with real-time push notifications and dark mode.
* 🤖 **Zega AI Outreach Studio**: Built-in AI proposal writer, cold email sequences, and high-converting smart replies.
* 👁️ **Delivery Status Ticks (Sent ✓ / Delivered ✓✓)**: Guaranteed delivery confirmation that verifies messages reached recipient mail servers via RFC 3461 DSN.
* ⚡ **Automated Mailbox Provisioning**: Instantly provisions mailboxes, allocates storage pools, and configures DKIM/SPF/DMARC records.
* 💼 **ZegaCloud Client Portal Integration**: Seamless integration with automated service provisioning, invoice billing, and tokenized Client Area Single Sign-On (SSO).
* 🔒 **AES-256-GCM Credential Vault**: User SaaS credentials are cryptographically decoupled from raw IMAP/SMTP cluster passwords.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend & Client Layer"]
        Browser["Next.js 15 Webmail Client<br/>(Port 3000)"]
        Mobile["Mobile & Desktop Clients<br/>(iOS, Android, Outlook)"]
        PortalClient["ZegaCloud Client Portal<br/>(1-Click SSO Button)"]
    end

    subgraph ServiceLayer["Application & API Layer"]
        API["Fastify Modular Monolith<br/>(Port 4000)"]
        Worker["BullMQ Queue Worker<br/>(Background Jobs)"]
        DB[("PostgreSQL 16<br/>Multi-Tenant DB")]
        Redis[("Redis 7<br/>Async Job Broker")]
    end

    subgraph InfraLayer["Hosting & Mail Infrastructure"]
        MailCluster["Cloud Mail Cluster<br/>(Mailbox Provisioning, Quotas, DKIM)"]
        HostCluster["Cloud Infrastructure<br/>(Cluster Accounts, Quota Scaling)"]
        EximDovecot["Exim (SMTP :465) &<br/>Dovecot (IMAP :993)"]
    end

    Browser -->|HTTP / Better Auth| API
    PortalClient -->|Signed SSO Token| API
    Mobile -->|SSL IMAP / SMTP| EximDovecot
    API -->|Read / Write| DB
    API -->|Enqueue Jobs| Redis
    Worker -->|Process Queues| Redis
    Worker -->|Cluster API Calls| MailCluster
    API -->|Infrastructure Calls| HostCluster
    API -->|IMAP / SMTP Bridge| EximDovecot
```

---

## 📦 Monorepo Directory Structure

```text
email service application/
├── apps/
│   ├── api/                     # Fastify modular backend monolith (Port 4000)
│   ├── worker/                  # BullMQ background queue worker for async provisioning
│   └── web/                     # Next.js 15 modern webmail & admin client (Port 3000)
├── packages/
│   ├── database/                # PostgreSQL schema & Drizzle ORM migrations
│   ├── mail-core/               # Cluster Mail API client, AES-GCM crypto, IMAP/SMTP
│   └── shared/                  # Common TypeScript types, DTOs & validation schemas
├── coolify/
│   └── docker-compose.coolify.yml # Production 1-Click Deployable Stack for Coolify v4
├── whmcs-module/
│   └── modules/servers/zegabytezmail/ # Native Client Portal Server Provisioning Module
├── scripts/
│   ├── dev-mobile.js            # LAN discovery & public mobile tunnel generator
│   └── test-live-site.js        # Automated Playwright browser verification suite
├── CPANEL_WHMCS_INTEGRATION.md  # Detailed cluster mail & client portal architecture guide
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

# Mail Cluster & API Credentials (uses built-in mock mode when set to localhost)
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
* `mail-worker`: Queue processor for background mailbox provisioning.
* `mail-web`: Next.js 15 SSR frontend with CDN caching.

---

## 🔌 Cloud Infrastructure & Client Portal Integration

For full technical blueprints, API endpoint mappings, and automated client portal provisioning, see the integration docs:
👉 **[CPANEL_WHMCS_INTEGRATION.md](file:///CPANEL_WHMCS_INTEGRATION.md)**

### Automated Client Portal Provisioning:
1. Deploy the mail provisioning module to your billing environment:
   ```bash
   cp -r whmcs-module/modules/servers/zegabytezmail /path/to/modules/servers/
   ```
2. In the Portal Administrator panel, configure the Email product to use the automated provisioning service.
3. Input your `API URL` and `Webhook Secret`.
4. Save. Upon order completion, the cluster automatically provisions the mailbox and activates instant Single Sign-On (SSO).

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
  * [x] Next.js 15 Webmail Interface with Delivery Status Ticks & AI Studio
  * [x] Cloud Mailbox Provisioning (`Email::add_pop`, Quotas, DKIM)
  * [x] Cluster Account Infrastructure Automation
  * [x] Native Client Portal Server Provisioning Module with 1-Click SSO
  * [x] Coolify v4 Docker Compose Production Stack
  * [x] Comprehensive Automated Playwright Browser Testing Suite
  * [ ] Mobile Push Notification Gateway (APNs / FCM)
