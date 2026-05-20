import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
          {/* Authentic Logo Branding */}
          <div className="flex items-center gap-3 mb-8">
            <Image 
              src="/logo.png" 
              alt="ZLon Logo" 
              width={40} 
              height={40} 
              className="rounded-xl shadow-sm"
            />
            <div className="text-xl font-extrabold text-neutral-950 tracking-tighter">
              ZLon<span className="text-gray-400 font-medium ml-1">Partner</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex flex-col gap-2">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-neutral-950 shadow-sm font-medium transition-all"
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/dashboard/bookings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white hover:text-neutral-950 hover:shadow-sm font-medium transition-all"
            >
              <Calendar size={20} />
              <span>Bookings</span>
            </Link>
            <Link 
              href="/dashboard/services" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white hover:text-neutral-950 hover:shadow-sm font-medium transition-all"
            >
              <Scissors size={20} />
              <span>Services</span>
            </Link>
            <Link 
              href="/dashboard/staff" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white hover:text-neutral-950 hover:shadow-sm font-medium transition-all"
            >
              <Users size={20} />
              <span>Staff</span>
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white hover:text-neutral-950 hover:shadow-sm font-medium transition-all"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-50">
        <div className="flex items-center justify-around w-full h-full">
          <Link href="/dashboard" className="text-gray-500 hover:text-neutral-950 p-2">
            <LayoutDashboard size={24} />
          </Link>
          <Link href="/dashboard/bookings" className="text-gray-500 hover:text-neutral-950 p-2">
            <Calendar size={24} />
          </Link>
          <Link href="/dashboard/services" className="text-gray-500 hover:text-neutral-950 p-2">
            <Scissors size={24} />
          </Link>
          <Link href="/dashboard/staff" className="text-gray-500 hover:text-neutral-950 p-2">
            <Users size={24} />
          </Link>
          <Link href="/dashboard/settings" className="text-gray-500 hover:text-neutral-950 p-2">
            <Settings size={24} />
          </Link>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 relative">
        {children}
      </main>
    </div>
  );
}
