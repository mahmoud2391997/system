import { db } from './client.js';
import { hashPassword } from '../crypto.js';
import { connectPersonalGmail } from '../personalServices.js';
import { getTierConfig } from '../store.js';

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

  // 4. Workspace Features - Startup is the entry plan
  await db.features.upsert({
    workspace_id: workspaceId,
    ...getTierConfig('startup'),
    automation_usage: {
      emails: 0,
      messages: 0,
      calls: 0,
    },
  });

  // 5. Integrations - Personal Gmail/Calendar are live after Gmail login
  const defaultIntegrations = [
    {
      id: 'int_gmail',
      workspace_id: workspaceId,
      provider: 'Gmail',
      name: 'Gmail',
      type: 'email' as const,
      auth_type: 'Gmail login (no Google client IDs)',
      connected: false,
      scopes: 'personal.gmail.read personal.gmail.send',
      description: 'Send and read mail for this Gmail account.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'int_calendar',
      workspace_id: workspaceId,
      provider: 'Google Calendar',
      name: 'Calendar',
      type: 'calendar' as const,
      auth_type: 'Gmail login (no Google client IDs)',
      connected: false,
      scopes: 'personal.calendar.read personal.calendar.write',
      description: 'Book events and inspect upcoming meetings.',
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

  await connectPersonalGmail(workspaceId, 'sarah.chen@apexhorizon.io');

  // 6. Initial Welcome Message
  await db.messages.create(workspaceId, {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Welcome to **Nexus** (Personal).\n\nSign in with Gmail and inbox, send, calendar, policy, and web search are ready. Google client IDs are not required.\n\nOutbound mail and new events still go through the Policy Engine and Audit Ledger.`,
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
