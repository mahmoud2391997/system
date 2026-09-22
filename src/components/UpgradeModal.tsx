import React from 'react';
import { X, Check } from 'lucide-react';
import { WorkspaceTier, WorkspaceFeatures } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: WorkspaceFeatures;
  onSelectTier: (tier: WorkspaceTier) => Promise<void>;
  isUpdating: boolean;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  features,
  onSelectTier,
  isUpdating,
}) => {
  if (!isOpen) return null;

  const tiers: {
    id: WorkspaceTier;
    name: string;
    seats: string;
    description: string;
    modules: string[];
    monthlyCaps: { emails: number; messages: number; calls: number };
  }[] = [
    {
      id: 'startup',
      name: 'Startup',
      seats: '2–10 Users',
      description: 'Sales CRM with leads, customers, appointments, call logs, SMS, WhatsApp, and reports.',
      modules: ['AI Prompt', 'Leads & Customers', 'Appointments, Calls, SMS, WhatsApp', 'Reports'],
      monthlyCaps: { emails: 500, messages: 1000, calls: 50 },
    },
    {
      id: 'team',
      name: 'Team',
      seats: '10–50 Users',
      description: 'Team dashboard with departments, employees, and a task board.',
      modules: ['All Startup Features', 'Departments & Employees', 'Task Kanban', 'Completion Tracking'],
      monthlyCaps: { emails: 2500, messages: 5000, calls: 300 },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      seats: '50+ Users (Custom)',
      description: 'Full operational ERP coverage, dedicated schema isolation, and custom SLAs.',
      modules: ['All Team Features', 'Full ERP & Invoicing', 'Inventory & Procurement', 'Dedicated Tenant Schema'],
      monthlyCaps: { emails: 20000, messages: 50000, calls: 2500 },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-ink-800 max-w-4xl w-full p-6 border border-ink-border my-8">
        <div className="flex items-start justify-between pb-4 border-b border-ink-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-ink-950 text-amber border border-ink-border">
                UPGRADE-IN-PLACE // SECTION 6
              </span>
            </div>
            <h2 className="text-xl font-semibold text-paper mt-2 font-sans tracking-tight">Workspace Tier Switchboard</h2>
            <p className="text-sm text-paper/70 mt-1 max-w-2xl font-sans">
              Upgrading is a database row update, not a migration. The workspace retains all conversation history, tasks, and audit logs.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-paper/50 hover:text-paper hover:bg-ink-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3 bg-ink-950 text-paper border border-ink-border font-mono text-[13px] overflow-x-auto">
          <div className="text-[10px] uppercase text-amber-dim font-bold mb-1">
            DB_ROW: workspace_features (workspace_id: {features.workspace_id})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>tier: <strong className="text-amber">"{features.tier}"</strong></div>
            <div>crm: <strong className={features.crm_enabled ? 'text-ok' : 'text-paper/40'}>{String(features.crm_enabled)}</strong></div>
            <div>team: <strong className={features.team_enabled ? 'text-ok' : 'text-paper/40'}>{String(features.team_enabled)}</strong></div>
            <div>erp: <strong className={features.erp_enabled ? 'text-ok' : 'text-paper/40'}>{String(features.erp_enabled)}</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {tiers.map((t) => {
            const isCurrent = features.tier === t.id;

            return (
              <div
                key={t.id}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-amber bg-ink-950'
                    : 'border-ink-border bg-ink-950/60 hover:border-amber/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-paper text-sm font-sans tracking-tight">{t.name}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-amber text-ink-950 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-amber-dim mb-2">{t.seats}</div>
                  <p className="text-sm text-amber-dim leading-relaxed mb-3 font-sans">{t.description}</p>

                  <div className="border-t border-ink-border pt-2 space-y-1 text-xs text-paper font-sans">
                    <div className="text-[10px] font-mono font-bold text-amber-dim uppercase tracking-wider">
                      Included Modules
                    </div>
                    {t.modules.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px]">
                        <Check className="w-3 h-3 text-amber-dim shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-ink-border">
                  <div className="text-[10px] font-mono text-amber-dim mb-2">
                    caps: {t.monthlyCaps.emails} mail • {t.monthlyCaps.messages} msgs
                  </div>
                  <button
                    onClick={() => onSelectTier(t.id)}
                    disabled={isCurrent || isUpdating}
                    className={`w-full py-2 px-2.5 rounded-lg text-[13px] font-mono font-bold flex items-center justify-center gap-1 transition-opacity ${
                      isCurrent
                        ? 'bg-ink-800 text-amber-dim border border-ink-border cursor-default'
                        : 'bg-amber hover:opacity-90 text-ink-950'
                    }`}
                  >
                    {isCurrent ? 'ACTIVE PLAN' : `SWITCH TO ${t.name.toUpperCase()}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-3 border-t border-ink-border font-mono text-[11px] text-amber-dim">
          nexus // one codebase, three tiers — gated at runtime
        </div>
      </div>
    </div>
  );
};
