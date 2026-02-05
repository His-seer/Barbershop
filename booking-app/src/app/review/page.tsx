'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, Search, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyBookingForReview, submitReviewAction } from '@/actions/review';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewPage() {
    const [step, setStep] = useState<'verify' | 'form' | 'success'>('verify');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Booking Data for context
    const [bookingData, setBookingData] = useState<{
        id: string;
        customer_name: string;
        service_name: string;
        booking_date: string;
    } | null>(null);

    // Form Data
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await verifyBookingForReview(reference);
            if (result.success && result.data) {
                setBookingData(result.data);
                setStep('form');
            } else {
                setError(result.error || 'Invalid booking reference.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!bookingData) {
            setError('Please verify your booking reference first.');
            return;
        }
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }
        setIsLoading(true);
        try {
            const result = await submitReviewAction(
                bookingData.id,
                bookingData.customer_name,
                rating,
                comment
            );
            if (result.success) {
                setStep('success');
            } else {
                setError(result.error || 'Failed to submit review.');
            }
        } catch (err) {
            setError('Failed to submit review.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-richblack-900 flex items-center justify-center p-4">
            <div className="bg-noise absolute inset-0 opacity-20 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <AnimatePresence mode="wait">

                    {/* STEP 1: VERIFY */}
                    {step === 'verify' && (
                        <motion.div
                            key="verify"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-richblack-800 border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                                    <Star className="w-8 h-8 text-gold-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h1>
                                <p className="text-white/60 text-sm">Enter your booking reference code to verified your visit.</p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Booking Reference</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value.toUpperCase())}
                                            placeholder="e.g. REF-123456"
                                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold-500/50 focus:outline-none text-center font-mono tracking-widest uppercase"
                                        />
                                        <Search className="absolute right-4 top-3.5 w-5 h-5 text-white/20" />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !reference}
                                    className="w-full bg-gold-500 text-black font-bold py-3.5 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Booking <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
                                    Back to Home
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: FORM */}
                    {step === 'form' && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-richblack-800 border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            {!bookingData ? (
                                <div className="text-center py-8">
                                    <p className="text-white/60">Booking details not loaded. Please verify your reference again.</p>
                                </div>
                            ) : (
                            <div className="text-center mb-8">
                                <p className="text-gold-500 text-sm font-bold tracking-widest uppercase mb-1">{bookingData.service_name}</p>
                                <h2 className="text-2xl font-bold text-white mb-2">Hi, {bookingData.customer_name}</h2>
                                <p className="text-white/60 text-sm">How was your haircut on {new Date(bookingData.booking_date).toLocaleDateString()}?</p>
                            </div>

                            )}

                            <div className="space-y-8">
                                {/* Star Rating */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                                        ? 'fill-gold-500 text-gold-500'
                                                        : 'fill-transparent text-white/20'
                                                    } transition-colors duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="text-center text-sm font-medium text-gold-500 h-5">
                                    {hoveredRating === 1 && "Poor"}
                                    {hoveredRating === 2 && "Fair"}
                                    {hoveredRating === 3 && "Good"}
                                    {hoveredRating === 4 && "Very Good"}
                                    {hoveredRating === 5 && "Excellent!"}
                                </div>

                                {/* Comment */}
                                <div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us about your experience (optional)..."
                                        className="w-full bg-richblack-900 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-gold-500/50 focus:outline-none resize-none h-32"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep('verify')}
                                        className="flex-1 bg-white/5 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading || rating === 0}
                                        className="flex-[2] bg-gold-500 text-black font-bold py-3.5 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-richblack-800 border border-white/10 rounded-2xl p-12 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/40">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
                            <p className="text-white/60 mb-8">
                                Your review has been submitted and is pending moderation.
                                We appreciate your feedback!
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                            >
                                Return Home
                            </Link>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
