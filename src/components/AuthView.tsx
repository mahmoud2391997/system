import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Plus, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  onSuccess: (data: { user: any; workspace: any; token: string }) => void;
}

interface GmailAccount {
  email: string;
  name?: string;
  avatar?: string;
}

const REMEMBER_KEY = 'nexus_gmail_accounts';

const GoogleGIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.55-5.15 3.55-8.66z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-3.01c-1.08.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.26v3.1C3.24 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.25 14.25A7.2 7.2 0 0 1 4.87 12c0-.78.13-1.54.36-2.25V6.65H1.26A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.26 5.35l3.99-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.14 15.24 0 12 0 7.31 0 3.24 2.7 1.26 6.65l3.99 3.1C6.2 6.87 8.86 4.75 12 4.75z" />
  </svg>
);

function readRememberedAccounts(): GmailAccount[] {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberAccount(account: GmailAccount) {
  const next = [account, ...readRememberedAccounts().filter((item) => item.email.toLowerCase() !== account.email.toLowerCase())];
  localStorage.setItem(REMEMBER_KEY, JSON.stringify(next.slice(0, 8)));
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showName, setShowName] = useState(false);
  const [step, setStep] = useState<'home' | 'chooser' | 'form'>(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('signin') === 'gmail'
      ? 'chooser'
      : 'home',
  );
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);

  const loadAccounts = async () => {
    const remembered = readRememberedAccounts();
    try {
      const res = await fetch('/api/auth/gmail/accounts');
      const data = await res.json();
      const remote: GmailAccount[] = data.accounts || [];
      const merged: GmailAccount[] = [];
      const seen = new Set<string>();
      for (const account of [...remembered, ...remote]) {
        const key = account.email.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(account);
      }
      setAccounts(merged);
    } catch {
      setAccounts(remembered);
    }
  };

  useEffect(() => {
    if (step === 'chooser') {
      void loadAccounts();
    }
  }, [step]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GOOGLE_LOGIN_SUCCESS' && e.data.token) {
        localStorage.setItem('nexus_token', e.data.token);
        window.location.reload();
      } else if (e.data?.type === 'GOOGLE_LOGIN_ERROR') {
        setError(e.data?.message || 'Gmail sign-in was cancelled.');
        setLoading(false);
        setStep('chooser');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const openGmailChooser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google/status');
      const data = await res.json().catch(() => ({}));
      if (data?.oauthConfigured) {
        window.open('/api/auth/google/login', 'gmail_accounts', 'width=520,height=720,noopener');
        setLoading(false);
        return;
      }
      setStep('chooser');
      if (window.history.replaceState) {
        window.history.replaceState({}, '', '/?signin=gmail');
      }
    } catch {
      setStep('chooser');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gmail login failed');
      localStorage.setItem('nexus_token', data.token);
      rememberAccount({
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
      });
      if (window.history.replaceState) {
        window.history.replaceState({}, '', '/');
      }
      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
      if (/already exists|name/i.test(err.message || '')) {
        setShowName(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring';

  const goHome = () => {
    setStep('home');
    setError(null);
    if (window.history.replaceState) window.history.replaceState({}, '', '/');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-white ring-1 ring-border">
          <GoogleGIcon />
        </div>
        <div className="mt-4 font-mono text-lg font-semibold tracking-[0.2em]">NEXUS</div>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {step === 'chooser' ? 'Choose a Gmail account' : 'Personal · Gmail'}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          {step === 'chooser'
            ? 'Pick one of your Gmail addresses, or add another account.'
            : step === 'form'
              ? 'Continue with the selected Gmail. This password opens the live inbox so you can search mail after sign-in.'
              : 'Sign in with Gmail to see your accounts and choose one.'}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-danger-bg p-3 text-left text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'home' && (
          <>
            <button
              type="button"
              onClick={openGmailChooser}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <GoogleGIcon />
              {loading ? 'Opening Gmail…' : 'Sign in with Gmail'}
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-[0.14em]">
                <span className="bg-card px-2 text-muted-foreground">Or demo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full rounded-md border border-border px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              Continue as Sarah Chen
            </button>
          </>
        )}

        {step === 'chooser' && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border text-left">
            <div className="border-b border-border bg-muted/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Gmail accounts
            </div>
            {accounts.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">No Gmail accounts on this device yet.</div>
            )}
            {accounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setName(account.name || '');
                  setPassword('');
                  setStep('form');
                }}
                className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/70"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {(account.avatar || account.name || account.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{account.name || account.email.split('@')[0]}</div>
                  <div className="truncate text-xs text-muted-foreground">{account.email}</div>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setPassword('');
                setName('');
                setStep('form');
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/70"
            >
              <div className="flex size-9 items-center justify-center rounded-full border border-dashed border-border">
                <Plus className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium">Use another account</div>
                <div className="text-xs text-muted-foreground">Add a Gmail address</div>
              </div>
            </button>
            <button
              type="button"
              onClick={goHome}
              className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-3 text-[13px] text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
          </div>
        )}

        {step === 'form' && (
          <>
            <form onSubmit={handleGmailLogin} className="mt-6 space-y-3.5 text-left text-sm">
              {showName && (
                <div>
                  <label className="mb-1 block font-medium text-foreground">Full name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Mercer" className={fieldClass} />
                </div>
              )}
              <div>
                <label className="mb-1 block font-medium text-foreground">Gmail</label>
                <input
                  type="email"
                  required
                  autoFocus={!email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-foreground">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoFocus={Boolean(email)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <GoogleGIcon />
                {loading ? 'Signing in…' : 'Sign in with Gmail'}
              </button>
            </form>
            {!showName && (
              <p className="mt-3 text-[13px] text-muted-foreground">
                First visit creates a Startup workspace. Sign-in also opens Gmail search.{' '}
                <button type="button" className="hover:text-foreground hover:underline" onClick={() => setShowName(true)}>
                  Add a name
                </button>
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setStep('chooser');
                setError(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Choose a different Gmail
            </button>
          </>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          Sends and bookings still need your approval
        </p>
      </div>
    </main>
  );
};
