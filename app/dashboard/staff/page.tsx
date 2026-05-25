'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MoreHorizontal, X, Loader2, CheckCircle2, User, Phone, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface StaffMember {
  id: string | number;
  name: string;
  role: string;
  email: string;
  phone: string;
  salon_id: number;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [salonId, setSalonId] = useState<number | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
  });

  const supabase = createClient();
  const router = useRouter();

  const fetchStaff = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setOwnerEmail(user.email ?? null);
      // Get the salon_id for this user
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (salonData && !salonError) {
        setSalonId(salonData.id);
        
        // Fetch staff for this salon
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('salon_id', salonData.id)
          .order('name', { ascending: true });
          
        if (staffData) {
          setStaff(staffData);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) return;

    setIsSaving(true);
    setMessage(null);

    const { data, error } = await supabase
      .from('staff')
      .insert({
        salon_id: salonId,
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
      })
      .select()
      .single();

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsSaving(false);
    } else {
      setMessage({ type: 'success', text: 'Staff member invited successfully!' });
      setStaff(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Reset form and close after a brief delay to show success
      setFormData({ name: '', role: '', email: '', phone: '' });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
        setIsSaving(false);
        router.refresh();
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Team Members</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your stylists and salon staff.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!salonId}
          className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2 justify-center sm:justify-start disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={16} />
          Invite Staff
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs font-bold tracking-widest uppercase">Loading Staff...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Always show the owner */}
            <div className="flex items-center justify-between py-6 first:pt-0 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-950 rounded-full flex items-center justify-center text-white shadow-md">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-950 flex items-center gap-2">
                    Salon Owner
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                      Active
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Primary Admin</p>
                    {ownerEmail && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Mail size={12} />
                        {ownerEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Display fetched staff */}
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:border-gray-200 transition-all">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-950 flex items-center gap-2">
                      {member.name}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                        Active
                      </span>
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{member.role}</p>
                      <div className="hidden sm:block w-1 h-1 bg-gray-200 rounded-full" />
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                        {member.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            {member.email}
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={12} />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-300 hover:text-neutral-950 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            ))}

            {/* Capacity indicator */}
            <div className="pt-8 mt-4 text-center border-t border-gray-50">
              <p className="text-gray-400 font-medium italic text-sm">
                Current staff capacity: {staff.length + 1} / 10 seats filled.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Invite Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-neutral-950">Invite Staff Member</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-neutral-950 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddStaff} className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message.type === 'success' && <CheckCircle2 size={16} />}
                  {message.text}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Full Name</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sarah Jenkins"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Role / Title</label>
                  <input
                    required
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g., Senior Stylist, Barber"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Phone Number</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-50 text-neutral-950 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-neutral-950 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Invite Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
