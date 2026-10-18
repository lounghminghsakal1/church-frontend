import { buttonClassName } from '@/components/ui/styles';
import { ArrowUpRight, Cross, MapPin } from 'lucide-react';
import Image from 'next/image';
import { PARISH_MAP_URL } from '@/lib/parish';

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-8 md:min-h-[580px] md:grid-cols-[1.25fr_1fr] md:gap-10 md:px-8 md:py-16">
      <div className="[&>h1]:font-serif [&>h1]:text-4xl [&>h1]:leading-tight [&>h1]:tracking-tight md:[&>h1]:text-6xl [&_em]:font-normal [&_em]:text-accent-ink [&>.flex>a]:flex-1 md:[&>.flex>a]:flex-none">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase"><span /> A home for faith. A place for you.</p>
        <h1>Rooted in faith.<br />Together in <em>love.</em></h1>
        <p className="mt-4 max-w-lg text-sm leading-8 text-muted md:mt-6 md:text-base">Welcome to St. Antony’s Church. A Roman Catholic parish in Illuppur, where we come together in prayer, celebrate life’s sacred moments, and care for one another.</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#services" className={buttonClassName("primary")}>Explore parish services <ArrowUpRight size={18} /></a>
          <a href="#priest" className={buttonClassName("secondary")}>Meet our parish priest</a>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-muted md:mt-9"><MapPin size={16} /><a href={PARISH_MAP_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-accent/50 underline-offset-4 hover:text-ink">Illuppur, Tamil Nadu</a><span className="h-4 w-px bg-line" /><span>Roman Catholic community</span></div>
      </div>
      <figure className="relative mx-auto w-full max-w-md md:justify-self-end">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-2xl border border-accent/20 bg-accent/5 shadow-lg">
          <Image
            src="/images/church/st-antony-illuppur.webp"
            alt="St. Antony’s Church in Illuppur, with its cream facade, blue trim, and central bell tower topped by a cross"
            fill
            preload
            sizes="(max-width: 500px) calc(100vw - 40px), 448px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-6 pt-20 pb-6 text-white">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/75 uppercase">Our parish. Our home.</p>
            <p className="mt-1 font-serif text-2xl">St. Antony’s Church</p>
          </div>
        </div>
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5"><Cross size={13} className="text-accent-ink" /> Illuppur · Tamil Nadu</span>
          <a href={PARISH_MAP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 underline decoration-accent/50 underline-offset-4 hover:text-ink">Photos &amp; directions on Google Maps <ArrowUpRight size={13} /></a>
        </figcaption>
      </figure>
    </section>
  );
}
