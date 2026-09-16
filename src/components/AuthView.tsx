import React, { useState } from 'react';
import { Cpu, ShieldCheck, Lock, ArrowRight, UserPlus, LogIn, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
          <Cpu className="w-7 h-7 text-indigo-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Nexus Autonomous Operations
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Production Phase 1–2 MVP with Scoped Tenant Isolation & Real Auth
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant Evaluation Demo Access */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-bold text-indigo-950">1-Click Demo Evaluation</span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              Sign in instantly as <strong>Sarah Chen</strong> (Owner of Apex Horizon, Personal Tier). Authenticates with real persistent database session and JWT cookie.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Sarah Chen (Demo)</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-mono">Or use real credentials</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mahmoud Ahmed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              {mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Isolated Workspace Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle login / register */}
          <div className="text-center pt-2 text-xs">
            {mode === 'login' ? (
              <p className="text-slate-600">
                Need a new isolated tenant?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-slate-600">
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security details footnote */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-indigo-500" />
            PBKDF2 Password Hashing
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Signed JWT Session
          </span>
        </div>
      </div>
    </div>
  );
};
