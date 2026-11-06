import React from 'react';
import { attendanceSummary, ATTENDANCE_THRESHOLD } from '../../../../data/attendance';
import { Section, Callout, DownloadButton, ResponsiveTable, type PanelProps } from './shared';

const HallTicketPanel: React.FC<PanelProps> = ({ service, user }) => {
  const doc = service.issuedDocuments[0].build(user);
  const att = attendanceSummary();
  return (
    <div className="space-y-6">
      {att.eligible ? (
        <Callout tone="success">
          <strong className="font-semibold">You are eligible.</strong> Attendance is {att.overall.toFixed(1)}% and the exam fee is paid.
        </Callout>
      ) : (
        <Callout tone="warning">
          <strong className="font-semibold">Attendance is {att.overall.toFixed(1)}%.</strong> You need {ATTENDANCE_THRESHOLD}% to sit the exams. Talk to your department.
        </Callout>
      )}
      <Section
        title="Odd semester 2026–27"
        description="Z.H. College of Engineering & Technology, Hall 2 · Desk 42"
        action={<DownloadButton spec={doc} variant="primary" label="Download admit card" />}
      >
        <ResponsiveTable
          headers={['Paper', 'Date', 'Time', 'Desk']}
          rows={(doc.table?.rows ?? []).map(([code, name, date]) => [
            <span><span className="font-mono text-slate-500 mr-2">{code}</span><span className="font-medium text-slate-900 dark:text-white">{name}</span></span>,
            <span className="font-mono">{date}</span>,
            <span className="font-mono">09:00–12:00</span>,
            <span className="font-mono">42</span>,
          ])}
        />
      </Section>
    </div>
  );
};

export default HallTicketPanel;
