import React, { useState } from 'react';
import {
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Key,
  Download,
  Play,
  Cpu,
  Search,
  CheckCircle2,
  XCircle,
  PauseCircle,
  X,
} from 'lucide-react';
import { AuditLogEntry, RiskClassification } from '../types';

interface AuditLedgerViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ auditLogs }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'sandbox' | 'rules'>('logs');
  const [selectedRisk, setSelectedRisk] = useState<'all' | RiskClassification>('all');
  const [selectedModule, setSelectedModule] = useState<'all' | AuditLogEntry['module']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Policy Engine Simulator State
  const [simTool, setSimTool] = useState('send_email');
  const [simParams, setSimParams] = useState(
    JSON.stringify({ to: 'julian@vanguard.com', subject: 'Operations SLA Contract', amount: 48000 }, null, 2)
  );
  const [simEvaluating, setSimEvaluating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedRisk !== 'all' && log.risk_level !== selectedRisk) return false;
    if (selectedModule !== 'all' && log.module !== selectedModule) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action_summary.toLowerCase().includes(q) ||
        log.skill.toLowerCase().includes(q) ||
        log.actor.name.toLowerCase().includes(q) ||
        log.idempotency_key.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const riskCounts = {
    safe: auditLogs.filter((l) => l.risk_level === 'safe').length,
    confirmation_required: auditLogs.filter((l) => l.risk_level === 'confirmation_required').length,
    high_risk: auditLogs.filter((l) => l.risk_level === 'high_risk').length,
  };

  const handleRunSimulator = async () => {
    setSimEvaluating(true);
    setSimResult(null);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(simParams);
      } catch (e) {
        parsed = { raw: simParams };
      }

      const res = await fetch('/api/policy/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_name: simTool,
          parameters: parsed,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setSimEvaluating(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStatusPill = (status: string) => {
    if (status === 'executed' || status === 'approved') {
      return (
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-ok-bg text-ok border border-ok/60 font-medium inline-block">
          approved
        </span>
      );
    }
    if (status === 'halted_awaiting_approval' || status === 'pending') {
      return (
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-warn-bg text-amber border border-amber/60 font-medium inline-block">
          pending
        </span>
      );
    }
    if (status === 'rejected' || status === 'denied') {
      return (
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-danger-bg text-danger border border-danger/60 font-medium inline-block">
          denied
        </span>
      );
    }
    return (
      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-ok-bg text-ok border border-ok/60 font-medium inline-block">
        safe
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-800 p-4 rounded-lg border border-ink-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber bg-ink-950 px-2 py-0.5 rounded border border-ink-border">
              audit-ledger // v1.4
            </span>
            <span className="text-xs text-paper/50 font-mono">immutable append-only</span>
          </div>
          <h1 className="text-xl font-semibold text-paper mt-1 font-sans tracking-tight">Audit Ledger & Policy Ledger</h1>
          <p className="text-sm text-paper/70 font-sans">
            Every tool invocation carries an idempotency key, risk evaluation, and human decision trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded border border-ink-border p-1 bg-ink-950 text-xs font-sans">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'logs' ? 'bg-ink-800 text-amber border border-amber/60' : 'text-paper/60 hover:text-paper'
              }`}
            >
              Audit Log ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'sandbox' ? 'bg-ink-800 text-amber border border-amber/60' : 'text-paper/60 hover:text-paper'
              }`}
            >
              <Cpu className="w-3 h-3 text-amber" />
              Policy Sandbox
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'rules' ? 'bg-ink-800 text-amber border border-amber/60' : 'text-paper/60 hover:text-paper'
              }`}
            >
              Rules Matrix
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-ink-950 hover:bg-ink-700 text-amber border border-ink-border rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>export.json</span>
          </button>
        </div>
      </div>

      {activeTab === 'logs' && (
        <>
          {/* Risk Level & Module Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-ink-800 p-3 rounded-lg border border-ink-border">
            <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
              <button
                onClick={() => setSelectedRisk('all')}
                className={`px-2.5 py-1 rounded border font-medium transition-colors ${
                  selectedRisk === 'all'
                    ? 'bg-ink-950 text-amber border-amber'
                    : 'bg-ink-950 text-paper/70 border-ink-border hover:text-paper'
                }`}
              >
                All ({auditLogs.length})
              </button>
              <button
                onClick={() => setSelectedRisk('safe')}
                className={`px-2.5 py-1 rounded border font-medium transition-colors flex items-center gap-1.5 ${
                  selectedRisk === 'safe'
                    ? 'bg-ok-bg text-ok border-ok'
                    : 'bg-ink-950 text-ok border-ink-border hover:border-ok/60'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-ok" />
                Safe ({riskCounts.safe})
              </button>
              <button
                onClick={() => setSelectedRisk('confirmation_required')}
                className={`px-2.5 py-1 rounded border font-medium transition-colors flex items-center gap-1.5 ${
                  selectedRisk === 'confirmation_required'
                    ? 'bg-warn-bg text-amber border-amber'
                    : 'bg-ink-950 text-amber border-ink-border hover:border-amber/60'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-amber" />
                Gated ({riskCounts.confirmation_required})
              </button>
              <button
                onClick={() => setSelectedRisk('high_risk')}
                className={`px-2.5 py-1 rounded border font-medium transition-colors flex items-center gap-1.5 ${
                  selectedRisk === 'high_risk'
                    ? 'bg-danger-bg text-danger border-danger'
                    : 'bg-ink-950 text-danger border-ink-border hover:border-danger/60'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-danger" />
                High Risk ({riskCounts.high_risk})
              </button>
            </div>

            {/* Module dropdown & search */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="border border-ink-border rounded px-2 py-1 text-paper bg-ink-950 focus:outline-none"
              >
                <option value="all">module: all</option>
                <option value="crm">module: crm</option>
                <option value="team">module: team</option>
                <option value="erp">module: erp</option>
                <option value="personal">module: personal</option>
                <option value="system">module: system</option>
              </select>

              <div className="relative">
                <Search className="w-3 h-3 text-amber-dim absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="filter logs..."
                  className="pl-7 pr-2 py-1 text-xs rounded border border-ink-border bg-ink-950 text-paper placeholder:text-amber-dim/40 focus:outline-none focus:border-amber w-36"
                />
              </div>
            </div>
          </div>

          {/* Audit Log Entries List matching Reference Format */}
          <div className="bg-ink-800 rounded-lg border border-ink-border overflow-hidden">
            <div className="p-3 border-b border-ink-border flex items-center justify-between text-xs font-mono text-amber-dim">
              <span>LEDGER STREAM // {filteredLogs.length} ENTRIES</span>
              <span>FORMAT: [TIME] [STATE] [MACHINE EVENT]</span>
            </div>

            <div className="divide-y divide-ink-border">
              {filteredLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                });

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedEntry(log)}
                    className="p-3 hover:bg-ink-950 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Reference line structure: 14:02:11 | safe | searchWeb executed — 4 results */}
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-xs text-paper/60 select-none min-w-[65px]">
                        {timeStr}
                      </span>
                      {renderStatusPill(log.status)}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-amber">
                          {log.skill}
                        </span>
                        <span className="text-ink-border hidden sm:inline">—</span>
                        <span className="font-sans text-xs text-paper leading-snug">
                          {log.action_summary}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-[11px] text-amber-dim">
                      <span className="hidden md:inline text-paper/50 font-sans">
                        {log.actor.name}
                      </span>
                      <span className="truncate max-w-[140px] bg-ink-950 px-1.5 py-0.5 rounded border border-ink-border">
                        {log.idempotency_key}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-ink-800 p-5 rounded-lg border border-ink-border">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-paper flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-amber" />
                Policy Engine Evaluation Sandbox
              </h3>
              <p className="text-xs text-paper/70 mt-1 font-sans">
                Test how the deterministic Policy Engine classifies tools, enforces SHA-256 idempotency keys, and halts on confirmation gates.
              </p>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-medium text-paper/80 mb-1">Target Skill / Tool</label>
                <select
                  value={simTool}
                  onChange={(e) => setSimTool(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-ink-border bg-ink-950 text-paper font-mono text-xs"
                >
                  <option value="send_email">send_email (Communications - Outbound Email)</option>
                  <option value="dispatch_voice_call">dispatch_voice_call (Voice - Outbound Telephony)</option>
                  <option value="send_whatsapp_message">send_whatsapp_message (Communications - Meta WABA)</option>
                  <option value="schedule_meeting">schedule_meeting (Calendar - Invites)</option>
                  <option value="create_erp_invoice">create_erp_invoice (Finance - Legal Liability)</option>
                  <option value="execute_wire_transfer">execute_wire_transfer (Finance - Banking)</option>
                  <option value="read_contact">read_contact (CRM - Query Only / Safe)</option>
                  <option value="web_search">web_search (Research - Read Only / Safe)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-paper/80 mb-1">Invocation Parameters (JSON)</label>
                <textarea
                  rows={5}
                  value={simParams}
                  onChange={(e) => setSimParams(e.target.value)}
                  className="w-full p-2.5 font-mono text-xs rounded border border-ink-border bg-ink-950 text-amber focus:outline-none"
                />
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={simEvaluating}
                className="w-full py-2 bg-amber hover:bg-amber/90 text-ink-950 font-mono font-bold text-xs rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                <span>{simEvaluating ? 'EVALUATING DETERMINISTIC POLICY...' : 'RUN POLICY EVALUATION'}</span>
              </button>
            </div>
          </div>

          {/* Simulator Output Panel */}
          <div className="bg-ink-950 rounded-lg border border-ink-border p-4 text-paper flex flex-col justify-between font-mono">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-ink-border">
                <span className="text-xs text-amber-dim">ENGINE RESPONSE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-bg text-ok border border-ok/50">
                  zero-prompt-leak
                </span>
              </div>

              {simResult ? (
                <div className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <span className="text-amber-dim block text-[10px]">RISK CLASSIFICATION</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs mt-1 ${
                        simResult.risk_level === 'safe'
                          ? 'bg-ok-bg text-ok border border-ok/50'
                          : simResult.risk_level === 'confirmation_required'
                          ? 'bg-warn-bg text-amber border border-amber/50'
                          : 'bg-danger-bg text-danger border border-danger/50'
                      }`}
                    >
                      {simResult.risk_level.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-amber-dim block text-[10px]">GATE ENFORCEMENT</span>
                    <span className="text-amber">{simResult.gate_type}</span>
                  </div>

                  <div>
                    <span className="text-amber-dim block text-[10px]">POLICY RATIONALE</span>
                    <p className="text-paper font-sans text-xs mt-0.5">{simResult.rationale}</p>
                  </div>

                  <div>
                    <span className="text-amber-dim block text-[10px]">IDEMPOTENCY KEY</span>
                    <span className="text-amber text-[11px] select-all break-all">{simResult.idempotency_key}</span>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center text-amber-dim text-xs">
                  Select a skill and run evaluation to see the Policy Engine output.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-ink-border text-[10px] text-paper/50 font-sans">
              Nexus Policy Engine operates independently of LLM reasoning. Model output cannot bypass gate checks.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-ink-800 rounded-lg border border-ink-border p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-paper font-sans">Deterministic Safety Rules Matrix</h3>
            <p className="text-xs text-paper/70 mt-1 font-sans">
              Actions are segregated by risk classification. Confirmation-required actions trigger approval cards with idempotency locks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            {/* Safe */}
            <div className="p-4 rounded-lg border border-ok/40 bg-ink-950 space-y-2.5">
              <div className="flex items-center gap-1.5 text-ok font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-ok" />
                <span>SAFE (Auto-Run)</span>
              </div>
              <p className="text-xs text-paper/70 leading-relaxed">
                Read-only operations, database queries, and web searches. No side-effects or mutations.
              </p>
              <ul className="text-xs text-ok font-mono space-y-1 pt-2 border-t border-ok/40">
                <li>• web_search</li>
                <li>• read_contact / search_leads</li>
                <li>• view_pipeline_deals</li>
                <li>• read_calendar_freebusy</li>
                <li>• audit_log_query</li>
              </ul>
            </div>

            {/* Confirmation Required */}
            <div className="p-4 rounded-lg border border-amber/40 bg-ink-950 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber font-bold text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber" />
                <span>CONFIRMATION REQUIRED</span>
              </div>
              <p className="text-xs text-paper/70 leading-relaxed">
                Outbound communications, client messages, or meeting invitations with external parties.
              </p>
              <ul className="text-xs text-amber font-mono space-y-1 pt-2 border-t border-amber/40">
                <li>• send_email (Gmail API)</li>
                <li>• send_whatsapp_message</li>
                <li>• dispatch_voice_call</li>
                <li>• schedule_calendar_event</li>
                <li>• create_deal / stage_advance</li>
              </ul>
            </div>

            {/* High Risk */}
            <div className="p-4 rounded-lg border border-danger/40 bg-ink-950 space-y-2.5">
              <div className="flex items-center gap-1.5 text-danger font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                <span>HIGH RISK (Explicit Sign-off)</span>
              </div>
              <p className="text-xs text-paper/70 leading-relaxed">
                Financial commitments, balance mutations, destructive record deletion, or tier changes.
              </p>
              <ul className="text-xs text-danger font-mono space-y-1 pt-2 border-t border-danger/40">
                <li>• create_erp_invoice</li>
                <li>• execute_wire_transfer</li>
                <li>• delete_database_schema</li>
                <li>• workspace_upgrade_in_place</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Modal in Amber Terminal styling */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4 font-sans">
          <div className="bg-ink-800 rounded-lg max-w-xl w-full p-5 shadow-2xl border border-ink-border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-ink-border">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber">
                  ENTRY #{selectedEntry.id}
                </span>
                {renderStatusPill(selectedEntry.status)}
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-paper/50 hover:text-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs mt-3">
              <div>
                <span className="text-amber-dim block text-[10px] uppercase font-mono">IDEMPOTENCY KEY</span>
                <span className="font-mono text-amber bg-ink-950 px-2 py-1 rounded border border-ink-border block mt-0.5 select-all">
                  {selectedEntry.idempotency_key}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-amber-dim block text-[10px] uppercase font-sans">ACTOR</span>
                  <span className="text-paper">
                    {selectedEntry.actor.name} ({selectedEntry.actor.type})
                  </span>
                </div>
                <div>
                  <span className="text-amber-dim block text-[10px] uppercase font-sans">SKILL / TOOL</span>
                  <span className="text-amber">{selectedEntry.skill}</span>
                </div>
              </div>

              <div>
                <span className="text-amber-dim block text-[10px] uppercase font-sans">ACTION SUMMARY</span>
                <p className="text-paper font-sans text-xs mt-0.5">{selectedEntry.action_summary}</p>
              </div>

              <div>
                <span className="text-amber-dim block text-[10px] uppercase font-mono">IMMUTABLE PAYLOAD DUMP</span>
                <pre className="p-2.5 bg-ink-950 text-paper rounded font-mono text-[11px] border border-ink-border overflow-x-auto mt-1">
                  {JSON.stringify(selectedEntry.payload || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
