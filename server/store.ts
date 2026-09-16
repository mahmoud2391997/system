import crypto from 'crypto';
import {
  Workspace,
  WorkspaceFeatures,
  WorkspaceMember,
  ApprovalAction,
  AuditLogEntry,
  LeadContact,
  Deal,
  ProjectTask,
  Invoice,
  InventoryItem,
  IntegrationStatus,
  WorkspaceTier,
} from '../src/types.js';

// Default Workspace
export const defaultWorkspace: Workspace = {
  id: 'ws_operations_main',
  name: 'Apex Horizon Technologies',
  slug: 'apex-horizon',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  current_user_role: 'admin',
};

export const defaultMembers: WorkspaceMember[] = [
  {
    id: 'usr_sarah',
    workspace_id: defaultWorkspace.id,
    name: 'Sarah Chen',
    email: 'sarah.chen@apexhorizon.io',
    role: 'admin',
    avatar: 'SC',
    status: 'active',
  },
  {
    id: 'usr_marcus',
    workspace_id: defaultWorkspace.id,
    name: 'Marcus Vance',
    email: 'm.vance@apexhorizon.io',
    role: 'manager',
    avatar: 'MV',
    status: 'active',
  },
  {
    id: 'usr_elena',
    workspace_id: defaultWorkspace.id,
    name: 'Elena Rostova',
    email: 'elena.r@apexhorizon.io',
    role: 'member',
    avatar: 'ER',
    status: 'active',
  },
];

export const defaultFeatures: WorkspaceFeatures = {
  workspace_id: defaultWorkspace.id,
  tier: 'startup', // default starting at Startup, so user can see CRM and can downgrade/upgrade
  crm_enabled: true,
  team_enabled: false,
  erp_enabled: false,
  max_seats: 10,
  automation_caps: {
    emails: 500,
    messages: 1000,
    calls: 50,
  },
  automation_usage: {
    emails: 48,
    messages: 112,
    calls: 6,
  },
};

export function getTierConfig(tier: WorkspaceTier): Omit<WorkspaceFeatures, 'workspace_id' | 'automation_usage'> {
  switch (tier) {
    case 'personal':
      return {
        tier: 'personal',
        crm_enabled: false,
        team_enabled: false,
        erp_enabled: false,
        max_seats: 1,
        automation_caps: { emails: 100, messages: 0, calls: 0 },
      };
    case 'startup':
      return {
        tier: 'startup',
        crm_enabled: true,
        team_enabled: false,
        erp_enabled: false,
        max_seats: 10,
        automation_caps: { emails: 500, messages: 1000, calls: 50 },
      };
    case 'team':
      return {
        tier: 'team',
        crm_enabled: true,
        team_enabled: true,
        erp_enabled: false,
        max_seats: 50,
        automation_caps: { emails: 2500, messages: 5000, calls: 300 },
      };
    case 'enterprise':
      return {
        tier: 'enterprise',
        crm_enabled: true,
        team_enabled: true,
        erp_enabled: true,
        max_seats: 999,
        automation_caps: { emails: 20000, messages: 50000, calls: 2500 },
      };
  }
}

export const defaultIntegrations: IntegrationStatus[] = [
  {
    id: 'int_email',
    name: 'Official Google Workspace / Gmail API',
    type: 'email',
    connected: true,
    provider: 'Google Cloud Platform',
    auth_type: 'OAuth 2.0 (Server Token Vault)',
    last_sync: '2 mins ago',
  },
  {
    id: 'int_calendar',
    name: 'Google Calendar API (Bi-directional)',
    type: 'calendar',
    connected: true,
    provider: 'Google Calendar v3',
    auth_type: 'Scoped Workspace OAuth',
    last_sync: '10 mins ago',
  },
  {
    id: 'int_whatsapp',
    name: 'Meta WhatsApp Business Cloud API',
    type: 'whatsapp',
    connected: true,
    provider: 'Meta for Developers (Official WABA)',
    auth_type: 'System User Permanent Access Token',
    last_sync: 'Just now',
  },
  {
    id: 'int_voice',
    name: 'Real-Time Telephony Media Stream',
    type: 'voice',
    connected: true,
    provider: 'Twilio Media Streams / ElevenLabs TTS',
    auth_type: 'Encrypted SIP Trunk Credentials',
    last_sync: 'Idle (Awaiting triggers)',
  },
  {
    id: 'int_search',
    name: 'Grounding & Company Research API',
    type: 'search',
    connected: true,
    provider: 'Google Grounding / Web Crawl',
    auth_type: 'Internal Service Account',
    last_sync: 'Active',
  },
];

// Initial CRM data
export const defaultContacts: LeadContact[] = [
  {
    id: 'cnt_1',
    workspace_id: defaultWorkspace.id,
    name: 'Julian Montgomery',
    company: 'Vanguard Logistics Global',
    email: 'j.montgomery@vanguardlog.com',
    phone: '+1 (555) 438-9921',
    channel: 'email',
    status: 'lead',
    lead_score: 88,
    tags: ['High Intent', 'Logistics ERP', 'Series B'],
    last_activity: 'Opened pricing email 2h ago',
    ai_summary: 'Requested demonstration for automated customs clearing pipeline and team dispatch.',
  },
  {
    id: 'cnt_2',
    workspace_id: defaultWorkspace.id,
    name: 'Amara Okafor',
    company: 'BioHealth Instruments',
    email: 'a.okafor@biohealthinst.org',
    phone: '+44 20 7946 0912',
    channel: 'whatsapp',
    status: 'contact',
    lead_score: 94,
    tags: ['Qualified', 'Inbound WhatsApp', 'Contract Ready'],
    last_activity: 'WhatsApp follow-up sent yesterday',
    ai_summary: 'Needs 45 agent seats with custom role segregation and ISO audit exports.',
  },
  {
    id: 'cnt_3',
    workspace_id: defaultWorkspace.id,
    name: 'David K. Söderström',
    company: 'Nordic CleanEnergy Labs',
    email: 'david@nordicclean.se',
    phone: '+46 8 123 4567',
    channel: 'web',
    status: 'customer',
    lead_score: 99,
    tags: ['Active Customer', 'Enterprise Pilot'],
    last_activity: 'Quarterly review scheduled',
    ai_summary: 'Signed pilot agreement; exploring automated invoice reconciliation.',
  },
];

export const defaultDeals: Deal[] = [
  {
    id: 'deal_1',
    workspace_id: defaultWorkspace.id,
    title: 'Vanguard Global - AI Dispatch & Fleet Automation',
    contact_id: 'cnt_1',
    contact_name: 'Julian Montgomery',
    value: 48000,
    stage: 'proposal',
    probability: 70,
    expected_close: '2026-10-15',
    updated_at: '1 day ago',
  },
  {
    id: 'deal_2',
    workspace_id: defaultWorkspace.id,
    title: 'BioHealth 45-Seat Team Rollout',
    contact_id: 'cnt_2',
    contact_name: 'Amara Okafor',
    value: 64000,
    stage: 'negotiation',
    probability: 85,
    expected_close: '2026-09-30',
    updated_at: '4 hours ago',
  },
  {
    id: 'deal_3',
    workspace_id: defaultWorkspace.id,
    title: 'Nordic CleanEnergy Annual Operations Tier',
    contact_id: 'cnt_3',
    contact_name: 'David K. Söderström',
    value: 92000,
    stage: 'won',
    probability: 100,
    expected_close: '2026-09-01',
    updated_at: '1 week ago',
  },
];

// Initial Team Tasks
export const defaultTasks: ProjectTask[] = [
  {
    id: 'tsk_1',
    workspace_id: defaultWorkspace.id,
    title: 'Review BioHealth ISO compliance data residency checklist',
    description: 'Verify dedicated schema isolation requirements for healthcare customer compliance.',
    assignee_id: 'usr_sarah',
    assignee_name: 'Sarah Chen',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-09-20',
    time_spent_hours: 3.5,
  },
  {
    id: 'tsk_2',
    workspace_id: defaultWorkspace.id,
    title: 'Audit outbound WhatsApp message templates with Meta WABA',
    description: 'Ensure transaction confirmations follow approved guidelines.',
    assignee_id: 'usr_marcus',
    assignee_name: 'Marcus Vance',
    status: 'todo',
    priority: 'medium',
    due_date: '2026-09-22',
    time_spent_hours: 1.0,
  },
  {
    id: 'tsk_3',
    workspace_id: defaultWorkspace.id,
    title: 'Execute automated reconciliation test on Q3 billing ledger',
    description: 'Check stripe webhook ingest against ERP invoices.',
    assignee_id: 'usr_elena',
    assignee_name: 'Elena Rostova',
    status: 'done',
    priority: 'low',
    due_date: '2026-09-15',
    time_spent_hours: 4.2,
  },
];

// Initial ERP data
export const defaultInvoices: Invoice[] = [
  {
    id: 'inv_1092',
    workspace_id: defaultWorkspace.id,
    invoice_number: 'INV-2026-088',
    client_name: 'Nordic CleanEnergy Labs',
    amount: 23000,
    currency: 'USD',
    status: 'paid',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    line_items: [
      { description: 'Nexus Enterprise Orchestration Platform (Q3)', quantity: 1, unit_price: 18000 },
      { description: 'Automated Telephony & Voice Agent Quota (500 hrs)', quantity: 1, unit_price: 5000 },
    ],
  },
  {
    id: 'inv_1093',
    workspace_id: defaultWorkspace.id,
    invoice_number: 'INV-2026-089',
    client_name: 'BioHealth Instruments',
    amount: 16000,
    currency: 'USD',
    status: 'pending_approval',
    issue_date: '2026-09-16',
    due_date: '2026-09-30',
    line_items: [
      { description: 'Initial Onboarding & Enterprise Isolation Setup', quantity: 1, unit_price: 16000 },
    ],
  },
];

export const defaultInventory: InventoryItem[] = [
  {
    id: 'inv_item_1',
    workspace_id: defaultWorkspace.id,
    sku: 'NX-EDGE-01',
    name: 'Edge Voice Gateway Box v2',
    category: 'Hardware Appliance',
    stock_quantity: 48,
    reorder_point: 15,
    unit_cost: 320,
  },
  {
    id: 'inv_item_2',
    workspace_id: defaultWorkspace.id,
    sku: 'NX-LIC-TEAM',
    name: 'Enterprise Seat Licensing Key Block (25 seats)',
    category: 'Software Licenses',
    stock_quantity: 120,
    reorder_point: 30,
    unit_cost: 1500,
  },
];

// Initial Pending Approvals
export const defaultApprovals: ApprovalAction[] = [
  {
    id: 'appr_init_1',
    workspace_id: defaultWorkspace.id,
    tool_name: 'send_email',
    skill_title: 'Executive Outreach Sequence',
    risk_level: 'confirmation_required',
    idempotency_key: 'idemp_email_outreach_vanguard_892',
    status: 'pending',
    summary: 'Send follow-up contract and custom pricing tier breakdown to Julian Montgomery (CEO, Vanguard Logistics)',
    parameters: {
      recipient: 'j.montgomery@vanguardlog.com',
      subject: 'Apex Horizon: Proposed SLA & Deployment Architecture',
      cc: 'sarah.chen@apexhorizon.io',
      contract_tier: 'Enterprise Custom',
    },
    requested_by: 'Nexus Autonomous Agent',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    external_impact_warning: 'Sends real outgoing email from sarah.chen@apexhorizon.io via Gmail API.',
  },
];

// Initial Audit Logs
export const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud_1',
    workspace_id: defaultWorkspace.id,
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    actor: { type: 'ai_agent', name: 'Nexus Orchestrator' },
    skill: 'web_search_research',
    risk_level: 'safe',
    idempotency_key: 'idemp_search_vanguard_fin',
    action_summary: 'Automated background research on Vanguard Logistics recent Series B press release',
    status: 'executed',
    module: 'crm',
    duration_ms: 612,
  },
  {
    id: 'aud_2',
    workspace_id: defaultWorkspace.id,
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    actor: { type: 'ai_agent', name: 'Nexus Orchestrator' },
    skill: 'crm_update_lead',
    risk_level: 'safe',
    idempotency_key: 'idemp_crm_lead_score_88',
    action_summary: 'Recalculated lead score to 88 and appended tag [Series B] to Julian Montgomery',
    status: 'executed',
    module: 'crm',
    duration_ms: 144,
  },
  {
    id: 'aud_3',
    workspace_id: defaultWorkspace.id,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    actor: { type: 'ai_agent', name: 'Nexus Orchestrator' },
    skill: 'send_email',
    risk_level: 'confirmation_required',
    idempotency_key: 'idemp_email_outreach_vanguard_892',
    action_summary: 'Outbound email drafted; halted by Policy Engine for human confirmation before external delivery',
    status: 'halted_awaiting_approval',
    module: 'personal',
    duration_ms: 95,
  },
];
