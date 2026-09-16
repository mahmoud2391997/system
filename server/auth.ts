import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from './db/client.js';
import { hashPassword, verifyPassword } from './crypto.js';
import { Workspace, WorkspaceMember } from '../src/types.js';

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
    tier: 'personal',
    crm_enabled: false,
    team_enabled: false,
    erp_enabled: false,
    max_seats: 1,
    automation_caps: { emails: 100, messages: 0, calls: 0 },
    automation_usage: { emails: 0, messages: 0, calls: 0 },
  });

  // Seed default integrations
  await db.integrations.upsert({
    id: 'int_gmail',
    workspace_id: workspaceId,
    provider: 'Google Cloud Platform',
    name: 'Google Workspace Gmail API',
    type: 'email',
    auth_type: 'OAuth 2.0 (Server-Side AES-256 Vault)',
    connected: false,
    scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    description: 'Send and read official workspace emails with zero prompt token leakage.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  await db.integrations.upsert({
    id: 'int_calendar',
    workspace_id: workspaceId,
    provider: 'Google Calendar v3',
    name: 'Google Calendar API',
    type: 'calendar',
    auth_type: 'Scoped Workspace OAuth',
    connected: false,
    scopes: 'https://www.googleapis.com/auth/calendar.events',
    description: 'Book events, check free/busy slots, and dispatch verified meeting invites.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Welcome message for new user
  await db.messages.create(workspaceId, {
    id: `msg_init_${Date.now()}`,
    sender: 'assistant',
    text: `Hello **${name}**! Your personal Nexus operations workspace (**${workspace.name}**) is ready.\n\nConnect Gmail and Google Calendar in the **Integrations** tab to enable real email dispatches and meeting scheduling.`,
    timestamp: new Date().toISOString(),
    reasoning_trace: [
      `Workspace tenant created: ${workspaceId}`,
      `Authenticated owner: ${email}`,
      `Personal tier guardrails applied.`,
    ],
  });

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    workspaceId: workspace.id,
  };

  const token = generateToken(session);
  return { user, workspace, member, token };
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
