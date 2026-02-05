"use client";
import { motion } from "framer-motion";
import { Scissors, Award, Users, TrendingUp } from "lucide-react";
import type { Staff } from "@/types/database";

interface Props {
    staff: Staff[];
}

export function BarbersShowcase({ staff }: Props) {
    // Fallback if no staff are loaded yet
    const displayStaff = staff.length > 0 ? staff : [];

    return (
        <section id="barbers" className="py-24 px-6 bg-richblack-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px]" />

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
                            <Scissors className="w-4 h-4" /> Meet the Team
                        </p>
                        <h2 className="font-display text-4xl md:text-5xl mb-4 text-white">Master Craftsmen</h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            Our award-winning barbers bring passion and precision to every cut.
                        </p>
                        <div className="w-24 h-1 bg-gold-500 mx-auto mt-6" />
                    </motion.div>
                </div>

                {/* Barbers Grid */}
                {displayStaff.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {displayStaff.map((barber, index) => {
                            // Extract initials
                            const initials = barber.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);

                            // Use Bio line 1 as Role if available, or default
                            const role = barber.bio ? barber.bio.split('.')[0] : "Professional Barber";
                            const specialty = barber.specialties && barber.specialties.length > 0 ? barber.specialties[0] : "General Grooming";

                            return (
                                <motion.div
                                    key={barber.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                    className="group"
                                >
                                    <div className="bg-richblack-800 border border-white/10 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow-smooth h-full flex flex-col">
                                        {/* Image Placeholder / Avatar */}
                                        <div className="relative aspect-[3/4] bg-gradient-to-br from-richblack-700 to-richblack-900 overflow-hidden flex-shrink-0">
                                            {barber.avatar_url ? (
                                                <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-display text-5xl font-bold text-richblack-900 shadow-elevated-gold">
                                                        {initials}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Overlay on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-richblack-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                <p className="text-gold-400 text-sm font-medium">{specialty}</p>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-display text-2xl font-bold text-white mb-1">
                                                    {barber.name}
                                                </h3>
                                                <p className="text-gold-400 text-sm font-medium mb-4">
                                                    {role}
                                                </p>
                                            </div>

                                            {/* Specialties / Achievements Badge */}
                                            <div className="space-y-2 pt-4 border-t border-white/10 mt-4">
                                                {barber.specialties && barber.specialties.slice(0, 3).map((spec, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-white/60 text-xs">
                                                        <Award className="w-3 h-3 text-gold-500 mt-0.5 flex-shrink-0" />
                                                        <span>{spec}</span>
                                                    </div>
                                                ))}
                                                {(!barber.specialties || barber.specialties.length === 0) && (
                                                    <div className="flex items-start gap-2 text-white/60 text-xs italic">
                                                        <Award className="w-3 h-3 text-gold-500/50 mt-0.5 flex-shrink-0" />
                                                        <span>Expert Stylist</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10 mb-16">
                        <p className="text-white/40">Our team roster is being updated. Check back soon!</p>
                    </div>
                )}

                {/* Why Choose Our Team */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid md:grid-cols-3 gap-6 p-8 bg-gold-900/10 border border-gold-500/20 rounded-2xl"
                >
                    {[
                        {
                            icon: Users,
                            title: "Experienced Team",
                            description: "Years of combined experience in premium grooming"
                        },
                        {
                            icon: Award,
                            title: "Award Winning",
                            description: "Recognized for excellence in service"
                        },
                        {
                            icon: TrendingUp,
                            title: "Constantly Evolving",
                            description: "Regular training on latest trends and techniques"
                        }
                    ].map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-gold-400" />
                            </div>
                            <h4 className="text-white font-bold mb-2">{feature.title}</h4>
                            <p className="text-white/60 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
