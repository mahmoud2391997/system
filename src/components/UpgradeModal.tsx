import React from 'react';
import { X, Layers, Check, Sparkles, ShieldCheck, ArrowRight, Server } from 'lucide-react';
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
    isolation: string;
  }[] = [
    {
      id: 'personal',
      name: 'Personal',
      seats: '1 User (Solo)',
      description: 'Personal assistant that clears your inbox, books meetings, and handles follow-ups.',
      modules: ['Assistant Terminal', 'Gmail & Outlook Sync', 'Calendar Scheduling', 'Safe Web Search'],
      monthlyCaps: { emails: 100, messages: 0, calls: 0 },
      isolation: 'Shared DB, workspace-scoped',
    },
    {
      id: 'startup',
      name: 'Startup',
      seats: '2–10 Users',
      description: 'The moment customers arrive: leads, deals pipeline, and automatic timeline logging.',
      modules: ['Assistant Terminal', 'Full CRM & Deals Pipeline', 'Meta WhatsApp Business', 'Automated Timeline'],
      monthlyCaps: { emails: 500, messages: 1000, calls: 50 },
      isolation: 'Shared DB, workspace-scoped',
    },
    {
      id: 'team',
      name: 'Team',
      seats: '10–50 Users',
      description: 'Multi-user workspace with real permissions, boards, task delegation, and time tracking.',
      modules: ['All Startup Features', 'Projects & Sprint Boards', 'Role Matrix (Admin/Mgr)', 'Time Tracking'],
      monthlyCaps: { emails: 2500, messages: 5000, calls: 300 },
      isolation: 'Shared DB, workspace-scoped',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      seats: '50+ Users (Custom)',
      description: 'Full operational ERP coverage, compliance isolation, invoicing, and dedicated SLAs.',
      modules: ['All Team Features', 'Full ERP & Invoicing', 'Inventory & Procurement', 'Dedicated Tenant Schema'],
      monthlyCaps: { emails: 20000, messages: 50000, calls: 2500 },
      isolation: 'Dedicated schema / instance',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Architectural Principle: Upgrade-In-Place
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Workspace Tier Switchboard</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Section 6 of the specification: <em>"An upgrade is a database row update, not a migration."</em>
              The workspace retains all conversation history, tasks, contacts, and audit logs while instantly
              toggling module flags and expanding monthly automation caps.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Database Row View */}
        <div className="my-4 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-[10px] uppercase text-indigo-400 font-bold mb-1">
            Active Database Row: workspace_features (workspace_id: {features.workspace_id})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>tier: <strong className="text-emerald-400 font-mono">"{features.tier}"</strong></div>
            <div>crm_enabled: <strong className={features.crm_enabled ? 'text-emerald-400' : 'text-slate-400'}>{String(features.crm_enabled)}</strong></div>
            <div>team_enabled: <strong className={features.team_enabled ? 'text-emerald-400' : 'text-slate-400'}>{String(features.team_enabled)}</strong></div>
            <div>erp_enabled: <strong className={features.erp_enabled ? 'text-emerald-400' : 'text-slate-400'}>{String(features.erp_enabled)}</strong></div>
          </div>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {tiers.map((t) => {
            const isCurrent = features.tier === t.id;

            return (
              <div
                key={t.id}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-2">{t.seats}</div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{t.description}</p>

                  <div className="border-t border-slate-100 pt-2.5 space-y-1.5 text-xs text-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Modules
                    </div>
                    {t.modules.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-mono text-slate-600 mb-2">
                    Caps: {t.monthlyCaps.emails} emails • {t.monthlyCaps.messages} msgs
                  </div>
                  <button
                    onClick={() => onSelectTier(t.id)}
                    disabled={isCurrent || isUpdating}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Switch to ${t.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Nexus AI Operations Platform • One Codebase, Four Tiers • Gated at Runtime
        </div>
      </div>
    </div>
  );
};
