'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Save,
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getCustomerById, getBookings, updateCustomerNotes } from '@/utils/supabase/queries';
import { Customer, BookingWithDetails } from '@/types/database';
import Link from 'next/link';

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setIsLoading(true);
        try {
            const customerData = await getCustomerById(id);
            if (!customerData) {
                // Handle 404
                return;
            }
            setCustomer(customerData);
            setNotes(customerData.notes || '');

            // Fetch bookings for this customer
            const customerBookings = await getBookings({
                customer_email: customerData.email
            });
            setBookings(customerBookings);

        } catch (error) {
            console.error('Failed to load customer data', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSaveNotes() {
        if (!customer) return;
        setIsSavingNotes(true);
        try {
            const result = await updateCustomerNotes(customer.id, notes);
            if (result.success) {
                // Optional: Show toast
            } else {
                alert('Failed to save notes');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setIsSavingNotes(false);
        }
    }

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
    if (!customer) return <div className="text-white text-center py-20">Customer not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Back Button */}
            <Link href="/admin/dashboard/customers" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-black font-bold text-3xl shadow-lg shadow-gold-500/10">
                        {customer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white mb-1">{customer.full_name}</h1>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gold-500/50" />
                                {customer.email}
                            </div>
                            {customer.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gold-500/50" />
                                    {customer.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-richblack-800 border border-white/5 rounded-xl px-6 py-4 text-center">
                        <div className="text-2xl font-bold text-white">{customer.total_bookings}</div>
                        <div className="text-xs uppercase tracking-wider text-white/40">Total Visits</div>
                    </div>
                    {/* Could add Total Spend here later */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Notes & Info */}
                <div className="space-y-8">
                    {/* Private Notes */}
                    <div className="bg-richblack-800 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <MessageSquare className="w-4 h-4 text-gold-500" />
                                Private Notes
                            </div>
                            <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="text-xs bg-gold-500 text-black font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-gold-400 disabled:opacity-50 transition-all"
                            >
                                {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                Save
                            </button>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-40 bg-richblack-900 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-gold-500/50 focus:outline-none resize-none"
                                placeholder="Add private notes about this client (preferences, allergies, topics to avoid, etc)..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking History */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gold-500" />
                        Booking History
                    </h2>

                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-richblack-800 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/5 p-2.5 rounded-lg text-white">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">
                                                {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-sm text-white/40 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {booking.booking_time.substring(0, 5)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 text-xs font-bold rounded-full border ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {booking.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Service</div>
                                        <div className="text-white font-medium">{booking.service?.name || 'Unknown Service'}</div>
                                        {booking.addons && booking.addons.length > 0 && (
                                            <div className="text-sm text-white/60 mt-1">
                                                + {booking.addons.map(a => a.name).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Barber</div>
                                        <div className="text-white font-medium">{booking.staff?.name || 'Any Barber'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {bookings.length === 0 && (
                            <div className="text-center py-10 text-white/40 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p>No booking history found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
