'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, X } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { useState } from 'react';
import { markStaffUnavailable } from '@/actions/time-off';

import { WalkInModal } from './WalkInModal';
import { Toast } from '@/components/ui/Toast';

export function DashboardHeader({ earnings = 0, target = 500 }: { earnings?: number, target?: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get date from query string or default to today
    const dateParam = searchParams.get('date');
    const currentDate = dateParam ? new Date(dateParam) : new Date();

    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
    const [emergencyReason, setEmergencyReason] = useState('sick'); // Default reason
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const changeDate = (days: number) => {
        const newDate = days > 0 ? addDays(currentDate, days) : subDays(currentDate, Math.abs(days));
        const formatted = format(newDate, 'yyyy-MM-dd');
        router.push(`${pathname}?date=${formatted}`);
    };

    const progressPercentage = Math.min((earnings / target) * 100, 100);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-8 border-b border-white/5 pb-8">
            <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => changeDate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center flex-1 sm:flex-none">
                        <h1 className="text-3xl font-display font-bold text-white">
                            {format(currentDate, 'MMMM do')}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {format(currentDate, 'EEEE, yyyy')}
                        </p>
                    </div>

                    <button onClick={() => changeDate(1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`${pathname}?date=${format(new Date(), 'yyyy-MM-dd')}`)}
                        className="text-xs bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full border border-gold-500/20 hover:bg-gold-500/20"
                    >
                        Jump to Today
                    </button>
                    <button
                        onClick={() => setIsWalkInModalOpen(true)}
                        className="text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 flex items-center gap-1 font-bold"
                    >
                        + Walk-In
                    </button>
                    <button
                        onClick={() => setIsEmergencyModalOpen(true)}
                        className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1"
                    >
                        <AlertTriangle className="w-3 h-3" /> Mark Unavailable
                    </button>
                </div>
            </div>

            <WalkInModal isOpen={isWalkInModalOpen} onClose={() => setIsWalkInModalOpen(false)} currentDate={currentDate} />

            <div className="text-right hidden sm:block w-64">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-xs uppercase tracking-widest text-gold-500">Daily Goal</p>
                    <p className="text-xs text-white/60">GHS {earnings} / {target}</p>
                </div>
                <div className="h-2 w-full bg-richblack-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/5" />
                    <div
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <p className="text-[10px] text-white/30 mt-1 text-right italic">
                    {progressPercentage >= 100 ? 'Goal reached! 🎉' : `${(target - earnings).toFixed(0)} more to reach target`}
                </p>
            </div>

            {/* Emergency Modal */}
            {isEmergencyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-richblack-800 border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsEmergencyModalOpen(false)}
                            className="absolute top-4 right-4 text-white/30 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/30">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-2">Mark Unavailable?</h3>
                        <p className="text-white/60 text-center mb-6 text-sm">
                            This will block your schedule for the rest of the day and notify any booked clients.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2 block">Reason</label>
                                <select
                                    className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    value={emergencyReason}
                                    onChange={(e) => setEmergencyReason(e.target.value)}
                                >
                                    <option value="sick">Feeling Unwell / Sick</option>
                                    <option value="family">Family Emergency</option>
                                    <option value="equipment">Equipment Failure</option>
                                    <option value="other">Other Personal Reason</option>
                                </select>
                            </div>

                            <button
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    const dateStr = format(currentDate, 'yyyy-MM-dd');
                                    const result = await markStaffUnavailable(dateStr, emergencyReason);
                                    setIsSubmitting(false);

                                    if (result.success) {
                                        const cancelledCount = result.cancelledCount || 0;
                                        setToast({
                                            message: `Schedule blocked for ${format(currentDate, 'MMMM do')}.
Reason: ${emergencyReason}
${cancelledCount > 0
                                                    ? `${cancelledCount} booking(s) cancelled.`
                                                    : 'No bookings affected.'}`,
                                            type: 'success'
                                        });
                                        setIsEmergencyModalOpen(false);
                                        router.refresh();
                                    } else {
                                        setToast({
                                            message: `Error: ${result.error || 'Failed to block schedule'}`,
                                            type: 'error'
                                        });
                                    }
                                }}
                                disabled={isSubmitting}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm & Block Schedule'}
                            </button>
                            <button
                                onClick={() => setIsEmergencyModalOpen(false)}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                    duration={5000}
                />
            )}
        </div>
    );
}
