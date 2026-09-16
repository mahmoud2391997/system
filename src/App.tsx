import React, { useState, useEffect } from 'react';
import {
  Workspace,
  WorkspaceFeatures,
  WorkspaceMember,
  ApprovalAction,
  AuditLogEntry,
  AgentMessage,
  LeadContact,
  Deal,
  ProjectTask,
  Invoice,
  InventoryItem,
  IntegrationStatus,
  WorkspaceTier,
} from './types';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { AITerminal } from './components/AITerminal';
import { CRMView } from './components/CRMView';
import { TeamView } from './components/TeamView';
import { ERPView } from './components/ERPView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { IntegrationsView } from './components/IntegrationsView';
import { UpgradeModal } from './components/UpgradeModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('terminal');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpdatingTier, setIsUpdatingTier] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Application Data State
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [features, setFeatures] = useState<WorkspaceFeatures | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [approvals, setApprovals] = useState<ApprovalAction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const [wsRes, intRes, apprRes, audRes, msgRes] = await Promise.all([
        fetch('/api/workspace').then((r) => r.json()),
        fetch('/api/integrations').then((r) => r.json()),
        fetch('/api/approvals').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
        fetch('/api/messages').then((r) => r.json()),
      ]);

      setWorkspace(wsRes.workspace);
      setFeatures(wsRes.features);
      setMembers(wsRes.members);
      setIntegrations(intRes.integrations);
      setApprovals(apprRes.approvals);
      setAuditLogs(audRes.auditLogs);
      setMessages(msgRes.messages);

      // Load module data if unlocked
      if (wsRes.features.crm_enabled) {
        const crmRes = await fetch('/api/crm').then((r) => r.json());
        if (!crmRes.locked) {
          setContacts(crmRes.contacts || []);
          setDeals(crmRes.deals || []);
        }
      }
      if (wsRes.features.team_enabled) {
        const teamRes = await fetch('/api/team').then((r) => r.json());
        if (!teamRes.locked) {
          setTasks(teamRes.tasks || []);
        }
      }
      if (wsRes.features.erp_enabled) {
        const erpRes = await fetch('/api/erp').then((r) => r.json());
        if (!erpRes.locked) {
          setInvoices(erpRes.invoices || []);
          setInventory(erpRes.inventory || []);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Send message to agent
  const handleSendMessage = async (text: string) => {
    setIsAgentLoading(true);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (data.userMessage && data.assistantMessage) {
        setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);
      }
      if (data.pendingApproval) {
        setApprovals((prev) => [data.pendingApproval, ...prev]);
      }
      if (data.auditEntry) {
        setAuditLogs((prev) => [data.auditEntry, ...prev]);
      }

      // Refresh module data
      await loadAllData();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsAgentLoading(false);
    }
  };

  // Decide approval (Approve / Reject)
  const handleDecideApproval = async (id: string, decision: 'approve' | 'reject', notes?: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();

      if (data.success) {
        // Update local approvals state
        setApprovals((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: decision === 'approve' ? 'approved' : 'rejected' } : a))
        );
        // Refresh all data to pull newly generated tasks/deals/invoices and audit entries
        await loadAllData();
      }
    } catch (err) {
      console.error('Error deciding approval:', err);
    }
  };

  // Upgrade-in-place
  const handleSelectTier = async (targetTier: WorkspaceTier) => {
    setIsUpdatingTier(true);
    try {
      const res = await fetch('/api/workspace/tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier }),
      });
      const data = await res.json();
      if (data.success) {
        setFeatures(data.features);
        await loadAllData();
        setIsUpgradeModalOpen(false);
      }
    } catch (err) {
      console.error('Error updating tier:', err);
    } finally {
      setIsUpdatingTier(false);
    }
  };

  // Advance deal stage
  const handleAdvanceDealStage = async (dealId: string, nextStage: Deal['stage']) => {
    try {
      const res = await fetch('/api/crm/deals/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, stage: nextStage }),
      });
      const data = await res.json();
      if (data.success) {
        setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage } : d)));
      }
    } catch (err) {
      console.error('Error advancing deal stage:', err);
    }
  };

  // Create CRM Contact
  const handleCreateContact = async (contactData: Partial<LeadContact>) => {
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setContacts((prev) => [data.contact, ...prev]);
      }
    } catch (err) {
      console.error('Error creating contact:', err);
    }
  };

  // Create CRM Deal
  const handleCreateDeal = async (dealData: Partial<Deal>) => {
    try {
      const res = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData),
      });
      const data = await res.json();
      if (data.success && data.deal) {
        setDeals((prev) => [data.deal, ...prev]);
      }
    } catch (err) {
      console.error('Error creating deal:', err);
    }
  };

  // Add note to contact
  const handleAddContactNote = async (contactId: string, text: string) => {
    try {
      const res = await fetch(`/api/crm/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: 'Sarah Chen (Admin)' }),
      });
      const data = await res.json();
      if (data.success && data.note) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId
              ? { ...c, notes: [data.note, ...(c.notes || [])], last_activity: 'Note added just now' }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error adding contact note:', err);
    }
  };

  // Team Task handlers
  const handleCreateTask = async (task: { title: string; priority: ProjectTask['priority']; assignee_name: string; due_date?: string }) => {
    try {
      const res = await fetch('/api/team/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => [data.task, ...prev]);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: ProjectTask['status']) => {
    try {
      const res = await fetch(`/api/team/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleLogTaskTime = async (taskId: string, hours: number) => {
    try {
      const res = await fetch(`/api/team/tasks/${taskId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      }
    } catch (err) {
      console.error('Error logging task time:', err);
    }
  };

  const handleInviteMember = async (memberData: { name: string; email: string; role: WorkspaceMember['role'] }) => {
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const data = await res.json();
      if (data.success && data.member) {
        setMembers((prev) => [...prev, data.member]);
      }
    } catch (err) {
      console.error('Error inviting member:', err);
    }
  };

  // ERP Operations
  const handleCreateInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      const res = await fetch('/api/erp/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.success && data.invoice) {
        setInvoices((prev) => [data.invoice, ...prev]);
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const res = await fetch(`/api/erp/invoices/${invoiceId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)));
      }
    } catch (err) {
      console.error('Error updating invoice status:', err);
    }
  };

  const handleCreateInventoryItem = async (itemData: Partial<InventoryItem>) => {
    try {
      const res = await fetch('/api/erp/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setInventory((prev) => [data.item, ...prev]);
      }
    } catch (err) {
      console.error('Error adding inventory SKU:', err);
    }
  };

  const handleUpdateInventoryStock = async (itemId: string, delta: number) => {
    try {
      const res = await fetch(`/api/erp/inventory/${itemId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setInventory((prev) => prev.map((item) => (item.id === itemId ? data.item : item)));
      }
    } catch (err) {
      console.error('Error updating inventory stock:', err);
    }
  };

  // Integrations Vault Operations
  const handlePingIntegration = async (integrationId: string) => {
    try {
      const res = await fetch('/api/integrations/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: integrationId }),
      });
      const data = await res.json();
      if (data.success && data.integration) {
        setIntegrations((prev) =>
          prev.map((int) => (int.id === integrationId ? data.integration : int))
        );
      }
    } catch (err) {
      console.error('Error pinging integration:', err);
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    try {
      const res = await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: integrationId }),
      });
      const data = await res.json();
      if (data.success && data.integration) {
        setIntegrations((prev) =>
          prev.map((int) => (int.id === integrationId ? data.integration : int))
        );
      }
    } catch (err) {
      console.error('Error toggling integration:', err);
    }
  };

  // Trigger action from modules
  const handleTriggerAction = (prompt: string) => {
    setActiveTab('terminal');
    handleSendMessage(prompt);
  };

  if (isInitialLoading || !workspace || !features) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="font-mono text-xs text-slate-400">
            Initializing Nexus AI Operations Platform...
          </span>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Global Header */}
      <Header
        workspace={workspace}
        features={features}
        members={members}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        features={features}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'terminal' && (
          <AITerminal
            messages={messages}
            pendingApprovals={approvals}
            features={features}
            onSendMessage={handleSendMessage}
            onDecideApproval={handleDecideApproval}
            isLoading={isAgentLoading}
          />
        )}

        {activeTab === 'crm' && (
          <CRMView
            features={features}
            contacts={contacts}
            deals={deals}
            onUpgradeInPlace={() => handleSelectTier('startup')}
            onAdvanceDealStage={handleAdvanceDealStage}
            onTriggerAction={handleTriggerAction}
            onCreateContact={handleCreateContact}
            onCreateDeal={handleCreateDeal}
            onAddNote={handleAddContactNote}
          />
        )}

        {activeTab === 'team' && (
          <TeamView
            features={features}
            tasks={tasks}
            members={members}
            onUpgradeInPlace={() => handleSelectTier('team')}
            onCreateTask={handleCreateTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onLogTaskTime={handleLogTaskTime}
            onInviteMember={handleInviteMember}
            onTriggerAction={handleTriggerAction}
          />
        )}

        {activeTab === 'erp' && (
          <ERPView
            features={features}
            invoices={invoices}
            inventory={inventory}
            onUpgradeInPlace={() => handleSelectTier('enterprise')}
            onTriggerAction={handleTriggerAction}
            onCreateInvoice={handleCreateInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onCreateInventoryItem={handleCreateInventoryItem}
            onUpdateInventoryStock={handleUpdateInventoryStock}
          />
        )}

        {activeTab === 'audit' && <AuditLedgerView auditLogs={auditLogs} />}

        {activeTab === 'integrations' && (
          <IntegrationsView
            integrations={integrations}
            onPingIntegration={handlePingIntegration}
            onToggleIntegration={handleToggleIntegration}
          />
        )}
      </main>

      {/* Upgrade-in-Place Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        features={features}
        onSelectTier={handleSelectTier}
        isUpdating={isUpdatingTier}
      />
    </div>
  );
}
