"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/booking";
import { motion } from "framer-motion";
import { format } from "date-fns";
import clsx from "clsx";
import { CreditCard, Lock, Smartphone, User, AlertCircle, Mail, MessageSquare, Gift } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BookingPolicies } from "@/components/booking/BookingPolicies";
import { initializePayment } from '@/utils/paystack';

export function Step4Payment() {
    const router = useRouter();
    const { selectedService, selectedAddons, selectedStaff, selectedDate, selectedTime, clientDetails, setClientDetails, customerNotes, setCustomerNotes, policiesAccepted, setPoliciesAccepted } = useBookingStore();
    const [isPaying, setIsPaying] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
    const [touched, setTouched] = useState<{ name: boolean; phone: boolean; email: boolean }>({ name: false, phone: false, email: false });

    // Calculations
    const serviceTotal = (selectedService?.price || 0) + selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    const bookingFee = 20;
    const finalTotal = serviceTotal + bookingFee;

    const validateName = (name: string) => {
        if (!name.trim()) return "Name is required";
        if (name.trim().length < 2) return "Name must be at least 2 characters";
        return undefined;
    };

    const validatePhone = (phone?: string) => {
        // Phone is optional - only validate if provided
        if (!phone || !phone.trim()) return undefined;
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

    const validateEmail = (email: string) => {
        if (!email?.trim()) return "Email is required for receipt";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Please enter a valid email";
        return undefined;
    };

    const handleEmailChange = (email: string) => {
        setClientDetails({ email });
        if (touched.email) {
            const error = validateEmail(email);
            setErrors(prev => ({ ...prev, email: error }));
        }
    };

    const handlePhoneChange = (phone: string) => {
        setClientDetails({ phone });
        if (touched.phone) {
            const error = validatePhone(phone);
            setErrors(prev => ({ ...prev, phone: error }));
        }
    };

    const handlePay = async () => {
        // Validate required fields (name and email)
        const nameError = validateName(clientDetails.name);
        const phoneError = validatePhone(clientDetails.phone);
        const emailError = validateEmail(clientDetails.email);

        setErrors({ name: nameError, phone: phoneError, email: emailError });
        setTouched({ name: true, phone: true, email: true });

        if (nameError || phoneError || emailError) return;

        setIsPaying(true);

        try {
            const reference = `BBOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Calculate addons total for metadata
            const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);

            const metadata = {
                customerName: clientDetails.name,
                customerEmail: clientDetails.email,
                customerPhone: clientDetails.phone || null,
                preferEmailOnly: clientDetails.preferEmailOnly || false,
                reminderPreference: clientDetails.reminderPreference || 'email_sms',
                customerBirthdayDay: clientDetails.birthdayDay || null,
                customerBirthdayMonth: clientDetails.birthdayMonth || null,
                customerNotes: customerNotes || null,
                serviceId: selectedService?.id,
                serviceName: selectedService?.name,
                servicePrice: selectedService?.price || 0,
                addonIds: selectedAddons.map(a => a.id),
                addonNames: selectedAddons.map(a => a.name).join(', '),
                addonsPrice: addonsTotal,
                staffId: selectedStaff?.id,
                staffName: selectedStaff?.name,
                bookingDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
                bookingTime: selectedTime
            };

            // Build callback URL with encoded details for robustness (especially in mock mode)
            const encodedDetails = encodeURIComponent(JSON.stringify(metadata));
            const callbackUrl = `${window.location.origin}/success?reference=${reference}&details=${encodedDetails}`;

            const result = await initializePayment({
                email: clientDetails.email,
                amountGHS: finalTotal,
                reference,
                callbackUrl,
                metadata
            });

            if (!result) {
                console.error("Payment initialization returned empty result");
                setIsPaying(false);
                return;
            }

            if (result.status && result.data?.authorization_url) {
                // Redirect to Paystack
                window.location.href = result.data.authorization_url;
            } else {
                console.error("Payment init failed:", result);
                console.error("Status:", result.status, "Message:", result.message);
                setIsPaying(false);
                // Optionally show error toast
            }

        } catch (error) {
            console.error("Payment error:", error);
            setIsPaying(false);
        }
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
                                <label htmlFor="phoneNumber" className="block text-white/50 text-sm mb-1">
                                    Phone Number <span className="text-white/30 text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        value={clientDetails.phone || ''}
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
                                        aria-invalid={!!errors.phone && touched.phone}
                                        aria-describedby={errors.phone && touched.phone ? "phone-error" : "phone-helper"}
                                    />
                                </div>
                                {errors.phone && touched.phone ? (
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
                                ) : (
                                    <p className="text-white/30 text-xs mt-1" id="phone-helper">
                                        Optional: Add your number for birthday wishes and free service offers! 🎁
                                    </p>
                                )}
                            </div>

                            {/* Birthday Section */}
                            <div>
                                <label className="block text-white/50 text-sm mb-1">
                                    Birthday <span className="text-white/30 text-xs">(Optional - Get a free cut!)</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                                        <select
                                            value={clientDetails.birthdayDay || ''}
                                            onChange={(e) => setClientDetails({ birthdayDay: e.target.value })}
                                            className="w-full bg-richblack-900 border border-white/10 rounded p-3 pl-10 text-white focus:ring-2 focus:ring-gold-500/20 outline-none transition-colors appearance-none cursor-pointer"
                                            aria-label="Birthday Day"
                                        >
                                            <option value="">Day</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={clientDetails.birthdayMonth || ''}
                                            onChange={(e) => setClientDetails({ birthdayMonth: e.target.value })}
                                            className="w-full bg-richblack-900 border border-white/10 rounded p-3 text-white focus:ring-2 focus:ring-gold-500/20 outline-none transition-colors appearance-none cursor-pointer"
                                            aria-label="Birthday Month"
                                        >
                                            <option value="">Month</option>
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                                                <option key={month} value={(index + 1).toString().padStart(2, '0')}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-white/50 text-sm mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={clientDetails.email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        onBlur={() => {
                                            setTouched(prev => ({ ...prev, email: true }));
                                            const error = validateEmail(clientDetails.email || '');
                                            setErrors(prev => ({ ...prev, email: error }));
                                        }}
                                        className={clsx(
                                            "w-full bg-richblack-900 border rounded p-3 pl-10 text-white focus:ring-2 focus:ring-gold-500/20 outline-none transition-colors",
                                            errors.email && touched.email
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-white/10 focus:border-gold-500"
                                        )}
                                        placeholder="you@example.com"
                                        required
                                        aria-required="true"
                                        aria-invalid={!!errors.email && touched.email}
                                        aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                                    />
                                </div>
                                {errors.email && touched.email && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex items-center gap-1 text-red-400 text-xs mt-1"
                                        id="email-error"
                                        role="alert"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.email}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Privacy Preferences */}
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <h4 className="text-white/70 text-sm font-medium">Privacy Preferences</h4>

                                {/* Email Only Preference */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={clientDetails.preferEmailOnly || false}
                                        onChange={(e) => setClientDetails({ preferEmailOnly: e.target.checked })}
                                        className="mt-0.5 w-4 h-4 rounded border-2 border-white/20 text-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 cursor-pointer bg-richblack-900"
                                    />
                                    <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors select-none">
                                        Prefer email-only contact (VIP privacy mode)
                                    </span>
                                </label>

                                {/* Reminder Preference */}
                                {!clientDetails.preferEmailOnly && clientDetails.phone && (
                                    <div className="space-y-2">
                                        <label className="text-white/50 text-xs">Reminder Preference</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="reminderPreference"
                                                    value="email_sms"
                                                    checked={clientDetails.reminderPreference === 'email_sms'}
                                                    onChange={(e) => setClientDetails({ reminderPreference: e.target.value as 'email_sms' })}
                                                    className="w-4 h-4 text-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 cursor-pointer bg-richblack-900 border-white/20"
                                                />
                                                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Email & SMS</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="reminderPreference"
                                                    value="email_only"
                                                    checked={clientDetails.reminderPreference === 'email_only'}
                                                    onChange={(e) => setClientDetails({ reminderPreference: e.target.value as 'email_only' })}
                                                    className="w-4 h-4 text-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 cursor-pointer bg-richblack-900 border-white/20"
                                                />
                                                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Email Only</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Customer Notes */}
                            <div>
                                <label htmlFor="customerNotes" className="block text-white/50 text-sm mb-1">
                                    Special Requests <span className="text-white/30 text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/30" aria-hidden="true" />
                                    <textarea
                                        id="customerNotes"
                                        value={customerNotes}
                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                        rows={3}
                                        className="w-full bg-richblack-900 border border-white/10 rounded p-3 pl-10 text-white focus:ring-2 focus:ring-gold-500/20 outline-none transition-colors resize-none"
                                        placeholder="Any special requests or preferences..."
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gold-900/10 border border-gold-500/20 rounded-lg text-sm text-gold-100/80">
                        <Lock className="w-5 h-5 text-gold-500 flex-shrink-0" />
                        <p>Your slot is held for <strong>5:00</strong> minutes. The <strong>20 GHS</strong> booking fee is non-refundable.</p>
                    </div>
                </div>

                {/* Receipt Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                    className="flex-1 lg:max-w-xs"
                >
                    <div className="bg-white p-6 rounded-xl text-richblack-900 shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
                        {/* Receipt Top Edge (Visual decoration) */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold-400 to-gold-600" />

                        <h3 className="font-display text-2xl font-bold mb-1">Receipt</h3>
                        <p className="text-richblack-900/50 text-xs uppercase tracking-widest mb-6">Noir Hair Studios • Accra</p>

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

                        {/* Staff Info */}
                        {selectedStaff && (
                            <div className="space-y-2 mb-6 border-b border-black/10 pb-6 border-dashed text-sm">
                                <div className="flex justify-between">
                                    <span className="text-black/60">Your Barber</span>
                                    <span className="font-medium">{selectedStaff.name}</span>
                                </div>
                            </div>
                        )}

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

                        <div className="flex justify-between items-end mb-6">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-display text-4xl font-bold text-gold-600">GHS {finalTotal.toFixed(0)}<span className="text-sm align-top text-black/40">.00</span></span>
                        </div>

                        {/* Booking Policies */}
                        <BookingPolicies />

                        {/* Policy Acceptance Checkbox */}
                        <div className="mb-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={policiesAccepted}
                                    onChange={(e) => setPoliciesAccepted(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded border-2 border-black/20 text-gold-600 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-white cursor-pointer"
                                    id="policies-checkbox"
                                    aria-required="true"
                                />
                                <span className="text-xs text-black/70 group-hover:text-black/90 transition-colors select-none">
                                    I have read and agree to the booking policies
                                </span>
                            </label>
                            {!policiesAccepted && touched.name && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="text-red-600 text-xs mt-2 flex items-center gap-1"
                                    role="alert"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    Please accept the booking policies to continue
                                </motion.p>
                            )}
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={!clientDetails.name || !clientDetails.email || !policiesAccepted || isPaying || (touched.name && !!errors.name) || (touched.phone && !!errors.phone) || (touched.email && !!errors.email)}
                            className="w-full bg-richblack-900 text-white py-4 font-bold rounded hover:bg-gold-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-white"
                            aria-label={`Pay ${finalTotal} GHS now with Paystack`}
                            aria-disabled={!clientDetails.name || !clientDetails.email || !policiesAccepted || isPaying}
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
                </motion.div>
            </div>
        </div>
    );
}
