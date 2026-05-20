import React from 'react';
import { Scissors, Plus, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Hair', count: 12, icon: Scissors },
  { name: 'Nails', count: 8, icon: Scissors },
  { name: 'Skin', count: 15, icon: Scissors },
];

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Service Menu</h1>
          <p className="text-gray-500 font-medium mt-1">Configure your salon services and pricing.</p>
        </div>
        <button className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2">
          <Plus size={16} />
          Add Service
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <category.icon size={20} className="text-neutral-950" />
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h3 className="font-bold text-neutral-950">{category.name}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{category.count} Services</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
