import nodemailer from "nodemailer";

export interface SmtpConnectionConfig {
  host: string;
  port?: number;
  secure?: boolean; // true for 465, false for 587 (STARTTLS)
  auth: {
    user: string;
    pass: string;
  };
}

export interface SendMailOptions {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SmtpSendResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

export class SmtpTransportClient {
  private transporter: nodemailer.Transporter;

  constructor(config: SmtpConnectionConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port || 587,
      secure: config.secure ?? false,
      auth: config.auth,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
  }

  async send(options: SendMailOptions): Promise<SmtpSendResult> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to send email via SMTP",
      };
    }
  }

  async verify(): Promise<boolean> {
    try {
      return await this.transporter.verify();
    } catch {
      return false;
    }
  }
}
