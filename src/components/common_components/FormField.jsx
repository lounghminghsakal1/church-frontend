"use client";
import { Children, cloneElement, isValidElement, useId } from 'react';
import DateTimePicker from '@/components/ui/DateTimePicker';

const isControl = child => isValidElement(child) && (['input', 'select', 'textarea'].includes(child.type) || child.type === DateTimePicker);

export default function FormField({ label, error, children }) {
  const generatedId = useId();
  const control = Children.toArray(children).find(isControl);
  const id = control?.props.id || generatedId;
  return (
    <div className="flex min-w-0 flex-col gap-2 wrap-anywhere">
      <label htmlFor={control ? id : undefined} className="text-xs font-semibold text-muted tracking-wide">{label}</label>
      {Children.map(children, child => isControl(child) ? cloneElement(child, { id, ...(child.type === DateTimePicker ? { label } : {}), 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : child.props['aria-describedby'] }) : child)}
      {error && <span id={`${id}-error`} role="alert" className="text-xs text-ink">{error}</span>}
    </div>
  );
}
