'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
        shouldCreateUser: false, // Assume partners are pre-registered or created elsewhere
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">ZLon Partner Portal</h1>
          <p className="text-neutral-500 mt-2 text-sm">Sign in to manage your salon</p>
        </div>

        <motion.div 
          layout
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@salon.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Login Code'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-2">
                    Enter 6-digit code
                  </label>
                  <p className="text-xs text-neutral-500 mb-4">
                    Sent to {email}. <button type="button" onClick={() => setStep('email')} className="text-neutral-900 underline underline-offset-2">Change email</button>
                  </p>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all text-neutral-900 placeholder:text-neutral-400 tracking-[0.5em] text-center text-lg font-semibold"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
