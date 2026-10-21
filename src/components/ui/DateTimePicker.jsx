'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { dateKey, formatPickerValue, parishClock, parseCalendarDate, pickerValue, withinPickerBounds } from '@/utils/dateTimePicker';
import styles from './DateTimePicker.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function PickerDialog({ initial, type, min, max, step, label, required, onApply, onClose }) {
  useBodyScrollLock();
  const ref = useRef(null);
  const id = useId();
  const dateOnly = type === 'date';
  const seconds = !dateOnly && Number(step) > 0 && Number(step) < 60;
  const [today] = useState(() => parishClock().slice(0, 10));
  const initialDate = initial.slice(0, 10);
  const firstFocus = min && initialDate < min.slice(0, 10) ? min.slice(0, 10) : max && initialDate > max.slice(0, 10) ? max.slice(0, 10) : initialDate;
  const [month, setMonth] = useState(() => { const d = parseCalendarDate(firstFocus); return new Date(d.getFullYear(), d.getMonth(), 1, 12); });
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [focusedDate, setFocusedDate] = useState(firstFocus);
  const initialHour = Number(initial.slice(11, 13) || 9);
  const [hour, setHour] = useState(String(initialHour % 12 || 12).padStart(2, '0'));
  const [minute, setMinute] = useState(initial.slice(14, 16) || '00');
  const [second, setSecond] = useState(initial.slice(17, 19) || '00');
  const [period, setPeriod] = useState(initialHour >= 12 ? 'PM' : 'AM');
  const [tab, setTab] = useState('date');
  const candidate = dateOnly ? selectedDate : pickerValue(selectedDate, hour, minute, period, seconds ? second : undefined);
  const valid = candidate && withinPickerBounds(candidate, min, max, dateOnly);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const yearStart = min ? Number(min.slice(0, 4)) : Math.min(Number(today.slice(0, 4)) - 120, year);
  const yearEnd = max ? Number(max.slice(0, 4)) : Math.max(Number(today.slice(0, 4)) + 20, year);
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const rows = Math.ceil((offset + dayCount) / 7);
  const dayAllowed = key => (!min || key >= min.slice(0, 10)) && (!max || key <= max.slice(0, 10));

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    dialog.querySelector('[data-calendar-focus=true]')?.focus({ preventScroll: true });
    return () => { dialog.close(); previousFocus?.focus({ preventScroll: true }); };
  }, []);

  const moveMonth = (nextYear, nextMonth) => {
    const next = new Date(nextYear, nextMonth, 1, 12);
    const day = Math.min(parseCalendarDate(focusedDate)?.getDate() || 1, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
    let key = dateKey(new Date(next.getFullYear(), next.getMonth(), day, 12));
    if (min && key < min.slice(0, 10) && key.slice(0, 7) === min.slice(0, 7)) key = min.slice(0, 10);
    if (max && key > max.slice(0, 10) && key.slice(0, 7) === max.slice(0, 7)) key = max.slice(0, 10);
    setFocusedDate(key);
    setMonth(next);
  };
  const focusDay = key => {
    if (!dayAllowed(key)) return;
    const d = parseCalendarDate(key);
    setFocusedDate(key);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1, 12));
    requestAnimationFrame(() => ref.current?.querySelector(`[data-date="${key}"]`)?.focus());
  };
  const selectDay = key => {
    setSelectedDate(key);
    setFocusedDate(key);
    if (!dateOnly && window.matchMedia('(max-width: 639px)').matches) {
      setTab('time');
      requestAnimationFrame(() => ref.current?.querySelector('[data-time-hour]')?.focus());
    }
  };
  const dayKeyDown = (event, key) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectDay(key); return; }
    const d = parseCalendarDate(key);
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -((d.getDay() + 6) % 7), End: 6 - ((d.getDay() + 6) % 7) };
    if (event.key in deltas) { event.preventDefault(); d.setDate(d.getDate() + deltas[event.key]); focusDay(dateKey(d)); }
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      const delta = (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const target = new Date(d.getFullYear(), d.getMonth() + delta, 1, 12);
      target.setDate(Math.min(d.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
      focusDay(dateKey(target));
    }
  };
  const previousMonth = new Date(year, monthIndex, 0, 12);
  const nextMonth = new Date(year, monthIndex + 1, 1, 12);
  const timeInput = change => event => change(event.target.value.replace(/\D/g, '').slice(0, 2));

  return createPortal(
    <dialog ref={ref} data-testid="date-time-dialog" data-date-only={dateOnly} data-tab={tab} className={styles.dialog} aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }} onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}>
      <header className={styles.header}><div><p>{label || (dateOnly ? 'CALENDAR' : 'PARISH TIME · IST')}</p><h2 id={`${id}-title`}>{dateOnly ? 'Choose a date' : 'Choose date & time'}</h2></div><button type="button" aria-label="Close date picker" onClick={onClose} className={styles.iconButton}><X size={20} /></button></header>
      {!dateOnly && <div className={styles.tabs} role="tablist" aria-label="Choose date or time">{['date', 'time'].map(value => <button key={value} type="button" role="tab" id={`${id}-${value}-tab`} aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "date" : event.key === "End" ? "time" : value === "date" ? "time" : "date"; setTab(next); requestAnimationFrame(() => document.getElementById(`${id}-${next}-tab`)?.focus()); } }} aria-controls={`${id}-${value}`} onClick={() => setTab(value)}>{value === 'date' ? <CalendarDays size={16} /> : <Clock3 size={16} />}{value === 'date' ? 'Date' : 'Time'}</button>)}</div>}
      <div className={`${styles.body} ${!dateOnly ? styles.withTime : ''}`}>
        <section id={`${id}-date`} className={styles.calendarPanel} data-active={dateOnly || tab === 'date'} aria-label="Calendar">
          <div className={styles.monthNavigation}>
            <button type="button" className={styles.iconButton} aria-label="Previous month" disabled={Boolean(min && dateKey(previousMonth) < min.slice(0, 10)) || previousMonth.getFullYear() < yearStart} onClick={() => moveMonth(year, monthIndex - 1)}><ChevronLeft size={20} /></button>
            <div className={styles.monthSelects}><label><span className="sr-only">Month</span><select aria-label="Calendar month" value={monthIndex} onChange={event => moveMonth(year, Number(event.target.value))}>{MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}</select></label><label><span className="sr-only">Year</span><select aria-label="Calendar year" value={year} onChange={event => moveMonth(Number(event.target.value), monthIndex)}>{Array.from({ length: Math.max(1, yearEnd - yearStart + 1) }, (_, i) => yearStart + i).map(y => <option key={y}>{y}</option>)}</select></label></div>
            <button type="button" className={styles.iconButton} aria-label="Next month" disabled={Boolean(max && dateKey(nextMonth) > max.slice(0, 10)) || nextMonth.getFullYear() > yearEnd} onClick={() => moveMonth(year, monthIndex + 1)}><ChevronRight size={20} /></button>
          </div>
          <div role="grid" aria-label={`${MONTHS[monthIndex]} ${year}`} className={styles.calendar}>
            <div role="row" className={styles.weekdayRow}>{WEEKDAYS.map(day => <span key={day} role="columnheader">{day}</span>)}</div>
            {Array.from({ length: rows }, (_, row) => <div key={row} role="row" className={styles.week}>{Array.from({ length: 7 }, (_, col) => { const day = row * 7 + col - offset + 1; if (day < 1 || day > dayCount) return <span key={col} role="gridcell" />; const key = dateKey(new Date(year, monthIndex, day, 12)); return <button key={col} type="button" role="gridcell" data-date={key} data-calendar-focus={focusedDate === key} aria-selected={selectedDate === key} aria-current={today === key ? 'date' : undefined} aria-label={new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseCalendarDate(key))} disabled={!dayAllowed(key)} tabIndex={focusedDate === key ? 0 : -1} onKeyDown={event => dayKeyDown(event, key)} onFocus={() => setFocusedDate(key)} onClick={() => selectDay(key)}>{day}</button>; })}</div>)}
          </div>
          <div className={styles.calendarFooter}><button type="button" disabled={!dayAllowed(today)} onClick={() => { selectDay(today); const d = parseCalendarDate(today); moveMonth(d.getFullYear(), d.getMonth()); }}>Today</button><span>{formatPickerValue(selectedDate, true)}</span></div>
        </section>
        {!dateOnly && <section id={`${id}-time`} className={styles.timePanel} data-active={tab === 'time'} aria-label="Choose time">
          <div className={styles.timeHeading}><Clock3 size={20} /><h3>Choose a time</h3></div><p>India Standard Time (IST)</p>
          <div className={styles.timeFields}><label>Hour<input data-time-hour data-time-part type="text" inputMode="numeric" onFocus={event => event.target.select()} pattern="[0-9]*" maxLength={2} value={hour} onChange={timeInput(setHour)} onBlur={() => { if (Number(hour) >= 1 && Number(hour) <= 12) setHour(hour.padStart(2, '0')); }} aria-label="Hour" /></label><span aria-hidden="true">:</span><label>Minute<input data-time-part type="text" inputMode="numeric" onFocus={event => event.target.select()} pattern="[0-9]*" maxLength={2} value={minute} onChange={timeInput(setMinute)} onBlur={() => { if (minute && Number(minute) <= 59) setMinute(minute.padStart(2, '0')); }} aria-label="Minute" /></label>{seconds && <><span aria-hidden="true">:</span><label>Second<input data-time-part type="text" inputMode="numeric" onFocus={event => event.target.select()} pattern="[0-9]*" maxLength={2} value={second} onChange={timeInput(setSecond)} onBlur={() => { if (second && Number(second) <= 59) setSecond(second.padStart(2, '0')); }} aria-label="Second" /></label></>}</div>
          <div className={styles.period} role="group" aria-label="Time period">{['AM', 'PM'].map(value => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)}>{value}</button>)}</div>
          <p className={styles.timeHelp}>Use 1–12 for the hour and 00–59 for minutes{seconds ? ' and seconds' : ''}.</p>
        </section>}
      </div>
      <footer className={styles.footer}>
        <p aria-live="polite">{candidate ? formatPickerValue(candidate, dateOnly, seconds) : 'Enter a valid time.'}{candidate && !valid && <span role="alert">{min && !withinPickerBounds(candidate, min, undefined, dateOnly) ? `Choose ${formatPickerValue(min, dateOnly, seconds)} or later.` : `Choose ${formatPickerValue(max, dateOnly, seconds)} or earlier.`}</span>}</p>
        <div className={styles.footerActions}>{!required && <button type="button" className={styles.clear} onClick={() => onApply('')}>Clear</button>}<button type="button" className={styles.cancel} onClick={onClose}>Cancel</button><button type="button" data-testid="date-time-apply" className={styles.apply} disabled={!valid} onClick={() => onApply(candidate)}><Check size={16} /> Apply{dateOnly ? ' date' : ''}</button></div>
      </footer>
    </dialog>, document.body
  );
}

export default function DateTimePicker({ type = 'datetime-local', value = '', onChange, name, id, min, max, step, required, disabled, readOnly, className = '', label, placeholder, ...aria }) {
  const [initial, setInitial] = useState(null);
  const trigger = useRef(null);
  const dateOnly = type === 'date';
  const close = () => { setInitial(null); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  const apply = next => { onChange?.({ target: { value: next, name, id, type }, currentTarget: { value: next, name, id, type } }); close(); };
  const display = formatPickerValue(value, dateOnly, Number(step) > 0 && Number(step) < 60);
  return <>
    <button {...aria} ref={trigger} id={id} type="button" data-testid="date-time-trigger" className={`${className} ${styles.trigger}`} disabled={disabled} aria-haspopup="dialog" aria-expanded={initial != null} data-required={required || undefined} aria-disabled={readOnly || undefined} onClick={() => { if (!readOnly) setInitial(parseCalendarDate(value) ? value : parishClock()); }}><CalendarDays size={18} /><span className={display ? '' : styles.placeholder}>{display || placeholder || (dateOnly ? 'Choose a date' : 'Choose date & time')}</span><ChevronDown size={16} /></button>
    {name && <input type="hidden" name={name} value={value} readOnly disabled={disabled} />}
    {initial != null && <PickerDialog initial={initial} type={type} min={min} max={max} step={step} label={label || aria['aria-label']} required={required} onApply={apply} onClose={close} />}
  </>;
}
