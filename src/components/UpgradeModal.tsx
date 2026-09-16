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
      id: 'personal',
      name: 'Personal',
      seats: '1 User (Solo)',
      description: 'Personal assistant that clears your inbox, books meetings, and handles follow-ups.',
      modules: ['Assistant Terminal', 'Gmail & Calendar Sync', 'Policy Safety Engine', 'Web Grounding'],
      monthlyCaps: { emails: 100, messages: 0, calls: 0 },
    },
    {
      id: 'startup',
      name: 'Startup',
      seats: '2–10 Users',
      description: 'The moment customers arrive: leads, deals pipeline, and automatic timeline logging.',
      modules: ['Assistant Terminal', 'Full CRM & Deals Pipeline', 'Meta WhatsApp Business', 'Automated Timeline'],
      monthlyCaps: { emails: 500, messages: 1000, calls: 50 },
    },
    {
      id: 'team',
      name: 'Team',
      seats: '10–50 Users',
      description: 'Multi-user workspace with real permissions, sprint boards, and task delegation.',
      modules: ['All Startup Features', 'Projects & Sprint Boards', 'Role Matrix (Admin/Mgr)', 'Time Tracking'],
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
    <div className="fixed inset-0 z-50 bg-[#15120F]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#1D1814] rounded-lg max-w-4xl w-full p-6 shadow-2xl border border-[#3A2F22] my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#3A2F22]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#15120F] text-[#FFB000] border border-[#3A2F22]">
                UPGRADE-IN-PLACE // SECTION 6
              </span>
            </div>
            <h2 className="text-base font-bold text-[#F3E9D2] mt-1 font-sans">Workspace Tier Switchboard</h2>
            <p className="text-xs text-[#F3E9D2]/70 mt-1 max-w-2xl font-sans">
              Upgrading is a database row update, not a migration. The workspace retains all conversation history, tasks, and audit logs.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#F3E9D2]/40 hover:text-[#F3E9D2] hover:bg-[#15120F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Row View */}
        <div className="my-3 p-2.5 bg-[#15120F] text-[#F3E9D2] rounded border border-[#3A2F22] font-mono text-xs overflow-x-auto">
          <div className="text-[10px] uppercase text-[#B8850A] font-bold mb-1">
            DB_ROW: workspace_features (workspace_id: {features.workspace_id})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>tier: <strong className="text-[#FFB000]">"{features.tier}"</strong></div>
            <div>crm: <strong className={features.crm_enabled ? 'text-[#5FB88A]' : 'text-[#F3E9D2]/40'}>{String(features.crm_enabled)}</strong></div>
            <div>team: <strong className={features.team_enabled ? 'text-[#5FB88A]' : 'text-[#F3E9D2]/40'}>{String(features.team_enabled)}</strong></div>
            <div>erp: <strong className={features.erp_enabled ? 'text-[#5FB88A]' : 'text-[#F3E9D2]/40'}>{String(features.erp_enabled)}</strong></div>
          </div>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          {tiers.map((t) => {
            const isCurrent = features.tier === t.id;

            return (
              <div
                key={t.id}
                className={`rounded-lg border p-3.5 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#FFB000] bg-[#15120F]'
                    : 'border-[#3A2F22] bg-[#15120F]/60 hover:border-[#3A2F22]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#F3E9D2] text-xs font-sans">{t.name}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#2E4A3B] text-[#5FB88A] border border-[#5FB88A]/60 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#B8850A] mb-2">{t.seats}</div>
                  <p className="text-xs text-[#F3E9D2]/70 leading-relaxed mb-3 font-sans">{t.description}</p>

                  <div className="border-t border-[#3A2F22] pt-2 space-y-1 text-xs text-[#F3E9D2]/90 font-sans">
                    <div className="text-[10px] font-mono font-bold text-[#B8850A] uppercase tracking-wider">
                      Included Modules
                    </div>
                    {t.modules.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px]">
                        <Check className="w-3 h-3 text-[#5FB88A] shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#3A2F22]">
                  <div className="text-[10px] font-mono text-[#B8850A] mb-2">
                    caps: {t.monthlyCaps.emails} mail • {t.monthlyCaps.messages} msgs
                  </div>
                  <button
                    onClick={() => onSelectTier(t.id)}
                    disabled={isCurrent || isUpdating}
                    className={`w-full py-1.5 px-2.5 rounded text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors ${
                      isCurrent
                        ? 'bg-[#1D1814] text-[#F3E9D2]/30 border border-[#3A2F22] cursor-default'
                        : 'bg-[#FFB000] hover:bg-[#FFB000]/90 text-[#15120F]'
                    }`}
                  >
                    {isCurrent ? 'ACTIVE PLAN' : `SWITCH TO ${t.name.toUpperCase()}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-[#F3E9D2]/40 pt-2 border-t border-[#3A2F22] font-mono text-[11px]">
          nexus // one codebase, four tiers — gated at runtime
        </div>
      </div>
    </div>
  );
};
