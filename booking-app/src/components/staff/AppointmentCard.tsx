'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addMinutes, isPast, differenceInMinutes, parse } from 'date-fns';
import { Calendar, CheckCircle, Clock, MapPin, MessageSquare, MoreVertical, Phone, User, XCircle, AlertTriangle, Home, ExternalLink, Star } from 'lucide-react';
import { updateAppointmentStatus, addAppointmentNote } from '@/actions/booking';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending';

interface AppointmentCardProps {
    appointment: {
        id: string;
        appointment_date: string; // YYYY-MM-DD
        appointment_time: string;
        duration?: number | null;
        status: AppointmentStatus;
        client_name: string;
        client_phone?: string | null;
        client_notes?: string | null;
        service_name?: string | null;
        is_first_visit?: boolean | null;
        is_regular?: boolean | null;
        addons?: string[] | null;
        type?: 'home' | 'shop' | null;
        home_address?: string | null;
    };
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [note, setNote] = useState(appointment.client_notes || '');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Calculate times
    // appointment_time can be "HH:mm" or "HH:mm:ss" - handle both
    let startTimeDate: Date;
    let endTimeStr = '';
    let isLate = false;
    let minutesLate = 0;
    const duration = appointment.duration || 45; // Default 45 min if missing

    try {
        // Use the actual booking date, not today's date
        const bookingDate = appointment.appointment_date;

        // Strip seconds if present (convert "09:00:00" to "09:00")
        const timeStr = appointment.appointment_time.substring(0, 5);

        startTimeDate = parse(`${bookingDate} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());

        // Check if the parsed date is valid
        if (isNaN(startTimeDate.getTime())) {
            throw new Error('Invalid date');
        }

        const endTimeDate = addMinutes(startTimeDate, duration);
        endTimeStr = format(endTimeDate, 'HH:mm');

        // Lateness Logic
        const now = new Date();
        // Only check lateness if status is 'confirmed' (not completed/cancelled) and it's today
        isLate = appointment.status === 'confirmed' &&
            isPast(startTimeDate) &&
            differenceInMinutes(now, startTimeDate) > 5;

        minutesLate = differenceInMinutes(now, startTimeDate);
    } catch (error) {
        console.error('Error parsing appointment time:', appointment.appointment_time, error);
        // Fallback: use current time to avoid crashes
        startTimeDate = new Date();
        endTimeStr = 'N/A';
    }

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'success' | 'info';
        action: () => Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        action: async () => { },
    });

    const handleStatusUpdateCallback = async (status: 'completed' | 'no_show' | 'cancelled') => {
        setLoading(true);
        await updateAppointmentStatus(appointment.id, status);
        setLoading(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setShowMenu(false);
    };

    const handleSaveNote = async () => {
        setLoading(true);
        await addAppointmentNote(appointment.id, note);
        setIsEditingNote(false);
        setLoading(false);
    };

    const confirmStatusUpdate = (status: 'completed' | 'no_show' | 'cancelled') => {
        const config = {
            completed: {
                title: 'Complete Appointment?',
                message: 'This will mark the booking as completed and close it.',
                type: 'success' as const
            },
            no_show: {
                title: 'Mark No-Show?',
                message: 'This will mark the client as a no-show. This action cannot be undone.',
                type: 'warning' as const
            },
            cancelled: {
                title: 'Cancel Booking?',
                message: 'Are you sure you want to cancel this booking? The client will be notified.',
                type: 'danger' as const
            }
        };

        const { title, message, type } = config[status];

        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            action: async () => await handleStatusUpdateCallback(status)
        });
    };

    const statusColors: Record<AppointmentStatus, string> = {
        confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        completed: 'bg-green-500/10 text-green-400 border-green-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
        no_show: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    const isDone = appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no_show';

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <>
            <div className={`bg-richblack-800 border border-white/5 rounded-xl transition-all ${isExpanded ? 'ring-1 ring-gold-500/50' : ''}`}>
                {/* Main Row */}
                <div className="flex items-center justify-between relative">

                    {/* Clickable Content Area - Wraps everything EXCEPT the menu */}
                    <div
                        className="flex-1 p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-4">
                            {/* Time Column */}
                            <div className="flex flex-col items-center justify-center w-[70px] h-[70px] bg-richblack-900 rounded-lg border border-white/10 shrink-0">
                                <span className="text-lg font-bold text-white leading-none mb-1">{appointment.appointment_time?.substring(0, 5) || '??:??'}</span>
                                <span className="text-[10px] text-white/40 font-mono">{endTimeStr}</span>
                            </div>

                            {/* Info Column */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white text-lg">{appointment.client_name}</h3>
                                    {appointment.is_first_visit && (
                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold whitespace-nowrap flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-emerald-300 text-emerald-300" /> First Visit
                                        </span>
                                    )}
                                    {appointment.is_regular && (
                                        <span className="text-[10px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30 font-bold whitespace-nowrap">
                                            ⭐ Regular
                                        </span>
                                    )}
                                </div>
                                <p className="text-gold-500 text-sm">{appointment.service_name} <span className="text-white/30 text-xs">• {duration} min</span></p>

                                {/* Lateness Warning */}
                                {isLate && (
                                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse ${minutesLate > 30 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        <Clock className="w-3 h-3" />
                                        {minutesLate > 30 ? `Late: ${minutesLate}m (Mark No-Show?)` : `running late (${minutesLate}m)`}
                                    </div>
                                )}
                            </div>
                        </div>

                        <span className={`hidden sm:inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${statusColors[appointment.status] || statusColors.confirmed} mr-4`}>
                            {appointment.status.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Menu Button Area - Completely separate from clickable content */}
                    <div className="pr-4 pl-2 relative z-10" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-2 hover:bg-white/10 rounded-full text-white/40"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div
                                className="absolute right-0 top-10 w-48 bg-richblack-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <a
                                    href={`tel:${appointment.client_phone}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-white/80 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Phone className="w-4 h-4 text-gold-500" /> Call Client
                                </a>
                                <a
                                    href={`sms:${appointment.client_phone}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-white/80 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MessageSquare className="w-4 h-4 text-blue-500" /> Send SMS
                                </a>
                                {!isDone && (
                                    <>
                                        <div className="h-px bg-white/10 mx-2" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); confirmStatusUpdate('no_show'); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 transition-colors text-left"
                                        >
                                            <XCircle className="w-4 h-4" /> Mark No-Show
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); confirmStatusUpdate('cancelled'); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-white/60 hover:text-white transition-colors text-left"
                                        >
                                            <XCircle className="w-4 h-4" /> Cancel Booking
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="px-4 pb-4 pt-0 space-y-4 border-t border-white/5 mt-2 shadow-inner">

                        {/* Home Service Badge */}
                        {appointment.type === 'home' && (
                            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg flex items-start gap-3 mt-4">
                                <Home className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Home Service Appointment</p>
                                    <p className="text-white text-sm mb-2">{appointment.home_address || 'No address provided'}</p>
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(appointment.home_address || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MapPin className="w-3 h-3" /> Open in Maps <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gold-500" />
                                <a href={`tel:${appointment.client_phone}`} className="hover:text-white transition-colors underline decoration-white/20">{appointment.client_phone}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gold-500" />
                                <span>{appointment.addons && appointment.addons.length > 0 ? `+ ${appointment.addons.join(', ')}` : 'No Add-ons'}</span>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-richblack-900/50 p-3 rounded-lg border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Client Notes
                                </h4>
                                {!isEditingNote && (
                                    <button onClick={() => setIsEditingNote(true)} className="text-xs text-gold-500 hover:underline">Edit</button>
                                )}
                            </div>

                            {isEditingNote ? (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full bg-richblack-800 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-gold-500"
                                        rows={3}
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add preferences, fade type, etc..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsEditingNote(false)} className="text-xs text-white/40 hover:text-white px-2 py-1">Cancel</button>
                                        <button onClick={handleSaveNote} disabled={loading} className="text-xs bg-gold-500 text-black font-bold px-3 py-1 rounded hover:opacity-90">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-white/80 italic">{note || 'No notes yet.'}</p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        {!isDone && (
                            <div className="pt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); confirmStatusUpdate('completed'); }}
                                    disabled={loading}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                                >
                                    <CheckCircle className="w-5 h-5" /> Mark as Completed
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div >

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                isLoading={loading}
                type={confirmModal.type}
            />
        </>
    );
}
