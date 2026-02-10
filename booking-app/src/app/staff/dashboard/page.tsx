import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { AppointmentCard } from '@/components/staff/AppointmentCard';
import { DashboardHeader } from '@/components/staff/DashboardHeader';
import { TimeIndicator } from '@/components/staff/TimeIndicator';
import { StaffControls } from '@/components/staff/StaffControls';
import { Calendar, TrendingUp, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';

type StaffDashboardAppointment = {
    id: string;
    client_name: string;
    service_name: string;
    appointment_time: string;
    duration: number;
    status: 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending';
    client_phone: string;
    total_amount: number;
    barber_id: string;
    appointment_date: string;
    customer_notes: string | null;
};

export default async function StaffDashboard({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>;
}) {
    const cookieStore = await cookies();
    const staffId = cookieStore.get('staff_session')?.value;
    const supabase = await createClient();

    const resolvedParams = await searchParams;
    const selectedDate = resolvedParams.date || new Date().toISOString().split('T')[0];

    // Fetch appointments
    let appointments: StaffDashboardAppointment[] = [];
    const stats = {
        earnings: 0,
        tips: 0,
        count: 0,
        completed: 0,
        pending_earning: 0,
        potential_total: 0
    };

    const { data: staff } = supabase
        ? await supabase.from('staff').select('*').eq('id', staffId).single()
        : { data: null };

    if (!supabase || !staffId || !staff) {
        // Redirect to login if no valid session
        return (
            <div className="min-h-screen bg-richblack-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Session Expired</h2>
                    <p className="text-white/60 mb-6">Please log in again</p>
                    <a href="/staff" className="px-6 py-3 bg-gold-500 text-black font-bold rounded-lg">
                        Back to Login
                    </a>
                </div>
            </div>
        );
    }

    // Fetch real bookings for this staff member
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                service:services(name, duration_minutes),
                staff:staff(name)
            `)
            .eq('staff_id', staffId)
            .eq('booking_date', selectedDate)
            .order('booking_time', { ascending: true });

        if (error) {
            console.error("Error fetching bookings:", error);
        } else if (data) {
            // Transform bookings to match appointment card format
            appointments = data.map((booking): StaffDashboardAppointment => ({
                id: booking.id,
                client_name: booking.customer_name,
                service_name: booking.service?.name || 'Service',
                appointment_time: booking.booking_time,
                duration: booking.service?.duration_minutes || 30,
                status:
                    booking.status === 'confirmed' ||
                        booking.status === 'completed' ||
                        booking.status === 'cancelled' ||
                        booking.status === 'no_show' ||
                        booking.status === 'pending'
                        ? booking.status
                        : 'pending',
                client_phone: booking.customer_phone || 'N/A',
                total_amount: booking.total_price,
                barber_id: booking.staff_id,
                appointment_date: booking.booking_date,
                customer_notes: booking.customer_notes
            }));
        }
    } catch (e) {
        console.error("Error fetching dashboard data", e);
    }

    // Calculate Extended Stats
    stats.count = appointments.length;
    stats.completed = appointments.filter(a => a.status === 'completed').length;

    // Earnings Logic
    stats.earnings = appointments
        .filter(a => a.status === 'completed')
        .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

    stats.pending_earning = appointments
        .filter(a => a.status === 'confirmed' || a.status === 'pending')
        .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

    stats.potential_total = stats.earnings + stats.pending_earning;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6">
            <DashboardHeader earnings={stats.earnings} target={500} />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Schedule (60%) */}
                <div className="w-full lg:w-[60%] space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gold-500" />
                            Schedule
                        </h2>
                        <span className="text-sm text-white/40">{appointments.length} appointments</span>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Time Indicator Line */}
                        <TimeIndicator />

                        {appointments.length > 0 ? (
                            appointments.map((apt) => (
                                <AppointmentCard key={apt.id} appointment={apt} />
                            ))
                        ) : (
                            <div className="text-center py-24 bg-richblack-800/30 rounded-2xl border border-white/5 border-dashed relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl group-hover:bg-gold-500/10 transition-colors duration-1000" />

                                <div className="relative z-10 w-20 h-20 bg-richblack-900 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-richblack-800 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    <Clock className="w-8 h-8 text-gold-500" />
                                </div>
                                <h3 className="relative z-10 text-xl font-display font-medium text-white mb-2">Detailed Schedule</h3>
                                <p className="relative z-10 text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                                    No appointments scheduled for this date.<br />
                                    Enjoy the downtime, Master Barber.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Stats & Quick Actions (40%) */}
                <div className="w-full lg:w-[40%] space-y-6">

                    {/* Controls */}
                    <StaffControls
                        staffName={staff?.name?.split(' ')[0] || 'Barber'}
                        staffId={staff?.id || ''}
                        isActive={staff?.is_active ?? true}
                    />

                    {/* Earnings Card */}
                    <div className="bg-richblack-800 border border-gold-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl -mr-10 -mt-10" />

                        <div className="relative z-10">
                            <p className="text-sm uppercase tracking-widest text-gold-500/60 font-bold mb-1">Today&apos;s Earnings</p>
                            <h3 className="text-4xl font-display font-bold text-white mb-6">
                                GHS {stats.earnings.toFixed(2)}
                            </h3>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Completed</span>
                                    <span className="text-white font-bold">GHS {stats.earnings}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Pending</span>
                                    <span className="text-white/40 font-mono">+ GHS {stats.pending_earning}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                                    <span className="text-gold-500 font-bold">Potential Total</span>
                                    <span className="text-gold-500 font-bold">GHS {stats.potential_total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-richblack-800 border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-white/40 mb-2">
                                <Users className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wider">Clients</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.count}</p>
                        </div>
                        <div className="bg-richblack-800 border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-white/40 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-xs uppercase tracking-wider">Done</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.completed}</p>
                        </div>
                    </div>

                    {/* Quick Guide */}
                    <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <h4 className="text-blue-400 font-bold text-sm mb-1">Status Guide</h4>
                                <ul className="text-xs text-blue-200/60 space-y-1">
                                    <li>• Click card to view details & notes</li>
                                    <li>• Mark completed to update earnings</li>
                                    <li>• 5+ mins late = Orange badge</li>
                                    <li>• 30+ mins late = Red warning</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
