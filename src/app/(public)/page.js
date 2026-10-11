"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Cross, HeartHandshake, BookOpen, Heart, BriefcaseMedical, HandHeart, Users, ArrowUpRight, Search, CalendarDays, ArrowRight, ClipboardList } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import HeroSection from '@/components/pages_components/HeroSection';
import PriestAvailabilitySection from '@/components/pages_components/PriestAvailabilitySection';
import LoginSignupModal from '@/components/common_components/LoginSignupModal';

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
      <section id="priest" className="landing-availability" aria-label="Parish priest availability"><PriestAvailabilitySection onRequestMeeting={() => request('meeting_request')} /></section>
      <HeroSection />
      <div className="welcome-strip"><Cross size={19} strokeWidth={1.3} /><p>A community of prayer, sacraments, and belonging.</p><a href="#services">Find your next step <ArrowRight size={16} /></a></div>
      <section id="services" className="parish-section">
        <div className="section-heading-row"><div><p className="eyebrow">WALKING WITH YOU</p><h2>For every chapter of life.</h2></div><p className="section-description">From your first steps in faith to life’s most meaningful moments, your parish is here for you.</p></div>
        <div className="service-toolbar"><div className="service-filters" role="group" aria-label="Filter parish services">{['All services', 'Sacraments', 'Prayer & support'].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)} className={category === value ? 'selected' : ''}>{value}</button>)}</div><label className="service-search"><Search size={17} /><span className="sr-only">Search parish services</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a service…" /></label></div>
        <div className="service-grid">{filtered.map(({ slug, title, description, Icon, category: type }) => <article key={slug} className="service-card"><div className="flex items-start justify-between"><span className={`service-icon ${type === 'Prayer & support' ? 'support' : ''}`}><Icon size={25} strokeWidth={1.5} /></span><span className="service-number">{String(services.findIndex(s => s.slug === slug) + 1).padStart(2, '0')}</span></div><h3>{title}</h3><p>{description}</p><div className="service-card-actions"><button onClick={() => request(slug)} className="service-request">{type === 'Sacraments' ? 'Request sacrament' : 'Make a request'}<ArrowUpRight size={17} /></button><button onClick={() => request(slug, 'edit')} className="service-view"><ClipboardList size={14} /> My requests</button></div></article>)}</div>
        {!filtered.length && <div className="parish-empty"><Search size={28} /><h3>No matching services</h3><p>Try another word or browse all parish services.</p><button onClick={() => { setSearch(''); setCategory('All services'); }} className="parish-button secondary">Show all services</button></div>}
        <p className="service-note">New here? Choose a service and sign in or create your parish account to get started.</p>
      </section>
      <section id="activities" className="parish-section"><div className="section-heading-row"><div><p className="eyebrow">LIFE IN OUR PARISH</p><h2>Faith brings us together.</h2></div><p className="section-description">Stay close to your parish community through prayer, fellowship, and service.</p></div><div className="parish-life-grid"><div className="community-card"><Users size={28} strokeWidth={1.4} /><h3>A place to belong</h3><p>Your family profile connects you with your prayer group and parish organisations. Keep your details up to date so our parish can stay in touch.</p><button onClick={() => user ? router.push('/profile') : setDestination('/profile')} className="service-request">Manage my parish profile <ArrowUpRight size={17} /></button></div><div className="community-card notices"><CalendarDays size={28} strokeWidth={1.4} /><p className="eyebrow mt-5">PARISH NOTICEBOARD</p><h3>Parish updates will appear here</h3><p>Online announcements and event dates are not available yet. Please check with the parish for the current Mass schedule and upcoming gatherings.</p><button onClick={() => request('meeting_request')} className="service-request">Get in touch with the parish <ArrowUpRight size={17} /></button></div></div></section>
      <section id="contact" className="contact-section"><Cross size={29} strokeWidth={1.2} /><p className="eyebrow">YOU ARE ALWAYS WELCOME</p><h2>Let’s take the next step, together.</h2><p>Questions about a sacrament or life in the parish?<br />Start a conversation with our parish priest.</p><button onClick={() => request('meeting_request')} className="parish-button gold">Request a conversation <ArrowUpRight size={17} /></button></section>
      {destination && <LoginSignupModal onSuccess={() => setDestination(null)} onCancel={() => setDestination(null)} onSuccessGoToLink={destination} />}
    </div>
  );
}
