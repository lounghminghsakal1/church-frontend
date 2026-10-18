"use client";
import { Children, cloneElement, isValidElement, useId } from 'react';

export default function FormField({ label, error, children }) {
  const generatedId = useId();
  const control = Children.toArray(children).find(child => isValidElement(child) && ['input', 'select', 'textarea'].includes(child.type));
  const id = control?.props.id || generatedId;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={control ? id : undefined} className="text-xs font-semibold text-muted tracking-wide">{label}</label>
      {Children.map(children, child => child === control || (isValidElement(child) && ['input', 'select', 'textarea'].includes(child.type)) ? cloneElement(child, { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : child.props['aria-describedby'] }) : child)}
      {error && <span id={`${id}-error`} role="alert" className="text-xs text-ink">{error}</span>}
    </div>
  );
}
