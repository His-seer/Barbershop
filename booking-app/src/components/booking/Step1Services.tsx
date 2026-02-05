"use client";
import { useBookingStore } from "@/store/booking";
import { getServices } from "@/utils/supabase/queries";
import type { Service } from "@/types/database";
import { motion } from "framer-motion";
import { Scissors, Star, Check, ShieldCheck, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

export function Step1Services() {
    const { selectService, selectedService, setStep } = useBookingStore();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchServices() {
            try {
                setLoading(true);
                const data = await getServices();
                setServices(data);
                setError(null);
            } catch (err) {
                console.error('Error loading services:', err);
                setError('Failed to load services. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading services...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gold-500 text-richblack-900 px-6 py-2 rounded hover:bg-white transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="font-display text-3xl text-gold-500 mb-6">Select Your Experience</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    const Icon = service.price > 50 ? Star : Scissors;

                    return (
                        <motion.button
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectService(service)}
                            aria-label={`Select ${service.name} for ${service.price} GHS`}
                            aria-pressed={isSelected}
                            className={clsx(
                                "relative p-6 text-left border rounded-xl transition-all duration-300 w-full group focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 transition-shadow-smooth flex flex-col h-full",
                                isSelected
                                    ? "border-gold-500 bg-gold-900/20 shadow-elevated-gold"
                                    : "border-white/10 bg-white/5 hover:border-gold-500/50 hover:bg-white/10 shadow-card hover:shadow-card-hover"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4 w-full">
                                <div className={clsx("p-3 rounded-full", isSelected ? "bg-gold-500 text-richblack-900" : "bg-white/10 text-gold-400 group-hover:text-gold-300")}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {/* Selection Indicator at Top Right */}
                                <div className={clsx(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    isSelected ? "border-gold-500 bg-gold-500" : "border-white/20"
                                )}>
                                    {isSelected && <Check className="w-4 h-4 text-richblack-900" />}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className={clsx("font-display text-xl font-bold mb-2", isSelected ? "text-gold-500" : "text-white")}>
                                    {service.name}
                                </h3>
                                {service.description && (
                                    <p className="text-white/50 text-sm mb-2">{service.description}</p>
                                )}
                                <p className="text-white/50 text-sm">{service.duration_minutes} minutes</p>
                            </div>

                            <div className="flex justify-end mt-4 w-full">
                                <span className="font-mono text-gold-400 text-lg">{service.price} GHS</span>
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
