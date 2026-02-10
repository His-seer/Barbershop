// =====================================================
// DATABASE TYPES - Matching Supabase Schema
// =====================================================

export type ReminderPreference = 'email_only' | 'email_sms';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    image_url: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface Addon {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface Staff {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    pin_hash: string;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[] | null;
    is_active: boolean;
    payment_details: string | null; // Changed from paystack_subaccount_code
    commission_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface StaffSchedule {
    id: string;
    staff_id: string;
    day_of_week: number; // 0=Sunday, 6=Saturday
    start_time: string; // HH:MM format
    end_time: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    notes: string | null;
    total_bookings: number;
    last_booking_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    // Customer Information
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    prefer_email_only: boolean;
    reminder_preference: ReminderPreference;
    // Booking Details
    service_id: string;
    staff_id: string;
    booking_date: string; // YYYY-MM-DD
    booking_time: string; // HH:MM
    // Pricing
    service_price: number;
    addons_price: number;
    total_price: number;
    // Payment
    payment_status: PaymentStatus;
    payment_reference: string | null;
    paystack_reference: string | null;
    paid_at: string | null;
    // Status
    status: BookingStatus;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    // Notes
    customer_notes: string | null;
    staff_notes: string | null;
    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface BookingAddon {
    id: string;
    booking_id: string;
    addon_id: string;
    addon_name: string;
    addon_price: number;
    created_at: string;
}

export interface ShopSettings {
    id: string;
    shop_name: string;
    shop_email: string | null;
    shop_phone: string | null;
    shop_address: string | null;
    business_hours: Record<string, { open: string | null; close: string | null }>;
    booking_policies: string | null;
    cancellation_hours: number;
    slot_duration_minutes: number;
    advance_booking_days: number;
    banner_url: string | null; // Added
    created_at: string;
    updated_at: string;
}

export interface BookingAccessLog {
    id: string;
    booking_id: string;
    accessed_by_user_id: string | null;
    accessed_by_role: string;
    access_type: 'view' | 'edit' | 'delete';
    ip_address: string | null;
    user_agent: string | null;
    accessed_at: string;
}

export interface HeroSlide {
    id: string;
    image_url: string;
    title: string | null;
    subtitle: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export type PayrollStatus = 'draft' | 'approved' | 'paid';
export type ExpenseCategory = 'rent' | 'supplies' | 'utilities' | 'equipment' | 'marketing' | 'other';

export interface StaffPayroll {
    id: string;
    staff_id: string;
    pay_period_start: string;
    pay_period_end: string;
    base_salary: number;
    commission_earned: number;
    bonus: number;
    deductions: number;
    total_pay: number;
    status: PayrollStatus;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    staff?: Staff;
}

export interface Expense {
    id: string;
    category: ExpenseCategory;
    amount: number;
    description: string | null;
    expense_date: string;
    receipt_url: string | null;
    created_by: string | null;
    created_at: string;
}

export interface Review {
    id: string;
    booking_id: string;
    rating: number; // 1-5
    comment: string | null;
    customer_name: string;
    is_approved: boolean;
    created_at: string;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateBookingData {
    // Customer Info
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    prefer_email_only?: boolean;
    reminder_preference?: ReminderPreference;
    customer_birthday?: string; // MM-DD
    // Booking Details
    service_id: string;
    staff_id: string;
    booking_date: string;
    booking_time: string;
    // Pricing
    service_price: number;
    addons_price: number;
    total_price: number;
    // Add-ons
    addon_ids: string[];
    // Payment
    payment_reference: string;
    paystack_reference?: string;
    // Notes
    customer_notes?: string;
}

export interface AvailableSlot {
    time_slot: string; // HH:MM format
}

export interface BookingWithDetails extends Booking {
    service?: Service;
    staff?: Staff;
    addons?: Addon[];
}

export type BookingFilters = {
    staff_id?: string;
    customer_email?: string;
    booking_date?: string;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
    start_date?: string;
    end_date?: string;
};

// =====================================================
// MUTATION INPUT TYPES
// =====================================================

export interface CreateStaffInput {
    name: string;
    email: string;
    phone: string;
    pin: string; // Plain text, hashed by DB function
    bio?: string;
    specialties?: string[];
    avatar_url?: string; // Added
    payment_details?: string; // Changed from paystack_subaccount_code
}

export interface UpdateStaffInput {
    id: string;
    name: string;
    email: string;
    phone: string;
    bio?: string;
    specialties?: string[];
    avatar_url?: string; // Added
    payment_details?: string; // Changed from paystack_subaccount_code
    pin?: string; // Make PIN updatable
}

export interface UpdateScheduleInput {
    staff_id: string;
    schedules: {
        day: number;
        start: string;
        end: string;
        is_available: boolean;
    }[];
}

export interface DashboardStats {
    today: {
        revenue: number;
        count: number;
        previous_revenue: number;
        previous_count: number;
    };
    week: {
        revenue: number;
        count: number;
        previous_revenue: number;
    };
    month: {
        revenue: number;
        count: number;
        previous_revenue: number;
    };
    noshow: {
        count: number;
        total: number;
    };
}

export interface BarberPerformance {
    staff_id: string;
    staff_name: string;
    revenue: number;
    appointments: number;
    retention_rate: number;
}

export interface RecentTransaction {
    id: string;
    booking_date: string;
    booking_time: string;
    customer_name: string;
    total_price: number;
    payment_status: PaymentStatus;
    status: BookingStatus;
}
