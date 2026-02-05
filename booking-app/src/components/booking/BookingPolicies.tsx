"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, DollarSign, AlertTriangle, Calendar, ChevronDown, FileText } from "lucide-react";
import clsx from "clsx";

type PolicyItem = {
    id: string;
    icon: React.ReactNode;
    title: string;
    content: string;
};

const policies: PolicyItem[] = [
    {
        id: "booking-fee",
        icon: <DollarSign className="w-4 h-4" />,
        title: "Booking Fee",
        content: "A non-refundable booking fee of GHS 20 is required to secure your appointment. This fee is deducted from your total service cost and helps us reduce no-shows."
    },
    {
        id: "cancellation",
        icon: <Calendar className="w-4 h-4" />,
        title: "Cancellation Policy",
        content: "Free cancellation up to 1 hour before your appointment. Cancellations made less than 1 hour in advance will result in forfeiture of the booking fee."
    },
    {
        id: "lateness",
        icon: <Clock className="w-4 h-4" />,
        title: "Lateness Policy",
        content: "Please arrive 5 minutes early for your appointment. If you arrive more than 15 minutes late, your appointment may need to be shortened or rescheduled to accommodate other clients."
    },
    {
        id: "no-show",
        icon: <AlertTriangle className="w-4 h-4" />,
        title: "No-Show Policy",
        content: "Failure to attend your scheduled appointment without prior notice will result in forfeiture of the booking fee. Repeat offenders may be required to prepay the full service amount for future bookings."
    },
    {
        id: "rescheduling",
        icon: <Calendar className="w-4 h-4" />,
        title: "Rescheduling",
        content: "You may reschedule your appointment up to 1 hour in advance at no additional charge. Please contact us via WhatsApp or phone to make changes to your booking."
    }
];

export function BookingPolicies() {
    const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(true); // Changed to true for default expansion

    const togglePolicy = (id: string) => {
        setExpandedPolicy(expandedPolicy === id ? null : id);
    };

    return (
        <div className="bg-black/5 border border-black/10 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold-600" />
                    <h4 className="font-bold text-richblack-900 text-sm">Booking Policies</h4>
                </div>
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-gold-600 hover:text-gold-700 transition-colors flex items-center gap-1"
                    aria-expanded={showAll}
                    aria-label={showAll ? "Hide policies" : "Show all policies"}
                >
                    {showAll ? "Hide" : "View All"}
                    <ChevronDown className={clsx("w-3 h-3 transition-transform", showAll && "rotate-180")} />
                </button>
            </div>

            <AnimatePresence initial={false}>
                {showAll ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {policies.map((policy) => (
                            <div key={policy.id} className="border-t border-black/5 pt-2 first:border-t-0 first:pt-0">
                                <button
                                    onClick={() => togglePolicy(policy.id)}
                                    className="w-full flex items-center justify-between text-left p-2 rounded hover:bg-black/5 transition-colors group"
                                    aria-expanded={expandedPolicy === policy.id}
                                    aria-controls={`policy-${policy.id}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-gold-600">{policy.icon}</span>
                                        <span className="text-richblack-900 text-xs font-medium">{policy.title}</span>
                                    </div>
                                    <ChevronDown
                                        className={clsx(
                                            "w-3 h-3 text-black/40 transition-transform group-hover:text-black/60",
                                            expandedPolicy === policy.id && "rotate-180"
                                        )}
                                    />
                                </button>
                                <AnimatePresence initial={false}>
                                    {expandedPolicy === policy.id && (
                                        <motion.div
                                            id={`policy-${policy.id}`}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-black/60 text-xs leading-relaxed px-2 pb-2 pt-1">
                                                {policy.content}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-black/50 text-xs"
                    >
                        Please review our booking policies before proceeding with payment.
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
