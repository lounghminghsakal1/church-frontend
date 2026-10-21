'use client';
import { buttonClassName } from '@/components/ui/styles';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Cross, HeartHandshake, BookOpen, Heart, BriefcaseMedical, HandHeart, Users, ArrowUpRight, Search, CalendarDays, ClipboardList, ShieldCheck } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import HeroSection from '@/components/pages_components/HeroSection';
import PriestAvailabilitySection from '@/components/pages_components/PriestAvailabilitySection';
import LoginSignupModal from '@/components/common_components/LoginSignupModal';
import AnnouncementsSection from '@/components/announcements/AnnouncementsSection';
import styles from '@/components/pages_components/parish.module.css';

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
      <section id="priest" className={styles.arrivalBand} aria-label="Parish priest availability">
        <PriestAvailabilitySection compact onRequestMeeting={() => request('meeting_request')} />
      </section>
      <HeroSection />
      <AnnouncementsSection />
      <section id="services" className={`${styles.section} ${styles.serviceSection}`} aria-labelledby="services-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>WALKING WITH YOU</p><h2 id="services-title">For every chapter of life.</h2></div>
          <p className={styles.sectionIntro}>Request a sacrament, share a prayer intention, or find a moment for a conversation. Your parish is here for you.</p>
        </div>
        <div className={styles.serviceTools}>
          <div className={styles.filters} role="group" aria-label="Filter parish services">
            {['All services', 'Sacraments', 'Prayer & support'].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
          </div>
          <label className={styles.search}><Search size={17} /><span className="sr-only">Search parish services</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a service…" /></label>
        </div>
        <p className="sr-only" role="status">{filtered.length} services found</p>
        <div className={styles.services}>
          {filtered.map(({ slug, title, description, Icon, category: type }) => (
            <article key={slug} className={styles.service}>
              <span className={styles.serviceIcon}><Icon size={25} strokeWidth={1.5} /></span>
              <div className={styles.serviceBody}>
                <h3>{title}</h3><p>{description}</p>
                <div className={styles.serviceActions}>
                  <button onClick={() => request(slug)} className={styles.requestLink} aria-label={`Request ${title}`}>{type === 'Sacraments' ? 'Request sacrament' : 'Make a request'}<ArrowUpRight size={17} /></button>
                  <button onClick={() => request(slug, 'edit')} className={styles.historyLink} aria-label={`My ${title} requests`}><ClipboardList size={14} /> My requests</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && <div className="flex flex-col items-center gap-4 border-b border-line px-6 py-14 text-center text-muted"><Search size={28} /><h3 className="font-serif text-2xl text-ink">No matching services</h3><p className="text-sm">Try another word or browse all parish services.</p><button onClick={() => { setSearch(''); setCategory('All services'); }} className={buttonClassName('secondary')}>Show all services</button></div>}
        <p className={styles.serviceHint}><ShieldCheck size={16} /> Choose a service, then sign in or create an account. You can track your requests at any time.</p>
      </section>

      <section id="activities" className={styles.community} aria-labelledby="community-title">
        <div className={styles.section}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>LIFE IN OUR PARISH</p><h2 id="community-title">A faith we share.<br />A family we belong to.</h2></div><p className={styles.sectionIntro}>Stay connected with the people, prayers, and celebrations that bring our parish together.</p></div>
          <div className={styles.communityLinks}>
            <div className={styles.communityItem}><Users size={28} strokeWidth={1.4} /><h3>Your place in the parish</h3><p>Keep your family details and prayer group up to date so our parish can stay in touch.</p><button onClick={() => user ? router.push('/profile') : setDestination('/profile')} className={styles.requestLink}>Manage my parish profile <ArrowUpRight size={17} /></button></div>
            <div className={styles.communityItem}><CalendarDays size={28} strokeWidth={1.4} /><h3>Stay close to parish life</h3><p>Find the latest announcements, upcoming celebrations, and updates from your community.</p><a href="#announcements" className={styles.requestLink}>Explore parish announcements <ArrowUpRight size={17} /></a></div>
          </div>
        </div>
      </section>
      <section id="contact" className={styles.contact} aria-labelledby="contact-title">
        <div className={`${styles.section} ${styles.contactInner}`}>
          <div><p className={styles.eyebrow}>YOU ARE ALWAYS WELCOME</p><h2 id="contact-title">Let’s take the next step,<br /><em>together.</em></h2><p>Questions about a sacrament or life in the parish? Start a conversation with our parish priest.</p></div>
          <button onClick={() => request('meeting_request')} className={buttonClassName('primary')}>Request a conversation <ArrowUpRight size={18} /></button>
        </div>
      </section>
      {destination && <LoginSignupModal onSuccess={() => setDestination(null)} onCancel={() => setDestination(null)} onSuccessGoToLink={destination} />}
    </div>
  );
}
