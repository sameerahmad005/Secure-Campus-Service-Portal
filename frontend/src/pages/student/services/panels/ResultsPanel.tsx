import React from 'react';
import { FileText } from 'lucide-react';
import { Section, Stat, DownloadButton, useServiceSubmit, type PanelProps } from './shared';

const SEMESTERS = [
  { sem: 'I', session: 'Odd 2024–25', credits: 22, sgpa: '8.60' },
  { sem: 'II', session: 'Even 2025', credits: 24, sgpa: '8.90' },
  { sem: 'III', session: 'Odd 2025–26', credits: 22, sgpa: '8.75' },
  { sem: 'IV', session: 'Even 2026', credits: 24, sgpa: '9.10' },
];

const ResultsPanel: React.FC<PanelProps> = ({ service, user, onRequestCreated }) => {
  const { submit, submitting } = useServiceSubmit(service, user, onRequestCreated);
  const enrol = user?.studentId || '2023-CS-042';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="CGPA" value="8.84" hint="First division with distinction" mono />
        <Stat label="Credits earned" value="92 of 160" hint="CBCS curriculum" mono />
        <Stat label="DigiLocker" value="Synced" hint="ABC ID 894-112-901" />
      </div>

      <Section
        title="Semester results"
        action={
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit({ documentType: 'Consolidated transcript', copies: '1' }, 'Transcript ordered', 'It will be emailed to you within 5 working days.')}
            className="btn-secondary"
          >
            <FileText className="w-4 h-4" /> {submitting ? 'Ordering…' : 'Order transcript'}
          </button>
        }
      >
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 -my-2">
          {SEMESTERS.map((s, i) => (
            <li key={s.sem} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  Semester {s.sem} <span className="text-slate-500 font-normal">· {s.session}</span>
                  {i === SEMESTERS.length - 1 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Latest</span>}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{s.credits} credits · SGPA {s.sgpa}</div>
              </div>
              <DownloadButton
                variant="link"
                label="Grade card"
                spec={{
                  title: `Grade Card – Semester ${s.sem}`,
                  reference: `GC-${enrol}-S${s.sem}`,
                  issuedBy: 'Controller of Examinations',
                  holderName: user?.name || 'Tariq Ahmad',
                  rows: [
                    { label: 'Session', value: s.session },
                    { label: 'Credits', value: String(s.credits) },
                    { label: 'SGPA', value: s.sgpa },
                  ],
                }}
              />
            </li>
          ))}
        </ul>
      </Section>
      <p className="text-sm text-slate-500 dark:text-slate-400">You can apply for the degree after results for semester VIII are declared.</p>
    </div>
  );
};

export default ResultsPanel;
