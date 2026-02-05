"use client";
import React, { useEffect, useState } from "react";
import { useBookingStore } from "@/store/booking";
import { Step1Services } from "@/components/booking/Step1Services";
import { Step2Addons, Step3DateTime } from "@/components/booking/Step2And3";
import { Step4Payment } from "@/components/booking/Step4Payment";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import clsx from "clsx";
import { getShopSettings } from "@/utils/supabase/queries";
import type { ShopSettings } from "@/types/database";

export default function BookingPage() {
    const { step, setStep } = useBookingStore();
    const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getShopSettings();
                setShopSettings(data);
            } catch (error) {
                console.error("Failed to load shop settings:", error);
            }
        }
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-richblack-900 text-white flex flex-col md:flex-row max-w-[2000px] mx-auto">

            {/* Sidebar / Progress */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-richblack-800 p-8 flex flex-col justify-between border-r border-white/5">
                <div>
                    <Link href="/" className="inline-flex items-center text-gold-500 hover:text-white mb-8 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                    <h1 className="font-display text-4xl text-white mb-2">Book Your<br /><span className="text-gold-500">Service</span>.</h1>
                    <p className="text-white/40 text-sm">Step {step} of 4</p>
                </div>

                <div className="space-y-4 mt-8">
                    {['Service', 'Add-ons', 'Date & Time', 'Payment'].map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = step === stepNum;
                        const isCompleted = step > stepNum;

                        return (
                            <div key={label} className="flex items-center space-x-3">
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                    isActive ? 'bg-gold-500 text-richblack-900' :
                                        isCompleted ? 'bg-green-500 text-richblack-900' : 'bg-white/10 text-white/40'
                                )}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                </div>
                                <span className={clsx("text-sm tracking-wider uppercase", isActive ? 'text-white font-bold' : 'text-white/40')}>
                                    {label}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Back Button */}
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="mt-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors group focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-800 rounded px-3 py-2"
                        aria-label="Go back to previous step"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Previous Step</span>
                    </button>
                )}

                <div className="mt-auto pt-8 border-t border-white/5">
                    <p className="text-xs text-white/20">Secure booking via Paystack</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-[1fr,380px] gap-8 lg:gap-12">
                        {/* Steps Content */}
                        <div className="min-w-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step === 1 && <Step1Services />}
                                    {step === 2 && <Step2Addons />}
                                    {step === 3 && <Step3DateTime />}
                                    {step === 4 && <Step4Payment />}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Booking Summary - Hidden on Step 4 (Payment has its own summary) */}
                        {step < 4 && (
                            <aside className="hidden lg:block">
                                <BookingSummary />
                            </aside>
                        )}
                    </div>
                </div>
            </div>

            {/* WhatsApp Button */}
            <WhatsAppButton phone={shopSettings?.shop_phone} />
        </div>
    );
}
