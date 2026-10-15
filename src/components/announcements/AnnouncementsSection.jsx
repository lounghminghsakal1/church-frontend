'use client';
import { buttonClassName } from '@/components/ui/styles';


import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Megaphone } from 'lucide-react';
import { announcementRequest } from '@/services/announcements';
import { announcementVisibility, parishDate, safeAnnouncementUrl } from '@/utils/announcements';
import AnnouncementDialog from './AnnouncementDialog';
import AnnouncementImage from './AnnouncementImage';

function PublicAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [detail, setDetail] = useState(null);
  const [clock, setClock] = useState(() => Date.now());
  const generation = useRef({ value: 0 });
  const detailGeneration = useRef({ value: 0 });
  const load = useCallback(async () => {
    const request = ++generation.current.value;
    setLoading(true);
    try {
      const data = await announcementRequest('/user/announcements', { role: 'public' });
      if (generation.current.value !== request) return;
      setItems(data || []); setError(null); setClock(Date.now());
    } catch (err) { if (generation.current.value === request) { setError(err); setItems([]); } }
    finally { if (generation.current.value === request) setLoading(false); }
  }, []);
  useEffect(() => {
    const listRequests = generation.current;
    const detailRequests = detailGeneration.current;
    const initialFetch = setTimeout(load, 0);
    const refresh = () => { if (document.visibilityState === 'visible') load(); };
    const interval = setInterval(refresh, 60000);
    const tick = setInterval(() => setClock(Date.now()), 1000);
    window.addEventListener('focus', refresh);
    return () => { listRequests.value++; detailRequests.value++; clearTimeout(initialFetch); clearInterval(interval); clearInterval(tick); window.removeEventListener('focus', refresh); };
  }, [load]);
  const visible = items.filter(item => announcementVisibility(item, clock) === 'Visible');
  const currentIndex = visible.length ? index % visible.length : 0;
  const current = visible[currentIndex];
  const openDetail = async item => {
    const request = ++detailGeneration.current.value;
    setDetail({ loading: true });
    try {
      const data = await announcementRequest(`/user/announcements/${encodeURIComponent(item._id)}`, { role: 'public' });
      if (request === detailGeneration.current.value) setDetail({ item: data });
    } catch (err) {
      if (request !== detailGeneration.current.value) return;
      setDetail({ error: err.status === 404 ? 'This announcement is no longer available.' : err.message });
      load();
    }
  };
  const unavailable = detail?.item && (announcementVisibility(detail.item, clock) !== 'Visible' || (!error && !items.some(item => item._id === detail.item._id)));
  return <>
    <div data-testid="announcement-toolbar" className="mb-5 flex items-center justify-between gap-4 text-xs text-slate-500"><span>{visible.length} current {visible.length === 1 ? 'announcement' : 'announcements'}</span><button data-testid="announcement-text-button" className="inline-flex min-h-11 items-center gap-2 text-sm text-navy underline underline-offset-4 disabled:opacity-50" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button></div>
    {error ? <div data-testid="announcement-state" className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-12 text-center [&>svg]:text-gold-dark [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:font-serif [&_h3]:text-2xl [&_p]:max-w-lg [&_p]:text-sm [&_p]:text-slate-500" role="alert"><p>{error.message}</p><button className={buttonClassName("secondary")} onClick={load}>Try again</button></div> : current ?
      <div role="region" aria-roledescription="carousel" aria-label="Parish announcements">
        <article data-testid="announcement-feature" className="grid grid-cols-1 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm sm:grid-cols-2" aria-roledescription="slide" aria-label={`${currentIndex + 1} of ${visible.length}`}>
          <AnnouncementImage src={current.image_url} title={current.title} variant="feature" />
          <div data-testid="announcement-feature-copy" className="min-w-0 self-center p-6 md:p-10 [&>h3]:mb-5 [&>h3]:font-serif [&>h3]:text-3xl [&>h3]:leading-tight [&>h3]:wrap-anywhere md:[&>h3]:text-4xl" aria-live="polite"><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-gold-dark uppercase">FROM YOUR PARISH</p><h3>{current.title}</h3><p data-testid="announcement-excerpt" className="line-clamp-3 text-sm leading-7 whitespace-pre-line wrap-anywhere text-slate-500">{current.description}</p><p data-testid="announcement-date" className="my-5 text-xs leading-7 text-slate-500">Available until {parishDate(current.end_date)} IST</p><button onClick={() => openDetail(current)} className={buttonClassName("primary")}>Read announcement <ArrowUpRight size={17} /></button></div>
        </article>
        {visible.length > 1 && <div data-testid="announcement-carousel-controls" className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500"><button data-testid="announcement-icon-button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Previous announcement" onClick={() => setIndex((currentIndex + visible.length - 1) % visible.length)}><ChevronLeft size={21} /></button><div data-testid="announcement-dots" className="flex max-w-1/2 flex-wrap items-center justify-center [&>button]:grid [&>button]:h-11 [&>button]:w-7 [&>button]:place-items-center [&>button]:after:size-2 [&>button]:after:rounded-full [&>button]:after:bg-slate-300 [&>button]:after:content-[''] [&>button[aria-pressed=true]]:after:w-5 [&>button[aria-pressed=true]]:after:bg-navy">{visible.map((item, i) => <button key={item._id} aria-label={`Show announcement ${i + 1}: ${item.title}`} aria-pressed={i === currentIndex} onClick={() => setIndex(i)} />)}</div><span>{currentIndex + 1} / {visible.length}</span><button data-testid="announcement-icon-button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Next announcement" onClick={() => setIndex((currentIndex + 1) % visible.length)}><ChevronRight size={21} /></button></div>}
      </div> : <div data-testid="announcement-state" className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-12 text-center [&>svg]:text-gold-dark [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:font-serif [&_h3]:text-2xl [&_p]:max-w-lg [&_p]:text-sm [&_p]:text-slate-500" role="status"><Megaphone size={30} /><p>{loading ? 'Loading parish announcements…' : 'No current announcements. Check back for news from your parish.'}</p></div>}
    {detail && <AnnouncementDialog title={detail.item && !unavailable ? detail.item.title : 'Parish announcement'} onClose={() => { detailGeneration.current.value++; setDetail(null); }}>
      {detail.loading ? <p role="status">Loading announcement…</p> : detail.error || unavailable ? <div role="alert"><p>{detail.error || 'This announcement is no longer available.'}</p></div> : <>
        {detail.item.image_url && <AnnouncementImage src={detail.item.image_url} title={detail.item.title} variant="detail" />}
        <p data-testid="announcement-date" className="my-5 text-xs leading-7 text-slate-500">{parishDate(detail.item.start_date)} – {parishDate(detail.item.end_date)} IST</p>
        <p data-testid="announcement-full-description" className="mb-6 text-sm leading-8 whitespace-pre-wrap wrap-anywhere">{detail.item.description}</p>
        {safeAnnouncementUrl(detail.item.link) && <a href={detail.item.link} target="_blank" rel="noopener noreferrer" className={buttonClassName("primary")}>More information <ArrowUpRight size={17} /></a>}
      </>}
    </AnnouncementDialog>}
  </>;
}

export default function AnnouncementsSection() {
  return <section id="announcements" className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:tracking-tight md:[&_h2]:text-4xl pb-12"><div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-10"><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-gold-dark uppercase">THE PARISH NOTICEBOARD</p><h2>News for our community.</h2></div><p className="max-w-sm text-sm leading-8 text-slate-500">Parish celebrations, important notices, and moments to come together.</p></div>
    <PublicAnnouncements />
  </section>;
}
