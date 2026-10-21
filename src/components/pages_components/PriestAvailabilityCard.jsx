import { buttonClassName } from '@/components/ui/styles';
import { UserRound, CalendarDays, Clock, ArrowUpRight, RefreshCw, ChevronDown, Check, CircleHelp } from 'lucide-react';

import { getAvailabilitySchedule } from '@/utils/priestAvailability';
import styles from './parish.module.css';

export default function PriestAvailabilityCard({ data, loading = false, error = false, now, onRetry, onRequestMeeting, preview = false, compact = false }) {
  const { available, busy, date, validDate, expired } = getAvailabilitySchedule(data, now);
  const confirmed = !loading && !error && !expired;
  const tone = confirmed && available ? 'available' : confirmed && busy ? 'busy' : 'unknown';
  const status = loading ? 'Checking schedule…' : error ? 'Unable to check schedule' : expired ? 'Schedule needs an update' : available ? 'Available for visits' : busy ? 'Away at the moment' : 'Please confirm your visit';
  if (compact) return (
    <article data-testid="priest-arrival" data-tone={tone} className={styles.availability} aria-label="Parish priest availability" aria-busy={loading}>
      <div className={styles.availabilityIdentity}>
        <span className={styles.availabilityIcon}><UserRound size={22} strokeWidth={1.5} /></span>
        <div><p className={styles.availabilityLabel}>PRIEST AVAILABILITY</p><h2>{data?.priest?.priest_name || 'Parish priest'}</h2></div>
      </div>
      <div className={styles.availabilityStatus} role="status" aria-live="polite">
        <span className={styles.statusLine}>{tone === 'available' ? <Check size={16} /> : tone === 'busy' ? <Clock size={16} /> : <CircleHelp size={16} />}<strong>{status}</strong></span>
        <p>{confirmed && validDate ? <>{available ? 'Until ' : 'Next available: '}<time dateTime={date.toISOString()}>{date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })} IST</time></> : loading ? 'Getting the latest parish update.' : 'Please confirm with the parish before visiting.'}</p>
      </div>
      <div className={styles.availabilityActions}>
        {onRetry && <button type="button" disabled={loading} onClick={onRetry} className={styles.availabilityRefresh} aria-label="Refresh priest availability"><RefreshCw size={16} className={loading ? 'animate-spin motion-reduce:animate-none' : ''} /></button>}
        {onRequestMeeting && <button type="button" onClick={onRequestMeeting} className={buttonClassName('primary', '', 'sm')}>Request a meeting <ArrowUpRight size={16} /></button>}
      </div>
      {data?.notes && !loading && !error && <details className={styles.availabilityNote}><summary>Message from the parish <ChevronDown size={14} /></summary><p>{data.notes}</p></details>}
    </article>
  );
  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${tone === 'available' ? 'border-line' : tone === 'busy' ? 'border-line' : 'border-ink/10'} ${preview ? 'md:[&>div:nth-child(2)]:flex-col md:[&>div:nth-child(2)]:items-stretch' : ''}`} aria-label={preview ? 'Preview of parishioner availability card' : 'Parish priest availability'}>
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:leading-snug [&_h2]:wrap-anywhere"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink"><UserRound size={24} strokeWidth={1.5} /></span><div><p className="mb-1 text-[9px] font-semibold tracking-widest text-accent-ink">{preview ? 'PARISHIONER PREVIEW' : 'YOUR PARISH PRIEST'}</p><h2>{data?.priest?.priest_name || 'Parish priest'}</h2></div>{onRetry && <button type="button" className="ml-auto grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-soft disabled:opacity-50" disabled={loading} onClick={onRetry} aria-label="Refresh priest availability"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>}</div>
      <div className="flex flex-col items-stretch gap-4 px-5 pb-5 md:flex-row md:flex-wrap md:items-center md:gap-6"><div className="flex flex-1 items-center gap-3 [&_strong]:text-base [&_strong]:font-semibold [&_strong]:text-ink [&_p]:mt-1 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-muted" role="status" aria-live="polite"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-soft text-muted">{tone === 'available' ? <Check size={20} /> : tone === 'busy' ? <Clock size={20} /> : <CircleHelp size={20} />}</span><div><strong>{status}</strong><p>{loading ? 'Getting the latest parish update.' : error || expired ? 'Please check with the parish before visiting.' : available ? 'A time for conversation and guidance.' : busy ? 'You can still send a meeting request.' : 'The parish will confirm a suitable time.'}</p></div></div>
        {confirmed && validDate && <div className="flex items-center gap-2.5 rounded-xl bg-soft px-3.5 py-3 text-accent-ink md:rounded-none md:border-l md:border-ink/10 md:bg-transparent md:pl-5 [&>div]:w-full [&_span]:block [&_span]:text-xs [&_span]:text-muted [&_time]:mt-1 [&_time]:flex [&_time]:items-baseline [&_time]:justify-between [&_time]:gap-3 [&_time]:font-serif [&_time]:text-2xl [&_time]:text-ink [&_b]:font-sans [&_b]:text-sm [&_b]:font-medium [&_b]:text-muted"><CalendarDays size={20} strokeWidth={1.5} /><div><span>{available ? 'Available until' : 'Next available from'}</span><time dateTime={date.toISOString()}>{date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}<b>{date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true })}</b></time></div></div>}
        {onRequestMeeting && <button type="button" onClick={onRequestMeeting} className={buttonClassName("primary", "whitespace-nowrap")}>Request a meeting <ArrowUpRight size={17} /></button>}
      </div>
      {data?.notes && !loading && !error && <details className="group border-t border-ink/10 px-5 [&_summary]:flex [&_summary]:min-h-11 [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:items-center [&_summary]:justify-between [&_summary]:text-xs [&_summary]:text-muted [&_summary::-webkit-details-marker]:hidden [&_p]:pb-4 [&_p]:text-sm [&_p]:leading-7 [&_p]:wrap-anywhere [&_p]:text-muted [&[open]_svg]:rotate-180"><summary>Message from the parish <ChevronDown size={16} /></summary><p>{data.notes}</p></details>}
      <p className="bg-soft px-5 py-2.5 text-[10px] text-muted">Meeting requests are confirmed by the priest. All times are in IST.</p>
    </article>
  );
}
