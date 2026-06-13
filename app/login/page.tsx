'use client';

import "../globals.css";

import { useState, type FormEvent, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ChevronDown } from 'lucide-react';

import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const COUNTRY_CODES = [
  { code: '+91', name: 'IN' },
  { code: '+1', name: 'US' },
  { code: '+44', name: 'UK' },
];

const fieldClassName =
  'w-full px-4 py-3.5 bg-[#F9F9F9] border border-gray-200 rounded-xl text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all';

const primaryButtonClassName =
  'w-full bg-neutral-950 text-white font-medium text-sm py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-6 shadow-sm disabled:cursor-not-allowed disabled:opacity-70';

function OtpInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = value.split('');
    newOtp[index] = val.slice(-1);
    const combined = newOtp.join('');
    onChange(combined);

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  return (
    <div className="flex justify-between gap-2 mb-6">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => { inputs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInput(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-xl font-bold text-black bg-gray-100 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
        />
      ))}
    </div>
  );
}

function LoginContent() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  async function handleSendOTP(e: FormEvent) {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error('Recaptcha not initialized');
      
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP(e: FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!confirmationResult) throw new Error('Session expired');
      
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;

      // MANDATORY CHECK: Verify if the user exists in the 'partners' collection
      const partnerRef = doc(db, 'partners', user.uid);
      const partnerSnap = await getDoc(partnerRef);

      if (!partnerSnap.exists()) {
        await signOut(auth);
        setError('Access Denied. This portal is strictly for registered ZLon Salon Partners.');
        setConfirmationResult(null);
        setOtpCode('');
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[420px] w-full flex flex-col items-center text-center relative">
      <div id="recaptcha-container" />
      
      <div className="mb-8 flex justify-center w-full">
        <img src="/zlon-partner-logo.png" alt="ZLon Partner Logo" className="h-10 w-auto object-contain" />
      </div>

      <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
        Partner Portal
      </h1>
      <p className="text-sm text-gray-500 mt-2 mb-8">
        Secure access to your salon dashboard.
      </p>

      {!confirmationResult ? (
        <form onSubmit={handleSendOTP} className="w-full flex flex-col text-left">
          <label className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block">
            PHONE NUMBER
          </label>
          <div className="flex gap-2 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="appearance-none bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-950 pr-8"
              >
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <input
              type="tel"
              placeholder="9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={fieldClassName}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={isLoading} className={primaryButtonClassName}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Login Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="w-full flex flex-col text-left">
          <p className="text-center text-sm text-gray-500 mb-6 font-medium">
            Enter the code sent to <span className="text-black font-bold">{countryCode} {phoneNumber}</span>
          </p>
          
          <OtpInput value={otpCode} onChange={setOtpCode} />

          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

          <button type="submit" disabled={isLoading} className={primaryButtonClassName}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Verify & Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setConfirmationResult(null)}
            className="text-sm font-medium text-neutral-950 hover:underline mt-4 text-center"
          >
            Change phone number
          </button>
        </form>
      )}
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
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