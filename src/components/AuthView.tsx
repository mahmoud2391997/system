import React, { useState } from 'react';
import { Lock, UserPlus, LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  onSuccess: (data: { user: any; workspace: any; token: string }) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      localStorage.setItem('nexus_token', data.token);
      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' ? { email, password, name } : { email, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      localStorage.setItem('nexus_token', data.token);
      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#5C4620] selection:text-[#171717]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[#171717]">
          <span className="font-mono text-2xl font-black tracking-tighter">N</span>
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#20232D]">
          Nexus Operations
        </h2>
        <p className="mt-1 text-xs text-[#737373] font-mono">
          nexus-auth — /core/tenant-gate
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#FFFFFF] py-6 px-6 border border-[#E5E5E5] rounded-lg shadow-2xl sm:px-8 space-y-5">
          {error && (
            <div className="p-3 bg-[#4A2622] border border-[#E2574C]/60 rounded text-xs text-[#E2574C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#E2574C]" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access */}
          <div className="bg-[#F8F7F3] border border-[#E5E5E5] rounded-lg p-3.5 text-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#171717] font-bold">nexus❯ eval --demo</span>
            </div>
            <p className="text-[#20232D]/70 leading-relaxed font-sans text-xs">
              Authenticate immediately as <strong>Sarah Chen</strong> (Owner, Personal Tier). Loads active Gmail/Calendar integration and CRM records.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-[#171717] hover:bg-[#171717]/90 text-[#F8F7F3] font-mono font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN AS SARAH CHEN (DEMO)</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E5E5]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#FFFFFF] px-2 text-[#737373] font-mono">Or authentic credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-[#20232D]/80 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded bg-[#F8F7F3] text-[#20232D] focus:outline-none focus:border-[#171717]"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-[#20232D]/80 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded bg-[#F8F7F3] text-[#20232D] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#20232D]/80 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded bg-[#F8F7F3] text-[#20232D] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-[#F8F7F3] hover:bg-[#E5E5E5] text-[#171717] border border-[#E5E5E5] font-mono text-xs font-semibold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mode === 'register' ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>REGISTER WORKSPACE</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-1 text-xs font-sans">
            {mode === 'login' ? (
              <p className="text-[#20232D]/60">
                Need a new workspace?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-[#171717] hover:underline font-medium ml-1"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-[#20232D]/60">
                Already registered?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-[#171717] hover:underline font-medium ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security Footnote */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-[#737373] font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#737373]" />
            sha-256 + pbkdf2
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#5FB88A]" />
            jwt-session
          </span>
        </div>
      </div>
    </div>
  );
};
