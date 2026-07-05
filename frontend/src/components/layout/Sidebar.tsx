import Link from "next/link";
import { LayoutDashboard, FilePlus, History } from "lucide-react";

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-50">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <ShieldCheckIcon className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-wide">Verify<span className="text-blue-400">AI</span></span>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                <NavItem href="/verify" icon={<FilePlus />} label="New Verification" />
                <NavItem href="/dashboard/history" icon={<History />} label="History" />
            </nav>
        </aside>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <div className="w-5 h-5">{icon}</div>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}

function ShieldCheckIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
