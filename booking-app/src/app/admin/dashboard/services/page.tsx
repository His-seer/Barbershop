'use client';

import { useState, useEffect } from 'react';
import {
    Scissors,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Clock,
    DollarSign,
    Edit2,
    Trash2, // Keeping for future hard delete
    CheckCircle,
    XCircle,
    X,
    Loader2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getServices, createService, updateService, getAddons, createAddon, updateAddon } from '@/utils/supabase/queries';
import type { Service, Addon } from '@/types/database';

export default function ServicesPage() {
    const [activeTab, setActiveTab] = useState<'services' | 'addons'>('services');
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<Service[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State (Shared for Service and Addon)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Service | Addon>>({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 30,
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [servicesData, addonsData] = await Promise.all([
                getServices(),
                getAddons()
            ]);
            setServices(servicesData);
            setAddons(addonsData);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    }

    const openModal = (item: Service | Addon | null = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                name: item.name,
                description: item.description || '',
                price: item.price,
                duration_minutes: item.duration_minutes,
                is_active: item.is_active
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                description: '',
                price: 0,
                duration_minutes: activeTab === 'services' ? 30 : 15,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.name || formData.price === undefined || !formData.duration_minutes) {
                alert("Please fill in all required fields");
                setIsSubmitting(false);
                return;
            }

            let result;
            if (activeTab === 'services') {
                if (editingId) {
                    result = await updateService({ id: editingId, ...formData } as Service);
                } else {
                    result = await createService(formData as Service);
                }
            } else {
                if (editingId) {
                    result = await updateAddon({ id: editingId, ...formData } as Addon);
                } else {
                    result = await createAddon(formData as Addon);
                }
            }

            if (result.success) {
                setIsModalOpen(false);
                fetchData();
            } else {
                alert(`Failed to save ${activeTab === 'services' ? 'service' : 'add-on'}: ` + result.error);
            }

        } catch (error) {
            console.error('Error saving:', error);
            alert('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleToggleStatus(item: Service | Addon) {
        // Optimistic update
        if (activeTab === 'services') {
            setServices(prev => prev.map(s => s.id === item.id ? { ...s, is_active: !s.is_active } : s));
            const result = await updateService({ id: item.id, is_active: !item.is_active });
            if (!result.success) fetchData(); // Revert on failure
        } else {
            setAddons(prev => prev.map(a => a.id === item.id ? { ...a, is_active: !a.is_active } : a));
            const result = await updateAddon({ id: item.id, is_active: !item.is_active });
            if (!result.success) fetchData(); // Revert on failure
        }
    }

    const filteredItems = (activeTab === 'services' ? services : addons).filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Service Menu</h1>
                    <p className="text-white/40">Manage your services and add-ons.</p>
                </div>
                <button
                    onClick={() => openModal(null)}
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add {activeTab === 'services' ? 'Service' : 'Add-on'}
                </button>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex p-1 bg-richblack-800 rounded-xl border border-white/5 w-fit">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                    >
                        Services
                    </button>
                    <button
                        onClick={() => setActiveTab('addons')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'addons' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                    >
                        Add-ons
                    </button>
                </div>

                <div className="bg-richblack-800 border border-white/5 p-2 rounded-xl flex items-center gap-4 flex-1">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/20" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-white focus:outline-none placeholder:text-white/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length > 0 ? filteredItems.map((item) => (
                    <div key={item.id} className={`bg-richblack-800 border rounded-2xl overflow-hidden group hover:border-white/10 transition-all ${item.is_active ? 'border-white/5' : 'border-red-500/20 opacity-75'}`}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/5 rounded-xl text-gold-500">
                                    {activeTab === 'services' ? <Scissors className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(item)}
                                        className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' : 'text-red-500 bg-red-500/10 hover:bg-red-500/20'}`}
                                        title={item.is_active ? "Deactivate" : "Activate"}
                                    >
                                        {item.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-white text-xl mb-2">{item.name}</h3>
                            <p className="text-white/40 text-sm line-clamp-2 mb-6 h-10">{item.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-white/80 font-mono">
                                    <Clock className="w-4 h-4 text-gold-500" />
                                    <span>{item.duration_minutes} min</span>
                                </div>
                                <div className="flex items-center gap-1 text-white font-bold text-lg">
                                    <span className="text-gold-500">₵</span>
                                    <span>{item.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 px-6 py-3 flex items-center justify-end border-t border-white/5">
                            <button
                                onClick={() => openModal(item)}
                                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            >
                                <Edit2 className="w-3 h-3" />
                                Edit Details
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center text-white/40">
                        No {activeTab} found. Click &quot;Add {activeTab === 'services' ? 'Service' : 'Add-on'}&quot; to create one.
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-richblack-800 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editingId ? `Edit ${activeTab === 'services' ? 'Service' : 'Add-on'}` : `Add New ${activeTab === 'services' ? 'Service' : 'Add-on'}`}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            <form id="item-form" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                        placeholder={activeTab === 'services' ? "e.g. Premium Haircut" : "e.g. Hot Towel"}
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Price (GHS)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-white/40">₵</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                className="w-full bg-richblack-900 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Duration (Min)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-3.5 w-4 h-4 text-white/20" />
                                            <input
                                                type="number"
                                                required
                                                min="5"
                                                step="5"
                                                className="w-full bg-richblack-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                                placeholder="30"
                                                value={formData.duration_minutes}
                                                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Description</label>
                                    <textarea
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none min-h-[100px]"
                                        placeholder="Describe what's included..."
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-richblack-900/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="item-form"
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-xl font-bold bg-gold-500 hover:bg-gold-400 text-black shadow-lg shadow-gold-500/20 transition-all flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? 'Save Changes' : 'Create Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
