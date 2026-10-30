# ZegaMail Integration & Architecture Guide
**Enterprise White-Label Business Email & Client Outreach Architecture**
*Open-Source Business Mail Architecture*

---

## 1. Executive Architecture Overview

ZegaMail operates on a distributed, carrier-grade mail architecture designed to replace expensive per-seat monopoly services (Google Workspace at \$7.20/user/mo and Microsoft 365 at \$6.00/user/mo) with predictable, flat-rate pricing (\$4.50 Starter, \$12.00 Growth, \$29.00 Enterprise Pro; or ₦6,500, ₦18,000, ₦43,500 in NGN).

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                     User Visitor                       │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
                                         ┌─────────────────────┴────────────────────┐
                                         │ Geo-Location & Currency Switcher Engine  │
                                         │ (Africa / Nigeria -> NGN / Paystack/FLW) │
                                         │ (Global / US / EU -> USD / Stripe/Crypto)│
                                         └─────────────────────┬────────────────────┘
                                                               │
                      ┌────────────────────────────────────────┼────────────────────────────────────────┐
                      │                                        │                                        │
                      ▼                                        ▼                                        ▼
             ┌─────────────────┐                     ┌─────────────────┐                      ┌─────────────────┐
             │ Interactive Demo│                     │ WHMCS Billing   │                      │  cPanel UAPI    │
             │ Area (Isolated) │                     │ & SSO Gateway   │                      │ Mail Provision  │
             └────────┬────────┘                     └────────┬────────┘                      └────────┬────────┘
                      │ (Zero external API traffic)           │                                        │
                      │ (Fast in-memory mock store)           │                                        │
                      ▼                                       ▼                                        ▼
               Instant Preview                      - Domain WHOIS Search                    - Mailbox Creation
               Mailbox Experience                   - Client Registration                    - Dovecot Quota Check
               Without Server Load                  - One-Click SSO Token                    - DNS Telemetry (DKIM/SPF)
                                                    - Paystack / FLW / Stripe                - Exim SMTP TLS 1.3 Dispatch
```

---

## 2. Environment Configuration Reference

Add these variables to your `.env.local` or production container deployment:

```bash
# ==============================================================================
# 1. APPLICATION & DOMAIN BASE URL
# ==============================================================================
NEXT_PUBLIC_APP_URL="https://mail.yourdomain.com"

# ==============================================================================
# 2. WHMCS API INTEGRATION (Domain Search, Registration, Orders & Client SSO)
# Documentation: https://developers.whmcs.com/api/
# ==============================================================================
WHMCS_API_URL="https://billing.yourdomain.com/includes/api.php"
WHMCS_API_IDENTIFIER="your_whmcs_api_identifier"
WHMCS_API_SECRET="your_whmcs_api_secret"
WHMCS_API_ACCESS_KEY="optional_whmcs_ip_access_key"
# Alternative basic auth if API roles aren't used:
# WHMCS_API_USERNAME="admin"
# WHMCS_API_PASSWORD="admin_password"

# ==============================================================================
# 3. cPanel UAPI INTEGRATION (Dovecot Mailboxes, DNS Telemetry, Exim MTA)
# Documentation: https://api.docs.cpanel.net/openapi/cpanel/overview/
# ==============================================================================
CPANEL_HOST="cpanel.yourdomain.com"
CPANEL_USER="cpaneluser"
CPANEL_API_TOKEN="CPANEL_UAPI_TOKEN_HEX_STRING_HERE"
CPANEL_DEFAULT_QUOTA_MB="5000"

# ==============================================================================
# 4. BILLING & PORTAL ARCHITECTURE (CENTRALIZED IN WHMCS)
# ==============================================================================
# All payment gateways (Paystack, Flutterwave, Stripe, Crypto) are configured
# and processed centrally inside the Client Portal (billing.yourdomain.com).
# No payment gateway secret keys are needed or stored in this web application.
```

---

## 3. WHMCS API Operations & Implementation

### A. Domain Search & Availability
- **Endpoint**: `/api/domains/search?domain=companyname.com`
- **WHMCS Action**: `DomainWhois`
- **Behavior**: Checks availability on registrars. In development or when credentials are unconfigured, uses smart sandbox simulation with full pricing matrix for `.com`, `.ng`, `.com.ng`, `.net`, `.org`, `.io`, and `.africa`.

### B. Client Registration & Order Placement
- **Endpoint**: `/api/billing/checkout` (POST)
- **WHMCS Actions**: `AddClient`, `AddOrder`
- **Workflow**:
  1. Computes plan price from regional currency matrix.
  2. Creates order and invoice record.
  3. Prepares direct payment link via Paystack, Flutterwave, or Stripe.

### C. One-Click Client Area SSO
- **Endpoint**: `/api/auth/whmcs-sso` (POST or GET)
- **WHMCS Action**: `CreateSsoToken`
- **Parameters**: `client_id`, `destination: "clientarea:home"`
- **Redirect**: Redirects client directly to authenticated client management dashboard without prompting for separate passwords.

---

## 4. cPanel UAPI Mailbox Provisioning & Exim MTA

### A. Mailbox Provisioning Pipeline
- **Endpoint**: `/api/mailboxes` (POST)
- **cPanel Module**: `Email`
- **UAPI Function**: `add_pop`
- **Payload**:
  ```json
  {
    "email": "sales",
    "domain": "acmedesign.co",
    "password": "StrongPassword#2026",
    "quota": 5000
  }
  ```
- **Returns**: Full account provisioning confirmation, storage allocations, and live DNS telemetry records.

### B. Automated DNS Telemetry Generation
Every provisioned mailbox returns exact DNS records to ensure 99.9% inbox deliverability:
1. **MX Record**: Priority `10`, Host `@`, Value `mail.{domain}`
2. **SPF Record**: Host `@`, Value `v=spf1 include:spf.zegamail.com ~all`
3. **2048-bit DKIM**: Host `default._domainkey`, Value `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...`
4. **DMARC Record**: Host `_dmarc`, Value `v=DMARC1; p=quarantine; sp=quarantine; rua=mailto:dmarc@{domain}`

### C. Mail Dispatch via cPanel Exim MTA (RFC 3461 Verified Delivery)
- Outgoing emails route through cPanel Exim SMTP on port 465 with TLS 1.3 encryption.
- Delivery status tracking queries remote MTA responses. When remote server responds with `250 OK`, ZegaMail displays the **Delivered ✓✓** double-tick indicator directly in the inbox.

---

## 5. Centralized Billing & Checkout Architecture

All payment settlement is handled directly by the Billing Platform (`billing.yourdomain.com`):
- **Starter Plan**: Direct cart link (`cart.php?a=add&pid=1`)
- **Growth Plan**: Direct cart link (`cart.php?a=add&pid=2`)
- **Pro Plan**: Direct cart link (`cart.php?a=add&pid=3`)
- **Domain Registrations**: Direct registrar cart link (`cart.php?a=add&domain=register&query=...`)

Gateways enabled in WHMCS (Paystack, Flutterwave, Stripe, Crypto) process funds directly with zero intermediary handling by the webmail client.

---

## 6. Demo Mode Isolation Guarantee

To protect production server resources:
1. **Zero External API Overhead**: Demo mode strictly runs against mock data in `@/lib/store.ts`.
2. **Interactive Personas**: Users can test Owner, Sales, and Support roles without consuming cPanel API quotas or creating external registrar domains.
3. **Seamless Transition**: Clicking "Get Real Account" or selecting a pricing plan carries user selections directly into the official registration pipeline.
