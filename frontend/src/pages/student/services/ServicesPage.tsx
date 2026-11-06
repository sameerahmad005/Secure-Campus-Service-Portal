import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, X } from 'lucide-react';
import { CAMPUS_SERVICES, SERVICE_GROUPS, matchesServiceQuery, type ServiceGroup } from '../../../data/campusServices';
import { Reveal } from '../../../components/ui/Reveal';

type Filter = 'ALL' | ServiceGroup;

export const ServicesPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const filter = (params.get('group') as Filter) || 'ALL';

  const setFilter = (f: Filter) => {
    const next = new URLSearchParams(params);
    if (f === 'ALL') next.delete('group');
    else next.set('group', f);
    setParams(next, { replace: true });
  };

  const results = useMemo(
    () => CAMPUS_SERVICES.filter((s) => (filter === 'ALL' || s.group === filter) && matchesServiceQuery(s, query)),
    [filter, query]
  );

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: CAMPUS_SERVICES.length },
    ...SERVICE_GROUPS.map((g) => ({ id: g.id, label: g.label, count: CAMPUS_SERVICES.filter((s) => s.group === g.id).length })),
  ];

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-semibold">Campus services</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Each service has its own page with the form, the documents you need and the status of your requests.
        </p>
      </header>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. wifi, fees, admit card"
            aria-label="Search services"
            className="field pl-9 pr-9 h-11"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {filters.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`shrink-0 h-11 md:h-9 px-3.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
                  active
                    ? 'bg-campus-950 dark:bg-campus-700 text-white border-transparent'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {f.label} <span className={`ml-1 font-mono text-xs ${active ? 'text-white/70' : 'text-slate-400'}`}>{f.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card p-10 text-center">
          <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h2 className="text-base font-semibold mt-3">No service matches “{query}”</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try “fee”, “wifi”, “room” or “admit card”.</p>
          <button type="button" onClick={() => { setQuery(''); setFilter('ALL'); }} className="btn-secondary mt-4">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 50}>
              <Link to={`/student/services/${s.slug}`} className="card card-hover group h-full p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105 ${s.tint}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-right">{s.status.label}</span>
                </div>
                <h2 className="text-base font-semibold mt-4">{s.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex-1">{s.summary}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400 truncate">{s.office}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-campus-700 dark:text-campus-400 shrink-0">
                    Open <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServicesPage;
