"use client";

import { useEffect, useState } from "react";
import { Calendar, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const statusColor: Record<string, string> = {
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "online",
  COMPLETED: "success", CANCELLED: "destructive", NO_SHOW: "destructive",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any>({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { loadBookings(); }, [statusFilter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      const data = await adminApi(`/admin/bookings${q}`);
      setBookings(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    await adminApi(`/admin/bookings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: "Cancelled by admin" }),
    });
    loadBookings();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Bookings</h1>

      <div className="flex gap-2">
        {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-2">
          {bookings.data?.map((b: any) => (
            <Card key={b.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <span className="font-bold">{b.patient?.name || "Patient"}</span>
                  <span className="text-slate-400"> → </span>
                  <span className="font-bold">{b.doctor?.name}</span>
                  <p className="text-xs text-slate-400">
                    {new Date(b.scheduledAt).toLocaleString()} · {b.durationMin}min · ₹{b.amountCharged}
                  </p>
                </div>
                <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                {!["COMPLETED", "CANCELLED"].includes(b.status) && (
                  <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>
                    <XCircle className="w-3 h-3" /> Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {bookings.data?.length === 0 && <p className="text-slate-400">No bookings found</p>}
        </div>
      )}
    </div>
  );
}
