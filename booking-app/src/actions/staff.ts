'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Toggles a staff member's active status (Online/Offline)
 */
export async function toggleStaffStatusAction(staffId: string, isActive: boolean) {
    const supabase = await createClient();
    if (!supabase) {
        return { success: false, error: 'Supabase is not configured' };
    }

    try {
        // We can use the RPC or direct update. 
        // RPC is safer usually, but direct update is fine if RLS allows.
        // Let's use the RPC defined in queries.ts pattern or direct update.
        // The RPC is `toggle_staff_status`.

        const { error } = await supabase.rpc('toggle_staff_status', {
            p_staff_id: staffId,
            p_is_active: isActive
        });

        if (error) {
            console.error('Error toggling staff status:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/staff/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error in toggleStaffStatusAction:', error);
        return { success: false, error: 'Failed to update status' };
    }
}
