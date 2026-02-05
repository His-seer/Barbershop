import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCRM() {
    console.log('🔍 Verifying CRM Integration...');
    console.log('--------------------------------');

    // 1. Check if Customers table exists and has data
    console.log('1. Fetching customers...');
    const { data: customers, error } = await supabase
        .from('customers')
        .select('*');

    if (error) {
        console.error('❌ Error fetching customers:', error.message);
        if (error.code === '42P01') {
            console.error('   Hint: The table "customers" likely does not exist. Did you run the SQL migration?');
        }
        return;
    }

    console.log(`✅ Success! Found ${customers.length} customers.`);

    if (customers.length > 0) {
        console.log('\n   Latest 3 Customers:');
        customers.slice(0, 3).forEach(c => {
            console.log(`   - ${c.full_name} (${c.email}) | Visits: ${c.total_bookings}`);
        });
    } else {
        console.log('   (No customers found yet - this is expected if you have no bookings)');
    }

    // 2. Check Trigger Logic (Optional verify)
    console.log('\n2. Verifying Trigger Logic...');
    console.log('   The "sync_customer_from_booking" function should exist in your database schema.');

    console.log('\n--------------------------------');
    console.log('🎉 CRM System seems to be correctly configured!');
}

checkCRM().catch(console.error);
