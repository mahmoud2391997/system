import { RiskClassification, WorkspaceFeatures } from '../src/types.js';

export interface ToolDefinition {
  name: string;
  skill_title: string;
  description: string;
  defaultRisk: RiskClassification;
  requiredModule?: 'crm' | 'team' | 'erp';
  externalImpactWarning?: string;
  parametersSchema: Record<string, { type: string; required?: boolean; description: string }>;
}

export const REGISTERED_TOOLS: Record<string, ToolDefinition> = {
  web_search_research: {
    name: 'web_search_research',
    skill_title: 'Live Market & Web Intelligence',
    description: 'Researches companies, executive profiles, and market news before outreach.',
    defaultRisk: 'safe',
    parametersSchema: {
      query: { type: 'string', required: true, description: 'The search query or company name' },
      depth: { type: 'string', required: false, description: 'standard | deep' },
    },
  },
  read_workspace_records: {
    name: 'read_workspace_records',
    skill_title: 'Internal Knowledge Retrieval',
    description: 'Reads CRM contacts, deals, tasks, or ERP data within this workspace.',
    defaultRisk: 'safe',
    parametersSchema: {
      entity: { type: 'string', required: true, description: 'contacts | deals | tasks | invoices' },
      filter: { type: 'string', required: false, description: 'Optional search keyword' },
    },
  },
  read_emails: {
    name: 'read_emails',
    skill_title: 'Gmail Inbox Query & Read',
    description: 'Reads recent messages from the user Gmail inbox or searches with a query.',
    defaultRisk: 'safe',
    parametersSchema: {
      query: { type: 'string', required: false, description: 'Search term or filter' },
      max_results: { type: 'number', required: false, description: 'Number of results (1-10)' },
    },
  },
  send_email: {
    name: 'send_email',
    skill_title: 'Official Gmail / Outlook Email Dispatch',
    description: 'Dispatches email to leads, clients, or stakeholders from the signed-in Gmail account.',
    defaultRisk: 'confirmation_required',
    externalImpactWarning: 'Sends email from the connected Gmail account after operator approval.',
    parametersSchema: {
      recipient: { type: 'string', required: true, description: 'Recipient email address' },
      subject: { type: 'string', required: true, description: 'Subject line' },
      body: { type: 'string', required: true, description: 'Email body text' },
      cc: { type: 'string', required: false, description: 'Optional CC email' },
    },
  },
  list_calendar_events: {
    name: 'list_calendar_events',
    skill_title: 'Google Calendar Event Reader',
    description: 'Lists upcoming meetings and scheduled events on the user calendar.',
    defaultRisk: 'safe',
    parametersSchema: {
      time_min: { type: 'string', required: false, description: 'ISO start date' },
      max_results: { type: 'number', required: false, description: 'Maximum events to return' },
    },
  },
  schedule_meeting: {
    name: 'schedule_meeting',
    skill_title: 'Calendar Booking & Conflict Resolution',
    description: 'Books an event on the signed-in Gmail calendar and prepares the invite.',
    defaultRisk: 'confirmation_required',
    externalImpactWarning: 'Creates a calendar event and invite for the counterparty after operator approval.',
    parametersSchema: {
      title: { type: 'string', required: true, description: 'Meeting title' },
      attendee_email: { type: 'string', required: true, description: 'Counterparty email' },
      datetime: { type: 'string', required: true, description: 'ISO or natural date time' },
      duration_minutes: { type: 'number', required: false, description: 'Length in minutes' },
    },
  },
  send_whatsapp_message: {
    name: 'send_whatsapp_message',
    skill_title: 'Meta WhatsApp Business Cloud API',
    description: 'Sends real-time official WhatsApp business message or template campaign.',
    defaultRisk: 'confirmation_required',
    requiredModule: 'crm',
    externalImpactWarning: 'Dispatches real WhatsApp message using Meta WABA verified credentials.',
    parametersSchema: {
      phone_number: { type: 'string', required: true, description: 'E.164 formatted phone number' },
      message_text: { type: 'string', required: true, description: 'Message content' },
      template_name: { type: 'string', required: false, description: 'Approved Meta template name' },
    },
  },
  create_or_update_task: {
    name: 'create_or_update_task',
    skill_title: 'Project Task Engine',
    description: 'Creates or modifies an operational task in the team board.',
    defaultRisk: 'safe',
    requiredModule: 'team',
    parametersSchema: {
      title: { type: 'string', required: true, description: 'Task title' },
      priority: { type: 'string', required: false, description: 'low | medium | high | critical' },
      assignee_name: { type: 'string', required: false, description: 'Assignee name' },
      due_date: { type: 'string', required: false, description: 'Due date string' },
    },
  },
  crm_update_deal_stage: {
    name: 'crm_update_deal_stage',
    skill_title: 'CRM Pipeline Stage Progression',
    description: 'Advances or modifies a sales opportunity stage and recalculates probability.',
    defaultRisk: 'confirmation_required',
    requiredModule: 'crm',
    externalImpactWarning: 'Updates deal stage in pipeline and may trigger automated notifications.',
    parametersSchema: {
      deal_id: { type: 'string', required: true, description: 'Deal identifier or title' },
      new_stage: { type: 'string', required: true, description: 'prospect | qualified | proposal | negotiation | won | lost' },
      notes: { type: 'string', required: false, description: 'Reason for stage transition' },
    },
  },
  dispatch_voice_call: {
    name: 'dispatch_voice_call',
    skill_title: 'Autonomous Outbound Telephony Call',
    description: 'Dials an external phone number with the conversational voice agent.',
    defaultRisk: 'high_risk',
    externalImpactWarning: 'High Risk: Initiates a real outbound voice call via Twilio/SIP trunk with AI conversational speech.',
    parametersSchema: {
      phone_number: { type: 'string', required: true, description: 'Recipient phone number' },
      purpose: { type: 'string', required: true, description: 'Call objective and script outline' },
      disclose_ai: { type: 'boolean', required: true, description: 'Must be true to comply with AI transparency regulations' },
    },
  },
  create_erp_invoice: {
    name: 'create_erp_invoice',
    skill_title: 'ERP Financial Invoicing Engine',
    description: 'Generates an official billing invoice with legal line-items and tax calculation.',
    defaultRisk: 'high_risk',
    requiredModule: 'erp',
    externalImpactWarning: 'High Risk: Generates an immutable financial document and ledger liability.',
    parametersSchema: {
      client_name: { type: 'string', required: true, description: 'Client or Company name' },
      amount: { type: 'number', required: true, description: 'Total invoice amount' },
      currency: { type: 'string', required: false, description: 'USD, EUR, GBP' },
      description: { type: 'string', required: true, description: 'Service description' },
    },
  },
};

export class PolicyEngine {
  /**
   * Evaluates a requested tool action against the policy rules,
   * workspace feature flags, and permissions.
   * This logic is strictly server-side and cannot be overridden by model prompt injection!
   */
  static evaluate(
    toolName: string,
    params: Record<string, any>,
    features: WorkspaceFeatures,
    userRole: string
  ): {
    allowed: boolean;
    reason?: string;
    risk: RiskClassification;
    requiresApproval: boolean;
    definition?: ToolDefinition;
  } {
    const def = REGISTERED_TOOLS[toolName];
    if (!def) {
      return {
        allowed: false,
        reason: `Skill "${toolName}" is not registered in the Nexus skill registry.`,
        risk: 'high_risk',
        requiresApproval: true,
      };
    }

    // Check if skill requires a module that is disabled in the current tier
    if (def.requiredModule === 'crm' && !features.crm_enabled) {
      return {
        allowed: false,
        reason: `CRM skill "${def.skill_title}" is locked. Upgrade workspace to Startup, Team, or Enterprise to unlock CRM automation.`,
        risk: def.defaultRisk,
        requiresApproval: false,
        definition: def,
      };
    }
    if (def.requiredModule === 'team' && !features.team_enabled) {
      return {
        allowed: false,
        reason: `Team skill "${def.skill_title}" is locked. Upgrade workspace to Team or Enterprise tier.`,
        risk: def.defaultRisk,
        requiresApproval: false,
        definition: def,
      };
    }
    if (def.requiredModule === 'erp' && !features.erp_enabled) {
      return {
        allowed: false,
        reason: `ERP skill "${def.skill_title}" is locked. Upgrade workspace to Enterprise tier.`,
        risk: def.defaultRisk,
        requiresApproval: false,
        definition: def,
      };
    }

    // Check high risk actions - require admin or manager
    let risk = def.defaultRisk;
    let requiresApproval = risk === 'confirmation_required' || risk === 'high_risk';

    // Role verification for High Risk operations
    if (risk === 'high_risk') {
      if (userRole !== 'owner' && userRole !== 'admin') {
        return {
          allowed: false,
          reason: `High-risk skill "${def.skill_title}" requires Owner or Admin privilege. Current role: ${userRole}`,
          risk: 'high_risk',
          requiresApproval: true,
          definition: def,
        };
      }
    }

    return {
      allowed: true,
      risk,
      requiresApproval,
      definition: def,
    };
  }
}
