import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

interface Props {
  idPrefix: string;
  busy: boolean;
  submitLabel: string;
  requireCurrent?: boolean;
  onSubmit: () => Promise<boolean>;
}

const RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'A letter and a number', test: (p: string) => /[A-Za-z]/.test(p) && /\d/.test(p) },
  { label: 'Upper and lower case', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'A symbol such as ! or #', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH = [
  { label: 'Too weak', bar: 'bg-rose-500' },
  { label: 'Weak', bar: 'bg-rose-500' },
  { label: 'Fair', bar: 'bg-amber-500' },
  { label: 'Good', bar: 'bg-emerald-500' },
  { label: 'Strong', bar: 'bg-emerald-600' },
];

const PasswordInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  error?: string | null;
}> = ({ id, label, value, onChange, autoComplete, error }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`field pr-11 ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p id={`${id}-err`} className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};

export const PasswordChangeForm: React.FC<Props> = ({ idPrefix, busy, submitLabel, requireCurrent, onSubmit }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);

  const passed = RULES.filter((r) => r.test(next)).length;
  const strength = next ? STRENGTH[passed] : null;
  const meetsMinimum = RULES[0].test(next) && RULES[1].test(next);

  const currentErr = tried && requireCurrent && !current ? 'Enter your current password.' : null;
  const nextErr = tried && !meetsMinimum ? 'Use at least 8 characters with a letter and a number.' : null;
  const confirmErr = (tried || confirm.length >= next.length) && confirm && confirm !== next
    ? 'Passwords do not match.'
    : tried && !confirm
    ? 'Type the new password again.'
    : null;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if ((requireCurrent && !current) || !meetsMinimum || confirm !== next) return;
    const ok = await onSubmit();
    if (ok) {
      setCurrent('');
      setNext('');
      setConfirm('');
      setTried(false);
    }
  };

  return (
    <form onSubmit={handle} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {requireCurrent && (
          <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
            <PasswordInput id={`${idPrefix}-current`} label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" error={currentErr} />
          </div>
        )}
        <div>
          <PasswordInput id={`${idPrefix}-new`} label="New password" value={next} onChange={setNext} autoComplete="new-password" error={nextErr} />
          <div className="mt-2 flex items-center gap-2" aria-live="polite">
            <div className="flex-1 grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-colors duration-300 ${strength && i < passed ? strength.bar : 'bg-slate-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 w-16 text-right">{strength?.label ?? ''}</span>
          </div>
        </div>
        <PasswordInput id={`${idPrefix}-confirm`} label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={confirmErr} />
      </div>

      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {RULES.map((r) => {
          const ok = r.test(next);
          return (
            <li key={r.label} className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 transition-opacity duration-200 ${ok ? 'opacity-100' : 'opacity-30'}`} /> {r.label}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-sm text-slate-500 dark:text-slate-400">Takes effect immediately. No approval needed.</span>
        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
          {busy && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
          {busy ? 'Updating…' : submitLabel}
        </button>
      </div>
    </form>
  );
};
