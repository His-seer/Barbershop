import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAppointmentReminder } from '@/utils/sms';

// Prevent vercel from caching this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Security Check
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow running in development without secret for testing convenience if explicitly enabled
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const supabase = await createClient();

        if (!supabase) {
            return NextResponse.json({ error: 'System not configured' }, { status: 500 });
        }

        // 2. Calculate "Tomorrow"
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDateString = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

        // 3. Find Bookings
        // - Confirmed
        // - For tomorrow
        // - No reminder sent yet
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                customer_name,
                customer_phone,
                booking_date,
                booking_time
            `)
            .eq('status', 'confirmed')
            .eq('booking_date', tomorrowDateString)
            .eq('reminder_sent', false);

        if (error) {
            console.error('Database error fetching bookings:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({
                message: 'No upcoming bookings found for reminders.',
                date: tomorrowDateString
            });
        }

        // 4. Send Reminders
        const results = await Promise.all(bookings.map(async (booking) => {
            // Skip if no phone
            if (!booking.customer_phone) return { id: booking.id, status: 'skipped_no_phone' };

            // Send SMS
            const result = await sendAppointmentReminder({
                customer_name: booking.customer_name,
                booking_date: booking.booking_date,
                booking_time: booking.booking_time,
                customer_phone: booking.customer_phone
            });

            if (result.success) {
                // Update DB
                await supabase
                    .from('bookings')
                    .update({ reminder_sent: true })
                    .eq('id', booking.id);

                return { id: booking.id, status: 'sent', recipient: booking.customer_name };
            } else {
                return { id: booking.id, status: 'failed', error: result.error };
            }
        }));

        // 5. Summary
        const sentCount = results.filter(r => r.status === 'sent').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        return NextResponse.json({
            success: true,
            message: `Processed ${bookings.length} bookings. Sent: ${sentCount}, Failed: ${failedCount}`,
            results
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
