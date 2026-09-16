import React from 'react';
import { Shield, ChevronDown, Lock, Layers, LogOut, Terminal } from 'lucide-react';
import { Workspace, WorkspaceFeatures, WorkspaceMember } from '../types';

interface HeaderProps {
  workspace: Workspace;
  features: WorkspaceFeatures;
  members: WorkspaceMember[];
  currentUser?: { id: string; name: string; email: string; avatar?: string } | null;
  onOpenUpgradeModal: () => void;
  onLogout?: () => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  workspace,
  features,
  members,
  currentUser,
  onOpenUpgradeModal,
  onLogout,
  pendingApprovalsCount,
}) => {
  const currentMember = members.find((m) => m.role === 'owner' || m.role === 'admin') || members[0] || {
    name: currentUser?.name || 'Alex Mercer',
    role: 'owner',
    avatar: 'AM',
    email: currentUser?.email || 'operator@nexus-suite.org',
  };

  return (
    <header className="bg-[#1D1814] border-b border-[#3A2F22] sticky top-0 z-30 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Machine & Terminal Identity */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-[#15120F] border border-[#3A2F22] flex items-center justify-center text-[#FFB000]">
              <span className="font-mono text-sm font-bold tracking-tighter">❯_</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#F3E9D2] tracking-tight text-sm">nexus@core</span>
                <span className="text-[10px] text-[#B8850A] font-mono uppercase bg-[#15120F] px-1.5 py-0.5 rounded border border-[#3A2F22]">
                  v1.4-crt
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#F3E9D2]/70 font-sans">
                <span className="font-medium text-[#F3E9D2]">{workspace.name}</span>
                <span className="text-[#3A2F22]">•</span>
                <span className="font-mono text-[11px] text-[#B8850A]">{workspace.slug}</span>
              </div>
            </div>
          </div>

          {/* Center Info: Architecture & Security Badges */}
          <div className="hidden md:flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#15120F] text-[#F3E9D2]/80 border border-[#3A2F22] font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5 text-[#5FB88A]" />
              <span>policy: <strong className="text-[#5FB88A] font-sans">enforced</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#15120F] text-[#F3E9D2]/80 border border-[#3A2F22] font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5 text-[#B8850A]" />
              <span>vault: <strong className="text-[#FFB000] font-sans">aes-256</strong></span>
            </div>
            {pendingApprovalsCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#4A3B20] text-[#E2A23C] border border-[#E2A23C]/60 font-sans text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#E2A23C]"></span>
                <span>{pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Approval</span>
              </div>
            )}
          </div>

          {/* Right Action: Tier Badge, User Profile & Sign Out */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#15120F] text-[#FFB000] border border-[#3A2F22] hover:border-[#B8850A] transition-colors text-xs font-sans"
              title="Change workspace tier"
              id="tier-upgrade-btn"
            >
              <Layers className="w-3.5 h-3.5 text-[#B8850A]" />
              <span className="uppercase tracking-wider font-mono text-[11px] font-semibold">{features.tier}</span>
              <ChevronDown className="w-3 h-3 text-[#B8850A]" />
            </button>

            {/* Operator Identity */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#3A2F22]">
              <div className="h-7 w-7 rounded bg-[#15120F] border border-[#3A2F22] text-[#FFB000] flex items-center justify-center font-mono font-bold text-xs">
                {currentMember.avatar || currentUser?.name?.slice(0, 2).toUpperCase() || 'AM'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-[#F3E9D2] leading-tight font-sans">
                  {currentUser?.name || currentMember.name}
                </p>
                <p className="text-[10px] text-[#B8850A] font-mono truncate max-w-[130px]">
                  {currentUser?.email || currentMember.email}
                </p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Disconnect session"
                  className="p-1.5 text-[#F3E9D2]/50 hover:text-[#E2574C] hover:bg-[#15120F] rounded border border-transparent hover:border-[#4A2622] transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
