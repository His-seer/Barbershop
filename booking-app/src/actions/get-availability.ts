'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Get available time slots for a barber on a specific date.
 * Queries the database for existing appointments and returns slots that are not booked.
 * Also ensures there is enough contiguous time for the requested duration.
 * 
 * @param barberId - The barber's ID (matches barber_id in appointments table)
 * @param date - The date to check availability for
 * @param durationMinutes - The duration of the service in minutes (default 30)
 * @returns Array of available time slots in "HH:mm" format
 */
export async function getBarberAvailability(barberId: string, date: Date, durationMinutes: number = 30): Promise<string[]> {
    const supabase = await createClient();

    // Format date as YYYY-MM-DD for database query
    const dateString = date.toISOString().split('T')[0];

    // Check for supabase client
    if (!supabase) {
        console.warn('Supabase not configured. Using Demo Mode for availability.');
        let allSlots = generateTimeSlots(9, 21);

        // Filter out past slots if looking at today
        const now = new Date();
        const dateString = date.toISOString().split('T')[0];
        const todayString = now.toISOString().split('T')[0];

        if (dateString === todayString) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            allSlots = allSlots.filter(slot => {
                const [h, m] = slot.split(':').map(Number);
                return h > currentHour || (h === currentHour && m > currentMinute);
            });
        }

        return getDemoAvailability(barberId, date, allSlots, durationMinutes);
    }

    // Determine day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = date.getDay();

    // First check if the staff member is active (not offline)
    const { data: staffMember } = await supabase
        .from('staff')
        .select('is_active')
        .eq('id', barberId)
        .single();

    // If staff is offline, return no slots
    if (!staffMember || !staffMember.is_active) {
        return [];
    }

    // Fetch staff schedule for this specific day
    const { data: schedule } = await supabase
        .from('staff_schedules')
        .select('start_time, end_time, is_available')
        .eq('staff_id', barberId)
        .eq('day_of_week', dayOfWeek)
        .single();

    // Check if staff has marked this date as unavailable (emergency time-off)
    const { data: timeOff } = await supabase
        .from('staff_time_off')
        .select('id')
        .eq('staff_id', barberId)
        .lte('start_date', dateString)  // Time-off starts on or before this date
        .gte('end_date', dateString)    // Time-off ends on or after this date
        .maybeSingle();

    // If there's a time-off record for this date, return no slots
    if (timeOff) {
        return [];
    }

    // Define working hours based on schedule or defaults
    let startHour = 9;
    let endHour = 21;

    if (schedule) {
        if (!schedule.is_available) {
            return []; // Closed on this day
        }
        // Extract hours from HH:mm:ss string ("09:00:00" -> 9)
        startHour = parseInt(schedule.start_time.split(':')[0]);
        endHour = parseInt(schedule.end_time.split(':')[0]);
    }

    // Generate possible time slots for this specific day
    let allSlots = generateTimeSlots(startHour, endHour);

    // Filter out past slots if looking at today
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];

    if (dateString === todayString) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        allSlots = allSlots.filter(slot => {
            const [h, m] = slot.split(':').map(Number);
            // Allow slots starting 15 mins from now to give buffer
            // Or just strict future slots
            // User asked: "if time is 2pm will slots be from 9am" -> implying we just hide 9am
            // Current Logic: Only show slots that are strictly in the future relative to server time.
            return h > currentHour || (h === currentHour && m > currentMinute);
        });
    }

    try {
        // Fetch all bookings for this staff on this date
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                booking_time,
                service:services(name),
                booking_addons(addon_name)
            `)
            .eq('staff_id', barberId)
            .eq('booking_date', dateString)
            .in('status', ['confirmed', 'pending', 'paid']); // Only consider active bookings

        if (error) {
            console.error('Error fetching bookings:', error);
            // Fallback to demo mode on error
            return getDemoAvailability(barberId, date, allSlots, durationMinutes);
        }

        // Build a set of booked time slots
        const bookedSlots = new Set<string>();

        if (bookings && bookings.length > 0) {
            bookings.forEach((booking: any) => {
                const startTime = booking.booking_time;
                const serviceName = booking.service?.name || 'Unknown Service';
                const addonNames = booking.booking_addons?.map((a: any) => a.addon_name) || [];

                // Estimate duration
                const duration = estimateServiceDuration(serviceName, addonNames);

                // Block all slots within this booking's duration
                const blockedSlots = getBlockedSlots(startTime, duration);
                blockedSlots.forEach(slot => bookedSlots.add(slot));
            });
        }

        // Filter valid start times based on booked slots and requested duration
        return filterValidStartTimes(allSlots, bookedSlots, durationMinutes);

    } catch (error) {
        console.error('Unexpected error fetching availability:', error);
        // Fallback to demo mode
        return getDemoAvailability(barberId, date, allSlots, durationMinutes);
    }
}

/**
 * Filter slots to ensure they are free AND have enough contiguous free time
 */
function filterValidStartTimes(allSlots: string[], bookedSlots: Set<string>, durationMinutes: number): string[] {
    const validSlots: string[] = [];
    const slotsNeeded = Math.ceil(durationMinutes / 15);

    // Map time strings to minutes for easier calculation
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const allSlotsMap = new Set(allSlots);

    for (const slot of allSlots) {
        // If start time is already booked, skip
        if (bookedSlots.has(slot)) continue;

        // Check if we have enough contiguous slots
        let isContiguous = true;
        const startMinutes = timeToMinutes(slot);

        for (let i = 1; i < slotsNeeded; i++) {
            const checkMinutes = startMinutes + (i * 15);
            const h = Math.floor(checkMinutes / 60);
            const m = checkMinutes % 60;
            const checkSlot = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // If a required subsequent slot is booked or doesn't exist (past closing), this start time is invalid
            if (bookedSlots.has(checkSlot) || !allSlotsMap.has(checkSlot)) {
                isContiguous = false;
                break;
            }
        }

        if (isContiguous) {
            validSlots.push(slot);
        }
    }

    return validSlots;
}

/**
 * Generate all possible time slots from startHour to endHour in 15-minute intervals
 */
function generateTimeSlots(startHour: number, endHour: number): string[] {
    const slots: string[] = [];
    let start = startHour * 60; // Start in minutes
    const end = endHour * 60;   // End in minutes

    while (start < end) {
        const h = Math.floor(start / 60);
        const m = start % 60;
        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        slots.push(timeString);
        start += 15;
    }

    return slots;
}

/**
 * Estimate service duration based on service name and addons
 * In production, this should query a services table
 */
function estimateServiceDuration(serviceName: string, addons?: string[]): number {
    let duration = 45; // Default 45 minutes

    // Adjust based on service name
    if (serviceName.toLowerCase().includes('royal') || serviceName.toLowerCase().includes('premium')) {
        duration = 60;
    } else if (serviceName.toLowerCase().includes('kids')) {
        duration = 30;
    } else if (serviceName.toLowerCase().includes('home')) {
        duration = 90;
    }

    // Add addon durations
    if (addons && addons.length > 0) {
        addons.forEach(addon => {
            if (addon.toLowerCase().includes('dye')) duration += 30;
            else if (addon.toLowerCase().includes('texturizing')) duration += 45;
            else duration += 15; // Default addon time
        });
    }

    return duration;
}

/**
 * Get all time slots that should be blocked by an appointment
 */
function getBlockedSlots(startTime: string, durationMinutes: number): string[] {
    const blocked: string[] = [];

    // Parse start time
    const [hours, minutes] = startTime.split(':').map(Number);
    let currentMinutes = hours * 60 + minutes;
    const endMinutes = currentMinutes + durationMinutes;

    // Block all 15-minute slots within the duration
    while (currentMinutes < endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        blocked.push(timeString);
        currentMinutes += 15;
    }

    return blocked;
}

/**
 * Demo mode availability - simulates realistic booking patterns
 */
function getDemoAvailability(barberId: string, date: Date, allSlots: string[], durationMinutes: number): string[] {
    // Use the same logic as the old client-side function for consistency
    const dayOfMonth = date.getDate();
    const barberIndex = ['emmanuel-darko', 'samuel-osei', 'kwabena-agyei'].indexOf(barberId);

    const bookedSlotIndices = new Set<string>(); // Storing booked time strings
    const seed = dayOfMonth + (barberIndex >= 0 ? barberIndex : 0) * 7;

    // Helper to add booked slots by index in allSlots array
    const addBusy = (index: number) => {
        if (index >= 0 && index < allSlots.length) {
            bookedSlotIndices.add(allSlots[index]);
        }
    };

    // Morning rush
    if ((seed % 3) === 0) {
        addBusy(2);  // 09:30
        addBusy(3);  // 09:45
    }
    if ((seed % 4) === 0) {
        addBusy(4);  // 10:00
        addBusy(5);  // 10:15
    }

    // Lunch time bookings
    addBusy(12 + ((barberIndex >= 0 ? barberIndex : 0) * 2) % 4);
    addBusy(13 + (barberIndex >= 0 ? barberIndex : 0) % 3);

    // Afternoon bookings
    if ((seed % 2) === 0) {
        addBusy(20 + (barberIndex >= 0 ? barberIndex : 0));
        addBusy(24 + (barberIndex >= 0 ? barberIndex : 0));
    }

    // Evening rush
    if (dayOfMonth % 2 === (barberIndex >= 0 ? barberIndex : 0) % 2) {
        addBusy(32); // 17:00
        addBusy(33); // 17:15
        addBusy(36); // 18:00
    }

    // Now filter using the common logic to ensure duration fits
    return filterValidStartTimes(allSlots, bookedSlotIndices, durationMinutes);
}
