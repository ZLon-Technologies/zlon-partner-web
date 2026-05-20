import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Authentication & RBAC Bouncer
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (salonError || !salon) {
    redirect('/login?error=unauthorized_role');
  }

  return (
    <div className="flex h-screen w-screen bg-[#F9F9F9] overflow-hidden antialiased font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-none bg-white border-r border-gray-100 flex-col justify-between p-6 z-40">
        <div className="flex flex-col gap-8">
          {/* Replace the old logo block with this exact code */}
          <div className="flex items-center gap-2 mb-8">
            <div className="text-2xl font-extrabold text-neutral-950 tracking-tighter">
              ZLon<span className="text-gray-400 font-medium ml-1">Partner</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex flex-col gap-1">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3 py-3 bg-neutral-950 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-black/5"
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/bookings" 
              className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-neutral-950 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
            >
              <Calendar size={20} />
              <span>Bookings</span>
            </Link>
            <Link 
              href="/services" 
              className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-neutral-950 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
            >
              <Scissors size={20} />
              <span>Services</span>
            </Link>
            <Link 
              href="/staff" 
              className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-neutral-950 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
            >
              <Users size={20} />
              <span>Staff</span>
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-neutral-950 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-neutral-400">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-neutral-950 truncate uppercase tracking-tight">Active Partner</p>
              <p className="text-[9px] text-gray-400 font-medium truncate">{user.email}</p>
            </div>
          </div>
          
          <Link 
            href="/logout"
            className="flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl font-semibold text-sm transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 flex items-center justify-between z-50">
        <Link href="/dashboard" className="p-2 text-neutral-950">
          <LayoutDashboard size={24} strokeWidth={2.5} />
        </Link>
        <Link href="/bookings" className="p-2 text-gray-400 hover:text-neutral-950">
          <Calendar size={24} />
        </Link>
        <Link href="/services" className="p-2 text-gray-400 hover:text-neutral-950">
          <Scissors size={24} />
        </Link>
        <Link href="/staff" className="p-2 text-gray-400 hover:text-neutral-950">
          <Users size={24} />
        </Link>
        <Link href="/settings" className="p-2 text-gray-400 hover:text-neutral-950">
          <Settings size={24} />
        </Link>
      </nav>

      {/* Main Content Wrapper */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 relative">
        {children}
      </main>
    </div>
  );
}
