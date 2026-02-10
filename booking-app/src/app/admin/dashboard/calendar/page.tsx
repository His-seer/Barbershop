'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    DollarSign,
    Phone,
    Mail,
    X,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { getBookingsForCalendar, getStaff } from '@/utils/supabase/queries';
import type { Staff } from '@/types/database';

interface CalendarBooking {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    booking_date: string;
    booking_time: string;
    total_price: number;
    status: string;
    payment_status: string;
    customer_notes: string | null;
    staff_notes: string | null;
    staff: { id: string; name: string; avatar_url: string | null } | null;
    service: { id: string; name: string; duration_minutes: number } | null;
}

type CalendarBookingRaw = Omit<CalendarBooking, 'staff'> & {
    staff: { id: string; name: string; avatar_url: string | null } | { id: string; name: string; avatar_url: string | null }[] | null;
};

// Generate time slots from 8 AM to 10 PM
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return {
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: hour <= 12 ? `${hour}AM` : `${hour - 12}PM`
    };
});

// Staff colors for visual differentiation
const STAFF_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-amber-500',
];

export default function CalendarPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedStaff, setSelectedStaff] = useState<string>('all');
    const [bookings, setBookings] = useState<CalendarBooking[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);

    // Get week boundaries
    const weekStart = useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        date.setDate(date.getDate() - day + 1); // Monday
        return date;
    }, [currentDate]);

    const weekEnd = useMemo(() => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + 6); // Sunday
        return date;
    }, [weekStart]);

    // Get days of the week
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            return date;
        });
    }, [weekStart]);

    useEffect(() => {
        fetchData();
    }, [weekStart, weekEnd, selectedStaff]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const startStr = weekStart.toISOString().split('T')[0];
            const endStr = weekEnd.toISOString().split('T')[0];

            const [bookingsData, staffData] = await Promise.all([
                getBookingsForCalendar(startStr, endStr, selectedStaff),
                getStaff()
            ]);

            // Normalize query result shape (staff can come back as an object or 1-element array depending on Supabase join)
            const normalizedBookings: CalendarBooking[] = (bookingsData as unknown as CalendarBookingRaw[]).map((b) => ({
                ...b,
                staff: Array.isArray(b.staff) ? (b.staff[0] ?? null) : b.staff,
            }));

            setBookings(normalizedBookings);
            setStaff(staffData);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getStaffColor = (staffId: string) => {
        const index = staff.findIndex(s => s.id === staffId);
        return STAFF_COLORS[index % STAFF_COLORS.length];
    };

    const getBookingsForSlot = (date: Date, timeSlot: string) => {
        const dateStr = date.toISOString().split('T')[0];
        return bookings.filter(b => {
            if (b.booking_date !== dateStr) return false;
            const bookingHour = parseInt(b.booking_time.split(':')[0]);
            const slotHour = parseInt(timeSlot.split(':')[0]);
            return bookingHour === slotHour;
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Booking Calendar</h1>
                    <p className="text-white/40 text-sm mt-1">View and manage appointments</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Staff Filter */}
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="bg-richblack-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                    >
                        <option value="all">All Staff</option>
                        {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    {/* Today Button */}
                    <button
                        onClick={goToToday}
                        className="px-4 py-2.5 bg-gold-500/10 text-gold-500 border border-gold-500/20 rounded-xl text-sm font-medium hover:bg-gold-500/20 transition-colors"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between bg-richblack-800 border border-white/5 rounded-2xl p-4">
                <button
                    onClick={goToPreviousWeek}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <h2 className="text-white font-bold text-lg">
                        {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                </div>

                <button
                    onClick={goToNextWeek}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 border-b border-white/5">
                        <div className="p-3 text-white/40 text-xs uppercase border-r border-white/5">
                            Time
                        </div>
                        {weekDays.map((day, idx) => (
                            <div
                                key={idx}
                                className={`p-3 text-center border-r border-white/5 last:border-r-0 ${isToday(day) ? 'bg-gold-500/10' : ''
                                    }`}
                            >
                                <p className="text-white/40 text-xs uppercase">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className={`text-lg font-bold ${isToday(day) ? 'text-gold-500' : 'text-white'}`}>
                                    {day.getDate()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="max-h-[600px] overflow-y-auto">
                        {TIME_SLOTS.map((slot) => (
                            <div key={slot.value} className="grid grid-cols-8 border-b border-white/5 last:border-b-0 min-h-[60px]">
                                {/* Time Label */}
                                <div className="p-2 text-white/40 text-xs border-r border-white/5 flex items-start justify-center pt-3">
                                    {slot.label}
                                </div>

                                {/* Day Cells */}
                                {weekDays.map((day, dayIdx) => {
                                    const slotBookings = getBookingsForSlot(day, slot.value);
                                    return (
                                        <div
                                            key={dayIdx}
                                            className={`p-1 border-r border-white/5 last:border-r-0 min-h-[60px] ${isToday(day) ? 'bg-gold-500/5' : ''
                                                }`}
                                        >
                                            {slotBookings.map((booking) => (
                                                <button
                                                    key={booking.id}
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className={`w-full p-1.5 rounded-lg text-left text-xs text-white mb-1 hover:opacity-80 transition-opacity ${booking.staff ? getStaffColor(booking.staff.id) : 'bg-gray-500'
                                                        }`}
                                                >
                                                    <p className="font-medium truncate">{booking.customer_name}</p>
                                                    <p className="opacity-75 truncate text-[10px]">
                                                        {booking.booking_time.slice(0, 5)}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Staff Legend */}
            {staff.length > 0 && (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Staff Legend</p>
                    <div className="flex flex-wrap gap-3">
                        {staff.map((s) => (
                            <div key={s.id} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getStaffColor(s.id)}`} />
                                <span className="text-white text-sm">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Booking Detail Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <BookingDetailModal
                        booking={selectedBooking}
                        onClose={() => setSelectedBooking(null)}
                        formatCurrency={formatCurrency}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// =====================================================
// BOOKING DETAIL MODAL
// =====================================================
function BookingDetailModal({ booking, onClose, formatCurrency }: {
    booking: CalendarBooking;
    onClose: () => void;
    formatCurrency: (n: number) => string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-richblack-800 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">{booking.customer_name}</h2>
                        <p className="text-white/40 text-sm">
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    {/* Time & Staff */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white/60">
                            <Clock className="w-4 h-4" />
                            <span>{booking.booking_time.slice(0, 5)}</span>
                        </div>
                        {booking.staff && (
                            <div className="flex items-center gap-2 text-white/60">
                                <Users className="w-4 h-4" />
                                <span>{booking.staff.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/60">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{booking.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{booking.customer_phone}</span>
                        </div>
                    </div>

                    {/* Service */}
                    {booking.service && (
                        <div>
                            <p className="text-white/40 text-xs uppercase mb-2">Service</p>
                            <p className="text-white text-sm">
                                • {booking.service.name} ({booking.service.duration_minutes} min)
                            </p>
                        </div>
                    )}

                    {/* Price & Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                            <p className="text-white/40 text-xs">Total</p>
                            <p className="text-gold-500 text-xl font-bold">{formatCurrency(booking.total_price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {booking.payment_status === 'paid' ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Paid
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {booking.payment_status}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {(booking.customer_notes || booking.staff_notes) && (
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-white/40 text-xs uppercase mb-1">Notes</p>
                            {booking.customer_notes && (
                                <p className="text-white/60 text-sm mb-2">
                                    <span className="text-white/40">Customer:</span> {booking.customer_notes}
                                </p>
                            )}
                            {booking.staff_notes && (
                                <p className="text-white/60 text-sm">
                                    <span className="text-white/40">Staff:</span> {booking.staff_notes}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
