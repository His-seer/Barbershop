'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Users,
    UserPlus,
    MoreVertical,
    Phone,
    Mail,
    Search,
    Filter,
    X,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Edit2,
    Shield,
    KeyRound,
    MessageSquare,
    Trash2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { getStaff, createStaff, updateStaff, toggleStaffStatus } from '@/utils/supabase/queries';
import { setStaffPinWithNotification, clearStaffPinAction } from './actions';
import type { Staff, CreateStaffInput, UpdateStaffInput } from '@/types/database';

export default function StaffPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // PIN Modal State
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinStaff, setPinStaff] = useState<Staff | null>(null);
    const [pinValue, setPinValue] = useState(['', '', '', '']);
    const [pinError, setPinError] = useState('');
    const [pinSuccess, setPinSuccess] = useState('');
    const [pinLoading, setPinLoading] = useState(false);
    const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<CreateStaffInput> & { schedule?: string[] }>({
        specialties: [],
        schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] // Default schedule
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        fetchStaff();
    }, []);

    async function fetchStaff() {
        setIsLoading(true);
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch (error) {
            console.error('Failed to load staff', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleToggleStatus(id: string, currentStatus: boolean) {
        // Optimistic update
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));

        try {
            await toggleStaffStatus(id, !currentStatus);
        } catch (error) {
            console.error('Failed to toggle status', error);
            // Revert on error
            setStaffList(prev => prev.map(s => s.id === id ? { ...s, is_active: currentStatus } : s));
        }
    }

    // Open Modal for Create or Edit
    const openModal = (staff: Staff | null = null) => {
        if (staff) {
            setEditingId(staff.id);
            setFormData({
                name: staff.name,
                email: staff.email || '',
                phone: staff.phone || '',
                pin: '', // Never show existing PIN hash, user must enter new one to change it
                payment_details: staff.payment_details || '',
                specialties: staff.specialties || [],
                avatar_url: staff.avatar_url || '',
                schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] // Mock schedule for now as we don't fetch it yet
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                pin: '',
                payment_details: '',
                specialties: [],
                avatar_url: '',
                schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            });
        }
        setIsModalOpen(true);
    };

    const toggleDay = (day: string) => {
        const currentSchedule = formData.schedule || [];
        if (currentSchedule.includes(day)) {
            setFormData({ ...formData, schedule: currentSchedule.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, schedule: [...currentSchedule, day] });
        }
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Basic validation
            if (!formData.name || !formData.email) {
                alert("Please fill in Name and Email");
                setIsSubmitting(false);
                return;
            }

            // If creating, PIN is required. If editing, it's optional (only if changing)
            if (!editingId && !formData.pin) {
                alert("PIN is required for new staff");
                setIsSubmitting(false);
                return;
            }

            if (editingId) {
                // UPDATE
                const payload: UpdateStaffInput = {
                    id: editingId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || '',
                    pin: formData.pin, // Only send if provided, backend should handle hashing if not empty
                    specialties: formData.specialties,
                    payment_details: formData.payment_details,
                    avatar_url: formData.avatar_url,
                };

                const result = await updateStaff(payload);

                if (result.success) {
                    setIsModalOpen(false);
                    fetchStaff();
                } else {
                    alert(`Error: ${result.error || 'Failed to update staff'}`);
                }

            } else {
                // CREATE
                const payload: CreateStaffInput = {
                    name: formData.name!,
                    email: formData.email!,
                    phone: formData.phone || '',
                    pin: formData.pin!,
                    bio: formData.bio || '',
                    specialties: formData.specialties || [],
                    payment_details: formData.payment_details || '',
                    avatar_url: formData.avatar_url
                };

                const result = await createStaff(payload);

                if (result.success) {
                    setIsModalOpen(false);
                    fetchStaff();
                } else {
                    alert(`Error: ${result.error || 'Failed to create staff'}`);
                }
            }
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Staff Management</h1>
                    <p className="text-white/40">Manage your team, schedules, and access.</p>
                </div>
                <button
                    onClick={() => openModal(null)}
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New Staff
                </button>
            </div>

            {/* Filters */}
            <div className="bg-richblack-800 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        className="w-full bg-richblack-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-gold-500/50 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors">
                    <Filter className="w-4 h-4 text-white/60" />
                    <span>Filter</span>
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((staff) => (
                    <div key={staff.id} className={`bg-richblack-800 border rounded-2xl overflow-hidden group hover:border-white/10 transition-all ${staff.is_active ? 'border-white/5' : 'border-red-500/20 opacity-75'}`}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-black font-bold text-xl ring-2 ring-gold-500/20 shadow-lg shadow-gold-500/10 overflow-hidden">
                                        {staff.avatar_url ? (
                                            <img src={staff.avatar_url} alt={staff.name} className="w-full h-full object-cover" />
                                        ) : (
                                            staff.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{staff.name}</h3>
                                        <p className="text-white/40 text-sm">Barber</p>
                                    </div>
                                </div>
                                <button className="text-white/20 hover:text-white transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-white/60">
                                    <Phone className="w-4 h-4 text-gold-500/50" />
                                    {staff.phone || 'No phone'}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/60">
                                    <Mail className="w-4 h-4 text-gold-500/50" />
                                    <span className='truncate'>{staff.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/60">
                                    <Shield className="w-4 h-4 text-gold-500/50" />
                                    <span>{staff.commission_percentage}% Commission</span>
                                </div>
                            </div>

                            {/* Schedule Pills (Mock Visual for now) */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {days.map(d => (
                                    <span key={d} className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d) ? 'bg-white/10 text-white' : 'bg-transparent text-white/10'}`}>
                                        {d.charAt(0)}
                                    </span>
                                ))}
                            </div>

                        </div>

                        <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/5">
                            <button
                                onClick={() => handleToggleStatus(staff.id, staff.is_active)}
                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${staff.is_active
                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                    }`}
                            >
                                {staff.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {staff.is_active ? 'Active' : 'Inactive'}
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setPinStaff(staff);
                                        setPinValue(['', '', '', '']);
                                        setPinError('');
                                        setPinModalOpen(true);
                                    }}
                                    className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${staff.pin_hash ? 'text-green-500 hover:text-green-400' : 'text-white/40 hover:text-white'}`}
                                    title={staff.pin_hash ? 'PIN Set - Click to change' : 'Set PIN'}
                                >
                                    <KeyRound className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openModal(staff)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors" title="Schedule">
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openModal(staff)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors" title="Edit Profile">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredStaff.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No staff members found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-richblack-800 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {editingId ? 'Edit Staff Member' : 'Add New Staff'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            <form id="staff-form" onSubmit={handleSave} className="space-y-4">
                                {/* Avatar Upload */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-32 h-32">
                                        <ImageUpload
                                            bucketName="staff-avatars"
                                            folderPath="profiles"
                                            currentImage={formData.avatar_url}
                                            onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                        placeholder="e.g. Kofi Boateng"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                        placeholder="staff@noir.com"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                            placeholder="055..."
                                            value={formData.phone || ''}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">
                                            {editingId ? 'New PIN (Optional)' : 'Access PIN'}
                                        </label>
                                        <input
                                            type="text"
                                            required={!editingId}
                                            maxLength={4}
                                            pattern="\d{4}"
                                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none font-mono tracking-widest text-center"
                                            placeholder={editingId ? "Leave blank to keep" : "1234"}
                                            value={formData.pin || ''}
                                            onChange={e => setFormData({ ...formData, pin: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Specialties (Comma separated)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                        placeholder="Fades, Beard Trim, Color"
                                        value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : formData.specialties}
                                        onChange={e => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Payment Details (MoMo/Bank Info)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 focus:outline-none"
                                        placeholder="Mobile Money Name & Number / Bank Details"
                                        value={formData.payment_details || ''}
                                        onChange={e => setFormData({ ...formData, payment_details: e.target.value })}
                                    />
                                    <p className="text-[10px] text-white/30 mt-1">For manual payout processing.</p>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Work Schedule</label>
                                    <div className="flex flex-wrap gap-2">
                                        {days.map(day => (
                                            <button
                                                type="button"
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${formData.schedule?.includes(day)
                                                    ? 'bg-gold-500 text-black border-gold-500'
                                                    : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
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
                                form="staff-form"
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-xl font-bold bg-gold-500 hover:bg-gold-400 text-black shadow-lg shadow-gold-500/20 transition-all flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? 'Save Changes' : 'Create Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Modal */}
            {pinModalOpen && pinStaff && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-richblack-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Set Staff PIN</h3>
                                <p className="text-white/40 text-sm">{pinStaff.name}</p>
                            </div>
                            <button
                                onClick={() => setPinModalOpen(false)}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-1 mb-2">
                            <KeyRound className="w-4 h-4 text-gold-500" />
                            <span className="text-white/60 text-sm">Enter 4-digit PIN</span>
                        </div>

                        <div className="flex justify-center gap-3 mb-4">
                            {pinValue.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { pinInputRefs.current[index] = el; }}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !/^\d$/.test(val)) return;
                                        const newPin = [...pinValue];
                                        newPin[index] = val;
                                        setPinValue(newPin);
                                        setPinError('');
                                        if (val && index < 3) {
                                            pinInputRefs.current[index + 1]?.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !pinValue[index] && index > 0) {
                                            pinInputRefs.current[index - 1]?.focus();
                                        }
                                    }}
                                    className="w-14 h-16 text-center text-2xl font-bold bg-richblack-900 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    disabled={pinLoading}
                                />
                            ))}
                        </div>

                        {pinError && (
                            <p className="text-red-500 text-sm text-center mb-4">{pinError}</p>
                        )}

                        <div className="flex gap-3">
                            {pinStaff.pin_hash && (
                                <button
                                    onClick={async () => {
                                        setPinLoading(true);
                                        setPinSuccess('');
                                        const result = await clearStaffPinAction(pinStaff.id);
                                        setPinLoading(false);
                                        if (result.success) {
                                            setPinModalOpen(false);
                                            fetchStaff();
                                        } else {
                                            setPinError('Failed to clear PIN');
                                        }
                                    }}
                                    disabled={pinLoading}
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                >
                                    Clear PIN
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    const pin = pinValue.join('');
                                    if (pin.length !== 4) {
                                        setPinError('Please enter all 4 digits');
                                        return;
                                    }
                                    setPinLoading(true);
                                    setPinSuccess('');
                                    setPinError('');
                                    const result = await setStaffPinWithNotification(
                                        pinStaff.id,
                                        pin,
                                        pinStaff.name,
                                        pinStaff.phone
                                    );
                                    setPinLoading(false);
                                    if (result.success) {
                                        if (result.smsSent) {
                                            setPinSuccess(`PIN set! SMS sent to ${pinStaff.phone}`);
                                        } else if (pinStaff.phone) {
                                            setPinSuccess('PIN set! SMS could not be sent - please inform staff manually.');
                                        } else {
                                            setPinSuccess('PIN set! No phone number - please inform staff manually.');
                                        }
                                        fetchStaff();
                                        setTimeout(() => setPinModalOpen(false), 2000);
                                    } else {
                                        setPinError('Failed to set PIN');
                                    }
                                }}
                                disabled={pinLoading || pinValue.join('').length !== 4}
                                className="flex-1 py-3 rounded-xl font-bold bg-gold-500 text-black hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {pinLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <MessageSquare className="w-4 h-4" />
                                Set & Notify
                            </button>
                        </div>

                        {pinSuccess && (
                            <p className="text-green-500 text-sm text-center mt-4 flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {pinSuccess}
                            </p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
