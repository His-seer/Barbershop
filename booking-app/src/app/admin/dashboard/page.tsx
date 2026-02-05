'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    TrendingUp,
    Users,
    Clock,
    AlertCircle,
    Plus,
    FileText,
    Scissors,
    CreditCard
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getDashboardStats, getBarberPerformance, getRecentTransactions } from '@/utils/supabase/queries';
import type { DashboardStats, BarberPerformance, RecentTransaction } from '@/types/database';

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [barberPerf, setBarberPerf] = useState<BarberPerformance[]>([]);
    const [recentTx, setRecentTx] = useState<RecentTransaction[]>([]);
    const [peakTimeData, setPeakTimeData] = useState<{ hour: string; weekday: number; weekend: number }[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, barberData, txData] = await Promise.all([
                    getDashboardStats(),
                    getBarberPerformance(),
                    getRecentTransactions(10)
                ]);

                setStats(statsData);
                setBarberPerf(barberData);
                setRecentTx(txData);

                // Calculate peak times from real bookings
                await calculatePeakTimes();
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    async function calculatePeakTimes() {
        try {
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();

            // Get bookings from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: bookings } = await supabase
                .from('bookings')
                .select('booking_date, booking_time')
                .gte('booking_date', thirtyDaysAgo.toISOString().split('T')[0]);

            if (!bookings || bookings.length === 0) {
                // Use minimal default data if no bookings
                setPeakTimeData([
                    { hour: '9am', weekday: 0, weekend: 0 },
                    { hour: '10am', weekday: 0, weekend: 0 },
                    { hour: '11am', weekday: 0, weekend: 0 },
                    { hour: '12pm', weekday: 0, weekend: 0 },
                    { hour: '1pm', weekday: 0, weekend: 0 },
                    { hour: '2pm', weekday: 0, weekend: 0 },
                    { hour: '3pm', weekday: 0, weekend: 0 },
                    { hour: '4pm', weekday: 0, weekend: 0 },
                    { hour: '5pm', weekday: 0, weekend: 0 },
                    { hour: '6pm', weekday: 0, weekend: 0 },
                    { hour: '7pm', weekday: 0, weekend: 0 },
                    { hour: '8pm', weekday: 0, weekend: 0 },
                ]);
                return;
            }

            // Count bookings by hour and day type
            const hourCounts: { [key: string]: { weekday: number; weekend: number } } = {};

            bookings.forEach((booking) => {
                const date = new Date(booking.booking_date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const hour = parseInt(booking.booking_time.split(':')[0]);

                // Convert to 12-hour format
                const hourLabel = hour === 0 ? '12am'
                    : hour < 12 ? `${hour}am`
                        : hour === 12 ? '12pm'
                            : `${hour - 12}pm`;

                if (!hourCounts[hourLabel]) {
                    hourCounts[hourLabel] = { weekday: 0, weekend: 0 };
                }

                if (isWeekend) {
                    hourCounts[hourLabel].weekend++;
                } else {
                    hourCounts[hourLabel].weekday++;
                }
            });

            // Format for chart (9am - 8pm)
            const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];
            const chartData = hours.map(hour => ({
                hour,
                weekday: hourCounts[hour]?.weekday || 0,
                weekend: hourCounts[hour]?.weekend || 0
            }));

            setPeakTimeData(chartData);
        } catch (error) {
            console.error('Error calculating peak times:', error);
        }
    }

    // Revenue Split (Online vs Walk-In) - STATIC FOR NOW
    const revenueSplit = [
        { name: 'Online', value: 12500, color: '#EAB308' }, // Gold
        { name: 'Walk-In', value: 5900, color: '#3B82F6' }  // Blue
    ];

    // Seat Utilization - STATIC FOR NOW
    const seatUtil = {
        current: 73.2,
        status: 'Healthy'
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">

            {/* Header & Quick Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-white/40">Good evening, Boss. Here&apos;s what&apos;s happening today.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-4 py-2 rounded-lg transition-colors text-sm">
                        <Plus className="w-4 h-4" /> New Booking
                    </button>
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2 rounded-lg border border-white/10 transition-colors text-sm">
                        <FileText className="w-4 h-4 text-white/60" /> Reports
                    </button>
                    <Link href="/admin/dashboard/staff" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2 rounded-lg border border-white/10 transition-colors text-sm">
                        <Users className="w-4 h-4 text-white/60" /> Team
                    </Link>
                </div>
            </div>

            {/* 1. Revenue Triumvirate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Today */}
                <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Today&apos;s Revenue</p>
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-bold text-white">
                            GHS {stats?.today.revenue.toLocaleString() || '0'}
                        </span>
                        <span className="text-sm text-white/40 ml-2">({stats?.today.count || 0} appts)</span>
                    </div>
                </div>

                {/* This Week */}
                <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">This Week</p>
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-bold text-white">
                            GHS {stats?.week.revenue.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/30">{stats?.week.count || 0} appointments this week</span>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">This Month</p>
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-bold text-white">
                            GHS {stats?.month.revenue.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/30">{stats?.month.count || 0} appointments this month</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Main Chart: Peak Times (2/3 width) */}
                <div className="lg:col-span-2 bg-richblack-800 border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gold-500" />
                                Peak Booking Times
                            </h3>
                            <p className="text-white/40 text-sm">Average bookings per hour (Last 30 Days)</p>
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2 text-blue-400">
                                <div className="w-3 h-3 bg-blue-500 rounded-full" /> Weekdays
                            </div>
                            <div className="flex items-center gap-2 text-gold-400">
                                <div className="w-3 h-3 bg-gold-500 rounded-full" /> Weekends
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakTimeData} barGap={0} barCategoryGap={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#ffffff40"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#ffffff40"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1D21', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="weekday" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="weekend" fill="#EAB308" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Side Stats (1/3 width) */}
                <div className="space-y-6">

                    {/* Seat Utilization */}
                    <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-white/60" /> Seat Utilization
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-green-500/10 text-green-400`}>
                                {seatUtil.status}
                            </span>
                        </div>

                        <div className="relative pt-2 pb-6 flex justify-center">
                            <div className="w-40 h-40 rounded-full border-[12px] border-white/5 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="44"
                                        fill="none"
                                        stroke="#4ade80"
                                        strokeWidth="12"
                                        strokeDasharray={`${seatUtil.current * 2.76} 276`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="text-center">
                                    <span className="text-3xl font-bold text-white block">{seatUtil.current}%</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Efficiency</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Split */}
                    <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl">
                        <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-white/60" /> Revenue Source
                        </h3>
                        <div className="h-full flex items-center justify-center text-white/40 text-sm italic">
                            Coming soon
                        </div>
                    </div>

                    {/* No Show Rate */}
                    <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">No-Show / Completed</p>
                            <span className="text-xl font-bold text-white">
                                {stats?.noshow.count || 0} / {stats?.noshow.total || 0}
                            </span>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/5 text-white`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 4. Barber Performance Leaderboard */}
                <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-gold-500" />
                            Barber Performance
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-white/40 uppercase bg-white/5 rounded-lg">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Barber</th>
                                    <th className="px-4 py-3">Revenue</th>
                                    <th className="px-4 py-3">Appts</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Retention</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {barberPerf.length > 0 ? (
                                    barberPerf.map((barber) => (
                                        <tr key={barber.staff_id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4 font-medium text-white flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-xs ring-1 ring-gold-500/20">
                                                    {barber.staff_name.charAt(0)}
                                                </div>
                                                {barber.staff_name}
                                            </td>
                                            <td className="px-4 py-4 text-white">GHS {barber.revenue.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-white/60 text-center">{barber.appointments}</td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400">
                                                    {barber.retention_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                                            No performance data yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Recent Transactions Audit */}
                <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            Recent Transactions
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-white/40 uppercase bg-white/5 rounded-lg">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Time</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentTx.length > 0 ? (
                                    recentTx.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4 text-white/60 font-mono text-xs">
                                                {tx.booking_date} <br /> {tx.booking_time.slice(0, 5)}
                                            </td>
                                            <td className="px-4 py-4 text-white font-medium">{tx.customer_name}</td>
                                            <td className="px-4 py-4 text-white">GHS {tx.total_price}</td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${tx.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                    tx.payment_status === 'refunded' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {tx.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                                            No recent transactions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
