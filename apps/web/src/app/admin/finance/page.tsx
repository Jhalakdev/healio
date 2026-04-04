"use client";

import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminFinancePage() {
  const [commission, setCommission] = useState(30);
  const [newCommission, setNewCommission] = useState("30");
  const [dashboard, setDashboard] = useState<any>({});

  useEffect(() => {
    adminApi("/admin/dashboard").then(setDashboard).catch(console.error);
    adminApi("/admin/commission").then((d) => {
      setCommission(d.commissionPercent);
      setNewCommission(String(d.commissionPercent));
    }).catch(console.error);
  }, []);

  const updateCommission = async () => {
    await adminApi("/admin/commission", {
      method: "PATCH",
      body: JSON.stringify({ percent: Number(newCommission) }),
    });
    setCommission(Number(newCommission));
    alert("Commission updated!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Finance</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <IndianRupee className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
            <p className="text-3xl font-extrabold">₹{Number(dashboard.totalRevenue || 0).toLocaleString("en-IN")}</p>
            <p className="text-sm text-slate-400">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <p className="text-3xl font-extrabold">₹{Number(dashboard.todayRevenue || 0).toLocaleString("en-IN")}</p>
            <p className="text-sm text-slate-400">Today&apos;s Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Percent className="w-6 h-6 mx-auto text-violet-500 mb-2" />
            <p className="text-3xl font-extrabold">{commission}%</p>
            <p className="text-sm text-slate-400">Platform Commission</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Platform takes {commission}% from each consultation. Doctor receives {100 - commission}%.
          </p>
          <div className="flex gap-3 items-center">
            <Input
              type="number"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
              className="w-32"
              min={0}
              max={100}
            />
            <span className="text-slate-400">%</span>
            <Button onClick={updateCommission}>Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
