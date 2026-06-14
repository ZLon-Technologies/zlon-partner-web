'use client';

import { 
  Calendar, 
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  Scissors
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, limit, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function Dashboard() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch salonId from partners collection
        try {
          const partnerRef = doc(db, 'partners', user.uid);
          const partnerSnap = await getDocs(query(collection(db, 'partners'), where('uid', '==', user.uid), limit(1)));
          
          let currentSalonId = null;
          if (!partnerSnap.empty) {
            currentSalonId = partnerSnap.docs[0].data().salonId;
            setSalonId(currentSalonId);
          } else {
            // Fallback: check if user is salon owner
            const salonsQuery = query(collection(db, 'salons'), where('owner_id', '==', user.uid), limit(1));
            const salonsSnap = await getDocs(salonsQuery);
            if (!salonsSnap.empty) {
              currentSalonId = salonsSnap.docs[0].id;
              setSalonId(currentSalonId);
            }
          }

          if (currentSalonId) {
            // Setup real-time listener for bookings
            const bookingsQuery = query(
              collection(db, 'bookings'),
              where('salonId', '==', currentSalonId),
              orderBy('createdAt', 'desc')
            );

            const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
              const bookingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setBookings(bookingData);
              setIsLoading(false);
            }, (err) => {
              console.error("Bookings listener error:", err);
              // Fallback to old schema if new one fails
              const fallbackQuery = query(
                collection(db, 'bookings'),
                where('salon_id', '==', currentSalonId),
                orderBy('created_at', 'desc')
              );
              onSnapshot(fallbackQuery, (fallbackSnap) => {
                setBookings(fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setIsLoading(false);
              });
            });

            return () => unsubscribeBookings();
          } else {
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Initialization error:", err);
          setIsLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking status.");
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const upcomingAppointments = bookings.filter(b => b.status === 'confirmed' || b.status === 'Confirmed');

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-xs font-bold tracking-widest uppercase">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Partner Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">Real-time booking management.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pending Requests */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">Pending Requests</h2>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">{pendingRequests.length}</span>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((booking) => (
                <div key={booking.id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{booking.customer_name || booking.userId || 'Guest'}</h3>
                        <p className="text-xs text-gray-500 font-medium">{booking.serviceName || booking.service_name || 'Standard Service'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-950">
                        {booking.bookingDate ? format(new Date(booking.bookingDate), 'hh:mm a') : '--:--'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {booking.bookingDate ? format(new Date(booking.bookingDate), 'MMM dd') : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      className="flex-1 bg-neutral-950 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 size={14} />
                      Accept
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      className="flex-1 bg-white border border-gray-200 text-red-600 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-[0.98]"
                    >
                      <XCircle size={14} />
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <p className="text-sm font-medium">No new requests</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Appointments */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">Upcoming Appointments</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{upcomingAppointments.length}</span>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((booking) => (
                <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center justify-center bg-gray-50 w-16 h-16 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                      <Clock size={20} className="text-gray-400 mb-1" />
                      <span className="text-[10px] font-bold text-gray-600">
                        {booking.bookingDate ? format(new Date(booking.bookingDate), 'hh:mm') : '--:--'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">
                        {booking.customer_name || booking.userId || 'Guest'}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {booking.serviceName || booking.service_name || 'Standard Service'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-bold border border-blue-100">
                      <CheckCircle2 size={12} />
                      <span>Confirmed</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <p className="text-sm font-medium">No upcoming appointments</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
