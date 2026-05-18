'use client';

import "../globals.css";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Lock } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

const fieldClassName =
  'w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<'request' | 'verify' | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function clearFeedback() {
    setError(null);
    setNotice(null);
  }

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading('request');
    clearFeedback();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(null);
      return;
    }

    setOtp('');
    setOtpRequested(true);
    setNotice(`We sent a 6-digit code to ${email}.`);
    setLoading(null);
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading('verify');
    clearFeedback();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(null);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 py-16 antialiased font-sans">
      <div className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[420px] w-full flex flex-col items-center text-center relative">
        <div className="mb-6 text-neutral-950">
          <Lock size={32} strokeWidth={2} />
        </div>

        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
          ZLon Partner Portal
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Secure access to your salon dashboard.
        </p>

        <form
          onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}
          className="w-full flex flex-col gap-4 mt-8 text-left"
        >
          <div>
            <label
              htmlFor="email"
              className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (otpRequested) {
                  setOtpRequested(false);
                  setOtp('');
                  clearFeedback();
                }
              }}
              placeholder="name@salon.com"
              className={fieldClassName}
            />
          </div>

          {otpRequested && (
            <div>
              <label
                htmlFor="otp"
                className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
              >
                ONE-TIME CODE
              </label>
              <input
                id="otp"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className={fieldClassName}
              />
            </div>
          )}

          {(error || notice) && (
            <p className={`text-sm text-center ${error ? 'text-red-500' : 'text-gray-500'}`}>
              {error ?? notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading !== null}
            className="w-full bg-neutral-950 text-white font-medium text-sm py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-6 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading === 'request' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Login Code
              </span>
            ) : loading === 'verify' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Code
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>{otpRequested ? 'Verify Login Code' : 'Send Login Code'}</span>
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </button>
        </form>
      </div>

      <div className="absolute bottom-8 flex flex-col items-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>Privacy Policy</span>
          <span>&bull;</span>
          <span>Terms of Service</span>
        </div>
        <div>&copy; 2024 ZLon Technologies. All rights reserved.</div>
      </div>
    </div>
  );
}
