"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Ban, Eye, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await adminApi("/admin/doctors");
      setDoctors(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateStatus = async (doctorId: string, status: string) => {
    try {
      await adminApi(`/admin/doctors/${doctorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadDoctors();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const statusBadge: Record<string, string> = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "destructive",
    SUSPENDED: "destructive",
  };

  const filtered = doctors.filter(
    (d) =>
      !filter ||
      d.name.toLowerCase().includes(filter.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Doctors</h1>
          <p className="text-slate-400 mt-1">{doctors.length} total doctors</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name or specialization..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {doc.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{doc.name}</span>
                        <Badge variant={statusBadge[doc.verificationStatus] as any}>
                          {doc.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        {doc.specialization || "No specialization"} · {doc.experience || 0} yrs ·{" "}
                        {doc.user?.email}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Fee: <span className="font-bold">₹{doc.consultationFee}</span> ·
                        Sessions/day: {doc.maxSessionsPerDay}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {doc.verificationStatus === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(doc.id, "APPROVED")}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(doc.id, "REJECTED")}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {doc.verificationStatus === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(doc.id, "SUSPENDED")}
                        >
                          <Ban className="w-4 h-4" />
                          Suspend
                        </Button>
                      )}
                      {doc.verificationStatus === "SUSPENDED" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(doc.id, "APPROVED")}
                        >
                          <Shield className="w-4 h-4" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
