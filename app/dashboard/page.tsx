import { 
  TrendingUp, 
  Calendar, 
  MoreHorizontal,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';

export default async function Dashboard() {
  const supabase = await createClient();
  
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Fetch Today's Bookings for Metrics and Schedule
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, services(*), customers(*)')
    .gte('appointment_time', today.toISOString())
    .lt('appointment_time', tomorrow.toISOString())
    .order('appointment_time', { ascending: true });

  // 2. Fetch Popular Services
  const { data: popularServices } = await supabase
    .from('services')
    .select('*')
    .order('bookings_count', { ascending: false })
    .limit(3);

  // Metrics Calculation
  const todayBookings = bookings || [];
  const todayRevenue = todayBookings.reduce((acc, booking) => acc + (booking.total_price || 0), 0);
  const upcomingCount = todayBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed').length;

  return (
    <div className="p-8 space-y-10">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">
            {todayBookings.length > 0 
              ? `You have ${todayBookings.length} appointments today.` 
              : "Welcome back. Here's what's happening today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Salon Online</span>
          </div>
          <button className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 flex items-center gap-2">
            <Plus size={16} />
            Add New Booking
          </button>
        </div>
      </header>

      {/* Metrics Row - Adjusted to 2 columns as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Today
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Today's Revenue</p>
            <h2 className="text-4xl font-bold mt-2 text-neutral-950">₹{todayRevenue.toLocaleString('en-IN')}</h2>
          </div>
          {/* Subtle background flair */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
        </div>

        {/* Bookings Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300">
              <Calendar size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Upcoming Bookings</p>
            <h2 className="text-4xl font-bold mt-2 text-neutral-950">{upcomingCount}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Main Grid: Schedule and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">Today's Schedule</h2>
            <button className="text-xs font-bold text-gray-400 hover:text-neutral-950 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
              View Calendar <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {todayBookings.length > 0 ? (
              todayBookings.map((booking) => (
                <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all group cursor-pointer active:scale-[0.995]">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center justify-center bg-gray-50 w-16 h-16 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                      <Clock size={20} className="text-gray-400 mb-1" />
                      <span className="text-[10px] font-bold text-gray-600">
                        {format(new Date(booking.appointment_time), 'hh:mm')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 group-hover:text-black">
                        {booking.customers?.full_name || 'Guest Customer'}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {booking.services?.name || 'Standard Service'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-neutral-950">₹{(booking.total_price || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {booking.payment_status || 'Pending'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {booking.status === 'Completed' ? (
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                          <CheckCircle2 size={14} />
                          <span>Completed</span>
                        </div>
                      ) : booking.status === 'In Progress' ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 animate-pulse">
                          <Clock size={14} />
                          <span>Ongoing</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                          <User size={14} />
                          <span>Confirmed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <Calendar className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-400 font-medium">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Insights/Stats */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold tracking-tight px-2 text-neutral-950">Salon Performance</h2>
          
          <div className="bg-neutral-950 text-white rounded-[2.5rem] p-8 shadow-xl shadow-black/10 relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Overall Rating</p>
              <div className="flex items-end gap-2 mt-2">
                <h3 className="text-5xl font-bold tracking-tighter">4.9</h3>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-lg">★</span>)}
                </div>
              </div>
              <p className="text-sm font-medium text-white/50 mt-4 leading-relaxed">
                You are in the top 1% of salons in your area. Keep up the great work!
              </p>
              <button className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-white/5">
                View Reviews
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="font-bold text-neutral-950 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
              <TrendingUp size={16} className="text-black" />
              Popular Services
            </h3>
            <div className="space-y-6">
              {popularServices && popularServices.length > 0 ? (
                popularServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-neutral-950 group-hover:text-black transition-colors truncate">
                        {service.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                        {service.bookings_count || 0} bookings
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300 shrink-0">
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No services added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
