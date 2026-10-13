export interface WhmConfig {
  host: string;
  port?: number;
  username: string; // usually 'root' or reseller username
  apiToken: string;
  secure?: boolean;
}

export interface WhmCreateAccountOptions {
  username: string;
  domain: string;
  contactEmail: string;
  plan?: string;
  quotaMb?: number;
  password?: string;
}

export interface WhmAccountResult {
  success: boolean;
  username: string;
  domain: string;
  message?: string;
  raw?: any;
}

export class WhmApiClient {
  private host: string;
  private port: number;
  private username: string;
  private apiToken: string;
  private secure: boolean;
  private isMock: boolean;

  constructor(config?: Partial<WhmConfig>) {
    this.host = config?.host || process.env.WHM_HOST || process.env.CPANEL_HOST || "localhost";
    this.port = config?.port || (process.env.WHM_PORT ? parseInt(process.env.WHM_PORT, 10) : 2087);
    this.username = config?.username || process.env.WHM_USERNAME || "root";
    this.apiToken = config?.apiToken || process.env.WHM_API_TOKEN || process.env.CPANEL_API_TOKEN || "";
    this.secure = config?.secure ?? (process.env.WHM_SECURE !== "false");

    this.isMock =
      !this.apiToken ||
      this.apiToken.includes("API_TOKEN_HERE") ||
      this.host === "localhost" ||
      process.env.NODE_ENV === "test";
  }

  private async callWhmApi<T = any>(
    func: string,
    params: Record<string, string | number> = {}
  ): Promise<{ status: number; statusmsg?: string; data?: T; metadata?: any }> {
    if (this.isMock) {
      console.log(`[WHM API Mock] Function: ${func}`, params);
      return {
        status: 1,
        statusmsg: `Mock WHM call ${func} succeeded`,
        data: {} as T,
      };
    }

    const queryParams = new URLSearchParams();
    queryParams.append("api.version", "1");
    for (const [k, v] of Object.entries(params)) {
      queryParams.append(k, String(v));
    }

    const protocol = this.secure ? "https" : "http";
    const url = `${protocol}://${this.host}:${this.port}/json-api/${func}?${queryParams.toString()}`;

    const headers = {
      Authorization: `whm ${this.username}:${this.apiToken}`,
      Accept: "application/json",
    };

    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`WHM API HTTP ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as any;
    const metadata = result.metadata || {};
    if (metadata.result === 0) {
      throw new Error(`WHM API Error [${func}]: ${metadata.reason || "Unknown WHM error"}`);
    }

    return {
      status: metadata.result,
      statusmsg: metadata.reason,
      data: result.data,
      metadata,
    };
  }

  /**
   * Provision a brand-new dedicated cPanel account for an organization
   */
  async createDedicatedAccount(options: WhmCreateAccountOptions): Promise<WhmAccountResult> {
    if (this.isMock) {
      console.log(`[WHM Mock] Created dedicated cPanel account: ${options.username} for ${options.domain}`);
      return {
        success: true,
        username: options.username,
        domain: options.domain,
        message: "Mock: Dedicated cPanel account provisioned successfully",
      };
    }

    const res = await this.callWhmApi("createacct", {
      username: options.username,
      domain: options.domain,
      contactemail: options.contactEmail,
      plan: options.plan || "default",
      quota: options.quotaMb || 25000,
      password: options.password || "TempPass!" + Math.random().toString(36).slice(2, 10),
    });

    return {
      success: res.status === 1,
      username: options.username,
      domain: options.domain,
      message: res.statusmsg,
      raw: res.data,
    };
  }

  /**
   * Suspend a cPanel account (e.g. overdue WHMCS invoice)
   */
  async suspendAccount(username: string, reason = "Overdue WHMCS invoice"): Promise<boolean> {
    if (this.isMock) {
      console.log(`[WHM Mock] Suspended cPanel account: ${username}`);
      return true;
    }

    const res = await this.callWhmApi("suspendacct", {
      user: username,
      reason,
    });
    return res.status === 1;
  }

  /**
   * Unsuspend a cPanel account (e.g. WHMCS invoice paid)
   */
  async unsuspendAccount(username: string): Promise<boolean> {
    if (this.isMock) {
      console.log(`[WHM Mock] Unsuspended cPanel account: ${username}`);
      return true;
    }

    const res = await this.callWhmApi("unsuspendacct", {
      user: username,
    });
    return res.status === 1;
  }

  /**
   * Terminate/Remove a cPanel account
   */
  async terminateAccount(username: string): Promise<boolean> {
    if (this.isMock) {
      console.log(`[WHM Mock] Terminated cPanel account: ${username}`);
      return true;
    }

    const res = await this.callWhmApi("removeacct", {
      user: username,
    });
    return res.status === 1;
  }
}
