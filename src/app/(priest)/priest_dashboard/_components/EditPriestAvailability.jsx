"use client";
import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/services/axios';
import { toast } from 'sonner';
import { Check, Clock, CircleHelp, Eye, Save, Loader2, RefreshCw } from 'lucide-react';
import PriestAvailabilityCard from '@/components/pages_components/PriestAvailabilityCard';
import Field from '@/components/common_components/FormField';

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
      const updated = { ...record, ...payload };
      setRecord(updated); setForm(toForm(updated)); setSaved(toForm(updated));
      toast.success('Your availability has been published to the parish homepage.');
    } catch (error) { setSaveError(error.message || 'Unable to publish. Your changes have been kept.'); }
    finally { setSaving(false); }
  };
  if (!loggedInPriestId) return <div className="availability-editor-state" role="status"><Clock size={24} /><p>Your priest account is needed to manage availability.</p></div>;
  if (loading) return <div className="availability-editor-state" role="status"><Loader2 size={24} className="animate-spin" /><p>Loading your parish schedule…</p></div>;
  if (fetchError) return <div className="availability-editor-state" role="alert"><CircleHelp size={26} /><h3>We couldn’t load your schedule</h3><p>{fetchError}</p><button type="button" className="parish-button secondary" onClick={() => { setLoading(true); setRetry(value => value + 1); }}><RefreshCw size={16} /> Try again</button></div>;
  const dateKey = form.availability_status === 'available' ? 'available_until' : form.availability_status === 'not_available' ? 'next_available' : null;
  const preview = { priest: { priest_name: priestName }, availability_status: form.availability_status, available_until: form.available_until ? `${form.available_until}:00+05:30` : null, next_available: form.next_available ? `${form.next_available}:00+05:30` : null, notes: form.notes };
  return <div className="availability-workspace"><form className="availability-editor" onSubmit={publish} noValidate aria-busy={saving}><div className="availability-editor-heading"><h3>Plan your parish visits</h3><p>Choose a status, set the time, and publish when you are ready.</p></div><fieldset disabled={saving} className="availability-editor-fields"><legend className="sr-only">Availability settings</legend><div><p className="editor-label">How should your parish find you?</p><div className="availability-options">{OPTIONS.map(({ value, title, detail, Icon }) => <label className={`availability-choice choice-${value}`} key={value}><input type="radio" name="priest-availability" value={value} checked={form.availability_status === value} onChange={() => change('availability_status', value)} /><Icon size={21} /><span><strong>{title}</strong><small>{detail}</small></span><span className="choice-check"><Check size={13} /></span></label>)}</div>{errors.availability_status && <p className="auth-field-error" role="alert">{errors.availability_status}</p>}</div>
    {dateKey && <div className="availability-date-field"><Field label={dateKey === 'available_until' ? 'Available until' : 'Next available from'} error={errors[dateKey]}><input type="datetime-local" className="auth-input" value={form[dateKey]} min={indiaDateInput(now)} onChange={event => change(dateKey, event.target.value)} /></Field><p>Set the date and time in India Standard Time (IST).</p></div>}
    <div><Field label="Message for parishioners (optional)" error={errors.notes}><textarea className="auth-input" rows={3} maxLength={300} value={form.notes} onChange={event => change('notes', event.target.value)} placeholder="For example: Please request a meeting before visiting the parish office." /></Field><div className="editor-message-help"><span>This message appears with your availability.</span><span>{form.notes.length}/300</span></div></div></fieldset>
    {saveError && <p className="auth-request-error editor-save-error" role="alert">{saveError}</p>}
    <div className="availability-savebar"><span role="status">{dirty ? 'You have unpublished changes' : 'Your published schedule is up to date'}</span><div><button type="button" className="editor-discard" disabled={!dirty || saving} onClick={() => { setForm(saved); setErrors({}); setSaveError(''); }}>Discard changes</button><button type="submit" className="auth-submit" disabled={!dirty || saving}>{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}{saving ? 'Publishing…' : 'Publish availability'}</button></div></div></form>
    <aside className="availability-preview"><div className="availability-preview-heading"><Eye size={18} /><span><strong>What parishioners will see</strong><small>{dirty ? 'Preview of your unpublished changes' : 'Your currently published information'}</small></span></div><PriestAvailabilityCard data={preview} now={now} preview /><p className="availability-preview-note">Changes become visible on the homepage after you publish.</p></aside></div>;
}
