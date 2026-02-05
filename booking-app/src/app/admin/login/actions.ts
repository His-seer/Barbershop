'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: unknown, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    const supabase = await createClient();

    if (!supabase) {
        return { error: 'System not configured.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Admin login error:', error.message);
        return { error: error.message || 'Invalid credentials.' };
    }

    redirect('/admin/dashboard');
}

export async function logoutAdmin() {
    const supabase = await createClient();

    if (!supabase) {
        redirect('/admin/login');
    }

    await supabase.auth.signOut();
    redirect('/admin/login');
}
