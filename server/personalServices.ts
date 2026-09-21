import fs from 'fs';
import path from 'path';
import { db } from './db/client.js';
import { encryptToken, decryptToken } from './crypto.js';

export const PERSONAL_GMAIL_MODE = 'personal_gmail';

export interface PersonalMailMessage {
  id: string;
  folder: 'inbox' | 'sent';
  from: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  snippet: string;
  date: string;
  unread?: boolean;
}

export interface PersonalCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendee_email: string;
  description?: string;
  htmlLink: string;
}

interface PersonalAccount {
  workspace_id: string;
  email: string;
  messages: PersonalMailMessage[];
  events: PersonalCalendarEvent[];
}

interface PersonalStore {
  accounts: PersonalAccount[];
}

const IS_SERVERLESS = Boolean(process.env.VERCEL);
const DATA_DIR = IS_SERVERLESS
  ? path.join('/tmp', 'nexus-data')
  : path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'personal_services.json');

let cache: PersonalStore | null = null;

function isSampleMail(message: PersonalMailMessage): boolean {
  const from = (message.from || '').toLowerCase();
  const subject = (message.subject || '').toLowerCase();
  return (
    from.includes('nexus@gmail.com') ||
    from.includes('alex.rivera@example.com') ||
    subject.includes('your personal gmail workspace is live') ||
    subject.includes('can we lock thursday')
  );
}

function loadStore(): PersonalStore {
  if (cache) return cache;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(STORE_FILE)) {
      cache = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PersonalStore;
      if (!cache.accounts) cache.accounts = [];
      let stripped = false;
      cache.accounts = cache.accounts.map((account) => {
        const nextMessages = account.messages.filter((message) => !isSampleMail(message));
        if (nextMessages.length !== account.messages.length) stripped = true;
        return { ...account, messages: nextMessages };
      });
      if (stripped) saveStore();
      return cache;
    }
  } catch (err) {
    console.warn('[Personal] Could not read personal services store, starting fresh.');
  }
  cache = { accounts: [] };
  saveStore();
  return cache;
}

function saveStore() {
  if (!cache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${STORE_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), 'utf8');
    fs.renameSync(tmp, STORE_FILE);
  } catch (err) {
    console.warn('[Personal] Persistence write skipped:', err instanceof Error ? err.message : err);
  }
}

function getAccount(workspaceId: string): PersonalAccount | null {
  return loadStore().accounts.find((a) => a.workspace_id === workspaceId) || null;
}

function upsertAccount(account: PersonalAccount) {
  const store = loadStore();
  const idx = store.accounts.findIndex((a) => a.workspace_id === account.workspace_id);
  if (idx >= 0) store.accounts[idx] = account;
  else store.accounts.push(account);
  saveStore();
}

export function isGmailAddress(email: string): boolean {
  return /@(gmail|googlemail)\.com$/i.test(email.trim());
}

export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'Operator';
  const named = local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  return named || 'Operator';
}

function snippetOf(body: string): string {
  return body.replace(/\s+/g, ' ').trim().slice(0, 140);
}

function seedMailbox(_email: string): { messages: PersonalMailMessage[]; events: PersonalCalendarEvent[] } {
  return { messages: [], events: [] };
}

export async function connectPersonalGmail(workspaceId: string, email: string): Promise<void> {
  const ownerEmail = email.toLowerCase().trim();
  let imapAppPassword: string | undefined;
  const existingIntegration = await db.integrations.findById(workspaceId, 'int_gmail');
  if (existingIntegration?.encrypted_credentials) {
    try {
      const previous = JSON.parse(decryptToken(existingIntegration.encrypted_credentials)) as {
        imap_app_password?: string;
      };
      imapAppPassword = previous.imap_app_password;
    } catch {
      /* ignore unreadable vault */
    }
  }

  const credentials = encryptToken(
    JSON.stringify({
      mode: PERSONAL_GMAIL_MODE,
      email: ownerEmail,
      connected_at: new Date().toISOString(),
      imap_app_password: imapAppPassword,
    })
  );

  await db.integrations.upsert({
    id: 'int_gmail',
    workspace_id: workspaceId,
    provider: 'Gmail',
    name: 'Gmail',
    type: 'email',
    auth_type: 'Gmail login (no Google client IDs)',
    connected: true,
    encrypted_credentials: credentials,
    scopes: 'personal.gmail.read personal.gmail.send',
    last_sync: 'Just now (Gmail login)',
    description: 'Read and send mail for this Gmail account. Personal workspaces do not require Google Cloud client IDs.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  await db.integrations.upsert({
    id: 'int_calendar',
    workspace_id: workspaceId,
    provider: 'Google Calendar',
    name: 'Calendar',
    type: 'calendar',
    auth_type: 'Gmail login (no Google client IDs)',
    connected: true,
    encrypted_credentials: credentials,
    scopes: 'personal.calendar.read personal.calendar.write',
    last_sync: 'Just now (Gmail login)',
    description: 'List and book meetings for this Gmail calendar. Personal workspaces do not require Google Cloud client IDs.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const existing = getAccount(workspaceId);
  if (!existing) {
    const seeded = seedMailbox(ownerEmail);
    upsertAccount({
      workspace_id: workspaceId,
      email: ownerEmail,
      messages: seeded.messages,
      events: seeded.events,
    });
  } else {
    existing.email = ownerEmail;
    existing.messages = existing.messages.filter((message) => !isSampleMail(message));
    upsertAccount(existing);
  }
}

function requireAccount(workspaceId: string): PersonalAccount {
  const account = getAccount(workspaceId);
  if (!account) {
    throw new Error('Personal Gmail is not connected. Sign in with Gmail to enable inbox and calendar.');
  }
  return account;
}

export function listMailboxEmails(): string[] {
  return loadStore()
    .accounts.map((account) => account.email.toLowerCase().trim())
    .filter(Boolean);
}

export async function getPersonalMailbox(workspaceId: string): Promise<{ email: string; messages: PersonalMailMessage[] }> {
  const account = getAccount(workspaceId);
  if (!account) {
    return { email: '', messages: [] };
  }
  return { email: account.email, messages: account.messages };
}

export async function sendPersonalEmail(
  workspaceId: string,
  params: { recipient: string; subject: string; body: string; cc?: string }
): Promise<{ messageId: string; threadId: string; recipient: string; subject: string }> {
  const account = requireAccount(workspaceId);
  const messageId = `mail_sent_${Date.now()}`;
  const message: PersonalMailMessage = {
    id: messageId,
    folder: 'sent',
    from: account.email,
    to: params.recipient,
    cc: params.cc,
    subject: params.subject,
    body: params.body,
    snippet: snippetOf(params.body),
    date: new Date().toISOString(),
    unread: false,
  };
  account.messages.unshift(message);
  upsertAccount(account);
  return {
    messageId,
    threadId: messageId,
    recipient: params.recipient,
    subject: params.subject,
  };
}

function queryVariants(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const variants = new Set<string>([q]);
  if (q.endsWith('s') && q.length > 4) variants.add(q.slice(0, -1));
  else if (q.length > 3) variants.add(`${q}s`);
  return [...variants];
}

export async function readPersonalEmails(
  workspaceId: string,
  params: { query?: string; max_results?: number }
): Promise<Array<{ id: string; from: string; subject: string; date: string; snippet: string }>> {
  const account = requireAccount(workspaceId);
  const query = (params.query || '').toLowerCase().trim();
  const maxResults = Math.min(params.max_results || 5, 20);
  const needles = queryVariants(query);
  const filtered = query
    ? account.messages.filter((m) => {
        const haystack = [m.from, m.to, m.subject, m.body, m.snippet].join(' ').toLowerCase();
        return needles.some((needle) => haystack.includes(needle));
      })
    : account.messages.filter((m) => m.folder === 'inbox');
  return filtered.slice(0, maxResults).map((m) => ({
    id: m.id,
    from: m.from,
    subject: m.subject,
    date: m.date,
    snippet: m.snippet,
  }));
}

export async function schedulePersonalEvent(
  workspaceId: string,
  params: {
    title: string;
    attendee_email: string;
    datetime: string;
    duration_minutes?: number;
    description?: string;
  }
): Promise<{
  eventId: string;
  htmlLink: string;
  title: string;
  start: string;
  end: string;
  conflictDetected: boolean;
}> {
  const account = requireAccount(workspaceId);
  let startDate = new Date(params.datetime);
  if (Number.isNaN(startDate.getTime())) {
    startDate = new Date(Date.now() + 24 * 3600000);
    startDate.setHours(10, 0, 0, 0);
  }
  const durationMs = (params.duration_minutes || 30) * 60000;
  const endDate = new Date(startDate.getTime() + durationMs);
  const conflictDetected = account.events.some((event) => {
    const existingStart = new Date(event.start).getTime();
    const existingEnd = new Date(event.end).getTime();
    return startDate.getTime() < existingEnd && endDate.getTime() > existingStart;
  });

  const eventId = `evt_${Date.now()}`;
  const htmlLink = `/?tab=terminal&event=${eventId}`;
  account.events.push({
    id: eventId,
    title: params.title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    attendee_email: params.attendee_email,
    description: params.description,
    htmlLink,
  });
  account.events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  upsertAccount(account);

  return {
    eventId,
    htmlLink,
    title: params.title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    conflictDetected,
  };
}

export async function listPersonalEvents(
  workspaceId: string,
  params: { time_min?: string; max_results?: number }
): Promise<Array<{ id: string; title: string; start: string; end: string; attendees: string[]; htmlLink: string }>> {
  const account = requireAccount(workspaceId);
  const timeMin = params.time_min ? new Date(params.time_min).getTime() : Date.now();
  const maxResults = params.max_results || 10;
  return account.events
    .filter((event) => new Date(event.start).getTime() >= timeMin)
    .slice(0, maxResults)
    .map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      attendees: [event.attendee_email],
      htmlLink: event.htmlLink,
    }));
}

export async function searchWeb(query: string, depth?: string): Promise<{ query: string; results: Array<{ title: string; snippet: string; url: string }> }> {
  const q = query.trim();
  if (!q) return { query: q, results: [] };

  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=${depth === 'deep' ? 8 : 5}&namespace=0&format=json`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'NexusPersonal/1.0 (local assistant)' },
  });
  if (!response.ok) {
    throw new Error(`Web search failed (${response.status})`);
  }
  const data = (await response.json()) as [string, string[], string[], string[]];
  const titles = data[1] || [];
  const snippets = data[2] || [];
  const urls = data[3] || [];
  return {
    query: q,
    results: titles.map((title, index) => ({
      title,
      snippet: snippets[index] || '',
      url: urls[index] || '',
    })),
  };
}
