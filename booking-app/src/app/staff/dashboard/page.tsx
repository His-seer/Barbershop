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

    // ===== OVERTIME & BONUS CALCULATION =====
    const dailyTarget = 500;
    const goalReached = stats.earnings >= dailyTarget;
    const overtime = goalReached ? stats.earnings - dailyTarget : 0;

    // Tiered Bonus System
    let bonusMultiplier = 0;
    let bonusLabel = '';
    let bonusColor = '';

    if (stats.earnings >= dailyTarget * 1.5) {
        // 150%+ target = Legendary (20% bonus)
        bonusMultiplier = 0.20;
        bonusLabel = '🔥 Legendary';
        bonusColor = 'from-purple-600 to-pink-600';
    } else if (stats.earnings >= dailyTarget * 1.25) {
        // 125%+ target = Elite (15% bonus)
        bonusMultiplier = 0.15;
        bonusLabel = '⭐ Elite';
        bonusColor = 'from-blue-600 to-cyan-600';
    } else if (stats.earnings >= dailyTarget * 1.1) {
        // 110%+ target = Champion (10% bonus)
        bonusMultiplier = 0.10;
        bonusLabel = '💪 Champion';
        bonusColor = 'from-green-600 to-emerald-600';
    }

    const bonusAmount = overtime * bonusMultiplier;
    const totalWithBonus = stats.earnings + bonusAmount;


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
                    <div className={`${bonusMultiplier > 0
                        ? `bg-gradient-to-br ${bonusColor} border-white/30`
                        : goalReached
                            ? 'bg-richblack-800 border-green-500/30'
                            : 'bg-richblack-800 border-gold-500/20'
                        } p-6 rounded-2xl relative overflow-hidden border transition-all duration-500`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${bonusMultiplier > 0 ? 'bg-white/10' : goalReached ? 'bg-green-500/10' : 'bg-gold-500/5'
                            } rounded-full blur-2xl -mr-10 -mt-10`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm uppercase tracking-widest font-bold ${bonusMultiplier > 0 ? 'text-white' : goalReached ? 'text-green-500/80' : 'text-gold-500/60'
                                    }`}>
                                    Today&apos;s Earnings
                                </p>
                                {bonusLabel && (
                                    <span className="text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                                        {bonusLabel}
                                    </span>
                                )}
                            </div>
                            <h3 className={`text-4xl font-display font-bold mb-6 ${bonusMultiplier > 0 ? 'text-white' : 'text-white'
                                }`}>
                                GHS {totalWithBonus.toFixed(2)}
                            </h3>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className={bonusMultiplier > 0 ? 'text-white/80' : 'text-white/50'}>Base Earnings</span>
                                    <span className={bonusMultiplier > 0 ? 'text-white font-bold' : 'text-white font-bold'}>GHS {stats.earnings.toFixed(2)}</span>
                                </div>

                                {goalReached && (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-green-400/80">💰 Overtime</span>
                                            <span className="text-green-400 font-bold">+ GHS {overtime.toFixed(2)}</span>
                                        </div>

                                        {bonusMultiplier > 0 && (
                                            <div className="flex justify-between items-center text-sm bg-white/10 -mx-2 px-2 py-2 rounded-lg">
                                                <span className="text-white font-bold">🎁 Bonus ({(bonusMultiplier * 100).toFixed(0)}%)</span>
                                                <span className="text-white font-bold">+ GHS {bonusAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="flex justify-between items-center text-sm">
                                    <span className={bonusMultiplier > 0 ? 'text-white/80' : 'text-white/50'}>Pending</span>
                                    <span className={bonusMultiplier > 0 ? 'text-white/60 font-mono' : 'text-white/40 font-mono'}>+ GHS {stats.pending_earning.toFixed(2)}</span>
                                </div>

                                {bonusMultiplier > 0 && (
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-white/20">
                                        <span className="text-white font-bold">💎 Total with Bonus</span>
                                        <span className="text-white font-bold text-lg">GHS {totalWithBonus.toFixed(2)}</span>
                                    </div>
                                )}
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

                    {/* Bonus Rewards Tracker */}
                    {goalReached && (
                        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-5 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <h4 className="text-purple-300 font-bold text-sm">🎯 Bonus Rewards Tracker</h4>
                            </div>

                            {bonusMultiplier === 0 ? (
                                <>
                                    <p className="text-xs text-purple-200/60 mb-3">
                                        Goal reached! Earn <span className="text-purple-300 font-bold">GHS {(dailyTarget * 0.1).toFixed(0)} more</span> to unlock <span className="text-green-400 font-bold">Champion (10% bonus)</span>
                                    </p>
                                    <div className="h-2 bg-richblack-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
                                            style={{ width: `${Math.min((stats.earnings / (dailyTarget * 1.1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </>
                            ) : bonusMultiplier === 0.10 ? (
                                <>
                                    <p className="text-xs text-purple-200/60 mb-3">
                                        Champion unlocked! Earn <span className="text-purple-300 font-bold">GHS {((dailyTarget * 1.25) - stats.earnings).toFixed(0)} more</span> to unlock <span className="text-cyan-400 font-bold">Elite (15% bonus)</span>
                                    </p>
                                    <div className="h-2 bg-richblack-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                                            style={{ width: `${Math.min(((stats.earnings - dailyTarget * 1.1) / (dailyTarget * 0.15)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </>
                            ) : bonusMultiplier === 0.15 ? (
                                <>
                                    <p className="text-xs text-purple-200/60 mb-3">
                                        Elite unlocked! Earn <span className="text-purple-300 font-bold">GHS {((dailyTarget * 1.5) - stats.earnings).toFixed(0)} more</span> to unlock <span className="text-pink-400 font-bold">Legendary (20% bonus)</span>
                                    </p>
                                    <div className="h-2 bg-richblack-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 to-pink-400 transition-all duration-500"
                                            style={{ width: `${Math.min(((stats.earnings - dailyTarget * 1.25) / (dailyTarget * 0.25)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-pink-200/80 font-bold">
                                    🔥 Legendary status achieved! You're an absolute legend!
                                </p>
                            )}

                            <div className="mt-4 pt-3 border-t border-purple-500/20 space-y-1">
                                <p className="text-[10px] text-purple-200/40 uppercase tracking-wider mb-2">Reward Tiers</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-purple-200/60">💪 110% (GHS {(dailyTarget * 1.1).toFixed(0)})</span>
                                    <span className="text-green-400">+10%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-purple-200/60">⭐ 125% (GHS {(dailyTarget * 1.25).toFixed(0)})</span>
                                    <span className="text-cyan-400">+15%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-purple-200/60">🔥 150% (GHS {(dailyTarget * 1.5).toFixed(0)})</span>
                                    <span className="text-pink-400">+20%</span>
                                </div>
                            </div>
                        </div>
                    )}

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
