'use server';

import { createClient } from '@/utils/supabase/server';
import { verifyPin } from '@/utils/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginStaff(prevState: unknown, formData: FormData) {
    const phone = formData.get('phone') as string;
    const pin = formData.get('pin') as string;

    if (!phone || !pin) {
        return { error: 'Please enter both phone number and PIN.' };
    }

    const supabase = await createClient();

    // 1. Check if configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabase) {
        return { error: 'System not configured.' };
    }

    try {
        // 2. Fetch staff by phone
        // Note: We do NOT filter by is_active here. The is_active flag controls
        // whether the staff member accepts bookings, not whether they can log in.
        // An offline staff member should still be able to access their dashboard.
        const { data: staff, error } = await supabase
            .from('staff')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !staff) {
            console.error('Staff login error:', error);
            // Generic error for security
            return { error: 'Invalid credentials.' };
        }

        // 3. Verify PIN
        const isValid = await verifyPin(pin, staff.pin_hash);

        if (!isValid) {
            return { error: 'Invalid credentials.' };
        }

        // 4. Create Session
        // For simplicity in this Foundation phase, we'll store the staff ID in a secure cookie.
        const cookieStore = await cookies();
        cookieStore.set('staff_session', staff.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

    } catch (err) {
        console.error('Unexpected error during staff login:', err);
        return { error: 'An unexpected error occurred.' };
    }

    redirect('/staff/dashboard');
}

export async function logoutStaff() {
    const cookieStore = await cookies();
    cookieStore.delete('staff_session');
    redirect('/staff/login');
}
