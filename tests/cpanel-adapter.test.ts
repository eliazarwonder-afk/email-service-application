import { describe, it, expect } from "vitest";
import { CpanelUapiClient } from "../packages/mail-core/src/cpanel/client";

describe("cPanel Provisioning Adapter Spike", () => {
  const client = new CpanelUapiClient({
    host: "localhost",
    username: "testuser",
    apiToken: "CPANEL_API_TOKEN_HERE",
  });

  it("should create a mailbox in mock mode", async () => {
    const res = await client.createMailbox("sales", "zegabytez.com", "SecurePass123!", 5000);
    expect(res.success).toBe(true);
    expect(res.email).toBe("sales@zegabytez.com");
  });

  it("should update password in mock mode", async () => {
    const res = await client.updatePassword("sales", "zegabytez.com", "NewSecurePass456!");
    expect(res.success).toBe(true);
    expect(res.email).toBe("sales@zegabytez.com");
  });

  it("should fetch disk usage in mock mode", async () => {
    const usage = await client.getMailboxUsage("sales", "zegabytez.com");
    expect(usage.diskQuotaMb).toBe(5000);
    expect(usage.diskUsedMb).toBeGreaterThanOrEqual(0);
    expect(usage.percentUsed).toBeDefined();
  });

  it("should suspend and unsuspend a mailbox", async () => {
    const suspendRes = await client.suspendMailbox("sales", "zegabytez.com");
    expect(suspendRes).toBe(true);

    const unsuspendRes = await client.unsuspendMailbox("sales", "zegabytez.com");
    expect(unsuspendRes).toBe(true);
  });

  it("should delete a mailbox in mock mode", async () => {
    const res = await client.deleteMailbox("sales", "zegabytez.com");
    expect(res.success).toBe(true);
  });
});
