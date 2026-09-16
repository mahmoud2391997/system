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
    <div className="min-h-screen bg-[#15120F] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#5C4620] selection:text-[#FFB000]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded bg-[#1D1814] border border-[#3A2F22] flex items-center justify-center text-[#FFB000]">
          <span className="font-mono text-xl font-bold tracking-tighter">❯_</span>
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#F3E9D2]">
          Nexus AI Operations
        </h2>
        <p className="mt-1 text-xs text-[#B8850A] font-mono">
          nexus-auth — /core/tenant-gate
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#1D1814] py-6 px-6 border border-[#3A2F22] rounded-lg shadow-2xl sm:px-8 space-y-5">
          {error && (
            <div className="p-3 bg-[#4A2622] border border-[#E2574C]/60 rounded text-xs text-[#E2574C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#E2574C]" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access */}
          <div className="bg-[#15120F] border border-[#3A2F22] rounded-lg p-3.5 text-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#FFB000] font-bold">nexus❯ eval --demo</span>
            </div>
            <p className="text-[#F3E9D2]/70 leading-relaxed font-sans text-xs">
              Authenticate immediately as <strong>Sarah Chen</strong> (Owner, Personal Tier). Loads active Gmail/Calendar integration and CRM records.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-[#FFB000] hover:bg-[#FFB000]/90 text-[#15120F] font-mono font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOGIN AS SARAH CHEN (DEMO)</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3A2F22]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#1D1814] px-2 text-[#B8850A] font-mono">Or authentic credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-[#F3E9D2]/80 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3 py-2 border border-[#3A2F22] rounded bg-[#15120F] text-[#F3E9D2] focus:outline-none focus:border-[#FFB000]"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-[#F3E9D2]/80 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="w-full px-3 py-2 border border-[#3A2F22] rounded bg-[#15120F] text-[#F3E9D2] focus:outline-none focus:border-[#FFB000]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#F3E9D2]/80 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-[#3A2F22] rounded bg-[#15120F] text-[#F3E9D2] focus:outline-none focus:border-[#FFB000]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-[#15120F] hover:bg-[#3A2F22] text-[#FFB000] border border-[#3A2F22] font-mono text-xs font-semibold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
              <p className="text-[#F3E9D2]/60">
                Need a new workspace?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-[#FFB000] hover:underline font-medium ml-1"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-[#F3E9D2]/60">
                Already registered?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-[#FFB000] hover:underline font-medium ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security Footnote */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-[#B8850A] font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#B8850A]" />
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
