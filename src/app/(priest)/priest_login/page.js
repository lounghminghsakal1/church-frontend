import { Church } from 'lucide-react';
import PriestLoginForm from './_components/PriestLoginForm';

export default function PriestLoginPage() {
  return <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm md:p-9 [&>h2]:font-serif [&>h2]:text-3xl [&>h2]:tracking-tight"><span className="mb-5 grid h-16 w-14 place-items-center rounded-t-3xl rounded-b-xl border border-gold/30 bg-gold/10 text-gold-dark"><Church size={28} strokeWidth={1.3} /></span><p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-gold-dark uppercase">PRIEST PORTAL</p><h2>Welcome back, Father.</h2><p className="mt-3 text-sm leading-7 text-slate-500">Sign in to manage your availability and care for your parish community.</p><PriestLoginForm /><p className="mt-6 border-t border-navy/10 pt-5 text-center text-xs text-slate-500">Your dedicated space for parish administration.</p></div>;
}
