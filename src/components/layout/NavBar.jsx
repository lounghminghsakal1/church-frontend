'use client';
import { buttonClassName } from '@/components/ui/styles';
import { Church, Menu, X, ArrowUpRight, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-background/95 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 md:gap-6 md:px-8 md:py-5">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex min-w-0 items-center gap-2.5 md:shrink-0 md:gap-3 [&_strong]:block [&_strong]:font-serif [&_strong]:text-base [&_strong]:font-semibold md:[&_strong]:text-xl [&_small]:mt-1 [&_small]:block [&_small]:text-[7px] [&_small]:tracking-widest [&_small]:text-muted md:[&_small]:text-[9px]"><span className="relative h-12 w-11 shrink-0 overflow-hidden rounded-t-3xl rounded-b-lg border border-accent/40 bg-accent/5 md:h-14 md:w-12"><Image src="/images/church/st-antony-illuppur.webp" alt="" fill sizes="48px" className="scale-[1.45] object-cover object-[50%_35%]" /></span><span><strong>St. Antony’s Church</strong><small>ILLUPPUR · ROMAN CATHOLIC PARISH</small></span></Link>
        <div className="hidden xl:flex items-center gap-6">
          {links.map(item => <Link key={item.label} href={item.href} aria-current={item.href === pathname ? 'page' : undefined} className="text-sm text-muted transition-colors hover:text-ink aria-[current=page]:text-ink">{item.label}</Link>)}
        </div>
        <div className="hidden xl:flex items-center gap-3">
          {user ? <><Link href="/profile" className="text-sm text-muted transition-colors hover:text-ink aria-[current=page]:text-ink flex items-center gap-2"><UserRound size={16} /> My parish profile</Link><button onClick={onLogoutClick} className="text-sm text-muted transition-colors hover:text-ink aria-[current=page]:text-ink">Sign out</button></> : <button onClick={onLoginOrSignupClick} className={buttonClassName("primary", "", "sm")}>User sign in <UserRound size={16} /></button>}
          <Link href="/priest_login" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-11 border-accent/30 bg-accent/10 text-xs text-accent-ink hover:bg-accent/20"><Church size={16} /> Priest sign in <ArrowUpRight size={14} /></Link>
        </div>
        <div className="xl:hidden flex items-center shrink-0">
          {user ? <Link href="/profile" className="p-3 rounded-xl" aria-label="My parish profile" onClick={() => setMenuOpen(false)}><UserRound size={20} /></Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }} className="p-3 rounded-xl" aria-label="Sign in to your parish account"><UserRound size={20} /></button>}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-3 rounded-xl" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </nav>
      <div className="flex items-center justify-center gap-5 px-4 pb-2.5 xl:hidden [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center [&>a]:justify-center [&>a]:gap-2 [&>a]:rounded-xl [&>a]:px-3 [&>a]:py-2 [&>a]:text-xs [&>a]:font-semibold [&>button]:inline-flex [&>button]:min-h-11 [&>button]:items-center [&>button]:gap-2 [&>button]:text-xs [&>button]:font-semibold xl:hidden">
        {user ? <Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={15} /> My profile</Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }}><UserRound size={15} /> User sign in</button>}
        <Link href="/priest_login" className="border border-accent/30 bg-accent/10 text-accent-ink" onClick={() => setMenuOpen(false)}><Church size={15} /> Priest sign in <ArrowUpRight size={13} /></Link>
      </div>
      {menuOpen && <div id="mobile-navigation" className="flex max-h-[calc(100dvh-150px)] flex-col gap-1 overflow-y-auto border-t border-ink/10 px-6 pt-3 pb-6 [&>a]:flex [&>a]:items-center [&>a]:gap-2 [&>a]:py-3 [&>a]:text-sm">
        {links.map(item => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
        {user && <Link href="/profile" onClick={() => setMenuOpen(false)}>My parish profile</Link>}
        <button className={buttonClassName("primary")} onClick={() => { setMenuOpen(false); user ? onLogoutClick() : onLoginOrSignupClick(); }}>{user ? 'Sign out' : 'User sign in'}</button>
        <Link href="/priest_login" onClick={() => setMenuOpen(false)}><Church size={16} /> Priest sign in <ArrowUpRight size={16} /></Link>
      </div>}
    </header>
  );
}
