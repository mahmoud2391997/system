import React from 'react';
import { Terminal, Users, CheckSquare, Building2, ScrollText, KeyRound, Lock } from 'lucide-react';
import { WorkspaceFeatures } from '../types';

export type ActiveTab = 'terminal' | 'crm' | 'team' | 'erp' | 'audit' | 'integrations';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  features: WorkspaceFeatures;
  pendingApprovalsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  features,
  pendingApprovalsCount,
}) => {
  const tabs = [
    {
      id: 'terminal' as ActiveTab,
      label: 'AI Terminal',
      sublabel: 'Agent & Approval Gate',
      icon: Terminal,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: 'bg-amber-500 text-white',
      enabled: true,
    },
    {
      id: 'crm' as ActiveTab,
      label: 'CRM & Pipeline',
      sublabel: 'Leads, Deals & Timeline',
      icon: Users,
      enabled: features.crm_enabled,
      requiredTier: 'Startup',
    },
    {
      id: 'team' as ActiveTab,
      label: 'Team & Projects',
      sublabel: 'Tasks, Boards & Roles',
      icon: CheckSquare,
      enabled: features.team_enabled,
      requiredTier: 'Team',
    },
    {
      id: 'erp' as ActiveTab,
      label: 'ERP & Finance',
      sublabel: 'Invoices & Inventory',
      icon: Building2,
      enabled: features.erp_enabled,
      requiredTier: 'Enterprise',
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Audit & Policy',
      sublabel: 'Immutable Ledger',
      icon: ScrollText,
      enabled: true,
    },
    {
      id: 'integrations' as ActiveTab,
      label: 'Integrations Vault',
      sublabel: 'Provider API Status',
      icon: KeyRound,
      enabled: true,
    },
  ];

  return (
    <nav className="bg-slate-900 text-slate-300 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = !tab.enabled;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                id={`nav-${tab.id}`}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : isLocked
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 opacity-75'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isLocked ? 'text-slate-400' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {isLocked && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        <Lock className="w-2.5 h-2.5" />
                        {tab.requiredTier}
                      </span>
                    )}
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${tab.badgeColor}`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
