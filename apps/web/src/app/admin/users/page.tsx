"use client";

import { useEffect, useState } from "react";
import { Users, Ban, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

export default function AdminUsersPage() {
  const [patients, setPatients] = useState<any>({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await adminApi("/admin/patients");
      setPatients(data);
    } catch (e) { console.error(e); }
    setLoading(false);
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
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                  {(p.name || "P")[0]}
                </div>
                <div className="flex-1">
                  <span className="font-bold">{p.name || "Unnamed"}</span>
                  <p className="text-sm text-slate-400">
                    {p.user?.phone || p.user?.email} · {p._count?.bookings || 0} bookings · {p._count?.familyMembers || 0} family
                  </p>
                </div>
                <Badge variant={p.user?.isActive ? "success" : "destructive"}>
                  {p.user?.isActive ? "Active" : "Blocked"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleUser(p.userId, p.user?.isActive)}
                >
                  {p.user?.isActive ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  {p.user?.isActive ? "Block" : "Activate"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
