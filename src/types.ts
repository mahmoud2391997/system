export type WorkspaceTier = 'personal' | 'startup' | 'team' | 'enterprise';

export interface WorkspaceFeatures {
  workspace_id: string;
  tier: WorkspaceTier;
  crm_enabled: boolean;
  team_enabled: boolean;
  erp_enabled: boolean;
  max_seats: number;
  automation_caps: {
    emails: number;
    messages: number;
    calls: number;
  };
  automation_usage: {
    emails: number;
    messages: number;
    calls: number;
  };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  current_user_role: 'owner' | 'admin' | 'manager' | 'member';
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  avatar?: string;
  status: 'active' | 'invited';
}

export type RiskClassification = 'safe' | 'confirmation_required' | 'high_risk';

export interface ApprovalAction {
  id: string;
  workspace_id: string;
  tool_name: string;
  skill_title: string;
  risk_level: RiskClassification;
  idempotency_key: string;
  status: 'pending' | 'approved' | 'rejected';
  summary: string;
  parameters: Record<string, any>;
  requested_by: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  external_impact_warning?: string;
}

export interface AuditLogEntry {
  id: string;
  workspace_id: string;
  timestamp: string;
  actor: {
    type: 'ai_agent' | 'user';
    name: string;
    role?: string;
  };
  skill: string;
  risk_level: RiskClassification;
  idempotency_key: string;
  action_summary: string;
  status: 'executed' | 'halted_awaiting_approval' | 'rejected' | 'failed';
  module: 'crm' | 'team' | 'erp' | 'personal' | 'system';
  payload?: Record<string, any>;
  duration_ms?: number;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  reasoning_trace?: string[];
  tool_invocations?: {
    id: string;
    tool_name: string;
    risk: RiskClassification;
    status: 'safe_executed' | 'awaiting_approval' | 'approved_executed' | 'rejected';
    parameters: Record<string, any>;
    result?: any;
    approval_id?: string;
  }[];
}

// CRM Models (Startup+)
export interface ContactNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  channel?: string;
}

export interface LeadContact {
  id: string;
  workspace_id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  channel: 'email' | 'whatsapp' | 'telegram' | 'phone' | 'web';
  status: 'lead' | 'contact' | 'customer';
  lead_score: number; // 0 - 100
  tags: string[];
  last_activity: string;
  ai_summary?: string;
  notes?: ContactNote[];
}

export interface Deal {
  id: string;
  workspace_id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  value: number;
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expected_close: string;
  updated_at: string;
}

// Team Models (Team+)
export interface ProjectTask {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  time_spent_hours: number;
}

// ERP Models (Enterprise+)
export interface Invoice {
  id: string;
  workspace_id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'sent' | 'paid';
  issue_date: string;
  due_date: string;
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface InventoryItem {
  id: string;
  workspace_id: string;
  sku: string;
  name: string;
  category: string;
  stock_quantity: number;
  reorder_point: number;
  unit_cost: number;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: 'email' | 'calendar' | 'whatsapp' | 'telegram' | 'voice' | 'search';
  connected: boolean;
  provider: string;
  auth_type: string;
  last_sync: string;
  latency_ms?: number;
  description?: string;
}
