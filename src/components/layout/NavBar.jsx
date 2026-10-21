'use client';
import { buttonClassName } from '@/components/ui/styles';
import { Church, Menu, X, ArrowUpRight, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function NavBar({ onLoginOrSignupClick, onLogoutClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuthUser();
  const pathname = usePathname();
  const menuButton = useRef(null);
  const header = useRef(null);
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const outside = event => { if (!header.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside); };
  }, []);
  const links = [{ label: 'Home', href: '/' }, { label: 'Parish services', href: '/#services' }, { label: 'Our priest', href: '/#priest' }, { label: 'Announcements', href: '/#announcements' }, { label: 'Parish life', href: '/#activities' }];
  return (
    <header ref={header} className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 max-[380px]:gap-2 md:h-[88px] md:px-7 xl:px-10">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex min-w-0 shrink-0 items-center gap-2.5 max-[380px]:gap-2 md:gap-3">
          <span className="grid h-11 w-10 shrink-0 max-[380px]:w-9 place-items-center rounded-t-3xl rounded-b-lg border border-accent bg-soft md:h-12 md:w-11"><Church size={26} strokeWidth={1.25} /></span>
          <span><strong className="block font-serif text-[17px] max-[380px]:text-[15px] font-normal leading-tight tracking-tight md:text-xl">St. Antony’s Church</strong><small className="mt-1.5 block text-[8px] max-[380px]:text-[6.5px] tracking-[.15em] text-muted md:text-[9px]">ILLUPPUR · ROMAN CATHOLIC PARISH</small></span>
        </Link>
        <div className="hidden items-center gap-5 xl:flex">
          {links.map(item => <Link key={item.label} href={item.href} aria-current={item.href === pathname ? 'page' : undefined} className="inline-flex min-h-11 items-center border-b-2 border-transparent text-[13px] text-muted transition-colors hover:border-accent hover:text-ink aria-[current=page]:border-accent aria-[current=page]:text-ink">{item.label}</Link>)}
        </div>
        <div className="hidden items-center gap-4 xl:flex">
          {user ? <><Link href="/profile" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"><UserRound size={16} /> My profile</Link><button onClick={onLogoutClick} className="min-h-11 text-xs text-muted">Sign out</button></> : <button onClick={onLoginOrSignupClick} className={buttonClassName('primary', '', 'sm')}>Sign in <UserRound size={16} /></button>}
          <Link href="/priest_login" className="inline-flex min-h-11 items-center gap-1 text-xs text-muted hover:text-ink">Priest portal <ArrowUpRight size={14} /></Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 xl:hidden">
          {user ? <Link href="/profile" className="grid size-11 place-items-center rounded-lg hover:bg-soft" aria-label="My parish profile" onClick={() => setMenuOpen(false)}><UserRound size={20} /></Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }} className="grid size-11 place-items-center rounded-lg hover:bg-soft" aria-label="Sign in to your parish account"><UserRound size={20} /></button>}
          <button ref={menuButton} onClick={() => setMenuOpen(!menuOpen)} className="grid size-11 place-items-center rounded-lg hover:bg-soft" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </nav>
      {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="parish-menu absolute inset-x-0 top-full flex max-h-[calc(100dvh-76px)] flex-col gap-1 overflow-y-auto border-b border-line bg-white px-6 pt-3 pb-6 shadow-lg shadow-ink/5 xl:hidden">
        {links.map(item => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-between border-b border-line/60 text-sm">{item.label}<ArrowUpRight size={15} /></Link>)}
        <div className="mt-4 flex flex-wrap items-center gap-5"><button className={buttonClassName('primary')} onClick={() => { setMenuOpen(false); user ? onLogoutClick() : onLoginOrSignupClick(); }}>{user ? 'Sign out' : 'User sign in'}</button><Link href="/priest_login" onClick={() => setMenuOpen(false)} className="inline-flex min-h-12 items-center gap-2 text-sm"><Church size={16} /> Priest sign in <ArrowUpRight size={16} /></Link></div>
      </nav>}
    </header>
  );
}
