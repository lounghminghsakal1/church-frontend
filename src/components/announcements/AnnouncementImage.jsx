'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { safeAnnouncementUrl } from '@/utils/announcements';

export default function AnnouncementImage({ src, title = '', variant = 'card' }) {
  const [failed, setFailed] = useState('');
  const url = safeAnnouncementUrl(src);
  const sizeClasses = variant === 'feature'
    ? 'h-56 sm:h-full sm:min-h-80'
    : variant === 'detail'
      ? 'min-h-32 max-h-[440px] rounded-xl'
      : 'h-48';
  return <div data-testid="announcement-image" className={`min-w-0 overflow-hidden bg-soft ${sizeClasses}`}>
    {url && failed !== url ?
      // Returned S3/CloudFront domains are deployment-specific; use the URL unchanged.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={title} className={variant === 'detail' ? 'max-h-[440px] w-full object-contain' : 'h-full w-full object-cover'} loading="lazy" onError={() => setFailed(url)} /> :
      <div data-testid="announcement-image-fallback" className="flex h-full min-h-40 flex-col items-center justify-center gap-6 bg-accent/10 text-accent-ink [&>span]:text-[10px] [&>span]:tracking-[0.2em]"><Megaphone size={42} strokeWidth={1.2} /><span>PARISH NOTICEBOARD</span></div>}
  </div>;
}
