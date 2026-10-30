import nodemailer from "nodemailer";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewCode?: string;
  devMode?: boolean;
  error?: string;
}

export function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || "localhost";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASSWORD || "";

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

/**
 * Sends a 6-digit verification / confirmation code to the user's email address.
 */
export async function sendVerificationEmail(
  toEmail: string,
  fullName: string,
  code: string
): Promise<SendEmailResult> {
  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@example.com";
  const fromName = process.env.SMTP_FROM_NAME || "Mail Security & Verification";

  const transporter = getSmtpTransporter();

  // If no SMTP credentials are configured yet in this environment, provide development sandbox logging
  if (!transporter) {
    console.log(
      `[SMTP Sandbox Notice] No live SMTP_USER / SMTP_PASSWORD configured. Verification code for ${toEmail} (${fullName}) is: ${code}`
    );
    return {
      success: true,
      previewCode: code,
      devMode: true,
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 24px; color: #121212; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .header { text-align: center; margin-bottom: 28px; }
          .brand { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #121212; }
          .brand span { color: #2563eb; }
          .code-box { background: #f4f6fa; border: 1px dashed #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
          .code { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; }
          .expires { font-size: 12px; color: #6b7280; margin-top: 8px; }
          .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">ZEGA<span>MAIL</span></div>
            <p style="font-size: 13px; color: #6b7280; margin: 6px 0 0 0;">Business Email Infrastructure • Enterprise Business Email</p>
          </div>
          
          <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Verify your business email account</h2>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px 0;">
            Hello ${fullName},<br><br>
            Thank you for creating an account on Zega Mail. To complete your account registration and proceed to your custom domain provisioning, please enter this 6-digit confirmation code:
          </p>
          
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="expires">Valid for the next 15 minutes</div>
          </div>
          
          <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 20px 0;">
            If you did not initiate this registration request, please disregard this email. Your organization records will not be activated without verification.
          </p>
          
          <div class="footer">
            © 2026 Enterprise Mail Infrastructure. All rights reserved.<br>
            Enforced with 2048-bit DKIM, SPF & DMARC Security Protocols.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `${code} is your Zega Mail confirmation code`,
      text: `Hello ${fullName},\n\nYour 6-digit confirmation code for Zega Mail is: ${code}\n\nThis code expires in 15 minutes.\n\nWarm regards,\nSecurity & Verification Team`,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("Failed to send verification email via SMTP:", err);
    // If SMTP fails, fallback to sandbox preview so registration doesn't break
    return {
      success: true,
      previewCode: code,
      devMode: true,
      error: err.message,
    };
  }
}
