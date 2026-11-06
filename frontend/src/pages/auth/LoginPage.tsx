import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, GraduationCap, Briefcase, ShieldCheck, FileCheck2, FolderOpen, Clock } from 'lucide-react';
import type { Role } from '../../types';

const homeFor = (role?: Role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'STAFF' || role === 'DEPT_ADMIN') return '/staff';
  return '/student';
};

const DEMO = [
  { role: 'STUDENT' as Role, title: 'Student', who: 'Tariq Ahmad', icon: GraduationCap },
  { role: 'STAFF' as Role, title: 'Department staff', who: 'Dr. Farhan Siddiqui', icon: Briefcase },
  { role: 'ADMIN' as Role, title: 'Administrator', who: 'Registrar’s office', icon: ShieldCheck },
];

const HIGHLIGHTS = [
  { icon: FileCheck2, text: 'Apply for 10 campus services from one place' },
  { icon: FolderOpen, text: 'Download your ID card, receipts and admit cards' },
  { icon: Clock, text: 'Track every request and grievance until it is closed' },
];

export const LoginPage: React.FC = () => {
  const { login, availableAccounts } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter your @amu.ac.in email address.');
      return;
    }
    setBusy('form');
    setError(null);
    try {
      await login(email);
      const matched = availableAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      navigate(homeFor(matched?.role));
    } catch {
      setError('That email and password did not match. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const demoLogin = async (role: Role) => {
    const account = availableAccounts.find((a) => a.role === role);
    if (!account) return;
    setBusy(role);
    try {
      await login(account.email, role);
      navigate(homeFor(role));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-campus-950 text-white p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-campus-200" />
          </div>
          <span className="font-semibold">Aligarh Muslim University</span>
        </div>
        <div className="max-w-md animate-fade-up">
          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight text-white">Campus services, in one place.</h1>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-campus-100">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <h.icon className="w-4 h-4" />
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-campus-200/70">Every action is logged for audit.</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-campus-950 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-campus-200" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-slate-900 dark:text-white">Campus Services</div>
              <div className="text-sm text-slate-500">Aligarh Muslim University</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Use your institute email.</p>

          {error && (
            <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="name@amu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field h-11"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-sm text-campus-700 dark:text-campus-400 hover:underline">Forgot?</Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field h-11"
              />
            </div>
            <button type="submit" disabled={busy !== null} className="btn-primary w-full h-11">
              {busy === 'form' ? 'Signing in…' : 'Sign in'}
              {busy !== 'form' && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              or try a demo account
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="mt-4 space-y-2">
              {DEMO.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => demoLogin(d.role)}
                  className="group w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-left transition-[border-color,background-color,transform] duration-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.99] disabled:opacity-60"
                >
                  <span className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <d.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">{d.title}</span>
                    <span className="block text-xs text-slate-500 truncate">{d.who}</span>
                  </span>
                  {busy === d.role ? (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-campus-700 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
