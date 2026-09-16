import React, { useState, useEffect, useCallback } from 'react';
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
import { AuthView } from './components/AuthView';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('terminal');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpdatingTier, setIsUpdatingTier] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatar?: string;
  } | null>(null);

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

  // Authenticated fetch wrapper
  const fetchWithAuth = useCallback((url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('nexus_token');
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers, credentials: 'include' });
  }, []);

  // Fetch all workspace data
  const loadAllData = useCallback(async () => {
    try {
      const [wsRes, intRes, apprRes, audRes, msgRes] = await Promise.all([
        fetchWithAuth('/api/workspace').then((r) => r.ok ? r.json() : null),
        fetchWithAuth('/api/integrations').then((r) => r.ok ? r.json() : null),
        fetchWithAuth('/api/approvals').then((r) => r.ok ? r.json() : null),
        fetchWithAuth('/api/audit-logs').then((r) => r.ok ? r.json() : null),
        fetchWithAuth('/api/messages').then((r) => r.ok ? r.json() : null),
      ]);

      if (wsRes) {
        setWorkspace(wsRes.workspace);
        setFeatures(wsRes.features);
        setMembers(wsRes.members || []);
      }
      if (intRes) setIntegrations(intRes.integrations || []);
      if (apprRes) setApprovals(apprRes.approvals || []);
      if (audRes) setAuditLogs(audRes.auditLogs || []);
      if (msgRes) setMessages(msgRes.messages || []);

      // Load preview module data
      if (wsRes?.features?.crm_enabled) {
        const crmRes = await fetchWithAuth('/api/crm').then((r) => r.ok ? r.json() : null);
        if (crmRes && !crmRes.locked) {
          setContacts(crmRes.contacts || []);
          setDeals(crmRes.deals || []);
        }
      }
      if (wsRes?.features?.team_enabled) {
        const teamRes = await fetchWithAuth('/api/team').then((r) => r.ok ? r.json() : null);
        if (teamRes && !teamRes.locked) {
          setTasks(teamRes.tasks || []);
        }
      }
      if (wsRes?.features?.erp_enabled) {
        const erpRes = await fetchWithAuth('/api/erp').then((r) => r.ok ? r.json() : null);
        if (erpRes && !erpRes.locked) {
          setInvoices(erpRes.invoices || []);
          setInventory(erpRes.inventory || []);
        }
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  }, [fetchWithAuth]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchWithAuth('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            await loadAllData();
            setIsInitialLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      }
      setCurrentUser(null);
      setIsInitialLoading(false);
    };

    checkAuth();
  }, [fetchWithAuth, loadAllData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('nexus_token');
    setCurrentUser(null);
    setWorkspace(null);
    setFeatures(null);
  };

  // Send message to agent
  const handleSendMessage = async (text: string) => {
    setIsAgentLoading(true);
    try {
      const res = await fetchWithAuth('/api/agent/chat', {
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
      const res = await fetchWithAuth(`/api/approvals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();

      if (data.success) {
        setApprovals((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: decision === 'approve' ? 'approved' : 'rejected' } : a))
        );
        if (data.features) {
          setFeatures(data.features);
        }
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
      const res = await fetchWithAuth('/api/workspace/tier', {
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

  // Trigger action from modules
  const handleTriggerAction = (prompt: string) => {
    setActiveTab('terminal');
    handleSendMessage(prompt);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center text-[#20232D]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#171717]" />
          <span className="font-mono text-xs text-[#737373] tracking-wider">
            nexus@core:~$ initializing session...
          </span>
        </div>
      </div>
    );
  }

  // If not authenticated, render AuthView
  if (!currentUser || !workspace || !features) {
    return (
      <AuthView
        onSuccess={async (authData) => {
          setCurrentUser(authData.user);
          setIsInitialLoading(true);
          await loadAllData();
          setIsInitialLoading(false);
        }}
      />
    );
  }

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#20232D] font-sans flex flex-col selection:bg-[#5C4620] selection:text-[#171717]">
      {/* Global Header */}
      <Header
        workspace={workspace}
        features={features}
        members={members}
        currentUser={currentUser}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onLogout={handleLogout}
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
            onAdvanceDealStage={async (dealId, nextStage) => {
              setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: nextStage } : d));
            }}
            onTriggerAction={handleTriggerAction}
          />
        )}

        {activeTab === 'team' && (
          <TeamView
            features={features}
            tasks={tasks}
            members={members}
            onUpgradeInPlace={() => handleSelectTier('team')}
            onCreateTask={(task) => {
              setTasks((prev) => [
                {
                  id: `task_${Date.now()}`,
                  workspace_id: workspace.id,
                  title: task.title,
                  priority: task.priority,
                  assignee: task.assignee_name,
                  status: 'todo',
                  due_date: task.due_date || '2026-10-01',
                },
                ...prev,
              ]);
            }}
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
          />
        )}

        {activeTab === 'audit' && <AuditLedgerView auditLogs={auditLogs} />}

        {activeTab === 'integrations' && (
          <IntegrationsView
            integrations={integrations}
            onRefresh={loadAllData}
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
