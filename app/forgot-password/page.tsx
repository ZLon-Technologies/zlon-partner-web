'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Key, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for the password reset link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 antialiased font-sans">
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[420px] w-full flex flex-col items-center text-center relative"
        >
          <div className="mb-6 text-neutral-950">
            <Key size={32} strokeWidth={2} />
          </div>

          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Enter your registered email address and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4 mt-8">
            <div className="text-left">
              <label htmlFor="email" className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@salon.com"
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium text-left">{error}</p>
            )}

            {message && (
              <p className="text-green-600 text-xs font-medium text-left">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-950 text-white font-medium text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-2 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-neutral-950 font-medium mt-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </motion.div>
      </main>

      <footer className="w-full py-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <button className="hover:text-neutral-950 transition-colors text-sm font-medium">Privacy Policy</button>
          <span className="text-gray-300">•</span>
          <button className="hover:text-neutral-950 transition-colors text-sm font-medium">Terms of Service</button>
        </div>
        <p className="text-sm font-medium text-gray-400">
          &copy; 2026 ZLon Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
