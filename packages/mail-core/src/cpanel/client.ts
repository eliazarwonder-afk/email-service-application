export interface CpanelConfig {
  host: string;
  port?: number;
  username: string;
  apiToken: string;
  secure?: boolean;
}

export interface CpanelMailboxResult {
  success: boolean;
  email: string;
  message?: string;
  errors?: string[];
  data?: any;
}

export interface CpanelDiskUsage {
  diskUsedMb: number;
  diskQuotaMb: number;
  percentUsed: number;
}

export class CpanelUapiClient {
  private host: string;
  private port: number;
  private username: string;
  private apiToken: string;
  private secure: boolean;
  private isMock: boolean;

  constructor(config?: Partial<CpanelConfig>) {
    this.host = config?.host || process.env.CPANEL_HOST || "localhost";
    this.port = config?.port || (process.env.CPANEL_PORT ? parseInt(process.env.CPANEL_PORT, 10) : 2083);
    this.username = config?.username || process.env.CPANEL_USERNAME || "cpanel_user";
    this.apiToken = config?.apiToken || process.env.CPANEL_API_TOKEN || "";
    this.secure = config?.secure ?? (process.env.CPANEL_SECURE !== "false");

    // Enable mock mode if no real token is provided
    this.isMock = !this.apiToken || this.apiToken.includes("CPANEL_API_TOKEN_HERE") || this.host === "localhost";
  }

  /**
   * Helper to execute a cPanel UAPI function call
   */
  private async executeUapi<T = any>(
    module: string,
    func: string,
    params: Record<string, string | number> = {}
  ): Promise<{ status: number; data: T; errors?: string[]; messages?: string[] }> {
    if (this.isMock) {
      console.log(`[cPanel UAPI Mock] ${module}::${func}`, params);
      return {
        status: 1,
        data: {} as T,
        messages: ["Mock execution succeeded"],
      };
    }

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, String(value));
    }

    const protocol = this.secure ? "https" : "http";
    const url = `${protocol}://${this.host}:${this.port}/execute/${module}/${func}?${queryParams.toString()}`;

    const headers = {
      Authorization: `cpanel ${this.username}:${this.apiToken}`,
      Accept: "application/json",
    };

    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`cPanel UAPI HTTP Error ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as any;
    if (result.status === 0) {
      throw new Error(
        `cPanel UAPI Error [${module}::${func}]: ${result.errors?.join(", ") || "Unknown error"}`
      );
    }

    return result;
  }

  /**
   * Provision a new mailbox on cPanel
   */
  async createMailbox(
    emailLocalPart: string,
    domain: string,
    password: string,
    quotaMb = 5000
  ): Promise<CpanelMailboxResult> {
    const fullEmail = `${emailLocalPart}@${domain}`;

    if (this.isMock) {
      console.log(`[cPanel Mock] Provisioned mailbox: ${fullEmail} (Quota: ${quotaMb}MB)`);
      return { success: true, email: fullEmail, message: "Mock: Mailbox created successfully" };
    }

    const res = await this.executeUapi("Email", "add_pop", {
      email: emailLocalPart,
      domain,
      password,
      quota: quotaMb,
      skip_update_db: 0,
    });

    return {
      success: res.status === 1,
      email: fullEmail,
      message: res.messages?.[0],
      errors: res.errors,
      data: res.data,
    };
  }

  /**
   * Update the password of an existing mailbox
   */
  async updatePassword(
    emailLocalPart: string,
    domain: string,
    newPassword: string
  ): Promise<CpanelMailboxResult> {
    const fullEmail = `${emailLocalPart}@${domain}`;

    if (this.isMock) {
      console.log(`[cPanel Mock] Password updated for: ${fullEmail}`);
      return { success: true, email: fullEmail, message: "Mock: Password updated successfully" };
    }

    const res = await this.executeUapi("Email", "passwd_pop", {
      email: emailLocalPart,
      domain,
      password: newPassword,
    });

    return {
      success: res.status === 1,
      email: fullEmail,
      message: res.messages?.[0],
      errors: res.errors,
    };
  }

  /**
   * Delete an email account
   */
  async deleteMailbox(emailLocalPart: string, domain: string): Promise<CpanelMailboxResult> {
    const fullEmail = `${emailLocalPart}@${domain}`;

    if (this.isMock) {
      console.log(`[cPanel Mock] Deleted mailbox: ${fullEmail}`);
      return { success: true, email: fullEmail, message: "Mock: Mailbox deleted successfully" };
    }

    const res = await this.executeUapi("Email", "delete_pop", {
      email: emailLocalPart,
      domain,
    });

    return {
      success: res.status === 1,
      email: fullEmail,
      message: res.messages?.[0],
      errors: res.errors,
    };
  }

  /**
   * Retrieve disk usage & quota for an email account
   */
  async getMailboxUsage(emailLocalPart: string, domain: string): Promise<CpanelDiskUsage> {
    if (this.isMock) {
      return { diskUsedMb: 120, diskQuotaMb: 5000, percentUsed: 2.4 };
    }

    const res = await this.executeUapi("Email", "get_disk_usage", {
      user: emailLocalPart,
      domain,
    });

    const diskUsedBytes = res.data?.diskused || 0;
    const diskQuotaBytes = res.data?.diskquota || 0;

    const diskUsedMb = Math.round(diskUsedBytes / (1024 * 1024));
    const diskQuotaMb = Math.round(diskQuotaBytes / (1024 * 1024));
    const percentUsed = diskQuotaMb > 0 ? (diskUsedMb / diskQuotaMb) * 100 : 0;

    return { diskUsedMb, diskQuotaMb, percentUsed: parseFloat(percentUsed.toFixed(1)) };
  }

  /**
   * Suspend login and incoming mail
   */
  async suspendMailbox(emailLocalPart: string, domain: string): Promise<boolean> {
    if (this.isMock) return true;

    await this.executeUapi("Email", "suspend_login", { email: emailLocalPart, domain });
    await this.executeUapi("Email", "suspend_incoming", { email: emailLocalPart, domain });
    return true;
  }

  /**
   * Unsuspend login and incoming mail
   */
  async unsuspendMailbox(emailLocalPart: string, domain: string): Promise<boolean> {
    if (this.isMock) return true;

    await this.executeUapi("Email", "unsuspend_login", { email: emailLocalPart, domain });
    await this.executeUapi("Email", "unsuspend_incoming", { email: emailLocalPart, domain });
    return true;
  }
}
