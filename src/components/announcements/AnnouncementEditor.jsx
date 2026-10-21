'use client';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { buttonClassName, inputClasses } from '@/components/ui/styles';


import { useRef, useState } from 'react';
import Link from 'next/link';
import { announcementRequest, uploadAnnouncementImage } from '@/services/announcements';
import { parishDate, parishInputDate, parishInputToISO, safeAnnouncementUrl } from '@/utils/announcements';
import AnnouncementDialog from './AnnouncementDialog';
import AnnouncementImage from './AnnouncementImage';

function formValues(item) {
  return {
    title: item?.title || '', description: item?.description || '',
    image_url: item?.image_url || '', link: item?.link || '', status: item?.status || 'active',
    start_date: parishInputDate(item?.start_date || new Date()),
    end_date: parishInputDate(item?.end_date || new Date(Date.now() + 7 * 86400000)),
  };
}

export default function AnnouncementEditor({ item, onClose, onSaved }) {
  const [baseline, setBaseline] = useState(item);
  const [fields, setFields] = useState(() => formValues(item));
  const [phase, setPhase] = useState('');
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [latest, setLatest] = useState(null);
  const lock = useRef(false);
  const busy = Boolean(phase);
  const change = event => setFields(prev => ({ ...prev, [event.target.name]: event.target.value }));

  const upload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || lock.current) return;
    lock.current = true; setPhase('Uploading image…'); setUploadError('');
    try {
      const result = await uploadAnnouncementImage(file);
      setFields(prev => ({ ...prev, image_url: result.url }));
    } catch (err) { setUploadError(err.message); }
    finally { lock.current = false; setPhase(''); }
  };

  const fetchLatest = async () => {
    setPhase('Loading latest version…');
    try { setLatest(await announcementRequest(`/priest/announcements/${encodeURIComponent(item._id)}`)); }
    catch (err) { setError(err); }
    finally { setPhase(''); }
  };

  const submit = async event => {
    event.preventDefault();
    if (lock.current || conflict) return;
    setError(null);
    let payload;
    try {
      payload = { ...fields, title: fields.title.trim(), description: fields.description.trim(), link: fields.link.trim(), start_date: parishInputToISO(fields.start_date), end_date: parishInputToISO(fields.end_date) };
      if (!payload.title || !payload.description) throw new Error('Enter a title and description.');
      if (new Date(payload.end_date) < new Date(payload.start_date)) throw new Error('The end must be on or after the start.');
      if (payload.link && !safeAnnouncementUrl(payload.link)) throw new Error('Enter an HTTP or HTTPS link.');
      if (payload.image_url && !safeAnnouncementUrl(payload.image_url)) throw new Error('Please upload a valid announcement image.');
      if (baseline) {
        const original = formValues(baseline);
        payload = Object.fromEntries(Object.entries(payload).filter(([key, value]) => {
          if (key === 'start_date' || key === 'end_date') return fields[key] !== original[key];
          return value !== (baseline[key] || (key === 'status' ? 'active' : ''));
        }));
        if (!Object.keys(payload).length) { onClose(); return; }
        if ('start_date' in payload || 'end_date' in payload) {
          payload.start_date = parishInputToISO(fields.start_date);
          payload.end_date = parishInputToISO(fields.end_date);
        }
      }
    } catch (err) { setError(err); return; }
    lock.current = true; setPhase('Saving announcement…');
    try {
      const saved = await announcementRequest(baseline ? `/priest/announcements/${encodeURIComponent(baseline._id)}` : '/priest/announcements', { method: baseline ? 'PATCH' : 'POST', data: payload });
      onSaved(saved);
    } catch (err) {
      setError(err);
      if (err.status === 409) {
        setConflict(true);
        try { setLatest(await announcementRequest(`/priest/announcements/${encodeURIComponent(baseline._id)}`)); }
        catch (reloadError) { setError(reloadError); }
      }
    } finally { lock.current = false; setPhase(''); }
  };

  return <AnnouncementDialog title={item ? 'Edit announcement' : 'New announcement'} onClose={onClose} busy={busy}>
    <form data-testid="announcement-form" onSubmit={submit} className="space-y-5 [&_fieldset]:flex [&_fieldset]:min-w-0 [&_fieldset]:flex-col [&_fieldset]:gap-5 [&_label]:flex [&_label]:flex-col [&_label]:gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-muted [&_label>span]:font-normal [&_label>span]:text-muted">
      <p data-testid="announcement-help" className="text-xs leading-relaxed text-muted">Share a notice with your parish. Active announcements appear during the dates you choose.</p>
      {error && <div data-testid="announcement-error" className="mb-5 rounded-xl border border-line bg-soft p-4 text-sm text-ink wrap-anywhere [&_a]:ml-2 [&_a]:underline [&_button]:ml-2 [&_button]:underline" role="alert">{error.message}{error.auth && <Link href="/priest_login">Priest sign in</Link>}</div>}
      {conflict && <div data-testid="announcement-conflict" className="mb-5 rounded-xl border border-line bg-soft p-4 text-sm text-ink [&_p]:my-3" role="alert"><strong>Another change was saved. Your edits are still here.</strong><p>Review the latest version before editing again.</p>{latest ? <><p><strong>{latest.title}</strong></p><p data-testid="announcement-full-description" className="mb-6 text-sm leading-8 whitespace-pre-wrap wrap-anywhere">{latest.description}</p><p>{latest.status} · {parishDate(latest.start_date)} – {parishDate(latest.end_date)} IST</p><button type="button" className={buttonClassName("secondary")} disabled={busy} onClick={() => { setBaseline(latest); setFields(formValues(latest)); setConflict(false); setError(null); }}>Replace my edits with latest version</button></> : <button type="button" onClick={fetchLatest} disabled={busy} className={buttonClassName("secondary")}>Reload latest version</button>}</div>}
      <fieldset disabled={busy || conflict}>
        <label>Title<input className={`${inputClasses} min-h-12`} name="title" value={fields.title} onChange={change} required placeholder="e.g. Parish feast celebration" /></label>
        <label>Description<textarea className={`${inputClasses} min-h-40 resize-y leading-7`} name="description" value={fields.description} onChange={change} rows={6} required placeholder="What would you like the parish to know?" /></label>
        <div data-testid="announcement-form-dates" className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label>Show from (IST)<DateTimePicker className={`${inputClasses} min-h-12`} type="datetime-local" label="Show from (IST)" step="1" name="start_date" required value={fields.start_date} onChange={change} /></label><label>Show until (IST)<DateTimePicker className={`${inputClasses} min-h-12`} type="datetime-local" label="Show until (IST)" min={fields.start_date} step="1" name="end_date" required value={fields.end_date} onChange={change} /></label></div>
        <p data-testid="announcement-help" className="text-xs leading-relaxed text-muted">All times use Asia/Kolkata (IST), including when you are travelling.</p>
        <label>Visibility<select className={`${inputClasses} min-h-12`} name="status" value={fields.status} onChange={change}><option value="active">Active — show within the selected dates</option><option value="inactive">Inactive — keep hidden</option></select></label>
        <label>More information link <span>(optional)</span><input className={`${inputClasses} min-h-12`} type="url" name="link" value={fields.link} onChange={change} placeholder="https://…" /></label>
        <div data-testid="announcement-upload" className="flex flex-col gap-3 rounded-xl border border-dashed border-ink/20 bg-soft p-5"><label>Announcement image <span>(optional)</span><input className="w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ink/5 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-ink" type="file" accept="image/png,image/jpeg" onChange={upload} /></label><p data-testid="announcement-help" className="text-xs leading-relaxed text-muted">PNG or JPEG, up to 5 MiB. Uploads are saved when selected.</p>{uploadError && <p data-testid="announcement-error" role="alert" className="mb-5 rounded-xl border border-line bg-soft p-4 text-sm text-ink wrap-anywhere [&_a]:ml-2 [&_a]:underline [&_button]:ml-2 [&_button]:underline">Image upload failed: {uploadError}</p>}{fields.image_url && <><AnnouncementImage src={fields.image_url} title={fields.title} /><button data-testid="announcement-text-button" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink underline underline-offset-4 disabled:opacity-50" type="button" onClick={() => setFields(prev => ({ ...prev, image_url: '' }))}>Remove image</button><p data-testid="announcement-help" className="text-xs leading-relaxed text-muted">Your uploaded image is retained if saving fails, so you can retry.</p></>}</div>
      </fieldset>
      <div data-testid="announcement-form-actions" className="mt-6 flex flex-wrap justify-end gap-3 max-sm:[&>button]:flex-1"><button type="button" className={buttonClassName("secondary")} disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className={buttonClassName("primary")} disabled={busy || conflict}>{phase || (item ? 'Save changes' : 'Create announcement')}</button></div>
      {busy && <p data-testid="announcement-help" role="status" className="text-xs leading-relaxed text-muted">{phase}</p>}
    </form>
  </AnnouncementDialog>;
}
