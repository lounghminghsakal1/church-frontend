'use client';
import { buttonClassName } from '@/components/ui/styles';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Cross, HeartHandshake, BookOpen, Heart, BriefcaseMedical, HandHeart, Users, ArrowUpRight, Search, CalendarDays, ArrowRight, ClipboardList } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import HeroSection from '@/components/pages_components/HeroSection';
import PriestAvailabilitySection from '@/components/pages_components/PriestAvailabilitySection';
import LoginSignupModal from '@/components/common_components/LoginSignupModal';
import AnnouncementsSection from '@/components/announcements/AnnouncementsSection';

const services = [
  { slug: 'baptism_request', title: 'Baptism', description: 'Welcome your child into our family of faith and begin their life in Christ.', Icon: Droplets, category: 'Sacraments' },
  { slug: 'eucharist_request', title: 'Holy Eucharist', description: 'Take the next step in faith and prepare to receive Holy Communion.', Icon: Cross, category: 'Sacraments' },
  { slug: 'confession_request', title: 'Reconciliation', description: 'Find a quiet moment for confession, forgiveness, and spiritual renewal.', Icon: HeartHandshake, category: 'Sacraments' },
  { slug: 'confirmation_request', title: 'Confirmation', description: 'Deepen your commitment to Christ through the gift of the Holy Spirit.', Icon: BookOpen, category: 'Sacraments' },
  { slug: 'marriage_request', title: 'Holy Matrimony', description: 'Begin your preparation for the sacrament of marriage with our parish.', Icon: Heart, category: 'Sacraments' },
  { slug: 'anointing_of_the_sick_request', title: 'Anointing of the Sick', description: 'Request prayer and sacramental care for a loved one who is unwell.', Icon: BriefcaseMedical, category: 'Sacraments' },
  { slug: 'mass_prayer', title: 'Mass intentions', description: 'Share a prayer intention for your family, a thanksgiving, or a loved one.', Icon: HandHeart, category: 'Prayer & support' },
  { slug: 'meeting_request', title: 'Meet the priest', description: 'Arrange a personal conversation for guidance, support, or parish matters.', Icon: Users, category: 'Prayer & support' },
];

export default function PublicHomePage() {
  const { user } = useAuthUser();
  const router = useRouter();
  const [destination, setDestination] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All services');
  const request = (slug, action = 'apply') => {
    const href = `/applications/${slug}/${action}`;
    if (user) router.push(href);
    else setDestination(href);
  };
  const filtered = services.filter(service => (category === 'All services' || service.category === category) && `${service.title} ${service.description} ${service.slug}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <section id="priest" className="mx-auto max-w-7xl scroll-mt-5 px-4 pt-4 md:px-8 md:pt-6" aria-label="Parish priest availability"><PriestAvailabilitySection onRequestMeeting={() => request('meeting_request')} /></section>
      <HeroSection />
      <div className="flex flex-wrap items-center justify-center gap-3 border-y border-ink/10 bg-accent/5 px-6 py-5 text-center text-xs text-muted md:text-sm [&>svg]:text-accent-ink [&>a]:flex [&>a]:items-center [&>a]:gap-3 [&>a]:text-xs [&>a]:font-semibold [&>a]:text-ink md:[&>a]:ml-12"><Cross size={19} strokeWidth={1.3} /><p>A community of prayer, sacraments, and belonging.</p><a href="#services">Find your next step <ArrowRight size={16} /></a></div>
      <AnnouncementsSection />
      <section id="services" className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:tracking-tight md:[&_h2]:text-4xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-10"><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase">WALKING WITH YOU</p><h2>For every chapter of life.</h2></div><p className="max-w-sm text-sm leading-8 text-muted">From your first steps in faith to life’s most meaningful moments, your parish is here for you.</p></div>
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-1.5 [&>button]:min-h-11 [&>button]:rounded-xl [&>button]:border [&>button]:border-transparent [&>button]:px-3 [&>button]:py-2.5 [&>button]:text-xs [&>button]:text-muted [&>button]:hover:bg-soft [&>button[aria-pressed=true]]:bg-ink [&>button[aria-pressed=true]]:text-white" role="group" aria-label="Filter parish services">{['All services', 'Sacraments', 'Prayer & support'].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)} className={category === value ? "" : ''}>{value}</button>)}</div><label className="flex items-center gap-2.5 rounded-xl border border-ink/15 bg-white px-3 text-muted [&_input]:min-h-12 [&_input]:w-full [&_input]:bg-transparent [&_input]:text-base [&_input]:outline-none md:[&_input]:w-44 md:[&_input]:text-sm"><Search size={17} /><span className="sr-only">Search parish services</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a service…" /></label></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{filtered.map(({ slug, title, description, Icon, category: type }) => <article key={slug} className="flex flex-col rounded-2xl border border-ink/10 bg-white p-6 transition-shadow hover:border-accent/40 hover:shadow-md [&>h3]:mt-5 [&>h3]:mb-3 [&>h3]:font-serif [&>h3]:text-2xl [&>p]:text-sm [&>p]:leading-7 [&>p]:text-muted"><div className="flex items-start justify-between"><span className={`grid size-12 place-items-center rounded-xl ${type === 'Prayer & support' ? 'bg-soft text-ink' : 'bg-accent/10 text-accent-ink'}`}><Icon size={25} strokeWidth={1.5} /></span><span className="pt-1 text-xs tracking-wider text-muted">{String(services.findIndex(s => s.slug === slug) + 1).padStart(2, '0')}</span></div><h3>{title}</h3><p>{description}</p><div className="mt-auto pt-5"><button onClick={() => request(slug)} className="flex min-h-12 w-full items-center justify-between gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-ink">{type === 'Sacraments' ? 'Request sacrament' : 'Make a request'}<ArrowUpRight size={17} /></button><button onClick={() => request(slug, 'edit')} className="mt-2 flex min-h-11 w-full items-center gap-2 border-t border-ink/5 pt-3 text-xs text-muted"><ClipboardList size={14} /> My requests</button></div></article>)}</div>
        {!filtered.length && <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center text-muted [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:text-ink"><Search size={28} /><h3>No matching services</h3><p>Try another word or browse all parish services.</p><button onClick={() => { setSearch(''); setCategory('All services'); }} className={buttonClassName("secondary")}>Show all services</button></div>}
        <p className="mt-6 text-center text-xs text-muted">New here? Choose a service and sign in or create your parish account to get started.</p>
      </section>
      <section id="activities" className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:tracking-tight md:[&_h2]:text-4xl"><div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-10"><div><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase">LIFE IN OUR PARISH</p><h2>Faith brings us together.</h2></div><p className="max-w-sm text-sm leading-8 text-muted">Stay close to your parish community through prayer, fellowship, and service.</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="rounded-2xl border border-ink/10 bg-white p-7 md:p-9 [&>svg]:text-accent-ink [&>h3]:mt-5 [&>h3]:mb-3 [&>h3]:font-serif [&>h3]:text-2xl [&>p:not(:first-child)]:text-sm [&>p]:leading-7 [&>button]:mt-6"><Users size={28} strokeWidth={1.4} /><h3>A place to belong</h3><p>Your family profile connects you with your prayer group and parish organisations. Keep your details up to date so our parish can stay in touch.</p><button onClick={() => user ? router.push('/profile') : setDestination('/profile')} className="flex min-h-12 w-full items-center justify-between gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-ink">Manage my parish profile <ArrowUpRight size={17} /></button></div><div className="rounded-2xl border border-ink/10 bg-white p-7 md:p-9 [&>svg]:text-accent-ink [&>h3]:mt-5 [&>h3]:mb-3 [&>h3]:font-serif [&>h3]:text-2xl [&>p:not(:first-child)]:text-sm [&>p]:leading-7 [&>button]:mt-6"><CalendarDays size={28} strokeWidth={1.4} /><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent-ink uppercase mt-5">PARISH NOTICEBOARD</p><h3>Stay close to parish life</h3><p>Visit our parish noticeboard for the latest announcements, celebrations, and community updates.</p><a href="#announcements" className="flex min-h-12 w-full items-center justify-between gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-ink">Explore parish announcements <ArrowUpRight size={17} /></a></div></div></section>
      <section id="contact" className="mx-4 mb-10 rounded-2xl bg-ink px-6 py-12 text-center text-white md:mx-8 md:mb-16 md:py-16 [&>svg]:mx-auto [&>svg]:mb-5 [&>svg]:text-accent [&>p:first-of-type]:text-accent [&>h2]:font-serif [&>h2]:text-3xl md:[&>h2]:text-4xl [&>p:not(:first-of-type)]:my-6 [&>p:not(:first-of-type)]:text-sm [&>p:not(:first-of-type)]:leading-8 [&>p:not(:first-of-type)]:text-soft"><Cross size={29} strokeWidth={1.2} /><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-accent uppercase">YOU ARE ALWAYS WELCOME</p><h2>Let’s take the next step, together.</h2><p>Questions about a sacrament or life in the parish?<br />Start a conversation with our parish priest.</p><button onClick={() => request('meeting_request')} className={buttonClassName("accent")}>Request a conversation <ArrowUpRight size={17} /></button></section>
      {destination && <LoginSignupModal onSuccess={() => setDestination(null)} onCancel={() => setDestination(null)} onSuccessGoToLink={destination} />}
    </div>
  );
}
