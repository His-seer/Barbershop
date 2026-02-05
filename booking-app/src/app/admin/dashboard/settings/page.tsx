'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    Clock,
    DollarSign,
    Loader2,
    Store,
    MapPin,
    Phone,
    Mail,
    FileText,
    AlertCircle
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { getShopSettings, updateShopSettings } from '@/utils/supabase/queries';
import type { ShopSettings } from '@/types/database';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'financials'>('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Data State
    const [settings, setSettings] = useState<ShopSettings | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setIsLoading(true);
        try {
            const data = await getShopSettings();
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        if (!settings) return;
        setIsSaving(true);
        try {
            const result = await updateShopSettings(settings);
            if (result.success) {
                // Optional: Show toast success
                alert('Settings saved successfully');
            } else {
                alert('Failed to save settings: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    }

    // Helper to update specific fields
    const updateField = (field: keyof ShopSettings, value: ShopSettings[keyof ShopSettings]) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const updateHour = (day: string, type: 'open' | 'close', value: string | null) => {
        if (!settings) return;
        const newHours: Record<string, { open: string | null; close: string | null }> = { ...settings.business_hours };
        if (!newHours[day]) newHours[day] = { open: null, close: null };

        newHours[day][type] = value;

        updateField('business_hours', newHours);
    };

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
    if (!settings) return <div className="p-8 text-center text-white/40">Failed to load settings.</div>;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Shop Settings</h1>
                    <p className="text-white/40">Configure your barbershop details and operations.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 overflow-x-auto">
                {[
                    { id: 'general', label: 'General Info', icon: Store },
                    { id: 'hours', label: 'Business Hours', icon: Clock },
                    { id: 'financials', label: 'Policies & Fees', icon: FileText },
                    // { id: 'services', label: 'Services', icon: Scissors }, // Moving services to dedicated page later or separate implementation
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'general' | 'hours' | 'financials')}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-gold-500 text-white'
                                : 'border-transparent text-white/40 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* --- TAB: GENERAL --- */}
            {activeTab === 'general' && (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="col-span-full">
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Shop Name</label>
                            <div className="relative">
                                <Store className="absolute left-4 top-3.5 w-5 h-5 text-gold-500/50" />
                                <input
                                    type="text"
                                    value={settings.shop_name}
                                    onChange={(e) => updateField('shop_name', e.target.value)}
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/20" />
                                <input
                                    type="email"
                                    value={settings.shop_email || ''}
                                    onChange={(e) => updateField('shop_email', e.target.value)}
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                                    placeholder="contact@barbershop.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-white/20" />
                                <input
                                    type="tel"
                                    value={settings.shop_phone || ''}
                                    onChange={(e) => updateField('shop_phone', e.target.value)}
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                                    placeholder="+233..."
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Physical Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-white/20" />
                                <textarea
                                    value={settings.shop_address || ''}
                                    onChange={(e) => updateField('shop_address', e.target.value)}
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-500 focus:outline-none min-h-[100px]"
                                    placeholder="123 Barber Street, Accra"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: HOURS --- */}
            {activeTab === 'hours' && (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-white/5 grid grid-cols-3 gap-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center">
                        <div className="text-left pl-4">Day</div>
                        <div>Open</div>
                        <div>Close</div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {days.map((day) => {
                            const key = day.toLowerCase();
                            const hours: Record<string, { open: string | null; close: string | null }> = settings.business_hours;
                            const schedule = hours[key] || { open: null, close: null };
                            const isOpen = !!schedule.open;

                            return (
                                <div key={day} className="p-4 grid grid-cols-3 gap-4 items-center hover:bg-white/[0.02]">
                                    <div className="font-bold text-white pl-4 flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isOpen}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    updateHour(key, 'open', '09:00');
                                                    updateHour(key, 'close', '18:00');
                                                } else {
                                                    updateHour(key, 'open', null);
                                                    updateHour(key, 'close', null);
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-gold-500 focus:ring-offset-richblack-900 focus:ring-gold-500"
                                        />
                                        <span className={!isOpen ? 'opacity-50' : ''}>{day}</span>
                                    </div>
                                    <div className="text-center">
                                        <input
                                            type="time"
                                            value={schedule.open || ''}
                                            disabled={!isOpen}
                                            onChange={(e) => updateHour(key, 'open', e.target.value)}
                                            className="bg-richblack-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-20 text-center w-full max-w-[120px]"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <input
                                            type="time"
                                            value={schedule.close || ''}
                                            disabled={!isOpen}
                                            onChange={(e) => updateHour(key, 'close', e.target.value)}
                                            className="bg-richblack-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-20 text-center w-full max-w-[120px]"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- TAB: FINANCIALS (POLICIES) --- */}
            {activeTab === 'financials' && (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">

                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gold-500" />
                            Booking Constraints
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Slot Duration (Minutes)</label>
                                <input
                                    type="number"
                                    value={settings.slot_duration_minutes}
                                    onChange={(e) => updateField('slot_duration_minutes', parseInt(e.target.value))}
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Cancellation Window (Hours)</label>
                                <input
                                    type="number"
                                    value={settings.cancellation_hours}
                                    onChange={(e) => updateField('cancellation_hours', parseInt(e.target.value))}
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Booking Policy Text</label>
                        <textarea
                            value={settings.booking_policies || ''}
                            onChange={(e) => updateField('booking_policies', e.target.value)}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none min-h-[150px]"
                            placeholder="Terms and conditions displayed to customers..."
                        />
                        <p className="text-xs text-white/20 mt-2">Displaying policies helps manage customer expectations regarding cancellations and lateness.</p>
                    </div>

                    {/* Placeholder for Financials if we add them later */}
                    <div className="pt-6 border-t border-white/5 opacity-50">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Fees & Taxes (Coming Soon)
                        </h3>
                        <p className="text-sm text-white/40">Configuration for booking fees and tax rates will be available in the next update.</p>
                    </div>

                </div>
            )}

        </div>
    );
}

function LoadingSpinner() {
    return <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />;
}
