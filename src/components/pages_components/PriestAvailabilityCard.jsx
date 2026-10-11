import { UserRound, CalendarDays, Clock, ArrowUpRight, RefreshCw, ChevronDown, Check, CircleHelp } from 'lucide-react';

export default function PriestAvailabilityCard({ data, loading = false, error = false, now, onRetry, onRequestMeeting, preview = false }) {
  const available = data?.availability_status === 'available';
  const busy = data?.availability_status === 'not_available';
  const dateValue = available ? data?.available_until : busy ? data?.next_available : null;
  const date = dateValue ? new Date(dateValue) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const expired = validDate && now != null && date.getTime() <= now;
  const confirmed = !loading && !error && !expired;
  const tone = confirmed && available ? 'available' : confirmed && busy ? 'busy' : 'unknown';
  const status = loading ? 'Checking schedule…' : error ? 'Unable to check schedule' : expired ? 'Schedule needs an update' : available ? 'Available for visits' : busy ? 'Away at the moment' : 'Please confirm your visit';
  return (
    <article className={`visit-card visit-${tone} ${preview ? 'visit-preview' : ''}`} aria-label={preview ? 'Preview of parishioner availability card' : 'Parish priest availability'}>
      <div className="visit-identity"><span className="visit-avatar"><UserRound size={24} strokeWidth={1.5} /></span><div><p className="visit-eyebrow">{preview ? 'PARISHIONER PREVIEW' : 'YOUR PARISH PRIEST'}</p><h2>{data?.priest?.priest_name || 'Parish priest'}</h2></div>{onRetry && <button type="button" className="visit-refresh" disabled={loading} onClick={onRetry} aria-label="Refresh priest availability"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>}</div>
      <div className="visit-body"><div className="visit-state" role="status" aria-live="polite"><span className="visit-state-icon">{tone === 'available' ? <Check size={20} /> : tone === 'busy' ? <Clock size={20} /> : <CircleHelp size={20} />}</span><div><strong>{status}</strong><p>{loading ? 'Getting the latest parish update.' : error || expired ? 'Please check with the parish before visiting.' : available ? 'A time for conversation and guidance.' : busy ? 'You can still send a meeting request.' : 'The parish will confirm a suitable time.'}</p></div></div>
        {confirmed && validDate && <div className="visit-schedule"><CalendarDays size={20} strokeWidth={1.5} /><div><span>{available ? 'Available until' : 'Next available from'}</span><time dateTime={date.toISOString()}>{date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}<b>{date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true })}</b></time></div></div>}
        {onRequestMeeting && <button type="button" onClick={onRequestMeeting} className="visit-meeting">Request a meeting <ArrowUpRight size={17} /></button>}
      </div>
      {data?.notes && !loading && !error && <details className="visit-message"><summary>Message from the parish <ChevronDown size={16} /></summary><p>{data.notes}</p></details>}
      {!preview && <p className="visit-footnote">Meeting requests are confirmed by the priest. All times are in IST.</p>}
    </article>
  );
}
