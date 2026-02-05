'use client';

import { useState, useEffect } from 'react';
import {
    Star,
    CheckCircle,
    XCircle,
    Trash2,
    Calendar,
    MessageSquare,
    Check,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPendingReviews, getApprovedReviews, approveReview, deleteReview } from '@/utils/supabase/queries';
import { Review } from '@/types/database';
import { useRouter } from 'next/navigation';

export default function ReviewsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {
        setIsLoading(true);
        try {
            const [pending, approved] = await Promise.all([
                getPendingReviews(),
                getApprovedReviews(50) // Limit to last 50 for admin view initially
            ]);
            setPendingReviews(pending);
            setApprovedReviews(approved);
        } catch (error) {
            console.error('Failed to load reviews', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleApprove(id: string) {
        setProcessingId(id);
        try {
            await approveReview(id);
            // Refresh local state optimistically
            const review = pendingReviews.find(r => r.id === id);
            if (review) {
                setPendingReviews(prev => prev.filter(r => r.id !== id));
                setApprovedReviews(prev => [{ ...review, is_approved: true }, ...prev]);
            }
        } catch (error) {
            console.error('Failed to approve review', error);
            alert('Failed to approve review');
        } finally {
            setProcessingId(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this review permanently?')) return;

        setProcessingId(id);
        try {
            await deleteReview(id);
            // Refresh local state optimistically
            setPendingReviews(prev => prev.filter(r => r.id !== id));
            setApprovedReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete review', error);
            alert('Failed to delete review');
        } finally {
            setProcessingId(null);
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Review Moderation</h1>
                    <p className="text-white/40">Approve or reject customer reviews before they appear on the site.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-richblack-800 border border-white/5 rounded-xl px-6 py-3 text-center">
                        <div className="text-xl font-bold text-white">{pendingReviews.length}</div>
                        <div className="text-xs uppercase tracking-wider text-white/40">Pending</div>
                    </div>
                    <div className="bg-richblack-800 border border-white/5 rounded-xl px-6 py-3 text-center">
                        <div className="text-xl font-bold text-white">{approvedReviews.length}</div>
                        <div className="text-xs uppercase tracking-wider text-white/40">Live</div>
                    </div>
                </div>
            </div>

            {/* PENDING REVIEWS */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-gold-500" />
                    Pending Approval
                </h2>

                {pendingReviews.length === 0 ? (
                    <div className="bg-richblack-800/50 border border-dashed border-white/10 rounded-2xl p-10 text-center text-white/40">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No pending reviews. All caught up!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingReviews.map((review) => (
                            <div key={review.id} className="bg-richblack-800 border border-gold-500/30 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gold-500" />

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-bold">
                                                    {review.customer_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{review.customer_name}</div>
                                                    <div className="text-xs text-white/40 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(review.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/20'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-richblack-900/50 rounded-xl p-4 border border-white/5 text-white/80 italic relative">
                                            <MessageSquare className="absolute top-4 left-4 w-4 h-4 text-white/10" />
                                            <p className="pl-6">&quot;{review.comment}&quot;</p>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            disabled={processingId === review.id}
                                            className="bg-green-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2 flex-1"
                                        >
                                            {processingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            disabled={processingId === review.id}
                                            className="bg-white/5 text-red-400 font-bold py-2 px-4 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 flex-1 border border-transparent hover:border-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* APPROVED REVIEWS */}
            {approvedReviews.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Live Reviews
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {approvedReviews.map((review) => (
                            <div key={review.id} className="bg-richblack-800 border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-white">{review.customer_name}</div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-white/60 line-clamp-2">&quot;{review.comment}&quot;</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="text-xs text-white/30">{formatDate(review.created_at)}</div>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors p-2"
                                        title="Delete Review"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
