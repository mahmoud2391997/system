import React, { useState } from 'react';
import {
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Key,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  PauseCircle,
  FileCode,
  Search,
  Download,
  Terminal,
  Play,
  Check,
  Info,
  Sliders,
  Cpu,
  Lock,
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
    JSON.stringify({ to: 'julian@vanguardlog.com', subject: 'Operations SLA Contract', amount: 48000 }, null, 2)
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
    a.download = `nexus_immutable_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Security & Compliance Layer
            </span>
            <span className="text-xs text-slate-600">• Immutable Append-Only Ledger</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Audit Ledger & Policy Engine Records</h1>
          <p className="text-xs text-slate-600">
            Every autonomous external action carries an idempotency key, risk evaluation, and human decision trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'sandbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Policy Sandbox
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rules Matrix
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {activeTab === 'logs' && (
        <>
          {/* Risk Level & Module Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedRisk('all')}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  selectedRisk === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({auditLogs.length})
              </button>
              <button
                onClick={() => setSelectedRisk('safe')}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  selectedRisk === 'safe'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Safe ({riskCounts.safe})
              </button>
              <button
                onClick={() => setSelectedRisk('confirmation_required')}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  selectedRisk === 'confirmation_required'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Gated ({riskCounts.confirmation_required})
              </button>
              <button
                onClick={() => setSelectedRisk('high_risk')}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  selectedRisk === 'high_risk'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-red-800 border-red-200 hover:bg-red-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                High Risk ({riskCounts.high_risk})
              </button>
            </div>

            {/* Module dropdown & search */}
            <div className="flex items-center gap-2">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white"
              >
                <option value="all">All Modules</option>
                <option value="crm">CRM</option>
                <option value="team">Team</option>
                <option value="erp">ERP</option>
                <option value="personal">Personal</option>
                <option value="system">System</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs..."
                  className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Skill / Tool</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Action Summary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Idempotency Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedEntry(log)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            log.actor.type === 'ai_agent' ? 'text-indigo-600' : 'text-slate-900'
                          }`}
                        >
                          {log.actor.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{log.skill}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.risk_level === 'safe' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> SAFE
                          </span>
                        )}
                        {log.risk_level === 'confirmation_required' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                            <ShieldAlert className="w-3 h-3" /> CONFIRMATION
                          </span>
                        )}
                        {log.risk_level === 'high_risk' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> HIGH RISK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-900 max-w-xs truncate">{log.action_summary}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === 'executed' && (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Executed
                          </span>
                        )}
                        {log.status === 'halted_awaiting_approval' && (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <PauseCircle className="w-3.5 h-3.5" /> Awaiting Approval
                          </span>
                        )}
                        {log.status === 'rejected' && (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-[140px] truncate">
                        {log.idempotency_key}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'sandbox' && (
        /* Interactive Policy Engine Sandbox Simulator */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Policy Engine Evaluation Sandbox
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Test how the Independent Policy Engine (Section 7) classifies tools, enforces idempotency keys, and triggers human approval gates before actual dispatch.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Skill / Tool</label>
                <select
                  value={simTool}
                  onChange={(e) => setSimTool(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                >
                  <option value="send_email">send_email (Communications - Outbound Email)</option>
                  <option value="dispatch_voice_call">dispatch_voice_call (Voice - Outbound Telephony)</option>
                  <option value="send_whatsapp_message">send_whatsapp_message (Communications - Meta WABA)</option>
                  <option value="schedule_meeting">schedule_meeting (Calendar - Invites)</option>
                  <option value="create_erp_invoice">create_erp_invoice (Finance - Legal Liability)</option>
                  <option value="execute_wire_transfer">execute_wire_transfer (Finance - Banking)</option>
                  <option value="delete_database_schema">delete_database_schema (System - Destructive)</option>
                  <option value="read_contact">read_contact (CRM - Query Only)</option>
                  <option value="web_search">web_search (Research - Read Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tool Invocation Parameters (JSON)</label>
                <textarea
                  rows={6}
                  value={simParams}
                  onChange={(e) => setSimParams(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 bg-slate-50"
                />
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={simEvaluating}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{simEvaluating ? 'Evaluating Deterministic Policy...' : 'Evaluate Against Policy Engine'}</span>
              </button>
            </div>
          </div>

          {/* Simulator Output Panel */}
          <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">ENGINE RESPONSE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  Zero Prompt Leakage Mode
                </span>
              </div>

              {simResult ? (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">RISK CLASSIFICATION</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold text-xs mt-1 ${
                        simResult.risk_level === 'safe'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : simResult.risk_level === 'confirmation_required'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {simResult.risk_level.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">ENFORCED GATE TYPE</span>
                    <span className="text-indigo-300 font-bold">{simResult.gate_type}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">POLICY RATIONALE</span>
                    <p className="text-slate-300 font-sans text-xs mt-0.5 leading-relaxed">{simResult.rationale}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">MINTED IDEMPOTENCY KEY</span>
                    <span className="text-amber-400 text-[11px] select-all">{simResult.idempotency_key}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">ENGINE SPECIFICATION</span>
                    <span className="text-slate-500 text-[10px]">{simResult.policy_engine_version}</span>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">
                  Select a skill and click Evaluate to see the Policy Engine's deterministic evaluation in real time.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
              Nexus Policy Engine runs independently from the LLM prompt layer. Safe actions execute autonomously; confirmations require verified human signature.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        /* Deterministic Security Rules Matrix */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Safety Rules Matrix (Section 7)</h3>
            <p className="text-xs text-slate-600 mt-1">
              Actions are segregated by risk level. Confirmation Required actions trigger an interactive approval card with idempotency protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Safe */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                SAFE (Autonomous Execution)
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Read-only operations, internal database lookups, and web grounding. Executed without interrupting the user.
              </p>
              <ul className="text-xs text-emerald-950 font-mono space-y-1 pt-2 border-t border-emerald-200">
                <li>• web_search</li>
                <li>• read_contact / search_leads</li>
                <li>• view_pipeline_deals</li>
                <li>• read_calendar_freebusy</li>
                <li>• audit_log_query</li>
              </ul>
            </div>

            {/* Confirmation Required */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                CONFIRMATION REQUIRED
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Actions with external impact: outbound communications, calendar invites, or client notifications.
              </p>
              <ul className="text-xs text-amber-950 font-mono space-y-1 pt-2 border-t border-amber-200">
                <li>• send_email (Gmail API)</li>
                <li>• send_whatsapp_message</li>
                <li>• dispatch_voice_call</li>
                <li>• schedule_calendar_event</li>
                <li>• create_deal / stage_advance</li>
              </ul>
            </div>

            {/* High Risk */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                HIGH RISK (Multi-Factor / Admin)
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Financial obligations, balance sheet mutations, destructive operations, or workspace tier upgrades.
              </p>
              <ul className="text-xs text-red-950 font-mono space-y-1 pt-2 border-t border-red-200">
                <li>• create_erp_invoice</li>
                <li>• execute_wire_transfer</li>
                <li>• delete_database_schema</li>
                <li>• workspace_upgrade_in_place</li>
                <li>• revoke_all_member_tokens</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Drawer / Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Audit Ledger Entry #{selectedEntry.id}</h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600 text-xs">
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs mt-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">IDEMPOTENCY KEY</span>
                <span className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded block mt-0.5 select-all">
                  {selectedEntry.idempotency_key}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">ACTOR</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEntry.actor.name} ({selectedEntry.actor.type})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">SKILL / TOOL</span>
                  <span className="font-mono text-slate-800">{selectedEntry.skill}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase">ACTION SUMMARY</span>
                <p className="text-slate-900 font-medium mt-0.5">{selectedEntry.action_summary}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase">IMMUTABLE PAYLOAD DUMP</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto mt-1">
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
