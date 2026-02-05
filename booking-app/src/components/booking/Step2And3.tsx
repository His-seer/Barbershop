"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useBookingStore } from "@/store/booking";
import { getAddons, getStaff, getAvailableSlots, calculateBookingDuration } from "@/utils/supabase/queries";
import type { Addon, Staff } from "@/types/database";
import { motion } from "framer-motion";
import { Plus, Check, ChevronRight, Loader2 } from "lucide-react";
import clsx from "clsx";
import { addDays, format, isSunday } from "date-fns";
import 'react-calendar/dist/Calendar.css';

export function Step2Addons() {
    const { toggleAddon, selectedAddons, setStep } = useBookingStore();
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAddons() {
            try {
                const data = await getAddons();
                setAddons(data);
            } catch (error) {
                console.error('Error loading add-ons:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAddons();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

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
                                <p className="text-gold-400 text-sm">{addon.price} GHS • {addon.duration_minutes} min</p>
                                {addon.description && (
                                    <p className="text-white/40 text-xs mt-1">{addon.description}</p>
                                )}
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
    const { selectedDate, setDate, selectedTime, setTime, selectedStaff, selectStaff, selectedService, selectedAddons, setStep } = useBookingStore();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Fetch staff on mount
    useEffect(() => {
        async function fetchStaff() {
            try {
                const data = await getStaff();
                setStaff(data);
            } catch (error) {
                console.error('Error loading staff:', error);
            } finally {
                setIsLoadingStaff(false);
            }
        }
        fetchStaff();
    }, []);

    // Fetch available slots when staff or date changes
    useEffect(() => {
        async function fetchAvailability() {
            if (!selectedStaff || !selectedDate || !selectedService) {
                setAvailableSlots([]);
                return;
            }

            setIsLoadingSlots(true);
            try {
                // Calculate total duration including add-ons
                const addonIds = selectedAddons.map(a => a.id);
                const totalDuration = await calculateBookingDuration(selectedService.id, addonIds);

                // Get available slots
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const slots = await getAvailableSlots(selectedStaff.id, dateStr, totalDuration);
                setAvailableSlots(slots);
            } catch (error) {
                console.error('Error fetching availability:', error);
                setAvailableSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        }

        fetchAvailability();
    }, [selectedStaff, selectedDate, selectedService, selectedAddons]);

    if (isLoadingStaff) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="font-display text-3xl text-gold-500 mb-6">Choose Your Barber</h2>

            {/* Staff Selection */}
            <div className="grid md:grid-cols-3 gap-4" role="group" aria-label="Select a barber">
                {staff.map((barber) => {
                    const isSelected = selectedStaff?.id === barber.id;
                    const initials = barber.name.split(' ').map(n => n[0]).join('').toUpperCase();

                    return (
                        <motion.button
                            key={barber.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectStaff(barber)}
                            className={clsx(
                                "relative p-5 border rounded-xl transition-all text-left group focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-richblack-900",
                                isSelected
                                    ? "border-gold-500 bg-gold-900/20 shadow-lg shadow-gold-500/10"
                                    : "border-white/10 hover:border-white/30 bg-white/5"
                            )}
                            aria-label={`Select ${barber.name}`}
                            aria-pressed={isSelected}
                        >
                            {/* Selected Badge */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center"
                                >
                                    <Check className="w-4 h-4 text-richblack-900" />
                                </motion.div>
                            )}

                            {/* Barber Avatar */}
                            {barber.avatar_url ? (
                                <div className={clsx(
                                    "w-14 h-14 rounded-full overflow-hidden mb-3 transition-colors border-2",
                                    isSelected ? "border-gold-500" : "border-transparent"
                                )}>
                                    <img
                                        src={barber.avatar_url}
                                        alt={barber.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className={clsx(
                                    "w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold mb-3 transition-colors",
                                    isSelected
                                        ? "bg-gradient-to-br from-gold-400 to-gold-600 text-richblack-900"
                                        : "bg-white/10 text-white/60 group-hover:bg-white/20"
                                )}>
                                    {initials}
                                </div>
                            )}

                            {/* Info */}
                            <h3 className={clsx(
                                "font-bold text-lg transition-colors",
                                isSelected ? "text-gold-400" : "text-white"
                            )}>
                                {barber.name}
                            </h3>
                            {barber.bio && (
                                <p className="text-white/50 text-sm mt-1">{barber.bio}</p>
                            )}
                            {barber.specialties && barber.specialties.length > 0 && (
                                <p className="text-gold-500/70 text-xs mt-2">{barber.specialties[0]}</p>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Date & Time Selection - Only show if staff selected */}
            {selectedStaff && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t border-white/10"
                >
                    <h3 className="font-display text-xl text-white mb-4">Select Date & Time</h3>

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
                                        setTime(null);
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
                                        setTime(null); // Reset time when date changes
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
                            <h4 className="text-white mb-4 font-bold border-b border-white/10 pb-2">
                                {selectedDate ? (
                                    <>
                                        <span className="text-gold-400">{selectedStaff.name}</span>
                                        <span className="text-white/40 mx-2">•</span>
                                        {format(selectedDate, 'MMM do')}
                                    </>
                                ) : (
                                    'Select a date'
                                )}
                            </h4>

                            {selectedDate ? (
                                <>
                                    {isLoadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                                            <span className="ml-3 text-white/60 text-sm">Loading availability...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-white/40 text-xs mb-3">
                                                {availableSlots.length} slots available
                                            </p>
                                            {availableSlots.length === 0 ? (
                                                <div className="text-center py-8 text-white/40 text-sm">
                                                    No available slots for this date. Please select another date.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2" role="group" aria-label="Available time slots">
                                                    {availableSlots.map(time => (
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
                                            )}
                                        </>
                                    )}
                                </>
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
                                    aria-label={`Confirm appointment with ${selectedStaff.name} at ${selectedTime} and continue to payment`}
                                >
                                    Confirm {selectedTime}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
