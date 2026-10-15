import { pgTable, text, timestamp, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./tenancy";
import { users } from "./auth";

export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // e.g. "ord_94821"
  orderNumber: text("order_number").notNull().unique(), // "WHMCS-ORD-2026-9482"
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientEmail: text("client_email").notNull(),
  clientName: text("client_name").notNull(),
  planId: text("plan_id").notNull(), // 'starter', 'growth', 'pro'
  planName: text("plan_name").notNull(),
  billingCycle: text("billing_cycle").notNull(), // 'monthly', 'annually'
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentMethod: text("payment_method").notNull(), // 'crypto_usdt_trc20', 'crypto_btc', 'crypto_eth', 'crypto_sol', 'stripe_card'
  paymentMethodName: text("payment_method_name").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'active', 'cancelled'
  invoiceId: text("invoice_id").notNull(),
  cryptoDetails: jsonb("crypto_details").$type<{
    cryptoCurrency: "BTC" | "ETH" | "USDT_TRC20" | "USDT_ERC20" | "SOL";
    cryptoAmount: string;
    walletAddress: string;
    qrCodeUrl: string;
    network: string;
    txHash?: string;
    confirmations?: number;
    submittedAt?: string;
    verifiedAt?: string;
  }>(),
  whmcsOrderId: text("whmcs_order_id").notNull(),
  whmcsInvoiceId: text("whmcs_invoice_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(), // "WHMCS-INV-10942"
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("unpaid"), // 'unpaid', 'paid', 'cancelled'
  dueDate: text("due_date").notNull(),
  datePaid: timestamp("date_paid"),
  paymentMethod: text("payment_method").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cryptoGatewaySettings = pgTable("crypto_gateway_settings", {
  id: text("id").primaryKey().default("default"),
  verificationMode: text("verification_mode").notNull().default("automated"), // 'automated' | 'manual'
  minConfirmations: integer("min_confirmations").notNull().default(12),
  tronScanApiKey: text("tron_scan_api_key"),
  blockcypherApiKey: text("blockcypher_api_key"),
  etherscanApiKey: text("etherscan_api_key"),
  solanaRpcUrl: text("solana_rpc_url").default("https://api.mainnet-beta.solana.com"),
  usdtTrc20Address: text("usdt_trc20_address").notNull().default("TX7k1dZega9xMailTRC20Wallet88NVMe"),
  btcAddress: text("btc_address").notNull().default("bc1qzega9xmailcloud77anycast001btc"),
  ethAddress: text("eth_address").notNull().default("0x71C2ega9xMailAnycastNVMeCluster8842"),
  solAddress: text("sol_address").notNull().default("ZegaSoL9xMailAnycastClusterSolana99"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
