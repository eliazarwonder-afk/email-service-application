import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export interface ImapConnectionConfig {
  host: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface MailFolder {
  path: string;
  name: string;
  delimiter: string;
  specialUse?: string;
  unreadCount?: number;
  totalCount?: number;
}

export interface MailHeaderSummary {
  uid: number;
  seq: number;
  subject: string;
  from?: { name?: string; address?: string };
  to?: Array<{ name?: string; address?: string }>;
  date?: string;
  flags: string[];
  hasAttachments: boolean;
  size: number;
}

export interface MessageDetail extends MailHeaderSummary {
  text?: string;
  html?: string;
  attachments: Array<{
    filename?: string;
    contentType: string;
    size: number;
    contentId?: string;
  }>;
}

export class ImapMailboxClient {
  private client: ImapFlow;

  constructor(config: ImapConnectionConfig) {
    this.client = new ImapFlow({
      host: config.host,
      port: config.port || 993,
      secure: config.secure ?? true,
      auth: config.auth,
      logger: false,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async logout(): Promise<void> {
    try {
      await this.client.logout();
    } catch {
      // Ignored if already disconnected
    }
  }

  /**
   * List all mailbox folders
   */
  async listFolders(): Promise<MailFolder[]> {
    const list = await this.client.list();
    return list.map((f) => ({
      path: f.path,
      name: f.name,
      delimiter: f.delimiter,
      specialUse: f.specialUse,
    }));
  }

  /**
   * List message summaries in a folder with pagination
   */
  async listMessages(
    folderPath = "INBOX",
    page = 1,
    limit = 25
  ): Promise<{ messages: MailHeaderSummary[]; total: number }> {
    const lock = await this.client.getMailboxLock(folderPath);
    try {
      const mailbox = this.client.mailbox;
      if (!mailbox || mailbox.exists === 0) {
        return { messages: [], total: 0 };
      }

      const total = mailbox.exists;
      const startSeq = Math.max(1, total - page * limit + 1);
      const endSeq = Math.max(1, total - (page - 1) * limit);

      const seqRange = `${startSeq}:${endSeq}`;
      const messages: MailHeaderSummary[] = [];

      for await (const msg of this.client.fetch(seqRange, {
        envelope: true,
        flags: true,
        size: true,
        uid: true,
      })) {
        const envelope = msg.envelope;
        messages.push({
          uid: msg.uid,
          seq: msg.seq,
          subject: envelope?.subject || "(No Subject)",
          from: envelope?.from?.[0]
            ? { name: envelope.from[0].name, address: envelope.from[0].address }
            : undefined,
          to: envelope?.to?.map((t) => ({ name: t.name, address: t.address })),
          date: envelope?.date?.toISOString(),
          flags: Array.from(msg.flags || []),
          hasAttachments: false, // In a full fetch this is parsed from bodyStructure
          size: msg.size || 0,
        });
      }

      // Return reverse ordered (newest first)
      return { messages: messages.reverse(), total };
    } finally {
      lock.release();
    }
  }

  /**
   * Fetch full message content by UID
   */
  async getMessage(folderPath: string, uid: number): Promise<MessageDetail | null> {
    const lock = await this.client.getMailboxLock(folderPath);
    try {
      const msg = await this.client.fetchOne(String(uid), {
        source: true,
        uid: true,
        envelope: true,
        flags: true,
        size: true,
      }, { uid: true });

      if (!msg || !msg.source) return null;

      const parsed = await simpleParser(msg.source);

      return {
        uid: msg.uid,
        seq: msg.seq,
        subject: parsed.subject || "(No Subject)",
        from: parsed.from?.value[0]
          ? { name: parsed.from.value[0].name, address: parsed.from.value[0].address }
          : undefined,
        to: parsed.to
          ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]).flatMap((addr) =>
              addr.value.map((v) => ({ name: v.name, address: v.address }))
            )
          : undefined,
        date: parsed.date?.toISOString(),
        flags: Array.from(msg.flags || []),
        hasAttachments: parsed.attachments.length > 0,
        size: msg.size || 0,
        text: parsed.text,
        html: (parsed.html as string) || undefined,
        attachments: parsed.attachments.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          size: a.size,
          contentId: a.contentId,
        })),
      };
    } finally {
      lock.release();
    }
  }
}
