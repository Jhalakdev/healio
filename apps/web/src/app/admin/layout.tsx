"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarCheck,
  CreditCard,
  Tag,
  Settings,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  Users,
  ShieldCheck,
  FileText,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/users", label: "Patients", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/finance", label: "Finance", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/lab-tests", label: "Health Packages", icon: Grid3X3 },
  { href: "/admin/categories", label: "Specialists", icon: Grid3X3 },
  { href: "/admin/symptoms", label: "Symptoms", icon: Stethoscope },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/roles", label: "Page Roles", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-[#0a0f1a]">
      {/* Sidebar — dark */}
      <aside
        className={cn(
          "flex flex-col border-r border-white/5 bg-[#0f1520] transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Healio</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-md font-semibold ml-2">
                ADMIN
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-teal-500/15 text-teal-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-teal-400" : "text-slate-500"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User */}
        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer",
              collapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              AD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin</p>
                <p className="text-xs text-slate-500 truncate">BlinkCure Admin</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout}>
                <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 transition-colors shrink-0" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content — dark */}
      <main className="flex-1 overflow-auto bg-[#0a0f1a] text-white admin-dark">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
