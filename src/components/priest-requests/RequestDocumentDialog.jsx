'use client';
import { buttonClassName } from '@/components/ui/styles';


import { useEffect, useRef, useState } from 'react';
import { ExternalLink, X, FileText } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export default function RequestDocumentDialog({ document: asset, onClose }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useBodyScrollLock();
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); previousFocus?.focus(); };
  }, []);
  return <dialog data-testid="request-document-dialog" ref={ref} className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-24px)] max-w-5xl overflow-y-auto rounded-2xl border border-ink/10 bg-white p-5 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm md:p-6 [&>header]:mb-6 [&>header]:flex [&>header]:items-start [&>header]:justify-between [&>header]:gap-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:wrap-anywhere [&>iframe]:h-[62dvh] [&>iframe]:w-full [&>iframe]:rounded-xl [&>iframe]:border [&>iframe]:border-ink/10 [&>iframe]:bg-soft [&>img]:block [&>img]:max-h-[65dvh] [&>img]:w-full [&>img]:rounded-xl [&>img]:bg-soft [&>img]:object-contain [&>footer]:mt-4 [&>footer]:flex [&>footer]:flex-col [&>footer]:items-start [&>footer]:justify-between [&>footer]:gap-4 md:[&>footer]:flex-row md:[&>footer]:items-center [&>footer>p]:text-xs [&>footer>p]:text-muted" aria-labelledby="request-document-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><header><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase">REQUEST DOCUMENT</p><h2 id="request-document-title">{asset.label}</h2></div><button data-testid="request-icon-button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink transition-colors hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50" onClick={onClose} aria-label="Close document"><X size={22} /></button></header>
    {asset.kind === 'image' ? failed ? <div data-testid="request-empty" className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center [&>svg]:text-accent-ink [&>h2]:font-serif [&>h2]:text-2xl [&>p]:max-w-md [&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted"><FileText size={30} /><p>The image could not be loaded. Try opening the original below.</p></div> :
      // Legacy request uploads are served directly from the backend.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={asset.url} alt={asset.label} onError={() => setFailed(true)} /> : <iframe src={asset.url} title={asset.label} />}
    <footer><p>If the preview is unavailable, open the original document.</p><a data-testid="request-button" href={asset.url} target="_blank" rel="noopener noreferrer" className={buttonClassName("secondary")}>Open original <ExternalLink size={16} /></a></footer>
  </dialog>;
}
