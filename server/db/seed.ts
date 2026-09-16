import { db } from './client.js';
import { hashPassword } from '../crypto.js';

export async function seedInitialData() {
  await db.init();

  // Check if any user already exists
  const existingUser = await db.users.findByEmail('sarah.chen@apexhorizon.io');
  if (existingUser) {
    return; // Already seeded
  }

  console.log('[SEED] Seeding default local dev workspace and user...');

  const userId = 'usr_sarah_owner';
  const workspaceId = 'ws_operations_main';

  // 1. User
  await db.users.create({
    id: userId,
    email: 'sarah.chen@apexhorizon.io',
    password_hash: hashPassword('nexusdemo123'),
    name: 'Sarah Chen',
    avatar: 'SC',
    created_at: new Date().toISOString(),
  });

  // 2. Workspace
  await db.workspaces.create(
    {
      id: workspaceId,
      name: 'Apex Horizon Technologies',
      slug: 'apex-horizon',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      current_user_role: 'owner',
    },
    userId
  );

  // 3. Workspace Member
  await db.members.create({
    id: 'mem_sarah',
    workspace_id: workspaceId,
    user_id: userId,
    name: 'Sarah Chen',
    email: 'sarah.chen@apexhorizon.io',
    role: 'owner',
    avatar: 'SC',
    status: 'active',
  });

  // 4. Workspace Features - Grounded in Personal Tier
  await db.features.upsert({
    workspace_id: workspaceId,
    tier: 'personal',
    crm_enabled: false,
    team_enabled: false,
    erp_enabled: false,
    max_seats: 1,
    automation_caps: {
      emails: 100,
      messages: 0,
      calls: 0,
    },
    automation_usage: {
      emails: 0,
      messages: 0,
      calls: 0,
    },
  });

  // 5. Integrations - Honest state: Real Google Workspace available, others visibly disabled
  const defaultIntegrations = [
    {
      id: 'int_gmail',
      workspace_id: workspaceId,
      provider: 'Google Cloud Platform',
      name: 'Google Workspace Gmail API',
      type: 'email' as const,
      auth_type: 'OAuth 2.0 (Server-Side AES-256 Vault)',
      connected: false,
      scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
      description: 'Send and read official workspace emails with zero prompt token leakage.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'int_calendar',
      workspace_id: workspaceId,
      provider: 'Google Calendar v3',
      name: 'Google Calendar API',
      type: 'calendar' as const,
      auth_type: 'Scoped Workspace OAuth',
      connected: false,
      scopes: 'https://www.googleapis.com/auth/calendar.events',
      description: 'Book events, check free/busy slots, and dispatch verified meeting invites.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'int_whatsapp',
      workspace_id: workspaceId,
      provider: 'Meta for Developers',
      name: 'WhatsApp Business Cloud API',
      type: 'whatsapp' as const,
      auth_type: 'Phase 3 - Meta Verification Required',
      connected: false,
      description: 'Requires official Meta Business Manager verification. Visibly locked for Phase 1-2 MVP.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'int_voice',
      workspace_id: workspaceId,
      provider: 'Twilio Media Streams',
      name: 'Real-Time Telephony Stream',
      type: 'voice' as const,
      auth_type: 'Phase 3 - Encrypted SIP Trunk Required',
      connected: false,
      description: 'Requires carrier regulatory registration. Visibly locked for Phase 1-2 MVP.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const int of defaultIntegrations) {
    await db.integrations.upsert(int);
  }

  // 6. Initial Welcome Message
  await db.messages.create(workspaceId, {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Welcome to **Nexus AI Operations Platform** (Personal Tier).\n\nYour workspace is scoped with durable database persistence and strict policy gating.\n\n- **Real Integrations**: Connect your official Gmail and Google Calendar credentials in the **Integrations** tab.\n- **Autonomous Guardrails**: Every outbound message or event is vetted by the **Policy Engine** and recorded to the immutable **Audit Ledger**.\n- **Idempotency**: All execution calls are tracked to prevent duplicate dispatches.`,
    timestamp: new Date().toISOString(),
    reasoning_trace: [
      `Tenant database initialized: ${workspaceId}`,
      `Resolved tier: PERSONAL (CRM, Team, ERP safely gated)`,
      `Policy Engine mounted with function declarations.`,
      `Zero-prompt-leakage token vault active.`,
    ],
  });

  console.log('[SEED] Default seed complete.');
}
