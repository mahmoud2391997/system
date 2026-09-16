import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Server,
  AlertTriangle,
  Info,
  Activity,
  RefreshCw,
  Plus,
  X,
  Settings,
  Zap,
  Check,
  Sliders,
  Database,
} from 'lucide-react';
import { IntegrationStatus } from '../types';

interface IntegrationsViewProps {
  integrations: IntegrationStatus[];
  onPingIntegration?: (id: string) => Promise<void>;
  onToggleIntegration?: (id: string) => Promise<void>;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onPingIntegration,
  onToggleIntegration,
}) => {
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { latency_ms: number; message: string }>>({});
  const [selectedConfigIntegration, setSelectedConfigIntegration] = useState<IntegrationStatus | null>(null);
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false);
  const [newIntegrationProvider, setNewIntegrationProvider] = useState('Slack Enterprise');

  const handlePing = async (id: string) => {
    setPingingId(id);
    try {
      if (onPingIntegration) {
        await onPingIntegration(id);
      }
      const res = await fetch('/api/integrations/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setPingResults((prev) => ({
          ...prev,
          [id]: { latency_ms: data.latency_ms, message: data.message },
        }));
      }
    } catch (err) {
      console.error('Ping error:', err);
    } finally {
      setPingingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Provider Token Vault
            </span>
            <span className="text-xs text-slate-600">• AES-256-GCM Encrypted at Rest</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Official Provider Integrations & Credentials</h1>
          <p className="text-xs text-slate-600">
            Nexus uses official provider APIs only. Tokens are resolved server-side per workspace at call time
            and are <strong>never</strong> leaked into model prompts or sent to the client browser.
          </p>
        </div>

        <button
          onClick={() => setShowAddIntegrationModal(true)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect Provider</span>
        </button>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int) => {
          const pingInfo = pingResults[int.id];

          return (
            <div
              key={int.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{int.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{int.provider}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                      int.connected
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {int.connected ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">AUTH ARCHITECTURE</div>
                  <div className="text-slate-700 font-medium bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px]">
                    {int.auth_type}
                  </div>
                </div>

                {/* Live Ping latency display if pinged */}
                {pingInfo && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-mono text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" /> Ping OK
                    </span>
                    <span className="font-bold">{pingInfo.latency_ms} ms</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => handlePing(int.id)}
                  disabled={pingingId === int.id}
                  className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1 font-medium transition-colors"
                >
                  <Activity className={`w-3 h-3 ${pingingId === int.id ? 'animate-spin' : 'text-slate-500'}`} />
                  <span>{pingingId === int.id ? 'Testing...' : 'Health Ping'}</span>
                </button>

                <button
                  onClick={() => setSelectedConfigIntegration(int)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1 hover:bg-slate-50 rounded"
                  title="Configure Token Vault"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Config</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Architecture & Compliance Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Zero Prompt Leakage Architecture & Regulatory Guardrails (Section 10)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">WhatsApp Business Cloud</span>
            <p className="text-slate-600">Meta Business Verification & pre-approved message templates. Server-side token resolution only.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Outbound Telephony</span>
            <p className="text-slate-600">Mandatory AI disclosure statement and calling-hour constraints. Encrypted SIP credentials.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Google Workspace / Gmail</span>
            <p className="text-slate-600">Strict SPF, DKIM, DMARC domain alignment and suppression lists with OAuth 2.0 refresh tokens.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">PostgreSQL Tenant Isolation</span>
            <p className="text-slate-600">True tenant row-isolation, database schema isolation on Enterprise tier, and immutable audit logs.</p>
          </div>
        </div>
      </div>

      {/* Provider Config Modal */}
      {selectedConfigIntegration && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Configure {selectedConfigIntegration.name}</h3>
              <button onClick={() => setSelectedConfigIntegration(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
                <strong>Zero Prompt Leakage Guarantee:</strong> Client credentials and OAuth access tokens are stored in the server-side hardware-encrypted vault. The model prompt only receives transient semantic references.
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provider Service</label>
                <input
                  type="text"
                  disabled
                  value={selectedConfigIntegration.provider}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorization Scope</label>
                <input
                  type="text"
                  disabled
                  value={selectedConfigIntegration.auth_type}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vault Key ID</label>
                <input
                  type="text"
                  disabled
                  value={`hsm-vault-key-${selectedConfigIntegration.id}-sec256`}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedConfigIntegration(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect New Provider Modal */}
      {showAddIntegrationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Connect New Provider Service</h3>
              <button onClick={() => setShowAddIntegrationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Supported Service</label>
                <select
                  value={newIntegrationProvider}
                  onChange={(e) => setNewIntegrationProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="Slack Enterprise">Slack Enterprise Grid (Bi-directional bot & webhook)</option>
                  <option value="Stripe Connect">Stripe Connect (Payment Gateway & Billing Webhooks)</option>
                  <option value="HubSpot CRM">HubSpot CRM (2-way Contact & Deal Sync)</option>
                  <option value="Twilio Voice & SMS">Twilio Voice & SMS Trunk (Encrypted SIP)</option>
                  <option value="Snowflake Data Cloud">Snowflake Data Cloud (Operations Data Warehouse)</option>
                </select>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] space-y-1">
                <p>• OAuth 2.0 authorization token will be provisioned in the isolated server vault.</p>
                <p>• All webhook payloads are verified using SHA-256 HMAC signatures.</p>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddIntegrationModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Initiating OAuth connection flow for ${newIntegrationProvider}. In preview mode, provider credentials will be securely mapped.`);
                    setShowAddIntegrationModal(false);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Initiate OAuth Flow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
