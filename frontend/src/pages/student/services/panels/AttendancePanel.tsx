import React from 'react';
import { Link } from 'react-router-dom';
import { Section, Callout, Stat, ResponsiveTable, type PanelProps } from './shared';
import {
  ATTENDANCE_TERM,
  ATTENDANCE_THRESHOLD,
  SUBJECT_ATTENDANCE,
  attendanceSummary,
  classesCanMiss,
  classesNeeded,
  percent,
} from '../../../../data/attendance';
import { formatDate } from '../../../../data/studentProfile';

const Bar: React.FC<{ value: number }> = ({ value }) => {
  const short = value < ATTENDANCE_THRESHOLD;
  return (
    <div className="relative h-2 w-full min-w-[96px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${short ? 'bg-amber-500' : 'bg-emerald-500'}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
      <div className="absolute inset-y-0 w-px bg-slate-400 dark:bg-slate-500" style={{ left: `${ATTENDANCE_THRESHOLD}%` }} aria-hidden />
    </div>
  );
};

const AttendancePanel: React.FC<PanelProps> = () => {
  const s = attendanceSummary();
  const overallMiss = classesCanMiss(s.attended, s.held);
  const overallNeed = classesNeeded(s.attended, s.held);

  return (
    <div className="space-y-6">
      {s.eligible && s.shortSubjects.length === 0 ? (
        <Callout tone="success">
          <strong className="font-semibold">You are above {ATTENDANCE_THRESHOLD}% in every subject.</strong> You can sit all end-semester papers.
        </Callout>
      ) : (
        <Callout tone="warning">
          <strong className="font-semibold">
            {s.shortSubjects.length} subject{s.shortSubjects.length === 1 ? ' is' : 's are'} below {ATTENDANCE_THRESHOLD}%:
          </strong>{' '}
          {s.shortSubjects.map((x) => `${x.title} (${x.code})`).join(', ')}. Attend the next classes to catch up before the exams.
        </Callout>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Overall this semester" value={<span className={s.eligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700'}>{s.overall.toFixed(1)}%</span>} />
        <Stat label="Classes attended" value={`${s.attended} / ${s.held}`} mono />
        <Stat label="Classes missed" value={s.held - s.attended} mono />
        <Stat
          label={overallNeed ? 'Need to attend' : 'Can still miss'}
          value={overallNeed || overallMiss}
          hint={`and stay at ${ATTENDANCE_THRESHOLD}% overall`}
          mono
        />
      </div>

      <Section
        title={`${ATTENDANCE_TERM.semester} · ${ATTENDANCE_TERM.session}`}
        description={`Updated ${formatDate(ATTENDANCE_TERM.asOf)}. The line on each bar marks ${ATTENDANCE_THRESHOLD}%.`}
      >
        <ResponsiveTable
          headers={['Subject', 'Attended', 'Attendance', 'Status']}
          rows={SUBJECT_ATTENDANCE.map((x) => {
            const p = percent(x.attended, x.held);
            const need = classesNeeded(x.attended, x.held);
            const miss = classesCanMiss(x.attended, x.held);
            return [
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{x.title}</div>
                <div className="text-xs text-slate-500">
                  <span className="font-mono">{x.code}</span> · {x.type} · {x.faculty}
                </div>
              </div>,
              <span className="font-mono">{x.attended}/{x.held}</span>,
              <div className="flex items-center gap-3">
                <Bar value={p} />
                <span className={`font-mono text-sm w-14 text-right ${p < ATTENDANCE_THRESHOLD ? 'text-amber-700 dark:text-amber-400 font-semibold' : ''}`}>{p.toFixed(1)}%</span>
              </div>,
              need ? (
                <span className="text-amber-700 dark:text-amber-400 text-sm">Attend next {need}</span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 text-sm">Can miss {miss}</span>
              ),
            ];
          })}
        />
      </Section>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Marked absent for a class you attended?{' '}
        <Link to="/student/complaints/new" className="font-medium text-campus-700 dark:text-campus-400 hover:underline">
          File an attendance grievance
        </Link>{' '}
        with the date and subject.
      </p>
    </div>
  );
};

export default AttendancePanel;
