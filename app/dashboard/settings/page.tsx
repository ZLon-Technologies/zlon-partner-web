'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Clock, Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const [salonData, setSalonData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, 'salons'), where('owner_id', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const salonDoc = querySnapshot.docs[0];
            const data = salonDoc.data();
            setSalonId(salonDoc.id);
            setSalonData({
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              pincode: data.pincode || '',
            });
          }
        } catch (err) {
          console.error("Error fetching salon data:", err);
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalonData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    if (!salonId) return;
    setSaving(true);
    setMessage(null);

    try {
      const salonRef = doc(db, 'salons', salonId);
      await updateDoc(salonRef, {
        name: salonData.name,
        email: salonData.email,
        phone: salonData.phone,
        address: salonData.address,
        city: salonData.city,
        state: salonData.state,
        pincode: salonData.pincode,
      });

      setMessage({ type: 'success', text: 'Salon profile updated successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Error updating salon profile:", error);
      setMessage({ type: 'error', text: error.message });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Business Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Configure your salon profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Salon Profile */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User size={20} className="text-neutral-950" />
              <h2 className="text-lg font-bold text-neutral-950">Salon Profile</h2>
            </div>
            {message && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} flex items-center gap-1.5 animate-in fade-in zoom-in-95`}>
                {message.type === 'success' && <CheckCircle2 size={14} />}
                {message.text}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-bold tracking-widest uppercase">Loading Profile...</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Salon Name</label>
                  <input name="name" value={salonData.name} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Primary Email</label>
                  <input name="email" value={salonData.email} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
                </div>
              </div>
              
              {/* Row 2 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Phone Number</label>
                <input name="phone" value={salonData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
              </div>

              {/* Row 3 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Street Address</label>
                <input name="address" value={salonData.address} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">City</label>
                  <input name="city" value={salonData.city} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">State</label>
                  <input name="state" value={salonData.state} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Pincode</label>
                  <input name="pincode" value={salonData.pincode} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all" />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handleUpdate}
                  disabled={saving || !salonId}
                  className="bg-neutral-950 text-white px-10 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Operating Hours */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-neutral-950" />
            <h2 className="text-lg font-bold text-neutral-950">Operating Hours</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 italic">Configure your weekly availability for bookings.</p>
            {['Monday - Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-none">
                <span className="font-bold text-neutral-950">{day}</span>
                <span className="text-sm font-medium text-gray-400">09:00 AM - 09:00 PM</span>
              </div>
            ))}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={20} className="text-neutral-950" />
            <h2 className="text-lg font-bold text-neutral-950">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Booking Confirmations', desc: 'Receive alerts for new successful bookings.' },
              { label: 'Staff Shift Alerts', desc: 'Get notified when staff members check in.' },
              { label: 'Revenue Reports', desc: 'Daily summary of salon earnings.' }
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-950">{pref.label}</p>
                  <p className="text-xs text-gray-400 font-medium">{pref.desc}</p>
                </div>
                <div className="w-10 h-6 bg-neutral-950 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
