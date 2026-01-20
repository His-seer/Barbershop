"use client";
import { useBookingStore } from "@/store/booking";
import { SERVICES } from "@/data/mock-services";
import { motion } from "framer-motion";
import { Scissors, Star, Check, ShieldCheck } from "lucide-react";
import clsx from "clsx";

export function Step1Services() {
    const { selectService, selectedService, setStep } = useBookingStore();

    // Group services
    const mainServices = SERVICES.filter(s => s.category !== 'addon');

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="font-display text-3xl text-gold-500 mb-6">Select Your Experience</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {mainServices.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    const Icon = service.id === 'home' ? ShieldCheck : (service.price > 50 ? Star : Scissors);

                    return (
                        <motion.button
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectService(service)}
                            aria-label={`Select ${service.name} for ${service.price} GHS`}
                            aria-pressed={isSelected}
                            className={clsx(
                                "relative p-6 text-left border rounded-xl transition-all duration-300 w-full group focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 transition-shadow-smooth",
                                isSelected
                                    ? "border-gold-500 bg-gold-900/20 shadow-elevated-gold"
                                    : "border-white/10 bg-white/5 hover:border-gold-500/50 hover:bg-white/10 shadow-card hover:shadow-card-hover"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={clsx("p-3 rounded-full", isSelected ? "bg-gold-500 text-richblack-900" : "bg-white/10 text-gold-400 group-hover:text-gold-300")}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="font-mono text-gold-400 text-lg">{service.price} GHS</span>
                            </div>

                            <h3 className={clsx("font-display text-xl font-bold mb-2", isSelected ? "text-gold-500" : "text-white")}>
                                {service.name}
                            </h3>
                            <p className="text-white/50 text-sm mb-4">{service.duration} minutes</p>

                            {/* Selection Indicator */}
                            <div className={clsx(
                                "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                isSelected ? "border-gold-500 bg-gold-500" : "border-white/20"
                            )}>
                                {isSelected && <Check className="w-4 h-4 text-richblack-900" />}
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            {/* Continue Button */}
            {selectedService && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-8 flex justify-end"
                >
                    <button
                        onClick={() => setStep(2)}
                        className="bg-gold-500 text-richblack-900 px-8 py-3 font-bold rounded hover:bg-white transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                        aria-label="Continue to add-ons"
                    >
                        Continue
                        <Check className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
