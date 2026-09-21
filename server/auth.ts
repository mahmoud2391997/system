import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from './db/client.js';
import { hashPassword, verifyPassword } from './crypto.js';
import { randomBytes } from 'crypto';
import { Workspace, WorkspaceMember } from '../src/types.js';
import { connectPersonalGmail, displayNameFromEmail, isGmailAddress } from './personalServices.js';
import { getTierConfig } from './store.js';
import { tryAttachGmailImapFromPassword } from './googleClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_session_super_secret_jwt_key_2026';
const TOKEN_EXPIRY = '7d';

export interface AuthSession {
  userId: string;
  email: string;
  workspaceId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  workspace?: Workspace;
  member?: WorkspaceMember;
}

export function generateToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export function signOAuthState(payload: {
  workspaceId?: string;
  userId?: string;
  intent?: 'login' | 'connect';
  returnTo?: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function verifyOAuthState(stateToken: string): {
  workspaceId?: string;
  userId?: string;
  intent?: 'login' | 'connect';
  returnTo?: string;
} | null {
  try {
    return jwt.verify(stateToken, JWT_SECRET) as {
      workspaceId?: string;
      userId?: string;
      intent?: 'login' | 'connect';
      returnTo?: string;
    };
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header or Cookie
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if ((req as any).cookies && (req as any).cookies.nexus_session) {
    return (req as any).cookies.nexus_session;
  }
  return null;
}

/**
 * Register a new user and create their initial Personal Workspace
 */
export async function registerUser(email: string, password: string, name: string) {
  const existing = await db.users.findByEmail(email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const workspaceSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-ws';
  const workspaceId = `ws_${workspaceSlug}_${Math.random().toString(36).slice(2, 6)}`;

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'OP';

  const user = await db.users.create({
    id: userId,
    email: email.toLowerCase().trim(),
    password_hash: hashPassword(password),
    name,
    avatar: initials,
    created_at: new Date().toISOString(),
  });

  const workspace = await db.workspaces.create(
    {
      id: workspaceId,
      name: `${name}'s Operations`,
      slug: workspaceSlug,
      created_at: new Date().toISOString(),
      current_user_role: 'owner',
    },
    userId
  );

  const member = await db.members.create({
    id: `mem_${userId}`,
    workspace_id: workspaceId,
    user_id: userId,
    name,
    email: user.email,
    role: 'owner',
    avatar: initials,
    status: 'active',
  });

  await db.features.upsert({
    workspace_id: workspaceId,
    ...getTierConfig('startup'),
    automation_usage: { emails: 0, messages: 0, calls: 0 },
  });

  // Seed default integrations
  await db.integrations.upsert({
    id: 'int_gmail',
    workspace_id: workspaceId,
    provider: 'Gmail',
    name: 'Gmail',
    type: 'email',
    auth_type: 'Gmail login (no Google client IDs)',
    connected: false,
    scopes: 'personal.gmail.read personal.gmail.send',
    description: 'Send and read mail for this Gmail account.',
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
    connected: false,
    scopes: 'personal.calendar.read personal.calendar.write',
    description: 'Book events and inspect upcoming meetings.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  let liveInbox = false;
  if (isGmailAddress(user.email)) {
    await connectPersonalGmail(workspaceId, user.email);
    liveInbox = await tryAttachGmailImapFromPassword(workspaceId, user.email, password);
  }

  await db.messages.create(workspaceId, {
    id: `msg_init_${Date.now()}`,
    sender: 'assistant',
    text: isGmailAddress(user.email)
      ? liveInbox
        ? `Hello **${name}**. Signed in as **${user.email}**. Live Gmail is connected from this login — ask me to find emails from ischool or anyone else.`
        : `Hello **${name}**. Signed in as **${user.email}**. Ask me to search your inbox, send a follow-up, or book a meeting.`
      : `Hello **${name}**. Your workspace (**${workspace.name}**) is on the Startup plan.\n\nSign in with Gmail to turn on inbox, send, and calendar without Google client IDs.`,
    timestamp: new Date().toISOString(),
    reasoning_trace: [
      `Workspace tenant created: ${workspaceId}`,
      `Authenticated owner: ${email}`,
      `Startup tier applied.`,
    ],
  });

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    workspaceId: workspace.id,
  };

  const token = generateToken(session);
  return { user, workspace, member, token, liveInbox };
}

export async function loginWithGmail(email: string, password: string, name?: string) {
  const normalized = email.toLowerCase().trim();
  if (!isGmailAddress(normalized)) {
    throw new Error('Personal login needs a Gmail address (@gmail.com).');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const existing = await db.users.findByEmail(normalized);
  if (existing) {
    if (!verifyPassword(password, existing.password_hash)) {
      throw new Error('Invalid Gmail or password.');
    }
    const workspace = await db.workspaces.findByOwner(existing.id);
    if (!workspace) {
      throw new Error('Workspace could not be found for user.');
    }
    await connectPersonalGmail(workspace.id, existing.email);
    const liveInbox = await tryAttachGmailImapFromPassword(workspace.id, existing.email, password);
    const member = await db.members.findByUser(workspace.id, existing.id);
    return {
      user: existing,
      workspace,
      member,
      liveInbox,
      token: generateToken({
        userId: existing.id,
        email: existing.email,
        workspaceId: workspace.id,
      }),
    };
  }

  return registerUser(normalized, password, (name || displayNameFromEmail(normalized)).trim());
}

export async function loginOrRegisterGoogleUser(email: string, name?: string) {
  const normalized = email.toLowerCase().trim();
  if (!normalized) {
    throw new Error('Google did not return an email address.');
  }

  const existing = await db.users.findByEmail(normalized);
  if (existing) {
    const workspace = await db.workspaces.findByOwner(existing.id);
    if (!workspace) {
      throw new Error('Workspace could not be found for user.');
    }
    const member = await db.members.findByUser(workspace.id, existing.id);
    return {
      user: existing,
      workspace,
      member,
      token: generateToken({
        userId: existing.id,
        email: existing.email,
        workspaceId: workspace.id,
      }),
    };
  }

  return registerUser(
    normalized,
    randomBytes(32).toString('hex'),
    (name || displayNameFromEmail(normalized)).trim()
  );
}

/**
 * Express Middleware: Require Verified Authentication
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.', authenticated: false });
  }

  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.', authenticated: false });
  }

  const user = await db.users.findById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists.', authenticated: false });
  }

  const workspace = await db.workspaces.findById(session.workspaceId);
  if (!workspace) {
    return res.status(401).json({ error: 'Workspace not found.', authenticated: false });
  }

  const member = await db.members.findByUser(workspace.id, user.id);

  req.user = user;
  req.workspace = workspace;
  req.member = member || undefined;

  next();
}
