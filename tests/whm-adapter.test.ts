import { describe, it, expect } from "vitest";
import { WhmApiClient } from "../packages/mail-core/src/cpanel/whm";

describe("WHM Account Provisioning Adapter Spike", () => {
  const whm = new WhmApiClient({
    host: "localhost",
    username: "root",
    apiToken: "MOCK_TOKEN",
  });

  it("should create dedicated cPanel account for an organization in mock mode", async () => {
    const res = await whm.createDedicatedAccount({
      username: "zgm_org1042",
      domain: "acme.com",
      contactEmail: "admin@acme.com",
      quotaMb: 25000,
      plan: "zegabytez-mail-pro",
    });

    expect(res.success).toBe(true);
    expect(res.username).toBe("zgm_org1042");
    expect(res.domain).toBe("acme.com");
  });

  it("should suspend dedicated cPanel account", async () => {
    const res = await whm.suspendAccount("zgm_org1042", "Overdue Invoice");
    expect(res).toBe(true);
  });

  it("should unsuspend dedicated cPanel account", async () => {
    const res = await whm.unsuspendAccount("zgm_org1042");
    expect(res).toBe(true);
  });

  it("should terminate dedicated cPanel account", async () => {
    const res = await whm.terminateAccount("zgm_org1042");
    expect(res).toBe(true);
  });
});
