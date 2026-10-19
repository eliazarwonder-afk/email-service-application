# ZegaMail Developer Platform & REST API Specification
**Version:** 2.1.0 (OpenAPI 3.1.0 Compliant)  
**Base URL:** `https://mail.zegacloud.com` (or `http://localhost:3000` in development)  
**Interactive Docs:** `https://mail.zegacloud.com/docs`  
**OpenAPI JSON:** `https://mail.zegacloud.com/api/openapi.json`

---

## 1. Overview & Architecture

ZegaMail is a multi-tenant business email, cold outreach automation, and cryptocurrency billing platform engineered to bridge directly into **cPanel Exim/Dovecot** clusters and **WHMCS** billing infrastructure.

```
┌──────────────────────────────────────────────────────────────┐
│                    External Integrations                     │
│  (WHMCS Module, CRM / HubSpot, Mobile Clients, Custom Apps)  │
└───────────────────────────────┬──────────────────────────────┘
                                │ HTTPS / REST / HMAC
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                     ZegaMail API Gateway                     │
│   • OWASP Rate Limiting & Timing-Safe HMAC Validation        │
│   • Better-Auth / Session Cookie Governance                  │
└───────────────┬───────────────────────────────┬──────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│ cPanel Direct MTA Bridge     │ │ Blockchain On-Chain Scanner │
│ • TLS 1.3 SMTP (465 / 587)   │ │ • TRON USDT (TRC-20)        │
│ • Dovecot IMAP / Maildir     │ │ • Bitcoin SegWit (BTC)      │
│ • RFC 3461 Delivery Ticks    │ │ • Ethereum Mainnet (ETH)    │
│   (250 OK Acknowledgement)   │ │ • Solana RPC Mainnet (SOL)  │
└──────────────────────────────┘ └─────────────────────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────┐
│        PostgreSQL 16 High-Performance Drizzle Schema         │
│  Users • Orgs • Domains • Mailboxes • Messages • Invoices    │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Schemes

ZegaMail supports four authentication methods tailored to different integration surfaces:

### 1. Web Session Cookie (`zega_session`)
- Used by client browsers and web applications.
- Issued upon calling `POST /api/auth/login`.
- Attributes: `HttpOnly`, `SameSite=Lax`, `Secure` (in production), 7-day TTL.

### 2. Bearer Authentication (`Authorization: Bearer <TOKEN>`)
- Used for automated cron jobs and server-to-server RPC workers.
- Configured via `CRON_SECRET` in `.env`.
- Example header:
  ```http
  Authorization: Bearer zegacloud-cron-secret
  ```

### 3. WHMCS Shared Webhook Secret (`x-zegabytez-whmcs-secret`)
- Used by WHMCS server provisioning modules and the Master Cluster Addon.
- Verified using constant-time comparison to prevent timing attacks.
- Example header:
  ```http
  x-zegabytez-whmcs-secret: super_secret_whmcs_webhook_token
  ```

### 4. Cryptographic HMAC-SHA256 (`x-zegabytez-signature`)
- Recommended for untrusted third-party webhooks.
- Signature computed as `HmacSHA256(rawRequestBody, secret)`:
  ```http
  x-zegabytez-signature: sha256=d3a8...e491
  ```

---

## 3. Standard Response Formats

All API responses follow consistent JSON envelopes:

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### RFC 7807 Error Envelope
```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "INVALID_CREDENTIALS",
  "retryAfterMs": 60000
}
```

---

## 4. Complete Endpoint Catalog

### System & Health

#### `GET /api/health`
Lightweight zero-overhead health check utilized by Docker, Coolify Sentinel, and load balancers.
* **Authentication:** None (Public)
* **Sample Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "zegabytez-mail",
  "timestamp": "2026-10-19T11:45:00.000Z",
  "uptime": 3600.42
}
```

---

### Authentication

#### `POST /api/auth/login`
Authenticates a user, verifies password hash with timing-safe comparison, and sets session cookie.
* **Rate Limit:** 5 attempts per minute per IP.
* **Request Body:**
```json
{
  "email": "owner@zegacloud.com",
  "password": "password123"
}
```
* **Sample cURL:**
```bash
curl -X POST https://mail.zegacloud.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@zegacloud.com","password":"password123"}' \
  -c cookies.txt
```

#### `POST /api/auth/logout`
Terminates active session and clears authentication cookies.
* **Authentication:** Session Cookie

#### `GET /api/auth/me`
Retrieves currently authenticated user and organization metadata.
* **Authentication:** Session Cookie

---

### Mail Transport & Inboxing

#### `GET /api/mail`
Fetches messages for the active organization mailbox with search and folder filtering.
* **Authentication:** Session Cookie
* **Query Parameters:**
  - `folder` (optional): `inbox` (default), `sent`, `tracked`, `drafts`, `archive`, `spam`, or custom folder ID.
  - `q` (optional): Search query string for sender, recipient, or subject.
* **Sample Response (200 OK):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_89f41b2c",
      "from": "Sarah Lin (Enterprise Solutions)",
      "fromEmail": "sarah@lintech.io",
      "toEmail": "sales@acmedesign.co",
      "subject": "Proposal for Q4 Dedicated Email Cluster Migration",
      "preview": "Alex, we reviewed your technical docs and are ready...",
      "date": "10:42 AM",
      "folder": "inbox",
      "isRead": false,
      "tracked": false,
      "deliveryStatus": "delivered",
      "attachments": []
    }
  ],
  "total": 1
}
```

#### `POST /api/mail`
Dispatches an outbound message over direct TLS 1.3 cPanel SMTP with RFC 3461 DSN delivery notification acknowledgement.
* **Authentication:** Session Cookie
* **Request Body:**
```json
{
  "to": "client@acme.com",
  "subject": "Verified Cloud Agreement & Infrastructure Provisioning",
  "content": "Hello team, please find your server configuration details below...",
  "isHtml": false,
  "attachments": [
    {
      "name": "agreement.pdf",
      "content": "data:application/pdf;base64,JVBERi0xLjQK..."
    }
  ]
}
```
* **Sample Response (200 OK):**
```json
{
  "success": true,
  "messageId": "msg_90a4df11",
  "deliveryStatus": "delivered",
  "mtaStatus": "250 OK: Message accepted for delivery via cPanel Exim"
}
```

---

### Cold Email Outreach Campaigns

#### `GET /api/campaigns`
Lists all active, paused, and drafted multi-touch cold email campaigns with aggregated performance metrics.
* **Authentication:** Session Cookie

#### `POST /api/campaigns`
Creates a multi-step drip email campaign with customizable sending schedule, timezone constraints, and compliance settings.
* **Authentication:** Session Cookie
* **Request Body:**
```json
{
  "name": "Q4 SaaS Founders Cold Outreach",
  "goal": "cold_outreach",
  "fromName": "Alex Carter",
  "fromEmail": "alex@acmedesign.co",
  "replyTo": "alex@acmedesign.co",
  "sendingMailboxes": ["sales@acmedesign.co"],
  "schedule": {
    "startDate": "2026-10-20",
    "sendingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "sendingHoursStart": "09:00",
    "sendingHoursEnd": "17:00",
    "timeZone": "America/New_York",
    "dailyLimit": 150,
    "minGapSeconds": 60
  },
  "settings": {
    "trackOpens": true,
    "trackClicks": true,
    "stopOnReply": true,
    "stopOnAutoReply": true,
    "replyToOption": "same"
  },
  "compliance": {
    "includeUnsubscribeLink": true,
    "unsubscribeText": "Unsubscribe from future notifications",
    "physicalAddress": "100 Innovation Way, Suite 400"
  },
  "steps": [
    {
      "stepNumber": 1,
      "delayDays": 0,
      "subject": "Quick question regarding {{company}} email infrastructure",
      "body": "Hi {{firstName}}, noticed you are scaling your platform...",
      "sendAsReply": false
    },
    {
      "stepNumber": 2,
      "delayDays": 3,
      "subject": "Re: Quick question regarding {{company}} email infrastructure",
      "body": "Hi {{firstName}}, just following up on my note below...",
      "sendAsReply": true
    }
  ]
}
```

---

### Orders & Cryptocurrency Billing Gateway

#### `POST /api/billing/checkout`
Provisions an order and returns real-time cryptocurrency deposit addresses with dynamically generated QR codes.
* **Authentication:** Session Cookie
* **Request Body:**
```json
{
  "planId": "growth",
  "billingCycle": "monthly",
  "paymentMethod": "crypto_usdt_trc20"
}
```
* **Supported Payment Methods:**
  - `crypto_usdt_trc20` (Tether TRC-20)
  - `crypto_btc` (Bitcoin Native SegWit)
  - `crypto_eth` (Ethereum ERC-20)
  - `crypto_sol` (Solana Mainnet)
  - `stripe_card` (Credit/Debit Card)
* **Sample Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "id": "ord_94821",
    "orderNumber": "WHMCS-ORD-2026-9482",
    "amount": 49.00,
    "currency": "USD",
    "status": "pending",
    "cryptoDetails": {
      "cryptoCurrency": "USDT_TRC20",
      "cryptoAmount": "49.00 USDT",
      "walletAddress": "TX7k1dZega9xMailTRC20Wallet88NVMe",
      "network": "TRON (TRC-20)",
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=..."
    }
  }
}
```

#### `POST /api/billing/orders`
Submits a blockchain transaction hash for automated or manual verification.
* **Request Body:**
```json
{
  "orderId": "ord_94821",
  "txHash": "7b4df1209caef890218734208a9f65349071cf3183884cb4592dae04318c2049"
}
```

---

### Automated On-Chain Scanner & Manual Override

#### `GET /api/cron/crypto-scanner`
Scans all pending cryptocurrency orders with submitted transaction hashes against live blockchain explorer RPCs. Upon confirming required block confirmations, services are upgraded and invoices marked Paid.
* **Authentication:** `Authorization: Bearer <CRON_SECRET>` or `?token=<CRON_SECRET>`
* **Sample cURL:**
```bash
curl -X GET "https://mail.zegacloud.com/api/cron/crypto-scanner" \
  -H "Authorization: Bearer zegacloud-cron-secret"
```
* **Sample Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-19T11:50:00.000Z",
  "mode": "Automated On-Chain Scanner + Manual Override",
  "totalPendingScanned": 2,
  "activatedCount": 1,
  "results": [
    {
      "orderId": "ord_94821",
      "orderNumber": "WHMCS-ORD-2026-9482",
      "network": "Bitcoin Mainnet",
      "txHash": "7b4df1209caef890218734208a9f65349071cf3183884cb4592dae04318c2049",
      "confirmations": 3,
      "status": "activated",
      "activatedOrder": "WHMCS-ORD-2026-9482"
    }
  ]
}
```

#### `POST /api/cron/crypto-scanner`
Manual administrator override allowing WHMCS module administrators to force-approve any order.
* **Authentication:** Bearer Token or WHMCS Webhook Secret
* **Request Body:**
```json
{
  "orderId": "ord_94821",
  "action": "approve"
}
```

---

### WHMCS Module Integration Endpoints

#### `POST /api/internal/v1/whmcs/order-verify`
Webhook invoked by WHMCS modules upon order settlement.
* **Authentication:** `x-zegabytez-whmcs-secret` or `x-zegabytez-signature`
* **Request Body:**
```json
{
  "orderId": "ord_94821"
}
```
* **Sample cURL:**
```bash
curl -X POST https://mail.zegacloud.com/api/internal/v1/whmcs/order-verify \
  -H "Content-Type: application/json" \
  -H "x-zegabytez-whmcs-secret: super_secret_whmcs_webhook_token" \
  -d '{"orderId":"ord_94821"}'
```

#### `POST /api/internal/v1/whmcs/orders-list`
Returns complete order and invoice registry for display inside the WHMCS Admin Addon console.
* **Authentication:** `x-zegabytez-whmcs-secret`
* **Sample Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "invoices": [...],
    "totalOrders": 12
  }
}
```

---

## 5. Testing & Verification

### Running Automated Test Suite
```bash
pnpm test
```

### Interactive Test UI
Visit `https://mail.zegacloud.com/docs` to test every endpoint interactively directly inside your browser with live response inspection and copyable code snippets.
