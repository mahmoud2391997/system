import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

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

  const fieldClass =
    'w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring';

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="font-mono text-lg font-bold">N</span>
        </div>
        <div className="mt-4 font-mono text-lg font-semibold tracking-[0.2em]">NEXUS</div>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          AI prompt
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Continue as Sarah Chen for the demo. Conversations, tasks, and approvals stay scoped to this workspace.
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-danger-bg p-3 text-left text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Continue as Sarah Chen'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.14em]">
            <span className="bg-card px-2 text-muted-foreground">Or email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-sm">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block font-medium text-foreground">Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Mercer" className={fieldClass} />
            </div>
          )}
          <div>
            <label className="mb-1 block font-medium text-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@company.com" className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block font-medium text-foreground">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md border border-border px-3 py-2.5 font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            {mode === 'register' ? 'Create workspace' : 'Sign in with email'}
          </button>
        </form>

        <p className="mt-4 text-[13px] text-muted-foreground">
          {mode === 'login' ? (
            <button type="button" className="hover:text-foreground hover:underline" onClick={() => setMode('register')}>
              Need a workspace? Register
            </button>
          ) : (
            <button type="button" className="hover:text-foreground hover:underline" onClick={() => setMode('login')}>
              Already registered? Sign in
            </button>
          )}
        </p>

        <p className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          Actions are always permissioned
        </p>
      </div>
    </main>
  );
};
