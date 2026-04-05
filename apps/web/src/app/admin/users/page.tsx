"use client";

import { useEffect, useState } from "react";
import {
  Users, Ban, CheckCircle, ChevronDown, ChevronUp, Phone, Mail,
  Calendar, Wallet, MessageSquare, FileText, Star, X, Trash2, Edit2, Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const statusColor: Record<string, string> = {
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "online",
  COMPLETED: "success", CANCELLED: "destructive", NO_SHOW: "destructive",
};

export default function AdminUsersPage() {
  const [patients, setPatients] = useState<any>({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", dob: "", gender: "", height: "", weight: "", bloodGroup: "" });

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try { setPatients(await adminApi("/admin/patients")); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleExpand = async (patientId: string) => {
    if (expandedId === patientId) { setExpandedId(null); setDetail(null); return; }
    setExpandedId(patientId);
    setDetailLoading(true);
    try { setDetail(await adminApi(`/admin/patients/${patientId}`)); } catch { setDetail(null); }
    setDetailLoading(false);
  };

  const viewChat = async (bookingId: string) => {
    setChatBookingId(bookingId);
    try { setChatData(await adminApi(`/admin/bookings/${bookingId}`)); } catch { setChatData(null); }
  };

  const toggleUser = async (userId: string, isActive: boolean) => {
    await adminApi(`/admin/users/${userId}/${isActive ? "deactivate" : "activate"}`, { method: "POST" });
    loadPatients();
  };

  const deleteFM = async (id: string) => {
    if (!confirm("Delete this family member?")) return;
    await adminApi(`/admin/family-members/${id}`, { method: "DELETE" });
    if (expandedId) { setDetailLoading(true); setDetail(await adminApi(`/admin/patients/${expandedId}`)); setDetailLoading(false); }
  };

  const startEditPatient = (p: any) => {
    setEditingPatient(p.id);
    setEditForm({
      name: p.name || "", dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
      gender: p.gender || "", height: p.height || "", weight: p.weight || "", bloodGroup: p.bloodGroup || "",
    });
  };

  const savePatient = async () => {
    if (!editingPatient) return;
    try {
      await adminApi(`/admin/patients/${editingPatient}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name || undefined, dob: editForm.dob || undefined,
          gender: editForm.gender || undefined, height: editForm.height || undefined,
          weight: editForm.weight || undefined, bloodGroup: editForm.bloodGroup || undefined,
        }),
      });
      setEditingPatient(null);
      if (expandedId) { setDetail(await adminApi(`/admin/patients/${expandedId}`)); }
      loadPatients();
    } catch (e: any) { alert(e.message || "Failed"); }
  };

  const refund = async (bookingId: string) => {
    const reason = prompt("Refund reason:");
    if (!reason) return;
    await adminApi(`/admin/bookings/${bookingId}/refund`, { method: "POST", body: JSON.stringify({ reason }) });
    alert("Refund processed!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Patients</h1>
        <p className="text-slate-400 mt-1">{patients.meta?.total || 0} patients — click any row to see full details, chat history, wallet, family</p>
      </div>

      {/* Chat modal */}
      {chatBookingId && chatData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Chat — {chatData.patient?.name} ↔ {chatData.doctor?.name}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setChatBookingId(null)}><X className="w-3 h-3" /> Close</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chatData.messages?.length > 0 ? chatData.messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.sender?.role === "DOCTOR" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${m.sender?.role === "DOCTOR" ? "bg-white/5" : "bg-teal-500/15"}`}>
                    <p className="text-[10px] text-slate-500 mb-1">
                      {m.sender?.role || "Unknown"} · {new Date(m.createdAt).toLocaleTimeString()}
                      · <span className="text-teal-400">{m.status || "sent"}</span>
                    </p>
                    <p className="text-slate-200">{m.content}</p>
                    {m.type !== "TEXT" && <Badge variant="secondary" className="mt-1">{m.type}</Badge>}
                  </div>
                </div>
              )) : <p className="text-slate-500 text-sm">No messages.</p>}
            </div>
            {/* Prescription & reports */}
            {chatData.prescription && (
              <div className="mt-3 p-3 rounded-xl bg-blue-500/10">
                <p className="text-xs font-bold text-blue-400">Prescription:</p>
                <p className="text-sm text-slate-300">{chatData.prescription.content || "File uploaded"}</p>
              </div>
            )}
            {chatData.reports?.length > 0 && (
              <div className="mt-2 p-3 rounded-xl bg-violet-500/10">
                <p className="text-xs font-bold text-violet-400">{chatData.reports.length} Report(s):</p>
                {chatData.reports.map((r: any) => (
                  <p key={r.id} className="text-xs text-slate-400">{r.fileName} · {r.doctorReply ? "Doctor replied" : "Awaiting reply"}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {patients.data?.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(p.id)}>
                  <div className="w-11 h-11 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">{(p.name || "P")[0]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{p.name || "Unnamed"}</span>
                      <Badge variant={p.user?.isActive ? "success" : "destructive"}>{p.user?.isActive ? "Active" : "Blocked"}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{p.user?.phone || "No phone"} · {p._count?.bookings || 0} bookings · {p._count?.familyMembers || 0} family</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleUser(p.userId, p.user?.isActive); }}>
                    {p.user?.isActive ? "Block" : "Activate"}
                  </Button>
                  {expandedId === p.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                {expandedId === p.id && (
                  <div className="border-t border-white/5 p-5 space-y-5">
                    {detailLoading ? <p className="text-slate-400">Loading full details...</p> : detail ? (
                      <>
                        {/* Personal */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase">Personal Information</h4>
                            {editingPatient === detail.id ? (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={savePatient}><Save className="w-3 h-3" /> Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingPatient(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => startEditPatient(detail)}><Edit2 className="w-3 h-3" /> Edit</Button>
                            )}
                          </div>
                          {editingPatient === detail.id ? (
                            <div className="grid grid-cols-4 gap-3">
                              <div className="p-3 rounded-xl bg-white/5"><label className="text-[10px] text-slate-500 uppercase block mb-1">Name</label><Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></div>
                              <div className="p-3 rounded-xl bg-white/5"><label className="text-[10px] text-slate-500 uppercase block mb-1">DOB</label><Input type="date" value={editForm.dob} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} /></div>
                              <div className="p-3 rounded-xl bg-white/5"><label className="text-[10px] text-slate-500 uppercase block mb-1">Gender</label>
                                <select className="w-full px-2 py-1 rounded-lg border bg-transparent text-sm" value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value})}>
                                  <option value="">N/A</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5"><label className="text-[10px] text-slate-500 uppercase block mb-1">Blood Group</label>
                                <select className="w-full px-2 py-1 rounded-lg border bg-transparent text-sm" value={editForm.bloodGroup} onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}>
                                  <option value="">N/A</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5"><label className="text-[10px] text-slate-500 uppercase block mb-1">Height</label><Input value={editForm.height} onChange={(e) => setEditForm({...editForm, height: e.target.value})} placeholder="5'8&quot;" /></div>
                              <div className="p-3 rounded-xl bg-white/5"><label className="text-[10px] text-slate-500 uppercase block mb-1">Weight</label><Input value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} placeholder="70 kg" /></div>
                            </div>
                          ) : (
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { l: "Name", v: detail.name || "Not set" },
                              { l: "Phone", v: detail.user?.phone || "N/A" },
                              { l: "Email", v: detail.user?.email || "N/A" },
                              { l: "Joined", v: new Date(detail.user?.createdAt).toLocaleDateString() },
                              { l: "Gender", v: detail.gender || "N/A" },
                              { l: "DOB", v: detail.dob ? new Date(detail.dob).toLocaleDateString() : "N/A" },
                              { l: "Blood Group", v: detail.bloodGroup || "N/A" },
                              { l: "Height / Weight", v: `${detail.height || "?"} / ${detail.weight || "?"}` },
                            ].map((i) => (
                              <div key={i.l} className="p-3 rounded-xl bg-white/5">
                                <span className="text-[10px] text-slate-500 uppercase block mb-1">{i.l}</span>
                                <p className="text-sm font-bold">{i.v}</p>
                              </div>
                            ))}
                          </div>
                          )}
                        </div>

                        {/* Wallet + Transactions */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Wallet & Transactions</h4>
                          <div className="p-4 rounded-xl bg-emerald-500/10 mb-3 text-center">
                            <p className="text-3xl font-extrabold text-emerald-400">₹{Number(detail.wallet?.balance || 0).toLocaleString("en-IN")}</p>
                            <p className="text-xs text-slate-500">Current Balance (max ₹25,000)</p>
                          </div>
                          {detail.transactions?.slice(0, 8).map((tx: any) => (
                            <div key={tx.id} className="flex justify-between p-2 text-sm border-b border-white/5">
                              <span className="text-slate-400">{tx.description} · {new Date(tx.createdAt).toLocaleDateString()}</span>
                              <span className={tx.type === "CREDIT" ? "text-emerald-400 font-bold" : tx.type === "REFUND" ? "text-blue-400 font-bold" : "text-red-400 font-bold"}>
                                {tx.type === "DEBIT" ? "-" : "+"}₹{Number(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Plan */}
                        {detail.subscriptions?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Plan Subscriptions</h4>
                            {detail.subscriptions.map((s: any) => (
                              <div key={s.id} className="p-3 rounded-xl bg-white/5 flex justify-between items-center mb-2">
                                <div>
                                  <p className="font-bold">{s.plan?.name}</p>
                                  <p className="text-xs text-slate-500">{s.consultationsUsed} used / {s.consultationsUsed + s.consultationsRemaining} total · Expires {new Date(s.expiresAt).toLocaleDateString()}</p>
                                </div>
                                <Badge variant={s.isActive && s.consultationsRemaining > 0 ? "success" : "secondary"}>
                                  {s.consultationsRemaining} left
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Family */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Family Members ({detail.familyMembers?.length || 0}/5)</h4>
                          {detail.familyMembers?.map((fm: any) => (
                            <div key={fm.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
                              <div className="flex-1">
                                <p className="font-bold text-sm">{fm.name} <Badge variant={fm.isChild ? "warning" : "secondary"} className="ml-1">{fm.isChild ? "Child" : "Adult"}</Badge></p>
                                <p className="text-xs text-slate-500">
                                  {fm.relation} · DOB: {fm.dob ? new Date(fm.dob).toLocaleDateString() : "N/A"} · Blood: {fm.bloodGroup || "N/A"}
                                  {fm.phoneNumber && ` · Phone: ${fm.phoneNumber}`}
                                  · {fm.isVerified ? "Verified ✓" : "Pending verification"}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => deleteFM(fm.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                            </div>
                          ))}
                          {(!detail.familyMembers || detail.familyMembers.length === 0) && <p className="text-sm text-slate-500">No family members.</p>}
                        </div>

                        {/* Bookings */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Bookings ({detail.bookings?.length || 0})</h4>
                          {detail.bookings?.map((b: any) => {
                            const dur = b.startedAt && b.endedAt ? Math.round((new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime()) / 60000) : null;
                            return (
                              <div key={b.id} className="p-3 rounded-xl bg-white/5 mb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-bold text-sm">{b.doctor?.name} {b.forMember && <span className="text-teal-400">(for {b.forMember.name})</span>}</p>
                                    <p className="text-xs text-slate-500">
                                      {new Date(b.scheduledAt).toLocaleString()} · {b.durationMin}min{dur !== null && ` (actual: ${dur}min)`} · ₹{b.amountCharged}
                                      {b.couponCode && ` · Coupon: ${b.couponCode}`}{b.paidViaPlan && " · Plan"}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                                    <Button size="sm" variant="outline" onClick={() => viewChat(b.id)}>
                                      <MessageSquare className="w-3 h-3" /> Chat
                                    </Button>
                                    {!["COMPLETED", "CANCELLED"].includes(b.status) && (
                                      <Button size="sm" variant="ghost" onClick={() => refund(b.id)}>Refund</Button>
                                    )}
                                  </div>
                                </div>
                                {b.prescription && <p className="text-xs text-blue-400 mt-1">📋 Prescription: {b.prescription.content?.slice(0, 50) || "File"}{b.prescription.voiceUrl && " + Voice"}</p>}
                                {b.reports?.length > 0 && <p className="text-xs text-violet-400 mt-1">📎 {b.reports.length} report(s){b.reports.some((r: any) => r.doctorRepliedAt) && " · Doctor replied ✓"}</p>}
                                {b.review && <p className="text-xs text-amber-400 mt-1">⭐ Rating: {b.review.rating}/5 {b.review.comment && `— "${b.review.comment.slice(0, 40)}..."`}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : <p className="text-slate-500">Could not load details.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
