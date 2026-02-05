'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    type = 'info'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-orange-500 hover:bg-orange-600',
        info: 'bg-blue-500 hover:bg-blue-600',
        success: 'bg-green-500 hover:bg-green-600',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-richblack-800 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white">{title}</h3>
                                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-white/70 leading-relaxed">
                                    {message}
                                </p>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center ${colors[type]}`}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            confirmText
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
