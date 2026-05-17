'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings, 
  Scissors,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Bookings', href: '/bookings', icon: CalendarDays },
  { name: 'Services', href: '/services', icon: Scissors },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ user }: { user?: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
            <span className="text-xl font-bold">Z.</span>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">ZLon Partner</h2>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Salon Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95",
                isActive 
                  ? "bg-neutral-950 text-white shadow-lg shadow-black/10" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-neutral-950"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-[10px] font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.email?.split('@')[0] || 'Partner'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all active:scale-95"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
