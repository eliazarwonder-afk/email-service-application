/**
 * Centralized Open Source Application Configuration
 * All external platform, billing, and cluster URLs are loaded from environment variables.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ZegaMail";
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Enterprise Cloud Infrastructure";
export const PORTAL_NAME = process.env.NEXT_PUBLIC_PORTAL_NAME || "Client Portal";

export const WHMCS_BASE_URL = process.env.NEXT_PUBLIC_WHMCS_BASE_URL || process.env.WHMCS_BASE_URL || "";
export const WHMCS_API_URL = process.env.WHMCS_API_URL || (WHMCS_BASE_URL ? `${WHMCS_BASE_URL}/includes/api.php` : "");

export const MAIL_CLUSTER_HOST = process.env.NEXT_PUBLIC_MAIL_CLUSTER_HOST || process.env.CPANEL_CLUSTER_HOST || "mail.example.com";

/**
 * Construct WHMCS cart ordering link for products or domain registrations.
 */
export function getWhmcsCartUrl(params?: {
  pid?: number | string;
  billingcycle?: string;
  domain?: string;
}): string {
  const base = process.env.NEXT_PUBLIC_WHMCS_BASE_URL || WHMCS_BASE_URL;
  if (!base) return "#";

  const url = new URL(`${base.replace(/\/+$/, "")}/cart.php`);
  if (!params) return url.toString();

  if (params.pid) {
    url.searchParams.set("a", "add");
    url.searchParams.set("pid", String(params.pid));
    if (params.billingcycle) {
      url.searchParams.set("billingcycle", params.billingcycle);
    }
  } else if (params.domain) {
    url.searchParams.set("a", "add");
    url.searchParams.set("domain", "register");
    url.searchParams.set("query", params.domain);
  }
  return url.toString();
}

/**
 * Construct link to WHMCS upgrade / add-on subscription page.
 */
export function getWhmcsUpgradeUrl(): string {
  const base = process.env.NEXT_PUBLIC_WHMCS_BASE_URL || WHMCS_BASE_URL;
  return base ? `${base.replace(/\/+$/, "")}/upgrade.php` : "#";
}

/**
 * Construct link to WHMCS client area invoices page.
 */
export function getWhmcsInvoicesUrl(): string {
  const base = process.env.NEXT_PUBLIC_WHMCS_BASE_URL || WHMCS_BASE_URL;
  return base ? `${base.replace(/\/+$/, "")}/clientarea.php?action=invoices` : "#";
}

/**
 * Construct link to WHMCS client area homepage.
 */
export function getWhmcsClientAreaUrl(): string {
  const base = process.env.NEXT_PUBLIC_WHMCS_BASE_URL || WHMCS_BASE_URL;
  return base ? `${base.replace(/\/+$/, "")}/clientarea.php` : "#";
}

/**
 * Construct link to WHMCS domain registration page.
 */
export function getWhmcsDomainRegisterUrl(domain?: string): string {
  const base = process.env.NEXT_PUBLIC_WHMCS_BASE_URL || WHMCS_BASE_URL;
  if (!base) return "#";
  const url = new URL(`${base.replace(/\/+$/, "")}/cart.php?a=add&domain=register`);
  if (domain) {
    url.searchParams.set("query", domain);
  }
  return url.toString();
}
