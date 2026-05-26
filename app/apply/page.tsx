'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['Hair Salon', 'Barbershop', 'Nail Studio', 'Spa'];

const DEFAULT_SERVICES = {
  'Hair Salon': [
    { name: "Women's Haircut", price: 800, duration: 45, selected: true },
    { name: "Root Touch Up", price: 1200, duration: 60, selected: true },
    { name: "Blow Dry", price: 400, duration: 30, selected: true },
    { name: "Hair Spa", price: 1500, duration: 60, selected: true }
  ],
  'Barbershop': [
    { name: "Men's Haircut", price: 400, duration: 30, selected: true },
    { name: "Beard Trim", price: 200, duration: 15, selected: true },
    { name: "Hot Towel Shave", price: 300, duration: 30, selected: true },
    { name: "Hair Color", price: 800, duration: 45, selected: false }
  ],
  'Nail Studio': [
    { name: "Classic Manicure", price: 500, duration: 30, selected: true },
    { name: "Gel Polish", price: 800, duration: 45, selected: true },
    { name: "Acrylic Extensions", price: 2000, duration: 90, selected: true },
    { name: "Classic Pedicure", price: 600, duration: 45, selected: true }
  ],
  'Spa': [
    { name: "Swedish Massage", price: 2000, duration: 60, selected: true },
    { name: "Deep Tissue Massage", price: 2500, duration: 60, selected: true },
    { name: "Body Scrub", price: 1500, duration: 45, selected: true },
    { name: "Facial", price: 1800, duration: 60, selected: true }
  ]
};

export default function MultiStepRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1 State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Step 2 State
  const [salonName, setSalonName] = useState('');
  const [pincode, setPincode] = useState('');
  const [kycNumber, setKycNumber] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Step 3 State
  const [services, setServices] = useState<any[]>([]);

  const supabase = createClient();

  const handleSendOtp = () => {
    if (!firstName.trim() || !lastName.trim() || mobile.length < 10) {
      setError("Please fill all identity fields with a valid mobile number.");
      return;
    }
    setError(null);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!salonName.trim() || !pincode.trim() || !kycNumber.trim()) {
      setError("Please complete all business verification fields.");
      return;
    }
    setError(null);
    // Setup initial services based on selected category
    const initialServices = DEFAULT_SERVICES[category as keyof typeof DEFAULT_SERVICES].map(s => ({
      ...s,
      id: Math.random().toString(36).substring(7)
    }));
    setServices(initialServices);
    setStep(3);
  };

  const handleStep3Next = () => {
    const active = services.filter(s => s.selected);
    if (active.length === 0) {
      setError("Please enable at least one service to continue.");
      return;
    }
    setError(null);
    setStep(4);
  };

  const handleLaunch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create Salon
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .insert({
          name: salonName,
          owner_name: `${firstName} ${lastName}`,
          phone: mobile,
          pincode: pincode,
          status: 'Active'
        })
        .select()
        .single();

      if (salonError) throw salonError;

      // Create Services
      const activeServices = services.filter(s => s.selected).map(s => ({
        salon_id: salonData.id,
        name: s.name,
        category: category,
        price: s.price,
        duration_minutes: s.duration
      }));

      if (activeServices.length > 0) {
        const { error: servicesError } = await supabase.from('services').insert(activeServices);
        if (servicesError) throw servicesError;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to launch salon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const updateServicePrice = (id: string, newPrice: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, price: newPrice } : s));
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] flex flex-col items-center py-12 px-6 overflow-y-auto antialiased font-sans">
      <div className="w-full max-w-[540px] mt-auto mb-auto">
        <div className="flex items-center justify-center gap-3 mb-10">
          <img src="/zlon-partner-logo.png" alt="ZLon Partner" className="h-8 w-auto" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm w-full relative"
        >
          {isSubmitted ? (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="text-green-500 mb-6">
                <CheckCircle2 size={64} strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">Welcome to ZLon! 🚀</h1>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed px-4">
                Your salon profile is now live and bookable on the network.
              </p>
              <Link 
                href="/login" 
                className="mt-8 text-sm font-bold text-neutral-950 hover:underline"
              >
                Sign In to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="flex gap-2 mb-10">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-neutral-950' : 'bg-gray-100'}`} />
                ))}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Identity Verification</h1>
                  <p className="text-sm text-gray-500 mb-8">Secure your account with a verified mobile number.</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">First Name</label>
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="Jane" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Last Name</label>
                        <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Mobile Number</label>
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} disabled={otpSent} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none disabled:opacity-50" placeholder="+91" />
                    </div>

                    {otpSent && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-4 border-t border-gray-50 mt-6">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-center">Enter 4-Digit OTP</label>
                        <input type="text" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none text-center tracking-[0.5em] text-lg" placeholder="••••" />
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                    {!otpSent ? (
                      <button onClick={handleSendOtp} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98]">
                        Send OTP
                      </button>
                    ) : (
                      <button onClick={handleVerifyOtp} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        Verify & Continue <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Business KYC</h1>
                  <p className="text-sm text-gray-500 mb-8">Tell us about your grooming space.</p>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Salon Name</label>
                      <input value={salonName} onChange={e => setSalonName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="e.g. The Sharp Cut" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Pincode</label>
                        <input value={pincode} onChange={e => setPincode(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="482001" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Aadhaar / GSTIN</label>
                        <input value={kycNumber} onChange={e => setKycNumber(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="Business Verification" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Primary Category</label>
                      <div className="flex flex-wrap gap-2.5">
                        {CATEGORIES.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCategory(c)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${category === c ? 'bg-neutral-950 border-neutral-950 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end">
                    <button onClick={handleStep2Next} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Service Pre-population</h1>
                  <p className="text-sm text-gray-500 mb-8">We&apos;ve added standard <strong className="text-neutral-950">{category}</strong> services for you. Toggle them on or edit prices to make your profile instantly bookable.</p>

                  <div className="space-y-3">
                    {services.map(s => (
                      <div key={s.id} className={`p-4 border rounded-2xl flex items-center justify-between transition-colors ${s.selected ? 'border-neutral-300 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/50 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <div onClick={() => toggleService(s.id)} className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${s.selected ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-gray-300'}`}>
                            {s.selected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm text-neutral-950">{s.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.duration} MINS</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-400">₹</span>
                          <input 
                            type="number" 
                            value={s.price} 
                            onChange={(e) => updateServicePrice(s.id, Number(e.target.value))} 
                            disabled={!s.selected}
                            className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-neutral-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end">
                    <button onClick={handleStep3Next} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      Continue to Launch <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <button onClick={() => setStep(3)} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Ready for Takeoff 🚀</h1>
                  <p className="text-sm text-gray-500 mb-8">Review your details before launching your salon to the public.</p>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4 mb-8 text-left">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Salon Name</span>
                      <span className="text-sm font-bold text-neutral-950">{salonName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Owner</span>
                      <span className="text-sm font-bold text-neutral-950">{firstName} {lastName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mobile</span>
                      <span className="text-sm font-bold text-neutral-950">{mobile}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
                      <span className="text-sm font-bold text-neutral-950">{category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Services</span>
                      <span className="text-sm font-bold text-neutral-950">{services.filter(s => s.selected).length}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={handleLaunch} 
                      disabled={loading}
                      className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Launch My Salon'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <footer className="w-full py-8 flex flex-col items-center gap-3 mt-auto">
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
