import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService, serviceRequestService, noticeService } from '../../services';
import type { Complaint, ServiceRequest, Notice } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CAMPUS_SERVICES } from '../../data/campusServices';
import { Reveal } from '../../components/ui/Reveal';
import { ArrowRight, Pin, FileCheck2, FileText, Plus, Phone, ChevronRight, FolderOpen } from 'lucide-react';

const HELPLINES = [
  { label: 'Proctor control room', number: '+91 571 2700010' },
  { label: 'Computer Centre', number: '+91 571 2700920' },
  { label: 'Health Centre (24 hours)', number: '+91 571 2700192', urgent: true },
  { label: 'Student grievance cell', number: '+91 571 2700430' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const isOpenComplaint = (c: Complaint) => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status);
const isOpenRequest = (r: ServiceRequest) => !['FULFILLED', 'CLOSED', 'REJECTED'].includes(r.status);

export const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    Promise.all([
      complaintService.getComplaints({ studentId: currentUser.id }),
      serviceRequestService.getRequests({ studentId: currentUser.id }),
      noticeService.getNotices('STUDENTS'),
    ]).then(([cmps, reqs, nots]) => {
      if (cancelled) return;
      setComplaints(cmps);
      setRequests(reqs);
      setNotices(nots);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const pinned = notices.find((n) => n.isPinned) || notices[0];
  const firstName = (currentUser?.name || 'Tariq Ahmad').split(' ')[0];
  const openRequests = requests?.filter(isOpenRequest).length;
  const openComplaints = complaints?.filter(isOpenComplaint).length;

  const stats = [
    { label: 'Requests in progress', value: openRequests, to: '/student/requests' },
    { label: 'Open grievances', value: openComplaints, to: '/student/complaints' },
    { label: 'Fee balance', value: '₹0', to: '/student/services/fee-payments' },
    { label: 'CGPA', value: '8.84', to: '/student/services/results-degree' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section className="animate-fade-up">
        <p className="text-sm text-slate-500 dark:text-slate-400">{greeting()},</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-1">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold">{firstName}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              <span className="font-mono">{currentUser?.studentId || '2023-CS-042'}</span>
              <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
              {currentUser?.departmentName || 'Department of Computer Science'}
              <span className="hidden sm:inline">
                <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>Sir Syed Hall (North)
              </span>
            </p>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Link to="/student/complaints/new" className="btn-secondary flex-1 sm:flex-none">
              <Plus className="w-4 h-4" /> File grievance
            </Link>
            <Link to="/student/services" className="btn-primary flex-1 sm:flex-none">
              All services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <Link to={s.to} className="card card-hover block p-4 h-full">
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
              {s.value === undefined ? (
                <div className="skeleton h-7 w-12 mt-2" />
              ) : (
                <div className="text-2xl font-semibold font-mono text-slate-900 dark:text-white mt-1">{s.value}</div>
              )}
            </Link>
          </Reveal>
        ))}
      </section>

      {/* Pinned notice */}
      {pinned && (
        <Reveal>
          <Link
            to="/student/notices"
            className="group flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors hover:border-amber-300"
          >
            <Pin className="w-4 h-4 shrink-0 rotate-45 text-amber-600" />
            <span className="font-medium truncate min-w-0">{pinned.title}</span>
            <span className="hidden xl:inline truncate min-w-0 flex-1 text-amber-800/80">{pinned.content}</span>
            <ChevronRight className="w-4 h-4 ml-auto shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      )}

      {/* Services */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Services</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pick one to apply, download documents or check status.</p>
          </div>
          <Link to="/student/services" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-campus-700 dark:text-campus-400 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CAMPUS_SERVICES.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 40}>
              <Link to={`/student/services/${s.slug}`} className="card card-hover group h-full p-4 flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105 ${s.tint}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white leading-snug">{s.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.status.label}</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
        <div className="mt-3 flex gap-3">
          <Link to="/student/documents" className="inline-flex items-center gap-2 text-sm font-medium text-campus-700 dark:text-campus-400 hover:underline min-h-[44px]">
            <FolderOpen className="w-4 h-4" /> All my documents
          </Link>
        </div>
      </section>

      {/* Trackers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Tracker
          title="My requests"
          icon={FileCheck2}
          viewAll="/student/requests"
          loading={requests === null}
          empty="No service requests yet."
          items={(requests ?? []).slice(0, 4).map((r) => ({
            id: r.id,
            to: `/student/requests/${r.id}`,
            ref: r.requestNumber,
            title: r.serviceName,
            meta: r.departmentName,
            date: r.createdAt,
            badges: <StatusBadge status={r.status} />,
          }))}
        />
        <Tracker
          title="My grievances"
          icon={FileText}
          viewAll="/student/complaints"
          loading={complaints === null}
          empty="No grievances filed."
          items={(complaints ?? []).slice(0, 4).map((c) => ({
            id: c.id,
            to: `/student/complaints/${c.id}`,
            ref: c.ticketNumber,
            title: c.title,
            meta: c.departmentName,
            date: c.createdAt,
            badges: (
              <>
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </>
            ),
          }))}
        />
      </section>

      {/* Helplines */}
      <Reveal as="section" className="card p-5">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" /> Helplines
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Staffed 08:00 to 16:00 on working days.</p>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HELPLINES.map((h) => (
            <li key={h.label}>
              <a
                href={`tel:${h.number.replace(/\s/g, '')}`}
                className="block rounded-lg border border-slate-200 dark:border-slate-800 p-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">{h.label}</div>
                <div className={`font-mono text-sm font-medium mt-0.5 ${h.urgent ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{h.number}</div>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
};

interface TrackerItem {
  id: string;
  to: string;
  ref: string;
  title: string;
  meta: string;
  date: string;
  badges: React.ReactNode;
}

const Tracker: React.FC<{
  title: string;
  icon: React.ElementType;
  viewAll: string;
  loading: boolean;
  empty: string;
  items: TrackerItem[];
}> = ({ title, icon: Icon, viewAll, loading, empty, items }) => (
  <Reveal className="card overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" /> {title}
      </h2>
      <Link to={viewAll} className="text-sm font-medium text-campus-700 dark:text-campus-400 hover:underline">
        View all
      </Link>
    </div>
    {loading ? (
      <div className="p-4 space-y-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}
      </div>
    ) : items.length === 0 ? (
      <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">{empty}</p>
    ) : (
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((it) => (
          <li key={it.id}>
            <Link to={it.to} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{it.ref}</span>
                  {it.badges}
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate mt-1">{it.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {it.meta} · {new Date(it.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    )}
  </Reveal>
);

export default StudentDashboardPage;
