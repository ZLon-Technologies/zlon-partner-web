import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { ClipboardCheck } from 'lucide-react';
import AdminTable from './AdminTable';

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
          <AdminTable applications={applications} />
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
