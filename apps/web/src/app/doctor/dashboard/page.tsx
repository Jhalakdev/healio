"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, IndianRupee, Users, Clock, Bell, CheckCircle, XCircle,
  Stethoscope, TrendingUp, Video, FileText, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const statusColor: Record<string, string> = {
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "online",
  COMPLETED: "success", CANCELLED: "destructive",
};

export default function DoctorDashboardHome() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any>({ data: [], unreadCount: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi("/doctors/me/dashboard").then(setDashboard).catch(() => {}),
      adminApi("/doctors/me/bookings-by-date?range=today").then((d) => setTodayBookings(d?.bookings || [])).catch(() => {}),
      adminApi("/notifications").then(setNotifications).catch(() => {}),
      adminApi("/users/me").then(setProfile).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, Doctor</h1>
          <p className="text-slate-400 mt-1">Here&apos;s your practice overview for today</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/doctor/notifications")}>
            <Bell className="w-4 h-4" />
            {notifications.unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{notifications.unreadCount}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Info banner — app for calls */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Video className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-blue-300">Video calls are handled on the mobile app</p>
            <p className="text-sm text-slate-400">Accept calls, extend sessions, video consult — all from the Healio app. This dashboard is for managing your schedule, earnings, and documents.</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: dashboard?.todayBookings ?? "...", icon: Calendar, color: "from-blue-500 to-cyan-600" },
          { label: "Total Earnings", value: loading ? "..." : `₹${Number(dashboard?.totalEarnings || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-emerald-500 to-green-600" },
          { label: "Status", value: dashboard?.isOnline ? "Online" : "Offline", icon: Stethoscope, color: dashboard?.isOnline ? "from-emerald-500 to-green-600" : "from-slate-500 to-slate-600" },
          { label: "Unread Notifications", value: notifications.unreadCount ?? 0, icon: Bell, color: "from-orange-500 to-amber-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Today&apos;s Consultations</CardTitle>
          <Button size="sm" variant="outline" onClick={() => router.push("/doctor/bookings")}>
            View All Bookings
          </Button>
        </CardHeader>
        <CardContent>
          {todayBookings.length > 0 ? (
            <div className="space-y-3">
              {todayBookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
                      {b.patientName?.[0] || "P"}
                    </div>
                    <div>
                      <p className="font-bold">{b.patientName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(b.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {b.durationMin} min
                        {b.symptoms && ` · ${b.symptoms}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+₹{Math.round(b.netEarning)}</p>
                      <p className="text-[10px] text-slate-500">after 30% commission</p>
                    </div>
                    <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No consultations scheduled for today</p>
              <p className="text-xs text-slate-500 mt-1">Go online on the mobile app to receive bookings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "My Bookings", desc: "Past & upcoming", icon: Calendar, href: "/doctor/bookings" },
          { label: "Earnings", desc: "Revenue & payouts", icon: IndianRupee, href: "/doctor/earnings" },
          { label: "Documents", desc: "Certificates & verification", icon: FileText, href: "/doctor/documents" },
        ].map((a) => (
          <Card key={a.label} className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push(a.href)}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <a.icon className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="font-bold">{a.label}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Notifications</CardTitle>
          <Button size="sm" variant="outline" onClick={() => router.push("/doctor/notifications")}>View All</Button>
        </CardHeader>
        <CardContent>
          {notifications.data?.slice(0, 3).map((n: any) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 mb-2">
              <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${n.isRead ? "text-slate-600" : "text-teal-400"}`} />
              <div>
                <p className="text-sm font-bold">{n.title}</p>
                <p className="text-xs text-slate-500">{n.body}</p>
                <p className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {(!notifications.data || notifications.data.length === 0) && (
            <p className="text-slate-500 text-sm text-center py-4">No notifications yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
