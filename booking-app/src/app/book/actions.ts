'use server';

import { createClient } from '@/utils/supabase/server';
import { createBooking } from '@/utils/supabase/queries';
import type { CreateBookingData } from '@/types/database';
import { redirect } from 'next/navigation';

export async function saveBookingAfterPayment(bookingData: CreateBookingData) {
    try {
        const booking = await createBooking(bookingData);

        if (!booking) {
            return { success: false, error: 'Failed to create booking' };
        }

        return { success: true, bookingId: booking.id };
    } catch (error) {
        console.error('Error saving booking:', error);
        return { success: false, error: 'An error occurred while saving your booking' };
    }
}

export async function verifyPaystackPayment(reference: string) {
    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
            console.warn('PAYSTACK_SECRET_KEY not set - using mock verification');
            return {
                success: true,
                data: {
                    status: 'success',
                    amount: 0,
                    metadata: {}
                }
            };
        }

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
                cache: 'no-store',
            }
        );

        const data = await response.json();

        if (data.status && data.data.status === 'success') {
            return { success: true, data: data.data };
        }

        return { success: false, error: data.message || 'Payment verification failed' };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return { success: false, error: 'Payment verification error' };
    }
}
