import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react';

import { createClient } from '@/utils/supabase/server';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Bookings', icon: Calendar, active: false },
  { label: 'Services', icon: Scissors, active: false },
  { label: 'Staff', icon: Users, active: false },
  { label: 'Settings', icon: Settings, active: false },
];

const metricCards = [
  {
    label: "Today's Revenue",
    value: '₹14,250',
    icon: TrendingUp,
    badge: '+12%',
  },
  {
    label: 'Upcoming Bookings',
    value: '18',
    icon: Calendar,
  },
  {
    label: 'AI Scans Used',
    value: '42',
    icon: Star,
  },
];

const scheduleItems = [
  {
    name: 'Rahul Sharma',
    time: '10:30 AM',
    service: 'Classic Haircut + Beard Trim',
    amount: '₹850',
    status: 'Confirmed',
    statusClassName: 'bg-neutral-100 text-neutral-500',
  },
  {
    name: 'Aditya Verma',
    time: '11:15 AM',
    service: 'Deep Tissue Massage',
    amount: '₹1,200',
    status: 'Confirmed',
    statusClassName: 'bg-neutral-100 text-neutral-500',
  },
  {
    name: 'Siddharth Malhotra',
    time: '12:00 PM',
    service: 'Luxury Facial',
    amount: '₹2,500',
    status: 'In Progress',
    statusClassName: 'bg-sky-100 text-sky-600',
  },
  {
    name: 'Arjun Kapoor',
    time: '01:30 PM',
    service: 'Hair Coloring',
    amount: '₹3,200',
    status: 'Completed',
    statusClassName: 'bg-emerald-100 text-emerald-600',
  },
];

const popularServices = [
  'Classic Haircut',
  'Beard Grooming',
  'Head Massage',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default async function Page() {
  async function logoutAction() {
    'use server';

    const supabase = await createClient();

    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="min-h-screen w-screen bg-[#F9F9F9] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-sans antialiased md:h-screen [font-family:var(--font-inter)]">
      <aside className="hidden md:flex w-64 flex-none h-full bg-white border-r border-gray-100 p-6 flex-col justify-between">
        <div className="space-y-10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-neutral-600">
              S
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-neutral-950">
                ZLon Partner
              </h1>
              <p className="text-sm text-gray-500">shohebkhan477</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={
                    item.active
                      ? 'flex w-full items-center gap-3 rounded-xl bg-neutral-950 px-4 py-3 text-left font-medium text-white'
                      : 'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-500 transition-all hover:bg-gray-50'
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6 border-t border-gray-100 pt-6">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Booking</span>
          </button>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-sm text-gray-500 transition-all hover:text-neutral-950"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 px-6 flex items-center justify-between z-50">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={
                item.active
                  ? 'flex flex-1 flex-col items-center justify-center text-[10px] font-semibold text-neutral-950 gap-1'
                  : 'flex flex-1 flex-col items-center justify-center text-[10px] font-medium text-gray-400 gap-1'
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-10 pb-24 md:pb-10">
        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold leading-none tracking-tight text-neutral-950 sm:text-5xl md:text-[56px]">
                Dashboard
              </h2>
              <p className="text-base text-gray-500 md:text-lg">
                Welcome back, Royal Barbers. Here&apos;s what&apos;s happening today.
              </p>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] sm:mt-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Booking</span>
            </button>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {metricCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <p className="text-sm text-gray-500">{card.label}</p>
                    {card.badge ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        {card.badge}
                      </span>
                    ) : (
                      <Icon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <p className="text-3xl font-bold leading-none tracking-tight text-neutral-950 sm:text-[42px]">
                    {card.value}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            <article className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-[18px] font-semibold tracking-tight text-neutral-950">
                  Today&apos;s Schedule
                </h3>
                <button
                  type="button"
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-neutral-950"
                >
                  View Calendar
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {scheduleItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                        {getInitials(item.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-950 sm:truncate">
                          {item.name}
                        </p>
                        <p className="text-base leading-6 text-gray-500 sm:truncate">
                          {item.service}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                      <div className="text-left sm:text-right">
                        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-neutral-950 sm:justify-end">
                          <span>{item.time}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>{item.amount}</span>
                        </div>

                        <div className="mt-2 flex sm:justify-end">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${item.statusClassName}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-[18px] font-semibold tracking-tight text-neutral-950">
                Performance
              </h3>

              <div className="flex flex-col items-center border-b border-gray-100 pb-8 pt-4 text-center">
                <div className="mb-4 flex items-center gap-1 text-neutral-950">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-5 w-5 fill-current" />
                  ))}
                </div>

                <p className="text-4xl font-bold leading-none tracking-tight text-neutral-950 sm:text-[56px]">
                  4.9
                </p>

                <p className="mt-4 max-w-[220px] text-base leading-7 text-gray-500">
                  You are in the top 1% of salons in your area. Keep up the great work!
                </p>
              </div>

              <div className="pt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Popular Services
                </p>

                <div className="space-y-1">
                  {popularServices.map((service) => (
                    <button
                      key={service}
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-neutral-950">
                        {service}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
