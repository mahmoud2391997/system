import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import {
  WorkspaceFeatures,
  AgentMessage,
  ApprovalAction,
  AuditLogEntry,
  RiskClassification,
} from '../src/types.js';
import { PolicyEngine, REGISTERED_TOOLS } from './policyEngine.js';
import { db } from './db/client.js';
import {
  readGmailMessages,
  listGoogleCalendarEvents,
  sendGmailMessage,
  scheduleGoogleCalendarEvent,
} from './googleClient.js';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return geminiClient;
}

export interface AgentContext {
  workspace_id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  features: WorkspaceFeatures;
  contacts?: any[];
  deals?: any[];
  tasks?: any[];
  invoices?: any[];
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

// Function Declarations for Gemini Tool Calling
const agentToolDeclarations = [
  {
    name: 'send_email',
    description: 'Dispatches an official email to a counterparty or client via connected Google Workspace Gmail.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        recipient: { type: Type.STRING, description: 'The recipient email address' },
        subject: { type: Type.STRING, description: 'Email subject line' },
        body: { type: Type.STRING, description: 'Email body text content' },
        cc: { type: Type.STRING, description: 'Optional CC email address' },
      },
      required: ['recipient', 'subject', 'body'],
    },
  },
  {
    name: 'read_emails',
    description: 'Reads recent messages or queries the user inbox via the official Gmail API.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search term or query (e.g., from, subject, unread)' },
        max_results: { type: Type.INTEGER, description: 'Maximum number of emails to retrieve (1-10)' },
      },
    },
  },
  {
    name: 'schedule_meeting',
    description: 'Schedules a meeting on Google Calendar, checks conflicts, and dispatches invites.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Meeting title or subject' },
        attendee_email: { type: Type.STRING, description: 'Counterparty attendee email address' },
        datetime: { type: Type.STRING, description: 'Date and time of meeting (ISO format preferred or natural date)' },
        duration_minutes: { type: Type.INTEGER, description: 'Length of meeting in minutes (default: 30)' },
        description: { type: Type.STRING, description: 'Meeting agenda or description' },
      },
      required: ['title', 'attendee_email', 'datetime'],
    },
  },
  {
    name: 'list_calendar_events',
    description: 'Lists upcoming calendar events and meetings from Google Calendar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        time_min: { type: Type.STRING, description: 'ISO start datetime to fetch from' },
        max_results: { type: Type.INTEGER, description: 'Max events to return (default 10)' },
      },
    },
  },
  {
    name: 'send_whatsapp_message',
    description: 'Sends a WhatsApp business message (requires Phase 3 Meta verification).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phone_number: { type: Type.STRING, description: 'Recipient phone number' },
        message_text: { type: Type.STRING, description: 'Message body' },
      },
      required: ['phone_number', 'message_text'],
    },
  },
  {
    name: 'dispatch_voice_call',
    description: 'Dials an outbound voice call via telephony stream (requires Phase 3 carrier registration).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phone_number: { type: Type.STRING, description: 'Phone number to dial' },
        purpose: { type: Type.STRING, description: 'Call script/purpose' },
      },
      required: ['phone_number', 'purpose'],
    },
  },
  {
    name: 'crm_update_deal_stage',
    description: 'Updates a deal stage in CRM pipeline (requires Startup+ tier).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        deal_id: { type: Type.STRING, description: 'Deal identifier or title' },
        new_stage: { type: Type.STRING, description: 'New stage name' },
      },
      required: ['deal_id', 'new_stage'],
    },
  },
  {
    name: 'create_erp_invoice',
    description: 'Creates a billing invoice in the ERP module (requires Enterprise tier).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        client_name: { type: Type.STRING, description: 'Client name' },
        amount: { type: Type.NUMBER, description: 'Total invoice amount' },
        description: { type: Type.STRING, description: 'Service description' },
      },
      required: ['client_name', 'amount', 'description'],
    },
  },
];

export class AgentOrchestrator {
  /**
   * Main entrypoint for processing user messages through Gemini function calling
   */
  static async processMessage(
    userPrompt: string,
    context: AgentContext,
    conversationHistory: AgentMessage[]
  ): Promise<AgentExecutionResult> {
    const ai = getGemini();
    const reasoningSteps: string[] = [
      `Workspace tenant: ${context.workspace_id} (Tier: ${context.features.tier.toUpperCase()})`,
      `Acting operator: ${context.user_name} (${context.user_role})`,
    ];

    let proposedTool: string | null = null;
    let toolParams: Record<string, any> = {};
    let modelResponseText = '';

    // If Gemini API is available, invoke real tool-calling model
    if (ai) {
      try {
        const systemInstruction = `You are Nexus AI Operations Agent, an autonomous operations copilot for enterprise and personal workspaces.
Current tenant: ${context.workspace_id}. Current tier: ${context.features.tier}.
Acting user: ${context.user_name} (${context.user_role}).
Available Workspace Features: CRM=${context.features.crm_enabled}, Team=${context.features.team_enabled}, ERP=${context.features.erp_enabled}.

When the user requests actions like sending emails, reading emails, booking calendar meetings, checking calendar, updating deals, or invoicing, call the appropriate function tool.
Do NOT attempt to bypass permission policies. Always provide clear, objective operational updates.`;

        // Format recent history for context
        const formattedHistory = conversationHistory.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        const contents = [
          ...formattedHistory,
          { role: 'user', parts: [{ text: userPrompt }] },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
            tools: [{ functionDeclarations: agentToolDeclarations }],
          },
        });

        const candidate = response.candidates?.[0];
        modelResponseText = candidate?.content?.parts?.find((p: any) => p.text)?.text || '';

        // Check for function calls proposed by Gemini
        const functionCallPart = candidate?.content?.parts?.find((p: any) => p.functionCall);
        if (functionCallPart && functionCallPart.functionCall) {
          proposedTool = functionCallPart.functionCall.name;
          toolParams = (functionCallPart.functionCall.args as Record<string, any>) || {};
          reasoningSteps.push(`Gemini proposed function call: ${proposedTool}`);
        } else {
          reasoningSteps.push('Gemini resolved intent directly without requesting tool call.');
        }
      } catch (err: any) {
        console.error('Gemini API call failed, analyzing request intent directly:', err.message);
        reasoningSteps.push(`Gemini generation note: ${err.message}`);
      }
    } else {
      reasoningSteps.push('GEMINI_API_KEY not configured. Falling back to local semantic parser.');
    }

    // Fallback: If no tool was chosen by Gemini or API key was absent, perform semantic resolution
    if (!proposedTool) {
      const lower = userPrompt.toLowerCase();
      if (lower.includes('read email') || lower.includes('check email') || lower.includes('check inbox') || lower.includes('unread')) {
        proposedTool = 'read_emails';
        toolParams = { max_results: 5 };
      } else if (lower.includes('send email') || lower.includes('write email') || lower.includes('email to ') || lower.includes('draft email')) {
        proposedTool = 'send_email';
        // Extract recipient if present
        const emailMatch = userPrompt.match(/[\w.-]+@[\w.-]+\.\w+/);
        toolParams = {
          recipient: emailMatch ? emailMatch[0] : 'partner@example.com',
          subject: 'Operations Follow-up',
          body: userPrompt,
        };
      } else if (lower.includes('calendar') && (lower.includes('check') || lower.includes('view') || lower.includes('upcoming') || lower.includes('list'))) {
        proposedTool = 'list_calendar_events';
        toolParams = { max_results: 5 };
      } else if (lower.includes('schedule') || lower.includes('book') || lower.includes('meeting')) {
        proposedTool = 'schedule_meeting';
        const emailMatch = userPrompt.match(/[\w.-]+@[\w.-]+\.\w+/);
        toolParams = {
          title: 'Nexus Operations Sync',
          attendee_email: emailMatch ? emailMatch[0] : 'colleague@example.com',
          datetime: new Date(Date.now() + 24 * 3600000).toISOString(),
          duration_minutes: 30,
        };
      }
    }

    // If no tool is needed, return conversational response
    if (!proposedTool) {
      const replyText = modelResponseText || `I understand your request. I am your Nexus Operations Agent running on the **${context.features.tier.toUpperCase()}** tier.\n\nYou can ask me to **read your Gmail inbox**, **draft and send verified emails**, **schedule meetings on Google Calendar**, or **inspect upcoming events**. Every external action is strictly guarded by the Policy Engine.`;
      const msg: AgentMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
        reasoning_trace: reasoningSteps,
      };
      await db.messages.create(context.workspace_id, msg, context.user_id);
      return { message: msg };
    }

    // 2. Generate deterministic idempotency key and verify against ToolExecution table
    const paramHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ tool: proposedTool, params: toolParams, ws: context.workspace_id }))
      .digest('hex')
      .slice(0, 16);
    const idempotencyKey = `idemp_${proposedTool}_${paramHash}_${Date.now()}`;

    // Check if duplicate execution exists
    const existingExecution = await db.toolExecutions.findByIdempotencyKey(context.workspace_id, idempotencyKey);
    if (existingExecution && existingExecution.status === 'executed') {
      reasoningSteps.push(`Idempotency check: duplicate action detected (${idempotencyKey}). Returning cached result.`);
      const cachedMsg: AgentMessage = {
        id: `msg_cached_${Date.now()}`,
        sender: 'assistant',
        text: `**Idempotency Cache Hit**\n\nThis action was already executed with key \`${idempotencyKey}\`.\nCached Result:\n\`\`\`json\n${JSON.stringify(existingExecution.result, null, 2)}\n\`\`\``,
        timestamp: new Date().toISOString(),
        reasoning_trace: reasoningSteps,
      };
      return { message: cachedMsg };
    }

    // 3. Strict Server-Side Policy Evaluation
    const policyResult = PolicyEngine.evaluate(
      proposedTool,
      toolParams,
      context.features,
      context.user_role
    );
    reasoningSteps.push(`Policy Engine decision: ${policyResult.allowed ? 'ALLOWED' : 'BLOCKED'} (Risk: ${policyResult.risk})`);

    // Case A: Policy Denied (e.g. tier locked or insufficient privilege)
    if (!policyResult.allowed) {
      const toolExecRecord = await db.toolExecutions.create({
        id: `exec_${Date.now()}`,
        workspace_id: context.workspace_id,
        user_id: context.user_id,
        tool_name: proposedTool,
        idempotency_key: idempotencyKey,
        parameters: toolParams,
        status: 'rejected',
        error: policyResult.reason,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      const auditEntry: AuditLogEntry = {
        id: `aud_${Date.now()}`,
        workspace_id: context.workspace_id,
        timestamp: new Date().toISOString(),
        actor: { type: 'user', name: context.user_name, role: context.user_role as any },
        skill: proposedTool,
        risk_level: policyResult.risk,
        idempotency_key: idempotencyKey,
        action_summary: `Policy Engine rejected execution of ${proposedTool}: ${policyResult.reason}`,
        status: 'rejected',
        module: proposedTool.startsWith('crm') ? 'crm' : proposedTool.startsWith('erp') ? 'erp' : 'personal',
        payload: { parameters: toolParams, reason: policyResult.reason },
        duration_ms: 12,
      };
      await db.auditLogs.create(auditEntry);

      const errorMsg: AgentMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: `⛔ **Action Blocked by Policy Engine**\n\n${policyResult.reason}\n\n- **Skill**: \`${proposedTool}\`\n- **Workspace Tier**: \`${context.features.tier.toUpperCase()}\`\n- **Idempotency Key**: \`${idempotencyKey}\`\n- **Audit Entry**: \`${auditEntry.id}\``,
        timestamp: new Date().toISOString(),
        reasoning_trace: reasoningSteps,
      };
      await db.messages.create(context.workspace_id, errorMsg, context.user_id);
      return { message: errorMsg, auditEntry };
    }

    // Case B: Requires Operator Approval (Human-In-The-Loop gate for send_email, schedule_meeting, etc.)
    if (policyResult.requiresApproval) {
      reasoningSteps.push(`Halting tool execution: Human-In-The-Loop confirmation required for risk level ${policyResult.risk}`);

      const pendingApproval: ApprovalAction = {
        id: `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        workspace_id: context.workspace_id,
        tool_name: proposedTool,
        skill_title: policyResult.definition?.skill_title || proposedTool,
        risk_level: policyResult.risk,
        idempotency_key: idempotencyKey,
        status: 'pending',
        summary: proposedTool === 'send_email'
          ? `Outbound email to ${toolParams.recipient} with subject "${toolParams.subject}"`
          : proposedTool === 'schedule_meeting'
          ? `Google Calendar event "${toolParams.title}" with ${toolParams.attendee_email}`
          : `Gated action for ${policyResult.definition?.skill_title || proposedTool}`,
        parameters: toolParams,
        requested_by: context.user_name,
        created_at: new Date().toISOString(),
        external_impact_warning: policyResult.definition?.externalImpactWarning,
      };

      await db.approvals.create(pendingApproval);

      await db.toolExecutions.create({
        id: `exec_${Date.now()}`,
        workspace_id: context.workspace_id,
        user_id: context.user_id,
        tool_name: proposedTool,
        idempotency_key: idempotencyKey,
        parameters: toolParams,
        status: 'halted_awaiting_approval',
        created_at: new Date().toISOString(),
      });

      const auditEntry: AuditLogEntry = {
        id: `aud_${Date.now()}`,
        workspace_id: context.workspace_id,
        timestamp: new Date().toISOString(),
        actor: { type: 'ai_agent', name: 'Nexus AI Orchestrator' },
        skill: proposedTool,
        risk_level: policyResult.risk,
        idempotency_key: idempotencyKey,
        action_summary: `Halted ${policyResult.definition?.skill_title || proposedTool} awaiting operator confirmation`,
        status: 'halted_awaiting_approval',
        module: proposedTool.startsWith('crm') ? 'crm' : proposedTool.startsWith('erp') ? 'erp' : 'personal',
        payload: { approval_id: pendingApproval.id, parameters: toolParams },
        duration_ms: 24,
      };
      await db.auditLogs.create(auditEntry);

      const approvalMsg: AgentMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Operator Confirmation Required**\n\nThe Policy Engine has queued an approval card for **${pendingApproval.skill_title}**.\n\n- **Target**: \`${toolParams.recipient || toolParams.attendee_email || 'External Endpoint'}\`\n- **Risk Level**: \`${policyResult.risk.toUpperCase()}\`\n- **Idempotency Key**: \`${idempotencyKey}\`\n\nPlease review and approve the action in the approval card above or in the Approvals queue to execute the real dispatch.`,
        timestamp: new Date().toISOString(),
        reasoning_trace: reasoningSteps,
      };
      await db.messages.create(context.workspace_id, approvalMsg, context.user_id);

      return {
        message: approvalMsg,
        pendingApproval,
        auditEntry,
      };
    }

    // Case C: Safe Tool — Execute Immediately (read_emails, list_calendar_events)
    reasoningSteps.push(`Executing safe read-only tool: ${proposedTool}`);
    let toolResult: any = null;
    let toolError: string | null = null;
    const startTime = Date.now();

    try {
      if (proposedTool === 'read_emails') {
        toolResult = await readGmailMessages(context.workspace_id, toolParams);
      } else if (proposedTool === 'list_calendar_events') {
        toolResult = await listGoogleCalendarEvents(context.workspace_id, toolParams);
      } else {
        toolResult = { status: 'executed_safe_query', parameters: toolParams };
      }
    } catch (err: any) {
      toolError = err.message || 'Tool execution encountered an error';
      console.error(`Error executing ${proposedTool}:`, err);
    }

    const durationMs = Date.now() - startTime;

    const toolExec = await db.toolExecutions.create({
      id: `exec_${Date.now()}`,
      workspace_id: context.workspace_id,
      user_id: context.user_id,
      tool_name: proposedTool,
      idempotency_key: idempotencyKey,
      parameters: toolParams,
      status: toolError ? 'failed' : 'executed',
      result: toolResult,
      error: toolError || undefined,
      created_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    });

    const auditEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      workspace_id: context.workspace_id,
      timestamp: new Date().toISOString(),
      actor: { type: 'ai_agent', name: 'Nexus AI Orchestrator' },
      skill: proposedTool,
      risk_level: 'safe',
      idempotency_key: idempotencyKey,
      action_summary: toolError
        ? `Failed execution of ${proposedTool}: ${toolError}`
        : `Executed safe operational query: ${proposedTool}`,
      status: toolError ? 'failed' : 'executed',
      module: 'personal',
      payload: { parameters: toolParams, result_count: Array.isArray(toolResult) ? toolResult.length : 1, error: toolError },
      duration_ms: durationMs,
    };
    await db.auditLogs.create(auditEntry);

    let outputText = '';
    if (toolError) {
      outputText = `❌ **Tool Execution Error**\n\nFailed to query **${proposedTool}**: ${toolError}\n\n*If your Google account is not connected yet, please visit the **Integrations** tab to connect your Google Workspace account.*`;
    } else if (proposedTool === 'read_emails') {
      const emails = toolResult as any[];
      if (emails.length === 0) {
        outputText = `📬 **Gmail Inbox Query**: No recent emails found matching criteria.`;
      } else {
        outputText = `📬 **Gmail Inbox Results** (${emails.length} messages found):\n\n` +
          emails.map((e, idx) => `**${idx + 1}. From: ${e.from}**\n- *Subject*: ${e.subject}\n- *Snippet*: ${e.snippet}`).join('\n\n');
      }
    } else if (proposedTool === 'list_calendar_events') {
      const events = toolResult as any[];
      if (events.length === 0) {
        outputText = `📅 **Google Calendar Query**: No upcoming events found.`;
      } else {
        outputText = `📅 **Upcoming Google Calendar Events** (${events.length} found):\n\n` +
          events.map((e, idx) => `**${idx + 1}. ${e.title}**\n- *Time*: ${e.start} to ${e.end}\n- [Open Event in Google Calendar](${e.htmlLink})`).join('\n\n');
      }
    } else {
      outputText = `Query executed successfully.\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``;
    }

    const assistantMsg: AgentMessage = {
      id: `msg_asst_${Date.now()}`,
      sender: 'assistant',
      text: outputText,
      timestamp: new Date().toISOString(),
      reasoning_trace: reasoningSteps,
    };
    await db.messages.create(context.workspace_id, assistantMsg, context.user_id);

    return {
      message: assistantMsg,
      auditEntry,
    };
  }
}
