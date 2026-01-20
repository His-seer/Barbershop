"use client";
import React from "react";
import Calendar from "react-calendar";
import { useBookingStore } from "@/store/booking";
import { SERVICES } from "@/data/mock-services";
import { motion } from "framer-motion";
import { Plus, Check, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { addDays, format, isSunday } from "date-fns";
import 'react-calendar/dist/Calendar.css';

export function Step2Addons() {
    const { selectService, toggleAddon, selectedAddons, setStep } = useBookingStore();
    const addons = SERVICES.filter(s => s.category === 'addon');

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-3xl text-gold-500">Enhance Your Cut</h2>
                <button
                    onClick={() => setStep(3)}
                    className="text-sm text-white/50 hover:text-white underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900 rounded px-2 py-1"
                    aria-label="Skip add-ons and continue to date and time selection"
                >
                    Skip Add-ons
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {addons.map((addon) => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                        <motion.button
                            key={addon.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAddon(addon)}
                            className={clsx(
                                "flex items-center justify-between p-4 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900",
                                isSelected
                                    ? "border-gold-500 bg-gold-900/10"
                                    : "border-white/10 hover:border-white/30"
                            )}
                            aria-label={`${isSelected ? 'Remove' : 'Add'} ${addon.name} for ${addon.price} GHS`}
                            aria-pressed={isSelected}
                            role="checkbox"
                            aria-checked={isSelected}
                        >
                            <div className="text-left">
                                <h3 className="text-white font-bold">{addon.name}</h3>
                                <p className="text-gold-400 text-sm">{addon.price} GHS • {addon.duration} min</p>
                            </div>
                            <div className={clsx("w-6 h-6 rounded border flex items-center justify-center", isSelected ? "bg-gold-500 border-gold-500" : "border-white/30")}>
                                {isSelected ? <Check className="w-4 h-4 text-black" /> : <Plus className="w-4 h-4 text-white/50" />}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="pt-8 flex justify-end">
                <button
                    onClick={() => setStep(3)}
                    className="bg-gold-500 text-richblack-900 px-8 py-3 font-bold rounded hover:bg-white transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                    aria-label="Continue to date and time selection"
                >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
    );
}

export function Step3DateTime() {
    const { selectedDate, setDate, selectedTime, setTime, setStep } = useBookingStore();

    // Generate slots: 09:00 to 21:00 (15 min intervals)
    const timeSlots = [];
    let start = 9 * 60; // 9 AM in minutes
    const end = 21 * 60; // 9 PM

    while (start < end) {
        const h = Math.floor(start / 60);
        const m = start % 60;
        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
        start += 15;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="font-display text-3xl text-gold-500 mb-6">Choose Date & Time</h2>

            {/* Quick Date Selectors */}
            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { label: "Today", days: 0 },
                    { label: "Tomorrow", days: 1 },
                    { label: "This Weekend", days: (7 - new Date().getDay()) % 7 || 7 }
                ].map((quick) => (
                    <button
                        key={quick.label}
                        onClick={() => {
                            const date = addDays(new Date(), quick.days);
                            if (!isSunday(date)) {
                                setDate(date);
                                setTime(null as any);
                            }
                        }}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-gold-500/50 hover:bg-gold-500/10 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                    >
                        {quick.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar */}
                <div className="flex-1" role="region" aria-label="Date selection calendar">
                    <style jsx global>{`
                        .react-calendar {
                            background: transparent;
                            border: none;
                            font-family: var(--font-outfit);
                            width: 100%;
                            padding: 1rem;
                        }
                        .react-calendar__tile {
                            color: #fff;
                            padding: 1.2em 0.5em;
                            border-radius: 8px;
                            transition: all 0.2s ease;
                            position: relative;
                        }
                        .react-calendar__tile:enabled:hover,
                        .react-calendar__tile:enabled:focus {
                            background-color: rgba(255,255,255,0.1);
                            border-radius: 8px;
                            transform: scale(1.05);
                            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        }
                        .react-calendar__tile--active {
                            background: linear-gradient(135deg, #C9AB23 0%, #D4BC50 100%) !important;
                            color: #0A0A0A !important;
                            border-radius: 8px;
                            font-weight: 700;
                            box-shadow: 0 4px 12px rgba(201,171,35,0.3) !important;
                        }
                        .react-calendar__tile--now {
                            background: rgba(201,171,35,0.15);
                            border-radius: 8px;
                            border: 1px solid rgba(201,171,35,0.3);
                        }
                        .react-calendar__tile--now:enabled:hover {
                            background: rgba(201,171,35,0.25);
                        }
                        .react-calendar__navigation {
                            margin-bottom: 1rem;
                        }
                        .react-calendar__navigation button {
                            color: #C9AB23;
                            font-size: 1.2em;
                            font-weight: 600;
                            min-height: 44px;
                            border-radius: 8px;
                            transition: all 0.2s ease;
                        }
                        .react-calendar__navigation button:enabled:hover,
                        .react-calendar__navigation button:enabled:focus {
                            background-color: rgba(201,171,35,0.1);
                        }
                        .react-calendar__navigation button:disabled {
                            opacity: 0.3;
                        }
                        .react-calendar__month-view__days__day--weekend {
                            color: rgba(255,255,255,0.5);
                        }
                        .react-calendar__month-view__days__day--neighboringMonth {
                            color: rgba(255,255,255,0.2);
                        }
                        .react-calendar__tile:disabled {
                            background: rgba(255,255,255,0.02);
                            color: rgba(255,255,255,0.2);
                            text-decoration: line-through;
                        }
                        .react-calendar__month-view__weekdays {
                            text-transform: uppercase;
                            font-size: 0.75rem;
                            font-weight: 600;
                            color: #C9AB23;
                            letter-spacing: 0.1em;
                        }
                    `}</style>
                    <Calendar
                        onChange={(val) => {
                            if (val instanceof Date) {
                                setDate(val);
                                setTime(null as any); // Reset time when date changes
                            }
                        }}
                        value={selectedDate}
                        minDate={new Date()}
                        maxDate={addDays(new Date(), 30)}
                        tileDisabled={({ date }) => isSunday(date)} // Closed on Sundays
                    />
                </div>

                {/* Time Slots */}
                <div className="flex-1 lg:max-w-xs">
                    <h3 className="text-white mb-4 font-bold border-b border-white/10 pb-2">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'Select a date'}
                    </h3>

                    {selectedDate ? (
                        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2" role="group" aria-label="Available time slots">
                            {timeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setTime(time)}
                                    className={clsx(
                                        "py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900",
                                        selectedTime === time
                                            ? "bg-gold-500 text-richblack-900 border-gold-500 font-bold"
                                            : "border-white/10 text-white hover:border-gold-500/50"
                                    )}
                                    aria-label={`Select ${time} time slot`}
                                    aria-pressed={selectedTime === time}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-white/30 text-sm italic">Please select a date from the calendar to view available slots.</div>
                    )}

                    {/* Summary & Continue */}
                    {selectedDate && selectedTime && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setStep(4)}
                            className="w-full mt-8 bg-gold-500 text-richblack-900 py-3 font-bold rounded hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900"
                            aria-label={`Confirm appointment for ${selectedTime} and continue to payment`}
                        >
                            Confirm {selectedTime}
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
