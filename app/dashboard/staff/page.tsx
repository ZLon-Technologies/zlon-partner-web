import React from 'react';
import { Users, UserPlus, MoreHorizontal } from 'lucide-react';

export default function StaffPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Team Members</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your stylists and salon staff.</p>
        </div>
        <button className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2">
          <UserPlus size={16} />
          Invite Staff
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 overflow-hidden divide-y divide-gray-50">
        <div className="flex items-center justify-between py-6 first:pt-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-950">Salon Owner</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Primary Admin</p>
            </div>
          </div>
          <button className="p-2 text-gray-300 hover:text-neutral-950 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border-none">
          <p className="text-gray-400 font-medium italic">Current staff capacity: 1 / 10 seats filled.</p>
        </div>
      </div>
    </div>
  );
}
