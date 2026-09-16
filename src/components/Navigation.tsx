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
      label: 'Terminal & Agent',
      icon: Terminal,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: 'bg-[#4A3B20] text-[#E2A23C] border border-[#E2A23C]/50',
      enabled: true,
    },
    {
      id: 'crm' as ActiveTab,
      label: 'CRM & Pipeline',
      icon: Users,
      enabled: features.crm_enabled,
      requiredTier: 'Startup',
    },
    {
      id: 'team' as ActiveTab,
      label: 'Team & Projects',
      icon: CheckSquare,
      enabled: features.team_enabled,
      requiredTier: 'Team',
    },
    {
      id: 'erp' as ActiveTab,
      label: 'ERP & Finance',
      icon: Building2,
      enabled: features.erp_enabled,
      requiredTier: 'Enterprise',
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Audit & Policy',
      icon: ScrollText,
      enabled: true,
    },
    {
      id: 'integrations' as ActiveTab,
      label: 'Provider Vault',
      icon: KeyRound,
      enabled: true,
    },
  ];

  return (
    <nav className="bg-[#15120F] text-[#F3E9D2] border-b border-[#3A2F22] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = !tab.enabled;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                id={`nav-${tab.id}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#1D1814] text-[#FFB000] border-[#FFB000] shadow-[0_0_12px_rgba(255,176,0,0.15)] font-semibold'
                    : isLocked
                    ? 'text-[#F3E9D2]/40 hover:text-[#F3E9D2]/60 hover:bg-[#1D1814]/50 border-transparent'
                    : 'text-[#F3E9D2]/75 hover:text-[#F3E9D2] hover:bg-[#1D1814] border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFB000]' : isLocked ? 'text-[#F3E9D2]/30' : 'text-[#B8850A]'}`} />
                <span className="font-sans text-xs">{tab.label}</span>
                {isLocked && (
                  <span className="flex items-center gap-0.5 text-[10px] font-mono uppercase bg-[#1D1814] text-[#B8850A] px-1 py-0.2 rounded border border-[#3A2F22]">
                    <Lock className="w-2.5 h-2.5" />
                    {tab.requiredTier}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
