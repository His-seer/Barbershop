"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/booking";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CreditCard, Lock, Smartphone, User, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import clsx from "clsx";

export function Step4Payment() {
    const router = useRouter();
    const { selectedService, selectedAddons, selectedDate, selectedTime, clientDetails, setClientDetails } = useBookingStore();
    const [isPaying, setIsPaying] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
    const [touched, setTouched] = useState<{ name: boolean; phone: boolean }>({ name: false, phone: false });

    // Calculations
    const serviceTotal = (selectedService?.price || 0) + selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    const bookingFee = 20;
    const finalTotal = serviceTotal + bookingFee;

    const validateName = (name: string) => {
        if (!name.trim()) return "Name is required";
        if (name.trim().length < 2) return "Name must be at least 2 characters";
        return undefined;
    };

    const validatePhone = (phone: string) => {
        if (!phone.trim()) return "Phone number is required";
        // Basic Ghana phone format validation
        const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return "Please enter a valid Ghana phone number";
        }
        return undefined;
    };

    const handleNameChange = (name: string) => {
        setClientDetails({ name });
        if (touched.name) {
            const error = validateName(name);
            setErrors(prev => ({ ...prev, name: error }));
        }
    };

    const handlePhoneChange = (phone: string) => {
        setClientDetails({ phone });
        if (touched.phone) {
            const error = validatePhone(phone);
            setErrors(prev => ({ ...prev, phone: error }));
        }
    };

    const handlePay = () => {
        // Validate all fields
        const nameError = validateName(clientDetails.name);
        const phoneError = validatePhone(clientDetails.phone);

        setErrors({ name: nameError, phone: phoneError });
        setTouched({ name: true, phone: true });

        if (nameError || phoneError) return;

        setIsPaying(true);
        // Simulate Paystack Payment Process
        setTimeout(() => {
            // In production, this would integrate with Paystack API
            // For now, we'll simulate successful payment and redirect
            router.push('/confirmation');
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="font-display text-3xl text-gold-500 mb-6">Confirm & Pay</h2>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Contact Form */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-gold-500" /> Your Details</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
                            <div>
                                <label htmlFor="fullName" className="block text-white/50 text-sm mb-1">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={clientDetails.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    onBlur={() => {
                                        setTouched(prev => ({ ...prev, name: true }));
                                        const error = validateName(clientDetails.name);
                                        setErrors(prev => ({ ...prev, name: error }));
                                    }}
                                    className={clsx(
                                        "w-full bg-richblack-900 border rounded p-3 text-white focus:ring-2 focus:ring-gold-500/20 outline-none transition-colors",
                                        errors.name && touched.name
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-white/10 focus:border-gold-500"
                                    )}
                                    placeholder="e.g. Kwame Mensah"
                                    required
                                    aria-required="true"
                                    aria-invalid={!!errors.name && touched.name}
                                    aria-describedby={errors.name && touched.name ? "name-error" : undefined}
                                />
                                {errors.name && touched.name && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex items-center gap-1 text-red-400 text-xs mt-1"
                                        id="name-error"
                                        role="alert"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.name}</span>
                                    </motion.div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-white/50 text-sm mb-1">Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        value={clientDetails.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        onBlur={() => {
                                            setTouched(prev => ({ ...prev, phone: true }));
                                            const error = validatePhone(clientDetails.phone);
                                            setErrors(prev => ({ ...prev, phone: error }));
                                        }}
                                        className={clsx(
                                            "w-full bg-richblack-900 border rounded p-3 pl-10 text-white focus:ring-2 focus:ring-gold-500/20 outline-none transition-colors",
                                            errors.phone && touched.phone
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-white/10 focus:border-gold-500"
                                        )}
                                        placeholder="+233 XX XXX XXXX"
                                        required
                                        aria-required="true"
                                        aria-invalid={!!errors.phone && touched.phone}
                                        aria-describedby={errors.phone && touched.phone ? "phone-error" : undefined}
                                    />
                                </div>
                                {errors.phone && touched.phone && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex items-center gap-1 text-red-400 text-xs mt-1"
                                        id="phone-error"
                                        role="alert"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.phone}</span>
                                    </motion.div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gold-900/10 border border-gold-500/20 rounded-lg text-sm text-gold-100/80">
                        <Lock className="w-5 h-5 text-gold-500 flex-shrink-0" />
                        <p>Your slot is held for <strong>5:00</strong> minutes. The <strong>20 GHS</strong> booking fee is non-refundable.</p>
                    </div>
                </div>

                {/* Receipt Card */}
                <div className="flex-1 lg:max-w-xs">
                    <div className="bg-white p-6 rounded-xl text-richblack-900 shadow-2xl relative overflow-hidden">
                        {/* Receipt Top Edge (Visual decoration) */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold-400 to-gold-600" />

                        <h3 className="font-display text-2xl font-bold mb-1">Receipt</h3>
                        <p className="text-richblack-900/50 text-xs uppercase tracking-widest mb-6">The Shop • Accra</p>

                        <div className="space-y-3 mb-6 border-b border-black/10 pb-6 border-dashed">
                            <div className="flex justify-between font-bold">
                                <span>{selectedService?.name}</span>
                                <span>{selectedService?.price.toFixed(2)}</span>
                            </div>
                            {selectedAddons.map(a => (
                                <div key={a.id} className="flex justify-between text-sm text-black/60">
                                    <span>+ {a.name}</span>
                                    <span>{a.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 mb-6 border-b border-black/10 pb-6 border-dashed text-sm">
                            <div className="flex justify-between">
                                <span className="text-black/60">Subtotal</span>
                                <span>{serviceTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black/60">Booking Fee</span>
                                <span>{bookingFee.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-display text-4xl font-bold text-gold-600">GHS {finalTotal.toFixed(0)}<span className="text-sm align-top text-black/40">.00</span></span>
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={!clientDetails.name || !clientDetails.phone || isPaying || (touched.name && !!errors.name) || (touched.phone && !!errors.phone)}
                            className="w-full bg-richblack-900 text-white py-4 font-bold rounded hover:bg-gold-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-white"
                            aria-label={`Pay ${finalTotal} GHS now with Paystack`}
                            aria-disabled={!clientDetails.name || !clientDetails.phone || isPaying}
                        >
                            {isPaying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Pay Now <CreditCard className="w-4 h-4 group-hover:text-black transition-colors" aria-hidden="true" />
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Appointment Summary (Small) */}
                    <div className="mt-6 text-center text-white/40 text-xs">
                        {selectedDate && <p>{format(selectedDate, 'MMMM do, yyyy')} at {selectedTime}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
