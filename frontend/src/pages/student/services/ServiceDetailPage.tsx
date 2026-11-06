import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Clock, Building2, CalendarClock, CheckCircle2, FileText, Download, ChevronDown, ArrowRight, AlertTriangle, Zap, UserCheck, History } from 'lucide-react';
import { readActivity, type ActivityEntry } from '../../../utils/localStore';
import { useAuth } from '../../../context/AuthContext';
import { serviceRequestService } from '../../../services';
import type { ServiceRequest } from '../../../types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { CAMPUS_SERVICES, getServiceBySlug, type CampusService } from '../../../data/campusServices';
import { useDocumentDownload, type PanelProps } from './panels/shared';
import { Reveal } from '../../../components/ui/Reveal';

const PANELS: Record<string, React.LazyExoticComponent<React.FC<PanelProps>>> = {
  'id-card': lazy(() => import('./panels/IdCardPanel')),
  'profile-correction': lazy(() => import('./panels/ProfileCorrectionPanel')),
  'hall-ticket': lazy(() => import('./panels/HallTicketPanel')),
  'results-degree': lazy(() => import('./panels/ResultsPanel')),
  'fee-payments': lazy(() => import('./panels/FeePaymentsPanel')),
  scholarships: lazy(() => import('./panels/ScholarshipPanel')),
  'hall-allotment': lazy(() => import('./panels/HallAllotmentPanel')),
  wifi: lazy(() => import('./panels/WifiPanel')),
  'email-sso': lazy(() => import('./panels/EmailPanel')),
  'health-centre': lazy(() => import('./panels/HealthCentrePanel')),
  attendance: lazy(() => import('./panels/AttendancePanel')),
};

type TabId = 'apply' | 'overview' | 'documents' | 'history';

const TABS: { id: TabId; label: string }[] = [
  { id: 'apply', label: 'Apply' },
  { id: 'overview', label: 'How it works' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'My requests' },
];

const statusTone = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
};

const PanelFallback = () => (
  <div className="space-y-4" aria-busy="true">
    <div className="skeleton h-48" />
    <div className="skeleton h-64" />
  </div>
);

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);
  const { currentUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'apply') as TabId;
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);

  const loadRequests = useCallback(async () => {
    if (!currentUser || !service) return;
    const all = await serviceRequestService.getRequests({ studentId: currentUser.id });
    setRequests(all.filter((r) => r.serviceId === service.id));
  }, [currentUser, service]);

  useEffect(() => {
    setRequests(null);
    loadRequests();
  }, [loadRequests]);

  if (!service) return <Navigate to="/student/services" replace />;

  const Panel = PANELS[service.slug];
  const Icon = service.icon;
  const setTab = (id: TabId) => setParams(id === 'apply' ? {} : { tab: id }, { replace: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/student/services" className="hover:text-slate-900 dark:hover:text-white transition-colors">Services</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium truncate">{service.title}</span>
      </nav>

      {/* Hero */}
      <header className="card p-5 sm:p-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${service.tint}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold">{service.title}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusTone[service.status.tone]}`}>{service.status.label}</span>
              {service.readOnly ? null : service.mode === 'instant' ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <Zap className="w-3 h-3 text-amber-500" /> Instant
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <UserCheck className="w-3 h-3 text-campus-600" /> Staff approval
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-1">{service.summary}</p>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <div><dt className="sr-only">Office</dt><dd className="text-slate-700 dark:text-slate-300">{service.office}</dd></div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <div><dt className="sr-only">Turnaround</dt><dd className="text-slate-700 dark:text-slate-300">{service.turnaround}</dd></div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarClock className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <div><dt className="sr-only">Hours</dt><dd className="text-slate-700 dark:text-slate-300">{service.hours}</dd></div>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-14 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70">
        <div role="tablist" aria-label={`${service.title} sections`} className="flex gap-1 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {TABS.filter((t) => !service.readOnly || t.id === 'apply' || t.id === 'overview').map((t) => {
            const active = t.id === tab;
            const label = t.id === 'apply' && service.readOnly ? 'Overview' : t.id === 'history' && service.mode === 'instant' ? 'Activity' : t.label;
            const count = t.id === 'documents' ? service.requiredDocuments.length + service.issuedDocuments.length : t.id === 'history' && service.mode === 'request' ? requests?.length : undefined;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`relative shrink-0 px-3 sm:px-4 h-12 text-sm font-medium transition-colors duration-200 ${
                  active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 text-xs font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{count}</span>
                )}
                <span
                  className={`absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-campus-700 dark:bg-campus-400 transition-transform duration-300 ease-out origin-center ${active ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div key={tab} className="animate-fade-up" role="tabpanel">
        {tab === 'apply' && (
          <Suspense fallback={<PanelFallback />}>
            <Panel service={service} user={currentUser} onRequestCreated={loadRequests} />
          </Suspense>
        )}
        {tab === 'overview' && <OverviewTab service={service} />}
        {tab === 'documents' && <DocumentsTab service={service} />}
        {tab === 'history' &&
          (service.mode === 'instant' ? (
            <ActivityTab service={service} onApply={() => setTab('apply')} />
          ) : (
            <HistoryTab service={service} requests={requests} onApply={() => setTab('apply')} />
          ))}
      </div>

      <RelatedServices current={service} />
    </div>
  );
};

const OverviewTab: React.FC<{ service: CampusService }> = ({ service }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <section className="card p-5">
          <h2 className="text-base font-semibold">What you can do</h2>
          <ul className="mt-3 space-y-2">
            {service.canDo.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="text-base font-semibold">Steps</h2>
          <ol className="mt-4 space-y-4">
            {service.steps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-campus-950 dark:bg-campus-700 text-white text-sm font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 pt-1">{s}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <section className="lg:col-span-2 card p-5 h-fit">
        <h2 className="text-base font-semibold">Common questions</h2>
        <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
          {service.faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left text-sm font-medium text-slate-900 dark:text-white min-h-[44px]"
                >
                  {f.q}
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <p className="overflow-hidden text-sm text-slate-600 dark:text-slate-400 pb-3">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const DocumentsTab: React.FC<{ service: CampusService }> = ({ service }) => {
  const { currentUser } = useAuth();
  const download = useDocumentDownload();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="card p-5">
        <h2 className="text-base font-semibold">What you need</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Keep these ready before you apply.</p>
        <ul className="mt-4 space-y-3">
          {service.requiredDocuments.map((d) => (
            <li key={d.name} className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{d.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="card p-5">
        <h2 className="text-base font-semibold">Your documents</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Issued by {service.office}.</p>
        {service.issuedDocuments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4">
            Nothing issued yet. Documents appear here once a request is completed.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {service.issuedDocuments.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="w-10 h-10 rounded-lg bg-campus-50 dark:bg-campus-950/50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-campus-700 dark:text-campus-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{d.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => download(d.build(currentUser))}
                  className="p-2.5 rounded-lg text-slate-500 hover:text-campus-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={`Download ${d.name}`}
                >
                  <Download className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const HistoryTab: React.FC<{ service: CampusService; requests: ServiceRequest[] | null; onApply: () => void }> = ({ service, requests, onApply }) => {
  if (requests === null) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}
      </div>
    );
  }
  if (requests.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <h2 className="text-base font-semibold mt-3">No requests yet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Requests you make for {service.title.toLowerCase()} will show here with their status.</p>
        <button type="button" onClick={onApply} className="btn-primary mt-4">
          {service.actionLabel} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <ul className="card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
      {requests.map((r) => (
        <li key={r.id}>
          <Link to={`/student/requests/${r.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50/80 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{r.requestNumber}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </li>
      ))}
    </ul>
  );
};

const ActivityTab: React.FC<{ service: CampusService; onApply: () => void }> = ({ service, onApply }) => {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => readActivity(service.slug));
  useEffect(() => {
    const refresh = () => setEntries(readActivity(service.slug));
    refresh();
    window.addEventListener('amu-activity', refresh);
    return () => window.removeEventListener('amu-activity', refresh);
  }, [service.slug]);

  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <h2 className="text-base font-semibold mt-3">Nothing changed yet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Changes here apply instantly and do not create a request. Each one is listed here.
        </p>
        <button type="button" onClick={onApply} className="btn-primary mt-4">
          {service.actionLabel} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <ol className="card p-5 space-y-0">
      {entries.map((e, i) => (
        <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < entries.length - 1 && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />}
          <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 dark:text-white">{e.title}</div>
            {e.detail && <div className="text-sm text-slate-500 dark:text-slate-400">{e.detail}</div>}
            <div className="text-xs text-slate-400 mt-0.5">
              {new Date(e.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
};

const RelatedServices: React.FC<{ current: CampusService }> = ({ current }) => {
  const related = useMemo(() => CAMPUS_SERVICES.filter((s) => s.group === current.group && s.id !== current.id).slice(0, 3), [current]);
  if (related.length === 0) return null;
  return (
    <section className="pt-4">
      <h2 className="text-base font-semibold mb-3">Related services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map((s, i) => (
          <Reveal key={s.id} delay={i * 60}>
            <Link to={`/student/services/${s.slug}`} className="card card-hover p-4 flex items-center gap-3 group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.tint}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">{s.title}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        Something went wrong with this service?{' '}
        <Link to="/student/complaints/new" className="font-medium text-campus-700 hover:underline">File a grievance</Link>
      </p>
    </section>
  );
};

export default ServiceDetailPage;
