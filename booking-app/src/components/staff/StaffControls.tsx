"use client";
import { useState } from 'react';
import { Coffee, Power, Clock, KeyRound, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChangePinModal } from './ChangePinModal';
import { toggleStaffStatusAction } from '@/actions/staff';
// Removed missing sonner import

interface StaffControlsProps {
    staffName: string;
    staffId: string;
    isActive: boolean; // Add this
}

export function StaffControls({ staffName, staffId, isActive }: StaffControlsProps) {
    // We map 'isActive' (db) to 'active'|'offline' (ui). 
    // 'break' is basically 'offline' with a different UI state locally.
    const [status, setStatus] = useState<'active' | 'break' | 'offline'>(isActive ? 'active' : 'offline');
    const [breakTime, setBreakTime] = useState<number | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleStatus = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const newExpectedStatus = status === 'active' ? 'offline' : 'active';
        const newIsActive = newExpectedStatus === 'active';

        // Optimistic update
        const oldStatus = status;
        setStatus(newExpectedStatus);
        if (newExpectedStatus === 'active') setBreakTime(null);

        const result = await toggleStaffStatusAction(staffId, newIsActive);

        if (!result.success) {
            // Revert on failure
            setStatus(oldStatus);
            alert('Failed to change status');
        }

        setIsLoading(false);
    };

    const handleTakeBreak = async () => {
        if (isLoading) return;

        // Break logic: Logically it's "Offline" to the backend, but "Break" to the UI.
        // If we are active, we go to break (offline).
        // If we search break, we go active.

        if (status === 'break') {
            // End break -> Go Online
            handleToggleStatus();
        } else {
            // Start break -> Is effectively going offline but with "Break" UI
            setIsLoading(true);
            const result = await toggleStaffStatusAction(staffId, false); // Go offline

            if (result.success) {
                setStatus('break');
                setBreakTime(Date.now());
            } else {
                alert('Failed to start break');
            }
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bg-richblack-800 border border-white/5 p-6 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
                {/* Status Indicator Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-colors duration-500 ${status === 'active' ? 'bg-green-500/20' :
                    status === 'break' ? 'bg-orange-500/20' : 'bg-red-500/10'
                    }`} />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-white font-bold text-lg">Hello, {staffName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'active' ? 'bg-green-500' :
                                    status === 'break' ? 'bg-orange-500' : 'bg-red-500'
                                    }`} />
                                <span className="text-sm text-white/60">
                                    Currently: <span className="text-white font-medium capitalize flex items-center gap-2">
                                        {status}
                                        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Main Toggle */}
                        <button
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                            className={`p-3 rounded-full transition-all ${status === 'offline'
                                ? 'bg-white/10 text-white/40 hover:bg-green-500/20 hover:text-green-400'
                                : 'bg-green-500/10 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                                }`}
                            title={status === 'offline' ? "Go Online" : "Go Offline"}
                        >
                            <Power className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={handleTakeBreak}
                            disabled={status === 'offline' || isLoading}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${status === 'break'
                                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                                }`}
                        >
                            <Coffee className="w-4 h-4" />
                            {status === 'break' ? 'End' : 'Break'}
                        </button>

                        <button
                            onClick={() => setIsPinModalOpen(true)}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-white/5 text-white/60 hover:bg-gold-500/10 hover:text-gold-500 transition-all"
                        >
                            <KeyRound className="w-4 h-4" />
                            PIN
                        </button>

                        <button
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
                            disabled={true}
                        >
                            <Clock className="w-4 h-4" />
                            Extend
                        </button>
                    </div>

                    {status === 'break' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-200 text-center"
                        >
                            You are unavailable for new bookings.
                        </motion.div>
                    )}
                </div>
            </div>

            <ChangePinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                staffId={staffId}
            />
        </>
    );
}

