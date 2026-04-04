"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, IndianRupee, Bell, FileText, Settings,
  HeartPulse, LogOut, Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/bookings", label: "Bookings", icon: Calendar },
  { href: "/doctor/earnings", label: "Earnings", icon: IndianRupee },
  { href: "/doctor/documents", label: "Documents", icon: FileText },
  { href: "/doctor/notifications", label: "Notifications", icon: Bell },
  { href: "/doctor/settings", label: "Settings", icon: Settings },
];

export default function DoctorWebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#0a0f1a]">
      <aside className="w-[240px] flex flex-col border-r border-white/5 bg-[#0f1520]">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">Healio</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-semibold ml-2">DOCTOR</span>
          </div>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive ? "bg-teal-500/15 text-teal-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-teal-400" : "text-slate-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t border-white/5 p-3">
          <button onClick={() => { localStorage.removeItem("token"); router.push("/auth/login"); }}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:bg-white/5 hover:text-red-400 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[#0a0f1a] text-white admin-dark">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
