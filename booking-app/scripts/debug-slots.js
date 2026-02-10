
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
            process.env[key] = value;
        }
    });
} catch (error) {
    console.error("Error reading .env.local:", error.message);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing environment variables. Exiting.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugAvailability() {
    console.log("\n--- Debugging Availability ---");

    // 1. Get first active staff
    const { data: staff } = await supabase.from('staff').select('*').limit(1).single();
    if (!staff) {
        console.log("No staff found.");
        return;
    }
    console.log(`Checking for Barber: ${staff.name} (${staff.id})`);

    // 2. Check Schedule for TODAY (Friday = 5)
    // Note: getDay() returns 0=Sunday, but DB stores 0=Sunday
    // Check what is in DB
    const { data: schedules } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staff.id);

    console.log("\nSchedules found:", schedules ? schedules.length : 0);
    if (schedules) {
        schedules.forEach(s => {
            console.log(`Day ${s.day_of_week}: ${s.start_time} - ${s.end_time} (${s.is_available ? 'Open' : 'Closed'})`);
        });
    }

    // 3. Simulate Logic for TODAY
    const date = new Date();
    const dayOfWeek = date.getDay(); // 0-6
    console.log(`\nChecking for Day of Week: ${dayOfWeek} (Today)`);

    const todaysSchedule = schedules.find(s => s.day_of_week === dayOfWeek);

    if (!todaysSchedule) {
        console.log("CRITICAL: No schedule entry found for today!");
    } else {
        console.log(`Schedule for today: ${todaysSchedule.start_time} - ${todaysSchedule.end_time}`);
        if (!todaysSchedule.is_available) {
            console.log("CRITICAL: Schedule is marked as unavailable!");
        }
    }
}

debugAvailability().catch(console.error);
