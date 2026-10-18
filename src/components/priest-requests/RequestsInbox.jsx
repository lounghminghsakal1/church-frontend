'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, AlertCircle, AlertTriangle, Check, CheckCheck, ChevronDown, ChevronUp, Clock3, FileText, Inbox, Loader2, MessageSquare, Phone, RefreshCw, Search, UserRound, X } from 'lucide-react';
import { apiGet, apiPost } from '@/services/axios';
import { REQUEST_TYPES, requestDate, requestFields, requestMediaUrl, requestName, requestStatus } from './requestTypes';
import RequestDocumentDialog from './RequestDocumentDialog';
import { statusClasses, inputClasses, buttonClassName } from '@/components/ui/styles';

function StatusBadge({ status }) {
  const Icon = status === 'approved' ? Check : status === 'rejected' ? X : Clock3;
  return <span data-testid="request-status" className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap capitalize ${statusClasses[status] || statusClasses.inactive}`}><Icon size={13} />{status === 'pending' ? 'Awaiting review' : status}</span>;
}

function PhoneLink({ value }) {
  const number = String(value || '').replace(/[^\d+]/g, '');
  return number ? <a data-testid="request-phone" className="inline-flex w-fit items-center gap-2 py-1 text-sm text-ink/80 underline underline-offset-4" href={`tel:${number}`}><Phone size={14} />{value}</a> : null;
}

function RequestReview({ request, response, onChange, busy, onReview }) {
  const [decision, setDecision] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const confirmRef = useRef(null);
  useEffect(() => { if (decision) confirmRef.current?.focus(); }, [decision]);
  const prepare = value => {
    if (!response.trim()) { setError('Write a response so the parishioner knows the next step.'); inputRef.current?.focus(); return; }
    setError(''); setDecision(value);
  };
  const send = async () => {
    setError('');
    try { await onReview(decision, response.trim()); }
    catch (err) { setError(err.message || 'Your response could not be sent. Please try again.'); setDecision(''); inputRef.current?.focus(); }
  };
  return <section data-testid="request-review-panel" className="min-w-0 border-t border-ink/10 bg-soft p-5 md:p-7 xl:border-t-0 xl:border-l [&>label]:mb-2.5 [&>label]:flex [&>label]:items-center [&>label]:justify-between [&>label]:gap-2 [&>label]:text-sm [&>label]:font-semibold [&>label>span]:text-xs [&>label>span]:font-normal [&>label>span]:text-muted" aria-label="Your review"><div data-testid="request-panel-heading" className="mb-6 flex items-center gap-3 [&>span]:grid [&>span]:size-9 [&>span]:shrink-0 [&>span]:place-items-center [&>span]:rounded-xl [&>span]:bg-accent/10 [&>span]:text-accent-ink [&_h3]:text-base [&_h3]:font-semibold [&_p]:mt-1 [&_p]:text-xs [&_p]:text-muted"><span><MessageSquare size={18} /></span><div><h3>Your response</h3><p>Help the parishioner understand what happens next.</p></div></div>
    {requestStatus(request) !== 'pending' ? <div data-testid="request-sent-response" className="[&>p]:my-5 [&>p]:text-sm [&>p]:leading-8 [&>p]:whitespace-pre-wrap [&>p]:wrap-anywhere [&>span:last-child]:text-xs [&>span:last-child]:text-muted"><StatusBadge status={requestStatus(request)} /><p>{request.priest_response || 'No response recorded.'}</p><span>This request has been reviewed.</span></div> : <>
      <label htmlFor={`response-${request._id}`}>Message to the parishioner <span>Required</span></label>
      <textarea className={`${inputClasses} min-h-40 resize-y leading-7`} ref={inputRef} id={`response-${request._id}`} value={response} rows={5} onChange={event => { onChange(event.target.value); setError(''); setDecision(''); }} disabled={busy} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={`response-help-${request._id}${error ? ` response-error-${request._id}` : ''}`} placeholder="Include the agreed date, where to come, any documents needed, or the reason you cannot approve." />
      <p data-testid="request-help" id={`response-help-${request._id}`} className="mt-2.5 text-xs leading-7 text-muted">This message is shared with the parishioner when you send your decision.</p>
      {error && <p data-testid="request-field-error" id={`response-error-${request._id}`} className="mt-3 flex items-start gap-2 text-xs text-ink [&>svg]:mt-0.5 [&>svg]:shrink-0" role="alert"><AlertCircle size={16} />{error}</p>}
      {decision ? <div data-testid="request-confirm-decision" className={`mt-6 rounded-xl border p-4 [&>strong]:text-sm [&>strong]:font-semibold [&>p]:mt-2 [&>p]:mb-4 [&>p]:text-xs [&>p]:leading-7 [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2 [&_button]:flex-1 [&_button]:text-xs ${statusClasses[decision]}`}><strong>{decision === 'approved' ? 'Approve this request?' : 'Reject this request?'}</strong><p>Your response will be sent with the {decision === 'approved' ? 'approval' : 'rejection'}.</p><div><button data-testid="request-button" className={buttonClassName("secondary")} disabled={busy} onClick={() => { setDecision(''); inputRef.current?.focus(); }}>Go back</button><button data-testid="request-button" ref={confirmRef} className={buttonClassName(decision === 'approved' ? "primary" : "danger")} disabled={busy} onClick={send}>{busy ? <Loader2 size={16} className="animate-spin" /> : decision === 'approved' ? <Check size={16} /> : <X size={16} />}{busy ? 'Sending…' : decision === 'approved' ? 'Send approval' : 'Send rejection'}</button></div></div> : <div data-testid="request-review-actions" className="mt-6 flex flex-wrap gap-3 [&>button]:flex-1 [&>button]:text-xs"><button data-testid="request-button" className={buttonClassName("primary")} disabled={busy} onClick={() => prepare('approved')}><Check size={17} />Approve request</button><button data-testid="request-button" className={buttonClassName("reject")} disabled={busy} onClick={() => prepare('rejected')}><X size={17} />Reject request</button></div>}
    </>}
  </section>;
}

function RequestCard({ request, type, expanded, onToggle, busy, response, onResponseChange, onReview, onDocument }) {
  const Icon = type.icon;
  const name = requestName(request, type);
  const status = requestStatus(request);
  const familyCard = requestMediaUrl(request.user?.family_card_document?.file_path);
  const prayerImage = requestMediaUrl(request.mass_prayer_image?.file_path);
  const payment = request.payment;
  return <article data-testid="request-record" data-expanded={expanded} data-urgent={Boolean(request.is_urgent && status === 'pending')} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${expanded ? 'border-accent/50' : 'border-ink/10'} ${request.is_urgent && status === 'pending' ? "border-l-4 border-l-red-400" : ''}`}>
    <div data-testid="request-record-summary" className="flex flex-wrap items-center gap-4 p-5 xl:flex-nowrap xl:p-6 [&>button]:ml-auto [&>button]:text-xs max-sm:[&>button]:w-full max-sm:[&>button]:mt-1"><span data-testid="request-person-avatar" className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 font-serif text-xl text-accent-ink" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><div data-testid="request-record-identity" className="min-w-0 flex-1 basis-[calc(100%-70px)] xl:basis-auto [&_h2]:text-base [&_h2]:font-semibold [&_h2]:leading-relaxed [&_h2]:wrap-anywhere [&>p]:mt-1 [&>p]:flex [&>p]:flex-wrap [&>p]:items-center [&>p]:gap-1.5 [&>p]:text-xs [&>p]:leading-relaxed [&>p]:text-muted [&>p>svg]:shrink-0"><div data-testid="request-record-title" className="flex flex-wrap items-center gap-2.5"><h2>{name}</h2>{request.is_urgent && <span data-testid="request-status" className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap capitalize border-line bg-soft text-ink"><AlertTriangle size={13} />Urgent</span>}</div><p><UserRound size={14} /><span>From {request.user?.user_name || 'Parishioner'}</span>{request.createdAt && <span data-testid="request-submitted-date" className="hidden sm:inline"> · Submitted {requestDate(request.createdAt, true)}</span>}</p></div><div data-testid="request-record-date" className="flex min-w-0 basis-3/5 flex-col gap-1 sm:ml-14 sm:min-w-40 sm:flex-1 sm:basis-auto xl:ml-0 xl:flex-none [&>span]:text-xs [&>span]:text-muted [&>strong]:text-sm [&>strong]:font-medium [&>small]:text-[10px] [&>small]:text-muted"><span>{type.dateLabel || 'Submitted'}</span><strong>{requestDate(type.dateKey ? request[type.dateKey] : request.createdAt)}</strong><small>IST</small></div><StatusBadge status={status} /><button data-testid="request-button" className={buttonClassName(expanded ? "secondary" : "primary")} aria-expanded={expanded} aria-controls={`request-details-${request._id}`} onClick={onToggle} disabled={busy}>{expanded ? 'Close details' : status === 'pending' ? 'Review request' : 'View response'}{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></div>
    {expanded && <div data-testid="request-record-expanded" id={`request-details-${request._id}`} className="grid grid-cols-1 border-t border-ink/10 xl:grid-cols-[1.2fr_1fr]"><section data-testid="request-details-panel" className="min-w-0 p-5 md:p-7"><div data-testid="request-panel-heading" className="mb-6 flex items-center gap-3 [&>span]:grid [&>span]:size-9 [&>span]:shrink-0 [&>span]:place-items-center [&>span]:rounded-xl [&>span]:bg-accent/10 [&>span]:text-accent-ink [&_h3]:text-base [&_h3]:font-semibold [&_p]:mt-1 [&_p]:text-xs [&_p]:text-muted"><span><Icon size={18} /></span><div><h3>Request details</h3><p>{type.title} · All times in IST</p></div></div><div data-testid="request-requester" className="mb-6 flex flex-col items-start gap-1.5 rounded-xl border border-ink/10 bg-soft p-4 [&>strong]:text-base [&>strong]:font-medium"><span data-testid="request-detail-label" className="text-xs font-normal text-muted">Submitted by</span><strong>{request.user?.user_name || 'Not provided'}</strong><PhoneLink value={request.user?.user_mobile_number} /></div><dl data-testid="request-detail-grid" className="grid grid-cols-2 gap-x-5 gap-y-6 [&_dt]:text-xs [&_dt]:text-muted [&_dd]:mt-2 [&_dd]:flex [&_dd]:flex-col [&_dd]:items-start [&_dd]:text-sm [&_dd]:leading-7 [&_dd]:whitespace-pre-wrap [&_dd]:wrap-anywhere [&_dd]:text-ink">{requestFields(request, type).map(field => <div key={field.label} className={field.wide ? "col-span-full" : ''}><dt>{field.label}</dt><dd>{field.value !== field.phone && field.value}{field.secondary && <span data-testid="request-detail-secondary" className="text-xs text-muted">{field.secondary}</span>}{field.phone && <PhoneLink value={field.phone} />}</dd></div>)}</dl>
      {type.familyCard && <div data-testid="request-attachment" className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 p-4 [&>div]:min-w-28 [&>div]:flex-1 [&_strong]:text-sm [&_strong]:font-semibold [&_p]:mt-1 [&_p]:text-xs [&_p]:text-muted [&>button]:text-xs max-sm:[&>button]:w-full"><span data-testid="request-attachment-icon" className="shrink-0 text-accent-ink"><FileText size={22} /></span><div><strong>Family card</strong><p>{familyCard ? 'Supporting document from this family' : 'No family card document provided'}</p></div>{familyCard && <button data-testid="request-button" className={buttonClassName("secondary")} onClick={() => onDocument({ url: familyCard, label: `${name} — Family card`, kind: 'pdf' })}>View document <ArrowRight size={15} /></button>}</div>}
      {type.id === 'mass_prayers' && <><div data-testid="request-payment" className="mt-6 rounded-xl bg-soft p-5 [&>h4]:mb-3 [&>h4]:text-sm [&>h4]:font-semibold [&>dl]:flex [&>dl]:flex-wrap [&>dl]:gap-5 [&_dt]:text-xs [&_dt]:text-muted [&_dd]:mt-1.5 [&_dd]:text-sm [&_dd]:capitalize"><h4>Payment details</h4><dl><div><dt>Method</dt><dd>{payment?.payment_mode || 'Not provided'}</dd></div><div><dt>Amount</dt><dd>{payment?.amount != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount) : 'Not provided'}</dd></div>{payment?.payment_mode === 'online' && <div><dt>Payment status</dt><dd>{payment.payment_status || 'Not provided'}</dd></div>}</dl></div><div data-testid="request-attachment" className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 p-4 [&>div]:min-w-28 [&>div]:flex-1 [&_strong]:text-sm [&_strong]:font-semibold [&_p]:mt-1 [&_p]:text-xs [&_p]:text-muted [&>button]:text-xs max-sm:[&>button]:w-full"><span data-testid="request-attachment-icon" className="shrink-0 text-accent-ink"><FileText size={22} /></span><div><strong>Mass intention image</strong><p>{prayerImage ? 'Read the attached prayer intention' : 'No image provided'}</p></div>{prayerImage && <button data-testid="request-button" className={buttonClassName("secondary")} onClick={() => onDocument({ url: prayerImage, label: `${name} — Mass intention`, kind: 'image' })}>View image <ArrowRight size={15} /></button>}</div></>}
    </section><RequestReview request={request} response={response} onChange={onResponseChange} busy={busy} onReview={onReview} /></div>}
  </article>;
}

export default function RequestsInbox({ typeId }) {
  const type = REQUEST_TYPES.find(item => item.id === typeId);
  const [requests, setRequests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending');
  const [sort, setSort] = useState('oldest');
  const [activeId, setActiveId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [document, setDocument] = useState(null);
  const generation = useRef({ value: 0 });
  const lock = useRef(false);
  const listRef = useRef(null);
  const load = useCallback(async () => {
    const request = ++generation.current.value;
    setLoading(true); setError('');
    try {
      const response = await apiGet(type.endpoint);
      if (response.status !== 'success' || !Array.isArray(response.data)) throw new Error(response.message || 'Unable to load requests.');
      if (request !== generation.current.value) return;
      // Keep decisions made during this visit when the API returns only pending records.
      setRequests(previous => [...response.data, ...previous.filter(record => requestStatus(record) !== 'pending' && !response.data.some(current => current._id === record._id))]);
    } catch (err) { if (request === generation.current.value) setError(err.message || 'Unable to load requests.'); }
    finally { if (request === generation.current.value) setLoading(false); }
  }, [type.endpoint]);
  useEffect(() => {
    const current = generation.current;
    const initialFetch = setTimeout(load, 0);
    return () => { current.value++; clearTimeout(initialFetch); };
  }, [load]);
  const review = async (request, decision, responseText) => {
    if (lock.current) return;
    lock.current = true; setBusyId(request._id);
    try {
      const response = await apiPost(`${type.reviewEndpoint || type.endpoint}/${encodeURIComponent(request._id)}`, { status: decision, priest_response: responseText });
      if (response.status !== 'success') throw new Error(response.message || 'Your response could not be sent.');
      setRequests(previous => previous.map(record => record._id === request._id ? { ...record, status: decision, priest_response: responseText } : record));
      setDrafts(previous => { const next = { ...previous }; delete next[request._id]; return next; });
      setNotice({ id: request._id, message: `${requestName(request, type)} — request ${decision}. Your response has been sent.` });
      setActiveId(null);
      listRef.current?.focus({ preventScroll: true });
    } finally { lock.current = false; setBusyId(null); }
  };
  const pending = requests.filter(request => requestStatus(request) === 'pending').length;
  const reviewed = requests.length - pending;
  const query = search.trim().toLowerCase();
  const filtered = requests.filter(request => {
    const matchesStatus = filter === 'all' || (filter === 'pending' ? requestStatus(request) === 'pending' : requestStatus(request) !== 'pending');
    const searchable = [requestName(request, type), request.user?.user_name, request.user?.user_mobile_number, request._id, ...requestFields(request, type).flatMap(field => [field.value, field.secondary, field.phone])].filter(Boolean).join(' ').toLowerCase();
    return matchesStatus && (!query || searchable.includes(query));
  }).sort((a, b) => {
    const urgency = Number(Boolean(b.is_urgent) && requestStatus(b) === 'pending') - Number(Boolean(a.is_urgent) && requestStatus(a) === 'pending');
    if (urgency) return urgency;
    const dateA = new Date((sort === 'preferred' ? a[type.dateKey] : a.createdAt) || 0).getTime() || 0;
    const dateB = new Date((sort === 'preferred' ? b[type.dateKey] : b.createdAt) || 0).getTime() || 0;
    return sort === 'newest' ? dateB - dateA : dateA - dateB;
  });
  return <div data-testid="request-workspace" className="mx-auto max-w-7xl text-ink [&_button]:disabled:cursor-not-allowed [&_button]:disabled:opacity-50">
    <Link data-testid="request-back" href="/priest_dashboard/requests" className="mb-3 inline-flex min-h-11 items-center gap-2 text-xs text-muted hover:text-ink"><ArrowLeft size={16} />All parish requests</Link>
    <header data-testid="request-page-heading" className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight md:[&_h1]:text-4xl [&_h1+p]:mt-3 [&_h1+p]:max-w-2xl [&_h1+p]:text-sm [&_h1+p]:leading-7 [&_h1+p]:text-muted"><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase">PARISH REQUESTS</p><h1>{type.title}</h1><p>Read the details, write a response, and send your decision.</p></div><button data-testid="request-button" className={buttonClassName("secondary")} disabled={loading || Boolean(busyId)} onClick={load}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing…' : 'Refresh'}</button></header>
    <div data-testid="request-inbox-intro" className="mb-6 flex flex-wrap items-center gap-3 [&>p]:text-xs [&>p]:text-muted"><span data-testid="request-status" className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap capitalize border-line bg-soft text-ink"><Clock3 size={14} />{pending} awaiting review</span><p>Urgent requests appear first. All dates and times are in IST.</p></div>
    {error && <div data-testid="request-alert" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-soft p-4 text-sm leading-7 text-ink [&>svg]:shrink-0 [&>p]:flex-1 [&>button]:min-h-11 [&>button]:text-xs [&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4" role="alert"><AlertCircle size={20} /><p>{error}</p><button onClick={load} disabled={loading || Boolean(busyId)}>Try again</button></div>}
    {notice && <div data-testid="request-success" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-soft p-4 text-sm leading-7 text-ink [&>svg]:shrink-0 [&_strong]:block [&_strong]:font-semibold [&>p]:flex-1 [&>button]:inline-flex [&>button]:min-h-11 [&>button]:items-center [&>button]:gap-2 [&>button]:text-xs [&>button]:font-semibold" role="status"><CheckCheck size={22} /><p>{notice.message}</p><button onClick={() => { setFilter('reviewed'); setSearch(''); setActiveId(notice.id); }}>View response <ArrowRight size={15} /></button><button data-testid="request-icon-button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink transition-colors hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setNotice(null)} aria-label="Dismiss confirmation"><X size={17} /></button></div>}
    <div data-testid="request-inbox-toolbar" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-3 shadow-sm md:p-5"><div data-testid="request-filter-tabs" className="flex w-full flex-wrap gap-1 rounded-xl bg-soft p-1 sm:w-auto [&>button]:flex [&>button]:min-h-11 [&>button]:flex-1 [&>button]:items-center [&>button]:justify-center [&>button]:gap-2 [&>button]:rounded-lg [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs [&>button]:text-muted [&>button[aria-pressed=true]]:bg-ink [&>button[aria-pressed=true]]:text-white [&_span]:min-w-5 [&_span]:rounded [&_span]:bg-ink/5 [&_span]:px-1.5 [&_span]:text-[10px] [&>button[aria-pressed=true]>span]:bg-white/15" role="group" aria-label="Filter requests">{[['pending', 'Pending', pending], ['reviewed', 'Reviewed', reviewed], ['all', 'All', requests.length]].map(([value, label, count]) => <button key={value} disabled={Boolean(busyId)} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{count}</span></button>)}</div><label data-testid="request-search" className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-ink/15 bg-white px-3 text-muted max-sm:w-full sm:max-w-sm [&>input]:min-h-12 [&>input]:w-full [&>input]:min-w-0 [&>input]:bg-transparent [&>input]:text-base [&>input]:text-ink [&>input]:outline-none sm:[&>input]:text-sm"><Search size={17} /><span className="sr-only">Search requests by name, phone, or details</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} disabled={Boolean(busyId)} placeholder="Search name, phone, or details…" /></label></div>
    <div data-testid="request-list-heading" className="my-4 flex items-center justify-between gap-4 text-xs text-muted [&>label]:flex [&>label]:items-center [&>label]:gap-2 [&_select]:min-h-11 [&_select]:max-w-36 [&_select]:bg-transparent [&_select]:px-2 [&_select]:text-xs [&_select]:text-ink"><p role="status">{loading && !requests.length ? 'Loading requests…' : `${filtered.length} ${filtered.length === 1 ? 'request' : 'requests'}${query ? ' matching your search' : ''}`}</p><label>Sort by<select value={sort} disabled={Boolean(busyId)} onChange={event => setSort(event.target.value)}><option value="oldest">Oldest first</option><option value="newest">Newest first</option>{type.dateKey && <option value="preferred">Preferred date</option>}</select></label></div>
    <div data-testid="request-record-list" ref={listRef} tabIndex={-1} className="flex flex-col gap-4 rounded-2xl" aria-label={`${type.title} requests`} aria-busy={loading}>
      {loading && !requests.length ? <div data-testid="request-loading" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center [&>svg]:text-accent-ink [&>p]:text-sm [&>p]:text-muted" role="status"><Loader2 size={26} className="animate-spin" /><p>Loading parish requests…</p></div> : filtered.length ? filtered.map(request => <RequestCard key={request._id} request={request} type={type} expanded={activeId === request._id} onToggle={() => setActiveId(activeId === request._id ? null : request._id)} busy={Boolean(busyId)} response={drafts[request._id] ?? request.priest_response ?? ''} onResponseChange={value => setDrafts(previous => ({ ...previous, [request._id]: value }))} onReview={(decision, text) => review(request, decision, text)} onDocument={setDocument} />) : !error && <div data-testid="request-empty" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center [&>svg]:text-accent-ink [&>h2]:font-serif [&>h2]:text-2xl [&>p]:max-w-md [&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted">{filter === 'pending' && !query ? <CheckCheck size={34} strokeWidth={1.4} /> : <Inbox size={34} strokeWidth={1.4} />}<h2>{query ? 'No matching requests' : filter === 'pending' ? 'You’re all caught up' : filter === 'reviewed' ? 'No reviewed requests yet' : 'No requests yet'}</h2><p>{query ? 'Try another name, phone number, or detail.' : filter === 'pending' ? 'There are no requests waiting for your review in this category.' : filter === 'reviewed' ? 'Requests you review during this visit will appear here.' : 'New parish requests will appear here when they are submitted.'}</p>{query && <button data-testid="request-button" className={buttonClassName("secondary")} onClick={() => setSearch('')}>Clear search</button>}</div>}
    </div>
    <p data-testid="request-footnote" className="mt-6 text-xs leading-7 text-muted">Reviewed requests include records loaded during this visit. Response drafts stay in this page while you review and refresh.</p>
    {document && <RequestDocumentDialog key={document.url} document={document} onClose={() => setDocument(null)} />}
  </div>;
}
