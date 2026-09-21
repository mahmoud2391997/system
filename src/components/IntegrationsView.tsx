import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Zap,
  Check,
  Mail,
  Calendar,
  Phone,
  MessageSquare,
  LogOut,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { IntegrationStatus } from '../types';

interface IntegrationsViewProps {
  integrations: IntegrationStatus[];
  onRefresh?: () => void;
  onPingIntegration?: (id: string) => Promise<void>;
}

interface GoogleOAuthStatus {
  configured: boolean;
  mode?: 'personal_gmail' | 'google_oauth';
  oauthConfigured?: boolean;
  liveInbox?: boolean;
  missing: string[];
  redirectUri: string;
  clientIdPreview?: string | null;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onRefresh,
  onPingIntegration,
}) => {
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { success: boolean; latency_ms?: number; message: string }>>({});
  const [oauthStatus, setOauthStatus] = useState<GoogleOAuthStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Google OAuth configuration status from server
  const checkOAuthStatus = async () => {
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await fetch('/api/auth/google/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setOauthStatus(data);
      }
    } catch (err) {
      console.error('Failed to check Google OAuth status:', err);
    }
  };

  useEffect(() => {
    checkOAuthStatus();
  }, [integrations]);

  // Listen for OAuth completion from popup
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setIsConnecting(false);
        setSuccessMsg('Google Workspace successfully connected via OAuth 2.0!');
        setErrorMsg(null);
        setTimeout(() => setSuccessMsg(null), 6000);
        checkOAuthStatus();
        if (onRefresh) onRefresh();
      } else if (e.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsConnecting(false);
        setErrorMsg(e.data?.message || 'Google OAuth authorization declined or failed.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onRefresh]);

  const handlePing = async (id: string) => {
    setPingingId(id);
    try {
      if (onPingIntegration) {
        await onPingIntegration(id);
      }
      const token = localStorage.getItem('nexus_token');
      const res = await fetch('/api/integrations/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

  const handleConnectWithGoogle = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('nexus_token');
      if (!oauthStatus?.oauthConfigured) {
        const res = await fetch('/api/integrations/gmail/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to connect Gmail.');
        setIsConnecting(false);
        setSuccessMsg(data.message || 'Gmail and Calendar are connected from your Gmail login.');
        setTimeout(() => setSuccessMsg(null), 6000);
        if (onRefresh) onRefresh();
        return;
      }
      const res = await fetch('/api/auth/google/start?format=json', {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to obtain Google authorization URL from server.');
      }

      const width = 560;
      const height = 680;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start Google OAuth flow');
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Disconnect Gmail and Calendar? Inbox, send, and booking will turn off until you connect again.')) return;
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await fetch('/api/integrations/google/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setSuccessMsg('Gmail disconnected.');
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to disconnect');
    }
  };

  const isGoogleConnected = integrations.some((i) => (i.id === 'int_gmail' || i.id === 'int_calendar') && i.connected);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-800 p-4 rounded-lg border border-ink-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber bg-ink-950 px-2 py-0.5 rounded border border-ink-border">
              provider-vault // live
            </span>
            <span className="text-xs text-paper/50 font-mono">aes-256 token encryption</span>
          </div>
          <h1 className="text-xl font-semibold text-paper mt-1 font-sans tracking-tight">Provider Credentials & Integrations</h1>
          <p className="text-sm text-paper/70 font-sans max-w-2xl">
            Nexus executes strictly against official provider APIs. Credentials are vaulted per tenant and never injected into model prompts.
          </p>
        </div>

        <div className="flex items-center gap-2 font-sans">
          {isGoogleConnected ? (
            <button
              onClick={handleDisconnectGoogle}
              className="px-3 py-1.5 text-xs font-semibold text-danger bg-ink-950 hover:bg-danger-bg border border-danger/60 rounded flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Gmail
            </button>
          ) : (
            <button
              onClick={handleConnectWithGoogle}
              disabled={isConnecting}
              className="px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-colors bg-amber hover:bg-amber/90 text-ink-950 cursor-pointer"
            >
              {isConnecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-950" />
              ) : (
                <span className="font-mono text-xs">❯</span>
              )}
              <span>{isConnecting ? 'Connecting...' : oauthStatus?.oauthConfigured ? 'Connect with Google' : 'Connect Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notice Banner */}
      {successMsg && (
        <div className="bg-ok-bg border border-ok/60 rounded-lg p-3 text-xs flex items-center justify-between text-ok font-sans">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-ok hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notice Banner */}
      {errorMsg && (
        <div className="bg-danger-bg border border-danger/60 rounded-lg p-3 text-xs flex items-center justify-between text-danger font-sans">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-danger hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {oauthStatus && !oauthStatus.oauthConfigured && (
        <div className="bg-ink-800 border border-ink-border p-4 text-sm font-sans">
          <div className="flex items-center gap-2 text-paper font-semibold">
            <Mail className="w-4 h-4 text-amber shrink-0" />
            <span>Gmail login opens inbox search</span>
          </div>
          <p className="text-paper/70 mt-1.5 leading-relaxed max-w-3xl">
            Sign in with Gmail to search mail, draft messages, and use calendar. Personal accounts do not need extra inbox passwords after login.
          </p>
        </div>
      )}

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
        {integrations.map((int) => {
          const pingInfo = pingResults[int.id];
          const isPhase12 = int.id === 'int_gmail' || int.id === 'int_calendar';

          return (
            <div
              key={int.id}
              className={`rounded-lg border p-4 flex flex-col justify-between transition-colors ${
                isPhase12 ? 'bg-ink-800 border-ink-border' : 'bg-ink-800/70 border-ink-border opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-ink-950 border border-ink-border text-amber">
                      {int.type === 'email' ? <Mail className="w-4 h-4" /> :
                       int.type === 'calendar' ? <Calendar className="w-4 h-4" /> :
                       int.type === 'messaging' ? <MessageSquare className="w-4 h-4" /> :
                       <Phone className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-paper leading-tight font-sans">{int.name}</h3>
                      <p className="text-[11px] text-amber-dim font-mono mt-0.5">{int.provider}</p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                      int.connected
                        ? 'text-ok bg-ok-bg border-ok/60'
                        : isPhase12
                        ? 'text-amber bg-warn-bg border-amber/60'
                        : 'text-paper/40 bg-ink-950 border-ink-border'
                    }`}
                  >
                    {int.connected ? 'active' : isPhase12 ? 'gmail-ready' : 'planned'}
                  </span>
                </div>

                <p className="text-xs text-paper/70 leading-relaxed font-sans">
                  {int.description}
                </p>

                <div className="pt-2 border-t border-ink-border space-y-1 text-xs font-mono">
                  <div className="text-[10px] text-amber-dim uppercase">AUTH ARCHITECTURE</div>
                  <div className="text-amber bg-ink-950 p-1.5 rounded border border-ink-border text-[11px] truncate">
                    {int.auth_type}
                  </div>
                </div>

                {/* Ping Result Banner */}
                {pingInfo && (
                  <div className={`p-2 rounded text-[11px] font-mono border flex items-center justify-between ${
                    pingInfo.success
                      ? 'bg-ok-bg border-ok/50 text-ok'
                      : 'bg-danger-bg border-danger/50 text-danger'
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
              <div className="pt-3 mt-3 border-t border-ink-border flex items-center justify-between text-[11px] font-sans">
                {isPhase12 ? (
                  <>
                    <button
                      onClick={() => handlePing(int.id)}
                      disabled={pingingId === int.id || !int.connected}
                      className={`px-2 py-1 rounded flex items-center gap-1 font-mono text-[11px] transition-colors border ${
                        int.connected
                          ? 'text-paper hover:text-amber bg-ink-950 hover:bg-ink-700 border-ink-border cursor-pointer'
                          : 'text-paper/30 bg-ink-950 border-ink-border cursor-not-allowed'
                      }`}
                    >
                      <Activity className={`w-3 h-3 ${pingingId === int.id ? 'animate-spin text-amber' : 'text-amber-dim'}`} />
                      <span>{pingingId === int.id ? 'pinging...' : 'health ping'}</span>
                    </button>

                    {int.connected ? (
                      <span className="text-ok font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        connected
                      </span>
                    ) : (
                      <button
                        onClick={handleConnectWithGoogle}
                        disabled={isConnecting}
                        className="font-semibold flex items-center gap-1 px-2 py-1 rounded transition-colors text-amber hover:bg-ink-700 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isConnecting ? 'Opening...' : 'Connect Gmail'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-paper/40 italic text-[11px]">
                    <span>Phase 3 Integration</span>
                    <span className="text-[10px] font-mono bg-ink-950 px-1.5 py-0.2 rounded text-amber-dim border border-ink-border">
                      Hold
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
