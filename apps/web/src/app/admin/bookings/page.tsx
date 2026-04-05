"use client";

import { useEffect, useState } from "react";
import { Calendar, XCircle, Eye, MessageSquare, RefreshCw, IndianRupee, Clock, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const statusColor: Record<string, string> = {
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "secondary",
  COMPLETED: "default", CANCELLED: "destructive", NO_SHOW: "destructive",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any>({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState<string | null>(null);

  useEffect(() => { loadBookings(); }, [statusFilter, page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "20");
      const data = await adminApi(`/admin/bookings?${params}`);
      setBookings(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadDetail = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setDetailLoading(true);
    try {
      const data = await adminApi(`/admin/bookings/${id}`);
      setDetail(data);
    } catch { setDetail(null); }
    setDetailLoading(false);
  };

  const cancelBooking = async (id: string) => {
    if (!cancelReason.trim()) return alert("Enter a cancellation reason");
    try {
      await adminApi(`/admin/bookings/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: cancelReason }),
      });
      setShowCancel(null);
      setCancelReason("");
      loadBookings();
    } catch (e: any) { alert(e.message || "Failed"); }
  };

  const refundBooking = async (id: string, amount: number) => {
    if (!confirm(`Refund ₹${amount} to patient wallet?`)) return;
    try {
      await adminApi(`/admin/bookings/${id}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason: "Admin refund" }),
      });
      alert("Refund processed");
      loadBookings();
    } catch (e: any) { alert(e.message || "Failed"); }
  };

  const total = bookings.meta?.total || bookings.data?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">{total} booking{total !== 1 ? "s" : ""} total</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadBookings}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"].map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-2">
          {bookings.data?.map((b: any) => (
            <Card key={b.id} className={expandedId === b.id ? "ring-1 ring-teal-500" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{b.patient?.name || "Patient"}</span>
                      <span className="text-slate-500">→</span>
                      <span className="font-bold">{b.doctor?.name || "Doctor"}</span>
                      {b.forMember && <Badge variant="secondary" className="text-xs">{b.forMember.name} ({b.forMember.relation})</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(b.scheduledAt).toLocaleString()}</span>
                      <span>{b.durationMin || 15}min</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{Number(b.amountCharged || 0)}</span>
                      <span className="text-slate-600 font-mono text-[10px]">{b.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => loadDetail(b.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status) && (
                    <Button size="sm" variant="destructive" onClick={() => setShowCancel(showCancel === b.id ? null : b.id)}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Cancel input */}
                {showCancel === b.id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                    <Input placeholder="Cancellation reason..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="flex-1" />
                    <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>Confirm Cancel</Button>
                  </div>
                )}

                {/* Expanded detail */}
                {expandedId === b.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                    {detailLoading ? <p className="text-slate-400 text-sm">Loading details...</p> : detail ? (
                      <>
                        {/* Patient & Doctor info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-slate-800/50">
                            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Patient</p>
                            <p className="font-bold">{detail.patient?.name || "Unknown"}</p>
                            {detail.symptoms && <p className="text-xs text-slate-400 mt-1">Symptoms: {detail.symptoms}</p>}
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/50">
                            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Doctor</p>
                            <p className="font-bold">{detail.doctor?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-400">{detail.doctor?.specialization}</p>
                          </div>
                        </div>

                        {/* Prescription */}
                        {detail.prescription && (
                          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-xs text-emerald-400 font-semibold mb-1">Prescription</p>
                            <p className="text-sm">{detail.prescription.content || "File uploaded"}</p>
                            {detail.prescription.notes && <p className="text-xs text-slate-400 mt-1">{detail.prescription.notes}</p>}
                          </div>
                        )}

                        {/* Reports */}
                        {detail.reports?.length > 0 && (
                          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <p className="text-xs text-blue-400 font-semibold mb-1">Reports ({detail.reports.length})</p>
                            {detail.reports.map((r: any) => (
                              <p key={r.id} className="text-sm">{r.fileName || r.type} — {new Date(r.createdAt).toLocaleDateString()}</p>
                            ))}
                          </div>
                        )}

                        {/* Review */}
                        {detail.review && (
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <p className="text-xs text-amber-400 font-semibold mb-1">Review — {"⭐".repeat(detail.review.rating)}</p>
                            <p className="text-sm">{detail.review.comment || "No comment"}</p>
                          </div>
                        )}

                        {/* Chat messages */}
                        {detail.messages?.length > 0 && (
                          <div className="p-3 rounded-xl bg-slate-800/50">
                            <p className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Chat ({detail.messages.length} messages)</p>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {detail.messages.slice(0, 20).map((m: any) => (
                                <p key={m.id} className="text-xs">
                                  <span className={m.senderId === detail.doctor?.userId ? "text-teal-400" : "text-blue-400"}>{m.senderId === detail.doctor?.userId ? "Doctor" : "Patient"}:</span>{" "}
                                  {m.content}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {b.status === "COMPLETED" && Number(b.amountCharged) > 0 && (
                          <Button size="sm" variant="outline" onClick={() => refundBooking(b.id, Number(b.amountCharged))}>
                            <IndianRupee className="w-3 h-3" /> Refund ₹{Number(b.amountCharged)}
                          </Button>
                        )}
                      </>
                    ) : <p className="text-slate-400 text-sm">Failed to load details</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {bookings.data?.length === 0 && <p className="text-slate-400 text-center py-8">No bookings found</p>}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-slate-400 py-2">Page {page}</span>
          <Button size="sm" variant="outline" disabled={bookings.data?.length < 20} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
