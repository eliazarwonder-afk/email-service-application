# Zegabytez Mail — Technical Architecture & Implementation Blueprint

## 1. System Topology & Deployment Layout

The system is architected as a **modular monolith API**, an **independently scalable background worker**, and a **Next.js web application**, fully compatible with deployment on **Coolify** and local orchestration with **Docker Compose**.

```text
                                  ┌───────────────────────────┐
                                  │      Coolify / Edge       │
                                  │   Reverse Proxy (Traefik) │
                                  └─────────────┬─────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
           / (Browser requests)                               /api/* (HTTPS / Cookie)
                     │                                                     │
         ┌───────────▼───────────┐                             ┌───────────▼───────────┐
         │       mail-web        │                             │       mail-api        │
         │  Next.js (App Router) │                             │   Fastify Modular     │
         │  Tailwind + shadcn/ui │                             │      Monolith         │
         └───────────────────────┘                             └─────┬───────────┬─────┘
                                                                     │           │
                                                Enqueue Provisioning │           │ PostgreSQL
                                                & Outbound Mail Jobs │           │ (Drizzle ORM)
                                                                     ▼           ▼
                                                          ┌──────────────┐  ┌──────────────┐
                                                          │  mail-redis  │  │mail-postgres │
                                                          │   (BullMQ)   │  │ (PostgreSQL) │
                                                          └──────┬───────┘  └──────┬───────┘
                                                                 │                 │
                                                                 ▼                 │
                                                          ┌──────────────┐         │
                                                          │ mail-worker  ├─────────┘
                                                          │ Provisioning │
                                                          │  & Delivery  │
                                                          └──────┬───────┘
                                                                 │
                                          ┌──────────────────────┴──────────────────────┐
                                          │                                             │
                                          ▼                                             ▼
                               ┌─────────────────────┐                       ┌─────────────────────┐
                               │     cPanel / WHM    │                       │    WHMCS Server     │
                               │ - UAPI Provisioning │                       │ - Client Sync       │
                               │ - Dovecot (IMAP)    │                       │ - NameSilo Domains  │
                               │ - Exim (SMTP)       │                       │ - Billing/Orders    │
                               └─────────────────────┘                       └─────────────────────┘
```

---

## 2. Monorepo Organization (pnpm Workspaces)

```text
email service application/
├── docker-compose.yml           # PostgreSQL, Redis, pgAdmin 4 for local dev
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── apps/
│   ├── api/                     # Fastify Modular Monolith (mail-api)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # Better Auth Fastify plugin & sessions
│   │   │   │   ├── orgs/        # Organization & team RBAC
│   │   │   │   ├── domains/     # Domain verification & DNS helpers
│   │   │   │   ├── mailboxes/   # Mailbox management & credential encryption
│   │   │   │   ├── webmail/     # IMAP message proxy & folder sync
│   │   │   │   ├── delivery/    # Outbound email queue & SMTP dispatcher
│   │   │   │   ├── whmcs/       # Internal provisioning webhooks & client sync
│   │   │   │   └── developer/   # Resend-style transactional API & keys
│   │   │   └── server.ts
│   │   └── package.json
│   ├── worker/                  # BullMQ Background Worker (mail-worker)
│   │   ├── src/
│   │   │   ├── processors/
│   │   │   │   ├── cpanel.processor.ts
│   │   │   │   ├── outbound-mail.processor.ts
│   │   │   │   └── domain-verify.processor.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/                     # Next.js Frontend (mail-web)
│       ├── src/
│       │   ├── app/             # Webmail, Admin, and Settings routes
│       │   ├── components/      # UI components (shadcn/ui, mail client)
│       │   └── lib/             # API client, auth hooks
│       └── package.json
└── packages/
    ├── database/                # Drizzle ORM schemas, migrations, and db client
    ├── mail-core/               # cPanel UAPI client, IMAP/SMTP adapters, AES-GCM crypto
    └── shared/                  # Common TypeScript types, DTOs, Zod validators
```

---

## 3. Database Schema Overview (Drizzle ORM)

| Logical Domain | Tables | Responsibilities |
|---|---|---|
| **Identity & Auth** | `users`, `sessions`, `accounts`, `verifications` | Handled via Better Auth + Drizzle adapter. Stores user profile, password hash (Argon2id), session tokens, and 2FA secrets. |
| **Organizations & RBAC** | `organizations`, `organization_members` | Tenancy boundary, role mapping (`owner`, `admin`, `member`, `mailbox_user`), quota limits, and WHMCS client link (`whmcs_client_id`). |
| **Domains** | `domains`, `domain_dns_records` | Domain ownership tokens, DNS verification status (MX, SPF, DKIM, DMARC), WHMCS registrar link. |
| **Mailboxes** | `mailboxes`, `mailbox_permissions` | Local parts (`sales@...`), encrypted mailbox passwords (AES-256-GCM), cPanel server association, quotas, user-to-mailbox access grants. |
| **Provisioning & Jobs**| `provisioning_jobs`, `provisioning_logs` | Audit trail of cPanel / WHMCS provisioning attempts, idempotency keys, and retry history. |
| **Developer / SMTP** | `api_keys`, `outbound_messages` | Resend-style scoped API keys (`zgm_live_...`), message delivery history, and bounce tracking. |

---

## 4. Key Security & Cryptography Principles

1. **SaaS Password $\neq$ Mailbox Password**:
   - The user signs into Zegabytez Mail with their SaaS password (hashed with Argon2id via Better Auth).
   - The mailbox password is an encrypted secret (AES-256-GCM using `ENCRYPTION_MASTER_KEY` stored exclusively in the environment, never in PostgreSQL).
2. **Mailbox Secret Decryption Scenarios**:
   - Backend decrypts the mailbox password **only** when authenticating to cPanel IMAP/SMTP for the webmail session or provisioning calls.
   - When a user requests external credentials for Outlook / Apple Mail, they can view or reset the mailbox password inside the protected settings pane.
3. **Strict Tenancy Authorization Chain**:
   - Every request enforces: `Authenticated User` $\to$ `Organization Membership` $\to$ `Domain Ownership` $\to$ `Mailbox Permission` $\to$ `Operation`.

---

## 5. Implementation Roadmap

- [ ] **Phase 1: Foundation & Local Stack**
  - Scaffold pnpm workspace (`apps/api`, `apps/worker`, `apps/web`, `packages/*`).
  - Configure `docker-compose.yml` (PostgreSQL 16, Redis 7, pgAdmin 4).
  - Configure TypeScript, Drizzle ORM, and environment schemas.
- [ ] **Phase 2: Validation Spikes**
  - **Spike 1**: Better Auth mounted in Fastify with Drizzle session adapter & HTTP-only cookies.
  - **Spike 2**: `cPanelProvisioningAdapter` using cPanel UAPI (`Email::add_pop`, `Email::passwd_pop`, `Email::get_disk_usage`) with BullMQ retry and idempotency.
  - **Spike 3**: `MailAccessAdapter` with `imapflow` (listing folders, messages) and `nodemailer` (queued outbound delivery).
- [ ] **Phase 3: Core API Modules**
  - Auth & Organizations RBAC.
  - Domains & DNS record verification.
  - Mailboxes & AES-256-GCM encryption.
  - WHMCS server module webhook endpoints (`/internal/v1/whmcs/provision`).
- [ ] **Phase 4: Webmail Engine & Developer SMTP API**
  - Webmail REST endpoints for inbox, folder navigation, message details, attachments.
  - Resend-style `/v1/emails` API with API key authorization.
- [ ] **Phase 5: Next.js Frontend**
  - Modern webmail interface (Gmail-inspired).
  - Admin domain & mailbox management dashboard.
  - Developer SMTP & API keys center.
