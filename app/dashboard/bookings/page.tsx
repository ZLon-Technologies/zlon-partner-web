'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Loader2, CheckCircle2, Clock, User, Scissors } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Service {
  id: number;
  name: string;
  price: number;
}

interface StaffMember {
  id: number;
  name: string;
}

interface Booking {
  id: number;
  appointment_time: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  total_price: number;
  services?: Service;
  staff?: StaffMember;
  customers?: { full_name: string };
}

export default function BookingsPage() {
  const [salonId, setSalonId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    appointment_date: '',
    appointment_time: '',
    service_id: '',
    staff_id: '',
  });

  const supabase = createClient();
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (salonData) {
        setSalonId(salonData.id);
        
        // Parallel queries
        const [bookingsRes, servicesRes, staffRes] = await Promise.all([
          supabase
            .from('bookings')
            .select('*, services(id, name, price), staff(id, name), customers(full_name)')
            .eq('salon_id', salonData.id)
            .order('appointment_time', { ascending: true }),
          supabase.from('services').select('id, name, price').eq('salon_id', salonData.id),
          supabase.from('staff').select('id, name').eq('salon_id', salonData.id)
        ]);

        if (bookingsRes.data) setBookings(bookingsRes.data);
        if (servicesRes.data) setServices(servicesRes.data);
        if (staffRes.data) setStaff(staffRes.data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Combine date and time
      const appointmentTimestamp = new Date(`${formData.appointment_date}T${formData.appointment_time}`).toISOString();
      
      // Find service to get price
      const selectedService = services.find(s => s.id.toString() === formData.service_id);
      const price = selectedService ? selectedService.price : 0;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          salon_id: salonId,
          service_id: parseInt(formData.service_id),
          staff_id: formData.staff_id ? parseInt(formData.staff_id) : null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          appointment_time: appointmentTimestamp,
          status: 'Confirmed',
          total_price: price,
        })
        .select('*, services(id, name, price), staff(id, name), customers(full_name)')
        .single();

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Appointment scheduled successfully!' });
      setBookings(prev => [...prev, data].sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()));
      
      setFormData({
        customer_name: '',
        customer_phone: '',
        appointment_date: '',
        appointment_time: '',
        service_id: '',
        staff_id: '',
      });
      
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
        setIsSaving(false);
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error("Booking insert error:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to create booking. Please check database schema constraints.' });
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Bookings</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and schedule your salon appointments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2 justify-center sm:justify-start"
        >
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs font-bold tracking-widest uppercase">Loading Bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-neutral-950">No upcoming appointments</h3>
            <p className="text-gray-400 font-medium mt-1">Your schedule is clear. New bookings will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date & Time</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Service</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Staff</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <Clock size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-neutral-950">
                            {format(new Date(booking.appointment_time), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {format(new Date(booking.appointment_time), 'hh:mm a')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                        <User size={14} className="text-gray-400" />
                        {booking.customer_name || booking.customers?.full_name || 'Guest Customer'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                        <Scissors size={14} className="text-gray-400" />
                        {booking.services?.name || 'Standard Service'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {booking.staff?.name || 'Unassigned'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        booking.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                        booking.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {booking.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-neutral-950">New Appointment</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-neutral-950 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddBooking} className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message.type === 'success' && <CheckCircle2 size={16} />}
                  {message.text}
                </div>
              )}

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-gray-100 pb-2">Customer Details</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Full Name</label>
                    <input
                      required
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="e.g., Jane Doe"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Phone Number</label>
                    <input
                      required
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Appointment Timing */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-gray-100 pb-2">Schedule</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Date</label>
                      <input
                        required
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Time</label>
                      <input
                        required
                        type="time"
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Services & Staff */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-gray-100 pb-2">Service Details</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Select Service</label>
                    <select
                      required
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all appearance-none"
                    >
                      <option value="" disabled>Choose a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name} (₹{service.price})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 block ml-1 uppercase">Assign Staff (Optional)</label>
                    <select
                      name="staff_id"
                      value={formData.staff_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/5 focus:bg-white transition-all appearance-none"
                    >
                      <option value="">Any Available</option>
                      {staff.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
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
                  disabled={isSaving || services.length === 0}
                  className="px-6 py-2.5 bg-neutral-950 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
