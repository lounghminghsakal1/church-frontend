'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export default function AnnouncementDialog({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  useBodyScrollLock();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return <dialog data-testid="announcement-dialog" ref={ref} className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-24px)] max-w-2xl overflow-y-auto rounded-2xl border border-ink/10 bg-white p-6 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm sm:p-8" aria-labelledby="announcement-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div data-testid="announcement-dialog-heading" className="mb-6 flex items-start justify-between gap-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:leading-snug [&>h2]:wrap-anywhere"><h2 id="announcement-dialog-title">{title}</h2><button data-testid="announcement-icon-button" type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink transition-colors hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={21} /></button></div>
    {children}
  </dialog>;
}
