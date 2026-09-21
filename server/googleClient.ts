import { db } from './db/client.js';
import { encryptToken, decryptToken } from './crypto.js';
import {
  PERSONAL_GMAIL_MODE,
  listPersonalEvents,
  readPersonalEmails,
  schedulePersonalEvent,
  sendPersonalEmail,
} from './personalServices.js';
import { searchGmailImap, verifyGmailImap } from './gmailImap.js';

export interface GoogleCredentials {
  mode?: string;
  email?: string;
  imap_app_password?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
}

async function loadGmailCredentials(workspaceId: string): Promise<GoogleCredentials> {
  const integration = await db.integrations.findById(workspaceId, 'int_gmail');
  if (!integration || !integration.connected || !integration.encrypted_credentials) {
    throw new Error('Gmail is not connected. Sign in with Gmail to enable inbox and calendar.');
  }

  try {
    return JSON.parse(decryptToken(integration.encrypted_credentials)) as GoogleCredentials;
  } catch (err: any) {
    throw new Error('Failed to decrypt Gmail credentials: ' + err.message);
  }
}

function isPersonalGmail(creds: GoogleCredentials): boolean {
  return creds.mode === PERSONAL_GMAIL_MODE || (!creds.refresh_token && !creds.access_token && Boolean(creds.email));
}

function resolveImapAppPassword(creds: GoogleCredentials): string {
  return (creds.imap_app_password || process.env.GMAIL_IMAP_APP_PASSWORD || '').replace(/\s+/g, '').trim();
}

export async function getGmailConnectionMode(
  workspaceId: string
): Promise<'personal_gmail' | 'gmail_imap' | 'google_oauth' | 'none'> {
  try {
    const creds = await loadGmailCredentials(workspaceId);
    if (!isPersonalGmail(creds)) return 'google_oauth';
    if (resolveImapAppPassword(creds) && creds.email) return 'gmail_imap';
    return PERSONAL_GMAIL_MODE;
  } catch {
    return 'none';
  }
}

export async function tryAttachGmailImapFromPassword(
  workspaceId: string,
  email: string,
  password: string
): Promise<boolean> {
  const candidates = Array.from(
    new Set([password.replace(/\s+/g, '').trim(), password.trim()].filter((value) => value.length >= 6))
  );
  for (const candidate of candidates) {
    try {
      await saveGmailImapPassword(workspaceId, email, candidate);
      return true;
    } catch {
      /* Google rejected this password for IMAP; try the next form */
    }
  }
  return false;
}

export async function saveGmailImapPassword(
  workspaceId: string,
  email: string,
  appPassword: string
): Promise<void> {
  const ownerEmail = email.toLowerCase().trim();
  const password = appPassword.replace(/\s+/g, '').trim();
  await verifyGmailImap(ownerEmail, password);

  let existing: GoogleCredentials = { mode: PERSONAL_GMAIL_MODE, email: ownerEmail };
  try {
    existing = await loadGmailCredentials(workspaceId);
  } catch {
    /* first live-inbox connect */
  }

  const integration = await db.integrations.findById(workspaceId, 'int_gmail');
  const creds: GoogleCredentials = {
    ...existing,
    mode: PERSONAL_GMAIL_MODE,
    email: ownerEmail,
    imap_app_password: password,
  };
  const encrypted = encryptToken(JSON.stringify(creds));
  const now = new Date().toISOString();
  await db.integrations.upsert({
    id: 'int_gmail',
    workspace_id: workspaceId,
    provider: 'Gmail',
    name: 'Gmail',
    type: 'email',
    auth_type: 'Gmail IMAP (App Password)',
    connected: true,
    encrypted_credentials: encrypted,
    scopes: integration?.scopes || 'personal.gmail.read personal.gmail.send',
    last_sync: 'Just now (live Gmail IMAP)',
    description:
      integration?.description ||
      'Live Gmail inbox search via IMAP. Uses a Gmail App Password, not Google Cloud client IDs.',
    created_at: integration?.created_at || now,
    updated_at: now,
  });
}

/**
 * Resolves a valid Google Access Token for the specified workspace.
 * Automatically refreshes using refresh_token if expired.
 */
export async function getGoogleAccessToken(workspaceId: string): Promise<string> {
  const integration = await db.integrations.findById(workspaceId, 'int_gmail');
  const creds = await loadGmailCredentials(workspaceId);
  if (isPersonalGmail(creds)) {
    throw new Error('Personal Gmail login does not use Google OAuth access tokens.');
  }

  const now = Date.now();
  if (creds.access_token && creds.expires_at && creds.expires_at > now + 60000) {
    return creds.access_token;
  }

  // Refresh token if needed and refresh_token is available
  if (creds.refresh_token && creds.client_id && creds.client_secret) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: creds.client_id,
          client_secret: creds.client_secret,
          refresh_token: creds.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Failed to refresh token');
      }

      creds.access_token = data.access_token;
      creds.expires_at = Date.now() + (data.expires_in || 3600) * 1000;

      if (integration) {
        integration.encrypted_credentials = encryptToken(JSON.stringify(creds));
        integration.updated_at = new Date().toISOString();
        await db.integrations.upsert(integration);
      }

      return creds.access_token!;
    } catch (err: any) {
      throw new Error(`Google token refresh failed: ${err.message}`);
    }
  }

  if (creds.access_token) {
    return creds.access_token;
  }

  throw new Error('Google Workspace credentials require re-authentication. No valid token found.');
}

/**
 * Dispatches an email via the official Gmail API (v1)
 */
export async function sendGmailMessage(
  workspaceId: string,
  params: {
    recipient: string;
    subject: string;
    body: string;
    cc?: string;
  }
): Promise<{ messageId: string; threadId: string; recipient: string; subject: string }> {
  const creds = await loadGmailCredentials(workspaceId);
  if (isPersonalGmail(creds)) {
    return sendPersonalEmail(workspaceId, params);
  }
  const token = await getGoogleAccessToken(workspaceId);

  // Construct standard RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${params.recipient}`,
    params.cc ? `Cc: ${params.cc}` : '',
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    params.body,
  ].filter(Boolean);

  const rawMessage = messageParts.join('\r\n');
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.error?.message || 'Failed to send message via Gmail API';
    throw new Error(`Gmail API error (${response.status}): ${errorMsg}`);
  }

  return {
    messageId: data.id,
    threadId: data.threadId,
    recipient: params.recipient,
    subject: params.subject,
  };
}

/**
 * Reads recent emails via the official Gmail API (v1)
 */
export async function readGmailMessages(
  workspaceId: string,
  params: { query?: string; max_results?: number }
): Promise<any[]> {
  const creds = await loadGmailCredentials(workspaceId);
  if (isPersonalGmail(creds)) {
    const imapPassword = resolveImapAppPassword(creds);
    if (imapPassword && creds.email) {
      return searchGmailImap(creds.email, imapPassword, params);
    }
    return readPersonalEmails(workspaceId, params);
  }
  const token = await getGoogleAccessToken(workspaceId);
  const q = encodeURIComponent(params.query || 'newer_than:7d');
  const maxResults = Math.min(params.max_results || 5, 20);

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const listData = await listRes.json();
  if (!listRes.ok) {
    throw new Error(`Gmail API list error: ${listData.error?.message || 'Unknown error'}`);
  }

  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch snippets for each message
  const details = await Promise.all(
    listData.messages.slice(0, 5).map(async (m: { id: string }) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '(Unknown)';
      const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

      return {
        id: m.id,
        from,
        subject,
        date,
        snippet: msgData.snippet,
      };
    })
  );

  return details;
}

/**
 * Books an event on Google Calendar (v3) with conflict detection
 */
export async function scheduleGoogleCalendarEvent(
  workspaceId: string,
  params: {
    title: string;
    attendee_email: string;
    datetime: string;
    duration_minutes?: number;
    description?: string;
  }
): Promise<{ eventId: string; htmlLink: string; title: string; start: string; end: string; conflictDetected: boolean }> {
  const creds = await loadGmailCredentials(workspaceId);
  if (isPersonalGmail(creds)) {
    return schedulePersonalEvent(workspaceId, params);
  }
  const token = await getGoogleAccessToken(workspaceId);

  // Parse start and end times
  let startDate = new Date(params.datetime);
  if (isNaN(startDate.getTime())) {
    // If not valid ISO, default to tomorrow at 10:00 AM
    startDate = new Date(Date.now() + 24 * 3600000);
    startDate.setHours(10, 0, 0, 0);
  }

  const durationMs = (params.duration_minutes || 30) * 60000;
  const endDate = new Date(startDate.getTime() + durationMs);

  // Check for conflicts using freeBusy query
  let conflictDetected = false;
  try {
    const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: 'primary' }],
      }),
    });
    const freeBusyData = await freeBusyRes.json();
    const busySlots = freeBusyData.calendars?.primary?.busy || [];
    if (busySlots.length > 0) {
      conflictDetected = true;
    }
  } catch (err) {
    console.warn('FreeBusy conflict check warning:', err);
  }

  const eventPayload = {
    summary: params.title,
    description: params.description || `Nexus Autonomous Operations Meeting\nCounterparty: ${params.attendee_email}`,
    start: {
      dateTime: startDate.toISOString(),
    },
    end: {
      dateTime: endDate.toISOString(),
    },
    attendees: [{ email: params.attendee_email }],
    reminders: {
      useDefault: true,
    },
  };

  const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  const eventData = await createRes.json();
  if (!createRes.ok) {
    const msg = eventData.error?.message || 'Failed to create Google Calendar event';
    throw new Error(`Google Calendar API error (${createRes.status}): ${msg}`);
  }

  return {
    eventId: eventData.id,
    htmlLink: eventData.htmlLink || `https://calendar.google.com/calendar/event?eid=${eventData.id}`,
    title: params.title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    conflictDetected,
  };
}

/**
 * Lists upcoming calendar events
 */
export async function listGoogleCalendarEvents(
  workspaceId: string,
  params: { time_min?: string; max_results?: number }
): Promise<any[]> {
  const creds = await loadGmailCredentials(workspaceId);
  if (isPersonalGmail(creds)) {
    return listPersonalEvents(workspaceId, params);
  }
  const token = await getGoogleAccessToken(workspaceId);
  const timeMin = encodeURIComponent(params.time_min || new Date().toISOString());
  const maxResults = params.max_results || 10;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Calendar list error: ${data.error?.message || 'Unknown error'}`);
  }

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.summary,
    start: item.start?.dateTime || item.start?.date,
    end: item.end?.dateTime || item.end?.date,
    attendees: (item.attendees || []).map((a: any) => a.email),
    htmlLink: item.htmlLink,
  }));
}
