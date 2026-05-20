import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, TrendingUp, Cpu, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] font-sans antialiased text-neutral-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="ZLon Logo" 
            width={40} 
            height={40} 
            className="rounded-xl shadow-sm"
          />
          <span className="font-bold tracking-tight text-lg">ZLon Partner</span>
        </div>
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="font-medium text-sm text-gray-500 hover:text-neutral-950 transition-colors"
          >
            Partner Login
          </Link>
          <Link 
            href="/apply" 
            className="bg-neutral-950 text-white px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all active:scale-95"
          >
            Apply Now
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest border border-gray-200/50">
          The exclusive network for premium salons
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] text-neutral-950">
          Elevate Your Salon&apos;s <br />
          <span className="text-gray-400">Digital Experience.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mt-8 max-w-2xl font-medium leading-relaxed">
          Manage high-end bookings, optimize staff schedules, and unlock AI-driven insights with the ZLon Partner Portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full sm:w-auto">
          <Link 
            href="/apply" 
            className="bg-neutral-950 text-white px-10 py-5 rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95"
          >
            Apply to Join
            <ArrowRight size={18} />
          </Link>
          <Link 
            href="/login" 
            className="bg-white border border-gray-200 text-neutral-950 px-10 py-5 rounded-full font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            Partner Login
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="w-full bg-white py-32 px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mb-3 tracking-tight">Seamless Booking Management</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Experience a world-class calendar interface designed for high-volume, premium salon operations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mb-3 tracking-tight">Advanced Revenue Analytics</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Track your salon&apos;s performance with real-time financial reporting and growth forecasting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300">
                <Cpu size={28} />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mb-3 tracking-tight">AI-Powered Operations</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Leverage ZLon&apos;s proprietary AI to optimize staff allocation and personalized customer experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center bg-[#F9F9F9]">
        <div className="flex items-center justify-center gap-6 text-sm font-medium text-gray-500 mb-6">
          <Link href="/privacy" className="hover:text-neutral-950 transition-colors">Privacy Policy</Link>
          <span className="text-gray-200">•</span>
          <Link href="/terms" className="hover:text-neutral-950 transition-colors">Terms of Service</Link>
          <span className="text-gray-200">•</span>
          <Link href="/apply" className="hover:text-neutral-950 transition-colors">Apply Now</Link>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          &copy; 2026 ZLon Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
