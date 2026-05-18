'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

type AuthMode = 'password' | 'otp';
type PendingAction = 'password' | 'otp-request' | 'otp-verify' | 'reset' | null;

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const router = useRouter();
  const supabase = createClient();

  function clearFeedback() {
    setError(null);
    setNotice(null);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setError(null);

    if (otpRequested) {
      setOtp('');
      setOtpRequested(false);
      setNotice(null);
    }
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction('password');
    clearFeedback();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPendingAction(null);
      return;
    }

    router.push('/');
    router.refresh();
  }

  async function handleRequestOtp() {
    clearFeedback();

    if (!email) {
      setError('Enter your email address first to request a one-time code.');
      return;
    }

    setPendingAction('otp-request');

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setPendingAction(null);
      return;
    }

    setOtp('');
    setOtpRequested(true);
    setNotice(`We sent a 6-digit code to ${email}.`);
    setPendingAction(null);
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction('otp-verify');
    clearFeedback();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError(verifyError.message);
      setPendingAction(null);
      return;
    }

    router.push('/');
    router.refresh();
  }

  async function handleForgotPassword() {
    clearFeedback();

    if (!email) {
      setError('Enter your email address first, then use Forgot? to request a reset link.');
      return;
    }

    setPendingAction('reset');

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

    setPendingAction(null);
  }

  function switchToOtpMode() {
    setAuthMode('otp');
    setPassword('');
    setOtp('');
    setOtpRequested(false);
    clearFeedback();
  }

  function switchToPasswordMode() {
    setAuthMode('password');
    setOtp('');
    setOtpRequested(false);
    clearFeedback();
  }

  const isBusy = pendingAction !== null;

  return (
    <div className="relative min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 antialiased font-sans">
      <div className="relative flex w-full max-w-[420px] flex-col items-center rounded-[2rem] border border-gray-100 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mb-6 text-neutral-950">
          <Lock size={32} strokeWidth={2} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
          ZLon Partner Portal
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Secure access to your salon dashboard.
        </p>

        <div className="mt-8 flex w-full flex-col gap-4 text-left">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[11px] font-bold tracking-widest text-gray-500"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="name@salon.com"
              className="w-full rounded-xl border border-gray-200 bg-[#F9F9F9] px-4 py-3.5 text-sm text-neutral-950 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </div>

          {authMode === 'password' ? (
            <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold tracking-widest text-gray-500"
                  >
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isBusy}
                    className="text-[11px] font-bold tracking-wide text-gray-500 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="w-full rounded-xl border border-gray-200 bg-[#F9F9F9] px-4 py-3.5 text-sm text-neutral-950 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>

              {(error || notice) && (
                <p
                  className={`text-sm ${
                    error ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {error ?? notice}
                </p>
              )}

              <button
                type="submit"
                disabled={isBusy}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pendingAction === 'password' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              {otpRequested ? (
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1 block text-[11px] font-bold tracking-widest text-gray-500"
                  >
                    ONE-TIME CODE
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Enter 6-digit code"
                    className="w-full rounded-xl border border-gray-200 bg-[#F9F9F9] px-4 py-3.5 text-sm text-neutral-950 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              ) : (
                <p className="text-sm leading-6 text-gray-500">
                  Request a one-time code if you prefer passwordless access for this session.
                </p>
              )}

              {(error || notice) && (
                <p
                  className={`text-sm ${
                    error ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {error ?? notice}
                </p>
              )}

              {otpRequested ? (
                <button
                  type="submit"
                  disabled={isBusy}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pendingAction === 'otp-verify' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify One-Time Code'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isBusy}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pendingAction === 'otp-request' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    'Send Login Code'
                  )}
                </button>
              )}
            </form>
          )}

          {authMode === 'password' ? (
            <div className="mt-2 border-t border-gray-100 pt-4 text-center">
              <button
                type="button"
                onClick={switchToOtpMode}
                disabled={isBusy}
                className="mt-4 cursor-pointer text-sm font-medium text-neutral-950 transition-all hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login with one-time code (OTP)
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={switchToPasswordMode}
                disabled={isBusy}
                className="text-sm font-medium text-neutral-950 transition-all hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Use email and password instead
              </button>

              {otpRequested && (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isBusy}
                  className="text-sm font-medium text-gray-500 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resend code
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 flex flex-col items-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>Privacy Policy</span>
          <span>&bull;</span>
          <span>Terms of Service</span>
        </div>
        <div>&copy; 2026 ZLon Technologies. All rights reserved.</div>
      </div>
    </div>
  );
}
