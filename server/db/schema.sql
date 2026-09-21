-- Nexus Multi-Tenant Enterprise Architecture Schema (Phase 1 & 2)
-- Every operational entity carries workspace_id for strict tenant isolation.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(32) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'owner',
  avatar VARCHAR(32) DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_features (
  workspace_id VARCHAR(64) PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  tier VARCHAR(32) NOT NULL DEFAULT 'startup',
  crm_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  team_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  erp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  max_seats INT NOT NULL DEFAULT 10,
  automation_caps JSONB NOT NULL DEFAULT '{"emails":500,"messages":1000,"calls":50}',
  automation_usage JSONB NOT NULL DEFAULT '{"emails":0,"messages":0,"calls":0}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL,
  auth_type VARCHAR(128) NOT NULL,
  connected BOOLEAN NOT NULL DEFAULT FALSE,
  encrypted_credentials TEXT,
  scopes TEXT,
  last_sync VARCHAR(64),
  latency_ms INT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  sender VARCHAR(32) NOT NULL,
  text TEXT NOT NULL,
  reasoning_trace JSONB DEFAULT '[]',
  tool_invocations JSONB DEFAULT '[]',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_executions (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  tool_name VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(32) NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS approvals (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tool_name VARCHAR(128) NOT NULL,
  skill_title VARCHAR(255) NOT NULL,
  risk_level VARCHAR(32) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  summary TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  requested_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  external_impact_warning TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor JSONB NOT NULL,
  skill VARCHAR(128) NOT NULL,
  risk_level VARCHAR(32) NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  action_summary TEXT NOT NULL,
  status VARCHAR(64) NOT NULL,
  module VARCHAR(32) NOT NULL DEFAULT 'personal',
  payload JSONB,
  duration_ms INT DEFAULT 0
);

-- Index frequently accessed columns for tenant separation and idempotency lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_ws ON messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_ws_idemp ON tool_executions(workspace_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_approvals_ws ON approvals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ws ON audit_logs(workspace_id);
