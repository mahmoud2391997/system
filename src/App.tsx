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
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('terminal');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUpdatingTier, setIsUpdatingTier] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatar?: string;
  } | null>(null);

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

  const fetchWithAuth = useCallback((url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('nexus_token');
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers, credentials: 'include' });
  }, []);

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

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('nexus_token');
      if (!token) {
        setCurrentUser(null);
        setIsInitialLoading(false);
        return;
      }
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
        localStorage.removeItem('nexus_token');
      } catch (err) {
        console.error('Auth verification error:', err);
      }
      setCurrentUser(null);
      setIsInitialLoading(false);
    };

    checkAuth();
  }, [fetchWithAuth, loadAllData]);

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
        const homes: Record<WorkspaceTier, ActiveTab> = {
          personal: 'terminal',
          startup: 'crm',
          team: 'team',
          enterprise: 'erp',
        };
        setActiveTab(homes[targetTier]);
      }
    } catch (err) {
      console.error('Error updating tier:', err);
    } finally {
      setIsUpdatingTier(false);
    }
  };

  const handleTriggerAction = (prompt: string) => {
    setActiveTab('terminal');
    handleSendMessage(prompt);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-mono text-lg font-bold">N</span>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

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

  return (
    <div className="h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
      <Navigation
        workspace={workspace}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        features={features}
        currentUser={currentUser}
        members={members}
        onSelectTier={handleSelectTier}
        isUpdatingTier={isUpdatingTier}
        onLogout={handleLogout}
      />
      <main className={`flex-1 min-h-0 bg-background ${activeTab === 'terminal' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={activeTab === 'terminal' ? 'h-full min-h-0' : 'pb-12'}
          >
            {activeTab === 'terminal' && (
              <AITerminal
                messages={messages}
                pendingApprovals={approvals}
                features={features}
                onSendMessage={handleSendMessage}
                onDecideApproval={handleDecideApproval}
                isLoading={isAgentLoading}
                currentUser={currentUser}
                onLogout={handleLogout}
                integrations={integrations}
                auditLogs={auditLogs}
                tasks={tasks}
                onSelectTier={handleSelectTier}
                isUpdatingTier={isUpdatingTier}
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
              <IntegrationsView integrations={integrations} onRefresh={loadAllData} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
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
