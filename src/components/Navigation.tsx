import React from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import { Workspace, WorkspaceFeatures, WorkspaceMember, WorkspaceTier } from '../types';

export type ActiveTab = 'terminal' | 'crm' | 'team' | 'erp' | 'audit' | 'integrations';

const PLAN_HOME: Record<WorkspaceTier, ActiveTab> = {
  personal: 'terminal',
  startup: 'crm',
  team: 'team',
  enterprise: 'erp',
};

const PLANS: { id: WorkspaceTier; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'startup', label: 'Startup' },
  { id: 'team', label: 'Team' },
  { id: 'enterprise', label: 'Enterprise' },
];

interface NavigationProps {
  workspace: Workspace;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  features: WorkspaceFeatures;
  currentUser?: { id: string; name: string; email: string; avatar?: string } | null;
  members?: WorkspaceMember[];
  onSelectTier?: (tier: WorkspaceTier) => Promise<void>;
  isUpdatingTier?: boolean;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  features,
  onSelectTier,
  isUpdatingTier,
  onLogout,
}) => {
  const selectPlan = (plan: WorkspaceTier) => {
    if (features.tier === plan) {
      onSelectTab(PLAN_HOME[plan]);
      return;
    }
    void onSelectTier?.(plan);
  };

  const planPills = (
    <>
      {PLANS.map((plan) => {
        const isActive = features.tier === plan.id;
        return (
          <button
            key={plan.id}
            id={`plan-${plan.id}`}
            type="button"
            disabled={isUpdatingTier}
            onClick={() => selectPlan(plan.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {plan.label}
          </button>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card/95 backdrop-blur">
      <div className="relative flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-sm font-semibold tracking-[0.2em]">NEXUS</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              AI prompt / v0.2 · live
            </div>
          </div>
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-muted/60 p-1 md:flex">
          {planPills}
        </nav>

        <div className="flex items-center gap-2">
          <button
            id="nav-audit"
            type="button"
            onClick={() => onSelectTab('audit')}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              activeTab === 'audit'
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Audit
          </button>
          <button
            id="nav-integrations"
            type="button"
            onClick={() => onSelectTab('integrations')}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              activeTab === 'integrations'
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Vault
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-center px-3 pb-3 md:hidden">
        <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-muted/60 p-1">
          {planPills}
        </nav>
      </div>
    </header>
  );
};
