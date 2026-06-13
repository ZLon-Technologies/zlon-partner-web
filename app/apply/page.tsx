'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, ShieldCheck, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, storage } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Autocomplete from "react-google-autocomplete";

const CATEGORIES = ['Hair Salon', 'Barbershop', 'Nail Studio', 'Med Spa'];

const DEFAULT_SERVICES: Record<string, any[]> = {
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
  'Med Spa': [
    { name: "Swedish Massage", price: 2000, duration: 60, selected: true },
    { name: "Deep Tissue Massage", price: 2500, duration: 60, selected: true },
    { name: "Body Scrub", price: 1500, duration: 45, selected: true },
    { name: "Facial", price: 1800, duration: 60, selected: true }
  ]
};

const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

export default function MultiStepRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycError, setKycError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Centralized State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    otpSent: false,
    otp: '',
    salonName: '',
    kycNumber: '',
    searchLocation: '',
    manualAddress: '',
    lat: null as number | null,
    lng: null as number | null,
    document_url: '',
    category: CATEGORIES[0],
    services: [] as any[]
  });

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleSendOtp = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || formData.mobile.length < 10) {
      setError("Please fill all identity fields with a valid mobile number.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const formattedMobile = formData.mobile.startsWith('+') ? formData.mobile : `+91${formData.mobile}`;
      
      let verifier = (window as any).recaptchaVerifier;
      if (!verifier) {
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
        (window as any).recaptchaVerifier = verifier;
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedMobile, verifier);
      setConfirmationResult(confirmation);
      setFormData(prev => ({ ...prev, otpSent: true }));
      setToast({ message: "OTP sent successfully!", type: 'success' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
      if (err.code === 'auth/invalid-phone-number') {
        setError("Invalid phone number. Please include country code or enter 10 digits.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    if (formData.otp.length !== 6) {
      setError("Please enter the 6-digit OTP sent to your mobile.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmationResult.confirm(formData.otp);
      setToast({ message: "Mobile verified!", type: 'success' });
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${generateUniqueId()}.${fileExt}`;
      const storageRef = ref(storage, `verification-docs/${fileName}`);

      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      setFormData(prev => ({ ...prev, document_url: publicUrl }));
      setToast({ message: "Verification document uploaded!", type: 'success' });
    } catch (err: any) {
      console.error(err);
      setError("Failed to upload document. Please ensure Firebase Storage is configured correctly.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = () => {
    setKycError(null);
    if (!formData.salonName.trim() || !formData.searchLocation.trim() || !formData.manualAddress.trim() || !formData.kycNumber.trim()) {
      setError("Please complete all business and location fields.");
      return;
    }

    if (!formData.document_url) {
      setError("Please upload a verification document (License/ID).");
      return;
    }

    // Basic KYC Validation (Aadhaar 12 digits, PAN 10 chars, GST 15 chars)
    const kycClean = formData.kycNumber.replace(/\s/g, '');
    const isKycValid = /^[A-Z0-9]{10,15}$/i.test(kycClean);
    
    if (!isKycValid) {
      setKycError("Please enter a valid Aadhaar, PAN or GST number.");
      return;
    }

    setError(null);
    // Setup initial services based on selected category if not already set or category changed
    const initialServices = DEFAULT_SERVICES[formData.category].map(s => ({
      ...s,
      id: generateUniqueId()
    }));
    setFormData(prev => ({ ...prev, services: initialServices }));
    setStep(3);
  };

  const handleStep3Next = () => {
    const active = formData.services.filter(s => s.selected);
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
      const user = auth.currentUser;

      // Create Salon
      const salonRef = await addDoc(collection(db, 'salons'), {
        name: formData.salonName,
        owner_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.mobile,
        address: formData.manualAddress,
        latitude: formData.lat,
        longitude: formData.lng,
        document_url: formData.document_url,
        kyc_number: formData.kycNumber,
        status: 'pending',
        owner_id: user?.uid || null,
        created_at: new Date().toISOString()
      });

      // Create Services
      const activeServices = formData.services.filter(s => s.selected);

      for (const s of activeServices) {
        await addDoc(collection(db, 'services'), {
          salon_id: salonRef.id,
          name: s.name,
          category: formData.category,
          price: s.price,
          duration_minutes: s.duration,
          created_at: new Date().toISOString()
        });
      }

      setToast({ message: 'Salon launched successfully! Redirecting...', type: 'success' });
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to launch salon. Please try again.");
      setLoading(false);
    }
  };

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    }));
  };

  const updateServiceName = (id: string, newName: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, name: newName } : s)
    }));
  };

  const updateServicePrice = (id: string, newPrice: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, price: newPrice } : s)
    }));
  };

  const updateServiceDuration = (id: string, newDuration: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, duration: newDuration } : s)
    }));
  };

  const addCustomService = () => {
    const customService = {
      id: generateUniqueId(),
      name: "",
      price: 0,
      duration: 30,
      selected: true,
      isCustom: true
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, customService]
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] flex flex-col items-center py-12 px-6 overflow-y-auto antialiased font-sans">
      <div className="w-full max-w-[540px] mt-auto mb-auto relative">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute -top-16 left-0 right-0 z-50 flex justify-center"
            >
              <div className={`px-4 py-3 rounded-2xl shadow-lg border text-sm font-bold flex items-center gap-2 ${
                toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 mb-10">
          <img src="/zlon-partner-logo.png" alt="ZLon Partner" className="h-8 w-auto" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-8 py-10 rounded-[2rem] border border-gray-100 shadow-sm w-full relative"
        >
          {/* Progress Bar */}
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= s ? 'bg-neutral-950' : 'bg-gray-100'}`} />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 absolute top-24 right-8">
            Step {step} of 4
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Identity Verification</h1>
              <p className="text-sm text-gray-500 mb-8">Secure your account with a verified mobile number.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">First Name</label>
                    <input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Last Name</label>
                    <input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Mobile Number</label>
                  <input type="tel" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} disabled={formData.otpSent} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none disabled:opacity-50" placeholder="+91" />
                </div>

                {formData.otpSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-4 border-t border-gray-50 mt-6">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-center">Enter 6-Digit OTP</label>
                    <input type="text" maxLength={6} value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none text-center tracking-[0.5em] text-lg" placeholder="••••••" />
                  </motion.div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                {!formData.otpSent ? (
                  <button onClick={handleSendOtp} disabled={loading} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP'}
                  </button>
                ) : (
                  <button onClick={handleVerifyOtp} disabled={formData.otp.length !== 6 || loading} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify & Continue <ArrowRight size={16} /></>}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                <ArrowLeft size={14} /> Back
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Business & Location</h1>
              <p className="text-sm text-gray-500 mb-8">Tell us where your grooming space is located.</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Salon Name</label>
                  <input value={formData.salonName} onChange={e => setFormData({ ...formData, salonName: e.target.value })} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" placeholder="e.g. The Sharp Cut" />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Search Location</label>
                    <Autocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      onPlaceSelected={(place) => {
                        const lat = place.geometry?.location?.lat() || null;
                        const lng = place.geometry?.location?.lng() || null;
                        setFormData(prev => ({ 
                          ...prev, 
                          searchLocation: place.formatted_address || '',
                          lat,
                          lng
                        }));
                      }}
                      options={{
                        types: ["address"],
                        componentRestrictions: { country: "in" },
                      }}
                      defaultValue={formData.searchLocation}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none"
                      placeholder="Search your area..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Manual Address Details</label>
                    <textarea 
                      value={formData.manualAddress} 
                      onChange={e => setFormData({ ...formData, manualAddress: e.target.value })} 
                      rows={3}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none resize-none" 
                      placeholder="Shop No, Building, Street details..." 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Aadhaar / GSTIN / PAN</label>
                  <input 
                    value={formData.kycNumber} 
                    onChange={e => setFormData({ ...formData, kycNumber: e.target.value })} 
                    className={`w-full px-4 py-3.5 bg-gray-50 border ${kycError ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-medium text-neutral-950 focus:bg-white focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none`} 
                    placeholder="e.g. 1234 5678 9012 or ABCDE1234F" 
                  />
                  {kycError && <p className="text-[10px] text-red-500 font-bold ml-1">{kycError}</p>}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Verification Document (License/ID)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className={`w-full px-4 py-3.5 bg-gray-50 border-2 border-dashed ${formData.document_url ? 'border-green-500 bg-green-50/10' : 'border-gray-200 group-hover:border-gray-300'} rounded-xl text-sm font-medium text-gray-500 flex items-center justify-center gap-2 transition-all`}>
                      {formData.document_url ? (
                        <><Check size={16} className="text-green-600" /> <span className="text-green-700 font-bold">Document Ready</span></>
                      ) : (
                        <><Plus size={16} /> <span>Upload Photo or PDF</span></>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block text-left">Primary Category</label>
                  <div className="flex flex-wrap gap-2.5">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: c })}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${formData.category === c ? 'bg-neutral-950 border-neutral-950 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
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
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                <ArrowLeft size={14} /> Back
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Service Pre-population</h1>
              <p className="text-sm text-gray-500 mb-8">We&apos;ve added standard <strong className="text-neutral-950">{formData.category}</strong> services for you. Adjust them to make your profile instantly bookable.</p>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {formData.services.map(s => (
                  <div key={s.id} className={`p-4 border rounded-2xl flex flex-col gap-3 transition-colors ${s.selected ? 'border-neutral-300 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/50 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <div onClick={() => toggleService(s.id)} className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${s.selected ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-gray-300'}`}>
                        {s.selected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <input 
                        value={s.name}
                        onChange={(e) => updateServiceName(s.id, e.target.value)}
                        disabled={!s.selected}
                        placeholder={s.isCustom ? "Service Name (e.g. Bridal Makeup)" : "Service Name"}
                        className="font-bold text-sm text-neutral-950 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-gray-300"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 pl-9">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price ₹</span>
                        <input 
                          type="number" 
                          value={s.price} 
                          onChange={(e) => updateServicePrice(s.id, Number(e.target.value))} 
                          disabled={!s.selected}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-neutral-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" 
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mins</span>
                        <input 
                          type="number" 
                          value={s.duration} 
                          onChange={(e) => updateServiceDuration(s.id, Number(e.target.value))} 
                          disabled={!s.selected}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-neutral-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:border-neutral-950 transition-all outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addCustomService}
                  className="w-full py-4 mt-2 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-neutral-950 hover:border-neutral-300 hover:bg-gray-50 transition-all"
                >
                  <Plus size={16} /> Add Custom Service
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                <button onClick={handleStep3Next} className="w-full bg-neutral-950 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  Continue to Launch <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(3)} className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors uppercase tracking-widest">
                <ArrowLeft size={14} /> Back
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Ready for Takeoff 🚀</h1>
              <p className="text-sm text-gray-500 mb-8">Review your details before launching your salon to the public.</p>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4 mb-8 text-left">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Salon Name</span>
                  <span className="text-sm font-bold text-neutral-950">{formData.salonName}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Owner</span>
                  <span className="text-sm font-bold text-neutral-950">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex flex-col gap-1 pb-4 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</span>
                  <span className="text-sm font-bold text-neutral-950 leading-relaxed">{formData.manualAddress}</span>
                  <span className="text-[10px] text-gray-400 italic">{formData.searchLocation}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
                  <span className="text-sm font-bold text-neutral-950">{formData.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Services</span>
                  <span className="text-sm font-bold text-neutral-950">{formData.services.filter(s => s.selected).length}</span>
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
            </motion.div>
          )}
        </motion.div>
      </div>

      <div id="recaptcha-container"></div>

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
