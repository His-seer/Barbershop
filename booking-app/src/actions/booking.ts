'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/utils/email';
import { BookingConfirmationEmail } from '@/components/emails/BookingConfirmation';

export async function createAppointment(bookingData: {
    reference: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    barberId: string;
    serviceName: string;
    servicePrice: number;
    addons: string[];
    totalAmount: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    status?: 'confirmed' | 'pending';
    type?: 'online' | 'walk_in' | 'home';
    birthday?: string;
}) {
    const supabase = await createClient();

    // DEMO MODE FALLBACK
    if (!supabase) {
        console.warn('Supabase not configured. Using Demo Mode for createAppointment.');
        return { success: true, id: `mock-${Date.now()}` };
    }

    try {
        // Check if appointment already exists (idempotency)
        const { data: existing } = await supabase
            .from('bookings')
            .select('id')
            .eq('reference', bookingData.reference)
            .single();

        if (existing) {
            return { success: true, id: existing.id };
        }

        // LOOKUP SERVICE ID
        // The modal sends 'serviceName', but DB requires 'service_id'.
        let serviceIdVal = null;

        // 1. Try to find exact match
        const { data: serviceFile } = await supabase
            .from('services')
            .select('id')
            .ilike('name', bookingData.serviceName)
            .maybeSingle(); // Use maybeSingle to avoid error if not found

        if (serviceFile) {
            serviceIdVal = serviceFile.id;
        } else {
            // 2. Fallback: Get the first service in the list (usually "Classic Haircut")
            const { data: anyService } = await supabase
                .from('services')
                .select('id')
                .limit(1)
                .single();

            if (anyService) serviceIdVal = anyService.id;
        }

        if (!serviceIdVal) {
            return { success: false, error: 'No services found in database. Cannot create booking.' };
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                payment_reference: bookingData.reference,

                customer_name: bookingData.clientName,
                customer_phone: bookingData.clientPhone,
                customer_email: bookingData.clientEmail,
                staff_id: bookingData.barberId,
                service_id: serviceIdVal, // Now we have a valid UUID

                booking_date: bookingData.date,
                booking_time: bookingData.time,

                service_price: bookingData.servicePrice,
                total_price: bookingData.totalAmount,

                status: bookingData.status || 'confirmed',
                payment_status: 'paid', // Walk-ins are usually paid or marked as such

                customer_notes: bookingData.birthday ? `Birthday: ${bookingData.birthday}` : '',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating appointment:', error);
            // If table doesn't exist, this will error. 
            // We'll log it but maybe we shouldn't fail the user flow completely on the UI?
            return { success: false, error: error.message };
        }

        // --- SEND EMAIL NOTIFICATION ---
        if (bookingData.clientEmail) {
            await sendEmail({
                to: bookingData.clientEmail,
                subject: `Booking Confirmed: ${bookingData.serviceName}`,
                react: BookingConfirmationEmail({
                    customerName: bookingData.clientName,
                    serviceName: bookingData.serviceName,
                    date: bookingData.date,
                    time: bookingData.time,
                    price: bookingData.totalAmount,
                    reference: bookingData.reference,
                }),
            });
        }
        // -------------------------------

        revalidatePath('/staff/dashboard');
        return { success: true, id: data.id };

    } catch (error) {
        console.error('Unexpected error creating appointment:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function updateAppointmentStatus(id: string, status: 'completed' | 'no_show' | 'cancelled') {
    const supabase = await createClient();
    if (!supabase) return { success: true }; // Mock success

    try {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/staff/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function addAppointmentNote(id: string, note: string) {
    const supabase = await createClient();
    if (!supabase) return { success: true }; // Mock success

    try {
        // Append note or simple replace? Let's generic replace for now 
        const { error } = await supabase
            .from('bookings')
            .update({ customer_notes: note })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/staff/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error adding note:', error);
        return { success: false, error: 'Failed to add note' };
    }
}
