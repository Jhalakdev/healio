"use client";

import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Calendar, CreditCard, Save, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function DoctorEarningsPage() {
  const [todayData, setTodayData] = useState<any>({ summary: {} });
  const [weekData, setWeekData] = useState<any>({ summary: {} });
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [payouts, setPayouts] = useState<any[]>([]);
  const [upi, setUpi] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi("/doctors/me/bookings-by-date?range=today").then(setTodayData).catch(() => {});
    adminApi("/doctors/me/bookings-by-date?range=week").then(setWeekData).catch(() => {});
    adminApi("/doctors/me/payment-details").then((d) => {
      setPaymentDetails(d);
      setUpi(d.upiId || ""); setBankName(d.bankName || "");
      setAccountNo(d.bankAccountNo || ""); setIfsc(d.bankIfsc || "");
      setHolderName(d.accountHolderName || "");
    }).catch(() => {});
    adminApi("/doctors/me/payouts").then(setPayouts).catch(() => {});
  }, []);

  const savePaymentDetails = async () => {
    setSaving(true);
    try {
      await adminApi("/doctors/me/payment-details", {
        method: "PATCH",
        body: JSON.stringify({
          upiId: upi || undefined,
          bankName: bankName || undefined,
          bankAccountNo: accountNo || undefined,
          bankIfsc: ifsc || undefined,
          accountHolderName: holderName || undefined,
        }),
      });
      alert("Payment details saved!");
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const ts = todayData.summary || {};
  const ws = weekData.summary || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Earnings</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Today's Net", value: `₹${Number(ts.totalNetEarnings || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-emerald-500 to-green-600" },
          { label: "Today's Consults", value: ts.completed ?? 0, icon: Calendar, color: "from-blue-500 to-cyan-600" },
          { label: "This Week Net", value: `₹${Number(ws.totalNetEarnings || 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "from-violet-500 to-purple-600" },
          { label: "Week Consults", value: ws.completed ?? 0, icon: Calendar, color: "from-orange-500 to-amber-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission info */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <IndianRupee className="w-5 h-5 text-amber-400" />
          <p className="text-sm text-slate-300">
            Platform takes <span className="font-bold text-amber-400">{ts.commissionPercent || 30}%</span> commission.
            You receive <span className="font-bold text-emerald-400">{100 - (ts.commissionPercent || 30)}%</span> of each consultation.
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Payment details */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">Payouts are sent every Friday to your UPI. Add your details below.</p>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">UPI ID *</label>
              <Input placeholder="yourname@upi" value={upi} onChange={(e) => setUpi(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Account Holder Name</label>
              <Input placeholder="Dr. Priya Sharma" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Bank Account No.</label>
                <Input placeholder="1234567890" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">IFSC Code</label>
                <Input placeholder="SBIN0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Bank Name</label>
              <Input placeholder="State Bank of India" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <Button onClick={savePaymentDetails} disabled={saving} className="w-full">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Payment Details"}
            </Button>
          </CardContent>
        </Card>

        {/* Payout history */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Payout History</CardTitle></CardHeader>
          <CardContent>
            {payouts.length > 0 ? (
              <div className="space-y-3">
                {payouts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="font-bold text-sm">₹{Number(p.amount).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(p.periodStart).toLocaleDateString()} — {new Date(p.periodEnd).toLocaleDateString()} · {p.bookingCount} consults
                      </p>
                    </div>
                    <Badge variant={p.status === "completed" ? "success" : p.status === "failed" ? "destructive" : "warning"}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IndianRupee className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No payouts yet</p>
                <p className="text-xs text-slate-500 mt-1">Payouts are processed every Friday</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
