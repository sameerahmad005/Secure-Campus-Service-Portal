import React, { useState } from 'react';
import { CheckCircle2, Download, Info, AlertTriangle } from 'lucide-react';
import type { User } from '../../../../types';
import { serviceRequestService } from '../../../../services';
import { useToast } from '../../../../components/ui/Toast';
import { downloadDocument, type DocumentSpec } from '../../../../utils/documentDownload';
import type { CampusService } from '../../../../data/campusServices';
import { logActivity } from '../../../../utils/localStore';

export interface PanelProps {
  service: CampusService;
  user: User | null;
  onRequestCreated: () => void;
}

/** Submits a service request and reports the result with a toast. */
export function useServiceSubmit(service: CampusService, user: User | null, onDone: () => void) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (
    formData: Record<string, string>,
    successTitle: string,
    successDetail?: string,
    attachmentFiles?: File[]
  ) => {
    if (!user) {
      toast('Sign in again to submit', { tone: 'error' });
      return false;
    }
    setSubmitting(true);
    try {
      const req = await serviceRequestService.createRequest(user, { serviceId: service.id, formData, attachmentFiles });
      toast(successTitle, { description: successDetail ?? `Tracking number ${req.requestNumber}` });
      onDone();
      return true;
    } catch {
      toast('Could not submit the request', {
        tone: 'error',
        description: 'Check your connection and try again.',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting };
}

/**
 * For self-service actions that take effect immediately (no staff approval):
 * records the change in the service's activity log and confirms it with a toast.
 * Nothing is added to the staff request queue.
 */
export function useInstantAction(service: CampusService) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (title: string, detail?: string, work?: () => void | Promise<void>) => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      await work?.();
      logActivity(service.slug, title, detail);
      toast(title, { description: detail });
      return true;
    } catch {
      toast('That did not go through', { tone: 'error', description: 'Try again in a moment.' });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy };
}

export function useDocumentDownload() {
  const { toast } = useToast();
  return async (spec: DocumentSpec) => {
    try {
      const file = await downloadDocument(spec);
      toast('PDF downloaded', { description: file });
    } catch {
      toast('Could not create the PDF', { tone: 'error', description: 'Try again in a moment.' });
    }
  };
}

export const Section: React.FC<{ title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  description,
  action,
  children,
}) => (
  <section className="card overflow-hidden">
    <div className="px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string; mono?: boolean }> = ({ label, value, hint, mono }) => (
  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 p-4">
    <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    <div className={`text-lg font-semibold text-slate-900 dark:text-white mt-1 ${mono ? 'font-mono' : ''}`}>{value}</div>
    {hint && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</div>}
  </div>
);

const calloutTones = {
  success: { icon: CheckCircle2, cls: 'bg-emerald-50 border-emerald-200 text-emerald-900', iconCls: 'text-emerald-600' },
  info: { icon: Info, cls: 'bg-sky-50 border-sky-200 text-sky-900', iconCls: 'text-sky-600' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-900', iconCls: 'text-amber-600' },
};

export const Callout: React.FC<{ tone?: keyof typeof calloutTones; children: React.ReactNode }> = ({ tone = 'info', children }) => {
  const { icon: Icon, cls, iconCls } = calloutTones[tone];
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${cls}`}>
      <Icon className={`w-5 h-5 shrink-0 ${iconCls}`} />
      <div>{children}</div>
    </div>
  );
};

export const DownloadButton: React.FC<{ spec: DocumentSpec; label?: string; variant?: 'primary' | 'secondary' | 'link' }> = ({
  spec,
  label = 'Download',
  variant = 'secondary',
}) => {
  const download = useDocumentDownload();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    await download(spec);
    setBusy(false);
  };
  const icon = busy ? (
    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70" />
  ) : (
    <Download className="w-4 h-4" />
  );
  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-campus-700 hover:text-campus-900 min-h-[44px] sm:min-h-0 disabled:opacity-60"
      >
        {icon} {label}
      </button>
    );
  }
  return (
    <button type="button" onClick={run} disabled={busy} className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}>
      {icon} {busy ? 'Preparing PDF…' : label}
    </button>
  );
};

export const FormActions: React.FC<{ note?: string; submitting: boolean; label: string; busyLabel?: string }> = ({
  note,
  submitting,
  label,
  busyLabel = 'Submitting…',
}) => (
  <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
    {note ? <span className="text-sm text-slate-500 dark:text-slate-400">{note}</span> : <span />}
    <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
      {submitting && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
      {submitting ? busyLabel : label}
    </button>
  </div>
);

/** Table that scrolls sideways on small screens instead of breaking the layout. */
export const ResponsiveTable: React.FC<{ headers: string[]; rows: React.ReactNode[][]; alignLast?: boolean }> = ({ headers, rows, alignLast }) => (
  <div className="-mx-4 sm:mx-0 overflow-x-auto">
    <table className="w-full min-w-[560px] text-sm text-left">
      <thead className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
        <tr>
          {headers.map((h, i) => (
            <th key={h} className={`px-4 py-2 font-medium ${alignLast && i === headers.length - 1 ? 'text-right' : ''}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, ri) => (
          <tr key={ri} className="transition-colors hover:bg-slate-50/80">
            {row.map((cell, ci) => (
              <td key={ci} className={`px-4 py-3 align-middle ${alignLast && ci === row.length - 1 ? 'text-right' : ''}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
