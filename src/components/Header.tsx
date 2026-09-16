import React from 'react';
import { Shield, Sparkles, Zap, ChevronDown, Lock, Server, Cpu, Layers } from 'lucide-react';
import { Workspace, WorkspaceFeatures, WorkspaceMember, WorkspaceTier } from '../types';

interface HeaderProps {
  workspace: Workspace;
  features: WorkspaceFeatures;
  members: WorkspaceMember[];
  onOpenUpgradeModal: () => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  workspace,
  features,
  members,
  onOpenUpgradeModal,
  pendingApprovalsCount,
}) => {
  const currentMember = members.find((m) => m.role === 'admin') || members[0];

  const tierColors: Record<WorkspaceTier, { bg: string; text: string; border: string }> = {
    personal: { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' },
    startup: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    team: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    enterprise: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  };

  const currentTierStyle = tierColors[features.tier] || tierColors.startup;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Workspace Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">Nexus AI</span>
                <span className="text-xs text-slate-500 font-mono">v1.4 • Unified Ops</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium text-slate-800">{workspace.name}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-600">{workspace.slug}</span>
              </div>
            </div>
          </div>

          {/* Center Info: Architecture & Security Badges */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Policy Engine: <strong>Active</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>AES-256 Vault: <strong>Locked</strong></span>
            </div>
            {pendingApprovalsCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Approval</span>
              </div>
            )}
          </div>

          {/* Right Action: Tier Badge & Upgrade-in-Place Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUpgradeModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm ${currentTierStyle.bg} ${currentTierStyle.text} ${currentTierStyle.border}`}
              title="Click to simulate Upgrade-in-Place tier change"
              id="tier-upgrade-btn"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-mono text-[11px]">{features.tier} TIER</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-xs shadow-sm">
                {currentMember.avatar || 'SC'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{currentMember.name}</p>
                <p className="text-[10px] text-slate-600 capitalize">{currentMember.role} • Workspace Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
