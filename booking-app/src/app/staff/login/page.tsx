'use client';

import { useActionState, useState, useEffect } from 'react';
import { loginStaff } from './actions';
import { Loader2, Delete, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStaff } from '@/utils/supabase/queries';
import type { Staff } from '@/types/database';

export default function StaffLoginPage() {
    const [state, formAction, isPending] = useActionState(loginStaff, null);
    const [pin, setPin] = useState('');
    const [staff, setStaff] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch staff members
    useEffect(() => {
        async function fetchStaff() {
            try {
                const staffData = await getStaff();
                setStaff(staffData);
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStaff();
    }, []);

    // Custom Keypad handling
    const handleKeypadClick = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleStaffSelect = (staffMember: Staff) => {
        setSelectedStaff(staffMember);
        setPin(''); // Reset PIN when changing staff
    };

    return (
        <div className="min-h-screen bg-richblack-900 text-white flex flex-col items-center justify-center p-4 font-outfit">

            <div className="w-full max-w-md flex flex-col items-center space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-playfair font-bold text-gold-400 tracking-wide">
                        STAFF PORTAL
                    </h1>
                    <p className="text-white/60 text-sm">Select your profile and enter your PIN.</p>
                </div>

                {/* Staff Selection */}
                {!selectedStaff ? (
                    <div className="w-full space-y-4">
                        <label className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">
                            Select Your Profile
                        </label>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {staff.map((staffMember) => (
                                    <button
                                        key={staffMember.id}
                                        type="button"
                                        onClick={() => handleStaffSelect(staffMember)}
                                        className="w-full bg-richblack-800 hover:bg-richblack-700 border border-white/10 hover:border-gold-500/50 rounded-xl p-4 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                                                {staffMember.avatar_url ? (
                                                    <img
                                                        src={staffMember.avatar_url}
                                                        alt={staffMember.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-6 h-6 text-gold-400" />
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 text-left">
                                                <div className="font-semibold text-white group-hover:text-gold-400 transition-colors">
                                                    {staffMember.name}
                                                </div>
                                                <div className="text-sm text-white/50">
                                                    {staffMember.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Selected Staff Display */}
                        <div className="w-full">
                            <div className="bg-richblack-800 border border-gold-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                                        {selectedStaff.avatar_url ? (
                                            <img
                                                src={selectedStaff.avatar_url}
                                                alt={selectedStaff.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-gold-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-white flex items-center gap-2">
                                            {selectedStaff.name}
                                            <Check className="w-4 h-4 text-gold-400" />
                                        </div>
                                        <div className="text-sm text-white/50">
                                            {selectedStaff.phone}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedStaff(null)}
                                        className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form action={formAction} className="w-full space-y-6">

                            {/* Hidden Phone Input */}
                            <input
                                type="hidden"
                                name="phone"
                                value={selectedStaff.phone || ''}
                            />

                            {/* PIN Display */}
                            <div className="space-y-2 flex flex-col items-center">
                                <label htmlFor="pin-display" className="text-xs uppercase tracking-widest text-gold-500 font-bold">
                                    Enter Your PIN
                                </label>
                                <div className="flex gap-4 my-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-gold-400 scale-110' : 'bg-white/10'
                                                }`}
                                        />
                                    ))}
                                </div>
                                {/* Hidden Input for Form Submission */}
                                <input type="hidden" name="pin" value={pin} />
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {state?.error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center"
                                    >
                                        {state.error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isPending || pin.length < 4}
                                className="w-full bg-gold-500 hover:bg-gold-400 text-richblack-900 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'LOGIN'}
                            </button>
                        </form>

                        {/* Custom Keypad UI */}
                        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleKeypadClick(num.toString())}
                                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl font-light transition-colors active:scale-95"
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="w-16 h-16"></div> {/* Spacer */}
                            <button
                                type="button"
                                onClick={() => handleKeypadClick('0')}
                                className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl font-light transition-colors active:scale-95"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-16 h-16 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors active:scale-95 active:text-white"
                            >
                                <Delete className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
