import { describe, it, expect } from "vitest";
import {
  createDomainSchema,
  createMailboxSchema,
  whmcsProvisionSchema,
  sendEmailSchema,
  createApiKeySchema,
} from "../packages/shared/src/index";

describe("Shared Schemas & DTO Validation", () => {
  it("should validate valid and invalid domains", () => {
    expect(createDomainSchema.safeParse({ domainName: "zegabytez.com" }).success).toBe(true);
    expect(createDomainSchema.safeParse({ domainName: "sub.company.ng" }).success).toBe(true);
    expect(createDomainSchema.safeParse({ domainName: "not-a-domain" }).success).toBe(false);
  });

  it("should validate mailbox creation input", () => {
    const valid = {
      domainId: "c2a93448-f58c-4bc4-b778-956891ebc56e",
      localPart: "info",
      quotaMb: 5000,
    };
    expect(createMailboxSchema.safeParse(valid).success).toBe(true);

    const invalidLocal = {
      ...valid,
      localPart: "invalid local with spaces!",
    };
    expect(createMailboxSchema.safeParse(invalidLocal).success).toBe(false);
  });

  it("should validate WHMCS provisioning payload", () => {
    const validOrder = {
      orderId: "WHMCS-10492",
      whmcsClientId: 42,
      clientEmail: "ceo@acme.com",
      clientName: "Acme Corp",
      packagePlan: "zegabytez-mail-business",
      maxMailboxes: 10,
      storageLimitMb: 50000,
      primaryDomain: "acme.com",
    };
    expect(whmcsProvisionSchema.safeParse(validOrder).success).toBe(true);
  });

  it("should validate outbound send email payload", () => {
    const validEmail = {
      to: ["recipient@example.com"],
      subject: "Monthly Statement",
      text: "Please find attached your statement.",
      html: "<p>Please find attached your statement.</p>",
    };
    expect(sendEmailSchema.safeParse(validEmail).success).toBe(true);

    const invalidEmail = {
      to: ["not-an-email"],
      subject: "Test",
    };
    expect(sendEmailSchema.safeParse(invalidEmail).success).toBe(false);
  });

  it("should validate developer API key creation", () => {
    expect(
      createApiKeySchema.safeParse({
        name: "Zapier Integration Key",
        scopes: ["mail.send", "mail.read"],
      }).success
    ).toBe(true);
  });
});
