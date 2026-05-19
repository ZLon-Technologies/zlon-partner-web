'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle, ClipboardList, Loader2 } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

type FormData = {
  salon_name: string;
  owner_full_name: string;
  email_address: string;
  phone_number: string;
  city: string;
};

const initialFormData: FormData = {
  salon_name: '',
  owner_full_name: '',
  email_address: '',
  phone_number: '',
  city: '',
};

const fieldClassName =
  'w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-neutral-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all';

export default function ApplyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = createClient();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('salon_applications')
      .insert([{ ...formData }]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setIsSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 antialiased font-sans py-12 overflow-y-auto">
      <div className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-[500px] w-full flex flex-col items-center text-center relative mt-auto mb-auto">
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 text-emerald-600">
              <CheckCircle size={40} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
              Application Received
            </h1>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-[360px]">
              Thank you for applying. We will review your salon details and contact you via email with next steps.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-neutral-950">
              <ClipboardList size={32} strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
              Apply for ZLon Partner
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-[380px]">
              Submit your details to join our premium salon network. Our team will review your application.
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-8 text-left">
              <div>
                <label
                  htmlFor="salon_name"
                  className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
                >
                  SALON NAME
                </label>
                <input
                  id="salon_name"
                  name="salon_name"
                  type="text"
                  required
                  value={formData.salon_name}
                  onChange={handleChange}
                  placeholder="Royal Barbers"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="owner_full_name"
                  className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
                >
                  OWNER FULL NAME
                </label>
                <input
                  id="owner_full_name"
                  name="owner_full_name"
                  type="text"
                  required
                  value={formData.owner_full_name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="email_address"
                  className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="email_address"
                  name="email_address"
                  type="email"
                  required
                  value={formData.email_address}
                  onChange={handleChange}
                  placeholder="owner@salon.com"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="phone_number"
                  className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
                >
                  PHONE NUMBER
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="text-[11px] font-bold tracking-widest text-gray-500 mb-1 block"
                >
                  CITY
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Jabalpur, Indore, etc."
                  className={fieldClassName}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-950 text-white font-medium text-sm py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 mt-4 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Application
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>

              <p className="text-sm text-gray-500 text-center mt-2">
                Already an approved partner?{' '}
                <Link href="/login" className="font-medium text-neutral-950 hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
