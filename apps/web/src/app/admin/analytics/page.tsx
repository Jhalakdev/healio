"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, Activity, Clock, IndianRupee, TrendingUp, AlertTriangle, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({});
  const [dashboard, setDashboard] = useState<any>({});

  useEffect(() => {
    adminApi("/admin/analytics").then(setAnalytics).catch(console.error);
    adminApi("/admin/dashboard").then(setDashboard).catch(console.error);
  }, []);

  const stats = [
    { label: "Total Patients", value: dashboard.totalPatients || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Doctors", value: dashboard.totalDoctors || 0, icon: Stethoscope, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Online Doctors", value: dashboard.onlineDoctors || 0, icon: Wifi, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Active Sessions", value: dashboard.activeSessions || 0, icon: Activity, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Total Revenue", value: `₹${Number(dashboard.totalRevenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Today Revenue", value: `₹${Number(dashboard.todayRevenue || 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Avg Duration", value: `${analytics.avgConsultationDuration || 0} min`, icon: Clock, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Failed Consults", value: dashboard.failedConsultations || 0, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Top Doctors by Revenue</CardTitle></CardHeader>
        <CardContent>
          {Array.isArray(analytics.topDoctors) && analytics.topDoctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-2 font-semibold text-slate-400">#</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-400">Doctor</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-400">Consultations</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-400">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topDoctors.map((d: any, i: number) => (
                    <tr key={d.id} className="border-b border-slate-800/30">
                      <td className="py-3 px-2">
                        <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-400"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold">{d.name}</td>
                      <td className="py-3 px-2 text-right text-slate-400">{d.total_consultations}</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-400">₹{Number(d.total_earnings || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400">No data yet. Complete some consultations first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
