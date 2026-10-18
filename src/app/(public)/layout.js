"use client";
import React from 'react'
import NavBar from '@/components/layout/NavBar'
import { useState } from 'react';
import LoginSignupModal from '@/components/common_components/LoginSignupModal';
import { apiPost } from '@/services/axios';
import { toast } from 'sonner';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Church } from 'lucide-react';

const PublicLayout = ({ children }) => {
  const [loginOrSignupModal, setloginOrSignupModal] = useState(false);
  const { setUser } = useAuthUser();
  const router = useRouter();

  const handleLogoutUser = async () => {
    try {
      const res = await apiPost(`/auth/user/logout`);
      if(res.status === "failure") {
        toast.error("Failed to logout, try later");
        return;
      }
      router.push("/");
      setUser(null);
      toast.success("logged out successfully");
    } catch(err) {
      toast.error("Failed to logout, "+err.message);
    }
  }

  return (
    <div className="font-sans min-h-screen bg-background">
      <a href="#parish-content" className="fixed -top-24 left-5 z-[10000] rounded-xl bg-ink px-5 py-3 text-white focus:top-3">Skip to main content</a>
      <NavBar onLoginOrSignupClick={() => setloginOrSignupModal(true)} onLogoutClick={handleLogoutUser} />
      <main id="parish-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="border-t border-ink/10 bg-accent/5 px-5 pt-10 pb-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 md:flex-row [&>div>p]:mt-4 [&>div>p]:max-w-xs [&>div>p]:text-xs [&>div>p]:text-muted"><div><Link href="/" className="flex min-w-0 items-center gap-2.5 md:shrink-0 md:gap-3 [&_strong]:block [&_strong]:font-serif [&_strong]:text-base [&_strong]:font-semibold md:[&_strong]:text-xl [&_small]:mt-1 [&_small]:block [&_small]:text-[7px] [&_small]:tracking-widest [&_small]:text-muted md:[&_small]:text-[9px]"><span className="grid h-11 w-9 shrink-0 place-items-center rounded-t-3xl rounded-b-lg border border-accent/40 text-accent-ink md:h-12 md:w-11"><Church size={24} strokeWidth={1.4} /></span><span><strong>St. Antony’s Church</strong><small>ILLUPPUR · ROMAN CATHOLIC PARISH</small></span></Link><p>Growing in faith, serving with love, and walking together as one parish family.</p></div><nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-5 text-xs md:gap-7"><Link href="/#services">Parish services</Link><Link href="/#priest">Our priest</Link><Link href="/#contact">Get in touch</Link><Link href="/priest_login">Priest portal</Link></nav></div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-5 border-t border-ink/10 pt-5 text-xs text-muted md:flex-row"><p>© {new Date().getFullYear()} St. Antony’s Church, Illuppur. All rights reserved.</p><p>Faith · Fellowship · Service</p></div>
      </footer>
      {loginOrSignupModal && (
        <LoginSignupModal onCancel={() => setloginOrSignupModal(false)} onSuccess={() => { setloginOrSignupModal(false); }} />)
      }
    </div>
  )
}

export default PublicLayout;
