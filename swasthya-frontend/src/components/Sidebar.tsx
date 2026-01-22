'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    BarChart3,
    Bell,
    FileText,
    History,
    Home,
    Scan,
    Shield,
    Stethoscope,
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/monitoring', label: 'Live Monitoring', icon: Activity },
    { href: '/charts', label: 'Real-Time Charts', icon: BarChart3 },
    { href: '/analysis', label: 'Health Analysis', icon: Stethoscope },
    { href: '/diseases', label: 'Disease Detection', icon: Scan },
    { href: '/alerts', label: 'Alert System', icon: Bell },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/history', label: 'History & Records', icon: History },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass-panel-dark flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-white">Swasthya</h1>
                        <p className="text-xs text-[var(--text-secondary)]">Pathway Monitor</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="glass-panel p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse"></div>
                        <span className="text-xs text-[var(--text-secondary)]">System Online</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">v1.0.0</p>
                </div>
            </div>
        </aside>
    );
}
