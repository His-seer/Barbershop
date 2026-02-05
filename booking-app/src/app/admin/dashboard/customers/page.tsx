'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    ArrowRight,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getCustomers } from '@/utils/supabase/queries';
import { Customer } from '@/types/database';
import Link from 'next/link';

export default function CustomersPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setIsLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers', error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery))
    );

    function formatDate(dateString: string | null) {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Customer Management</h1>
                    <p className="text-white/40">View and manage your client relationships.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-richblack-800 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        className="w-full bg-richblack-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-gold-500/50 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-white/40 px-3">
                    {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'}
                </div>
            </div>

            {/* Customers List */}
            <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                    <Link
                        key={customer.id}
                        href={`/admin/dashboard/customers/${customer.id}`}
                        className="block bg-richblack-800 border border-white/5 rounded-xl hover:border-gold-500/30 hover:bg-white/5 transition-all group"
                    >
                        <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">

                            {/* Avatar / Initials */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/20 flex items-center justify-center text-gold-500 font-bold text-xl border border-gold-500/20">
                                {customer.full_name.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-gold-400 transition-colors">
                                        {customer.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-white/40 mt-1">
                                        <Mail className="w-3 h-3" />
                                        {customer.email}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <Phone className="w-3 h-3 text-gold-500/50" />
                                        {customer.phone || 'No phone'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <Calendar className="w-3 h-3 text-gold-500/50" />
                                        Last Visit: {formatDate(customer.last_booking_date)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 text-sm">
                                    <div className="text-right">
                                        <div className="text-white font-bold text-lg">{customer.total_bookings}</div>
                                        <div className="text-white/40 text-xs uppercase tracking-wider">Bookings</div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredCustomers.length === 0 && (
                    <div className="py-20 text-center text-white/40">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No customers found.</p>
                        {searchQuery && <p className="text-sm mt-2">Try adjusting your search terms.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
