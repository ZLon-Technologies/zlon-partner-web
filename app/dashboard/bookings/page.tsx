import React from 'react';
import { Calendar, Plus } from 'lucide-react';

export default function BookingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Bookings</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and schedule your salon appointments.</p>
        </div>
        <button className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2">
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-gray-300" size={32} />
        </div>
        <h3 className="text-lg font-bold text-neutral-950">No upcoming appointments</h3>
        <p className="text-gray-400 font-medium mt-1">Your schedule is clear. New bookings will appear here.</p>
      </div>
    </div>
  );
}
