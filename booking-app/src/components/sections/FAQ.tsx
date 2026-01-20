"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        id: 1,
        question: "How far in advance should I book my appointment?",
        answer: "We recommend booking at least 2-3 days in advance to secure your preferred time slot. However, same-day appointments may be available depending on our schedule. Our home service requires at least 24 hours advance notice."
    },
    {
        id: 2,
        question: "What's included in the Royal Treatment package?",
        answer: "The Royal Treatment includes a premium haircut by our master barber, hot towel treatment, head and shoulder massage, beard trim and styling, premium hair products, and complimentary beverage. It's our most luxurious grooming experience taking approximately 60 minutes."
    },
    {
        id: 3,
        question: "Do you offer home service in all areas of Accra?",
        answer: "Yes! Our home service covers all areas within Greater Accra. We bring our full professional setup to your location including premium tools, sanitized equipment, and all necessary products. Additional charges may apply for locations outside central Accra."
    },
    {
        id: 4,
        question: "Is the 20 GHS booking fee refundable?",
        answer: "The booking fee is non-refundable but goes directly toward your service total. This fee helps us reduce no-shows and ensures our barbers' time is respected. If you need to reschedule, please contact us at least 6 hours before your appointment."
    },
    {
        id: 5,
        question: "What payment methods do you accept?",
        answer: "We accept all major payment methods through Paystack including mobile money (MTN, Vodafone, AirtelTigo), credit/debit cards (Visa, Mastercard), and bank transfers. Payment is secure and processed instantly."
    },
    {
        id: 6,
        question: "What COVID-19 safety measures do you have in place?",
        answer: "Your safety is our priority. We sanitize all equipment between clients, maintain social distancing in our shop, provide hand sanitizer, and our barbers wear masks. We also offer contactless check-in and payment options."
    },
    {
        id: 7,
        question: "Can I request a specific barber?",
        answer: "Absolutely! During booking, you can request your preferred barber. While we'll do our best to accommodate your choice, availability may vary. All our barbers are highly skilled professionals with years of experience."
    },
    {
        id: 8,
        question: "What's your cancellation policy?",
        answer: "You can cancel or reschedule up to 6 hours before your appointment at no additional charge (booking fee is non-refundable). Cancellations within 6 hours may result in forfeiture of your slot. Please contact us via WhatsApp or phone to make changes."
    }
];

export function FAQ() {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="py-24 px-6 bg-richblack-900 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-600/5 rounded-full blur-[150px]" />

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-gold-500 uppercase tracking-[0.3em] text-sm font-bold mb-4 flex items-center justify-center gap-2">
                            <HelpCircle className="w-4 h-4" /> FAQ
                        </p>
                        <h2 className="font-display text-4xl md:text-5xl mb-4 text-white">Frequently Asked Questions</h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            Everything you need to know about our services and booking process
                        </p>
                        <div className="w-24 h-1 bg-gold-500 mx-auto mt-6" />
                    </motion.div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="bg-richblack-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow-smooth"
                        >
                            <button
                                onClick={() => toggleFAQ(faq.id)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-inset group"
                                aria-expanded={openId === faq.id}
                                aria-controls={`faq-answer-${faq.id}`}
                            >
                                <span className="text-white font-semibold text-lg pr-8 group-hover:text-gold-400 transition-colors">
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0"
                                >
                                    <ChevronDown className={`w-5 h-5 transition-colors ${openId === faq.id ? 'text-gold-500' : 'text-white/40'}`} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openId === faq.id && (
                                    <motion.div
                                        id={`faq-answer-${faq.id}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-2 text-white/70 leading-relaxed border-t border-white/5">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Still Have Questions CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 text-center p-8 bg-gold-900/10 border border-gold-500/20 rounded-2xl"
                >
                    <h3 className="text-white font-display text-2xl mb-3">Still have questions?</h3>
                    <p className="text-white/60 mb-6">Our team is here to help you with anything you need</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://wa.me/233XXXXXXXXX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-richblack-900 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp Us
                        </a>
                        <a
                            href="tel:+233XXXXXXXXX"
                            className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 hover:border-gold-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                        >
                            Call Us
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
