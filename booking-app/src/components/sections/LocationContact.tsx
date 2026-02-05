"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import type { ShopSettings } from "@/types/database";

interface Props {
    settings: ShopSettings | null;
}

export function LocationContact({ settings }: Props) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const address = settings?.shop_address || "123 Oxford Street, Osu, Accra, Ghana";
    const phone = settings?.shop_phone || "+233 20 000 0000";
    const email = settings?.shop_email || "info@barbershop.com";

    return (
        <section className="py-24 px-6 bg-richblack-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[150px]" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-gold-500 uppercase tracking-[0.3em] text-sm font-bold mb-4 flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4" /> Location & Contact
                        </p>
                        <h2 className="font-display text-4xl md:text-5xl mb-4 text-white">Visit Us</h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            Experience premium grooming in the heart of our city.
                        </p>
                        <div className="w-24 h-1 bg-gold-500 mx-auto mt-6" />
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Map Placeholder & Address */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Map Placeholder */}
                        <div className="relative aspect-[16/10] bg-richblack-800 border border-white/10 rounded-2xl overflow-hidden shadow-elevated group">
                            <div className="absolute inset-0 bg-gradient-to-br from-richblack-700 to-richblack-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-16 h-16 text-gold-500/30 mx-auto mb-4" />
                                        <p className="text-white/20 text-sm uppercase tracking-wider">Interactive Map</p>
                                    </div>
                                </div>
                            </div>

                            {/* Get Directions Overlay */}
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-richblack-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                            >
                                <div className="bg-gold-500 text-richblack-900 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-elevated-gold">
                                    <Navigation className="w-5 h-5" />
                                    Get Directions
                                </div>
                            </a>
                        </div>

                        {/* Address Card */}
                        <div className="bg-richblack-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-card">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-gold-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-2">Our Location</h3>
                                    <p className="text-white/70 leading-relaxed whitespace-pre-line">
                                        {address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Info & Operating Hours */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Contact Methods */}
                        <div className="bg-richblack-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-card">
                            <h3 className="text-white font-display text-2xl mb-6">Get in Touch</h3>

                            <div className="space-y-4">
                                {/* Phone */}
                                <a
                                    href={`tel:${phone}`}
                                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-gold-500/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                                        <Phone className="w-5 h-5 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-white font-semibold">{phone}</p>
                                    </div>
                                </a>

                                {/* Email */}
                                <a
                                    href={`mailto:${email}`}
                                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-gold-500/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 transition-colors">
                                        <Mail className="w-5 h-5 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-white font-semibold">{email}</p>
                                    </div>
                                </a>

                                {/* WhatsApp - Uses Phone number */}
                                <a
                                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-green-900/20 border border-green-500/20 rounded-xl hover:bg-green-900/30 hover:border-green-500/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">WhatsApp</p>
                                        <p className="text-white font-semibold">Chat with us instantly</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="bg-richblack-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-6 h-6 text-gold-500" />
                                <h3 className="text-white font-display text-2xl">Operating Hours</h3>
                            </div>

                            <div className="space-y-3">
                                {days.map((day) => {
                                    const hours = (settings?.business_hours || {}) as Record<string, { open?: string; close?: string }>;
                                    const schedule = hours[day.toLowerCase()] || null;
                                    const isOpen = !!schedule?.open;

                                    return (
                                        <div
                                            key={day}
                                            className={`flex justify-between items-center py-2 border-b border-white/5 last:border-0`}
                                        >
                                            <span className={`font-medium ${isOpen ? 'text-white' : 'text-white/50'}`}>
                                                {day}
                                            </span>
                                            <span className={`font-mono text-sm ${isOpen ? 'text-gold-400' : 'text-red-400'}`}>
                                                {isOpen ? `${schedule.open} - ${schedule.close}` : 'Closed'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current Status */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-white/70">Check time for status (Automatic status coming soon)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
