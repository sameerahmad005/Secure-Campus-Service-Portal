import React from 'react';
import { Section, useServiceSubmit, type PanelProps } from './shared';

const SCHEMES = [
  { name: 'Sir Syed Global Fellowship 2026–27', detail: 'Merit award for undergraduate research.', action: 'Apply' },
  { name: 'Railway concession certificate', detail: 'Discounted travel to your home station during vacations.', action: 'Request' },
  { name: 'Merit-cum-means scholarship', detail: 'For students with family income under ₹4.5 lakh a year.', action: 'Apply' },
];

const ScholarshipPanel: React.FC<PanelProps> = ({ service, user, onRequestCreated }) => {
  const { submit, submitting } = useServiceSubmit(service, user, onRequestCreated);

  return (
    <div className="space-y-6">
      <Section title="National Scholarship Portal" description="Central sector scheme">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><dt className="text-slate-500 dark:text-slate-400">Application ID</dt><dd className="font-mono font-medium text-slate-900 dark:text-white mt-0.5 break-all">NSP-2026-UP-884210</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Scheme</dt><dd className="font-medium text-slate-900 dark:text-white mt-0.5">Post-matric merit</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Payment</dt><dd className="font-medium text-slate-900 dark:text-white mt-0.5">Aadhaar-linked DBT</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Status</dt><dd className="font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">Level 2 approved</dd></div>
        </dl>
      </Section>

      <Section title="Open schemes" description="Run by the Dean of Students’ Welfare">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 -my-2">
          {SCHEMES.map((s) => (
            <li key={s.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{s.name}</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.detail}</p>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit({ scheme: s.name }, `${s.name} request sent to DSW`)}
                className="btn-secondary shrink-0"
              >
                {s.action}
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

export default ScholarshipPanel;
