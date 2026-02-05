import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { logoutStaff } from '../login/actions';

export default async function StaffDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const staffId = cookieStore.get('staff_session')?.value;

    if (!staffId) {
        redirect('/staff/login');
    }

    const supabase = await createClient();

    let staff = null;

    if (!supabase || staffId === 'demo-user') {
        // Demo Mode Staff
        staff = {
            id: 'demo-user',
            name: 'Demo Barber',
            email: 'demo@barbershop.com',
            role: 'Barber'
        };
    } else {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .eq('id', staffId)
            .single();

        if (!error && data) {
            staff = data;
        }
    }

    if (!staff) {
        // Invalid session or staff deleted
        redirect('/staff/login');
    }

    return (
        <div className="min-h-screen bg-richblack-900 text-white font-outfit flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-richblack-800 p-4 flex justify-between items-center border-b border-white/5">
                <span className="font-display font-bold text-xl text-gold-500">Staff Portal</span>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">{staff.name}</span>
                    <form action={logoutStaff}>
                        <button type="submit" className="text-white/40 hover:text-white">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </header>

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-richblack-800 border-r border-white/5 p-6 h-screen sticky top-0">
                <div className="mb-10">
                    <h1 className="font-display font-bold text-2xl text-gold-500">Noir Hair Studios</h1>
                    <p className="text-xs text-white/40 tracking-widest uppercase mt-1">Staff Portal</p>
                </div>

                <nav className="space-y-2 flex-1">
                    <Link href="/staff/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/5 text-white rounded-xl font-medium">
                        <LayoutDashboard className="w-5 h-5 text-gold-500" />
                        Dashboard
                    </Link>
                    {/* Add more links here later like "History" or "Settings" */}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xs ring-1 ring-gold-500/50">
                            {staff.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{staff.name}</p>
                            <p className="text-xs text-white/40 truncate">Staff Member</p>
                        </div>
                    </div>
                    <form action={logoutStaff}>
                        <button className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-2 py-2 text-sm transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
