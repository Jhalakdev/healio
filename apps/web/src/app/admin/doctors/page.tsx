"use client";

import { useEffect, useState } from "react";
import {
  Search, CheckCircle, XCircle, Ban, FileText, Shield, Eye, Save,
  ChevronDown, ChevronUp, Phone, Mail, Calendar, CreditCard, Star,
  Stethoscope, Clock, Users, IndianRupee, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try { setDoctors(await adminApi("/admin/doctors")); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (doctorId: string, status: string) => {
    let reason: string | undefined;
    if (status === "REJECTED") {
      reason = prompt("Rejection reason (mandatory):\nThis will be shown to the doctor.") || undefined;
      if (!reason) return; // cancelled
    }
    try {
      await adminApi(`/admin/doctors/${doctorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(reason && { reason }) }),
      });
      loadDoctors();
    } catch (e: any) { alert(e.message); }
  };

  const loadDocs = async (doctorId: string) => {
    try { setDocs(await adminApi(`/admin/doctors/${doctorId}/documents`)); } catch { setDocs([]); }
  };

  const verifyDoc = async (docId: string) => {
    await adminApi(`/admin/documents/${docId}/verify`, { method: "PATCH", body: JSON.stringify({ verified: true }) });
    if (expandedId) loadDocs(expandedId);
  };

  // No per-doctor fee — consultation fee is set globally via Plans

  const toggleExpand = (docId: string) => {
    if (expandedId === docId) { setExpandedId(null); setDocs([]); }
    else { setExpandedId(docId); loadDocs(docId); }
  };

  const statusBadge: Record<string, string> = {
    APPROVED: "success", PENDING: "warning", REJECTED: "destructive", SUSPENDED: "destructive",
  };

  const filtered = doctors.filter((d) => {
    const matchesSearch = !filter || d.name?.toLowerCase().includes(filter.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Doctors</h1>
          <p className="text-slate-400 mt-1">
            {doctors.length} total · {doctors.filter(d => d.verificationStatus === "PENDING").length} pending ·{" "}
            {doctors.filter(d => d.verificationStatus === "APPROVED").length} approved
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name or specialization..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "SUSPENDED", "REJECTED"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className={s === "PENDING" && doctors.filter(d => d.verificationStatus === "PENDING").length > 0 ? "animate-pulse" : ""}
            >
              {s === "PENDING" && doctors.filter(d => d.verificationStatus === "PENDING").length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1" />
              )}
              {s} {s !== "ALL" && `(${doctors.filter(d => d.verificationStatus === s).length})`}
            </Button>
          ))}
        </div>
      </div>

      {/* PENDING APPROVALS — highlighted section */}
      {doctors.filter(d => d.verificationStatus === "PENDING").length > 0 && statusFilter === "ALL" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-400">
              <Clock className="w-5 h-5" /> New Doctor Applications — Awaiting Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {doctors.filter(d => d.verificationStatus === "PENDING").map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    {doc.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.user?.email} · {doc.specialization || "No spec"} · Applied {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toggleExpand(doc.id)}>
                    <FileText className="w-3 h-3" /> Review Documents
                  </Button>
                  <Button size="sm" onClick={() => updateStatus(doc.id, "APPROVED")}>
                    <CheckCircle className="w-3 h-3" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(doc.id, "REJECTED")}>
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-0">
                {/* Header row */}
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(doc.id)}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {doc.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{doc.name}</span>
                      <Badge variant={statusBadge[doc.verificationStatus] as any}>{doc.verificationStatus}</Badge>
                      {doc.isOnline && <Badge variant="online">Online</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">
                      {doc.specialization || "No specialization"} · {doc.experience || 0} yrs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {doc.verificationStatus === "PENDING" && (
                      <>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateStatus(doc.id, "APPROVED"); }}>
                          <CheckCircle className="w-3 h-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); updateStatus(doc.id, "REJECTED"); }}>
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </>
                    )}
                    {doc.verificationStatus === "APPROVED" && (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateStatus(doc.id, "SUSPENDED"); }}>
                        <Ban className="w-3 h-3" /> Suspend
                      </Button>
                    )}
                    {(doc.verificationStatus === "SUSPENDED" || doc.verificationStatus === "REJECTED") && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); updateStatus(doc.id, "APPROVED"); }}>
                        <Shield className="w-3 h-3" /> Reactivate
                      </Button>
                    )}
                    {expandedId === doc.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === doc.id && (
                  <div className="border-t border-white/5 p-5 space-y-5">
                    {/* Personal info grid */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Doctor Information</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { icon: Users, label: "Full Name", value: doc.name },
                          { icon: Mail, label: "Email", value: doc.user?.email || "N/A" },
                          { icon: Stethoscope, label: "Specialization", value: doc.specialization || "Not set" },
                          { icon: Calendar, label: "Experience", value: `${doc.experience || 0} years` },
                          { icon: Calendar, label: "Joined", value: new Date(doc.createdAt).toLocaleDateString() },
                          { icon: Clock, label: "Max Sessions/Day", value: doc.maxSessionsPerDay },
                          { icon: Star, label: "Avg Response", value: doc.avgResponseMin ? `${doc.avgResponseMin} min` : "N/A" },
                          { icon: Users, label: "State Council No.", value: doc.stateMedicalCouncilNo || "Not provided" },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-xl bg-white/5">
                            <div className="flex items-center gap-1 mb-1">
                              <item.icon className="w-3 h-3 text-slate-500" />
                              <span className="text-[10px] text-slate-500 uppercase">{item.label}</span>
                            </div>
                            <p className="text-sm font-bold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Note: consultation fee is set globally via Plans, not per doctor */}

                    {/* Payment / UPI details */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Payment Details (Auto-Payout)</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "UPI ID", value: doc.upiId || "Not set" },
                          { label: "Bank Account", value: doc.bankAccountNo || "Not set" },
                          { label: "IFSC", value: doc.bankIfsc || "Not set" },
                          { label: "Bank Name", value: doc.bankName || "Not set" },
                          { label: "Account Holder", value: doc.accountHolderName || "Not set" },
                          { label: "Timezone", value: doc.timezone || "Asia/Kolkata" },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-xl bg-white/5">
                            <span className="text-[10px] text-slate-500 uppercase block mb-1">{item.label}</span>
                            <p className={`text-sm font-bold ${item.value === "Not set" ? "text-slate-600" : ""}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Uploaded documents */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Verification Documents</h4>
                      {docs.length > 0 ? (
                        <div className="space-y-2">
                          {docs.map((d: any) => (
                            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                              <FileText className="w-5 h-5 text-blue-400" />
                              <div className="flex-1">
                                <p className="text-sm font-bold">{d.type.replace(/_/g, " ").toUpperCase()}</p>
                                <p className="text-xs text-slate-500">{d.fileName} · Uploaded {new Date(d.createdAt).toLocaleDateString()}</p>
                              </div>
                              <Badge variant={d.verified ? "success" : "warning"}>
                                {d.verified ? "Verified" : "Pending Review"}
                              </Badge>
                              <a href={d.fileUrl} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="outline"><Eye className="w-3 h-3" /> View File</Button>
                              </a>
                              {!d.verified && (
                                <Button size="sm" onClick={() => verifyDoc(d.id)}>
                                  <CheckCircle className="w-3 h-3" /> Verify
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 p-3 rounded-xl bg-white/5">
                          No documents uploaded yet. Doctor needs to submit MBBS certificate, Registration ID, and State Medical Council number.
                        </p>
                      )}
                    </div>

                    {/* Rejection reason */}
                    {doc.rejectionReason && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <h4 className="text-xs font-semibold text-red-400 uppercase mb-2">Rejection Reason</h4>
                        <p className="text-sm text-red-300">{doc.rejectionReason}</p>
                      </div>
                    )}

                    {/* Bio */}
                    {doc.bio && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Bio</h4>
                        <p className="text-sm text-slate-400">{doc.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-slate-400">No doctors found.</p>}
        </div>
      )}
    </div>
  );
}
