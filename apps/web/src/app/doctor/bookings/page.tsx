"use client";

import { useEffect, useState } from "react";
import { Calendar, Save, ChevronDown, ChevronUp, FileText, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "secondary",
  COMPLETED: "default", CANCELLED: "destructive", NO_SHOW: "destructive",
};

export default function DoctorBookingsPage() {
  const [range, setRange] = useState("today");
  const [data, setData] = useState<any>({ bookings: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [savingRx, setSavingRx] = useState(false);

  useEffect(() => { load(); }, [range]);

  const load = async () => {
    setLoading(true);
    try { setData(await adminApi(`/doctors/me/bookings-by-date?range=${range}`)); }
    catch { setData({ bookings: [], summary: {} }); }
    setLoading(false);
  };

  const writePrescription = async (bookingId: string) => {
    if (!prescriptionText.trim()) return alert("Write prescription content");
    setSavingRx(true);
    try {
      await adminApi(`/prescriptions/${bookingId}`, {
        method: "POST",
        body: JSON.stringify({ content: prescriptionText }),
      });
      alert("Prescription saved!");
      setPrescriptionText("");
      setExpandedId(null);
      load();
    } catch (e: any) { alert(e.message || "Failed"); }
    setSavingRx(false);
  };

  const s = data.summary || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">My Bookings</h1>

      <div className="flex gap-2">
        {ranges.map((r) => (
          <Button key={r.key} size="sm" variant={range === r.key ? "default" : "outline"} onClick={() => setRange(r.key)}>{r.label}</Button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: s.totalBookings ?? 0, color: "text-white" },
          { label: "Completed", value: s.completed ?? 0, color: "text-emerald-400" },
          { label: "Gross", value: `₹${Number(s.totalGrossEarnings || 0).toLocaleString("en-IN")}`, color: "text-blue-400" },
          { label: "Commission", value: `-₹${Number(s.commissionDeducted || 0).toLocaleString("en-IN")}`, color: "text-red-400" },
          { label: "Net", value: `₹${Number(s.totalNetEarnings || 0).toLocaleString("en-IN")}`, color: "text-emerald-400" },
        ].map((item) => (
          <Card key={item.label}><CardContent className="p-4 text-center">
            <p className={`text-xl font-extrabold ${item.color}`}>{loading ? "..." : item.value}</p>
            <p className="text-[10px] text-slate-500 mt-1">{item.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {data.bookings?.map((b: any) => (
            <Card key={b.id} className={expandedId === b.id ? "ring-1 ring-teal-500" : ""}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => { setExpandedId(expandedId === b.id ? null : b.id); setPrescriptionText(""); }}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                      {b.patientName?.[0] || "P"}
                    </div>
                    <div>
                      <p className="font-bold">{b.patientName}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(b.scheduledAt).toLocaleString()} · {b.durationMin}min
                      </p>
                      {b.symptoms && <p className="text-xs text-slate-400 mt-1">Symptoms: {b.symptoms}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-emerald-400">+₹{Math.round(b.netEarning || 0)}</p>
                      <p className="text-[10px] text-slate-500">₹{b.grossAmount} - ₹{Math.round(b.commissionDeducted || 0)}</p>
                    </div>
                    <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                    {expandedId === b.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded — prescription + actions */}
                {expandedId === b.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-4">
                    {/* Booking details */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Patient</p>
                        <p className="text-sm font-bold">{b.patientName}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Duration</p>
                        <p className="text-sm font-bold">{b.actualDurationMin || b.durationMin} min</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Booking ID</p>
                        <p className="text-sm font-bold font-mono">{b.id?.slice(0, 12)}</p>
                      </div>
                    </div>

                    {/* Write Prescription */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Write Prescription</p>
                      <textarea
                        className="w-full p-3 rounded-xl border bg-transparent text-sm min-h-[100px]"
                        placeholder="Medicine names, dosage, instructions, diagnosis notes..."
                        value={prescriptionText}
                        onChange={(e) => setPrescriptionText(e.target.value)}
                      />
                      <Button size="sm" className="mt-2" onClick={() => writePrescription(b.id)} disabled={savingRx}>
                        <Save className="w-3 h-3" /> {savingRx ? "Saving..." : "Save Prescription"}
                      </Button>
                    </div>

                    {/* Actions */}
                    {b.status === "CONFIRMED" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          <Video className="w-3 h-3" /> Start Video Call
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
