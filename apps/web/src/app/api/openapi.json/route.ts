import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.1.0",
    info: {
      title: "ZegaMail Business Email & Provisioning API",
      version: "2.1.0",
      description:
        "High-performance API for multi-tenant business email, cPanel Exim/Dovecot mail routing, multi-touch cold email campaigns, and automated cryptocurrency billing integration for WHMCS.",
      contact: {
        name: "Support & Community",
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "{serverUrl}",
        description: "Active deployment instance",
        variables: {
          serverUrl: {
            default: "http://localhost:3000",
            description: "Base host domain of your deployed instance",
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        SessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "zega_session",
          description: "Session token generated on POST /api/auth/login",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Admin or Cron token authentication (e.g. CRON_SECRET)",
        },
        WhmcsSecret: {
          type: "apiKey",
          in: "header",
          name: "x-zegabytez-whmcs-secret",
          description: "Master webhook secret for WHMCS server and addon integration",
        },
        HmacSignature: {
          type: "apiKey",
          in: "header",
          name: "x-zegabytez-signature",
          description: "HMAC-SHA256 signature for secure webhook payload validation",
        },
      },
      schemas: {
        StandardSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        StandardErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Invalid credentials or unauthorized" },
            retryAfterMs: { type: "integer" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "alex@acmedesign.co" },
            password: { type: "string", example: "SecurePassword123!" },
          },
        },
        SendMailRequest: {
          type: "object",
          required: ["to", "subject", "content"],
          properties: {
            to: { type: "string", format: "email", example: "partner@example.com" },
            subject: { type: "string", example: "Project Proposal & Pricing" },
            content: { type: "string", example: "Hello team, please find attached..." },
            isHtml: { type: "boolean", default: false },
            attachments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        CheckoutOrderRequest: {
          type: "object",
          required: ["planId", "billingCycle", "paymentMethod"],
          properties: {
            planId: { type: "string", enum: ["starter", "growth", "pro"], example: "growth" },
            billingCycle: { type: "string", enum: ["monthly", "annually"], example: "monthly" },
            paymentMethod: {
              type: "string",
              enum: ["crypto_usdt_trc20", "crypto_btc", "crypto_eth", "crypto_sol", "stripe_card"],
              example: "crypto_usdt_trc20",
            },
            clientEmail: { type: "string", format: "email" },
            clientName: { type: "string" },
          },
        },
        SubmitCryptoTxRequest: {
          type: "object",
          required: ["orderId", "txHash"],
          properties: {
            orderId: { type: "string", example: "ord_init_002" },
            txHash: {
              type: "string",
              example: "7b4df1209caef890218734208a9f65349071cf3183884cb4592dae04318c2049",
            },
          },
        },
      },
    },
    paths: {
      "/api/auth/login": {
        post: {
          summary: "Authenticate User & Establish Session",
          description: "Verifies user credentials with rate limiting and returns profile and session cookie.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: { description: "Successfully authenticated." },
            401: { description: "Invalid email or password." },
            429: { description: "Rate limit exceeded (too many attempts)." },
          },
        },
      },
      "/api/mail": {
        get: {
          summary: "List Inbound & Outbound Messages",
          description: "Retrieves mailbox messages filtered by folder (inbox, sent, drafts, archive, spam).",
          security: [{ SessionCookie: [] }],
          parameters: [
            { name: "folder", in: "query", schema: { type: "string", default: "inbox" } },
            { name: "q", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "List of messages." },
          },
        },
        post: {
          summary: "Dispatch Outbound Email via cPanel Exim Bridge",
          description: "Sends email over direct TLS 1.3 SMTP with RFC 3461 DSN delivery notifications.",
          security: [{ SessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SendMailRequest" },
              },
            },
          },
          responses: {
            200: { description: "Email accepted by cPanel Exim with 250 OK." },
          },
        },
      },
      "/api/billing/checkout": {
        post: {
          summary: "Create Subscription Order & Crypto Invoice",
          description: "Provisions a pending order and returns deposit address and QR code.",
          security: [{ SessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutOrderRequest" },
              },
            },
          },
          responses: {
            200: { description: "Order created with crypto deposit details." },
          },
        },
      },
      "/api/billing/orders": {
        get: {
          summary: "List Organization Orders & Invoices",
          description: "Fetches all WHMCS billing orders and invoice statuses for the current organization.",
          security: [{ SessionCookie: [] }],
          responses: {
            200: { description: "Orders and invoices." },
          },
        },
        post: {
          summary: "Submit Blockchain Transaction Hash",
          description: "Attaches a transaction hash to a pending crypto order for blockchain verification.",
          security: [{ SessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SubmitCryptoTxRequest" },
              },
            },
          },
          responses: {
            200: { description: "Transaction hash recorded." },
          },
        },
      },
      "/api/cron/crypto-scanner": {
        get: {
          summary: "Automated On-Chain Scanner Worker",
          description: "Scans all pending crypto orders against on-chain RPCs and activates confirmed orders.",
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Scan results and activated orders." },
          },
        },
        post: {
          summary: "Manual Admin Payment Override",
          description: "Allows administrators to force-approve or activate a pending crypto order.",
          security: [{ BearerAuth: [] }, { WhmcsSecret: [] }],
          responses: {
            200: { description: "Order approved manually." },
          },
        },
      },
      "/api/internal/v1/whmcs/order-verify": {
        post: {
          summary: "WHMCS Webhook: Verify & Activate Order",
          description: "Activates a service and marks invoice as paid. Protected by WHMCS secret or HMAC signature.",
          security: [{ WhmcsSecret: [] }, { HmacSignature: [] }],
          responses: {
            200: { description: "Order verified and activated." },
            401: { description: "Unauthorized secret or signature." },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "System Health Probe",
          description: "Lightweight health check for Docker, Coolify Sentinel, and load balancers.",
          responses: {
            200: { description: "Service is healthy." },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
