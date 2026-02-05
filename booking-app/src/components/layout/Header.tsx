"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? "bg-richblack-900/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="font-display text-2xl font-bold text-gold-500 tracking-wider hover:text-gold-400 transition-colors">
                    Noir<span className="text-white">HairStudios</span>.
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
                    {["Services", "Barbers"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm font-medium hover:text-gold-400 transition-colors uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 rounded px-2 py-1"
                        >
                            {item}
                        </Link>
                    ))}
                    <MagneticButton>
                        <Link
                            href="/book"
                            className="block bg-gold-500 text-richblack-900 px-6 py-2 rounded-none font-bold text-sm tracking-widest hover:bg-white transition-colors"
                        >
                            BOOK NOW
                        </Link>
                    </MagneticButton>
                </nav>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded p-1"
                    aria-label="Open mobile menu"
                    aria-expanded={mobileOpen}
                >
                    <Menu className="w-8 h-8" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        className="fixed inset-0 bg-richblack-900 z-[60] flex flex-col items-center justify-center space-y-8"
                        role="dialog"
                        aria-label="Mobile navigation menu"
                        aria-modal="true"
                    >
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-6 right-6 text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 rounded p-1"
                            aria-label="Close mobile menu"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <nav className="flex flex-col items-center space-y-8" aria-label="Mobile navigation">
                            {["Services", "Barbers"].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-2xl font-display font-bold hover:text-gold-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 rounded px-3 py-2"
                                >
                                    {item}
                                </Link>
                            ))}
                            <Link
                                href="/book"
                                onClick={() => setMobileOpen(false)}
                                className="bg-gold-500 text-richblack-900 px-8 py-4 font-bold text-xl tracking-widest hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                            >
                                BOOK APPOINTMENT
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
