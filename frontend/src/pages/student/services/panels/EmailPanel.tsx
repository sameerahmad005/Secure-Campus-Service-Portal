import React, { useState } from 'react';
import { ShieldCheck, Copy, Download, RefreshCw } from 'lucide-react';
import { Section, Stat, useInstantAction, type PanelProps } from './shared';
import { PasswordChangeForm } from './PasswordChangeForm';
import { useToast } from '../../../../components/ui/Toast';

const makeCodes = () =>
  Array.from({ length: 8 }, () => {
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000000;
    const s = String(n).padStart(8, '0');
    return `${s.slice(0, 4)} ${s.slice(4)}`;
  });

const EmailPanel: React.FC<PanelProps> = ({ service, user }) => {
  const passwordAction = useInstantAction(service);
  const codesAction = useInstantAction(service);
  const { toast } = useToast();
  const [codes, setCodes] = useState<string[] | null>(null);
  const email = user?.email || 'student.tariq@amu.ac.in';

  const regenerate = () =>
    codesAction.run('New backup codes created', 'Your old codes no longer work.', () => setCodes(makeCodes()));

  const copyCodes = async () => {
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      toast('Codes copied');
    } catch {
      toast('Copy failed', { tone: 'error', description: 'Select the codes and copy them manually.' });
    }
  };

  const saveCodes = async () => {
    if (!codes) return;
    const { downloadDocument } = await import('../../../../utils/documentDownload');
    await downloadDocument({
      title: 'Backup Codes',
      reference: `SSO-${(user?.studentId || '2023-CS-042').replace(/-/g, '')}`,
      issuedBy: 'Computer Centre',
      holderName: email,
      rows: codes.map((c, i) => ({ label: `Code ${i + 1}`, value: c })),
      note: 'Each code works once. Keep this page somewhere safe and do not share it.',
    });
    toast('PDF downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="eyebrow">Institute account</div>
        <div className="text-lg sm:text-xl font-semibold font-mono text-slate-900 dark:text-white mt-1 break-all">{email}</div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Google Workspace for Education</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600 dark:text-slate-300">Storage</span>
            <span className="font-mono text-slate-500">18.4 GB of 100 GB</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full w-[18%] rounded-full bg-campus-600 animate-fade-in" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stat label="Two-step verification" value="On" hint="Authenticator app" />
        <Stat label="Single sign-on" value="3 services" hint="Library, IEEE, ScienceDirect" />
      </div>

      <Section title="Change password" description="Updates your email and every service you sign in to with it.">
        <PasswordChangeForm
          idPrefix="email-pass"
          requireCurrent
          busy={passwordAction.busy}
          submitLabel="Change password"
          onSubmit={() => passwordAction.run('Email password changed', 'You may need to sign in again on other devices.')}
        />
      </Section>

      <Section
        title="Backup codes"
        description="Use one if you lose your phone. Making new codes cancels the old ones."
        action={
          <button type="button" onClick={regenerate} disabled={codesAction.busy} className="btn-secondary">
            {codesAction.busy ? (
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70" />
            ) : codes ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {codes ? 'Make new codes' : 'Show new codes'}
          </button>
        }
      >
        {codes ? (
          <div className="animate-fade-up">
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {codes.map((c) => (
                <li key={c} className="font-mono text-sm text-center py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {c}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button type="button" onClick={copyCodes} className="btn-secondary"><Copy className="w-4 h-4" /> Copy</button>
              <button type="button" onClick={saveCodes} className="btn-secondary"><Download className="w-4 h-4" /> Save as PDF</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Codes are shown once. Save or copy them before you leave this page.</p>
        )}
      </Section>
    </div>
  );
};

export default EmailPanel;
