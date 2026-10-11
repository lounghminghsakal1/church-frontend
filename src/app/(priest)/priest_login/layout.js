import Link from 'next/link';
import { Church, ArrowLeft, CalendarCheck, ClipboardList, HeartHandshake } from 'lucide-react';

export default function PriestLoginLayout({ children }) {
  return (
    <div className="priest-portal priest-entry">
      <header className="priest-entry-header"><Link href="/" className="parish-brand"><span className="brand-icon"><Church size={25} strokeWidth={1.4} /></span><span><strong>St. Antony’s Church</strong><small>ILLUPPUR · PRIEST PORTAL</small></span></Link><Link href="/" className="priest-back-link"><ArrowLeft size={16} /> Back to parish</Link></header>
      <main className="priest-entry-main"><section className="priest-entry-story"><span className="priest-entry-label"><Church size={15} /> A SPACE FOR YOUR MINISTRY</span><h1>Care for your parish.<br /><em>One moment at a time.</em></h1><p>Your parish responsibilities, thoughtfully brought together. Stay available to your community and support each family on their journey of faith.</p><div className="priest-entry-features"><div><CalendarCheck size={21} /><span><strong>Keep your parish informed</strong><small>Share your availability and a message for visitors.</small></span></div><div><ClipboardList size={21} /><span><strong>Respond with care</strong><small>Review sacrament and meeting requests.</small></span></div><div><HeartHandshake size={21} /><span><strong>Stay connected</strong><small>Keep your ministry and parish details up to date.</small></span></div></div></section><section className="priest-entry-form-area" aria-label="Priest sign in">{children}</section></main>
      <footer className="priest-entry-footer">St. Antony’s Church, Illuppur · Serving our parish with faith and love.</footer>
    </div>
  );
}
