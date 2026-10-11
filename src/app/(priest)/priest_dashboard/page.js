"use client";
import Link from 'next/link';
import { CalendarCheck, ClipboardList, UserRound, ArrowUpRight, Church } from 'lucide-react';
import { useAuthPriest } from '@/hooks/useAuthPriest';
import EditPriestAvailability from './_components/EditPriestAvailability';

export default function PriestDashboardPage() {
  const { loggedInPriest } = useAuthPriest();
  return <div className="ministry-dashboard"><section className="ministry-welcome"><div><p className="eyebrow">YOUR PARISH, AT A GLANCE</p><h1>{loggedInPriest?.priest_name ? `Welcome, Father ${loggedInPriest.priest_name}.` : 'Welcome, Father.'}</h1><p>A little planning makes room for meaningful moments. Let your parish know when you are available.</p></div><span className="ministry-welcome-icon" aria-hidden="true"><Church size={45} strokeWidth={1.1} /></span></section>
    <div className="ministry-shortcuts"><Link href="/priest_dashboard/requests"><span><ClipboardList size={21} /></span><div><strong>Parish requests</strong><p>Review sacraments, intentions, and meetings</p></div><ArrowUpRight size={18} /></Link><Link href="/priest_dashboard/profile"><span><UserRound size={21} /></span><div><strong>Your priest profile</strong><p>Keep your contact and parish details current</p></div><ArrowUpRight size={18} /></Link></div>
    <section id="priest-availability" className="ministry-availability"><div className="ministry-section-title"><div><p className="eyebrow">MAKE YOUR NEXT VISIT EASIER</p><h2>Your availability</h2></div><span><CalendarCheck size={16} /> Visible on the parish homepage</span></div><EditPriestAvailability loggedInPriestId={loggedInPriest?._id} priestName={loggedInPriest?.priest_name} /></section>
  </div>;
}
