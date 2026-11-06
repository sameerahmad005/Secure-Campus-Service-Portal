import React from 'react';
import { FEE_RECEIPTS } from '../../../../data/campusServices';
import { Section, DownloadButton, ResponsiveTable, type PanelProps } from './shared';

const FeePaymentsPanel: React.FC<PanelProps> = ({ service, user }) => {
  const clearance = service.issuedDocuments[0].build(user);
  return (
    <div className="space-y-6">
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Balance for 2026–27</div>
          <div className="text-3xl font-semibold font-mono text-slate-900 dark:text-white mt-1">₹0.00</div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">No dues. Your clearance is valid.</p>
        </div>
        <DownloadButton spec={clearance} variant="primary" label="Clearance slip" />
      </div>

      <Section title="Payments and receipts" description="Paid through SBI e-Pay">
        <ResponsiveTable
          alignLast
          headers={['Receipt', 'Fee', 'Date', 'Amount', '']}
          rows={FEE_RECEIPTS.map((r) => [
            <span className="font-mono text-slate-600 dark:text-slate-300">{r.id}</span>,
            <span className="font-medium text-slate-900 dark:text-white">{r.head}</span>,
            <span className="text-slate-600 dark:text-slate-300">{r.date}</span>,
            <span className="font-mono font-medium">{r.amount}</span>,
            <DownloadButton
              variant="link"
              label="Receipt"
              spec={{
                title: 'Fee Receipt',
                reference: r.id,
                issuedBy: 'Finance and Accounts',
                holderName: user?.name || 'Tariq Ahmad',
                rows: [
                  { label: 'Fee', value: r.head },
                  { label: 'Paid on', value: r.date },
                  { label: 'Amount', value: r.amount },
                  { label: 'Mode', value: 'SBI e-Pay' },
                ],
              }}
            />,
          ])}
        />
      </Section>
    </div>
  );
};

export default FeePaymentsPanel;
