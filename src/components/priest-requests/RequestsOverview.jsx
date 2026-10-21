'use client';
import styles from './requests.module.css';
import { buttonClassName } from '@/components/ui/styles';


import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCheck, ClipboardList, Clock3, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { apiGet } from '@/services/axios';
import { REQUEST_TYPES, requestStatus } from './requestTypes';

export default function RequestsOverview() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);
  const generation = useRef({ value: 0 });
  const load = useCallback(async () => {
    const request = ++generation.current.value;
    setLoading(true);
    const records = await Promise.allSettled(REQUEST_TYPES.map(async type => {
      const response = await apiGet(type.endpoint);
      if (response.status !== 'success' || !Array.isArray(response.data)) throw new Error(response.message || 'Unable to load requests.');
      return response.data;
    }));
    if (request !== generation.current.value) return;
    setResults(Object.fromEntries(records.map((result, index) => [REQUEST_TYPES[index].id, result.status === 'fulfilled' ? { count: result.value.filter(record => requestStatus(record) === 'pending').length, urgent: result.value.filter(record => requestStatus(record) === 'pending' && record.is_urgent).length } : { error: true }])));
    setUpdated(new Date()); setLoading(false);
  }, []);
  useEffect(() => {
    const requests = generation.current;
    const initialFetch = setTimeout(load, 0);
    return () => { requests.value++; clearTimeout(initialFetch); };
  }, [load]);
  const values = Object.values(results);
  const failed = values.filter(item => item.error).length;
  const pending = values.reduce((sum, item) => sum + (item.count || 0), 0);
  const urgent = values.reduce((sum, item) => sum + (item.urgent || 0), 0);
  const awaiting = values.filter(item => item.count > 0).length;
  return <div data-testid="request-workspace" className={styles.workspace + " mx-auto max-w-7xl text-ink [&_button]:disabled:cursor-not-allowed [&_button]:disabled:opacity-50"}>
    <header data-testid="request-page-heading" className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight md:[&_h1]:text-4xl [&_h1+p]:mt-3 [&_h1+p]:max-w-2xl [&_h1+p]:text-sm [&_h1+p]:leading-7 [&_h1+p]:text-muted"><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase">CARE FOR YOUR COMMUNITY</p><h1>Parish requests</h1><p>See who needs your attention, then take a moment to review each request.</p></div><button data-testid="request-button" className={buttonClassName("secondary")} onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing…' : 'Refresh requests'}</button></header>
    <section data-testid="request-summary" className="mb-7 grid grid-cols-1 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0 [&>div]:flex [&>div]:items-center [&>div]:gap-4 [&>div]:p-6 [&_strong]:text-3xl [&_strong]:font-semibold [&_strong]:tracking-tight [&_small]:text-base [&_small]:font-normal [&_small]:text-muted [&_p]:mt-1 [&_p]:text-xs [&_p]:text-muted" aria-label="Request summary" aria-busy={loading}>
      <div><span data-testid="request-summary-icon" className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink"><Clock3 size={22} /></span><div><strong>{loading && !updated ? '—' : `${pending}${failed ? '+' : ''}`}</strong><p>Awaiting your review</p></div></div>
      <div><span data-testid="request-summary-icon" className="grid size-12 shrink-0 place-items-center rounded-xl bg-soft text-ink"><AlertTriangle size={22} /></span><div><strong>{loading && !updated ? '—' : `${urgent}${failed ? '+' : ''}`}</strong><p>Marked urgent</p></div></div>
      <div><span data-testid="request-summary-icon" className="grid size-12 shrink-0 place-items-center rounded-xl bg-soft text-ink"><ClipboardList size={22} /></span><div><strong>{loading && !updated ? '—' : awaiting}<small> / {REQUEST_TYPES.length}</small></strong><p>Categories with pending requests</p></div></div>
    </section>
    {failed > 0 && <div data-testid="request-alert" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-soft p-4 text-sm leading-7 text-ink [&>svg]:shrink-0 [&>p]:flex-1 [&>button]:min-h-11 [&>button]:text-xs [&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4" role="alert"><AlertCircle size={20} /><p>{failed === REQUEST_TYPES.length ? 'Requests could not be loaded. Check your connection or priest session, then refresh.' : `${failed} ${failed === 1 ? 'category could' : 'categories could'} not be loaded. The totals above include available categories only.`}</p><button onClick={load} disabled={loading}>Try again</button></div>}
    {!loading && !failed && !pending && <div data-testid="request-success" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-soft p-4 text-sm leading-7 text-ink [&>svg]:shrink-0 [&_strong]:block [&_strong]:font-semibold [&>p]:flex-1 [&>button]:inline-flex [&>button]:min-h-11 [&>button]:items-center [&>button]:gap-2 [&>button]:text-xs [&>button]:font-semibold" role="status"><CheckCheck size={23} /><div><strong>You’re all caught up.</strong><p>There are no requests awaiting review. You can still open any category below.</p></div></div>}
    <div data-testid="request-section-heading" className="mt-9 mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end [&_h2]:font-serif [&_h2]:text-2xl [&_p]:mt-2 [&_p]:text-sm [&_p]:text-muted [&>span]:text-xs [&>span]:whitespace-nowrap [&>span]:text-muted"><div><h2>Choose a request category</h2><p>Open a category to view details and send your response.</p></div>{updated && <span>Updated {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(updated)} IST</span>}</div>
    <div data-testid="request-category-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{REQUEST_TYPES.map(type => {
      const Icon = type.icon;
      const result = results[type.id];
      return <Link data-testid="request-category-card" key={type.id} href={`/priest_dashboard/requests/${type.id}`} className={`flex min-w-0 flex-col rounded-2xl border border-ink/10 bg-white px-6 pt-6 shadow-sm transition-shadow hover:border-accent/50 hover:shadow-md [&>h3]:mb-3 [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:leading-tight [&>p]:flex-1 [&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted ${result?.count > 0 ? "border-t-4 border-t-accent" : ''}`}><div data-testid="request-category-top" className="mb-5 flex items-center justify-between gap-2"><span data-testid="request-type-icon" className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink"><Icon size={24} strokeWidth={1.5} /></span>{result?.urgent > 0 && <span data-testid="request-status" className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap capitalize border-line bg-soft text-ink"><AlertTriangle size={13} />{result.urgent} urgent</span>}</div><h3>{type.title}</h3><p>{type.description}</p><div data-testid="request-category-count" className="flex flex-wrap items-baseline gap-2 py-6 text-xs text-muted [&>strong]:text-3xl [&>strong]:font-semibold [&>strong]:text-ink">{loading && !updated ? <span data-testid="request-count-skeleton" className="block h-8 w-20 animate-pulse rounded-lg bg-soft motion-reduce:animate-none" aria-label="Loading count" /> : result?.error ? <span data-testid="request-count-error" className="inline-flex items-center gap-2 text-ink"><AlertCircle size={16} />Count unavailable</span> : <><strong>{result?.count ?? 0}</strong><span>{result?.count ? 'awaiting review' : 'pending requests'}</span></>}</div><div data-testid="request-category-footer" className="flex min-h-16 items-center justify-between gap-3 border-t border-ink/10 text-xs font-semibold [&>svg]:text-accent-ink"><span>{result?.count ? 'Review requests' : 'Open requests'}</span><ArrowRight size={18} /></div></Link>;
    })}</div>
  </div>;
}
