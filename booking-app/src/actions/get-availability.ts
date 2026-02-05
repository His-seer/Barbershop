'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Get available time slots for a barber on a specific date.
 * Queries the database for existing appointments and returns slots that are not booked.
 * 
 * @param barberId - The barber's ID (matches barber_id in appointments table)
 * @param date - The date to check availability for
 * @returns Array of available time slots in "HH:mm" format
 */
export async function getBarberAvailability(barberId: string, date: Date): Promise<string[]> {
    const supabase = await createClient();

    // Format date as YYYY-MM-DD for database query
    const dateString = date.toISOString().split('T')[0];

    // Generate all possible time slots (09:00 to 21:00, 15-minute intervals)
    const allSlots = generateTimeSlots();

    // DEMO MODE FALLBACK
    if (!supabase) {
        console.warn('Supabase not configured. Using Demo Mode for availability.');
        return getDemoAvailability(barberId, date, allSlots);
    }

    try {
        // Fetch all appointments for this barber on this date
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('appointment_time, service_name, addons')
            .eq('barber_id', barberId)
            .eq('appointment_date', dateString)
            .in('status', ['confirmed', 'pending']); // Only consider active appointments

        if (error) {
            console.error('Error fetching appointments:', error);
            // Fallback to demo mode on error
            return getDemoAvailability(barberId, date, allSlots);
        }

        // If no appointments, all slots are available
        if (!appointments || appointments.length === 0) {
            return allSlots;
        }

        // Build a set of booked time slots
        // Each appointment blocks its start time + duration slots
        const bookedSlots = new Set<string>();

        appointments.forEach((apt) => {
            const startTime = apt.appointment_time;
            // Estimate duration: assume 45 min for most services, 60 for premium
            // In production, you'd look up actual service duration from a services table
            const duration = estimateServiceDuration(apt.service_name, apt.addons);

            // Block all slots within this appointment's duration
            const blockedSlots = getBlockedSlots(startTime, duration);
            blockedSlots.forEach(slot => bookedSlots.add(slot));
        });

        // Filter out booked slots
        return allSlots.filter(slot => !bookedSlots.has(slot));

    } catch (error) {
        console.error('Unexpected error fetching availability:', error);
        // Fallback to demo mode
        return getDemoAvailability(barberId, date, allSlots);
    }
}

/**
 * Generate all possible time slots from 09:00 to 21:00 in 15-minute intervals
 */
function generateTimeSlots(): string[] {
    const slots: string[] = [];
    let start = 9 * 60; // 9 AM in minutes
    const end = 21 * 60; // 9 PM

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
function getDemoAvailability(barberId: string, date: Date, allSlots: string[]): string[] {
    // Use the same logic as the old client-side function for consistency
    const dayOfMonth = date.getDate();
    const barberIndex = ['emmanuel-darko', 'samuel-osei', 'kwabena-agyei'].indexOf(barberId);

    const bookedSlotIndices = new Set<number>();
    const seed = dayOfMonth + (barberIndex >= 0 ? barberIndex : 0) * 7;

    // Morning rush
    if ((seed % 3) === 0) {
        bookedSlotIndices.add(2);  // 09:30
        bookedSlotIndices.add(3);  // 09:45
    }
    if ((seed % 4) === 0) {
        bookedSlotIndices.add(4);  // 10:00
        bookedSlotIndices.add(5);  // 10:15
    }

    // Lunch time bookings
    bookedSlotIndices.add(12 + ((barberIndex >= 0 ? barberIndex : 0) * 2) % 4);
    bookedSlotIndices.add(13 + (barberIndex >= 0 ? barberIndex : 0) % 3);

    // Afternoon bookings
    if ((seed % 2) === 0) {
        bookedSlotIndices.add(20 + (barberIndex >= 0 ? barberIndex : 0));
        bookedSlotIndices.add(24 + (barberIndex >= 0 ? barberIndex : 0));
    }

    // Evening rush
    if (dayOfMonth % 2 === (barberIndex >= 0 ? barberIndex : 0) % 2) {
        bookedSlotIndices.add(32); // 17:00
        bookedSlotIndices.add(33); // 17:15
        bookedSlotIndices.add(36); // 18:00
    }

    return allSlots.filter((_, index) => !bookedSlotIndices.has(index));
}
