import React from 'react'
import NavBar from '@/components/layout/NavBar'
import { Toaster } from 'sonner'

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F9F6F0] font-serif">
      <NavBar />
      <main className="pt-20">
        {children}
      </main>
      <footer className="bg-[#0F2A4A] text-[#C9A84C] text-center py-8 mt-20 text-sm tracking-widest uppercase font-sans">
        © {new Date().getFullYear()} St. Antony's Church, Illuppur — All Rights Reserved
      </footer>
      <Toaster richColors />
    </div>
  )
}

export default PublicLayout;