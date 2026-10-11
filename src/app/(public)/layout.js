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
    <div className="parish-page min-h-screen bg-[#faf8f3]">
      <a href="#parish-content" className="skip-link">Skip to main content</a>
      <NavBar onLoginOrSignupClick={() => setloginOrSignupModal(true)} onLogoutClick={handleLogoutUser} />
      <main id="parish-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="parish-footer">
        <div className="footer-content"><div><Link href="/" className="parish-brand"><span className="brand-icon"><Church size={24} strokeWidth={1.4} /></span><span><strong>St. Antony’s Church</strong><small>ILLUPPUR · ROMAN CATHOLIC PARISH</small></span></Link><p>Growing in faith, serving with love, and walking together as one parish family.</p></div><nav aria-label="Footer navigation" className="footer-links"><Link href="/#services">Parish services</Link><Link href="/#priest">Our priest</Link><Link href="/#contact">Get in touch</Link><Link href="/priest_login">Priest portal</Link></nav></div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} St. Antony’s Church, Illuppur. All rights reserved.</p><p>Faith · Fellowship · Service</p></div>
      </footer>
      {loginOrSignupModal && (
        <LoginSignupModal onCancel={() => setloginOrSignupModal(false)} onSuccess={() => { setloginOrSignupModal(false); }} />)
      }
    </div>
  )
}

export default PublicLayout;
