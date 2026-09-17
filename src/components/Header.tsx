import React from 'react';
import { Shield, Lock, Menu, X } from 'lucide-react';
import { Workspace, WorkspaceFeatures, WorkspaceMember } from '../types';

interface HeaderProps {
  workspace: Workspace;
  features: WorkspaceFeatures;
  members: WorkspaceMember[];
  currentUser?: { id: string; name: string; email: string; avatar?: string } | null;
  onOpenUpgradeModal: () => void;
  onLogout?: () => void;
  pendingApprovalsCount: number;
  onToggleNav?: () => void;
  isNavOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  workspace,
  pendingApprovalsCount,
  onToggleNav,
  isNavOpen,
}) => {
  return (
    <header className="bg-paper-raised/90 border-b border-rule sticky top-0 z-30 font-sans backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onToggleNav && (
              <button
                type="button"
                onClick={onToggleNav}
                className="lg:hidden p-2 -ml-1 text-ink-text border border-rule bg-paper hover:border-amber-dim transition-colors"
                aria-label={isNavOpen ? 'Close navigation' : 'Open navigation'}
              >
                {isNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-text tracking-tight truncate">
                {workspace.name}
              </p>
              <p className="font-mono text-[11px] text-ink-muted truncate">{workspace.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-rule bg-paper text-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-ok" />
              <Shield className="w-3 h-3 text-ok" />
              <span>policy <span className="text-ok">enforced</span></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 border border-rule bg-paper text-ink-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/50" />
              <Lock className="w-3 h-3" />
              <span>vault <span className="text-ink-text">aes-256</span></span>
            </div>
            {pendingApprovalsCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warn-bg text-amber-dim border border-amber/40 font-sans text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber signal-lamp" />
                <span>{pendingApprovalsCount} pending</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
