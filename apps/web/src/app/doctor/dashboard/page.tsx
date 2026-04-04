"use client";

import { useEffect, useState } from "react";
import {
  Calendar, IndianRupee, Users, Clock, Bell, CheckCircle, XCircle,
  AlertCircle, Stethoscope, TrendingUp, FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

export default function DoctorWebDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any>({ data: [] });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi("/doctors/me/dashboard").then(setDashboard).catch(() => {}),
      adminApi("/doctors/me/bookings-by-date?range=today").then((d) => setBookings(d?.bookings || [])).catch(() => {}),
      adminApi("/notifications").then(setNotifications).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "online",
    COMPLETED: "success", CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Doctor Dashboard</h1>
        <p className="text-slate-400 mt-1">Quick overview — use the mobile app for handling calls</p>
      </div>

      {/* Account status alert */}
      {profile?.verificationStatus === "PENDING" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-amber-400">Application Under Review</p>
              <p className="text-sm text-slate-400">Your documents are being verified. This usually takes 24-48 hours.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {profile?.verificationStatus === "REJECTED" && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="font-bold text-red-400">Application Rejected</p>
              <p className="text-sm text-slate-400">{profile.rejectionReason || "Please contact support for more information."}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: dashboard?.todayBookings || 0, icon: Calendar, color: "from-blue-500 to-cyan-600" },
          { label: "Total Earnings", value: `₹${Number(dashboard?.totalEarnings || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-emerald-500 to-green-600" },
          { label: "Status", value: dashboard?.isOnline ? "Online" : "Offline", icon: Stethoscope, color: dashboard?.isOnline ? "from-emerald-500 to-green-600" : "from-slate-500 to-slate-600" },
          { label: "Unread Alerts", value: notifications.unreadCount || 0, icon: Bell, color: "from-orange-500 to-amber-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold">{loading ? "..." : s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's bookings */}
        <Card>
          <CardHeader><CardTitle className="text-base">Today&apos;s Consultations</CardTitle></CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="font-bold text-sm">{b.patientName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(b.scheduledAt).toLocaleTimeString()} · {b.durationMin}min · ₹{b.netEarning} net
                      </p>
                    </div>
                    <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 text-sm">No bookings today.</p>}
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent>
            {notifications.data?.length > 0 ? (
              <div className="space-y-3">
                {notifications.data.slice(0, 5).map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <Bell className={`w-4 h-4 mt-0.5 ${n.isRead ? "text-slate-600" : "text-teal-400"}`} />
                    <div>
                      <p className={`text-sm font-bold ${n.isRead ? "text-slate-500" : ""}`}>{n.title}</p>
                      <p className="text-xs text-slate-500">{n.body}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 text-sm">No notifications.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Stethoscope className="w-6 h-6 text-blue-400" />
          <div>
            <p className="font-bold text-blue-400">Call Handling is on the Mobile App</p>
            <p className="text-sm text-slate-400">
              Accept calls, extend sessions, and video consult from the Healio mobile app.
              This dashboard is for viewing your schedule, earnings, and managing documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
