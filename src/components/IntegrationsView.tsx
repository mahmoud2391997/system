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
  Copy,
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
  const [copiedUri, setCopiedUri] = useState(false);

  // Fetch Google OAuth configuration status from server
  const checkOAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/google/status');
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
    if (!oauthStatus?.configured) {
      setErrorMsg('Cannot connect: Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
      return;
    }

    setIsConnecting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('nexus_token');
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
    if (!confirm('Disconnect Google Workspace credentials? Autonomous Gmail and Calendar tools will be disabled.')) return;
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
        setSuccessMsg('Google Workspace disconnected.');
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to disconnect');
    }
  };

  const isGoogleConnected = integrations.some((i) => (i.id === 'int_gmail' || i.id === 'int_calendar') && i.connected);
  const redirectUriDisplay = oauthStatus?.redirectUri || `${window.location.origin}/api/auth/google/callback`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1D1814] p-4 rounded-lg border border-[#3A2F22]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFB000] bg-[#15120F] px-2 py-0.5 rounded border border-[#3A2F22]">
              provider-vault // live
            </span>
            <span className="text-xs text-[#F3E9D2]/50 font-mono">aes-256 token encryption</span>
          </div>
          <h1 className="text-base font-bold text-[#F3E9D2] mt-1 font-sans">Provider Credentials & Integrations</h1>
          <p className="text-xs text-[#F3E9D2]/70 font-sans max-w-2xl">
            Nexus executes strictly against official provider APIs. Credentials are vaulted per tenant and never injected into model prompts.
          </p>
        </div>

        <div className="flex items-center gap-2 font-sans">
          {isGoogleConnected ? (
            <button
              onClick={handleDisconnectGoogle}
              className="px-3 py-1.5 text-xs font-semibold text-[#E2574C] bg-[#15120F] hover:bg-[#4A2622] border border-[#E2574C]/60 rounded flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Google
            </button>
          ) : (
            <button
              onClick={handleConnectWithGoogle}
              disabled={isConnecting || (oauthStatus !== null && !oauthStatus.configured)}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-colors ${
                oauthStatus?.configured
                  ? 'bg-[#FFB000] hover:bg-[#FFB000]/90 text-[#15120F] cursor-pointer'
                  : 'bg-[#15120F] text-[#F3E9D2]/40 border border-[#3A2F22] cursor-not-allowed'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#15120F]" />
              ) : (
                <span className="font-mono text-xs">❯</span>
              )}
              <span>{isConnecting ? 'Connecting...' : oauthStatus?.configured ? 'Connect with Google' : 'Google OAuth Setup Required'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notice Banner */}
      {successMsg && (
        <div className="bg-[#2E4A3B] border border-[#5FB88A]/60 rounded-lg p-3 text-xs flex items-center justify-between text-[#5FB88A] font-sans">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5FB88A] shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[#5FB88A] hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notice Banner */}
      {errorMsg && (
        <div className="bg-[#4A2622] border border-[#E2574C]/60 rounded-lg p-3 text-xs flex items-center justify-between text-[#E2574C] font-sans">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E2574C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[#E2574C] hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Missing OAuth Notice */}
      {oauthStatus && !oauthStatus.configured && (
        <div className="bg-[#1D1814] border border-[#E2A23C]/50 rounded-lg p-4 text-xs space-y-3 font-sans">
          <div className="flex items-center gap-2 text-[#E2A23C] font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-[#E2A23C] shrink-0" />
            <span>Google OAuth 2.0 Credentials Required for Self-Serve Connection</span>
          </div>
          <p className="text-[#F3E9D2]/70 leading-relaxed max-w-3xl">
            To allow users to self-serve connect their Gmail and Google Calendar, the server requires OAuth credentials. Once set, users click Connect with Google to grant consent directly.
          </p>

          <div className="bg-[#15120F] p-3 rounded border border-[#3A2F22] space-y-2.5 max-w-3xl">
            <div className="text-[10px] font-bold text-[#B8850A] uppercase tracking-wider font-mono">
              Required Environment Variables:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 bg-[#1D1814] rounded border border-[#3A2F22]">
                <span className="text-[#F3E9D2]">GOOGLE_CLIENT_ID</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  oauthStatus.missing.includes('GOOGLE_CLIENT_ID') ? 'bg-[#4A2622] text-[#E2574C]' : 'bg-[#2E4A3B] text-[#5FB88A]'
                }`}>
                  {oauthStatus.missing.includes('GOOGLE_CLIENT_ID') ? 'Missing' : 'Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1D1814] rounded border border-[#3A2F22]">
                <span className="text-[#F3E9D2]">GOOGLE_CLIENT_SECRET</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  oauthStatus.missing.includes('GOOGLE_CLIENT_SECRET') ? 'bg-[#4A2622] text-[#E2574C]' : 'bg-[#2E4A3B] text-[#5FB88A]'
                }`}>
                  {oauthStatus.missing.includes('GOOGLE_CLIENT_SECRET') ? 'Missing' : 'Configured'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#3A2F22]">
              <span className="text-[11px] font-medium text-[#F3E9D2]/70 block mb-1">
                Authorized Redirect URI (Google Cloud Console &gt; Credentials):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={redirectUriDisplay}
                  className="w-full bg-[#1D1814] px-2.5 py-1 border border-[#3A2F22] rounded font-mono text-[11px] text-[#FFB000] select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(redirectUriDisplay);
                    setCopiedUri(true);
                    setTimeout(() => setCopiedUri(false), 2000);
                  }}
                  className="px-3 py-1 bg-[#1D1814] hover:bg-[#3A2F22] border border-[#3A2F22] rounded text-xs font-sans text-[#F3E9D2] shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  {copiedUri ? <Check className="w-3.5 h-3.5 text-[#5FB88A]" /> : <Copy className="w-3.5 h-3.5 text-[#B8850A]" />}
                  <span>{copiedUri ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
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
                isPhase12 ? 'bg-[#1D1814] border-[#3A2F22]' : 'bg-[#1D1814]/70 border-[#3A2F22] opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-[#15120F] border border-[#3A2F22] text-[#FFB000]">
                      {int.type === 'email' ? <Mail className="w-4 h-4" /> :
                       int.type === 'calendar' ? <Calendar className="w-4 h-4" /> :
                       int.type === 'messaging' ? <MessageSquare className="w-4 h-4" /> :
                       <Phone className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#F3E9D2] leading-tight font-sans">{int.name}</h3>
                      <p className="text-[11px] text-[#B8850A] font-mono mt-0.5">{int.provider}</p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                      int.connected
                        ? 'text-[#5FB88A] bg-[#2E4A3B] border-[#5FB88A]/60'
                        : isPhase12
                        ? 'text-[#E2A23C] bg-[#4A3B20] border-[#E2A23C]/60'
                        : 'text-[#F3E9D2]/40 bg-[#15120F] border-[#3A2F22]'
                    }`}
                  >
                    {int.connected ? 'active' : isPhase12 ? (oauthStatus?.configured ? 'oauth-ready' : 'needs-config') : 'planned'}
                  </span>
                </div>

                <p className="text-xs text-[#F3E9D2]/70 leading-relaxed font-sans">
                  {int.description}
                </p>

                <div className="pt-2 border-t border-[#3A2F22] space-y-1 text-xs font-mono">
                  <div className="text-[10px] text-[#B8850A] uppercase">AUTH ARCHITECTURE</div>
                  <div className="text-[#FFB000] bg-[#15120F] p-1.5 rounded border border-[#3A2F22] text-[11px] truncate">
                    {int.auth_type}
                  </div>
                </div>

                {/* Ping Result Banner */}
                {pingInfo && (
                  <div className={`p-2 rounded text-[11px] font-mono border flex items-center justify-between ${
                    pingInfo.success
                      ? 'bg-[#2E4A3B] border-[#5FB88A]/50 text-[#5FB88A]'
                      : 'bg-[#4A2622] border-[#E2574C]/50 text-[#E2574C]'
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
              <div className="pt-3 mt-3 border-t border-[#3A2F22] flex items-center justify-between text-[11px] font-sans">
                {isPhase12 ? (
                  <>
                    <button
                      onClick={() => handlePing(int.id)}
                      disabled={pingingId === int.id || !int.connected}
                      className={`px-2 py-1 rounded flex items-center gap-1 font-mono text-[11px] transition-colors border ${
                        int.connected
                          ? 'text-[#F3E9D2] hover:text-[#FFB000] bg-[#15120F] hover:bg-[#3A2F22] border-[#3A2F22] cursor-pointer'
                          : 'text-[#F3E9D2]/30 bg-[#15120F] border-[#3A2F22] cursor-not-allowed'
                      }`}
                    >
                      <Activity className={`w-3 h-3 ${pingingId === int.id ? 'animate-spin text-[#FFB000]' : 'text-[#B8850A]'}`} />
                      <span>{pingingId === int.id ? 'pinging...' : 'health ping'}</span>
                    </button>

                    {int.connected ? (
                      <span className="text-[#5FB88A] font-mono text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        connected
                      </span>
                    ) : (
                      <button
                        onClick={handleConnectWithGoogle}
                        disabled={!oauthStatus?.configured || isConnecting}
                        className={`font-semibold flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          oauthStatus?.configured
                            ? 'text-[#FFB000] hover:bg-[#3A2F22] cursor-pointer'
                            : 'text-[#F3E9D2]/30 cursor-not-allowed'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isConnecting ? 'Opening...' : 'Connect OAuth'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-[#F3E9D2]/40 italic text-[11px]">
                    <span>Phase 3 Integration</span>
                    <span className="text-[10px] font-mono bg-[#15120F] px-1.5 py-0.2 rounded text-[#B8850A] border border-[#3A2F22]">
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
