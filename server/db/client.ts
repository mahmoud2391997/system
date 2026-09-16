import fs from 'fs';
import path from 'path';
import pg from 'pg';
import {
  Workspace,
  WorkspaceFeatures,
  WorkspaceMember,
  ApprovalAction,
  AuditLogEntry,
  AgentMessage,
  IntegrationStatus,
  WorkspaceTier,
} from '../../src/types.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar: string;
  created_at: string;
}

export interface IntegrationRecord {
  id: string;
  workspace_id: string;
  provider: string;
  name: string;
  type: 'email' | 'calendar' | 'whatsapp' | 'telegram' | 'voice' | 'search';
  auth_type: string;
  connected: boolean;
  encrypted_credentials?: string;
  scopes?: string;
  last_sync?: string;
  latency_ms?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ToolExecutionRecord {
  id: string;
  workspace_id: string;
  user_id?: string;
  tool_name: string;
  idempotency_key: string;
  parameters: Record<string, any>;
  status: 'pending' | 'executed' | 'halted_awaiting_approval' | 'rejected' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  workspaces: Workspace[];
  workspace_members: WorkspaceMember[];
  workspace_features: WorkspaceFeatures[];
  integrations: IntegrationRecord[];
  messages: AgentMessage[];
  tool_executions: ToolExecutionRecord[];
  approvals: ApprovalAction[];
  audit_logs: AuditLogEntry[];
}

// In-file persistent store path for local dev without Postgres
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'nexus_db.json');

let pool: pg.Pool | null = null;
let fileDb: DatabaseSchema | null = null;

function getFileDb(): DatabaseSchema {
  if (fileDb) return fileDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      fileDb = JSON.parse(data);
      return fileDb!;
    } catch (err) {
      console.warn('Could not parse existing .data/nexus_db.json, initializing fresh store.');
    }
  }

  fileDb = {
    users: [],
    workspaces: [],
    workspace_members: [],
    workspace_features: [],
    integrations: [],
    messages: [],
    tool_executions: [],
    approvals: [],
    audit_logs: [],
  };
  saveFileDb();
  return fileDb;
}

function saveFileDb() {
  if (!fileDb) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(fileDb, null, 2), 'utf8');
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    console.error('Failed to save to local persistence file:', err);
  }
}

function getPgPool(): pg.Pool | null {
  if (pool) return pool;
  if (process.env.DATABASE_URL) {
    try {
      pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      });
      return pool;
    } catch (err) {
      console.error('Failed to initialize Postgres pool, falling back to local store:', err);
    }
  }
  return null;
}

export const db = {
  async init() {
    const pgPool = getPgPool();
    if (pgPool) {
      try {
        const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await pgPool.query(sql);
          console.log('[DB] PostgreSQL tables successfully initialized.');
        }
      } catch (err: any) {
        console.warn('[DB] PostgreSQL init warning:', err.message);
      }
    } else {
      getFileDb();
      console.log('[DB] Local persistent file-backed database initialized (.data/nexus_db.json).');
    }
  },

  // USERS
  users: {
    async findByEmail(email: string): Promise<UserRecord | null> {
      const normalizedEmail = email.toLowerCase().trim();
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        return res.rows[0] || null;
      }
      const data = getFileDb();
      return data.users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
    },

    async findById(id: string): Promise<UserRecord | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      const data = getFileDb();
      return data.users.find((u) => u.id === id) || null;
    },

    async create(user: UserRecord): Promise<UserRecord> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO users (id, email, password_hash, name, avatar, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [user.id, user.email, user.password_hash, user.name, user.avatar, user.created_at]
        );
        return user;
      }
      const data = getFileDb();
      data.users.push(user);
      saveFileDb();
      return user;
    },
  },

  // WORKSPACES
  workspaces: {
    async findById(id: string): Promise<Workspace | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM workspaces WHERE id = $1', [id]);
        if (!res.rows[0]) return null;
        return {
          id: res.rows[0].id,
          name: res.rows[0].name,
          slug: res.rows[0].slug,
          created_at: res.rows[0].created_at,
          current_user_role: 'owner',
        };
      }
      const data = getFileDb();
      return data.workspaces.find((w) => w.id === id) || null;
    },

    async findByOwner(ownerId: string): Promise<Workspace | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM workspaces WHERE owner_id = $1 LIMIT 1', [ownerId]);
        if (!res.rows[0]) return null;
        return {
          id: res.rows[0].id,
          name: res.rows[0].name,
          slug: res.rows[0].slug,
          created_at: res.rows[0].created_at,
          current_user_role: 'owner',
        };
      }
      const data = getFileDb();
      const member = data.workspace_members.find((m) => m.id === ownerId || m.user_id === (ownerId as any));
      if (member) {
        return data.workspaces.find((w) => w.id === member.workspace_id) || null;
      }
      return data.workspaces[0] || null;
    },

    async create(workspace: Workspace, ownerId: string): Promise<Workspace> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO workspaces (id, name, slug, owner_id, created_at) VALUES ($1, $2, $3, $4, $5)',
          [workspace.id, workspace.name, workspace.slug, ownerId, workspace.created_at]
        );
        return workspace;
      }
      const data = getFileDb();
      data.workspaces.push(workspace);
      saveFileDb();
      return workspace;
    },
  },

  // WORKSPACE MEMBERS
  members: {
    async listByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM workspace_members WHERE workspace_id = $1 ORDER BY created_at ASC', [workspaceId]);
        return res.rows;
      }
      const data = getFileDb();
      return data.workspace_members.filter((m) => m.workspace_id === workspaceId);
    },

    async findByUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [workspaceId, userId]);
        return res.rows[0] || null;
      }
      const data = getFileDb();
      return data.workspace_members.find((m) => m.workspace_id === workspaceId && (m as any).user_id === userId) || null;
    },

    async create(member: WorkspaceMember & { user_id: string }): Promise<WorkspaceMember> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO workspace_members (id, workspace_id, user_id, name, email, role, avatar, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
          [member.id, member.workspace_id, member.user_id, member.name, member.email, member.role, member.avatar || '', member.status]
        );
        return member;
      }
      const data = getFileDb();
      data.workspace_members.push(member);
      saveFileDb();
      return member;
    },
  },

  // WORKSPACE FEATURES
  features: {
    async getByWorkspace(workspaceId: string): Promise<WorkspaceFeatures> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM workspace_features WHERE workspace_id = $1', [workspaceId]);
        if (res.rows[0]) {
          return {
            workspace_id: res.rows[0].workspace_id,
            tier: res.rows[0].tier,
            crm_enabled: res.rows[0].crm_enabled,
            team_enabled: res.rows[0].team_enabled,
            erp_enabled: res.rows[0].erp_enabled,
            max_seats: res.rows[0].max_seats,
            automation_caps: typeof res.rows[0].automation_caps === 'string' ? JSON.parse(res.rows[0].automation_caps) : res.rows[0].automation_caps,
            automation_usage: typeof res.rows[0].automation_usage === 'string' ? JSON.parse(res.rows[0].automation_usage) : res.rows[0].automation_usage,
          };
        }
      }
      const data = getFileDb();
      const existing = data.workspace_features.find((f) => f.workspace_id === workspaceId);
      if (existing) return existing;

      const fallback: WorkspaceFeatures = {
        workspace_id: workspaceId,
        tier: 'personal',
        crm_enabled: false,
        team_enabled: false,
        erp_enabled: false,
        max_seats: 1,
        automation_caps: { emails: 100, messages: 0, calls: 0 },
        automation_usage: { emails: 0, messages: 0, calls: 0 },
      };
      data.workspace_features.push(fallback);
      saveFileDb();
      return fallback;
    },

    async upsert(features: WorkspaceFeatures): Promise<WorkspaceFeatures> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          `INSERT INTO workspace_features (workspace_id, tier, crm_enabled, team_enabled, erp_enabled, max_seats, automation_caps, automation_usage, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (workspace_id) DO UPDATE SET
             tier = EXCLUDED.tier,
             crm_enabled = EXCLUDED.crm_enabled,
             team_enabled = EXCLUDED.team_enabled,
             erp_enabled = EXCLUDED.erp_enabled,
             max_seats = EXCLUDED.max_seats,
             automation_caps = EXCLUDED.automation_caps,
             automation_usage = EXCLUDED.automation_usage,
             updated_at = NOW()`,
          [
            features.workspace_id,
            features.tier,
            features.crm_enabled,
            features.team_enabled,
            features.erp_enabled,
            features.max_seats,
            JSON.stringify(features.automation_caps),
            JSON.stringify(features.automation_usage),
          ]
        );
        return features;
      }
      const data = getFileDb();
      const idx = data.workspace_features.findIndex((f) => f.workspace_id === features.workspace_id);
      if (idx >= 0) {
        data.workspace_features[idx] = features;
      } else {
        data.workspace_features.push(features);
      }
      saveFileDb();
      return features;
    },

    async incrementUsage(workspaceId: string, channel: 'emails' | 'messages' | 'calls') {
      const current = await this.getByWorkspace(workspaceId);
      current.automation_usage[channel] = (current.automation_usage[channel] || 0) + 1;
      await this.upsert(current);
      return current;
    },
  },

  // INTEGRATIONS
  integrations: {
    async listByWorkspace(workspaceId: string): Promise<IntegrationRecord[]> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM integrations WHERE workspace_id = $1 ORDER BY created_at ASC', [workspaceId]);
        return res.rows;
      }
      const data = getFileDb();
      return data.integrations.filter((i) => i.workspace_id === workspaceId);
    },

    async findById(workspaceId: string, id: string): Promise<IntegrationRecord | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM integrations WHERE workspace_id = $1 AND id = $2', [workspaceId, id]);
        return res.rows[0] || null;
      }
      const data = getFileDb();
      return data.integrations.find((i) => i.workspace_id === workspaceId && i.id === id) || null;
    },

    async upsert(integration: IntegrationRecord): Promise<IntegrationRecord> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          `INSERT INTO integrations (id, workspace_id, provider, name, type, auth_type, connected, encrypted_credentials, scopes, last_sync, latency_ms, description, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
           ON CONFLICT (id) DO UPDATE SET
             provider = EXCLUDED.provider,
             name = EXCLUDED.name,
             type = EXCLUDED.type,
             auth_type = EXCLUDED.auth_type,
             connected = EXCLUDED.connected,
             encrypted_credentials = EXCLUDED.encrypted_credentials,
             scopes = EXCLUDED.scopes,
             last_sync = EXCLUDED.last_sync,
             latency_ms = EXCLUDED.latency_ms,
             description = EXCLUDED.description,
             updated_at = NOW()`,
          [
            integration.id,
            integration.workspace_id,
            integration.provider,
            integration.name,
            integration.type,
            integration.auth_type,
            integration.connected,
            integration.encrypted_credentials || null,
            integration.scopes || null,
            integration.last_sync || null,
            integration.latency_ms || null,
            integration.description || null,
            integration.created_at || new Date().toISOString(),
          ]
        );
        return integration;
      }
      const data = getFileDb();
      const idx = data.integrations.findIndex((i) => i.id === integration.id && i.workspace_id === integration.workspace_id);
      if (idx >= 0) {
        data.integrations[idx] = integration;
      } else {
        data.integrations.push(integration);
      }
      saveFileDb();
      return integration;
    },
  },

  // MESSAGES
  messages: {
    async listByWorkspace(workspaceId: string, limit = 50): Promise<AgentMessage[]> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM messages WHERE workspace_id = $1 ORDER BY timestamp ASC LIMIT $2',
          [workspaceId, limit]
        );
        return res.rows.map((r) => ({
          id: r.id,
          sender: r.sender,
          text: r.text,
          timestamp: r.timestamp,
          reasoning_trace: typeof r.reasoning_trace === 'string' ? JSON.parse(r.reasoning_trace) : r.reasoning_trace,
          tool_invocations: typeof r.tool_invocations === 'string' ? JSON.parse(r.tool_invocations) : r.tool_invocations,
        }));
      }
      const data = getFileDb();
      return data.messages.filter((m: any) => m.workspace_id === workspaceId);
    },

    async create(workspaceId: string, msg: AgentMessage, userId?: string): Promise<AgentMessage> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO messages (id, workspace_id, user_id, sender, text, reasoning_trace, tool_invocations, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            msg.id,
            workspaceId,
            userId || null,
            msg.sender,
            msg.text,
            JSON.stringify(msg.reasoning_trace || []),
            JSON.stringify(msg.tool_invocations || []),
            msg.timestamp,
          ]
        );
        return msg;
      }
      const data = getFileDb();
      data.messages.push({ ...msg, workspace_id: workspaceId } as any);
      saveFileDb();
      return msg;
    },
  },

  // TOOL EXECUTIONS & IDEMPOTENCY
  toolExecutions: {
    async findByIdempotencyKey(workspaceId: string, idempotencyKey: string): Promise<ToolExecutionRecord | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM tool_executions WHERE workspace_id = $1 AND idempotency_key = $2',
          [workspaceId, idempotencyKey]
        );
        if (!res.rows[0]) return null;
        const r = res.rows[0];
        return {
          id: r.id,
          workspace_id: r.workspace_id,
          user_id: r.user_id,
          tool_name: r.tool_name,
          idempotency_key: r.idempotency_key,
          parameters: typeof r.parameters === 'string' ? JSON.parse(r.parameters) : r.parameters,
          status: r.status,
          result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
          error: r.error,
          created_at: r.created_at,
          completed_at: r.completed_at,
        };
      }
      const data = getFileDb();
      return data.tool_executions.find((e) => e.workspace_id === workspaceId && e.idempotency_key === idempotencyKey) || null;
    },

    async create(record: ToolExecutionRecord): Promise<ToolExecutionRecord> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO tool_executions (id, workspace_id, user_id, tool_name, idempotency_key, parameters, status, result, error, created_at, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [
            record.id,
            record.workspace_id,
            record.user_id || null,
            record.tool_name,
            record.idempotency_key,
            JSON.stringify(record.parameters || {}),
            record.status,
            record.result ? JSON.stringify(record.result) : null,
            record.error || null,
            record.created_at,
            record.completed_at || null,
          ]
        );
        return record;
      }
      const data = getFileDb();
      data.tool_executions.push(record);
      saveFileDb();
      return record;
    },

    async update(id: string, status: ToolExecutionRecord['status'], result?: any, error?: string): Promise<void> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'UPDATE tool_executions SET status = $1, result = $2, error = $3, completed_at = NOW() WHERE id = $4',
          [status, result ? JSON.stringify(result) : null, error || null, id]
        );
        return;
      }
      const data = getFileDb();
      const item = data.tool_executions.find((e) => e.id === id);
      if (item) {
        item.status = status;
        item.result = result;
        item.error = error;
        item.completed_at = new Date().toISOString();
        saveFileDb();
      }
    },
  },

  // APPROVALS
  approvals: {
    async listByWorkspace(workspaceId: string): Promise<ApprovalAction[]> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM approvals WHERE workspace_id = $1 ORDER BY created_at DESC',
          [workspaceId]
        );
        return res.rows.map((r) => ({
          id: r.id,
          workspace_id: r.workspace_id,
          tool_name: r.tool_name,
          skill_title: r.skill_title,
          risk_level: r.risk_level,
          idempotency_key: r.idempotency_key,
          status: r.status,
          summary: r.summary,
          parameters: typeof r.parameters === 'string' ? JSON.parse(r.parameters) : r.parameters,
          requested_by: r.requested_by,
          created_at: r.created_at,
          resolved_at: r.resolved_at,
          resolved_by: r.resolved_by,
          external_impact_warning: r.external_impact_warning,
        }));
      }
      const data = getFileDb();
      return data.approvals.filter((a) => a.workspace_id === workspaceId);
    },

    async findById(workspaceId: string, id: string): Promise<ApprovalAction | null> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query('SELECT * FROM approvals WHERE workspace_id = $1 AND id = $2', [workspaceId, id]);
        if (!res.rows[0]) return null;
        const r = res.rows[0];
        return {
          id: r.id,
          workspace_id: r.workspace_id,
          tool_name: r.tool_name,
          skill_title: r.skill_title,
          risk_level: r.risk_level,
          idempotency_key: r.idempotency_key,
          status: r.status,
          summary: r.summary,
          parameters: typeof r.parameters === 'string' ? JSON.parse(r.parameters) : r.parameters,
          requested_by: r.requested_by,
          created_at: r.created_at,
          resolved_at: r.resolved_at,
          resolved_by: r.resolved_by,
          external_impact_warning: r.external_impact_warning,
        };
      }
      const data = getFileDb();
      return data.approvals.find((a) => a.workspace_id === workspaceId && a.id === id) || null;
    },

    async create(approval: ApprovalAction): Promise<ApprovalAction> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO approvals (id, workspace_id, tool_name, skill_title, risk_level, idempotency_key, status, summary, parameters, requested_by, created_at, external_impact_warning) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [
            approval.id,
            approval.workspace_id,
            approval.tool_name,
            approval.skill_title,
            approval.risk_level,
            approval.idempotency_key,
            approval.status,
            approval.summary,
            JSON.stringify(approval.parameters || {}),
            approval.requested_by,
            approval.created_at,
            approval.external_impact_warning || null,
          ]
        );
        return approval;
      }
      const data = getFileDb();
      data.approvals.unshift(approval);
      saveFileDb();
      return approval;
    },

    async updateDecision(
      workspaceId: string,
      id: string,
      decision: 'approved' | 'rejected',
      resolvedBy: string
    ): Promise<ApprovalAction | null> {
      const resolvedAt = new Date().toISOString();
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'UPDATE approvals SET status = $1, resolved_at = $2, resolved_by = $3 WHERE workspace_id = $4 AND id = $5',
          [decision, resolvedAt, resolvedBy, workspaceId, id]
        );
        return this.findById(workspaceId, id);
      }
      const data = getFileDb();
      const item = data.approvals.find((a) => a.workspace_id === workspaceId && a.id === id);
      if (item) {
        item.status = decision;
        item.resolved_at = resolvedAt;
        item.resolved_by = resolvedBy;
        saveFileDb();
      }
      return item || null;
    },
  },

  // AUDIT LOGS
  auditLogs: {
    async listByWorkspace(workspaceId: string, limit = 50): Promise<AuditLogEntry[]> {
      const pgPool = getPgPool();
      if (pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM audit_logs WHERE workspace_id = $1 ORDER BY timestamp DESC LIMIT $2',
          [workspaceId, limit]
        );
        return res.rows.map((r) => ({
          id: r.id,
          workspace_id: r.workspace_id,
          timestamp: r.timestamp,
          actor: typeof r.actor === 'string' ? JSON.parse(r.actor) : r.actor,
          skill: r.skill,
          risk_level: r.risk_level,
          idempotency_key: r.idempotency_key,
          action_summary: r.action_summary,
          status: r.status,
          module: r.module,
          payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
          duration_ms: r.duration_ms,
        }));
      }
      const data = getFileDb();
      return data.audit_logs.filter((l) => l.workspace_id === workspaceId);
    },

    async create(entry: AuditLogEntry): Promise<AuditLogEntry> {
      const pgPool = getPgPool();
      if (pgPool) {
        await pgPool.query(
          'INSERT INTO audit_logs (id, workspace_id, timestamp, actor, skill, risk_level, idempotency_key, action_summary, status, module, payload, duration_ms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [
            entry.id,
            entry.workspace_id,
            entry.timestamp,
            JSON.stringify(entry.actor),
            entry.skill,
            entry.risk_level,
            entry.idempotency_key,
            entry.action_summary,
            entry.status,
            entry.module,
            entry.payload ? JSON.stringify(entry.payload) : null,
            entry.duration_ms || 0,
          ]
        );
        return entry;
      }
      const data = getFileDb();
      data.audit_logs.unshift(entry);
      saveFileDb();
      return entry;
    },
  },
};
