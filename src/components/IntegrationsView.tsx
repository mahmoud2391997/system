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
  Mail,
  Calendar,
  Phone,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { IntegrationStatus } from '../types';

interface IntegrationsViewProps {
  integrations: IntegrationStatus[];
  onRefresh?: () => void;
  onPingIntegration?: (id: string) => Promise<void>;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onRefresh,
  onPingIntegration,
}) => {
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { success: boolean; latency_ms?: number; message: string }>>({});
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google OAuth Form
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [accessToken, setAccessToken] = useState('');

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
      setPingResults((prev) => ({
        ...prev,
        [id]: {
          success: data.success,
          latency_ms: data.latency_ms,
          message: data.message || data.error || (data.success ? 'Verified' : 'Failed'),
        },
      }));
    } catch (err: any) {
      setPingResults((prev) => ({
        ...prev,
        [id]: { success: false, message: err.message || 'Network error' },
      }));
    } finally {
      setPingingId(null);
    }
  };

  const handleConnectGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refreshToken && !accessToken) {
      setErrorMsg('Please provide either an OAuth refresh token or an access token.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/integrations/google/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          access_token: accessToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect Google credentials');
      }
      setShowGoogleModal(false);
      setRefreshToken('');
      setAccessToken('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect Google Workspace? The agent will no longer be able to send emails or manage calendar events.')) {
      return;
    }
    try {
      await fetch('/api/integrations/google/disconnect', { method: 'POST' });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to disconnect Google:', err);
    }
  };

  const isGoogleConnected = integrations.some((i) => (i.id === 'int_gmail' || i.id === 'int_calendar') && i.connected);

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
          <p className="text-xs text-slate-600 max-w-2xl">
            Nexus executes against official provider APIs only. Tokens are resolved server-side per workspace at execution time
            and are <strong>never</strong> leaked into model prompts or sent to the client browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGoogleConnected ? (
            <button
              onClick={handleDisconnectGoogle}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Google
            </button>
          ) : (
            <button
              onClick={() => setShowGoogleModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Google Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int) => {
          const pingInfo = pingResults[int.id];
          const isPhase12 = int.id === 'int_gmail' || int.id === 'int_calendar';

          return (
            <div
              key={int.id}
              className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-colors ${
                isPhase12 ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200 opacity-90'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${
                      int.type === 'email' ? 'bg-red-50 border-red-200 text-red-600' :
                      int.type === 'calendar' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                      int.type === 'messaging' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {int.type === 'email' ? <Mail className="w-4 h-4" /> :
                       int.type === 'calendar' ? <Calendar className="w-4 h-4" /> :
                       int.type === 'messaging' ? <MessageSquare className="w-4 h-4" /> :
                       <Phone className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{int.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{int.provider}</p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                      int.connected
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : isPhase12
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {int.connected ? 'Active' : isPhase12 ? 'Needs Credentials' : 'Phase 3 Hold'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {int.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">AUTH ARCHITECTURE</div>
                  <div className="text-slate-700 font-medium bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px] truncate">
                    {int.auth_type}
                  </div>
                </div>

                {/* Ping Result Banner */}
                {pingInfo && (
                  <div className={`p-2 rounded text-[11px] font-mono border flex items-center justify-between ${
                    pingInfo.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <span className="flex items-center gap-1 truncate">
                      <Zap className="w-3 h-3 shrink-0" />
                      {pingInfo.message}
                    </span>
                    {pingInfo.latency_ms && <span className="font-bold shrink-0 ml-2">{pingInfo.latency_ms} ms</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                {isPhase12 ? (
                  <>
                    <button
                      onClick={() => handlePing(int.id)}
                      disabled={pingingId === int.id || !int.connected}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-colors border ${
                        int.connected
                          ? 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
                          : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed'
                      }`}
                      title={!int.connected ? 'Connect credentials first to run ping' : 'Test live API latency'}
                    >
                      <Activity className={`w-3 h-3 ${pingingId === int.id ? 'animate-spin' : 'text-slate-500'}`} />
                      <span>{pingingId === int.id ? 'Testing...' : 'Live Health Ping'}</span>
                    </button>

                    <button
                      onClick={() => setShowGoogleModal(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 p-1 hover:bg-blue-50 rounded"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{int.connected ? 'Update Token' : 'Connect'}</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-slate-400 italic text-[11px]">
                    <span>Phase 3 Integration</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">
                      Compliance Hold
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Architecture & Ground Truth */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Zero Prompt Leakage Architecture & Token Isolation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Server-Side AES-256-GCM Vault</span>
            <p className="text-slate-600">OAuth tokens and refresh credentials are encrypted with hardware-grade AES-256-GCM and never exposed to browser or model context.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Idempotent Execution Engine</span>
            <p className="text-slate-600">Every external tool execution generates a SHA-256 idempotency key checked against the persistent ledger before re-executing.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Strict Human-In-The-Loop Gate</span>
            <p className="text-slate-600">Outbound emails and meeting invites are halted at the Policy Engine and require explicit operator confirmation before dispatch.</p>
          </div>
        </div>
      </div>

      {/* Connect Google Workspace Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Connect Google Workspace OAuth</h3>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectGoogle} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Connect your Google Workspace or Gmail credentials to enable the agent to query emails and send verified communications. Credentials are encrypted with AES-256-GCM at rest.
              </p>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  OAuth Refresh Token <span className="text-slate-400 font-normal">(recommended for long-lived access)</span>
                </label>
                <input
                  type="password"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  placeholder="1//04..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  OAuth Access Token <span className="text-slate-400 font-normal">(for quick immediate session testing)</span>
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="ya29.a0..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client ID (optional)</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Defaults to server env"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Secret (optional)</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Defaults to server env"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] space-y-1">
                <p className="font-semibold">Quick Testing Note:</p>
                <p>If you do not have production Google OAuth credentials configured right now, you can paste any valid Google OAuth Access Token, or leave it disconnected while testing simulated agent runs.</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Saving to Vault...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
