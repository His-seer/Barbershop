'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface VerifyBookingResult {
    success: boolean;
    data?: {
        id: string;
        customer_name: string;
        service_name: string;
        booking_date: string;
    };
    error?: string;
}

export async function verifyBookingForReview(reference: string): Promise<VerifyBookingResult> {
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, error: 'System not configured.' };
    }

    // 1. Find the booking by reference
    // We only select needed fields to calculate eligibility
    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
            id,
            customer_name,
            booking_date,
            status,
            service:services(name),
            reviews(id)
        `)
        .eq('reference', reference) // Assumes 'reference' is the unique booking code
        .single();

    if (error || !booking) {
        return { success: false, error: 'Booking reference not found.' };
    }

    // 2. Eligibility Checks
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
        // Allow confirmed too just in case they review right after service but status wasn't manually updated yet?
        // Better to restrict to 'completed' or past dates?
        // For now, let's allow if date is in past OR status is completed
        const isPast = new Date(booking.booking_date) < new Date();
        if (!isPast && booking.status !== 'completed') {
            return { success: false, error: 'You can only review completed appointments.' };
        }
    }

    // 3. Check for existing review
    if (booking.reviews && booking.reviews.length > 0) {
        return { success: false, error: 'You have already reviewed this booking.' };
    }

    return {
        success: true,
        data: {
            id: booking.id,
            customer_name: booking.customer_name,
            // @ts-expect-error Supabase typed join payload not modeled in our types
            service_name: booking.service?.name || 'Service',
            booking_date: booking.booking_date
        }
    };
}

export async function submitReviewAction(
    bookingId: string,
    customerName: string,
    rating: number,
    comment: string
) {
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, error: 'System not configured.' };
    }

    const { error } = await supabase
        .from('reviews')
        .insert({
            booking_id: bookingId,
            customer_name: customerName,
            rating,
            comment,
            is_approved: false // Pending moderation
        });

    if (error) {
        console.error('Submit review error:', error);
        return { success: false, error: 'Failed to submit review.' };
    }

    revalidatePath('/admin/dashboard/reviews');
    return { success: true };
}
