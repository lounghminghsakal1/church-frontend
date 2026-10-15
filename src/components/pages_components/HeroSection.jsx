import { buttonClassName } from '@/components/ui/styles';
import { ArrowUpRight, Cross, MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-8 md:min-h-[580px] md:grid-cols-[1.25fr_1fr] md:gap-10 md:px-8 md:py-16">
      <div className="[&>h1]:font-serif [&>h1]:text-4xl [&>h1]:leading-tight [&>h1]:tracking-tight md:[&>h1]:text-6xl [&_em]:font-normal [&_em]:text-gold-dark [&>.flex>a]:flex-1 md:[&>.flex>a]:flex-none">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-gold-dark uppercase"><span /> A home for faith. A place for you.</p>
        <h1>Rooted in faith.<br />Together in <em>love.</em></h1>
        <p className="mt-4 max-w-lg text-sm leading-8 text-slate-600 md:mt-6 md:text-base">Welcome to St. Antony’s Church. A Roman Catholic parish in Illuppur, where we come together in prayer, celebrate life’s sacred moments, and care for one another.</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#services" className={buttonClassName("primary")}>Explore parish services <ArrowUpRight size={18} /></a>
          <a href="#priest" className={buttonClassName("secondary")}>Meet our parish priest</a>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 md:mt-9"><MapPin size={16} /> Illuppur, Tamil Nadu <span className="h-4 w-px bg-[#dcd5c8]" /> <span>Roman Catholic community</span></div>
      </div>
      <div className="relative hidden w-full max-w-md justify-self-end rounded-t-full rounded-b-2xl border border-gold/20 bg-gold/5 px-5 pt-6 md:block" aria-hidden="true">
        <svg viewBox="0 0 500 560" className="h-auto w-full" fill="none">
          <defs>
            <linearGradient id="glass" x1="100" y1="0" x2="420" y2="500" gradientUnits="userSpaceOnUse"><stop stopColor="#597b83" /><stop offset=".5" stopColor="#263f50" /><stop offset="1" stopColor="#122c40" /></linearGradient>
            <linearGradient id="light" x1="250" y1="50" x2="250" y2="520" gradientUnits="userSpaceOnUse"><stop stopColor="#eed9a0" stopOpacity=".7" /><stop offset="1" stopColor="#eed9a0" stopOpacity="0" /></linearGradient>
            <clipPath id="arch"><path d="M90 530V235C90 134 159 62 250 25C341 62 410 134 410 235V530Z" /></clipPath>
          </defs>
          <path d="M65 550V235C65 120 142 40 250 0C358 40 435 120 435 235V550" stroke="#d9c69f" />
          <path d="M90 530V235C90 134 159 62 250 25C341 62 410 134 410 235V530Z" fill="url(#glass)" />
          <g clipPath="url(#arch)">
            <path d="M250 25L105 530H395Z" fill="url(#light)" />
            <g stroke="#d8c292" strokeOpacity=".38" strokeWidth="1.5"><path d="M250 25V530M170 80V530M330 80V530M90 235H410M90 340H410M90 445H410M90 235L410 445M410 235L90 445M170 80L330 235M330 80L170 235" /><circle cx="250" cy="165" r="62" /><circle cx="250" cy="165" r="48" /></g>
            <path d="M244 115H256V156H291V168H256V221H244V168H209V156H244Z" fill="#ecd5a0" />
            <path d="M90 530H410V488H90Z" fill="#102b3b" /><path d="M187 488H313L299 476H201Z" fill="#cfb984" /><path d="M204 476V453H296V476" fill="#e8dbc0" />
            <path d="M173 455V416M327 455V416" stroke="#e8dbc0" strokeWidth="5" /><path d="M173 405C167 412 170 418 173 418C176 418 179 412 173 405ZM327 405C321 412 324 418 327 418C330 418 333 412 327 405Z" fill="#f3d591" />
          </g>
        </svg>
        <div className="absolute bottom-5 -left-4 flex items-center gap-4 rounded-xl border border-navy/10 bg-white px-5 py-4 text-xs text-slate-500 shadow-sm [&>svg]:text-gold [&_strong]:font-medium [&_strong]:text-navy"><Cross size={18} strokeWidth={1.3} /><span>One faith. One family.<br /><strong>Many hearts, together.</strong></span></div>
      </div>
    </section>
  );
}
