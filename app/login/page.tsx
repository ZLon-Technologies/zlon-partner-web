'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import './globals.css';

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
    <div className="min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 antialiased font-sans">
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[420px] w-full flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-white flex items-center justify-center mb-8">
            <Lock className="w-8 h-8 text-neutral-950" strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight mb-2">ZLon Partner Portal</h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
            Secure access to your salon dashboard.
          </p>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="w-full space-y-6"
              >
                <div className="text-left">
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block px-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@salon.com"
                    className="w-full px-5 py-4 bg-[#F9F9F9] border border-gray-200 rounded-2xl text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all duration-200"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white font-bold py-4 px-6 rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-neutral-950/10 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Login Code
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOtp}
                className="w-full space-y-6"
              >
                <div className="text-left">
                  <button 
                    type="button" 
                    onClick={() => setStep('email')}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors mb-4"
                  >
                    <ArrowLeft size={14} />
                    Back to email
                  </button>
                  <label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block px-1">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-5 py-4 bg-[#F9F9F9] border border-gray-200 rounded-2xl text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all duration-200 tracking-[0.5em] text-center text-lg font-bold"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white font-bold py-4 px-6 rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-neutral-950/10 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
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
