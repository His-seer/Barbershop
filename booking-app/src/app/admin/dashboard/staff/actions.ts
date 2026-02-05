'use server';

import { createClient } from '@/utils/supabase/server';
import { hashPin } from '@/utils/auth';
import { sendPinNotification } from '@/utils/sms';

interface SetPinResult {
    success: boolean;
    smsSent: boolean;
    error?: string;
}

export async function setStaffPinWithNotification(
    staffId: string,
    pin: string,
    staffName: string,
    staffPhone: string | null
): Promise<SetPinResult> {
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, smsSent: false, error: 'Database not configured' };
    }

    try {
        // Hash and save PIN
        const pinHash = await hashPin(pin);

        const { error } = await supabase
            .from('staff')
            .update({ pin_hash: pinHash })
            .eq('id', staffId);

        if (error) {
            console.error('Error setting PIN:', error);
            return { success: false, smsSent: false, error: error.message };
        }

        // Send SMS notification if phone number exists
        let smsSent = false;
        if (staffPhone) {
            const smsResult = await sendPinNotification(staffPhone, staffName, pin);
            smsSent = smsResult.success;
            if (!smsResult.success) {
                console.warn('SMS notification failed:', smsResult.error);
            }
        }

        return { success: true, smsSent };
    } catch (error) {
        console.error('Error in setStaffPinWithNotification:', error);
        return { success: false, smsSent: false, error: 'Unexpected error' };
    }
}

export async function clearStaffPinAction(staffId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    const { error } = await supabase
        .from('staff')
        .update({ pin_hash: null })
        .eq('id', staffId);

    if (error) {
        console.error('Error clearing PIN:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// For staff changing their own PIN
export async function changeStaffPin(
    staffId: string,
    currentPin: string,
    newPin: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    // Get current staff data
    const { data: staff, error: fetchError } = await supabase
        .from('staff')
        .select('pin_hash')
        .eq('id', staffId)
        .single();

    if (fetchError || !staff) {
        return { success: false, error: 'Staff not found' };
    }

    // Verify current PIN
    const { verifyPin } = await import('@/utils/auth');
    const isValid = await verifyPin(currentPin, staff.pin_hash);

    if (!isValid) {
        return { success: false, error: 'Current PIN is incorrect' };
    }

    // Set new PIN
    const newPinHash = await hashPin(newPin);

    const { error: updateError } = await supabase
        .from('staff')
        .update({ pin_hash: newPinHash })
        .eq('id', staffId);

    if (updateError) {
        return { success: false, error: 'Failed to update PIN' };
    }

    return { success: true };
}
