import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Shield, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import type { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, availableAccounts } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your institutional email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await login(email);
      // Route based on role
      const matched = availableAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
      if (matched?.role === 'ADMIN') {
        navigate('/admin');
      } else if (matched?.role === 'STAFF' || matched?.role === 'DEPT_ADMIN') {
        navigate('/staff');
      } else {
        navigate('/student');
      }
    } catch {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: Role) => {
    setIsSubmitting(true);
    try {
      const account = availableAccounts.find((a) => a.role === role);
      if (account) {
        await login(account.email, role);
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'STAFF' || role === 'DEPT_ADMIN') navigate('/staff');
        else navigate('/student');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Disclaimer Top Notification */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 px-4">
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Development UI Evaluation:</span> This login is a client-side mock for reviewing interface workflows. Select any role shortcut below or enter a demo email.
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-campus-950 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-8 h-8 text-campus-300" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Secure Campus Service Portal
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Aligarh Muslim University • Single Sign-On
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Institutional Email ID
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g., student.tariq@amu.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-campus-700 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-campus-700 hover:text-campus-900 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-campus-700 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-campus-900 focus:ring-campus-700"
              />
              <label htmlFor="remember" className="ml-2 block text-xs text-slate-600">
                Keep session authenticated on this browser
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5 text-sm"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign in to Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Personas
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('STUDENT')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-campus-400 hover:bg-campus-50/50 transition-colors text-left"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">Student Portal</div>
                  <div className="text-[11px] text-slate-500">Tariq Ahmad • student.tariq@amu.ac.in</div>
                </div>
                <span className="text-xs font-medium text-campus-700">Enter →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('STAFF')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-campus-400 hover:bg-campus-50/50 transition-colors text-left"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">Department Staff (IT)</div>
                  <div className="text-[11px] text-slate-500">Dr. Farhan Siddiqui • staff.cc@amu.ac.in</div>
                </div>
                <span className="text-xs font-medium text-campus-700">Enter →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-campus-400 hover:bg-campus-50/50 transition-colors text-left"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">Central Administrator</div>
                  <div className="text-[11px] text-slate-500">Registrar Officer • portal.admin@amu.ac.in</div>
                </div>
                <span className="text-xs font-medium text-campus-700">Enter →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Protected campus gateway with end-to-end audit logging</span>
        </div>
      </div>
    </div>
  );
};
