import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { buildApp } from "../apps/api/src/server";
import type { FastifyInstance } from "fastify";
import crypto from "crypto";

describe("WHMCS One-Click SSO & Provisioning Flow", () => {
  let app: FastifyInstance;
  const secret = process.env.WHMCS_INTERNAL_WEBHOOK_SECRET || "super_secret_whmcs_webhook_token";

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.BETTER_AUTH_URL = "http://localhost:4000";
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should generate a valid SSO launch URL via POST /internal/v1/whmcs/sso-token", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/internal/v1/whmcs/sso-token",
      headers: {
        "x-zegabytez-whmcs-secret": secret,
      },
      payload: {
        whmcsClientId: 88,
        email: "sso-user@zegabytez.com",
        name: "SSO Customer",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ssoUrl).toBeDefined();
    expect(body.token).toBeDefined();
    expect(body.expiresInSeconds).toBe(300);
  });

  it("should reject expired or forged SSO tokens on GET /api/v1/auth/sso", async () => {
    // 1. Forged token
    const resFake = await app.inject({
      method: "GET",
      url: "/api/v1/auth/sso?token=forged.signature",
    });
    expect(resFake.statusCode).toBe(401);

    // 2. Expired token (iat & exp in the past)
    const expiredPayload = {
      whmcsClientId: 88,
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000) - 600,
      exp: Math.floor(Date.now() / 1000) - 300,
    };
    const b64 = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
    const expiredToken = `${b64}.${sig}`;

    const resExpired = await app.inject({
      method: "GET",
      url: `/api/v1/auth/sso?token=${expiredToken}`,
    });
    expect(resExpired.statusCode).toBe(401);
  });
});
