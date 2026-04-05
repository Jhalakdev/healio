"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, IndianRupee, Bell, FileText, Settings,
  HeartPulse, LogOut, Lock, Stethoscope, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminApi } from "@/lib/admin-api";

const navItems = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresApproval: false },
  { href: "/doctor/bookings", label: "Bookings", icon: Calendar, requiresApproval: true },
  { href: "/doctor/settings", label: "Schedule & Profile", icon: Settings, requiresApproval: true },
  { href: "/doctor/earnings", label: "Earnings", icon: IndianRupee, requiresApproval: true },
  { href: "/doctor/lab-orders", label: "Lab Orders", icon: Activity, requiresApproval: true },
  { href: "/doctor/documents", label: "Documents", icon: FileText, requiresApproval: false },
  { href: "/doctor/notifications", label: "Notifications", icon: Bell, requiresApproval: false },
];

export default function DoctorWebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi("/doctors/me/profile").then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isApproved = profile?.verificationStatus === "APPROVED";
  const initials = profile?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "Dr";

  return (
    <div className="flex h-screen bg-[#060a13]">
      {/* Sidebar */}
      <aside className="w-[260px] flex flex-col bg-[#0b1120] border-r border-white/[0.04]">
        {/* Logo */}
        <div className="h-[72px] flex items-center gap-3 px-5 border-b border-white/[0.04]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight">BlinkCure</span>
            <span className="text-[9px] bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold ml-2 uppercase tracking-wider">Doctor</span>
          </div>
        </div>

        {/* Doctor card */}
        {profile && (
          <div className="mx-3 mt-4 p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{profile.specialization || profile.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 px-1">
              <div className={`w-2 h-2 rounded-full ${isApproved ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : profile?.verificationStatus === "PENDING" ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
              <span className={`text-[10px] font-semibold ${isApproved ? "text-emerald-400" : profile?.verificationStatus === "PENDING" ? "text-amber-400" : "text-red-400"}`}>
                {profile.verificationStatus}
              </span>
              {isApproved && <Stethoscope className="w-3 h-3 text-emerald-500/50 ml-auto" />}
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-0.5 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const locked = item.requiresApproval && !isApproved;
              return (
                <Link key={item.href} href={locked ? "#" : item.href}
                  onClick={(e) => { if (locked) e.preventDefault(); }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                    locked ? "text-slate-700 cursor-not-allowed" :
                    isActive ? "bg-gradient-to-r from-teal-500/15 to-emerald-500/10 text-teal-300 shadow-sm shadow-teal-500/5" :
                    "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  )}>
                  {locked ? <Lock className="w-4 h-4 text-slate-700" /> :
                    <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-teal-400" : "text-slate-500")} />}
                  {item.label}
                  {locked && <span className="text-[8px] text-slate-700 ml-auto uppercase tracking-wider">Locked</span>}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 ml-auto shadow-sm shadow-teal-400/50" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="border-t border-white/[0.04] p-3">
          <button onClick={() => { localStorage.removeItem("token"); router.push("/auth/login"); }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-600 hover:bg-red-500/5 hover:text-red-400 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-[#060a13] text-white admin-dark">
        <div className="p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
