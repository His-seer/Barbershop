import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Service, Addon, Staff, ReminderPreference } from '@/types/database';

export type BookingState = {
    step: number;
    selectedService: Service | null;
    selectedAddons: Addon[];
    selectedStaff: Staff | null;
    selectedDate: Date | null;
    selectedTime: string | null; // "09:00"
    clientDetails: {
        name: string;
        email: string;
        phone?: string;
        preferEmailOnly?: boolean;
        reminderPreference?: ReminderPreference;
    };
    customerNotes: string;
    policiesAccepted: boolean;

    // Actions
    setStep: (step: number) => void;
    selectService: (service: Service) => void;
    toggleAddon: (addon: Addon) => void;
    selectStaff: (staff: Staff) => void;
    setDate: (date: Date) => void;
    setTime: (time: string | null) => void;
    setClientDetails: (details: Partial<BookingState['clientDetails']>) => void;
    setCustomerNotes: (notes: string) => void;
    setPoliciesAccepted: (accepted: boolean) => void;
    reset: () => void;
};

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            step: 1,
            selectedService: null,
            selectedAddons: [],
            selectedStaff: null,
            selectedDate: null,
            selectedTime: null,
            clientDetails: {
                name: '',
                email: '',
                phone: '',
                preferEmailOnly: false,
                reminderPreference: 'email_sms'
            },
            customerNotes: '',
            policiesAccepted: false,

            setStep: (step) => set({ step }),
            selectService: (service) => set({ selectedService: service }),
            toggleAddon: (addon) => set((state) => {
                const exists = state.selectedAddons.find(a => a.id === addon.id);
                return {
                    selectedAddons: exists
                        ? state.selectedAddons.filter(a => a.id !== addon.id)
                        : [...state.selectedAddons, addon]
                };
            }),
            selectStaff: (staff) => set({ selectedStaff: staff, selectedTime: null }),
            setDate: (date) => set({ selectedDate: date }),
            setTime: (time) => set({ selectedTime: time }),
            setClientDetails: (details) => set((state) => ({
                clientDetails: { ...state.clientDetails, ...details }
            })),
            setCustomerNotes: (notes) => set({ customerNotes: notes }),
            setPoliciesAccepted: (accepted) => set({ policiesAccepted: accepted }),
            reset: () => set({
                step: 1,
                selectedService: null,
                selectedAddons: [],
                selectedStaff: null,
                selectedDate: null,
                selectedTime: null,
                clientDetails: {
                    name: '',
                    email: '',
                    phone: '',
                    preferEmailOnly: false,
                    reminderPreference: 'email_sms'
                },
                customerNotes: '',
                policiesAccepted: false
            })
        }),
        {
            name: 'noir-booking-storage', // key in localStorage
            storage: createJSONStorage(() => localStorage), // use localStorage
            partialize: (state) => ({
                // Persist everything EXCEPT step and Date (which can't be JSON serialized)
                // Users should always start at step 1 for a fresh booking
                selectedService: state.selectedService,
                selectedAddons: state.selectedAddons,
                selectedStaff: state.selectedStaff,
                // Don't persist selectedDate - it's a Date object and can't be JSON serialized
                selectedTime: state.selectedTime,
                clientDetails: state.clientDetails,
                customerNotes: state.customerNotes,
                policiesAccepted: state.policiesAccepted,
            }),
        }
    )
);
