'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Mark a staff member as unavailable for a specific date range
 * This creates a time-off record and optionally cancels/notifies existing bookings
 */
export async function markStaffUnavailable(
    date: string, // YYYY-MM-DD - the date to block
    reason: string
) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const staffId = cookieStore.get('staff_session')?.value;

    if (!supabase || !staffId) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // 1. Insert time-off record for this specific date
        const { error: timeOffError } = await supabase
            .from('staff_time_off')
            .insert({
                staff_id: staffId,
                start_date: date,
                end_date: date, // Same day for emergency unavailability
                reason: reason
            });

        if (timeOffError) {
            console.error('Error creating time off:', timeOffError);
            return { success: false, error: timeOffError.message };
        }

        // 2. Find all confirmed/pending bookings for this staff on this date
        const { data: bookingsToCancel, error: fetchError } = await supabase
            .from('bookings')
            .select('id, customer_name, customer_email, booking_time, service:services(name)')
            .eq('staff_id', staffId)
            .eq('booking_date', date)
            .in('status', ['confirmed', 'pending']);

        if (fetchError) {
            console.error('Error fetching bookings:', fetchError);
            // Don't fail - time off is created, just couldn't cancel bookings
        }

        // 3. Cancel all those bookings
        if (bookingsToCancel && bookingsToCancel.length > 0) {
            const { error: cancelError } = await supabase
                .from('bookings')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    cancellation_reason: `Staff unavailable: ${reason}`
                })
                .eq('staff_id', staffId)
                .eq('booking_date', date)
                .in('status', ['confirmed', 'pending']);

            if (cancelError) {
                console.error('Error cancelling bookings:', cancelError);
            }

            // TODO: Send email/SMS notifications to customers
            // For now, just log the affected customers
            console.log(`Cancelled ${bookingsToCancel.length} bookings:`, bookingsToCancel);
        }

        revalidatePath('/staff/dashboard');
        return {
            success: true,
            cancelledCount: bookingsToCancel?.length || 0
        };

    } catch (error) {
        console.error('Error in markStaffUnavailable:', error);
        return { success: false, error: 'Failed to mark unavailable' };
    }
}
