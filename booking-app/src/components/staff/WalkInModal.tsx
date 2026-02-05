'use client';

import { useState } from 'react';
import { X, UserPlus, Calendar, Clock, Phone, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createAppointment } from '@/actions/booking';

interface WalkInModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate?: Date;
}

const POPULAR_SERVICES = [
    { name: 'Haircut', duration: 45, price: 50 },
    { name: 'Haircut + Beard', duration: 60, price: 70 },
    { name: 'Shape Up / Line Up', duration: 20, price: 30 },
    { name: 'Kids Cut', duration: 30, price: 40 },
    { name: 'Shave', duration: 30, price: 40 },
    { name: 'Dye / Color', duration: 60, price: 100 },
];

export function WalkInModal({ isOpen, onClose, currentDate = new Date() }: WalkInModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientBirthday, setClientBirthday] = useState('');
    const [selectedService, setSelectedService] = useState(POPULAR_SERVICES[0]);
    const [customService, setCustomService] = useState('');
    const [time, setTime] = useState(format(new Date(), 'HH:mm')); // Default to now

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);

        const serviceName = customService || selectedService.name;
        const finalClientName = clientName.trim() || 'Walk-In Client';
        const formattedDate = format(currentDate, 'yyyy-MM-dd');

        // Construct booking data
        const formData = {
            reference: `WALKIN-${Date.now()}`,
            clientName: finalClientName,
            clientEmail: `walkin-${Date.now()}@noir.internal`,
            clientPhone: clientPhone || 'N/A',
            date: formattedDate,
            time: time,
            barberId: 'current-staff-id',
            serviceName: serviceName,
            servicePrice: selectedService.price,
            duration: selectedService.duration,
            addons: [],
            totalAmount: selectedService.price,
            type: 'walk_in' as const,
            birthday: clientBirthday,
            status: 'confirmed' as const
        };

        try {
            await createAppointment(formData);
            setStep('success');
            // Auto close after 2 seconds
            setTimeout(() => {
                onClose();
                setStep('form');
                setClientName('');
                setClientPhone('');
            }, 2000);
        } catch (error) {
            alert('Failed to log walk-in. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-richblack-800 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-richblack-900/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-gold-500" />
                        Log Walk-In
                    </h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'success' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/30">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">Walk-In Logged!</h4>
                        <p className="text-white/60">Schedule updated.</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">

                        {/* Service Selection */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Service</label>
                            <div className="grid grid-cols-2 gap-2">
                                {POPULAR_SERVICES.slice(0, 4).map(s => (
                                    <button
                                        key={s.name}
                                        onClick={() => { setSelectedService(s); setCustomService(''); }}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left ${selectedService.name === s.name && !customService
                                            ? 'bg-gold-500 text-black border-gold-500'
                                            : 'bg-white/5 text-white/80 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                            {/* Other Service Input */}
                            <input
                                type="text"
                                placeholder="Or type custom service..."
                                className="w-full bg-richblack-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm mt-2"
                                value={customService}
                                onChange={(e) => setCustomService(e.target.value)}
                            />
                        </div>

                        {/* Client Details */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Client Details</label>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Client Name (e.g. Kwame)"
                                    className="w-full bg-richblack-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    autoFocus
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-white/20" />
                                        <input
                                            type="tel"
                                            placeholder="Phone (Optional)"
                                            className="w-full bg-richblack-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-white/20" />
                                        <input
                                            type="text"
                                            placeholder="Birthday (DD/MM)"
                                            className="w-full bg-richblack-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                                            value={clientBirthday}
                                            onChange={(e) => setClientBirthday(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time & Payment */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Timing</label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-white/20" />
                                    <input
                                        type="time"
                                        className="w-full bg-richblack-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                                <div className="px-4 py-3 bg-white/5 rounded-lg text-sm text-white/60">
                                    {selectedService.duration} min
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Footer */}
                {step === 'form' && (
                    <div className="p-4 border-t border-white/5 bg-richblack-900/50">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            {loading ? 'Confirming...' : 'Confirm Walk-In'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
