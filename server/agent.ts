import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import {
  WorkspaceFeatures,
  AgentMessage,
  ApprovalAction,
  AuditLogEntry,
  RiskClassification,
} from '../src/types.js';
import { PolicyEngine, REGISTERED_TOOLS } from './policyEngine.js';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface AgentContext {
  workspace_id: string;
  user_name: string;
  user_role: string;
  features: WorkspaceFeatures;
  contacts: any[];
  deals: any[];
  tasks: any[];
  invoices: any[];
}

export interface AgentExecutionResult {
  message: AgentMessage;
  pendingApproval?: ApprovalAction;
  auditEntry?: AuditLogEntry;
  updatedData?: {
    deals?: any[];
    tasks?: any[];
    contacts?: any[];
    invoices?: any[];
  };
}

export class AgentOrchestrator {
  /**
   * Main entrypoint for processing user messages or operational triggers
   */
  static async processMessage(
    userPrompt: string,
    context: AgentContext,
    conversationHistory: AgentMessage[]
  ): Promise<AgentExecutionResult> {
    const ai = getGemini();
    const promptLower = userPrompt.toLowerCase();

    // 1. Determine which skill is requested / proposed
    let proposedTool: string | null = null;
    let toolParams: Record<string, any> = {};
    let reasoningSteps: string[] = [
      'Ingested operational intent from operator.',
      'Checking tenant scope: ' + context.workspace_id + ' (Tier: ' + context.features.tier.toUpperCase() + ')',
    ];

    // Intent classifier for operations
    if (promptLower.includes('email') || promptLower.includes('mail') || promptLower.includes('send to julian') || promptLower.includes('reach out to')) {
      proposedTool = 'send_email';
      toolParams = {
        recipient: promptLower.includes('amara') ? 'a.okafor@biohealthinst.org' : 'j.montgomery@vanguardlog.com',
        subject: promptLower.includes('sla') ? 'Apex Horizon: Updated SLA & Enterprise Security Specs' : 'Apex Horizon: Follow-up & Commercial Proposal',
        body: 'Hello,\n\nFollowing our review, I am pleased to share the operational scope and tailored deployment architecture for your team.\n\nBest regards,\nSarah Chen',
        cc: 'ops@apexhorizon.io',
      };
      reasoningSteps.push('Identified outbound communication intent: Official Gmail/Outlook dispatch.');
    } else if (promptLower.includes('call') || promptLower.includes('phone') || promptLower.includes('voice') || promptLower.includes('dial')) {
      proposedTool = 'dispatch_voice_call';
      toolParams = {
        phone_number: '+1 (555) 438-9921',
        purpose: 'Qualify fleet telemetry requirements and confirm pilot test date with Julian Montgomery.',
        disclose_ai: true,
      };
      reasoningSteps.push('Identified telephony dispatch intent: Outbound real-time voice agent.');
    } else if (promptLower.includes('whatsapp') || promptLower.includes('message amara') || promptLower.includes('text amara')) {
      proposedTool = 'send_whatsapp_message';
      toolParams = {
        phone_number: '+44 20 7946 0912',
        message_text: 'Hi Amara, Sarah here from Apex Horizon. Our team has reviewed the ISO compliance spec and we are ready to schedule your pilot.',
        template_name: 'enterprise_onboarding_ping',
      };
      reasoningSteps.push('Identified instant messaging intent: Meta WhatsApp Business Cloud API.');
    } else if (promptLower.includes('meeting') || promptLower.includes('calendar') || promptLower.includes('schedule') || promptLower.includes('book')) {
      proposedTool = 'schedule_meeting';
      toolParams = {
        title: 'Apex Horizon & Vanguard Logistics - Architecture Review',
        attendee_email: 'j.montgomery@vanguardlog.com',
        datetime: '2026-09-22T14:00:00Z',
        duration_minutes: 45,
      };
      reasoningSteps.push('Identified calendar scheduling intent: Conflict check & bi-directional invite.');
    } else if (promptLower.includes('invoice') || promptLower.includes('bill') || promptLower.includes('billing')) {
      proposedTool = 'create_erp_invoice';
      toolParams = {
        client_name: 'Vanguard Logistics Global',
        amount: 48000,
        currency: 'USD',
        description: 'Nexus Operations Enterprise Platform Deployment - Phase 1 Pilot',
      };
      reasoningSteps.push('Identified financial ERP intent: Ledger liability & customer invoicing.');
    } else if (promptLower.includes('deal') || promptLower.includes('pipeline') || promptLower.includes('won') || promptLower.includes('proposal') || promptLower.includes('stage')) {
      proposedTool = 'crm_update_deal_stage';
      toolParams = {
        deal_id: 'deal_1',
        new_stage: promptLower.includes('won') ? 'won' : promptLower.includes('negotiation') ? 'negotiation' : 'proposal',
        notes: 'Stage updated following qualification feedback and stakeholder alignment.',
      };
      reasoningSteps.push('Identified CRM pipeline intent: Deal progression.');
    } else if (promptLower.includes('task') || promptLower.includes('todo') || promptLower.includes('assign')) {
      proposedTool = 'create_or_update_task';
      toolParams = {
        title: 'Review Vanguard ISO compliance data residency checklist',
        priority: 'high',
        assignee_name: 'Sarah Chen',
        due_date: '2026-09-24',
      };
      reasoningSteps.push('Identified team orchestration intent: Board task dispatch.');
    } else {
      // Default to search or knowledge retrieval
      proposedTool = 'web_search_research';
      toolParams = {
        query: userPrompt,
        depth: 'deep',
      };
      reasoningSteps.push('Consulting market intelligence & workspace records.');
    }

    // 2. Pass proposed tool to the Policy Engine
    reasoningSteps.push('Submitting proposed action to Independent Policy Engine for risk evaluation.');
    const policyResult = PolicyEngine.evaluate(
      proposedTool,
      toolParams,
      context.features,
      context.user_role
    );

    const idempotencyKey = `idemp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // 3. If disallowed by policy (e.g. tier feature locked)
    if (!policyResult.allowed) {
      reasoningSteps.push(`Policy Engine decision: BLOCKED (${policyResult.reason})`);
      const blockedMessage: AgentMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Action blocked by Policy Engine:\n\n${policyResult.reason}\n\nNexus strictly prevents unauthorized actions or module access outside your active plan (${context.features.tier.toUpperCase()}). You can upgrade the workspace features directly in-place.`,
        timestamp: new Date().toISOString(),
        reasoning_trace: reasoningSteps,
      };
      return { message: blockedMessage };
    }

    // 4. If Confirmation Required or High Risk: Halt and generate Approval Card
    if (policyResult.requiresApproval) {
      reasoningSteps.push(`Policy Engine risk classification: ${policyResult.risk.toUpperCase()}`);
      reasoningSteps.push(`Execution halted. Surface interactive approval gate card with idempotency key: ${idempotencyKey}`);

      const approval: ApprovalAction = {
        id: `appr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        workspace_id: context.workspace_id,
        tool_name: proposedTool,
        skill_title: policyResult.definition?.skill_title || proposedTool,
        risk_level: policyResult.risk,
        idempotency_key: idempotencyKey,
        status: 'pending',
        summary: `Action proposal: ${policyResult.definition?.skill_title} for "${context.user_name}".`,
        parameters: toolParams,
        requested_by: 'Nexus Autonomous Agent',
        created_at: new Date().toISOString(),
        external_impact_warning: policyResult.definition?.externalImpactWarning,
      };

      const auditEntry: AuditLogEntry = {
        id: `aud_${Date.now()}`,
        workspace_id: context.workspace_id,
        timestamp: new Date().toISOString(),
        actor: { type: 'ai_agent', name: 'Nexus Orchestrator' },
        skill: proposedTool,
        risk_level: policyResult.risk,
        idempotency_key: idempotencyKey,
        action_summary: `Halted at approval gate: ${policyResult.definition?.skill_title}`,
        status: 'halted_awaiting_approval',
        module: (policyResult.definition?.requiredModule as any) || 'personal',
        payload: toolParams,
        duration_ms: 120,
      };

      const assistantMessage: AgentMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `I have prepared the action for **${policyResult.definition?.skill_title}**.\n\nPer the system safety policy, this action is classified as **${policyResult.risk.replace('_', ' ').toUpperCase()}** and requires explicit human approval before external credentials can be invoked. Please review the approval card below to execute or modify.`,
        timestamp: new Date().toISOString(),
        reasoning_trace: reasoningSteps,
        tool_invocations: [
          {
            id: `inv_${Date.now()}`,
            tool_name: proposedTool,
            risk: policyResult.risk,
            status: 'awaiting_approval',
            parameters: toolParams,
            approval_id: approval.id,
          },
        ],
      };

      return {
        message: assistantMessage,
        pendingApproval: approval,
        auditEntry,
      };
    }

    // 5. If Safe: Execute immediately
    reasoningSteps.push('Policy Engine risk classification: SAFE. Auto-executing action with zero external impact.');
    reasoningSteps.push(`Committing audit entry with idempotency key: ${idempotencyKey}`);

    let executionOutputText = '';
    let updatedData: any = {};

    if (proposedTool === 'web_search_research') {
      executionOutputText = `Research completed on "${toolParams.query}". Identified key operational metrics, corporate headquarters, and verified domain records. All insights synced to internal workspace knowledge.`;
    } else if (proposedTool === 'create_or_update_task') {
      executionOutputText = `Task "${toolParams.title}" successfully registered in team sprint board and assigned.`;
      const newTask = {
        id: `tsk_${Date.now()}`,
        workspace_id: context.workspace_id,
        title: toolParams.title,
        priority: toolParams.priority || 'medium',
        assignee_name: toolParams.assignee_name || context.user_name,
        status: 'todo',
        due_date: toolParams.due_date || '2026-09-30',
        time_spent_hours: 0,
      };
      updatedData.tasks = [newTask, ...context.tasks];
    } else {
      executionOutputText = `Executed safe skill ${proposedTool} successfully.`;
    }

    const auditEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      workspace_id: context.workspace_id,
      timestamp: new Date().toISOString(),
      actor: { type: 'ai_agent', name: 'Nexus Orchestrator' },
      skill: proposedTool,
      risk_level: 'safe',
      idempotency_key: idempotencyKey,
      action_summary: `Executed safe skill: ${policyResult.definition?.skill_title}`,
      status: 'executed',
      module: (policyResult.definition?.requiredModule as any) || 'personal',
      payload: toolParams,
      duration_ms: 245,
    };

    const assistantMessage: AgentMessage = {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: executionOutputText,
      timestamp: new Date().toISOString(),
      reasoning_trace: reasoningSteps,
      tool_invocations: [
        {
          id: `inv_${Date.now()}`,
          tool_name: proposedTool,
          risk: 'safe',
          status: 'safe_executed',
          parameters: toolParams,
          result: { status: 'success', summary: executionOutputText },
        },
      ],
    };

    return {
      message: assistantMessage,
      auditEntry,
      updatedData,
    };
  }
}
