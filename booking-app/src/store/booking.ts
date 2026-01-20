import { create } from 'zustand';

export type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
    category: 'haircut' | 'addon' | 'special';
};

export type BookingState = {
    step: number;
    selectedService: Service | null;
    selectedAddons: Service[];
    selectedDate: Date | null;
    selectedTime: string | null; // "09:00"
    clientDetails: {
        name: string;
        phone: string;
        email?: string;
    };

    // Actions
    setStep: (step: number) => void;
    selectService: (service: Service) => void;
    toggleAddon: (addon: Service) => void;
    setDate: (date: Date) => void;
    setTime: (time: string) => void;
    setClientDetails: (details: Partial<BookingState['clientDetails']>) => void;
    reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
    step: 1,
    selectedService: null,
    selectedAddons: [],
    selectedDate: null,
    selectedTime: null,
    clientDetails: { name: '', phone: '' },

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
    setDate: (date) => set({ selectedDate: date }),
    setTime: (time) => set({ selectedTime: time }),
    setClientDetails: (details) => set((state) => ({
        clientDetails: { ...state.clientDetails, ...details }
    })),
    reset: () => set({
        step: 1,
        selectedService: null,
        selectedAddons: [],
        selectedDate: null,
        selectedTime: null,
        clientDetails: { name: '', phone: '' }
    })
}));
