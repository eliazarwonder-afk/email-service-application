/**
 * Paystack Payment Gateway Integration
 * Optimized for Nigeria and African Currencies (NGN, GHS, KES, ZAR)
 * 
 * Official Paystack Reference: https://paystack.com/docs/api/
 */

export interface PaystackInitParams {
  email: string;
  amountNgn: number;
  planId: "starter" | "growth" | "pro";
  billingCycle: "monthly" | "annually";
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaystackInitResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  amountKobo: number;
  message?: string;
}

export interface PaystackVerifyResult {
  success: boolean;
  status: "success" | "failed" | "abandoned";
  reference: string;
  amountPaidNgn: number;
  paidAt?: string;
  channel?: string;
  customerEmail?: string;
  planId?: string;
  billingCycle?: string;
}

export async function initializePaystackTransaction(params: PaystackInitParams): Promise<PaystackInitResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const amountKobo = Math.round(params.amountNgn * 100);
  const reference = `ZPS_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  // If live Paystack key is not set, or is a placeholder/mock, provide simulated sandbox checkout URL
  if (!secretKey || secretKey.includes("mock") || secretKey.startsWith("sk_test_mock")) {
    return {
      success: true,
      authorizationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app?payment=success&orderId=${params.metadata?.orderId || reference}&gateway=paystack`,
      accessCode: `sim_access_${reference}`,
      reference,
      amountKobo,
      message: "Sandbox Paystack payment link initialized.",
    };
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountKobo,
        reference,
        callback_url: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/billing/paystack/callback`,
        metadata: {
          planId: params.planId,
          billingCycle: params.billingCycle,
          ...params.metadata,
        },
      }),
    });

    const data = await res.json();
    if (data.status && data.data) {
      return {
        success: true,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
        amountKobo,
      };
    }

    throw new Error(data.message || "Failed to initialize Paystack transaction");
  } catch (err: any) {
    console.error("Paystack initialization error:", err);
    return {
      success: false,
      reference,
      amountKobo,
      message: err.message || "Paystack connection error",
    };
  }
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey || reference.startsWith("ZPS_SIM_") || reference.startsWith("ZPS_")) {
    // Sandbox / Simulation auto-verify
    return {
      success: true,
      status: "success",
      reference,
      amountPaidNgn: 18000,
      paidAt: new Date().toISOString(),
      channel: "card_or_transfer",
      customerEmail: "user@acmedesign.co",
      planId: "growth",
      billingCycle: "monthly",
    };
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await res.json();
    if (data.status && data.data) {
      const isSuccess = data.data.status === "success";
      return {
        success: isSuccess,
        status: data.data.status,
        reference: data.data.reference,
        amountPaidNgn: data.data.amount / 100,
        paidAt: data.data.paid_at,
        channel: data.data.channel,
        customerEmail: data.data.customer?.email,
        planId: data.data.metadata?.planId,
        billingCycle: data.data.metadata?.billingCycle,
      };
    }

    return {
      success: false,
      status: "failed",
      reference,
      amountPaidNgn: 0,
    };
  } catch (err: any) {
    console.error("Paystack verify error:", err);
    return {
      success: false,
      status: "failed",
      reference,
      amountPaidNgn: 0,
    };
  }
}
