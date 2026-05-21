import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { ClipboardCheck, MoreHorizontal, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch applications from the salon_applications table
  const { data: applications, error } = await supabase
    .from('salon_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-neutral-950 p-8 antialiased font-sans">
      <header className="max-w-7xl mx-auto flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-neutral-950">
            ZLon<span className="text-gray-400 font-medium ml-1">Command Center</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Pending Salon Partner Applications
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Updates Active</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {applications && applications.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Date</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Salon Name</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Applicant</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Location</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-950">
                          {format(new Date(app.created_at), 'dd MMM, yyyy')}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {format(new Date(app.created_at), 'hh:mm a')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-neutral-950">{app.salon_name}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-950">{app.owner_name}</span>
                        <span className="text-xs text-gray-400 font-medium lowercase">{app.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-neutral-950">{app.city}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="bg-neutral-950 text-white p-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-black/10"
                          title="Approve Application"
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <button 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl active:scale-95 transition-all"
                          title="Reject Application"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-neutral-950 transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-24 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ClipboardCheck className="text-gray-300" size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-neutral-950">Inbox Zero</h3>
            <p className="text-gray-400 font-medium mt-2 max-w-sm">
              All caught up. There are currently no pending salon partner applications to review.
            </p>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <div>ZLon Technologies Admin Interface</div>
        <div>System Version 1.0.4</div>
      </footer>
    </div>
  );
}
