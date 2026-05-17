import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  MoreHorizontal,
  Clock,
  User,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const metrics = [
  { name: "Today's Revenue", value: '₹14,250', change: '+12%', icon: TrendingUp, trend: 'up' },
  { name: 'Upcoming Bookings', value: '18', icon: Calendar },
  { name: 'AI Scans Used', value: '42', icon: Sparkles },
];

const todaySchedule = [
  { id: 1, customer: 'Rahul Sharma', service: 'Classic Haircut + Beard Trim', time: '10:30 AM', status: 'upcoming', amount: '₹850' },
  { id: 2, customer: 'Aditya Verma', service: 'Deep Tissue Massage', time: '11:15 AM', status: 'upcoming', amount: '₹1,200' },
  { id: 3, customer: 'Siddharth Malhotra', service: 'Luxury Facial', time: '12:00 PM', status: 'ongoing', amount: '₹2,500' },
  { id: 4, customer: 'Arjun Kapoor', service: 'Hair Coloring', time: '09:00 AM', status: 'completed', amount: '₹3,200' },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-10">
      {/* Header Area */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Welcome back, Royal Barbers. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Salon Online</span>
          </div>
          <button className="bg-neutral-950 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-black/10 transition-all active:scale-95">
            Add New Booking
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors duration-300">
                <metric.icon size={24} />
              </div>
              {metric.change && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                  {metric.change}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{metric.name}</p>
              <h2 className="text-3xl font-bold mt-1">{metric.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Schedule and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight">Today's Schedule</h2>
            <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              View Calendar <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {todaySchedule.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer active:scale-[0.99] transition-all">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center bg-gray-50 w-16 h-16 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                    <Clock size={20} className="text-gray-400 mb-1" />
                    <span className="text-[10px] font-bold text-gray-600">{item.time.split(' ')[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-black">{item.customer}</h3>
                    <p className="text-sm text-gray-500 font-medium">{item.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold">{item.amount}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Paid via Wallet</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.status === 'completed' ? (
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                        <CheckCircle2 size={14} />
                        <span>Completed</span>
                      </div>
                    ) : item.status === 'ongoing' ? (
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 animate-pulse">
                        <Clock size={14} />
                        <span>In Progress</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-100">
                        <User size={14} />
                        <span>Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Insights/Stats */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight px-2">Salon Performance</h2>
          
          <div className="bg-neutral-950 text-white rounded-[2.5rem] p-8 shadow-xl shadow-black/10 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Overall Rating</p>
              <div className="flex items-end gap-2 mt-2">
                <h3 className="text-5xl font-bold tracking-tighter">4.9</h3>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  <span className="text-lg">★</span>
                  <span className="text-lg">★</span>
                  <span className="text-lg">★</span>
                  <span className="text-lg">★</span>
                  <span className="text-lg">★</span>
                </div>
              </div>
              <p className="text-sm font-medium text-white/50 mt-4 leading-relaxed">
                You are in the top 1% of salons in your area. Keep up the great work!
              </p>
              <button className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors active:scale-95">
                View Reviews
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-black" />
              Popular Services
            </h3>
            <div className="space-y-5">
              {[
                { name: 'Classic Haircut', count: '124 bookings' },
                { name: 'Beard Grooming', count: '89 bookings' },
                { name: 'Head Massage', count: '56 bookings' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{service.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{service.count}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
