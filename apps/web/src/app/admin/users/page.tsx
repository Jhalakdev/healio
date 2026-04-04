"use client";

import { useEffect, useState } from "react";
import { Users, Ban, CheckCircle, ChevronDown, ChevronUp, Phone, Mail, Calendar, Heart, Baby, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

export default function AdminUsersPage() {
  const [patients, setPatients] = useState<any>({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try { setPatients(await adminApi("/admin/patients")); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleExpand = (userId: string) => {
    if (expandedId === userId) {
      setExpandedId(null);
      setDetails(null);
    } else {
      setExpandedId(userId);
      setDetails(null); // will show what we have
    }
  };

  const toggleUser = async (userId: string, isActive: boolean) => {
    const endpoint = isActive ? "deactivate" : "activate";
    await adminApi(`/admin/users/${userId}/${endpoint}`, { method: "POST" });
    loadPatients();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Patients</h1>
        <p className="text-slate-400 mt-1">{patients.meta?.total || 0} total patients</p>
      </div>

      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {patients.data?.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-0">
                {/* Main row */}
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(p.userId)}>
                  <div className="w-11 h-11 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                    {(p.name || "P")[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{p.name || "Unnamed Patient"}</span>
                      <Badge variant={p.user?.isActive ? "success" : "destructive"}>
                        {p.user?.isActive ? "Active" : "Blocked"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {p.user?.phone || "No phone"} · {p.user?.email || "No email"} · {p._count?.bookings || 0} bookings · {p._count?.familyMembers || 0} family members
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleUser(p.userId, p.user?.isActive); }}>
                      {p.user?.isActive ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {p.user?.isActive ? "Block" : "Activate"}
                    </Button>
                    {expandedId === p.userId ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === p.userId && (
                  <div className="border-t border-white/5 p-5 space-y-4">
                    {/* Personal info */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Personal Information</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: Users, label: "Name", value: p.name || "Not set" },
                          { icon: Phone, label: "Phone", value: p.user?.phone || "Not set" },
                          { icon: Mail, label: "Email", value: p.user?.email || "Not set" },
                          { icon: Calendar, label: "Joined", value: new Date(p.user?.createdAt).toLocaleDateString() },
                          { icon: Users, label: "Gender", value: p.gender || "Not set" },
                          { icon: Calendar, label: "DOB", value: p.dob ? new Date(p.dob).toLocaleDateString() : "Not set" },
                          { icon: Heart, label: "Blood Group", value: p.bloodGroup || "Not set" },
                          { icon: Users, label: "Height", value: p.height || "Not set" },
                          { icon: Users, label: "Weight", value: p.weight || "Not set" },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2 mb-1">
                              <item.icon className="w-3 h-3 text-slate-500" />
                              <span className="text-[10px] text-slate-500 uppercase">{item.label}</span>
                            </div>
                            <p className="text-sm font-bold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Activity</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                          <p className="text-xl font-extrabold text-teal-400">{p._count?.bookings || 0}</p>
                          <p className="text-[10px] text-slate-500">Total Bookings</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                          <p className="text-xl font-extrabold text-violet-400">{p._count?.familyMembers || 0}</p>
                          <p className="text-[10px] text-slate-500">Family Members</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 text-center">
                          <p className="text-xl font-extrabold text-blue-400">
                            {p.user?.isActive ? "Active" : "Blocked"}
                          </p>
                          <p className="text-[10px] text-slate-500">Account Status</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {patients.data?.length === 0 && <p className="text-slate-400">No patients registered yet.</p>}
        </div>
      )}
    </div>
  );
}
