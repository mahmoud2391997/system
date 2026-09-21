import { ImapFlow } from 'imapflow';

function compactAppPassword(appPassword: string): string {
  return appPassword.replace(/\s+/g, '').trim();
}

function gmailSearchRaw(query: string): string {
  const q = query.replace(/["\\]/g, ' ').trim();
  if (!q) return 'newer_than:14d';
  const alt = q.endsWith('s') && q.length > 4 ? q.slice(0, -1) : `${q}s`;
  if (alt && alt !== q) return `${q} OR ${alt}`;
  return q;
}

async function withGmailImap<T>(
  email: string,
  appPassword: string,
  run: (client: ImapFlow) => Promise<T>
): Promise<T> {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: compactAppPassword(appPassword),
    },
    logger: false,
  });

  await client.connect();
  try {
    return await run(client);
  } finally {
    try {
      await client.logout();
    } catch {
      /* ignore */
    }
  }
}

export async function verifyGmailImap(email: string, appPassword: string): Promise<void> {
  await withGmailImap(email, appPassword, async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    lock.release();
  });
}

export async function searchGmailImap(
  email: string,
  appPassword: string,
  params: { query?: string; max_results?: number }
): Promise<Array<{ id: string; from: string; subject: string; date: string; snippet: string }>> {
  const query = (params.query || '').trim();
  const maxResults = Math.min(params.max_results || 10, 20);

  return withGmailImap(email, appPassword, async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      let uids: number[] | false = false;
      try {
        uids = await client.search({ raw: `X-GM-RAW "${gmailSearchRaw(query)}"` }, { uid: true });
      } catch {
        uids = query
          ? await client.search({ or: [{ from: query }, { subject: query }, { body: query }] }, { uid: true })
          : await client.search({ since: new Date(Date.now() - 14 * 86400000) }, { uid: true });
      }
      const selected = (uids || []).slice(-maxResults).reverse();
      if (selected.length === 0) return [];

      const details: Array<{ id: string; from: string; subject: string; date: string; snippet: string }> = [];
      for await (const msg of client.fetch(selected, { uid: true, envelope: true })) {
        const envelope = msg.envelope;
        const fromParts = envelope?.from || [];
        const from =
          fromParts
            .map((part) => part.address || part.name || '')
            .filter(Boolean)
            .join(', ') || '(Unknown)';
        const subject = envelope?.subject || '(No Subject)';
        const date = envelope?.date ? new Date(envelope.date).toISOString() : '';
        details.push({
          id: String(msg.uid),
          from,
          subject,
          date,
          snippet: subject,
        });
      }
      return details;
    } finally {
      lock.release();
    }
  });
}
