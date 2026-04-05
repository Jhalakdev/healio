"use client";

import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Percent, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminFinancePage() {
  const [commission, setCommission] = useState(30);
  const [newCommission, setNewCommission] = useState("30");
  const [dashboard, setDashboard] = useState<any>({});
  const [payouts, setPayouts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any>({ data: [], meta: {} });
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    adminApi("/admin/dashboard").then(setDashboard).catch(console.error);
    adminApi("/admin/payouts").then((d) => setPayouts(Array.isArray(d) ? d?.data || d : [])).catch(() => {});
    adminApi("/admin/transactions").then(setTransactions).catch(() => {});
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

      {/* Payouts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Doctor Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-slate-500">No payouts yet. Payouts are processed weekly (Fridays) via Razorpay.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-2 font-semibold text-slate-400">Doctor</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-400">Period</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-400">Amount</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-400">Bookings</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-400">UPI</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => (
                    <tr key={p.id} className="border-b border-slate-800/30">
                      <td className="py-3 px-2 font-medium">{p.doctor?.name || 'Doctor'}</td>
                      <td className="py-3 px-2 text-slate-400">{new Date(p.periodStart).toLocaleDateString()} — {new Date(p.periodEnd).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-400">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2 text-center">{p.bookingCount}</td>
                      <td className="py-3 px-2 text-slate-400 text-xs font-mono">{p.doctor?.upiId || "—"}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant={p.status === 'PAID' ? 'default' : 'secondary'}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5" /> Recent Transactions</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowTransactions(!showTransactions)}>
              {showTransactions ? "Hide" : `Show (${transactions.meta?.total || transactions.data?.length || 0})`}
            </Button>
          </div>
        </CardHeader>
        {showTransactions && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-2 px-2 font-semibold text-slate-400">Date</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-400">Type</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-400">Description</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions.data || []).slice(0, 50).map((tx: any) => (
                    <tr key={tx.id} className="border-b border-slate-800/30">
                      <td className="py-2 px-2 text-slate-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-2">
                        <Badge variant={tx.type === "CREDIT" ? "default" : tx.type === "REFUND" ? "secondary" : "destructive"}>{tx.type}</Badge>
                      </td>
                      <td className="py-2 px-2 text-sm">{tx.description || "—"}</td>
                      <td className={`py-2 px-2 text-right font-bold ${tx.type === "DEBIT" ? "text-red-400" : "text-emerald-400"}`}>
                        {tx.type === "DEBIT" ? "-" : "+"}₹{Number(tx.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!transactions.data || transactions.data.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No transactions yet</p>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
