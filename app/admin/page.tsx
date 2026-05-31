import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle2, ShieldCheck, MapPin, FileText, User, Phone } from 'lucide-react';
import { approveSalon } from './actions';

// This would typically be in an environment variable
const ADMIN_EMAIL = 'admin@zlon.in'; 

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const { data: pendingSalons, error } = await supabase
    .from('salons')
    .filter('status', 'eq', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching salons:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-neutral-900" size={32} />
              Admin Verification Console
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Review and approve partner salon registrations.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-bold text-neutral-700">{pendingSalons?.length || 0} Pending Requests</span>
          </div>
        </header>

        {!pendingSalons || pendingSalons.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-20 text-center shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-gray-300" size={40} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">All caught up!</h2>
            <p className="text-gray-500 mt-2">There are no pending salon registrations to review at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingSalons.map((salon) => (
              <div key={salon.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Left Panel: Document Preview */}
                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 relative group">
                  {salon.document_url ? (
                    <div className="h-full min-h-[300px] flex flex-col">
                      <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Verification Document</span>
                        <a 
                          href={salon.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-neutral-950 hover:underline"
                        >
                          View Full Screen
                        </a>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {salon.document_url.endsWith('.pdf') ? (
                          <div className="h-full flex items-center justify-center p-8 text-center">
                            <div className="space-y-3">
                              <FileText size={48} className="mx-auto text-gray-300" />
                              <p className="text-xs font-medium text-gray-500">PDF Document Submitted</p>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={salon.document_url} 
                            alt="Verification Document" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-12 text-center text-gray-400">
                      <p className="text-sm font-medium italic">No document uploaded</p>
                    </div>
                  )}
                </div>

                {/* Right Panel: Details & Actions */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-950 tracking-tight mb-1">{salon.name}</h2>
                      <div className="flex items-center gap-4">
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600 uppercase tracking-wider border border-neutral-200">
                          Pending Approval
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                          Registered on {new Date(salon.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <form action={approveSalon}>
                      <input type="hidden" name="salonId" value={salon.id} />
                      <button 
                        type="submit"
                        className="bg-neutral-950 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Approve Partner
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-auto">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Owner Name</p>
                          <p className="text-sm font-bold text-neutral-900">{salon.owner_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</p>
                          <p className="text-sm font-bold text-neutral-900">{salon.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                          <FileText size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">KYC Number</p>
                          <p className="text-sm font-bold text-neutral-900">{salon.kyc_number || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                          <MapPin size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</p>
                          <p className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">{salon.address}</p>
                          {salon.latitude && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              GPS: {salon.latitude.toFixed(4)}, {salon.longitude.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
