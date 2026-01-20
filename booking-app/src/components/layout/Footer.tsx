"use client";
import Link from "next/link";
import { Scissors, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Shield, Lock, Award } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-richblack-900 border-t border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gold-600/5 rounded-full blur-[150px]" />

            <div className="container mx-auto px-6 py-16 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="inline-block">
                            <div className="font-display text-2xl font-bold text-gold-500 tracking-wider mb-4">
                                THE <span className="text-white">SHOP</span>.
                            </div>
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed mb-6">
                            Premium barbershop experience in the heart of Accra. Master craftsmen delivering exceptional grooming since 2026.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            {[
                                { icon: Instagram, href: "#", label: "Instagram" },
                                { icon: Facebook, href: "#", label: "Facebook" },
                                { icon: Twitter, href: "#", label: "Twitter" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-gold-500/10 hover:border-gold-500/50 transition-all group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-white/50 group-hover:text-gold-500 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: "Book Appointment", href: "/book" },
                                { label: "Our Services", href: "#services" },
                                { label: "Meet the Team", href: "#barbers" },
                                { label: "Gallery", href: "#gallery" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-white/60 hover:text-gold-500 transition-colors text-sm inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                                <span className="text-white/60 text-sm">
                                    123 Oxford Street, Osu<br />
                                    Accra, Ghana
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                                <a href="tel:+233XXXXXXXXX" className="text-white/60 hover:text-gold-500 transition-colors text-sm">
                                    +233 XX XXX XXXX
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                                <a href="mailto:info@theshopgh.com" className="text-white/60 hover:text-gold-500 transition-colors text-sm">
                                    info@theshopgh.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Opening Hours</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between text-white/60">
                                <span>Mon - Sat</span>
                                <span className="text-gold-400 font-mono">9AM - 9PM</span>
                            </li>
                            <li className="flex justify-between text-white/60">
                                <span>Sunday</span>
                                <span className="text-red-400 font-mono">Closed</span>
                            </li>
                        </ul>

                        {/* Status Badge */}
                        <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-500/20 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-500 text-xs font-medium">Open Now</span>
                        </div>
                    </div>
                </div>

                {/* Trust Badges & Security */}
                <div className="border-t border-white/10 pt-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {/* Licensed */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                                <Award className="w-5 h-5 text-gold-500" />
                                <div className="text-left">
                                    <p className="text-white text-xs font-bold">Licensed</p>
                                    <p className="text-white/40 text-[10px]">Professional Barbers</p>
                                </div>
                            </div>

                            {/* Secure Payments */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                                <Lock className="w-5 h-5 text-green-500" />
                                <div className="text-left">
                                    <p className="text-white text-xs font-bold">Secure Payment</p>
                                    <p className="text-white/40 text-[10px]">Powered by Paystack</p>
                                </div>
                            </div>

                            {/* COVID Safe */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                                <Shield className="w-5 h-5 text-blue-500" />
                                <div className="text-left">
                                    <p className="text-white text-xs font-bold">COVID-Safe</p>
                                    <p className="text-white/40 text-[10px]">Sanitized Equipment</p>
                                </div>
                            </div>

                            {/* 5-Star Rating */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3 text-gold-500 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                        </svg>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <p className="text-white text-xs font-bold">5.0 Rating</p>
                                    <p className="text-white/40 text-[10px]">120+ Reviews</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-3">
                            <span className="text-white/40 text-xs">We accept:</span>
                            <div className="flex gap-2">
                                {["MTN", "VODA", "VISA", "MASTER"].map((method) => (
                                    <div
                                        key={method}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/50"
                                    >
                                        {method}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
                        <p>© {currentYear} The Shop. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:text-gold-500 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-gold-500 transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/refund" className="hover:text-gold-500 transition-colors">
                                Refund Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
