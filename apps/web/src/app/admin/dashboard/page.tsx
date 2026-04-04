"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Stethoscope, CalendarCheck, IndianRupee, Video, Clock, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";

export default function AdminDashboard() {
  const router = useRouter();
  const [dash, setDash] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>({});
  const [bookings, setBookings] = useState<any>({ data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi("/admin/dashboard").then(setDash).catch(() => {}),
      adminApi("/admin/analytics").then(setAnalytics).catch(() => {}),
      adminApi("/admin/bookings?limit=5").then(setBookings).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    IN_PROGRESS: "online", COMPLETED: "success", CONFIRMED: "default",
    CANCELLED: "destructive", PENDING: "warning", NO_SHOW: "destructive",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview — live data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-online" />
            <span className="text-sm font-semibold text-emerald-400">
              {dash.onlineDoctors || 0} doctors online
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Video className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">
              {dash.activeSessions || 0} live calls
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: `₹${Number(dash.totalRevenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-emerald-500 to-green-600" },
          { title: "Today's Revenue", value: `₹${Number(dash.todayRevenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-blue-500 to-cyan-600" },
          { title: "Total Patients", value: dash.totalPatients || 0, icon: Users, color: "from-violet-500 to-purple-600" },
          { title: "Total Doctors", value: dash.totalDoctors || 0, icon: Stethoscope, color: "from-orange-500 to-amber-600" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-extrabold">{loading ? "..." : stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent bookings + top doctors */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Button size="sm" variant="outline" onClick={() => router.push("/admin/bookings")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.data?.length > 0 ? (
              <div className="space-y-3">
                {bookings.data.slice(0, 5).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-bold">{b.patient?.name || "Patient"} → {b.doctor?.name || "Doctor"}</p>
                      <p className="text-xs text-slate-500">{new Date(b.scheduledAt).toLocaleString()} · ₹{b.amountCharged}</p>
                    </div>
                    <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No bookings yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Top Doctors</CardTitle>
            <Button size="sm" variant="outline" onClick={() => router.push("/admin/doctors")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {Array.isArray(analytics.topDoctors) && analytics.topDoctors.length > 0 ? (
              <div className="space-y-3">
                {analytics.topDoctors.slice(0, 5).map((d: any, i: number) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <span className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-sm font-bold text-teal-400">
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.total_consultations} consults</p>
                    </div>
                    <p className="font-bold text-emerald-400">₹{Number(d.total_earnings || 0).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Complete consultations to see rankings.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <Activity className="w-6 h-6 mx-auto text-orange-400 mb-2" />
            <p className="text-2xl font-extrabold">{dash.failedConsultations || 0}</p>
            <p className="text-xs text-slate-500">Failed/Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <Clock className="w-6 h-6 mx-auto text-violet-400 mb-2" />
            <p className="text-2xl font-extrabold">{analytics.avgConsultationDuration || 0} min</p>
            <p className="text-xs text-slate-500">Avg Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <CalendarCheck className="w-6 h-6 mx-auto text-teal-400 mb-2" />
            <p className="text-2xl font-extrabold">{dash.activeSessions || 0}</p>
            <p className="text-xs text-slate-500">Active Sessions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
