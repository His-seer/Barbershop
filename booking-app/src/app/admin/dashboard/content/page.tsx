'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    X,
    Save,
    Monitor
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from '@/utils/supabase/queries';
import type { HeroSlide } from '@/types/database';

export default function ContentPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadSlides();
    }, []);

    async function loadSlides() {
        setIsLoading(true);
        try {
            const data = await getAllHeroSlides();
            setSlides(data);
        } catch (error) {
            console.error('Failed to load slides:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleToggleActive(slide: HeroSlide) {
        const result = await updateHeroSlide(slide.id, { is_active: !slide.is_active });
        if (result.success) {
            setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this slide?')) return;
        const result = await deleteHeroSlide(id);
        if (result.success) {
            setSlides(slides.filter(s => s.id !== id));
        }
    }

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Hero Carousel</h1>
                    <p className="text-white/40">Manage the rotating images on your landing page.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Slide
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                <Monitor className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-300/80">
                    Upload high-quality images (1920×1080 recommended). Active slides will automatically cycle every 5 seconds on the landing page.
                </p>
            </div>

            {/* Slides Grid */}
            {slides.length === 0 ? (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Slides Yet</h3>
                    <p className="text-white/40 mb-6">Add your first hero image to start the carousel.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add First Slide
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slides.map((slide, index) => (
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative group bg-richblack-800 border rounded-xl overflow-hidden ${slide.is_active ? 'border-gold-500/50' : 'border-white/10 opacity-60'
                                }`}
                        >
                            {/* Image */}
                            <div className="aspect-video relative">
                                <img
                                    src={slide.image_url}
                                    alt={slide.title || 'Slide'}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleToggleActive(slide)}
                                        className={`p-3 rounded-full transition-colors ${slide.is_active
                                            ? 'bg-white/10 hover:bg-white/20 text-white'
                                            : 'bg-gold-500/20 hover:bg-gold-500/40 text-gold-500'
                                            }`}
                                        title={slide.is_active ? 'Hide' : 'Show'}
                                    >
                                        {slide.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Order Badge */}
                                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-mono text-white/60">
                                    #{index + 1}
                                </div>

                                {/* Active Badge */}
                                {slide.is_active && (
                                    <div className="absolute top-2 right-2 bg-gold-500/90 px-2 py-1 rounded text-xs font-bold text-black">
                                        ACTIVE
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            {(slide.title || slide.subtitle) && (
                                <div className="p-4 border-t border-white/5">
                                    {slide.title && <h4 className="font-bold text-white text-sm truncate">{slide.title}</h4>}
                                    {slide.subtitle && <p className="text-white/40 text-xs truncate">{slide.subtitle}</p>}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Slide Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddSlideModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => {
                            setShowAddModal(false);
                            loadSlides();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function AddSlideModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [imageUrl, setImageUrl] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        if (!imageUrl) {
            alert('Please upload an image first');
            return;
        }

        setIsSaving(true);
        try {
            const result = await createHeroSlide({ image_url: imageUrl, title, subtitle });
            if (result.success) {
                onSuccess();
            } else {
                alert('Failed to save: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving slide:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-richblack-800 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-6"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold text-white">Add New Slide</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Slide Image</label>
                    <div className="h-48">
                        <ImageUpload
                            bucketName="shop-assets"
                            folderPath="hero-slides"
                            currentImage={imageUrl}
                            onUploadComplete={setImageUrl}
                        />
                    </div>
                </div>

                {/* Optional Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">
                            Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                            placeholder="e.g., Premium Cuts"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">
                            Subtitle (Optional)
                        </label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={e => setSubtitle(e.target.value)}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                            placeholder="e.g., Experience the best in grooming"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white font-bold hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !imageUrl}
                        className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : 'Save Slide'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
