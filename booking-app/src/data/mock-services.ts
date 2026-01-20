import { Service } from "@/store/booking";

export const SERVICES: Service[] = [
    { id: '1', name: 'Standard Cut', price: 30, duration: 30, category: 'haircut' },
    { id: '2', name: 'The Royal Treatment', price: 80, duration: 60, category: 'haircut' },
    { id: '3', name: 'Kids Cut', price: 60, duration: 30, category: 'haircut' },
    { id: 'home', name: 'Home Service Premium', price: 500, duration: 90, category: 'special' },

    // Addons
    { id: 'a1', name: 'Beard Trim', price: 10, duration: 15, category: 'addon' },
    { id: 'a2', name: 'Beard Dye', price: 20, duration: 30, category: 'addon' },
    { id: 'a3', name: 'Texturizing', price: 40, duration: 45, category: 'addon' },
];
