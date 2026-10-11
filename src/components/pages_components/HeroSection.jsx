import { ArrowUpRight, Cross, MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="parish-hero">
      <div className="hero-copy">
        <p className="eyebrow"><span /> A home for faith. A place for you.</p>
        <h1>Rooted in faith.<br />Together in <em>love.</em></h1>
        <p className="hero-description">Welcome to St. Antony’s Church. A Roman Catholic parish in Illuppur, where we come together in prayer, celebrate life’s sacred moments, and care for one another.</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#services" className="parish-button primary">Explore parish services <ArrowUpRight size={18} /></a>
          <a href="#priest" className="parish-button secondary">Meet our parish priest</a>
        </div>
        <div className="hero-location"><MapPin size={16} /> Illuppur, Tamil Nadu <span className="h-4 w-px bg-[#dcd5c8]" /> <span>Roman Catholic community</span></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <svg viewBox="0 0 500 560" className="sanctuary-art" fill="none">
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
        <div className="hero-art-caption"><Cross size={18} strokeWidth={1.3} /><span>One faith. One family.<br /><strong>Many hearts, together.</strong></span></div>
      </div>
    </section>
  );
}
