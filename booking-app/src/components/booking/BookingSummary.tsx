"use client";
import { useBookingStore } from "@/store/booking";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Scissors, Plus } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";

export function BookingSummary() {
    const { selectedService, selectedAddons, selectedDate, selectedTime } = useBookingStore();

    // Calculate totals
    const serviceTotal = (selectedService?.price || 0) + selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    const totalDuration = (selectedService?.duration || 0) + selectedAddons.reduce((acc, curr) => acc + curr.duration, 0);
    const bookingFee = selectedService ? 20 : 0;
    const finalTotal = serviceTotal + bookingFee;

    // Don't show if no service selected
    if (!selectedService) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-8 bg-richblack-800/90 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4 shadow-elevated"
            role="complementary"
            aria-label="Booking Summary"
        >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display text-xl text-gold-500">Your Booking</h3>
                <Scissors className="w-5 h-5 text-gold-500/50" />
            </div>

            {/* Service Details */}
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="text-white font-semibold">{selectedService.name}</p>
                        <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {selectedService.duration} min
                        </p>
                    </div>
                    <span className="text-gold-400 font-mono text-sm">{selectedService.price} GHS</span>
                </div>

                {/* Add-ons */}
                <AnimatePresence>
                    {selectedAddons.map((addon) => (
                        <motion.div
                            key={addon.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between items-start text-sm"
                        >
                            <div className="flex items-start gap-2 flex-1">
                                <Plus className="w-3 h-3 text-gold-500/50 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-white/80">{addon.name}</p>
                                    <p className="text-white/30 text-xs flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {addon.duration} min
                                    </p>
                                </div>
                            </div>
                            <span className="text-gold-400/80 font-mono text-xs">{addon.price} GHS</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Date & Time */}
            <AnimatePresence>
                {selectedDate && selectedTime && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-white/10"
                    >
                        <div className="flex items-start gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-gold-500/70 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-white/90">{format(selectedDate, 'EEEE, MMMM do')}</p>
                                <p className="text-gold-400 font-mono text-xs mt-1">{selectedTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-2">
                            <Clock className="w-3 h-3" />
                            <span>Total duration: {totalDuration} min</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white font-mono">{serviceTotal} GHS</span>
                </div>
                {bookingFee > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-white/60">Booking Fee</span>
                        <span className="text-white font-mono">{bookingFee} GHS</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="font-display text-2xl font-bold text-gold-500">{finalTotal} <span className="text-sm text-white/40">GHS</span></span>
                </div>
            </div>

            {/* Info Badge */}
            <div className="text-xs text-center text-white/30 pt-2 border-t border-white/10">
                Secure payment with Paystack
            </div>
        </motion.div>
    );
}
