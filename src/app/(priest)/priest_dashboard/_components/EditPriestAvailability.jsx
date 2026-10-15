'use client';
import { buttonClassName, inputClasses } from '@/components/ui/styles';
import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/services/axios';
import { toast } from 'sonner';
import { Check, Clock, CircleHelp, Eye, Save, Loader2, RefreshCw } from 'lucide-react';
import PriestAvailabilityCard from '@/components/pages_components/PriestAvailabilityCard';
import Field from '@/components/common_components/FormField';
import { getAvailabilitySchedule } from '@/utils/priestAvailability';

const EMPTY = { availability_status: '', available_until: '', next_available: '', notes: '' };
const OPTIONS = [
  { value: 'available', title: 'Available', detail: 'Welcome parish visits', Icon: Check },
  { value: 'not_available', title: 'Away', detail: 'Share your return time', Icon: Clock },
  { value: 'not_set', title: 'Unconfirmed', detail: 'Ask visitors to check first', Icon: CircleHelp },
];
function indiaDateInput(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
const toIso = value => value ? new Date(`${value}:00+05:30`).toISOString() : null;
const toForm = data => ({ availability_status: data?.availability_status || 'not_set', available_until: indiaDateInput(data?.available_until), next_available: indiaDateInput(data?.next_available), notes: data?.notes || '' });

export default function EditPriestAvailability({ loggedInPriestId, priestName }) {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [errors, setErrors] = useState({});
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const publishedExpired = getAvailabilitySchedule(record, now).expired;
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!loggedInPriestId) return;
    let active = true;
    apiGet(`/priest_availability/${loggedInPriestId}`).then(response => {
      if (response?.status !== 'success' || !response.data?._id) throw new Error(response?.message || 'Your availability record is not available. Please contact the parish administrator.');
      if (active) { const next = toForm(response.data); setRecord(response.data); setForm(next); setSaved(next); setFetchError(''); }
    }).catch(error => { if (active) setFetchError(error.message || 'Unable to load your availability.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loggedInPriestId, retry]);
  const change = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value, ...(key === 'availability_status' && previous.availability_status !== value ? { available_until: '', next_available: '' } : {}) }));
    setErrors(previous => ({ ...previous, [key]: '' }));
    setSaveError('');
  };
  const publish = async event => {
    event.preventDefault();
    if (saving || !dirty || !record?._id) return;
    const validation = {};
    if (!OPTIONS.some(option => option.value === form.availability_status)) validation.availability_status = 'Choose your availability status.';
    const dateKey = form.availability_status === 'available' ? 'available_until' : form.availability_status === 'not_available' ? 'next_available' : null;
    if (dateKey && (!form[dateKey] || !Number.isFinite(new Date(`${form[dateKey]}:00+05:30`).getTime()) || new Date(`${form[dateKey]}:00+05:30`).getTime() <= Date.now())) validation[dateKey] = 'Choose a future date and time.';
    if (form.notes.length > 300) validation.notes = 'Keep your message within 300 characters.';
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setSaving(true);
    setSaveError('');
    try {
      const payload = { availability_status: form.availability_status, available_until: form.availability_status === 'available' ? toIso(form.available_until) : null, next_available: form.availability_status === 'not_available' ? toIso(form.next_available) : null, notes: form.notes.trim() };
      const response = await apiPut(`/priest_availability/${record._id}`, payload);
      if (response?.status !== 'success') throw new Error(response?.message || 'Unable to publish your availability.');
      const updated = { ...record, ...payload, ...(response.data?._id === record._id ? response.data : {}) };
      setRecord(updated); setForm(toForm(updated)); setSaved(toForm(updated));
      toast.success('Your availability has been published to the parish homepage.');
    } catch (error) { setSaveError(error.message || 'Unable to publish. Your changes have been kept.'); }
    finally { setSaving(false); }
  };
  if (!loggedInPriestId) return <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-12 text-center text-sm text-slate-500 [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:text-navy" role="status"><Clock size={24} /><p>Your priest account is needed to manage availability.</p></div>;
  if (loading) return <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-12 text-center text-sm text-slate-500 [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:text-navy" role="status"><Loader2 size={24} className="animate-spin" /><p>Loading your parish schedule…</p></div>;
  if (fetchError) return <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-12 text-center text-sm text-slate-500 [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:text-navy" role="alert"><CircleHelp size={26} /><h3>We couldn’t load your schedule</h3><p>{fetchError}</p><button type="button" className={buttonClassName("secondary")} onClick={() => { setLoading(true); setRetry(value => value + 1); }}><RefreshCw size={16} /> Try again</button></div>;
  const dateKey = form.availability_status === 'available' ? 'available_until' : form.availability_status === 'not_available' ? 'next_available' : null;
  const preview = { ...record, priest: { priest_name: priestName || record?.priest?.priest_name }, ...(dirty ? { availability_status: form.availability_status, available_until: form.available_until ? `${form.available_until}:00+05:30` : null, next_available: form.next_available ? `${form.next_available}:00+05:30` : null, notes: form.notes } : {}) };
  return <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.5fr_1fr]"><form className="overflow-hidden rounded-2xl border border-navy/10 bg-white [&_textarea]:resize-y" onSubmit={publish} noValidate aria-busy={saving}><div className="border-b border-navy/10 px-5 py-6 md:px-6 [&>h3]:font-serif [&>h3]:text-2xl [&>p]:mt-2 [&>p]:text-xs [&>p]:text-slate-500"><h3>Plan your parish visits</h3><p>Choose a status, set the time, and publish when you are ready.</p></div>
    {publishedExpired && <div className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 [&>svg]:mt-0.5 [&>svg]:shrink-0 [&_strong]:block [&_strong]:text-sm [&_strong]:font-semibold [&_p]:mt-1 [&_p]:text-xs [&_p]:leading-7" role="status"><Clock size={20} /><div><strong>Your published schedule has expired</strong><p>Parishioners see “Schedule needs an update.” Choose a future time or select Unconfirmed, then publish your availability.</p></div></div>}
    <fieldset disabled={saving} className="flex min-w-0 flex-col gap-6 p-5 md:p-6"><legend className="sr-only">Availability settings</legend><div><p className="mb-3 text-xs font-semibold">How should your parish find you?</p><div className="flex flex-col gap-2.5">{OPTIONS.map(({ value, title, detail, Icon }) => <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-navy/10 bg-slate-50 px-4 py-3 has-[:checked]:border-navy has-[:checked]:bg-navy/5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold [&>input]:sr-only [&>svg]:shrink-0 [&>svg]:text-slate-500 [&>span:not(:last-child)]:flex-1 [&_strong]:block [&_strong]:text-sm [&_strong]:font-semibold [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:text-slate-500" data-checked={form.availability_status === value} key={value}><input type="radio" name="priest-availability" value={value} checked={form.availability_status === value} onChange={() => change('availability_status', value)} /><Icon size={21} /><span><strong>{title}</strong><small>{detail}</small></span><span className="grid size-5 shrink-0 place-items-center rounded-full border border-navy/15 text-transparent [[data-checked=true]_&]:border-navy [[data-checked=true]_&]:bg-navy [[data-checked=true]_&]:text-white"><Check size={13} /></span></label>)}</div>{errors.availability_status && <p className="text-xs text-red-600" role="alert">{errors.availability_status}</p>}</div>
    {dateKey && <div className="[&>p]:mt-2 [&>p]:text-xs [&>p]:text-slate-500"><Field label={dateKey === 'available_until' ? 'Available until' : 'Next available from'} error={errors[dateKey]}><input type="datetime-local" className={inputClasses} value={form[dateKey]} min={indiaDateInput(now)} onChange={event => change(dateKey, event.target.value)} /></Field><p>Set the date and time in India Standard Time (IST).</p></div>}
    <div><Field label="Message for parishioners (optional)" error={errors.notes}><textarea className={inputClasses} rows={3} maxLength={300} value={form.notes} onChange={event => change('notes', event.target.value)} placeholder="For example: Please request a meeting before visiting the parish office." /></Field><div className="mt-2 flex justify-between gap-4 text-xs text-slate-500"><span>This message appears with your availability.</span><span>{form.notes.length}/300</span></div></div></fieldset>
    {saveError && <p data-testid="request-error" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mx-5 mb-5" role="alert">{saveError}</p>}
    <div className="border-t border-navy/10 bg-slate-50 p-5 md:px-6 [&>span]:mb-3 [&>span]:block [&>span]:text-xs [&>span]:text-slate-500 [&>div]:flex [&>div]:flex-col-reverse [&>div]:items-center [&>div]:gap-3 md:[&>div]:flex-row [&_button[type=submit]]:flex-1"><span role="status">{dirty ? 'You have unpublished changes' : publishedExpired ? 'Update your expired schedule before welcoming visits' : 'Your availability settings are published'}</span><div><button type="button" className="min-h-12 w-full text-xs text-slate-500 disabled:opacity-50 md:w-auto" disabled={!dirty || saving} onClick={() => { setForm(saved); setErrors({}); setSaveError(''); }}>Discard changes</button><button type="submit" className={buttonClassName("primary", "w-full")} disabled={!dirty || saving}>{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}{saving ? 'Publishing…' : 'Publish availability'}</button></div></div></form>
    <aside className="rounded-2xl border border-dashed border-navy/15 bg-slate-50 p-5"><div className="mb-5 flex items-center gap-2.5 [&>svg]:text-gold-dark [&_strong]:block [&_strong]:text-xs [&_strong]:font-semibold [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:text-slate-500"><Eye size={18} /><span><strong>What parishioners will see</strong><small>{dirty ? 'Preview of your unpublished changes' : 'Your currently published information'}</small></span></div><PriestAvailabilityCard data={preview} now={now} preview /><p className="mt-4 text-xs leading-7 text-slate-500">Changes become visible on the homepage after you publish.</p></aside></div>;
}
