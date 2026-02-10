// =====================================================
// SUPABASE QUERIES - Centralized Data Access Layer
// =====================================================

import { createClient } from './client';
import { hashPin } from '@/utils/auth';
import type {
    Service,
    Addon,
    Staff,
    StaffSchedule,
    Booking,
    BookingAddon,
    ShopSettings,
    CreateBookingData,
    AvailableSlot,
    BookingFilters,
    BookingWithDetails,
    DashboardStats,
    BarberPerformance,
    RecentTransaction,
    CreateStaffInput,
    UpdateStaffInput,
    UpdateScheduleInput,
    HeroSlide,
    StaffPayroll,
    Expense,
    ExpenseCategory,
    Customer,
    Review
} from '@/types/database';

// =====================================================
// REVIEWS
// =====================================================

export async function getApprovedReviews(limit = 3): Promise<Review[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('rating', { ascending: false }) // Show best first
        .limit(limit);
    return data || [];
}

export async function createReview(review: { booking_id: string; rating: number; comment: string; customer_name: string }) {
    const supabase = createClient();
    return await supabase.from('reviews').insert(review);
}

export async function getPendingReviews(): Promise<Review[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
    return data || [];
}

export async function approveReview(id: string) {
    const supabase = createClient();
    return await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
}

export async function deleteReview(id: string) {
    const supabase = createClient();
    return await supabase.from('reviews').delete().eq('id', id);
}

export async function getReviewByBooking(bookingId: string): Promise<Review | null> {
    const supabase = createClient();
    const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
    return data;
}

// =====================================================
// CUSTOMERS
// =====================================================

export async function getCustomers(): Promise<Customer[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('last_booking_date', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        return []; // Fail gracefully
    }

    return data || [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching customer:', error);
        return null;
    }

    return data;
}

export async function updateCustomerNotes(id: string, notes: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('customers')
        .update({ notes })
        .eq('id', id);

    if (error) {
        console.error('Error updating customer notes:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// =====================================================
// SERVICES
// =====================================================

export async function getServices(): Promise<Service[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching services:', error);
        throw new Error('Failed to fetch services');
    }

    return data || [];
}

export async function getServiceById(id: string): Promise<Service | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching service:', error);
        return null;
    }

    return data;
}

export async function createService(serviceData: Partial<Service>) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('services')
        .insert([{
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            duration_minutes: serviceData.duration_minutes,
            is_active: true, // Default to active
            image_url: null // Explicitly null for now as per requirement
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating service:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updateService(service: Partial<Service>) {
    const supabase = createClient();

    if (!service.id) return { success: false, error: "Service ID required" };

    const { data, error } = await supabase
        .from('services')
        .update({
            name: service.name,
            description: service.description,
            price: service.price,
            duration_minutes: service.duration_minutes,
            is_active: service.is_active
        })
        .eq('id', service.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating service:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// =====================================================
// ADD-ONS
// =====================================================

export async function getAddons(): Promise<Addon[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('addons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching addons:', error);
        throw new Error('Failed to fetch add-ons');
    }

    return data || [];
}

export async function getAddonsByIds(ids: string[]): Promise<Addon[]> {
    if (!ids || ids.length === 0) return [];

    const supabase = createClient();

    const { data, error } = await supabase
        .from('addons')
        .select('*')
        .in('id', ids);

    if (error) {
        console.error('Error fetching addons by IDs:', error);
        return [];
    }

    return data || [];
}

export async function createAddon(addonData: Partial<Addon>) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('addons')
        .insert([{
            name: addonData.name,
            description: addonData.description,
            price: addonData.price,
            duration_minutes: addonData.duration_minutes,
            is_active: true,
            display_order: 0 // Default order
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating addon:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updateAddon(addon: Partial<Addon>) {
    const supabase = createClient();

    if (!addon.id) return { success: false, error: "Addon ID required" };

    const { data, error } = await supabase
        .from('addons')
        .update({
            name: addon.name,
            description: addon.description,
            price: addon.price,
            duration_minutes: addon.duration_minutes,
            is_active: addon.is_active
        })
        .eq('id', addon.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating addon:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// =====================================================
// STAFF
// =====================================================

export async function getStaff(): Promise<Staff[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('staff')
        .select('*')
        // .eq('is_active', true) // Removed to allow booking 'Offline' staff (who are just on break)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching staff:', error);
        throw new Error('Failed to fetch staff');
    }

    return data || [];
}

/**
 * Get only ACTIVE (online) staff members.
 * Use this for customer-facing pages (booking flow) where offline staff should not appear.
 * For admin/login pages that need ALL staff, use getStaff() instead.
 */
export async function getActiveStaff(): Promise<Staff[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching active staff:', error);
        throw new Error('Failed to fetch active staff');
    }

    return data || [];
}

export async function getStaffById(id: string): Promise<Staff | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching staff member:', error);
        return null;
    }

    return data;
}

export async function getStaffSchedules(staffId: string): Promise<StaffSchedule[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staffId)
        .eq('is_available', true)
        .order('day_of_week', { ascending: true });

    if (error) {
        console.error('Error fetching staff schedules:', error);
        return [];
    }

    return data || [];
}

// =====================================================
// AVAILABLE TIME SLOTS
// =====================================================

export async function getAvailableSlots(
    staffId: string,
    date: string,
    durationMinutes: number = 30
): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc('get_available_slots', {
            p_staff_id: staffId,
            p_date: date,
            p_duration_minutes: durationMinutes,
        });

    if (error) {
        console.error('Error fetching available slots:', error);
        return [];
    }

    // The RPC returns array of objects with time_slot property
    return (data || []).map((slot: AvailableSlot) => slot.time_slot);
}

// =====================================================
// BOOKINGS
// =====================================================

export async function createBooking(bookingData: CreateBookingData): Promise<Booking | null> {
    const supabase = createClient();

    try {
        // Generate unique reference code
        const generateReference = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = 'REF-';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        // 1. Create the booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                reference: generateReference(),
                customer_name: bookingData.customer_name,
                customer_email: bookingData.customer_email,
                customer_phone: bookingData.customer_phone || null,
                prefer_email_only: bookingData.prefer_email_only || false,
                reminder_preference: bookingData.reminder_preference || 'email_sms',
                service_id: bookingData.service_id,
                staff_id: bookingData.staff_id,
                booking_date: bookingData.booking_date,
                booking_time: bookingData.booking_time,
                service_price: bookingData.service_price,
                addons_price: bookingData.addons_price,
                total_price: bookingData.total_price,
                payment_status: 'paid',
                payment_reference: bookingData.payment_reference,
                paystack_reference: bookingData.paystack_reference || null,
                paid_at: new Date().toISOString(),
                status: 'confirmed',
                customer_notes: bookingData.customer_notes || null,
            })
            .select()
            .single();

        if (bookingError) {
            console.error('Error creating booking:', bookingError);
            throw bookingError;
        }

        // 2. Create booking add-ons if any
        if (bookingData.addon_ids && bookingData.addon_ids.length > 0) {
            const addons = await getAddonsByIds(bookingData.addon_ids);

            const bookingAddons = addons.map(addon => ({
                booking_id: booking.id,
                addon_id: addon.id,
                addon_name: addon.name,
                addon_price: addon.price,
            }));

            const { error: addonsError } = await supabase
                .from('booking_addons')
                .insert(bookingAddons);

            if (addonsError) {
                console.error('Error creating booking add-ons:', addonsError);
                // Don't throw here - booking is already created
            }
        }

        return booking;
    } catch (error) {
        console.error('Error in createBooking:', error);
        return null;
    }
}

export async function getBookings(filters?: BookingFilters): Promise<BookingWithDetails[]> {
    const supabase = createClient();

    let query = supabase
        .from('bookings')
        .select(`
      *,
      service:services(*),
      staff:staff(*)
    `)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

    // Apply filters
    if (filters?.staff_id) {
        query = query.eq('staff_id', filters.staff_id);
    }
    if (filters?.customer_email) {
        query = query.eq('customer_email', filters.customer_email);
    }
    if (filters?.booking_date) {
        query = query.eq('booking_date', filters.booking_date);
    }
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
    }
    if (filters?.start_date) {
        query = query.gte('booking_date', filters.start_date);
    }
    if (filters?.end_date) {
        query = query.lte('booking_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }

    // Fetch add-ons for each booking
    const bookingsWithAddons = await Promise.all(
        (data || []).map(async (booking) => {
            const { data: bookingAddons } = await supabase
                .from('booking_addons')
                .select('addon_id, addon_name, addon_price')
                .eq('booking_id', booking.id);

            return {
                ...booking,
                addons: bookingAddons || [],
            };
        })
    );

    return bookingsWithAddons;
}

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
    const supabase = createClient();

    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
      *,
      service:services(*),
      staff:staff(*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching booking:', error);
        return null;
    }

    // Fetch add-ons
    const { data: bookingAddons } = await supabase
        .from('booking_addons')
        .select('addon_id, addon_name, addon_price')
        .eq('booking_id', booking.id);

    return {
        ...booking,
        addons: bookingAddons || [],
    };
}

// =====================================================
// SHOP SETTINGS
// =====================================================

export async function getShopSettings(): Promise<ShopSettings | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching shop settings:', error);
        return null;
    }

    return data;
}

export async function updateShopSettings(settings: Partial<ShopSettings>) {
    const supabase = createClient();

    if (!settings.id) {
        return { success: false, error: "Settings ID is required for update" };
    }

    const { data, error } = await supabase
        .from('shop_settings')
        .update({
            shop_name: settings.shop_name,
            shop_email: settings.shop_email,
            shop_phone: settings.shop_phone,
            shop_address: settings.shop_address,
            business_hours: settings.business_hours,
            booking_policies: settings.booking_policies,
            cancellation_hours: settings.cancellation_hours,
            slot_duration_minutes: settings.slot_duration_minutes,
            advance_booking_days: settings.advance_booking_days
        })
        .eq('id', settings.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating shop settings:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export async function calculateBookingDuration(
    serviceId: string,
    addonIds: string[]
): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc('calculate_booking_duration', {
            p_service_id: serviceId,
            p_addon_ids: addonIds,
        });

    if (error) {
        console.error('Error calculating booking duration:', error);
        return 30; // Default fallback
    }

    return data || 30;
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export async function getDashboardStats(): Promise<DashboardStats | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc('get_dashboard_stats');

    if (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }

    return data as DashboardStats;
}

export async function getBarberPerformance(): Promise<BarberPerformance[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc('get_barber_performance');

    if (error) {
        console.error('Error fetching barber performance:', error);
        return [];
    }

    return (data || []) as BarberPerformance[];
}

export async function getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc('get_recent_transactions', { limit_count: limit });

    if (error) {
        console.error('Error fetching recent transactions:', error);
        return [];
    }

    return (data || []) as RecentTransaction[];
}

// =====================================================
// ACCESS LOGGING (for privacy/audit trail)
// =====================================================

export async function logBookingAccess(
    bookingId: string,
    userId: string,
    role: 'admin' | 'staff',
    accessType: 'view' | 'edit' | 'delete' = 'view'
): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.rpc('log_booking_access', {
        p_booking_id: bookingId,
        p_user_id: userId,
        p_role: role,
        p_access_type: accessType,
    });

    if (error) {
        console.error('Error logging booking access:', error);
    }
}

// =====================================================
// STAFF MANAGEMENT MUTATIONS
// =====================================================

export async function createStaff(data: CreateStaffInput) {
    const supabase = createClient();

    const { data: result, error } = await supabase.rpc('create_staff', {
        p_name: data.name,
        p_email: data.email,
        p_phone: data.phone,
        p_pin: data.pin,
        p_bio: data.bio || null,
        p_specialties: data.specialties || [],
        p_payment_details: data.payment_details || null,
        p_avatar_url: data.avatar_url || null // Added
    });

    if (error) {
        console.error('Error creating staff:', error);
        return { success: false, error: error.message };
    }

    return result;
}

export async function updateStaff(data: UpdateStaffInput) {
    const supabase = createClient();

    const updateData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        bio: data.bio || null,
        specialties: data.specialties || [],
        payment_details: data.payment_details || null,
        avatar_url: data.avatar_url || null
    };

    if (data.pin) {
        updateData.pin_hash = await hashPin(data.pin);
    }

    const { data: result, error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating staff:', error);
        return { success: false, error: error.message };
    }

    return result;
}

export async function toggleStaffStatus(staffId: string, isActive: boolean) {
    const supabase = createClient();

    const { data: result, error } = await supabase.rpc('toggle_staff_status', {
        p_staff_id: staffId,
        p_is_active: isActive
    });

    if (error) {
        console.error('Error toggling staff status:', error);
        return { success: false, error: error.message };
    }

    return result;
}

export async function updateStaffSchedule(data: UpdateScheduleInput) {
    const supabase = createClient();

    const { data: result, error } = await supabase.rpc('update_staff_schedule', {
        p_staff_id: data.staff_id,
        p_schedules: data.schedules
    });

    if (error) {
        console.error('Error updating staff schedule:', error);
        return { success: false, error: error.message };
    }

    return result;
}

// =====================================================
// HERO SLIDES (Dynamic Carousel)
// =====================================================

export async function getHeroSlides(): Promise<HeroSlide[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching hero slides:', error);
        return [];
    }

    return data || [];
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching all hero slides:', error);
        return [];
    }

    return data || [];
}

export async function createHeroSlide(slideData: { image_url: string; title?: string; subtitle?: string }) {
    const supabase = createClient();

    // Get max order
    const { data: existingSlides } = await supabase
        .from('hero_slides')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

    const maxOrder = existingSlides?.[0]?.display_order ?? -1;

    const { data, error } = await supabase
        .from('hero_slides')
        .insert([{
            image_url: slideData.image_url,
            title: slideData.title || null,
            subtitle: slideData.subtitle || null,
            display_order: maxOrder + 1,
            is_active: true
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating hero slide:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updateHeroSlide(id: string, slideData: Partial<HeroSlide>) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('hero_slides')
        .update({
            title: slideData.title,
            subtitle: slideData.subtitle,
            display_order: slideData.display_order,
            is_active: slideData.is_active
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating hero slide:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function deleteHeroSlide(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting hero slide:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// =====================================================
// FINANCIAL MANAGEMENT
// =====================================================

// --- Transactions (from bookings) ---
export async function getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    staffId?: string;
}) {
    const supabase = createClient();

    let query = supabase
        .from('bookings')
        .select(`
            id,
            customer_name,
            customer_email,
            booking_date,
            booking_time,
            total_price,
            total_amount,
            payment_status,
            created_at,
            staff:staff_id (id, name)
        `)
        .order('created_at', { ascending: false });

    if (filters?.startDate) {
        query = query.gte('booking_date', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('booking_date', filters.endDate);
    }
    if (filters?.status && filters.status !== 'all') {
        query = query.eq('payment_status', filters.status);
    }
    if (filters?.staffId && filters.staffId !== 'all') {
        query = query.eq('staff_id', filters.staffId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    return data || [];
}

// --- Staff Payroll ---
export async function getPayrollRecords(filters?: {
    staffId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}): Promise<StaffPayroll[]> {
    const supabase = createClient();

    let query = supabase
        .from('staff_payroll')
        .select(`
            *,
            staff:staff_id (id, name, avatar_url)
        `)
        .order('pay_period_end', { ascending: false });

    if (filters?.staffId && filters.staffId !== 'all') {
        query = query.eq('staff_id', filters.staffId);
    }
    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
        query = query.gte('pay_period_start', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('pay_period_end', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching payroll:', error);
        return [];
    }

    return (data as StaffPayroll[]) || [];
}

export async function createPayrollRecord(record: {
    staff_id: string;
    pay_period_start: string;
    pay_period_end: string;
    base_salary: number;
    commission_earned?: number;
    bonus?: number;
    deductions?: number;
    notes?: string;
}) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('staff_payroll')
        .insert(record)
        .select()
        .single();

    if (error) {
        console.error('Error creating payroll:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updatePayrollRecord(id: string, updates: Partial<StaffPayroll>) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('staff_payroll')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating payroll:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function deletePayrollRecord(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('staff_payroll')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting payroll:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// --- Expenses ---
export async function getExpenses(filters?: {
    category?: ExpenseCategory | 'all';
    startDate?: string;
    endDate?: string;
}): Promise<Expense[]> {
    const supabase = createClient();

    let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
    }
    if (filters?.startDate) {
        query = query.gte('expense_date', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('expense_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }

    return (data as Expense[]) || [];
}

export async function createExpense(expense: {
    category: ExpenseCategory;
    amount: number;
    description?: string;
    expense_date: string;
    receipt_url?: string;
}) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();

    if (error) {
        console.error('Error creating expense:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating expense:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function deleteExpense(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting expense:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// --- Financial Summary ---
export async function getFinancialSummary(startDate: string, endDate: string) {
    const supabase = createClient();

    // Get revenue from bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price, payment_status')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .eq('payment_status', 'paid');

    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    // Get expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);

    const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    // Get payroll costs
    const { data: payroll } = await supabase
        .from('staff_payroll')
        .select('total_pay')
        .gte('pay_period_start', startDate)
        .lte('pay_period_end', endDate)
        .eq('status', 'paid');

    const totalPayroll = payroll?.reduce((sum, p) => sum + (p.total_pay || 0), 0) || 0;

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        payroll: totalPayroll,
        profit: totalRevenue - totalExpenses - totalPayroll,
        bookingCount: bookings?.length || 0,
    };
}

// =====================================================
// CALENDAR BOOKINGS
// =====================================================

export async function getBookingsForCalendar(startDate: string, endDate: string, staffId?: string) {
    const supabase = createClient();

    let query = supabase
        .from('bookings')
        .select(`
            id,
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            booking_time,
            total_price,
            status,
            payment_status,
            customer_notes,
            staff_notes,
            staff:staff_id (id, name, avatar_url),
            service:service_id (id, name, duration_minutes)
        `)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .neq('status', 'cancelled')
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

    if (staffId && staffId !== 'all') {
        query = query.eq('staff_id', staffId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching calendar bookings:', error);
        return [];
    }

    return data || [];
}

// =====================================================
// STAFF PIN AUTHENTICATION
// =====================================================

export async function setStaffPin(staffId: string, pin: string) {
    const supabase = createClient();
    const pinHash = await hashPin(pin);

    const { error } = await supabase
        .from('staff')
        .update({ pin_hash: pinHash })
        .eq('id', staffId);

    if (error) {
        console.error('Error setting PIN:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function clearStaffPin(staffId: string) {
    const supabase = createClient();

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

export async function getStaffBookings(staffId: string, startDate?: string, endDate?: string) {
    const supabase = createClient();

    let query = supabase
        .from('bookings')
        .select(`
            id,
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            start_time,
            end_time,
            total_price,
            status,
            payment_status,
            notes,
            services:booking_services (
                service:service_id (id, name, duration_minutes, price)
            )
        `)
        .eq('staff_id', staffId)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

    if (startDate) {
        query = query.gte('booking_date', startDate);
    }
    if (endDate) {
        query = query.lte('booking_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching staff bookings:', error);
        return [];
    }

    return data || [];
}

export async function getStaffEarnings(staffId: string, startDate: string, endDate: string) {
    const supabase = createClient();

    const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('staff_id', staffId)
        .eq('payment_status', 'paid')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate);

    const { data: staff } = await supabase
        .from('staff')
        .select('commission_percentage')
        .eq('id', staffId)
        .single();

    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    const commissionRate = staff?.commission_percentage || 0;
    const earnings = totalRevenue * (commissionRate / 100);

    return {
        totalRevenue,
        commissionRate,
        earnings,
        bookingCount: bookings?.length || 0,
    };
}



