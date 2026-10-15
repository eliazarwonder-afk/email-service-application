# ZegaMail — cPanel UAPI & WHMCS Module Integration Architecture

<p align="center">
  <img src="https://img.shields.io/badge/cPanel-FF6C2C?style=for-the-badge&logo=cpanel&logoColor=white" alt="cPanel" />
  <img src="https://img.shields.io/badge/WHM-FF6C2C?style=for-the-badge&logo=cpanel&logoColor=white" alt="WHM" />
  <img src="https://img.shields.io/badge/WHMCS-51647a?style=for-the-badge&logo=whmcs&logoColor=white" alt="WHMCS" />
  <img src="https://img.shields.io/badge/Coolify-6B21A8?style=for-the-badge&logo=coolify&logoColor=white" alt="Coolify" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
</p>

---

## 1. Executive Summary: The Web Host Advantage

For over twenty years, web hosting providers and digital agencies have provided business email powered by **cPanel**, **Exim**, and **Dovecot**. However, the user-facing webmail interfaces bundled with cPanel (**Roundcube**, **Horde**, and **SquirrelMail**) suffer from several critical shortcomings:
* **Outdated UI/UX**: Difficult for modern business owners to navigate on smartphones or tablets.
* **No AI Integration**: Lacks proposal drafting, lead classification, smart replies, or cold sequences.
* **No Modern Delivery Ticks**: Traditional cPanel webmail lacks clean delivery status ticks (Sent ✓ / Delivered ✓✓).
* **Expensive Alternatives**: Competing solutions like Google Workspace or Microsoft 365 charge \$6–\$18/user/month, squeezing hosting margins.

**ZegaMail** solves this challenge by serving as an ultra-modern, high-performance webmail front-end and automation layer. It integrates directly with your existing **cPanel/WHM** servers and **WHMCS** billing automation, giving your clients an interface comparable to Gmail or Titan Mail while leveraging your existing cPanel infrastructure.

---

## 2. System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Business Client
    participant WHMCS as WHMCS Billing
    participant ZegaAPI as ZegaMail Fastify API
    participant Worker as BullMQ Worker
    participant cPanel as cPanel UAPI / WHM
    participant Mail as Exim / Dovecot (IMAP/SMTP)

    Customer->>WHMCS: Orders Email Hosting / Domain
    WHMCS->>ZegaAPI: Webhook (CreateAccount / SSO Request)
    ZegaAPI->>Worker: Enqueue Provisioning Job
    Worker->>cPanel: Call UAPI Email::add_pop (Create Mailbox)
    Worker->>cPanel: Configure DKIM / SPF / DMARC DNS Records
    Worker-->>ZegaAPI: Provisioning Confirmed
    ZegaAPI-->>WHMCS: Return SSO Token & Organization Credentials
    Customer->>ZegaAPI: 1-Click SSO from WHMCS Client Area
    ZegaAPI->>Mail: Connect via Secure SSL IMAP/SMTP
    Customer->>Customer: Experience High-End Modern Webmail
```

---

## 3. cPanel UAPI & WHM API Integration Reference

ZegaMail integrates with cPanel via its official **UAPI (User API)** and with WHM via the **WHM XML-API / JSON-API**. All operations are encapsulated inside `@zegabytez/mail-core`.

### A. Implemented cPanel UAPI Functions

| UAPI Module & Function | Purpose in ZegaMail | Implementation File |
| :--- | :--- | :--- |
| `Email::add_pop` | Provisions a new mailbox with user quota and secure password | [`packages/mail-core/src/cpanel/client.ts`](file:///packages/mail-core/src/cpanel/client.ts) |
| `Email::delete_pop` | Removes a mailbox when terminated or downgraded | `client.ts` |
| `Email::passwd_pop` | Updates mailbox password when changed in ZegaMail | `client.ts` |
| `Email::edit_pop_quota` | Adjusts storage quota dynamically upon plan upgrade | `client.ts` |
| `Email::get_disk_usage` | Fetches real-time disk consumption for dashboard meters | `client.ts` |
| `Email::list_pops` | Synchronizes existing cPanel mailboxes with ZegaMail database | `client.ts` |
| `ZoneEdit::add_zone_record` | Automatically generates DKIM, SPF, and DMARC TXT records | `client.ts` |

### B. WHM API Functions (Reseller & Server Level)

| WHM Function | Purpose in ZegaMail | Implementation File |
| :--- | :--- | :--- |
| `createacct` | Automatically provisions a dedicated cPanel hosting account | [`packages/mail-core/src/cpanel/whm.ts`](file:///packages/mail-core/src/cpanel/whm.ts) |
| `suspendacct` | Automatically locks mail access upon overdue invoice | `whm.ts` |
| `unsuspendacct` | Restores mailbox access instantly upon payment receipt | `whm.ts` |
| `removeacct` | Tears down server allocation upon service cancellation | `whm.ts` |

---

## 4. WHMCS Complete Integration Suite

ZegaMail ships with an enterprise-grade WHMCS integration suite comprising three components:

```text
whmcs-module/
├── modules/
│   ├── servers/
│   │   └── zegabytezmail/
│   │       └── zegabytezmail.php        <-- Server Provisioning & In-Portal Mailbox Manager
│   └── addons/
│       └── zegabytezmail_addon/
│           └── zegabytezmail_addon.php  <-- Master Multi-Tenant Control Dashboard
└── includes/
    └── hooks/
        └── zegabytezmail_hooks.php      <-- Domain Registration & DNS Auto-Config Hooks
```

---

### A. Component 1: Server Provisioning Module (`modules/servers/zegabytezmail`)

#### 1. Full In-Portal Client Area Management (`_ClientArea`)
Clients manage their entire business email directly inside their WHMCS Client Area service details page:
* **Interactive Disk Meter**: Live visual progress bar showing allocated storage (e.g. `2.5 GB / 50.0 GB`) and active mailbox seats (`4 / 10 Used`).
* **In-Portal Mailbox Provisioner**: Clients create new mailboxes (`sales@domain.com`, `billing@domain.com`), set passwords, and assign individual mailbox storage limits without leaving WHMCS.
* **Mailbox Directory**: Real-time table of mailboxes with 1-click delete, password change, and status indicators.
* **1-Click Webmail SSO**: Cryptographically signed HMAC token launcher logging clients directly into their ZegaMail webmail interface.
* **Mobile & Desktop Setup Card**: Instant copy settings for iOS, Android, macOS Mail, Outlook, and Thunderbird (IMAP `993 SSL`, SMTP `465 SSL`).

#### 2. WHMCS Admin Area Service Controls (`_AdminCustomButtonArray`)
Inside `clientsservices.php`, administrators have 1-click operational controls:
* **Sync cPanel UAPI**: Forces an immediate live re-sync of all mailboxes and disk usage from the cPanel server.
* **Verify DNS & DKIM**: Tests MX records, 2048-bit DKIM selectors, SPF inclusion, and DMARC quarantine policies on the host.
* **Reset Master Password**: Resets the tenant's primary administrative account password and emails secure recovery credentials.
* **Update Quota & Seats**: Dynamically resizes disk storage and seat caps without interrupting active mail sessions.

#### 3. Automated Lifecycle Handlers
* **`_CreateAccount`**: Provisions the dedicated cPanel account via WHM, sets up the organization tenant, and initial mailbox upon order payment.
* **`_SuspendAccount`**: Locks webmail access and suspends outbound mail dispatch upon overdue invoices.
* **`_UnsuspendAccount`**: Instantly restores service upon payment settlement.
* **`_TerminateAccount`**: Cleans up mailbox storage upon service cancellation.
* **`_ChangePackage`**: Resizes mailbox limits and storage allowances dynamically when clients upgrade tiers.

---

### B. Component 2: Master Addon Module (`modules/addons/zegabytezmail_addon`)

Accessible via **WHMCS Admin > Addons > ZegaMail Master Cluster**:
* **Cluster Overview KPIs**: Global aggregate metrics across all active hosting nodes:
  * Total Active Business Tenants
  * Total Provisioned Mailbox Seats
  * Total Ingested NVMe Storage (GB)
  * cPanel Cluster Health (`Exim/Dovecot 250 OK`)
* **Multi-Tenant Directory Table**: Searchable ledger of every tenant organization, domain, client name, service status, and 1-click **"Login As Admin"** SSO launcher.
* **Global Server Configuration**: Configure master cPanel/WHM hostnames, default storage templates, and monthly AI Token grants.

---

### C. Component 3: Domain Order & Billing Automation Hooks (`includes/hooks/`)

* **`AfterRegistrarRegistration`**: When a client purchases or transfers a domain through WHMCS's standard cart, this hook automatically generates and injects the verified DNS Zone records (MX, SPF, DKIM, and DMARC) into the cPanel server silently.
* **`InvoicePaid`**: Automatically detects settled upgrade invoices and applies expanded quotas, or unsuspends previously locked accounts.

## 5. Security & Decoupled Credentials Architecture

A key architectural advantage of ZegaMail is its **Cryptographic Decoupling**:

```text
┌──────────────────────────────────────────────────────────────┐
│                    ZegaMail SaaS Layer                       │
│  - User logs in with Better-Auth / OAuth / WHMCS SSO Token   │
│  - User SaaS password is NEVER sent to the IMAP server       │
└──────────────────────────────┬───────────────────────────────┘
                               │ Decrypted using Master Key
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 AES-256-GCM Credential Vault                 │
│  - cPanel mailbox password is encrypted with master key      │
│  - Stored in PostgreSQL with unique IV and auth tag          │
└──────────────────────────────┬───────────────────────────────┘
                               │ Authenticates
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 cPanel / Exim / Dovecot Core                 │
│  - Native SSL IMAP connection on port 993                    │
│  - Outbound authenticated SMTP on port 465                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Deployable PaaS Templates

### A. Coolify v4 Stack
Deploy ZegaMail directly into Coolify by pointing to the included stack template:
`coolify/docker-compose.coolify.yml`

```bash
# 1. In Coolify Dashboard, click "+ Create New Resource"
# 2. Select "Docker Compose"
# 3. Paste the contents of coolify/docker-compose.coolify.yml
# 4. Fill in your environment variables in the Coolify UI
# 5. Click "Deploy"
```

### B. Environment Variables Reference Matrix

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Yes |
| `REDIS_URL` | Redis connection for queues | `redis://:pass@host:6379` | Yes |
| `BETTER_AUTH_SECRET` | 32+ character session signing secret | `rand_hex_32` | Yes |
| `ENCRYPTION_MASTER_KEY` | 64-char hex key for AES-256-GCM | `32_byte_hex_string` | Yes |
| `CPANEL_HOST` | Hostname of your cPanel server | `mail.yourhosting.com` | Yes |
| `CPANEL_USERNAME` | cPanel or reseller account user | `cpanel_user` | Yes |
| `CPANEL_API_TOKEN` | cPanel API token with Email permissions | `ABCD...` | Yes |
| `WHM_HOST` | Hostname of your WHM server | `server.yourhosting.com` | Optional |
| `WHM_API_TOKEN` | Root or reseller WHM API token | `WXYZ...` | Optional |
| `WHMCS_INTERNAL_WEBHOOK_SECRET` | Secret token between WHMCS module & API | `whmcs_secret_token` | Yes |

---

## 7. Roadmap & Extensibility

- [x] cPanel UAPI Mailbox Provisioning Adapter
- [x] WHM Account Creation & Suspension Hooks
- [x] WHMCS Native Server Provisioning Module
- [x] Tokenized 1-Click Client Area SSO
- [x] Coolify v4 Docker Compose Template
- [ ] DirectAdmin Provisioning Adapter
- [ ] Plesk XML-RPC API Integration
- [ ] WHMCS Addon Module for Reseller Margin Analytics
