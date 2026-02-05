"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { CheckCircle, XCircle, Home, Calendar, MapPin, Navigation, User } from 'lucide-react';
import Link from 'next/link';
import { DownloadReceiptButton } from '@/components/ui/DownloadReceiptButton';

interface SuccessViewProps {
    isSuccess: boolean;
    reference?: string;
    finalAmount: string;
    bookingDetails: Record<string, unknown>;
    bookingId?: string;
    verificationMessage?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const checkVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
        }
    }
};

export function SuccessView({
    isSuccess,
    reference,
    finalAmount,
    bookingDetails,
    bookingId,
    verificationMessage
}: SuccessViewProps) {
    if (!isSuccess) {
        return (
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/30">
                    <XCircle className="w-12 h-12 text-red-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-playfair font-bold text-white">Payment Failed</h1>
                    <p className="text-white/60">We couldn&apos;t verify your transaction.</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-200 text-sm">
                    {verificationMessage}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Link
                        href="/book"
                        className="w-full bg-white text-richblack-900 font-bold py-3 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-4 h-4" /> Try Booking Again
                    </Link>
                    <Link
                        href="/"
                        className="w-full bg-transparent border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" /> Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="w-full max-w-md mx-auto space-y-8 py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="text-center space-y-6">
                <motion.div
                    variants={checkVariants}
                    className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/30"
                >
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-bold text-white">Booking Confirmed!</h1>
                    <p className="text-white/60 text-lg">Your appointment has been successfully scheduled.</p>
                    {bookingId && (
                        <p className="text-white/40 text-sm font-mono">Booking ID: {bookingId}</p>
                    )}
                </div>
            </motion.div>

            {/* Receipt Card */}
            <motion.div variants={itemVariants} className="relative">
                {/* Notches for torn effect */}
                <div className="absolute top-[88px] -left-3 w-6 h-6 bg-richblack-900 rounded-full z-10" data-html2canvas-ignore></div>
                <div className="absolute top-[88px] -right-3 w-6 h-6 bg-richblack-900 rounded-full z-10" data-html2canvas-ignore></div>

                <div id="receipt-card" className="bg-white text-richblack-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold-400 to-gold-600" />

                    <div className="mb-6 pb-6 border-b border-richblack-900/10 border-dashed flex justify-between items-start">
                        <div>
                            <p className="text-richblack-900/40 text-xs uppercase tracking-widest mb-1">Receipt Reference</p>
                            <p className="font-mono font-bold text-lg">{reference}</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        {typeof bookingDetails.serviceName === 'string' && bookingDetails.serviceName.length > 0 && (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg">{bookingDetails.serviceName}</p>
                                    {typeof bookingDetails.addonNames === 'string' && bookingDetails.addonNames.length > 0 && (
                                        <p className="text-sm text-richblack-900/60">+ {bookingDetails.addonNames}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {(typeof bookingDetails.staffName === 'string' || typeof bookingDetails.barberName === 'string') && (
                            <div className="flex items-center gap-3 text-sm text-richblack-900/80 bg-richblack-900/5 p-3 rounded-lg">
                                <User className="w-4 h-4" />
                                <span>
                                    Barber:{' '}
                                    <strong>
                                        {typeof bookingDetails.staffName === 'string'
                                            ? bookingDetails.staffName
                                            : typeof bookingDetails.barberName === 'string'
                                                ? bookingDetails.barberName
                                                : ''}
                                    </strong>
                                </span>
                            </div>
                        )}

                        {(
                            typeof bookingDetails.bookingDate === 'string' ||
                            typeof bookingDetails.date === 'string' ||
                            typeof bookingDetails.bookingTime === 'string' ||
                            typeof bookingDetails.time === 'string'
                        ) && (
                            <div className="flex items-center gap-3 text-sm text-richblack-900/80 bg-richblack-900/5 p-3 rounded-lg">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {(typeof bookingDetails.bookingDate === 'string' || typeof bookingDetails.date === 'string')
                                        ? new Date(
                                            typeof bookingDetails.bookingDate === 'string'
                                                ? bookingDetails.bookingDate
                                                : typeof bookingDetails.date === 'string'
                                                    ? bookingDetails.date
                                                    : ''
                                        ).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                        : ''}
                                    {(typeof bookingDetails.bookingTime === 'string' || typeof bookingDetails.time === 'string')
                                        ? ` at ${typeof bookingDetails.bookingTime === 'string' ? bookingDetails.bookingTime : bookingDetails.time}`
                                        : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-richblack-900/10 border-dashed">
                        <div className="flex justify-between items-baseline mb-6">
                            <span className="text-richblack-900/60 font-medium">Total Paid</span>
                            <span className="font-display text-3xl font-bold text-gold-600">GHS {finalAmount}</span>
                        </div>
                        <DownloadReceiptButton targetId="receipt-card" fileName={`Receipt-${reference}`} />
                    </div>
                </div>
            </motion.div>

            {/* Location & Actions */}
            <motion.div variants={itemVariants} className="space-y-4">
                {/* Directions Card */}
                <div className="bg-richblack-800 border border-white/10 rounded-2xl p-6 flex flex-col justify-center text-center space-y-4 shadow-elevated">
                    <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="w-6 h-6 text-gold-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Noir Hair Studios</h3>
                        <p className="text-white/60 text-sm mt-1">
                            123 Oxford Street, Osu<br />
                            Near Danquah Circle, Accra
                        </p>
                    </div>
                    <a
                        href="https://maps.google.com/?q=The+Shop+Barbershop+Osu+Accra"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 text-gold-400 text-sm font-bold hover:text-gold-300 transition-colors"
                    >
                        <Navigation className="w-4 h-4" /> Get Directions
                    </a>
                </div>

                {/* Home Button */}
                <Link
                    href="/"
                    className="w-full bg-gold-500 hover:bg-gold-400 text-richblack-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/10"
                >
                    <Home className="w-5 h-5" /> Return Home
                </Link>
            </motion.div>
        </motion.div>
    );
}
