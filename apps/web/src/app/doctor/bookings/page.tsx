"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, FileText, MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const ranges = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "week", label: "This Week" },
];

const statusColor: Record<string, string> = {
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "online",
  COMPLETED: "success", CANCELLED: "destructive", NO_SHOW: "destructive",
};

export default function DoctorBookingsPage() {
  const [range, setRange] = useState("today");
  const [data, setData] = useState<any>({ bookings: [], summary: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [range]);

  const load = async () => {
    setLoading(true);
    try {
      setData(await adminApi(`/doctors/me/bookings-by-date?range=${range}`));
    } catch { setData({ bookings: [], summary: {} }); }
    setLoading(false);
  };

  const s = data.summary || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">My Bookings</h1>

      {/* Range filter */}
      <div className="flex gap-2">
        {ranges.map((r) => (
          <Button key={r.key} size="sm" variant={range === r.key ? "default" : "outline"} onClick={() => setRange(r.key)}>
            {r.label}
          </Button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: s.totalBookings ?? 0, color: "text-white" },
          { label: "Completed", value: s.completed ?? 0, color: "text-emerald-400" },
          { label: "Gross", value: `₹${Number(s.totalGrossEarnings || 0).toLocaleString("en-IN")}`, color: "text-blue-400" },
          { label: "Commission", value: `-₹${Number(s.commissionDeducted || 0).toLocaleString("en-IN")}`, color: "text-red-400" },
          { label: "Net Earnings", value: `₹${Number(s.totalNetEarnings || 0).toLocaleString("en-IN")}`, color: "text-emerald-400" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-xl font-extrabold ${item.color}`}>{loading ? "..." : item.value}</p>
              <p className="text-[10px] text-slate-500 mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {data.bookings?.map((b: any) => {
            const dur = b.actualDurationMin;
            return (
              <Card key={b.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                        {b.patientName?.[0] || "P"}
                      </div>
                      <div>
                        <p className="font-bold">{b.patientName}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(b.scheduledAt).toLocaleString()} · {b.durationMin}min planned
                          {dur !== null && ` · ${dur}min actual`}
                        </p>
                        {b.symptoms && (
                          <p className="text-xs text-slate-400 mt-1">Symptoms: {b.symptoms}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-emerald-400">+₹{Math.round(b.netEarning)}</p>
                        <p className="text-[10px] text-slate-500">
                          ₹{b.grossAmount} - ₹{Math.round(b.commissionDeducted)} comm.
                        </p>
                      </div>
                      <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {data.bookings?.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No bookings for this period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
