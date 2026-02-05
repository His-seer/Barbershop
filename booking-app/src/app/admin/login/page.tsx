'use client';

import { useActionState } from 'react';
import { loginAdmin } from './actions';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(loginAdmin, null);

    return (
        <div className="min-h-screen bg-richblack-900 text-white flex flex-col items-center justify-center p-4 font-outfit">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm flex flex-col items-center space-y-8"
            >

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-white/10 shadow-2xl shadow-black/50">
                        <Lock className="w-8 h-8 text-gold-400" />
                    </div>
                    <h1 className="text-2xl font-playfair font-bold text-gold-400 tracking-wide">
                        OWNER ACCESS
                    </h1>
                    <p className="text-white/60 text-sm">Secure area for management only.</p>
                </div>

                {/* Form */}
                <form action={formAction} className="w-full space-y-6">

                    <div className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="owner@noirhairstudios.com"
                                className="w-full bg-richblack-800 border border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-white/20"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs uppercase tracking-widest text-gold-500 font-bold ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                className="w-full bg-richblack-800 border border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-white/20"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gold-500 hover:bg-gold-400 text-richblack-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'LOGIN'}
                    </button>
                </form>

            </motion.div>
        </div>
    );
}
