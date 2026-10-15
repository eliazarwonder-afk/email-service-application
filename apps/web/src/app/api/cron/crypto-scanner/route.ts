import { NextResponse } from "next/server";
import { readDb, verifyAndActivateOrder } from "@/lib/store";
import { verifyBlockchainTx } from "@/lib/blockchain-verifier";

/**
 * Automated Blockchain On-Chain Scanner Worker
 * Scans all pending crypto transactions submitted across USDT TRC-20, BTC, ETH, and SOL.
 * Activates services and marks WHMCS invoices as Paid upon confirmation.
 * Also provides manual override approval/rejection capabilities for administrators.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "zegacloud-cron-secret";

    // Allow internal WHMCS addon calls, authorized bearer tokens, or query param tokens
    const token = authHeader?.replace("Bearer ", "") || searchParams.get("token");
    if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET && token !== cronSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized cron token." }, { status: 401 });
    }

    const db = readDb();
    const pendingOrders = (db.orders || []).filter(
      (o) => o.status === "pending" && o.cryptoDetails && o.cryptoDetails.txHash && !o.cryptoDetails.verifiedAt
    );

    const scanResults = [];

    for (const order of pendingOrders) {
      if (!order.cryptoDetails?.txHash) continue;

      const verification = await verifyBlockchainTx({
        paymentMethod: order.paymentMethod,
        txHash: order.cryptoDetails.txHash,
        expectedAddress: order.cryptoDetails.walletAddress,
        expectedAmount: order.cryptoDetails.cryptoAmount,
      });

      if (verification.verified) {
        const activated = verifyAndActivateOrder(order.id);
        scanResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          network: verification.network,
          txHash: order.cryptoDetails.txHash,
          confirmations: verification.confirmations,
          status: "activated",
          activatedOrder: activated?.orderNumber,
        });
      } else {
        scanResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          network: verification.network,
          txHash: order.cryptoDetails.txHash,
          confirmations: verification.confirmations,
          status: "awaiting_confirmations",
          reason: verification.error || "Awaiting required block confirmations.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: "Automated On-Chain Scanner + Manual Override",
      totalPendingScanned: pendingOrders.length,
      activatedCount: scanResults.filter((r) => r.status === "activated").length,
      results: scanResults,
    });
  } catch (err: any) {
    console.error("[Cron Crypto Scanner] Execution error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute crypto scanner" },
      { status: 500 }
    );
  }
}

/**
 * Manual Admin Override POST
 * Allows WHMCS administrator to immediately approve or force-verify a pending crypto order.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, action, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required field 'orderId'." },
        { status: 400 }
      );
    }

    if (action === "approve" || action === "activate" || !action) {
      const activated = verifyAndActivateOrder(orderId);
      if (!activated) {
        return NextResponse.json(
          { success: false, error: `Order '${orderId}' not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Order #${activated.orderNumber} successfully approved via manual administrator override.`,
        order: activated,
      });
    }

    return NextResponse.json(
      { success: false, error: `Action '${action}' is not supported.` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[Cron Crypto Scanner Override] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process manual override." },
      { status: 500 }
    );
  }
}
