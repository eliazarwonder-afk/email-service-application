/**
 * Flutterwave Payment Gateway Integration
 * Supports Pan-African Mobile Money (M-Pesa, MTN MoMo, Airtel), Cards, and Bank Accounts.
 * 
 * Official Flutterwave Reference: https://developer.flutterwave.com/
 */

export interface FlutterwaveInitParams {
  email: string;
  name: string;
  amount: number;
  currency: "NGN" | "USD" | "GHS" | "KES" | "ZAR";
  planId: "starter" | "growth" | "pro";
  billingCycle: "monthly" | "annually";
  redirectUrl?: string;
  txRef?: string;
}

export interface FlutterwaveInitResult {
  success: boolean;
  paymentLink?: string;
  txRef: string;
  message?: string;
}

export async function initializeFlutterwavePayment(params: FlutterwaveInitParams): Promise<FlutterwaveInitResult> {
  const secretKey = process.env.FLW_SECRET_KEY;
  const txRef = params.txRef || `ZFLW_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  if (!secretKey) {
    return {
      success: true,
      paymentLink: `/checkout/flutterwave-simulate?txRef=${txRef}&amount=${params.amount}&currency=${params.currency}`,
      txRef,
      message: "Sandbox Flutterwave payment link initialized.",
    };
  }

  try {
    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: params.amount,
        currency: params.currency,
        redirect_url: params.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/billing/flutterwave/callback`,
        customer: {
          email: params.email,
          name: params.name,
        },
        customizations: {
          title: `ZegaMail ${params.planId.toUpperCase()} Subscription`,
          description: `Dedicated Business Email Infrastructure (${params.billingCycle})`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/branding/logo-icon.png`,
        },
        meta: {
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
      }),
    });

    const data = await res.json();
    if (data.status === "success" && data.data?.link) {
      return {
        success: true,
        paymentLink: data.data.link,
        txRef,
      };
    }

    throw new Error(data.message || "Failed to initialize Flutterwave payment");
  } catch (err: any) {
    console.error("Flutterwave initialization error:", err);
    return {
      success: false,
      txRef,
      message: err.message || "Flutterwave connection error",
    };
  }
}

export async function verifyFlutterwaveTransaction(transactionId: string): Promise<{
  success: boolean;
  status: string;
  txRef?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
}> {
  const secretKey = process.env.FLW_SECRET_KEY;

  if (!secretKey) {
    return {
      success: true,
      status: "successful",
      txRef: `ZFLW_SIM_${Date.now()}`,
      amount: 18000,
      currency: "NGN",
      customerEmail: "user@acmedesign.co",
    };
  }

  try {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await res.json();
    if (data.status === "success" && data.data) {
      return {
        success: data.data.status === "successful",
        status: data.data.status,
        txRef: data.data.tx_ref,
        amount: data.data.amount,
        currency: data.data.currency,
        customerEmail: data.data.customer?.email,
      };
    }

    return { success: false, status: "failed" };
  } catch (err: any) {
    console.error("Flutterwave verification error:", err);
    return { success: false, status: "failed" };
  }
}
