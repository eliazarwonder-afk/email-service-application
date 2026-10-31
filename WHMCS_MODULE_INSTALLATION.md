# WHMCS Module Installation & Configuration Guide

This guide provides step-by-step instructions to install and configure the ZegaMail integration suite in your WHMCS installation.

---

## 📁 1. Where the Module Files Are Located

In this repository, all WHMCS integration files are inside the `whmcs-module/` folder:

```text
email-service-application/
└── whmcs-module/
    ├── modules/
    │   ├── servers/
    │   │   └── zegabytezmail/
    │   │       └── zegabytezmail.php        <-- Server Provisioning & Client Area Manager
    │   └── addons/
    │       └── zegabytezmail_addon/
    │           └── zegabytezmail_addon.php  <-- Admin Master Control Dashboard
    └── includes/
        └── hooks/
            └── zegabytezmail_hooks.php      <-- DNS Automation & Auto-Unsuspend Hooks
```

---

## 🚀 2. Upload Files to Your WHMCS Server

Upload or copy each folder into your live WHMCS root directory (e.g. `/home/user/public_html/` or `/var/www/whmcs/`):

| File/Folder from Repository | Destination in Your WHMCS Directory |
| :--- | :--- |
| `whmcs-module/modules/servers/zegabytezmail` | `WHMCS_ROOT/modules/servers/zegabytezmail/` |
| `whmcs-module/modules/addons/zegabytezmail_addon` | `WHMCS_ROOT/modules/addons/zegabytezmail_addon/` |
| `whmcs-module/includes/hooks/zegabytezmail_hooks.php` | `WHMCS_ROOT/includes/hooks/zegabytezmail_hooks.php` |

### Terminal / SSH Upload Command:
```bash
# If uploading from the repository root to your WHMCS server:
cp -r whmcs-module/modules/servers/zegabytezmail /path/to/whmcs/modules/servers/
cp -r whmcs-module/modules/addons/zegabytezmail_addon /path/to/whmcs/modules/addons/
cp whmcs-module/includes/hooks/zegabytezmail_hooks.php /path/to/whmcs/includes/hooks/
```

---

## ⚙️ 3. Activate the Addon Module in WHMCS Admin

1. Log in to your **WHMCS Admin Area**.
2. Navigate to:
   - **WHMCS 8.x+**: **Configuration** (wrench icon) > **System Settings** > **Addon Modules**
   - **Older versions**: **Setup** > **Addon Modules**
3. Locate **ZegaMail Master Cluster & Crypto Billing Manager** in the list.
4. Click **Activate**.
5. Once activated, click **Configure** and set:
   - **ZegaMail API URL**: Your deployed webmail URL (e.g. `https://your-coolify-domain.sslip.io` or `https://mail.yourdomain.com`).
   - **API Webhook Secret**: Must match the `WHMCS_INTERNAL_WEBHOOK_SECRET` set in your Coolify / `.env` configuration.
   - **Master cPanel/WHM Server Host**: Your mail host (e.g. `mail.yourdomain.com`).
   - **Access Control**: Check **Full Administrator** so your admin role can access it.
6. Click **Save Changes**.

---

## 📦 4. Create Your Email Hosting Products in WHMCS

1. Go to **System Settings** > **Products/Services** > **Products/Services**.
2. Click **Create a New Product**:
   - **Product Type**: Select **Other** (or **Hosting Account**).
   - **Product Group**: Select or create an "Email Services" group.
   - **Product Name**: e.g., `Business Email Starter` or `Professional Mail Growth`.
3. In the product settings, navigate to the **Module Settings** tab:
   - **Module Name**: Select **ZegaMail Server & Mailbox Suite** (`zegabytezmail`).
   - Fill in the module parameters:
     - **API URL**: Your webmail app URL (e.g. `https://your-coolify-domain.sslip.io` or `https://mail.yourdomain.com`).
     - **Webhook Secret**: The same `WHMCS_INTERNAL_WEBHOOK_SECRET`.
     - **Package Plan**: Select `starter`, `growth`, `pro`, or `enterprise`.
     - **Max Mailboxes**: Max allowed inboxes for this plan (e.g. `5`, `10`, `30`).
     - **Storage Quota (MB)**: Pooled quota across all mailboxes (e.g. `10000` for 10 GB, `50000` for 50 GB).
   - **Automated Setup**: Choose:
     - `Automatically setup the product as soon as the first payment is received`.
4. Click **Save Changes**.

---

## 👤 5. Client Area Experience & 1-Click SSO

Once a customer orders and pays for the email product:
1. WHMCS automatically triggers the `_CreateAccount` hook to provision the mailbox and tenant organization.
2. In the customer's WHMCS **Client Area** under **My Services** > **Service Details**:
   - Clients see the embedded mailbox manager (create mailboxes, delete mailboxes, reset passwords, and check storage meters).
   - Clients can click **Launch Webmail (SSO)** to instantly log into ZegaMail webmail without entering a password.
3. Mobile setup parameters (IMAP port `993 SSL`, SMTP port `465 SSL`) are automatically displayed.

---

## 🔗 6. Webhook & Automation Hooks Verification

The hook file `includes/hooks/zegabytezmail_hooks.php` handles:
* **`AfterRegistrarRegistration`**: When a client registers or transfers a domain through WHMCS, the hook automatically configures the SPF, DKIM, MX, and DMARC zone records.
* **`InvoicePaid`**: Automatically unsuspends or upgrades mailbox quotas when an invoice is marked paid.

To verify:
- Edit `WHMCS_ROOT/includes/hooks/zegabytezmail_hooks.php` and verify that the `$apiUrl` and `$secret` variables match your web application environment.
