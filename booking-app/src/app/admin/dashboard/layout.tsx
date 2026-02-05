'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Scissors,
    Wallet,
    Calendar,
    Image as ImageIcon,
    UserRound,
    Star
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Calendar', icon: Calendar, path: '/admin/dashboard/calendar' },
        { name: 'Customers', icon: UserRound, path: '/admin/dashboard/customers' },
        { name: 'Staff & Performance', icon: Users, path: '/admin/dashboard/staff' },
        { name: 'Services', icon: Scissors, path: '/admin/dashboard/services' },
        { name: 'Content Manager', icon: ImageIcon, path: '/admin/dashboard/content' },
        { name: 'Reviews', icon: Star, path: '/admin/dashboard/reviews' }, // Added Reviews link
        { name: 'Finance', icon: Wallet, path: '/admin/dashboard/finance' },
        { name: 'Shop Settings', icon: Settings, path: '/admin/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-richblack-900 text-white flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:relative z-50 w-64 h-screen bg-richblack-800 border-r border-white/5 flex flex-col transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                            <Scissors className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-lg leading-none">Noir</h1>
                            <span className="text-xs text-white/40 tracking-widest uppercase">Admin</span>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/60">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    router.push(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-richblack-900">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-display font-bold">Admin Portal</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
