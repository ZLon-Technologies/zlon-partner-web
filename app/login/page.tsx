'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import '../globals.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 antialiased font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 max-w-md w-full flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">ZLon Partner Portal</h1>
          <p className="text-base text-gray-500 mb-2">Sign in to manage your salon</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSendOtp}
              className="flex flex-col gap-6"
            >
              <div>
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-neutral-950 mb-2 block">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@salon.com"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all duration-200"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-2xl hover:opacity-95 active:scale-95 transition-all duration-200 shadow-md shadow-neutral-950/10 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Login Code'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-6"
            >
              <div>
                <button 
                  type="button" 
                  onClick={() => setStep('email')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-neutral-950 transition-colors mb-4 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  Edit Email
                </button>
                <label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-neutral-950 mb-2 block">
                  Verification Code
                </label>
                <p className="text-sm text-gray-500 mb-4">We sent a 6-digit code to <span className="text-neutral-950 font-medium">{email}</span></p>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all duration-200 tracking-[0.5em] text-center text-lg font-bold"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-2xl hover:opacity-95 active:scale-95 transition-all duration-200 shadow-md shadow-neutral-950/10 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
      
      <p className="mt-8 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} ZLon Technologies. All rights reserved.
      </p>
    </div>
  );
}
