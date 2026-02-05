'use client';

import { useState, useEffect } from 'react';

export function TimeIndicator() {
    const [currentTime, setCurrentTime] = useState<string | null>(null);
    const [position, setPosition] = useState(0);

    useEffect(() => {
        // Initial set
        const updateTime = () => {
            const now = new Date();
            // Format time HH:MM
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            // Calculate position (percentage of day form 9am to 9pm)
            // Shop open 9am (540 min) to 9pm (1260 min) = 720 mins total
            const startOfDay = 9 * 60; // 540
            const totalMinutes = 12 * 60; // 720
            const currentMinutes = (now.getHours() * 60) + now.getMinutes();

            // Only show if within hours
            if (currentMinutes >= startOfDay && currentMinutes <= (startOfDay + totalMinutes)) {
                const percent = ((currentMinutes - startOfDay) / totalMinutes) * 100;
                setPosition(percent);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (!currentTime) return null;

    return (
        <div
            className="flex items-center gap-2 mb-4 pointer-events-none sticky z-10"
        // Simple static positioning for list view relative to "now"
        // For a list view, we might just want to insert it between items, but since we map items,
        // we will just make it a prominent "NOW" badge at the top for specific current time context
        // OR if we want it to float over a timeline, that's different.
        // Requirement was: "Red line or highlighted section showing NOW: 11:23 AM"
        >
            <div className="w-16 text-right">
                <span className="text-red-500 font-bold text-sm bg-richblack-900 px-1">{currentTime}</span>
            </div>
            <div className="flex-1 h-px bg-red-500 relative">
                <div className="absolute right-0 -top-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
        </div>
    );
}
