'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Plus, RefreshCw, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { announcementRequest } from '@/services/announcements';
import { announcementVisibility, parishDate } from '@/utils/announcements';
import { statusClasses, buttonClassName } from '@/components/ui/styles';
import AnnouncementEditor from '@/components/announcements/AnnouncementEditor';
import AnnouncementImage from '@/components/announcements/AnnouncementImage';
import AnnouncementDialog from '@/components/announcements/AnnouncementDialog';

export default function PriestAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const lock = useRef(false);
  const generation = useRef({ value: 0 });
  const load = useCallback(async () => {
    const request = ++generation.current.value;
    setLoading(true);
    try {
      const data = await announcementRequest('/priest/announcements');
      if (request === generation.current.value) { setItems(data || []); setError(null); }
    } catch (err) { if (request === generation.current.value) setError(err); }
    finally { if (request === generation.current.value) setLoading(false); }
  }, []);
  useEffect(() => {
    const requests = generation.current;
    const initialFetch = setTimeout(load, 0);
    const tick = setInterval(() => setClock(Date.now()), 1000);
    return () => { requests.value++; clearTimeout(initialFetch); clearInterval(tick); };
  }, [load]);

  const mutate = async (item, remove = false) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null); setNotice('');
    try {
      const result = await announcementRequest(`/priest/announcements/${encodeURIComponent(item._id)}`, { method: remove ? 'DELETE' : 'PATCH', data: remove ? undefined : { status: item.status === 'active' ? 'inactive' : 'active' } });
      setItems(prev => remove ? prev.filter(record => record._id !== item._id) : prev.map(record => record._id === item._id ? result : record));
      setDeleting(null); setNotice(remove ? 'Announcement deleted.' : 'Visibility updated. The selected dates still apply.');
      load();
    } catch (err) {
      setError(err); setDeleting(null);
      if (err.status === 409) {
        setNotice('Another change was saved. The list has been reloaded; review it before trying again.');
        await load();
      }
    } finally { lock.current = false; setBusy(false); }
  };

  return <div data-testid="announcement-admin" className="mx-auto max-w-6xl [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-ink">
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-10"><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase">PARISH COMMUNICATIONS</p><h1>Announcements</h1><p data-testid="announcement-help" className="text-xs leading-relaxed text-muted">Create and manage your notices for the parish home page.</p></div><button className={buttonClassName("primary")} disabled={busy} onClick={() => setEditor({ item: null })}><Plus size={18} />New announcement</button></div>
    <div data-testid="announcement-toolbar" className="mb-5 flex items-center justify-between gap-4 text-xs text-muted"><p>{items.length} {items.length === 1 ? 'announcement' : 'announcements'} · All times in IST</p><button data-testid="announcement-text-button" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink underline underline-offset-4 disabled:opacity-50" disabled={loading || busy} onClick={load}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button></div>
    {notice && <p data-testid="announcement-notice" className="mb-5 rounded-xl border border-line bg-soft p-4 text-sm text-ink" role="status">{notice}</p>}
    {error && <div data-testid="announcement-error" className="mb-5 rounded-xl border border-line bg-soft p-4 text-sm text-ink wrap-anywhere [&_a]:ml-2 [&_a]:underline [&_button]:ml-2 [&_button]:underline" role="alert">{error.message} {error.auth ? <Link href="/priest_login">Priest sign in</Link> : <button onClick={load} disabled={loading}>Try again</button>}</div>}
    {loading && !items.length ? <div data-testid="announcement-state" className="flex flex-col items-center gap-4 rounded-2xl border border-ink/10 bg-white px-6 py-12 text-center [&>svg]:text-accent-ink [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:font-serif [&_h3]:text-2xl [&_p]:max-w-lg [&_p]:text-sm [&_p]:text-muted" role="status">Loading announcements…</div> : !items.length && !error ? <div data-testid="announcement-state" className="flex flex-col items-center gap-4 rounded-2xl border border-ink/10 bg-white px-6 py-12 text-center [&>svg]:text-accent-ink [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:font-serif [&_h3]:text-2xl [&_p]:max-w-lg [&_p]:text-sm [&_p]:text-muted"><Megaphone size={36} strokeWidth={1.3} /><h2>Your parish news starts here</h2><p>Create your first announcement for celebrations, schedules, or important parish updates.</p><button className={buttonClassName("primary")} onClick={() => setEditor({ item: null })}><Plus size={17} />Create announcement</button></div> : <div data-testid="announcement-admin-grid" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(item => {
      const visibility = announcementVisibility(item, clock);
      return <article data-testid="announcement-admin-card" key={item._id} className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm"><AnnouncementImage src={item.image_url} title={item.title} /><div data-testid="announcement-admin-copy" className="flex min-w-0 flex-1 flex-col items-start p-6 [&>h2]:mt-4 [&>h2]:mb-3 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:wrap-anywhere"><span data-testid="announcement-badge" className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${statusClasses[visibility.toLowerCase()]}`}>{visibility}</span><h2>{item.title}</h2><p data-testid="announcement-excerpt" className="line-clamp-3 text-sm leading-7 whitespace-pre-line wrap-anywhere text-muted">{item.description}</p><p data-testid="announcement-date" className="my-5 text-xs leading-7 text-muted">From {parishDate(item.start_date)}<br />Until {parishDate(item.end_date)} IST</p><div data-testid="announcement-card-actions" className="mt-auto flex w-full flex-wrap items-center gap-4 border-t border-ink/10 pt-4 [&>button]:inline-flex [&>button]:min-h-11 [&>button]:items-center [&>button]:gap-2 [&>button]:text-xs [&>button]:disabled:opacity-50"><button disabled={busy} onClick={() => { setNotice(''); setEditor({ item }); }}><Pencil size={15} />Edit</button><button disabled={busy} onClick={() => mutate(item)}>{item.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}{item.status === 'active' ? 'Deactivate' : 'Activate'}</button><button data-testid="announcement-delete" className="ml-auto p-2 text-ink" disabled={busy} onClick={() => setDeleting(item)} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button></div></div></article>;
    })}</div>}
    <p data-testid="announcement-help" className="text-xs leading-relaxed text-muted mt-5">Only your announcements appear here. Visibility labels use your device clock; the server controls when a notice is shown.</p>
    {editor && <AnnouncementEditor item={editor.item} onClose={() => setEditor(null)} onSaved={saved => { setItems(prev => editor.item ? prev.map(item => item._id === saved._id ? saved : item) : [saved, ...prev]); setEditor(null); setNotice('Announcement saved.'); load(); }} />}
    {deleting && <AnnouncementDialog title="Delete announcement?" onClose={() => setDeleting(null)} busy={busy}><p>“{deleting.title}” will be permanently deleted. This cannot be undone.</p><div data-testid="announcement-form-actions" className="mt-6 flex flex-wrap justify-end gap-3 max-sm:[&>button]:flex-1"><button className={buttonClassName("secondary")} disabled={busy} onClick={() => setDeleting(null)}>Keep announcement</button><button className={buttonClassName("primary")} disabled={busy} onClick={() => mutate(deleting, true)}>{busy ? 'Deleting…' : 'Delete permanently'}</button></div></AnnouncementDialog>}
  </div>;
}
