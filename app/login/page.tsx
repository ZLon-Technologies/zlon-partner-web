'use client';

import "../globals.css";

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

type AuthMode = 'password' | 'otp';
type LoadingState = 'sign-in' | 'request' | 'verify' | 'reset' | null;

const fieldClassName =
  'w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all';

const primaryButtonClassName =
  'w-full bg-neutral-950 text-white font-medium text-sm py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-6 shadow-sm disabled:cursor-not-allowed disabled:opacity-70';

function LoginContent() {
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const authError = searchParams.get('error');

  function clearFeedback() {
    setError(null);
    setNotice(null);
  }

  function switchToPasswordMode() {
    setAuthMode('password');
    setOtp('');
    setOtpRequested(false);
    clearFeedback();
  }

  function switchToOtpMode() {
    setAuthMode('otp');
    setPassword('');
    setOtp('');
    setOtpRequested(false);
    clearFeedback();
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading('sign-in');
    clearFeedback();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(null);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleForgotPassword() {
    clearFeedback();

    if (!email) {
      setError('Enter your email address first, then use Forgot? to request a reset link.');
      return;
    }

    setLoading('reset');

    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setNotice('If this account exists, a password reset link has been sent to your email.');
    }

    setLoading(null);
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

    router.push('/dashboard');
    router.refresh();
  }

  const isBusy = loading !== null;

  return (
    <div className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[420px] w-full flex flex-col items-center text-center relative">
      <div className="mb-6 text-neutral-950">
        <Lock size={32} strokeWidth={2} />
      </div>

      <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
        ZLon Partner Portal
      </h1>
      <p className="text-sm text-gray-500 mt-2 mb-8">
        Secure access to your salon dashboard.
      </p>

      {authError === 'unauthorized_role' && (
        <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center mb-6 uppercase tracking-wider">
          Access Denied. This portal is strictly for registered ZLon Salon Partners.
        </div>
      )}

      {authMode === 'password' ? (
        <form onSubmit={handlePasswordSignIn} className="w-full flex flex-col gap-4 text-left">
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@salon.com"
              className={fieldClassName}
            />
          </div>

          <div>
            <div className="flex justify-between items-center w-full mb-1">
              <label
                htmlFor="password"
                className="text-[11px] font-bold tracking-widest text-gray-500 block"
              >
                PASSWORD
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isBusy}
                className="text-[11px] font-semibold text-neutral-950 hover:underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className={fieldClassName}
            />
          </div>

          {(error || notice) && (
            <p className={`text-sm text-center ${error ? 'text-red-500' : 'text-gray-500'}`}>
              {error ?? notice}
            </p>
          )}

          <button type="submit" disabled={isBusy} className={primaryButtonClassName}>
            {loading === 'sign-in' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <button
            type="button"
            onClick={switchToOtpMode}
            disabled={isBusy}
            className="text-sm font-medium text-neutral-950 hover:underline mt-4 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            Login with one-time code (OTP)
          </button>
        </form>
      ) : (
        <form
          onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}
          className="w-full flex flex-col gap-4 text-left"
        >
          <div>
            <label
              htmlFor="otp-email"
              className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="otp-email"
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

          <button type="submit" disabled={isBusy} className={primaryButtonClassName}>
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
            ) : otpRequested ? (
              'Verify Login Code'
            ) : (
              'Send Login Code'
            )}
          </button>

          <button
            type="button"
            onClick={switchToPasswordMode}
            disabled={isBusy}
            className="text-sm font-medium text-neutral-950 hover:underline mt-4 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            Use email and password instead
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 py-16 antialiased font-sans">
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>

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
