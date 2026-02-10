'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const styles = {
        success: 'bg-green-500/10 border-green-500/30 text-green-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
        warning: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    };

    return (
        <div className={`fixed top-4 right-4 z-[100] min-w-[300px] max-w-md animate-slide-in-right`}>
            <div className={`${styles[type]} border rounded-xl p-4 shadow-2xl backdrop-blur-sm flex items-start gap-3`}>
                <div className="shrink-0">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
