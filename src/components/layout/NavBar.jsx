"use client";
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
  const links = [{ label: 'Home', href: '/' }, { label: 'Parish services', href: '/#services' }, { label: 'Our priest', href: '/#priest' }, { label: 'Parish life', href: '/#activities' }];
  return (
    <header className="parish-header">
      <nav aria-label="Main navigation" className="parish-nav">
        <Link href="/" onClick={() => setMenuOpen(false)} className="parish-brand"><span className="brand-icon"><Church size={25} strokeWidth={1.4} /></span><span><strong>St. Antony’s Church</strong><small>ILLUPPUR · ROMAN CATHOLIC PARISH</small></span></Link>
        <div className="hidden xl:flex items-center gap-6">
          {links.map(item => <Link key={item.label} href={item.href} aria-current={item.href === pathname ? 'page' : undefined} className="nav-link">{item.label}</Link>)}
        </div>
        <div className="hidden xl:flex items-center gap-3">
          {user ? <><Link href="/profile" className="nav-link flex items-center gap-2"><UserRound size={16} /> My parish profile</Link><button onClick={onLogoutClick} className="nav-link">Sign out</button></> : <button onClick={onLoginOrSignupClick} className="parish-button primary compact">User sign in <UserRound size={16} /></button>}
          <Link href="/priest_login" className="priest-signin-link"><Church size={16} /> Priest sign in <ArrowUpRight size={14} /></Link>
        </div>
        <div className="xl:hidden flex items-center shrink-0">
          {user ? <Link href="/profile" className="p-3 rounded-xl" aria-label="My parish profile" onClick={() => setMenuOpen(false)}><UserRound size={20} /></Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }} className="p-3 rounded-xl" aria-label="Sign in to your parish account"><UserRound size={20} /></button>}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-3 rounded-xl" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </nav>
      <div className="mobile-signin-options xl:hidden">
        {user ? <Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={15} /> My profile</Link> : <button onClick={() => { setMenuOpen(false); onLoginOrSignupClick(); }}><UserRound size={15} /> User sign in</button>}
        <Link href="/priest_login" className="mobile-priest-signin" onClick={() => setMenuOpen(false)}><Church size={15} /> Priest sign in <ArrowUpRight size={13} /></Link>
      </div>
      {menuOpen && <div id="mobile-navigation" className="mobile-navigation">
        {links.map(item => <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
        {user && <Link href="/profile" onClick={() => setMenuOpen(false)}>My parish profile</Link>}
        <button className="parish-button primary" onClick={() => { setMenuOpen(false); user ? onLogoutClick() : onLoginOrSignupClick(); }}>{user ? 'Sign out' : 'User sign in'}</button>
        <Link href="/priest_login" onClick={() => setMenuOpen(false)}><Church size={16} /> Priest sign in <ArrowUpRight size={16} /></Link>
      </div>}
    </header>
  );
}
