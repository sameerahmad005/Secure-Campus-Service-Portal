import React, { useState } from 'react';
import { Section, FormActions, DownloadButton, useServiceSubmit, type PanelProps } from './shared';

const HallAllotmentPanel: React.FC<PanelProps> = ({ service, user, onRequestCreated }) => {
  const { submit, submitting } = useServiceSubmit(service, user, onRequestCreated);
  const [action, setAction] = useState('Room swap or transfer');
  const [reason, setReason] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit(
      { requestType: action, currentRoom: 'Sir Syed Hall (North), Wing B, Room 48, Bed B', reason },
      'Request sent to the Provost Office'
    );
    if (ok) setReason('');
  };

  return (
    <div className="space-y-6">
      <Section
        title="Sir Syed Hall (North), Wing B, Room 48, Bed B"
        description="Session 2026–27"
        action={<DownloadButton spec={service.issuedDocuments[0].build(user)} label="Allotment letter" />}
      >
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><dt className="text-slate-500 dark:text-slate-400">Roommate</dt><dd className="font-medium text-slate-900 dark:text-white mt-0.5">Zaid Farooqui</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Dining hall</dt><dd className="font-medium text-slate-900 dark:text-white mt-0.5">Mess Hall 1</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Warden</dt><dd className="font-medium text-slate-900 dark:text-white mt-0.5">Dr. Salman Akhtar</dd></div>
          <div><dt className="text-slate-500 dark:text-slate-400">Hall dues</dt><dd className="font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">None</dd></div>
        </dl>
      </Section>

      <Section title="Make a request" description="Reviewed by the Provost Office within 2 working days.">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hall-action" className="field-label">Request</label>
              <select id="hall-action" value={action} onChange={(e) => setAction(e.target.value)} className="field">
                <option>Room swap or transfer</option>
                <option>Renew mess card</option>
                <option>Provost clearance</option>
                <option>Room repair or inspection</option>
              </select>
            </div>
            <div>
              <label htmlFor="hall-reason" className="field-label">Reason <span className="text-rose-600">*</span></label>
              <input id="hall-reason" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. medical grounds or mutual swap" className="field" />
            </div>
          </div>
          <FormActions submitting={submitting} label="Send to Provost Office" />
        </form>
      </Section>
    </div>
  );
};

export default HallAllotmentPanel;
