'use client';
import { buttonClassName } from '@/components/ui/styles';
import { Church, Menu, X, ArrowUpRight, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function NavBar({ onLoginOrSignupClick, onLogoutClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuthUser();
  const pathname = usePathname();
  useEffect(() => {
    const close = e => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  const links = [{ label: 'Home', href: '/' }, { label: 'Announcements', href: '/#announcements' }, { label: 'Parish services', href: '/#services' }, { label: 'Our priest', href: '/#priest' }, { label: 'Parish life', href: '/#activities' }];
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-background/95 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 md:gap-6 md:px-8 md:py-5">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex min-w-0 items-center gap-2.5 md:shrink-0 md:gap-3 [&_strong]:block [&_strong]:font-serif [&_strong]:text-base [&_strong]:font-semibold md:[&_strong]:text-xl [&_small]:mt-1 [&_small]:block [&_small]:text-[7px] [&_small]:tracking-widest [&_small]:text-slate-500 md:[&_small]:text-[9px]"><span className="grid h-11 w-9 shrink-0 place-items-center rounded-t-3xl rounded-b-lg border border-gold/40 text-gold-dark md:h-12 md:w-11"><Church size={25} strokeWidth={1.4} /></span><span><strong>St. Antony’s Church</strong><small>ILLUPPUR · ROMAN CATHOLIC PARISH</small></span></Link>
        <div className="hidden xl:flex items-center gap-6">
          {links.map(item => <Link key={item.label} href={item.href} aria-current={item.href === pathname ? 'page' : undefined} className="text-sm text-slate-600 transition-colors hover:text-navy aria-[current=page]:text-navy">{item.label}</Link>)}
        </div>
        <div className="hidden xl:flex items-center gap-3">
          {user ? <><Link href="/profile" className="text-sm text-slate-600 transition-colors hover:text-navy aria-[current=page]:text-navy flex items-center gap-2"><UserRound size={16} /> My parish profile</Link><button onClick={onLogoutClick} className="text-sm text-slate-600 transition-colors hover:text-navy aria-[current=page]:text-navy">Sign out</button></> : <button onClick={onLoginOrSignupClick} className={buttonClassName("primary", "", "sm")}>User sign in <UserRound size={16} /></button>}
          <Link href="/priest_login" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-11 border-gold/30 bg-gold/10 text-xs text-gold-dark hover:bg-gold/20"><Church size={16} /> Priest sign in <ArrowUpRight size={14} /></Link>
        </div>
        <div className="xl:hidden flex items-center shrink-0">
          {user ? <Link href="/profile" className="p-3 rounded-xl" aria-label="My parish profile" onClick={() => setMenuOpen(false)}><UserRound size={20} /></Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }} className="p-3 rounded-xl" aria-label="Sign in to your parish account"><UserRound size={20} /></button>}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-3 rounded-xl" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </nav>
      <div className="flex items-center justify-center gap-5 px-4 pb-2.5 xl:hidden [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center [&>a]:justify-center [&>a]:gap-2 [&>a]:rounded-xl [&>a]:px-3 [&>a]:py-2 [&>a]:text-xs [&>a]:font-semibold [&>button]:inline-flex [&>button]:min-h-11 [&>button]:items-center [&>button]:gap-2 [&>button]:text-xs [&>button]:font-semibold xl:hidden">
        {user ? <Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={15} /> My profile</Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }}><UserRound size={15} /> User sign in</button>}
        <Link href="/priest_login" className="border border-gold/30 bg-gold/10 text-gold-dark" onClick={() => setMenuOpen(false)}><Church size={15} /> Priest sign in <ArrowUpRight size={13} /></Link>
      </div>
      {menuOpen && <div id="mobile-navigation" className="flex max-h-[calc(100dvh-150px)] flex-col gap-1 overflow-y-auto border-t border-navy/10 px-6 pt-3 pb-6 [&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:py-3 [&>a]:text-sm">
        {links.map(item => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
        {user && <Link href="/profile" onClick={() => setMenuOpen(false)}>My parish profile</Link>}
        <button className={buttonClassName("primary")} onClick={() => { setMenuOpen(false); user ? onLogoutClick() : onLoginOrSignupClick(); }}>{user ? 'Sign out' : 'User sign in'}</button>
        <Link href="/priest_login" onClick={() => setMenuOpen(false)}><Church size={16} /> Priest sign in <ArrowUpRight size={16} /></Link>
      </div>}
    </header>
  );
}
