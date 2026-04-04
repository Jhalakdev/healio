"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({});
  const [dashboard, setDashboard] = useState<any>({});

  useEffect(() => {
    adminApi("/admin/analytics").then(setAnalytics).catch(console.error);
    adminApi("/admin/dashboard").then(setDashboard).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: dashboard.totalPatients || 0, color: "text-blue-600" },
          { label: "Total Doctors", value: dashboard.totalDoctors || 0, color: "text-emerald-600" },
          { label: "Active Sessions", value: dashboard.activeSessions || 0, color: "text-orange-600" },
          { label: "Avg Duration", value: `${analytics.avgConsultationDuration || 0} min`, color: "text-violet-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Top Doctors by Revenue</CardTitle></CardHeader>
        <CardContent>
          {Array.isArray(analytics.topDoctors) && analytics.topDoctors.length > 0 ? (
            <div className="space-y-3">
              {analytics.topDoctors.map((d: any, i: number) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <span className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700">
                    #{i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.total_consultations} consultations</p>
                  </div>
                  <p className="font-bold text-emerald-600">₹{Number(d.total_earnings || 0).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No data yet. Complete some consultations first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
