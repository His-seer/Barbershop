"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useBookingStore } from "@/store/booking";
import { format } from "date-fns";
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Share2, Home, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConfirmationPage() {
    const router = useRouter();
    const { selectedService, selectedAddons, selectedDate, selectedTime, clientDetails, reset } = useBookingStore();
    const [showConfetti, setShowConfetti] = useState(true);

    // Redirect if no booking data
    useEffect(() => {
        if (!selectedService || !selectedDate || !selectedTime) {
            router.push('/book');
        }
    }, [selectedService, selectedDate, selectedTime, router]);

    // Hide confetti after animation
    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!selectedService || !selectedDate || !selectedTime) {
        return null;
    }

    const totalDuration = (selectedService?.duration || 0) + selectedAddons.reduce((acc, curr) => acc + curr.duration, 0);
    const serviceTotal = (selectedService?.price || 0) + selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    const bookingFee = 20;
    const finalTotal = serviceTotal + bookingFee;

    // Generate booking reference
    const bookingRef = `BRB-${Date.now().toString().slice(-8)}`;

    // Add to calendar function
    const addToCalendar = () => {
        const startDate = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes));

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + totalDuration);

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const event = {
            title: `Barbershop Appointment - ${selectedService.name}`,
            description: `Your appointment at The Shop\\n\\nService: ${selectedService.name}${selectedAddons.length > 0 ? '\\nAdd-ons: ' + selectedAddons.map(a => a.name).join(', ') : ''}\\n\\nReference: ${bookingRef}`,
            location: 'The Shop - Premium Barbershop, Accra',
            start: formatDate(startDate),
            end: formatDate(endDate)
        };

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.start}/${event.end}`;

        window.open(url, '_blank');
    };

    // Share booking function
    const shareBooking = () => {
        const text = `I just booked my appointment at The Shop! 💈\\n\\nService: ${selectedService.name}\\nDate: ${format(selectedDate, 'MMMM do, yyyy')}\\nTime: ${selectedTime}\\n\\nReference: ${bookingRef}`;

        if (navigator.share) {
            navigator.share({
                title: 'My Barbershop Appointment',
                text: text,
                url: window.location.origin
            });
        } else {
            navigator.clipboard.writeText(text);
            alert('Booking details copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-richblack-900 text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[150px] animate-pulse" />
            </div>

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-gold-500"
                            initial={{
                                x: `${50}%`,
                                y: `${50}%`,
                                opacity: 1,
                                scale: 1
                            }}
                            animate={{
                                x: `${Math.random() * 100}%`,
                                y: `${Math.random() * 100}%`,
                                opacity: 0,
                                scale: 0,
                                rotate: Math.random() * 360
                            }}
                            transition={{
                                duration: 2,
                                delay: Math.random() * 0.5,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                        <CheckCircle className="relative w-24 h-24 text-green-500" />
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-12"
                >
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        Booking Confirmed!
                    </h1>
                    <p className="text-white/60 text-lg mb-2">
                        Your appointment has been successfully scheduled
                    </p>
                    <p className="text-gold-400 font-mono text-sm">
                        Reference: {bookingRef}
                    </p>
                </motion.div>

                {/* Booking Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-richblack-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8 shadow-elevated"
                >
                    <h2 className="font-display text-2xl text-gold-500 mb-6">Appointment Details</h2>

                    <div className="space-y-6">
                        {/* Date & Time */}
                        <div className="flex items-start gap-4">
                            <Calendar className="w-6 h-6 text-gold-500 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-white/50 text-sm mb-1">Date & Time</p>
                                <p className="text-white font-semibold text-lg">
                                    {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                                </p>
                                <p className="text-gold-400 font-mono">{selectedTime}</p>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-start gap-4">
                            <Clock className="w-6 h-6 text-gold-500 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-white/50 text-sm mb-1">Duration</p>
                                <p className="text-white font-semibold">{totalDuration} minutes</p>
                            </div>
                        </div>

                        {/* Service */}
                        <div className="flex items-start gap-4 pt-6 border-t border-white/10">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <div className="w-3 h-3 bg-gold-500 rounded-full" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white/50 text-sm mb-1">Service</p>
                                <p className="text-white font-semibold">{selectedService.name}</p>
                                <p className="text-white/60 text-sm">{selectedService.price} GHS • {selectedService.duration} min</p>
                            </div>
                        </div>

                        {/* Add-ons */}
                        {selectedAddons.length > 0 && (
                            <div className="space-y-3 pl-10">
                                {selectedAddons.map((addon) => (
                                    <div key={addon.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white/80 text-sm">+ {addon.name}</p>
                                        </div>
                                        <p className="text-white/60 text-sm">{addon.price} GHS</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center pt-6 border-t border-white/10">
                            <span className="text-white font-bold text-lg">Total Paid</span>
                            <span className="font-display text-3xl font-bold text-gold-500">{finalTotal} <span className="text-sm text-white/40">GHS</span></span>
                        </div>

                        {/* Client Info */}
                        <div className="pt-6 border-t border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gold-500/70" />
                                <p className="text-white/70 text-sm">{clientDetails.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gold-500/70" />
                                <p className="text-white/70 text-sm">{clientDetails.phone}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="grid md:grid-cols-2 gap-4 mb-8"
                >
                    <button
                        onClick={addToCalendar}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-gold-500 text-richblack-900 font-bold rounded-lg hover:bg-gold-400 transition-colors shadow-elevated-gold focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                    >
                        <Download className="w-5 h-5" />
                        Add to Calendar
                    </button>
                    <button
                        onClick={shareBooking}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 hover:border-gold-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                    >
                        <Share2 className="w-5 h-5" />
                        Share
                    </button>
                </motion.div>

                {/* Location Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gold-900/10 border border-gold-500/20 rounded-xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-gold-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-bold mb-2">The Shop - Premium Barbershop</h3>
                            <p className="text-white/60 text-sm mb-3">
                                123 Oxford Street, Osu, Accra<br />
                                Near Danquah Circle
                            </p>
                            <a
                                href="https://maps.google.com/?q=The+Shop+Barbershop+Accra"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
                            >
                                Get Directions →
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Important Notes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-richblack-800/50 border border-white/10 rounded-xl p-6 mb-8"
                >
                    <h3 className="text-white font-bold mb-4">Important Information</h3>
                    <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Please arrive 5 minutes before your scheduled time</li>
                        <li>• A confirmation SMS has been sent to {clientDetails.phone}</li>
                        <li>• To reschedule or cancel, contact us at least 6 hours in advance</li>
                        <li>• Bring your booking reference: <span className="text-gold-400 font-mono">{bookingRef}</span></li>
                    </ul>
                </motion.div>

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        href="/"
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <a
                        href="https://wa.me/233XXXXXXXXX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp Support
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
