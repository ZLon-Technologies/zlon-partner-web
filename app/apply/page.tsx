'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ClipboardList, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    salon_name: '',
    owner_name: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("PAYLOAD BEING SENT:", formData);
      const { data, error } = await supabase
        .from('salon_applications')
        .insert([formData]);

      if (error) {
        console.error("REAL DB ERROR:", error);
        throw new Error(error.message);
      }
      
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("SUBMIT ERROR:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 antialiased font-sans py-12 overflow-y-auto">
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[500px] w-full flex flex-col items-center text-center relative mt-auto mb-auto"
        >
          {isSubmitted ? (
            <div className="py-6 flex flex-col items-center">
              <div className="text-green-500 mb-6">
                <CheckCircle size={64} strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">Application Received</h1>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed px-4">
                Thank you for applying. We will review your salon details and contact you via email with next steps.
              </p>
              <Link 
                href="/login" 
                className="mt-8 text-sm font-bold text-neutral-950 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-neutral-950">
                <ClipboardList size={40} strokeWidth={2} />
              </div>

              <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">Apply for ZLon Partner</h1>
              <p className="text-sm text-gray-500 mt-2">
                Submit your details to join our premium salon network. Our team will review your application.
              </p>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-8">
                <div className="text-left">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 mb-1.5 block px-1 uppercase">
                    Salon Name
                  </label>
                  <input
                    required
                    name="salon_name"
                    value={formData.salon_name}
                    onChange={handleChange}
                    placeholder="e.g. Royal Barbers"
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all"
                  />
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 mb-1.5 block px-1 uppercase">
                    Owner Full Name
                  </label>
                  <input
                    required
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all"
                  />
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 mb-1.5 block px-1 uppercase">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@salon.com"
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all"
                  />
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 mb-1.5 block px-1 uppercase">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all"
                  />
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 mb-1.5 block px-1 uppercase">
                    City
                  </label>
                  <input
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Jabalpur"
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-medium text-left">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200 mt-4 shadow-lg shadow-neutral-950/10 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
                </button>

                <p className="mt-4 text-xs text-gray-500">
                  Already an approved partner?{' '}
                  <Link href="/login" className="font-bold text-neutral-950 hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            </>
          )}
        </motion.div>
      </main>

      <footer className="w-full py-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <button className="hover:text-neutral-950 transition-colors">Privacy Policy</button>
          <span className="text-gray-300">•</span>
          <button className="hover:text-neutral-950 transition-colors">Terms of Service</button>
        </div>
        <p className="text-sm font-medium text-gray-400">
          &copy; 2026 ZLon Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
