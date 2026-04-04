"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, IndianRupee, Bell, FileText, Settings,
  HeartPulse, LogOut, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminApi } from "@/lib/admin-api";

const navItems = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresApproval: false },
  { href: "/doctor/bookings", label: "Bookings", icon: Calendar, requiresApproval: true },
  { href: "/doctor/earnings", label: "Earnings", icon: IndianRupee, requiresApproval: true },
  { href: "/doctor/lab-orders", label: "Lab Orders", icon: FileText, requiresApproval: true },
  { href: "/doctor/documents", label: "Documents", icon: FileText, requiresApproval: false },
  { href: "/doctor/notifications", label: "Notifications", icon: Bell, requiresApproval: false },
  { href: "/doctor/settings", label: "Settings", icon: Settings, requiresApproval: false },
];

export default function DoctorWebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi("/doctors/me/profile")
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isApproved = profile?.verificationStatus === "APPROVED";

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

        {/* Doctor info + status */}
        {profile && (
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-bold text-white truncate">{profile.name}</p>
            <p className="text-[10px] text-slate-500">{profile.user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className={`w-2 h-2 rounded-full ${
                isApproved ? "bg-emerald-400" :
                profile.verificationStatus === "PENDING" ? "bg-amber-400 animate-pulse" :
                "bg-red-400"
              }`} />
              <span className={`text-[10px] font-semibold ${
                isApproved ? "text-emerald-400" :
                profile.verificationStatus === "PENDING" ? "text-amber-400" :
                "text-red-400"
              }`}>
                {profile.verificationStatus}
              </span>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const locked = item.requiresApproval && !isApproved;
              return (
                <Link
                  key={item.href}
                  href={locked ? "#" : item.href}
                  onClick={(e) => { if (locked) e.preventDefault(); }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    locked
                      ? "text-slate-600 cursor-not-allowed opacity-40"
                      : isActive
                      ? "bg-teal-500/15 text-teal-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  {locked ? (
                    <Lock className="w-4 h-4 text-slate-600" />
                  ) : (
                    <item.icon className={cn("w-5 h-5", isActive ? "text-teal-400" : "text-slate-500")} />
                  )}
                  {item.label}
                  {locked && <span className="text-[9px] text-slate-600 ml-auto">Locked</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={() => { localStorage.removeItem("token"); router.push("/auth/login"); }}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:bg-white/5 hover:text-red-400 transition-colors text-sm"
          >
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
