import { useState, type ReactNode } from 'react';
import { LogIn, Lock, Mail, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navigate } from '@/lib/router';

export function AdminLogin() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setError(error);
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await resetPassword(resetEmail);
    setBusy(false);
    if (error) setError(error);
    else setResetSent(true);
  };

  return (
    <LoginShell>
      <div className="mx-auto max-w-md">
        <div className="card-glass relative overflow-hidden p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-lilac/40 bg-lilac/10"><ShieldCheck className="h-7 w-7 text-lilac-300" /></span>
            <h1 className="mt-5 font-display text-2xl font-semibold text-white">Admin Sign In</h1>
            <p className="mt-2 text-sm text-cream/60">Manage announcements, events, gallery, staff, and more.</p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="admin@obele.edu" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-cream/70">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-lilac" />
                  Remember me
                </label>
                <button type="button" onClick={() => { setMode('forgot'); setError(null); }} className="text-xs text-cream/50 transition hover:text-lilac-300">
                  Forgot password?
                </button>
              </div>
              {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              {resetSent ? (
                <div className="rounded-xl border border-emerald/30 bg-emerald/10 px-4 py-4 text-sm text-emerald">
                  If that email is registered, a password reset link has been sent. Check your inbox.
                </div>
              ) : (
                <form onSubmit={submitReset} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
                      <input required type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="input pl-10" placeholder="admin@obele.edu" />
                    </div>
                  </div>
                  {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {busy ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              )}
              <button onClick={() => { setMode('login'); setResetSent(false); setError(null); }} className="inline-flex items-center gap-1.5 text-xs text-cream/50 transition hover:text-lilac-300">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </button>
            </div>
          )}

          <div className="mt-6 border-t border-white/10 pt-4">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-xs text-cream/40 transition hover:text-cream/70">
              <ArrowLeft className="h-3 w-3" /> Back to website
            </button>
          </div>
        </div>
      </div>
    </LoginShell>
  );
}

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden pt-16">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
