'use client';

import React, { useTransition } from 'react';
import { Check, X, MoreHorizontal, Loader2 } from 'lucide-react';
import { approveApplication, rejectApplication } from '../actions';
import { format } from 'date-fns';

interface Application {
  id: string;
  created_at: string;
  salon_name: string;
  owner_name: string;
  email: string;
  city: string;
  status: string;
}

export default function AdminTable({ applications }: { applications: Application[] }) {
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const result = await approveApplication(id);
      if (result?.error) alert(result.error);
      setProcessingId(null);
    });
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const result = await rejectApplication(id);
      if (result?.error) alert(result.error);
      setProcessingId(null);
    });
  };

  return (
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
          {applications.map((app) => {
            const isProcessing = processingId === app.id;
            
            return (
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
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                    app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-6">
                  {app.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleApprove(app.id)}
                        disabled={isPending}
                        className="bg-neutral-950 text-white p-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve Application"
                      >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                      </button>
                      <button 
                        onClick={() => handleReject(app.id)}
                        disabled={isPending}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject Application"
                      >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} strokeWidth={3} />}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
