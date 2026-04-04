"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Ban, FileText, Shield, Eye, IndianRupee, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [editingPrice, setEditingPrice] = useState<{ id: string; price: string } | null>(null);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try { setDoctors(await adminApi("/admin/doctors")); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (doctorId: string, status: string) => {
    try {
      await adminApi(`/admin/doctors/${doctorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadDoctors();
    } catch (e: any) { alert(e.message); }
  };

  const viewDocuments = async (doctorId: string) => {
    setSelectedDoctor(doctorId);
    try { setDocs(await adminApi(`/admin/doctors/${doctorId}/documents`)); } catch { setDocs([]); }
  };

  const verifyDoc = async (docId: string, verified: boolean) => {
    await adminApi(`/admin/documents/${docId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verified }),
    });
    if (selectedDoctor) viewDocuments(selectedDoctor);
  };

  const updatePrice = async (doctorId: string, price: string) => {
    await adminApi(`/admin/doctors/${doctorId}/price`, {
      method: "PATCH",
      body: JSON.stringify({ price: Number(price) }),
    });
    setEditingPrice(null);
    loadDoctors();
  };

  const statusBadge: Record<string, string> = {
    APPROVED: "success", PENDING: "warning", REJECTED: "destructive", SUSPENDED: "destructive",
  };

  const filtered = doctors.filter(
    (d) => !filter || d.name?.toLowerCase().includes(filter.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Doctors</h1>
          <p className="text-slate-400 mt-1">{doctors.length} total · {doctors.filter(d => d.verificationStatus === "PENDING").length} pending approval</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by name or specialization..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10" />
      </div>

      {/* Document viewer */}
      {selectedDoctor && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Verification Documents — {doctors.find(d => d.id === selectedDoctor)?.name}</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setSelectedDoctor(null)}>
              <XCircle className="w-3 h-3" /> Close
            </Button>
          </CardHeader>
          <CardContent>
            {docs.length > 0 ? (
              <div className="space-y-3">
                {docs.map((d: any) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{d.type.replace(/_/g, " ").toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{d.fileName}</p>
                    </div>
                    <Badge variant={d.verified ? "success" : "warning"}>
                      {d.verified ? "Verified" : "Pending"}
                    </Badge>
                    <a href={d.fileUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline"><Eye className="w-3 h-3" /> View</Button>
                    </a>
                    {!d.verified && (
                      <Button size="sm" onClick={() => verifyDoc(d.id, true)}>
                        <CheckCircle className="w-3 h-3" /> Verify
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No documents uploaded by this doctor.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Doctor list */}
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {doc.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{doc.name}</span>
                      <Badge variant={statusBadge[doc.verificationStatus] as any}>{doc.verificationStatus}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {doc.specialization || "No specialization"} · {doc.experience || 0} yrs · {doc.user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-500">Fee:</span>
                      {editingPrice?.id === doc.id ? (
                        <div className="flex items-center gap-1">
                          <Input className="w-20 h-7 text-xs" type="number" value={editingPrice.price} onChange={(e) => setEditingPrice({ ...editingPrice, price: e.target.value })} />
                          <Button size="sm" className="h-7" onClick={() => updatePrice(doc.id, editingPrice.price)}>
                            <Save className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <button className="text-sm font-bold hover:text-teal-400 transition-colors" onClick={() => setEditingPrice({ id: doc.id, price: String(doc.consultationFee) })}>
                          ₹{doc.consultationFee}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Button size="sm" variant="outline" onClick={() => viewDocuments(doc.id)}>
                      <FileText className="w-3 h-3" /> Documents
                    </Button>
                    {doc.verificationStatus === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(doc.id, "APPROVED")}>
                          <CheckCircle className="w-3 h-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(doc.id, "REJECTED")}>
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </>
                    )}
                    {doc.verificationStatus === "APPROVED" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(doc.id, "SUSPENDED")}>
                        <Ban className="w-3 h-3" /> Suspend
                      </Button>
                    )}
                    {(doc.verificationStatus === "SUSPENDED" || doc.verificationStatus === "REJECTED") && (
                      <Button size="sm" onClick={() => updateStatus(doc.id, "APPROVED")}>
                        <Shield className="w-3 h-3" /> Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-slate-400">No doctors found.</p>}
        </div>
      )}
    </div>
  );
}
