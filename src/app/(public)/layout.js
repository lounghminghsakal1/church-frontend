"use client";
import React from 'react'
import NavBar from '@/components/layout/NavBar'
import { useState } from 'react';
import LoginSignupModal from '@/components/common_components/LoginSignupModal';
import { apiPost } from '@/services/axios';
import { toast } from 'sonner';
import { useAuthUser } from '@/hooks/useAuthUser';

const PublicLayout = ({ children }) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { setUser } = useAuthUser();

  const handleLogoutUser = async () => {
    try {
      const res = await apiPost(`/auth/user/logout`);
      if(res.status === "failure") {
        toast.error("Failed to logout, try later");
      }
      setUser(null);
      toast.success("logged out successfully");
    } catch(err) {
      toast.error("Failed to logout, "+err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-serif">
      <NavBar onLoginClick={() => setLoginModalOpen(true)} onLogoutClick={handleLogoutUser} />
      <main className="pt-20">
        {children}
      </main>
      <footer className="bg-[#0F2A4A] text-[#C9A84C] text-center py-8 mt-20 text-sm tracking-widest uppercase font-sans">
        © {new Date().getFullYear()} St. Antony's Church, Illuppur — All Rights Reserved
      </footer>
      {loginModalOpen && (
        <div className='h-screen flex items-center justify-center'>
          <LoginSignupModal onCancel={() => setLoginModalOpen(false)} onSuccess={() => { setLoginModalOpen(false); }} />
        </div>)
      }
    </div>
  )
}

export default PublicLayout;