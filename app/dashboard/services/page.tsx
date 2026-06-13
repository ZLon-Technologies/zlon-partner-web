'use client';

import React, { useState, useEffect } from 'react';
import { Scissors, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  salon_id: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [salonId, setSalonId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    duration_minutes: '',
  });

  const router = useRouter();

  const fetchServices = async (user: any) => {
    setLoading(true);
    try {
      const salonsQuery = query(collection(db, 'salons'), where('owner_id', '==', user.uid));
      const salonsSnapshot = await getDocs(salonsQuery);

      if (!salonsSnapshot.empty) {
        const salonDoc = salonsSnapshot.docs[0];
        const currentSalonId = salonDoc.id;
        setSalonId(currentSalonId);
        
        const servicesQuery = query(
          collection(db, 'services'), 
          where('salon_id', '==', currentSalonId)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service));

        // Client-side sorting as Firestore might not support multiple orderBys without composite index
        servicesData.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        setServices(servicesData);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchServices(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const serviceData = {
        salon_id: salonId,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes, 10),
        created_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'services'), serviceData);
      
      const newService = { id: docRef.id, ...serviceData } as Service;
      
      setMessage({ type: 'success', text: 'Service added successfully!' });
      setServices(prev => [...prev, newService].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
      
      setFormData({ name: '', category: '', price: '', duration_minutes: '' });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
        setIsSaving(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error adding service:", error);
      setMessage({ type: 'error', text: error.message });
      setIsSaving(false);
    }
  };

  // Group services by category for display
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Service Menu</h1>
          <p className="text-gray-500 font-medium mt-1">Configure your salon services and pricing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2 justify-center sm:justify-start disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-24 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-xs font-bold tracking-widest uppercase">Loading Services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Scissors className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-neutral-950">No Services Added</h3>
          <p className="text-gray-400 font-medium mt-2 max-w-sm">
            Your service menu is currently empty. Click "Add Service" to start building your catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedServices).map(([category, catServices]) => (
            <div key={category} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
                <h3 className="font-bold text-neutral-950 uppercase tracking-widest text-xs">{category}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {catServices.map((service) => (
                  <div key={service.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div>
                      <h4 className="font-bold text-neutral-950">{service.name}</h4>
                      <p className="text-sm text-gray-500 font-medium mt-1">{service.duration_minutes} minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-950">₹{service.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-neutral-950">Add New Service</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-neutral-950 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddService} className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message.type === 'success' && <CheckCircle2 size={16} />}
                  {message.text}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Service Name</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Classic Haircut"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Category</label>
                  <input
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Hair, Skin, Nails"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Duration (Mins)</label>
                    <input
                      required
                      type="number"
                      min="5"
                      step="5"
                      name="duration_minutes"
                      value={formData.duration_minutes}
                      onChange={handleChange}
                      placeholder="e.g., 30"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                    />
                  </div>
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
