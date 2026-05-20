import React from 'react';
import { Settings, User, Clock, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Business Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Configure your salon profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Salon Profile */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <User size={20} className="text-neutral-950" />
            <h2 className="text-lg font-bold text-neutral-950">Salon Profile</h2>
          </div>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Salon Name</label>
                <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-950/5 transition-all" defaultValue="ZLon Premium Salon" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Primary Email</label>
                <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-950/5 transition-all" defaultValue="partner@zlon.com" />
              </div>
            </div>
          </div>
        </section>

        {/* Operating Hours */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8">
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
        <section className="bg-white border border-gray-100 rounded-3xl p-8">
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
