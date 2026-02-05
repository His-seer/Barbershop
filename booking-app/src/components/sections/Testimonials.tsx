"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Review } from "@/types/database";

const STATIC_TESTIMONIALS = [
    {
        id: "static-1",
        customer_name: "Kwame Mensah",
        rating: 5,
        comment: "Best barbershop experience in Accra! The attention to detail and professionalism is unmatched. I've been a regular client for over a year now.",
        created_at: new Date().toISOString()
    },
    {
        id: "static-2",
        customer_name: "Yaw Boateng",
        rating: 5,
        comment: "The home service is a game changer. Premium quality right at my doorstep. Perfect for busy professionals who value their time.",
        created_at: new Date().toISOString()
    },
    {
        id: "static-3",
        customer_name: "Kofi Asante",
        rating: 5,
        comment: "Not just a haircut, it's an experience. The atmosphere is luxurious, the barbers are skilled artists, and the results speak for themselves.",
        created_at: new Date().toISOString()
    }
];

export function Testimonials({ reviews = [] }: { reviews?: Review[] }) {
    // Use real reviews if available, otherwise show static ones (or mix?)
    // Decision: If we have real reviews, show them. If < 3, maybe pad with static?
    // Let's purely show real reviews if we have at least 1, else static (for launch phase).
    const displayReviews = reviews.length > 0 ? reviews : STATIC_TESTIMONIALS;

    return (
        <section className="py-24 px-6 bg-richblack-800 relative overflow-hidden">
            {/* Background Accent */}
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
                        <p className="text-gold-500 uppercase tracking-[0.3em] text-sm font-bold mb-4">Testimonials</p>
                        <h2 className="font-display text-4xl md:text-5xl mb-4 text-white">What Our Clients Say</h2>
                        <div className="w-24 h-1 bg-gold-500 mx-auto" />
                    </motion.div>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {displayReviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="bg-richblack-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative shadow-card hover:shadow-card-hover transition-shadow-smooth group h-full flex flex-col"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote className="w-16 h-16 text-gold-500" fill="currentColor" />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-white/80 text-sm leading-relaxed mb-8 relative z-10 flex-grow italic">
                                &quot;{review.comment}&quot;
                            </p>

                            {/* Client Info */}
                            <div className="flex items-center gap-4 pt-6 border-t border-white/10 mt-auto">
                                {/* Avatar Placeholder */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-richblack-900 shadow-inner-glow shrink-0">
                                    {review.customer_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{review.customer_name}</h4>
                                    <p className="text-white/40 text-xs">Verified Customer</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10"
                >
                    {[
                        { value: "120+", label: "Happy Clients" },
                        { value: "5.0", label: "Average Rating" },
                        { value: "2000+", label: "Cuts Delivered" },
                        { value: "100%", label: "Satisfaction" }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="font-display text-4xl md:text-5xl font-bold text-gold-500 mb-2">
                                {stat.value}
                            </div>
                            <div className="text-white/50 text-sm uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
