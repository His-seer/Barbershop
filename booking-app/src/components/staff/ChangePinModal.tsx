'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { changeStaffPin } from '@/app/admin/dashboard/staff/actions';

interface ChangePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffId: string;
}

export function ChangePinModal({ isOpen, onClose, staffId }: ChangePinModalProps) {
    const [currentPin, setCurrentPin] = useState(['', '', '', '']);
    const [newPin, setNewPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const currentRefs = useRef<(HTMLInputElement | null)[]>([]);
    const newRefs = useRef<(HTMLInputElement | null)[]>([]);
    const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

    const stepAdvanceRef = useRef<(() => void) | null>(null);

    const handlePinChange = (
        index: number,
        value: string,
        pin: string[],
        setPin: (p: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete?: () => void
    ) => {
        if (value && !/^\d$/.test(value)) return;

        const newPinArray = [...pin];
        newPinArray[index] = value;
        setPin(newPinArray);
        setError('');

        if (value && index < 3) {
            refs.current[index + 1]?.focus();
        }

        if (value && index === 3 && onComplete) {
            setTimeout(onComplete, 100);
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent,
        pin: string[],
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        const currentPinStr = currentPin.join('');
        const newPinStr = newPin.join('');
        const confirmPinStr = confirmPin.join('');

        if (newPinStr !== confirmPinStr) {
            setError('New PINs do not match');
            setStep('new');
            setNewPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            newRefs.current[0]?.focus();
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await changeStaffPin(staffId, currentPinStr, newPinStr);

        setIsLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset state
                setCurrentPin(['', '', '', '']);
                setNewPin(['', '', '', '']);
                setConfirmPin(['', '', '', '']);
                setStep('current');
                setSuccess(false);
            }, 1500);
        } else {
            setError(result.error || 'Failed to change PIN');
            if (result.error?.includes('Current PIN')) {
                setStep('current');
                setCurrentPin(['', '', '', '']);
                currentRefs.current[0]?.focus();
            }
        }
    };

    const renderPinInput = (
        pin: string[],
        setPin: (p: string[]) => void,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        onComplete?: () => void
    ) => (
        <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { refs.current[index] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value, pin, setPin, refs, onComplete)}
                    onKeyDown={(e) => handleKeyDown(index, e, pin, refs)}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-xl font-bold bg-richblack-900 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
            ))}
        </div>
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-richblack-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center">
                                <KeyRound className="w-5 h-5 text-gold-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Change PIN</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <p className="text-green-500 font-bold">PIN Changed Successfully!</p>
                        </div>
                    ) : (
                        <>
                            {/* Step Indicator */}
                            <div className="flex justify-center gap-2 mb-6">
                                {['current', 'new', 'confirm'].map((s, i) => (
                                    <div
                                        key={s}
                                        className={`w-2 h-2 rounded-full transition-colors ${step === s ? 'bg-gold-500' :
                                                ['current', 'new', 'confirm'].indexOf(step) > i ? 'bg-gold-500/50' : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Current PIN */}
                            {step === 'current' && (
                                <div className="space-y-4">
                                    <p className="text-white/60 text-sm text-center">Enter your current PIN</p>
                                    {renderPinInput(currentPin, setCurrentPin, currentRefs, () => setStep('new'))}
                                </div>
                            )}

                            {/* New PIN */}
                            {step === 'new' && (
                                <div className="space-y-4">
                                    <p className="text-white/60 text-sm text-center">Enter your new PIN</p>
                                    {renderPinInput(newPin, setNewPin, newRefs, () => setStep('confirm'))}
                                </div>
                            )}

                            {/* Confirm PIN */}
                            {step === 'confirm' && (
                                <div className="space-y-4">
                                    <p className="text-white/60 text-sm text-center">Confirm your new PIN</p>
                                    {renderPinInput(confirmPin, setConfirmPin, confirmRefs)}
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center justify-center gap-2 text-red-500 text-sm mt-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Loading */}
                            {isLoading && (
                                <div className="flex items-center justify-center gap-2 text-gold-500 mt-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm">Changing PIN...</span>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex gap-3 mt-6">
                                {step !== 'current' && (
                                    <button
                                        onClick={() => {
                                            if (step === 'new') setStep('current');
                                            if (step === 'confirm') setStep('new');
                                        }}
                                        className="flex-1 py-3 rounded-xl font-bold border border-white/10 text-white/60 hover:bg-white/5"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (step === 'current' && currentPin.join('').length === 4) setStep('new');
                                        if (step === 'new' && newPin.join('').length === 4) setStep('confirm');
                                        if (step === 'confirm' && confirmPin.join('').length === 4) handleSubmit();
                                    }}
                                    disabled={isLoading || (
                                        step === 'current' ? currentPin.join('').length !== 4 :
                                            step === 'new' ? newPin.join('').length !== 4 :
                                                confirmPin.join('').length !== 4
                                    )}
                                    className="flex-1 py-3 rounded-xl font-bold bg-gold-500 text-black hover:bg-gold-400 disabled:opacity-50"
                                >
                                    {step === 'confirm' ? 'Change PIN' : 'Next'}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
